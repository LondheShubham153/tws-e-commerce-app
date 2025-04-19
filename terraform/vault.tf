provider "vault" {
  address = "https://vault.${var.domain_name}"
  skip_tls_verify = false
}

# Create KMS key for Vault auto-unseal
resource "aws_kms_key" "vault_key" {
  description             = "KMS Key for Vault Auto Unseal"
  deletion_window_in_days = var.ebs_kms_deletion_window_in_days
  enable_key_rotation     = true
  policy                  = data.aws_iam_policy_document.vault_kms_policy_doc.json
  
  tags = merge(local.common_tags, {
    Name = "vault-auto-unseal-key"
  })
}

# Create KMS key policy document
data "aws_iam_policy_document" "vault_kms_policy_doc" {
  statement {
    sid       = "EnableRootAccess"
    effect    = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
    actions   = ["kms:*"]
    resources = ["*"]
  }
  
  statement {
    sid       = "AllowVaultUse"
    effect    = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/vault-server-role"]
    }
    actions   = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:DescribeKey",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*"
    ]
    resources = ["*"]
  }
}

resource "aws_kms_alias" "vault_key_alias" {
  name          = "alias/vault-auto-unseal-key"
  target_key_id = aws_kms_key.vault_key.key_id
}

# Create Vault IAM role for EC2 instances
resource "aws_iam_role" "vault_server_role" {
  name = "vault-server-role"
  description = "IAM role for Vault servers with auto-unseal permissions"
  
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

# Create policy for KMS access for auto-unseal
resource "aws_iam_policy" "vault_kms_policy" {
  name        = "vault-kms-policy"
  description = "Policy to allow Vault to use KMS for auto-unseal"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:DescribeKey",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*"
        ]
        Resource = aws_kms_key.vault_key.arn
      }
    ]
  })
}

# Create policy for EC2 auto-join
resource "aws_iam_policy" "vault_auto_join_policy" {
  name        = "vault-auto-join-policy"
  description = "Policy to allow Vault to use EC2 auto-join"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances",
          "ec2:DescribeTags",
          "autoscaling:DescribeAutoScalingGroups"
        ]
        Resource = "*"
      }
    ]
  })
}

# Attach policies to the Vault IAM role
resource "aws_iam_role_policy_attachment" "vault_kms_attachment" {
  role       = aws_iam_role.vault_server_role.name
  policy_arn = aws_iam_policy.vault_kms_policy.arn
}

resource "aws_iam_role_policy_attachment" "vault_auto_join_attachment" {
  role       = aws_iam_role.vault_server_role.name
  policy_arn = aws_iam_policy.vault_auto_join_policy.arn
}

resource "aws_iam_role_policy_attachment" "vault_ssm_attachment" {
  role       = aws_iam_role.vault_server_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "vault_instance_profile" {
  name = "vault-instance-profile"
  role = aws_iam_role.vault_server_role.name
}

# Create security group for Vault servers
resource "aws_security_group" "vault_sg" {
  name        = "vault-security-group"
  description = "Security group for Vault server"
  vpc_id      = module.vpc.vpc_id
  
  # Vault API 
  ingress {
    from_port   = 8200
    to_port     = 8200
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
    description = "Vault API"
  }
  
  # Vault cluster 
  ingress {
    from_port   = 8201
    to_port     = 8201
    protocol    = "tcp"
    self        = true
    description = "Vault cluster traffic"
  }
  
  # Prometheus Node Exporter
  ingress {
    from_port   = 9100
    to_port     = 9100
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
    description = "Prometheus Node Exporter"
  }
  
  # Promtail
  ingress {
    from_port   = 9080
    to_port     = 9080
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
    description = "Promtail endpoint"
  }
  
  # SSH access from bastion only
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
    description     = "SSH from bastion"
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
  
  tags = merge(local.common_tags, {
    Name = "vault-sg"
  })
}

# Create EC2 instances for Vault servers (HA cluster)
resource "aws_instance" "vault_server" {
  count                  = 2
  ami                    = data.aws_ami.os_image.id
  instance_type          = var.vault_server_instance_type
  key_name               = aws_key_pair.deployer.key_name
  vpc_security_group_ids = [aws_security_group.vault_sg.id]
  subnet_id              = module.vpc.private_subnets[count.index % length(module.vpc.private_subnets)]
  iam_instance_profile   = aws_iam_instance_profile.vault_instance_profile.name
  
  root_block_device {
    volume_type           = "gp3"
    volume_size           = 50
    encrypted             = true
    delete_on_termination = true
    kms_key_id            = aws_kms_key.ebs_encryption_key.arn
  }
  
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }
  
  user_data = templatefile("${path.module}/templates/vault_user_data.tpl", {
    aws_region       = var.aws_region
    kms_key_id       = aws_kms_key.vault_key.key_id
    server_count     = 2
    cluster_name     = "vault-${var.environment}"
    node_name        = "vault-${count.index}"
    cluster_tag_key  = "VaultCluster"
    cluster_tag_value = "vault-${var.environment}"
  })
  
  tags = merge(local.common_tags, {
    Name          = "vault-server-${count.index}"
    VaultCluster  = "vault-${var.environment}"
  })
  
  lifecycle {
    create_before_destroy = true
  }
}

# Create a DNS record for Vault in internal hosted zone
resource "aws_route53_record" "vault" {
  zone_id = aws_route53_zone.internal.zone_id
  name    = "vault.${var.domain_name}"
  type    = "A"
  ttl     = 60
  
  records = aws_instance.vault_server[*].private_ip
}

# Create internal hosted zone
resource "aws_route53_zone" "internal" {
  name = var.domain_name
  
  vpc {
    vpc_id = module.vpc.vpc_id
  }
  
  tags = local.common_tags
}

# Create Application Load Balancer for Vault
resource "aws_lb" "vault" {
  name               = "vault-lb-${var.environment}"
  internal           = true
  load_balancer_type = "application"
  security_groups    = [aws_security_group.vault_lb_sg.id]
  subnets            = module.vpc.private_subnets
  
  access_logs {
    bucket  = aws_s3_bucket.lb_logs.id
    prefix  = "vault-lb"
    enabled = true
  }
  
  tags = local.common_tags
}

# Create S3 bucket for ALB access logs
resource "aws_s3_bucket" "lb_logs" {
  bucket = "easyshop-lb-logs-${data.aws_caller_identity.current.account_id}"
  
  tags = local.common_tags
}

# Configure bucket policy for ALB logging
resource "aws_s3_bucket_policy" "lb_logs" {
  bucket = aws_s3_bucket.lb_logs.id
  policy = data.aws_iam_policy_document.lb_logs_policy.json
}

# Create policy for ALB logging
data "aws_iam_policy_document" "lb_logs_policy" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["logdelivery.elasticloadbalancing.amazonaws.com"]
    }
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.lb_logs.arn}/vault-lb/AWSLogs/${data.aws_caller_identity.current.account_id}/*"]
  }
}

# Create security group for Vault LB
resource "aws_security_group" "vault_lb_sg" {
  name        = "vault-lb-sg"
  description = "Security group for Vault load balancer"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
    description = "HTTPS for Vault API"
  }
  
  egress {
    from_port       = 8200
    to_port         = 8200
    protocol        = "tcp"
    security_groups = [aws_security_group.vault_sg.id]
    description     = "Traffic to Vault servers"
  }
  
  tags = merge(local.common_tags, {
    Name = "vault-lb-sg"
  })
}

# Create target group for Vault
resource "aws_lb_target_group" "vault" {
  name     = "vault-tg-${var.environment}"
  port     = 8200
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  
  health_check {
    path                = "/v1/sys/health"
    port                = 8200
    protocol            = "HTTP"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200,429"
  }
  
  tags = local.common_tags
}

# Attach Vault instances to target group
resource "aws_lb_target_group_attachment" "vault" {
  count            = length(aws_instance.vault_server)
  target_group_arn = aws_lb_target_group.vault.arn
  target_id        = aws_instance.vault_server[count.index].id
  port             = 8200
}

# Create listener for Vault ALB
resource "aws_lb_listener" "vault" {
  load_balancer_arn = aws_lb.vault.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.vault.arn
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.vault.arn
  }
}

# Create self-signed certificate for Vault
resource "tls_private_key" "vault" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "tls_self_signed_cert" "vault" {
  private_key_pem = tls_private_key.vault.private_key_pem
  
  subject {
    common_name  = "vault.${var.domain_name}"
    organization = "EasyShop DevOps"
  }
  
  validity_period_hours = 8760  # 1 year
  
  allowed_uses = [
    "key_encipherment",
    "digital_signature",
    "server_auth",
  ]
}

# Import certificate to ACM
resource "aws_acm_certificate" "vault" {
  private_key      = tls_private_key.vault.private_key_pem
  certificate_body = tls_self_signed_cert.vault.cert_pem
  
  tags = local.common_tags
}

# Output Vault server information
output "vault_server_private_ips" {
  description = "Private IPs of the Vault servers"
  value       = aws_instance.vault_server[*].private_ip
}

output "vault_endpoint" {
  description = "Endpoint for Vault API"
  value       = "https://vault.${var.domain_name}"
}

output "vault_lb_dns_name" {
  description = "DNS name of the Vault load balancer"
  value       = aws_lb.vault.dns_name
} 