module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name            = local.name
  cidr            = local.vpc_cidr
  azs             = local.azs
  public_subnets  = local.public_subnets
  private_subnets = local.private_subnets
  intra_subnets   = local.intra_subnets

  # Enable NAT Gateway for outbound internet access from private subnets
  enable_nat_gateway     = true
  single_nat_gateway     = false  # Use multiple NAT gateways for high availability
  one_nat_gateway_per_az = true   # Each AZ gets its own NAT gateway

  # Enable DNS support for the VPC
  enable_dns_hostnames = true
  enable_dns_support   = true

  # Enable VPC flow logs for network traffic monitoring and security analysis
  enable_flow_log                      = true
  create_flow_log_cloudwatch_log_group = true
  create_flow_log_cloudwatch_iam_role  = true
  flow_log_max_aggregation_interval    = 60
  flow_log_destination_type            = "cloud-watch-logs"

  # Add required tags for EKS cluster and public/private subnets
  public_subnet_tags = {
    "kubernetes.io/role/elb"                      = 1
    "kubernetes.io/cluster/${local.name}"         = "shared"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb"             = 1
    "kubernetes.io/cluster/${local.name}"         = "shared"
  }

  # Default security group with tightly controlled inbound/outbound rules
  manage_default_security_group  = true
  default_security_group_ingress = []  # No inbound rule by default
  default_security_group_egress  = []  # No outbound rule by default

  # Tag all VPC resources
  tags = local.tags
}

# Create Network ACLs for additional network security
resource "aws_network_acl" "private" {
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  tags = merge(local.common_tags, {
    Name = "${local.name}-private-nacl"
  })
}

resource "aws_network_acl_rule" "private_ingress" {
  network_acl_id = aws_network_acl.private.id
  rule_number    = 100
  egress         = false
  protocol       = "-1"
  rule_action    = "allow"
  cidr_block     = local.vpc_cidr
  from_port      = 0
  to_port        = 0
}

resource "aws_network_acl_rule" "private_egress" {
  network_acl_id = aws_network_acl.private.id
  rule_number    = 100
  egress         = true
  protocol       = "-1"
  rule_action    = "allow"
  cidr_block     = "0.0.0.0/0"
  from_port      = 0
  to_port        = 0
}