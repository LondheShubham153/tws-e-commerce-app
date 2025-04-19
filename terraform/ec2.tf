resource "aws_key_pair" "deployer" {
  key_name   = "terra-automate-key"
  public_key = file("terra-key.pub")
}

resource "aws_default_vpc" "default" {}

resource "aws_security_group" "allow_user_to_connect" {
  name        = "allow TLS"
  description = "Allow user to connect"
  vpc_id      = aws_default_vpc.default.id

  ingress {
    description = "port 22 allow"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "port 80 allow"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "port 443 allow"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "port 8080 allow"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "allow all outgoing traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "mysecurity"
  }
}

resource "aws_security_group" "jenkins_comm" {
  name        = "jenkins-comm"
  description = "Allow Jenkins master-agent communication"
  vpc_id      = aws_default_vpc.default.id

  ingress {
    from_port   = 50000
    to_port     = 50000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "jenkins_master" {
  ami             = data.aws_ami.os_image.id
  instance_type   = var.instance_type
  key_name        = aws_key_pair.deployer.key_name
  security_groups = [
    aws_security_group.allow_user_to_connect.name,
    aws_security_group.jenkins_comm.name
  ]
  user_data       = file("${path.module}/install_jenkins_master.sh")
  tags = {
    Name = "Jenkins-Master"
  }
  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }
}

resource "aws_instance" "jenkins_agent" {
  ami             = data.aws_ami.os_image.id
  instance_type   = var.instance_type
  key_name        = aws_key_pair.deployer.key_name
  security_groups = [
    aws_security_group.allow_user_to_connect.name,
    aws_security_group.jenkins_comm.name
  ]
  user_data       = file("${path.module}/install_jenkins_agent.sh")
  tags = {
    Name = "Jenkins-Agent"
  }
  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }
}

# AMI Data source

data "aws_ami" "os_image" {
  owners      = ["099720109477"]
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


