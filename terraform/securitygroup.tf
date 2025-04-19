resource "aws_security_group" "nodeport_access" {
  name        = "${local.name}-nodeport-access"
  description = "Allow NodePort range"
  vpc_id      = module.vpc.vpc_id

  tags = {
    Name = "${local.name}-nodeport-access"
  }
}

resource "aws_security_group_rule" "nodeport_ingress" {
  type              = "ingress"
  from_port         = 30000
  to_port           = 32767
  protocol          = "tcp"
  security_group_id = aws_security_group.nodeport_access.id
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow NodePort access"
}