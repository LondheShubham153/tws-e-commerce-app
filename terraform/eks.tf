module "eks" {

  source  = "terraform-aws-modules/eks/aws"
  version = "20.35.0"

  cluster_name                   = local.name
  cluster_endpoint_public_access = true
  enable_cluster_creator_admin_permissions = true

  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
  }

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.public_subnets
  control_plane_subnet_ids = module.vpc.intra_subnets

  # EKS Managed Node Group(s)

  eks_managed_node_group_defaults = {

    instance_types = ["t2.large"]

    attach_cluster_primary_security_group = true

  }


  eks_managed_node_groups = {

    tws-demo-ng = {
      min_size     = 2
      max_size     = 3
      desired_size = 2

      instance_types = ["t2.large"]
      capacity_type  = "SPOT"

      disk_size = 35 
      use_custom_launch_template = true  # Important to apply disk size!
      launch_template_name_prefix = "tws-demo-ng-"
      launch_template_version     = "$Latest"

      tags = {
        Name = "tws-demo-ng"
        Environment = "dev"
        ExtraTag = "e-commerce-app"
      }
    }
  }

  # Add the custom security group rule for node port access
  node_security_group_additional_rules = {
    allow_nodeport_access = {
      description = "Allow NodePort access for ArgoCD, Grafana, Prometheus"
      protocol    = "tcp"
      from_port   = 30000
      to_port     = 32000
      type        = "ingress"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  tags = local.tags


}

data "aws_instances" "eks_nodes" {
  instance_tags = {
    "eks:cluster-name" = module.eks.cluster_name
  }

  filter {
    name   = "instance-state-name"
    values = ["running"]
  }

  depends_on = [module.eks]
}
