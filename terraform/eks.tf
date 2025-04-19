module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "20.35.0"

  cluster_name                   = local.name
  cluster_endpoint_public_access = true

  cluster_addons = {
    coredns    = { most_recent = true }
    kube-proxy = { most_recent = true }
    vpc-cni    = { most_recent = true }
  }

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.public_subnets
  control_plane_subnet_ids = module.vpc.intra_subnets

  eks_managed_node_group_defaults = {
    instance_types = ["t2.medium"]
  }

  eks_managed_node_groups = {
    tws-demo-ng = {
      min_size     = 2
      max_size     = 3
      desired_size = 2

      instance_types             = ["t2.medium","t3.medium"]
      capacity_type              = "SPOT"
      disk_size                  = 35
      use_custom_launch_template = false

      additional_security_group_ids = [
        aws_security_group.nodeport_access.id
      ]

      tags = {
        Name        = "demo-ng"
        Environment = "dev"
        ExtraTag    = "e-commerce-app"
      }
    }
  }

  tags = local.tags
}

