locals {

  region          = "eu-north-1"
  name            = "tws-eks-cluster"
  vpc_cidr        = "10.0.0.0/16"
  azs             = ["eu-north-1a", "eu-north-1b"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.3.0/24", "10.0.4.0/24"]
  intra_subnets   = ["10.0.5.0/24", "10.0.6.0/24"]
  tags = {
    example = local.name
  }

}

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {

  region = local.region

}