locals {

  region          = "us-east-2"
  environment     = "dev"
  tags = {
    Name          = "easyshop"
    Environment   = "dev"
    Terraform     = "true"
  }

  # VPC Variables
  vpc_name        = "easyshop"
  vpc_cidr        = "12.0.0.0/16"
  azs             = ["us-east-2a", "us-east-2b"]
  public_subnets  = ["12.0.1.0/24", "12.0.2.0/24"]
  private_subnets = ["12.0.3.0/24", "12.0.4.0/24"]
  intra_subnets   = ["12.0.5.0/24", "12.0.6.0/24"]

  # EKS Variables
  cluster_name    = "easyshop-cluster"
  cluster_version = "1.29"
  eks_addons_versions = {
    kube-proxy         = "v1.29.0-eksbuild.1"
    vpc-cni            = "v1.29.0-eksbuild.1"
  }

  # Security Group Variables
  sg_name = "easyshop-sg"

  # Bastion Variables
  key_name      = "easyshop"
  instance_type = "t3.large"
}