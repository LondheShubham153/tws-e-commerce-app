module "eks" {

  source  = "terraform-aws-modules/eks/aws"
  version = "19.15.1"

  cluster_name                   = local.name
  cluster_endpoint_public_access = true

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
      use_custom_launch_template = false  # Important to apply disk size!

      tags = {
        Name = "tws-demo-ng"
        Environment = "dev"
        ExtraTag = "e-commerce-app"
      }
      # Attach security group rule for NodePort range (30000-32000)
      security_group_ids = [module.eks.node_security_group_id]
    }
  }
 
  tags = local.tags


}
resource "aws_security_group_rule" "allow_nodeport_range" {
  type              = "ingress"
  from_port         = 30000
  to_port           = 32000
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"] # Open to all IPs, restrict as needed
  security_group_id = module.eks.node_security_group_id
  description       = "Allow NodePort range 30000-32000 for NGINX Ingress"
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

data "aws_eks_cluster" "eks" {
  name = module.eks.cluster_name

  depends_on = [module.eks]
}

data "aws_eks_cluster_auth" "eks" {
  name = module.eks.cluster_name

  depends_on = [module.eks]
}

resource "helm_release" "jenkins" {
  name       = "jenkins"
  namespace  = "jenkins"
  repository = "https://charts.jenkins.io"
  chart      = "jenkins"
  version    = "5.0.9"
  create_namespace = true

  values = [
    file("${path.module}/jenkins.yml")
  ]
  timeout     = 600       # 10 minutes
  wait        = true
  atomic      = true      # Roll back if it fails

  depends_on = [module.eks]
}
