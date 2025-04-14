module "vpc" {

  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name               = "${var.vpc_name}-vpc"
  cidr               = var.vpc_cidr
  azs                = var.azs
  public_subnets     = var.public_subnets
  private_subnets    = var.private_subnets
  intra_subnets      = var.intra_subnets
  enable_nat_gateway = true
  single_nat_gateway = true
  enable_vpn_gateway = false

  # Enable auto-assign public IP for public subnets
  map_public_ip_on_launch = true

  # Add explicit route table configuration
  private_route_table_tags = {
    "kubernetes.io/cluster/${var.vpc_name}" = "shared"
    "kubernetes.io/role/internal-elb"     = 1
  }

  public_route_table_tags = {
    "kubernetes.io/cluster/${var.vpc_name}" = "shared"
    "kubernetes.io/role/elb"              = 1
  }

  tags = var.tags
}