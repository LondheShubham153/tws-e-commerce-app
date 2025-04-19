locals {
  region          = var.aws_region
  name            = "easyshop-eks-cluster"
  vpc_cidr        = var.vpc_cidr
  azs             = var.azs
  public_subnets  = [for i, az in var.azs : cidrsubnet(var.vpc_cidr, 8, i)]
  private_subnets = [for i, az in var.azs : cidrsubnet(var.vpc_cidr, 8, i + 10)]
  intra_subnets   = [for i, az in var.azs : cidrsubnet(var.vpc_cidr, 8, i + 20)]
  environment     = var.environment

  common_tags = {
    Project     = "EasyShop"
    Environment = local.environment
    Terraform   = "true"
    Owner       = "DevOps Team"
    ManagedBy   = "Terraform"
    CostCenter  = "IT-Infrastructure"
    Application = "EasyShop"
  }

  tags = merge(local.common_tags, {
    ClusterName = local.name
  })
}

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.31"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
    vault = {
      source  = "hashicorp/vault"
      version = "~> 3.23"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }

  # Use dynamic backend configuration for production environments
  backend "s3" {
    bucket         = "easyshop-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "easyshop-terraform-lock"
    encrypt        = true
    # Enabling point-in-time recovery for DynamoDB
    point_in_time_recovery = true
    # Enable server-side encryption with KMS
    kms_key_id = "alias/terraform-state-key"
  }
}

provider "aws" {
  region = local.region

  # Default tags applied to all resources
  default_tags {
    tags = local.common_tags
  }
}

# Kubernetes provider configuration with EKS authentication
provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name, "--region", local.region]
  }
}

# Helm provider configuration with EKS authentication
provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name, "--region", local.region]
    }
  }
}

# Create KMS key for encrypting EBS volumes
resource "aws_kms_key" "ebs_encryption_key" {
  description             = "KMS key for EBS encryption"
  deletion_window_in_days = var.ebs_kms_deletion_window_in_days
  enable_key_rotation     = true
  multi_region            = false
  policy                  = data.aws_iam_policy_document.ebs_kms_policy.json

  tags = local.common_tags
}

# Create KMS policy document
data "aws_iam_policy_document" "ebs_kms_policy" {
  # Allow root account full access to the key
  statement {
    sid       = "EnableIAMUserPermissions"
    effect    = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
    actions   = ["kms:*"]
    resources = ["*"]
  }

  # Allow EBS service to use the key
  statement {
    sid       = "AllowEBSService"
    effect    = "Allow"
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
    actions   = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey"
    ]
    resources = ["*"]
  }
}

data "aws_caller_identity" "current" {}

resource "aws_kms_alias" "ebs_encryption_key_alias" {
  name          = "alias/ebs-encryption-key"
  target_key_id = aws_kms_key.ebs_encryption_key.key_id
}

# Enable default EBS encryption with the KMS key
resource "aws_ebs_encryption_by_default" "enabled" {
  enabled = var.encryption_enabled
}

resource "aws_ebs_default_kms_key" "default" {
  key_arn = aws_kms_key.ebs_encryption_key.arn
}

# Create CloudWatch Log group for EKS control plane logs
resource "aws_cloudwatch_log_group" "eks_control_plane_logs" {
  name              = "/aws/eks/${local.name}/cluster"
  retention_in_days = var.retention_days
  kms_key_id        = aws_kms_key.cloudwatch_logs_key.arn

  tags = local.common_tags
}

# Create KMS key for encrypting CloudWatch logs
resource "aws_kms_key" "cloudwatch_logs_key" {
  description             = "KMS key for CloudWatch logs encryption"
  deletion_window_in_days = var.ebs_kms_deletion_window_in_days
  enable_key_rotation     = true
  policy                  = data.aws_iam_policy_document.cloudwatch_logs_kms_policy.json

  tags = local.common_tags
}

# Create KMS policy document for CloudWatch logs
data "aws_iam_policy_document" "cloudwatch_logs_kms_policy" {
  statement {
    sid       = "EnableIAMUserPermissions"
    effect    = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
    actions   = ["kms:*"]
    resources = ["*"]
  }

  statement {
    sid       = "AllowCloudWatchLogs"
    effect    = "Allow"
    principals {
      type        = "Service"
      identifiers = ["logs.${var.aws_region}.amazonaws.com"]
    }
    actions   = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey"
    ]
    resources = ["*"]
    condition {
      test     = "ArnEquals"
      variable = "kms:EncryptionContext:aws:logs:arn"
      values   = ["arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/eks/${local.name}/cluster"]
    }
  }
}

resource "aws_kms_alias" "cloudwatch_logs_key_alias" {
  name          = "alias/cloudwatch-logs-key"
  target_key_id = aws_kms_key.cloudwatch_logs_key.key_id
}