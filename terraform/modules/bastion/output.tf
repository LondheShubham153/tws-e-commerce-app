output "bastion_public_ip" {
  description = "Public IP address of the bastion host"
  value       = aws_instance.bastion.public_ip
}

output "bastion_public_dns" {
  description = "Public DNS name of the bastion host"
  value       = aws_instance.bastion.public_dns
}

output "bastion_security_group_id" {
  description = "ID of the bastion security group"
  value       = var.security_group_id
}

output "bastion_key_name" {
  description = "Name of the SSH key pair"
  value       = aws_key_pair.bastion.key_name
}

output "bastion_key_path" {
  description = "Path to the bastion SSH key"
  value       = "${path.module}/keys/bastion_key.pem"
}

output "bastion_private_key_path" {
  description = "Path to the bastion private key"
  value       = local_file.bastion_private_key.filename
}

output "bastion_public_key_path" {
  description = "Path to the bastion public key"
  value       = local_file.bastion_public_key.filename
}