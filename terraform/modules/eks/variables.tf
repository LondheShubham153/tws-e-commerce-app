variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "cluster_version" {
  description = "Kubernetes version to use for the EKS cluster"
  type        = string
}

variable "eks_addon_versions" {
  description = "Version of EKS addons to use"
  type = object({
    kube-proxy         = string
    vpc-cni            = string
  })
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC where the cluster and workers will be deployed"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs where the workers will be deployed"
  type        = list(string)
}

variable "control_plane_subnet_ids" {
  description = "List of subnet IDs where the EKS control plane will be deployed"
  type        = list(string)
}

variable "bastion_security_group_id" {
  description = "Security group ID of the bastion host"
  type        = string
}

variable "bastion_role_arn" {
  description = "ARN of the bastion IAM role for EKS access"
  type        = string
}

variable "tags" {
  description = "A map of tags to add to all resources"
  type        = map(string)
  default     = {}
}
