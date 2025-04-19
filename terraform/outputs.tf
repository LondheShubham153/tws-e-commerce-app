output "region" {
  description = "The AWS region where resources are created"
  value       = local.region
}

output "vpc_id" {
  description = "The ID of the created VPC"
  value       = module.vpc.vpc_id
}

output "vpc_cidr" {
  description = "The CIDR block of the VPC"
  value       = module.vpc.vpc_cidr_block
}

output "private_subnets" {
  description = "List of private subnet IDs"
  value       = module.vpc.private_subnets
}

output "public_subnets" {
  description = "List of public subnet IDs"
  value       = module.vpc.public_subnets
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster API endpoint"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = module.eks.cluster_security_group_id
}

output "eks_oidc_provider_arn" {
  description = "The ARN of the OIDC Provider"
  value       = module.eks.oidc_provider_arn
}

output "eks_cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = module.eks.cluster_certificate_authority_data
}

output "eks_managed_nodegroups" {
  description = "EKS managed node groups"
  value       = module.eks.eks_managed_node_groups
}

output "bastion_public_ip" {
  description = "Public IP of the bastion host"
  value       = aws_instance.bastion.public_ip
}

output "app_server_private_ip" {
  description = "Private IP of the application server"
  value       = aws_instance.app_server.private_ip
}

output "vault_server_private_ip" {
  description = "Private IP of the Vault server"
  value       = aws_instance.vault_server.private_ip
}

output "kms_keys" {
  description = "ARNs of the KMS keys created for encryption"
  value = {
    ebs_encryption = aws_kms_key.ebs_encryption_key.arn
    eks_secrets    = aws_kms_key.eks_secrets_key.arn
    vault_unseal   = aws_kms_key.vault_key.arn
  }
}

output "eks_kubeconfig_command" {
  description = "Command to update kubeconfig for EKS cluster access"
  value       = "aws eks --region ${local.region} update-kubeconfig --name ${module.eks.cluster_name}"
}

output "vault_init_command" {
  description = "Command to initialize Vault (run this from the bastion host)"
  value       = "ssh -i path/to/key.pem ec2-user@${aws_instance.bastion.public_ip} 'ssh ec2-user@${aws_instance.vault_server.private_ip} \"export VAULT_ADDR=http://127.0.0.1:8200 && vault operator init\"'"
}

output "public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.testinstance.public_ip
}

output "eks_node_group_public_ips" {
  description = "Public IPs of the EKS node group instances"
  value       = data.aws_instances.eks_nodes.public_ips
}