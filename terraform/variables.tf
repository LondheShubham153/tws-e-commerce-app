variable "aws_region" {
  description = "AWS region where resources will be provisioned"
  default     = "ap-south-1"
  type        = string
}

variable "ami_id" {
  description = "AMI ID for the EC2 instance (Ubuntu 24.04 LTS, x86_64)"
  default     = "ami-08e5424edfe926b43"
  type        = string
}

variable "instance_type" {
  description = "Instance type for the EC2 instance"
  default     = "t3.medium"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  default     = "prod"
  type        = string
}

variable "admin_cidr_blocks" {
  description = "CIDR blocks allowed for admin access"
  default     = "10.0.0.0/16"
  type        = string
}

variable "domain_name" {
  description = "The domain name for services"
  default     = "easyshop.internal"
  type        = string
}

variable "eks_version" {
  description = "EKS Kubernetes version"
  default     = "1.28"
  type        = string
}

variable "terraform_state_bucket" {
  description = "S3 bucket for storing Terraform state"
  default     = "easyshop-terraform-state"
  type        = string
}

variable "enable_vault_integration" {
  description = "Whether to enable Vault integration"
  default     = true
  type        = bool
}

variable "eks_node_group_instance_types" {
  description = "Instance types for EKS node groups"
  default     = ["t3.large"]
  type        = list(string)
}

variable "eks_node_group_min_size" {
  description = "Minimum size for EKS node group"
  default     = 3
  type        = number
}

variable "eks_node_group_max_size" {
  description = "Maximum size for EKS node group"
  default     = 6
  type        = number
}

variable "eks_node_group_desired_size" {
  description = "Desired size for EKS node group"
  default     = 3
  type        = number
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  default     = "10.0.0.0/16"
  type        = string
}

variable "azs" {
  description = "Availability zones to use in your region"
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b", "ap-south-1c"]
}

variable "log_retention_days" {
  description = "Retention period for logs in days"
  type        = number
  default     = 30
}

variable "enable_monitoring" {
  description = "Whether to enable the Prometheus monitoring stack"
  type        = bool
  default     = true
}

variable "prometheus_retention_days" {
  description = "Retention period for Prometheus metrics in days"
  type        = number
  default     = 15
}

variable "loki_retention_days" {
  description = "Retention period for Loki logs in days"
  type        = number
  default     = 30
}

variable "enable_waf" {
  description = "Whether to enable WAF protection"
  type        = bool
  default     = true
}

variable "ebs_kms_deletion_window_in_days" {
  description = "KMS key deletion window in days"
  type        = number
  default     = 30
}

variable "vault_server_instance_type" {
  description = "Instance type for Vault server"
  type        = string
  default     = "t3.medium"
}

variable "bastion_instance_type" {
  description = "Instance type for bastion host"
  type        = string
  default     = "t3.micro"
}

variable "encryption_enabled" {
  description = "Whether to enable encryption for EBS volumes"
  type        = bool
  default     = true
}

variable "monitoring_namespace" {
  description = "Kubernetes namespace for monitoring resources"
  type        = string
  default     = "monitoring"
}

variable "grafana_admin_password" {
  description = "Admin password for Grafana"
  type        = string
  default     = "EasyShop@2023"
  sensitive   = true
}

variable "loki_storage_size" {
  description = "Storage size for Loki in GB"
  type        = number
  default     = 50
}

variable "prometheus_storage_size" {
  description = "Storage size for Prometheus in GB"
  type        = number
  default     = 50
}