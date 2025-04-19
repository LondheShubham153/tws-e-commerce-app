output "bastion_security_group_id" {
  description = "The ID of the bastion security group"
  value       = aws_security_group.bastion_security_group.id
}
