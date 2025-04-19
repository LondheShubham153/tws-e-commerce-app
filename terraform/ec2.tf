data "aws_ami" "os_image" {
  owners      = ["099720109477"]  # Canonical/Ubuntu
  most_recent = true
  filter {
    name   = "state"
    values = ["available"]
  }
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/*24.04-amd64*"]
  }
}

# Use SSM Parameter Store for storing the key securely
resource "aws_ssm_parameter" "ssh_public_key" {
  name        = "/ec2/ssh-public-key"
  description = "Public SSH key for EC2 instances"
  type        = "SecureString"
  value       = fileexists("${path.module}/terra-key.pub") ? file("${path.module}/terra-key.pub") : "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD3F6tyPEFEzV0LX3X8BsXdMsQz1x2cEikKDEY0aIj41qgxMCP/iteneqXSIFZBp5vizPvaoIR3Um9xK7PGoW8giupGn+EPuxIA4cDM4vzOqOkiMPhz5XK0whEjkVzTo4+S0puvDZuwIsdiW9mxhJc7tgBNL0cYlWSYVkz4G/fslNfRPW5mYAM49f4fhtxPb5ok4Q2Lg9dPKVHO/Bgeu5woMc7RY0p1ej6D4CKFE6lymSDJpW0YHX/wqE9+cfEauh7xZcG0q9t2ta6F6fmX0agvpFyZo8aFbXeUBr7osSCJNgvavWbM/06niWrOvYX2xwWdhXmXSrbX8ZbabVohBK41 example@example.com"
  
  tags = local.common_tags
}

resource "aws_key_pair" "deployer" {
  key_name   = "terraform-key-${local.environment}"
  public_key = aws_ssm_parameter.ssh_public_key.value
  
  tags = local.common_tags
}

# Create security group for the bastion host
resource "aws_security_group" "bastion_sg" {
  name        = "bastion-security-group"
  description = "Security group for the bastion host"
  vpc_id      = module.vpc.vpc_id

  # SSH access from admin networks only
  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr_blocks]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "bastion-sg"
  })
}

# Create security group for application servers
resource "aws_security_group" "app_sg" {
  name        = "application-security-group"
  description = "Security group for application servers"
  vpc_id      = module.vpc.vpc_id

  # SSH access from bastion host only
  ingress {
    description     = "SSH from bastion"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  # Web access 
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Application port"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "app-sg"
  })
}

# Create IAM role for EC2 instance
resource "aws_iam_role" "ec2_role" {
  name = "ec2-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

# Attach policies to the EC2 role
resource "aws_iam_role_policy_attachment" "ssm_attachment" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "ec2-instance-profile"
  role = aws_iam_role.ec2_role.name
}

# Create bastion host in a public subnet
resource "aws_instance" "bastion" {
  ami                    = data.aws_ami.os_image.id
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.deployer.key_name
  subnet_id              = module.vpc.public_subnets[0]
  vpc_security_group_ids = [aws_security_group.bastion_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  
  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }
  
  user_data = file("${path.module}/install_tools.sh")
  
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"  # IMDSv2 required for security
    http_put_response_hop_limit = 1
  }
  
  tags = merge(local.common_tags, {
    Name = "bastion-host"
  })
}

# Create application instance in a private subnet
resource "aws_instance" "app_server" {
  ami                    = data.aws_ami.os_image.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.deployer.key_name
  subnet_id              = module.vpc.private_subnets[0]
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  
  root_block_device {
    volume_size           = 30
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }
  
  user_data = file("${path.module}/install_tools.sh")
  
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"  # IMDSv2 required for security
    http_put_response_hop_limit = 1
  }
  
  tags = merge(local.common_tags, {
    Name = "app-server"
  })
}