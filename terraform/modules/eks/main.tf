# Get current IAM principal for access entry
data "aws_caller_identity" "current" {}

module "eks" {

  source  = "terraform-aws-modules/eks/aws"
  version = "20.8.5" # Upgrading from 19.15.1 to the latest version to fix deprecation warnings

  cluster_name                    = var.cluster_name
  cluster_version                 = var.cluster_version
  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  # Fixed addon configuration with correct names and timeouts
  cluster_addons = {
    kube-proxy = {
      most_recent = false
      version     = var.eks_addon_versions.kube-proxy
      preserve    = true
      timeouts = {
        create = "15m"
        update = "15m"
        delete = "10m"
      }
    }
    vpc-cni = {
      most_recent = false
      version     = var.eks_addon_versions.vpc-cni
      preserve    = true
      timeouts = {
        create = "15m"
        update = "15m"
        delete = "10m"
      }
    }
  }

  vpc_id                   = var.vpc_id
  subnet_ids               = var.subnet_ids
  control_plane_subnet_ids = var.control_plane_subnet_ids

  # EKS Managed Node Group(s)
  eks_managed_node_group_defaults = {
    ami_type       = "AL2023_x86_64_STANDARD"
    instance_types = ["t2.medium", "t3.medium"]
    disk_size      = 10
    disk_type      = "gp3"
    iops           = 3000
    throughput     = 125
  }


  eks_managed_node_groups = {
    easyshop-node-group = {
      min_size       = 1
      max_size       = 2
      desired_size   = 1
      instance_types = ["t2.medium", "t3.medium"]
      capacity_type  = "SPOT"
      iam_role_additional_policies = {
        AmazonEBSCSIDriverPolicy     = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
        AmazonSSMManagedInstanceCore = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
      }
      tags = {
        Project     = "EasyShop"
        Environment = var.environment
        NodeGroup   = "easyshop-workers"
      }
    }
  }

  cluster_security_group_additional_rules = {
    ingress_bastion_443 = {
      description              = "Bastion to EKS API"
      protocol                 = "tcp"
      from_port                = 443
      to_port                  = 443
      type                     = "ingress"
      source_security_group_id = var.bastion_security_group_id
    }

    ingress_nodes_443 = {
      description              = "Nodes to cluster API"
      protocol                 = "tcp"
      from_port                = 443
      to_port                  = 443
      type                     = "ingress"
      source_security_group_id = module.eks.node_security_group_id
    }

    ingress_load_balancer_443 = {
      description = "Load balancer to cluster API"
      protocol    = "tcp"
      from_port   = 443
      to_port     = 443
      type        = "ingress"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  node_security_group_additional_rules = {
    ingress_bastion_ssh = {
      description              = "Bastion to nodes SSH"
      protocol                 = "tcp"
      from_port                = 22
      to_port                  = 22
      type                     = "ingress"
      source_security_group_id = var.bastion_security_group_id
    }

    ingress_bastion_kubelet = {
      description              = "Bastion to nodes kubelet API"
      protocol                 = "tcp"
      from_port                = 10250
      to_port                  = 10250
      type                     = "ingress"
      source_security_group_id = var.bastion_security_group_id
    }

    ingress_cluster_kubelet = {
      description              = "Cluster to nodes kubelet API"
      protocol                 = "tcp"
      from_port                = 10250
      to_port                  = 10250
      type                     = "ingress"
      source_security_group_id = module.eks.cluster_security_group_id
    }

    ingress_nodeport_tcp = {
      description = "Kubernetes NodePort Range"
      protocol    = "tcp"
      from_port   = 30000
      to_port     = 32000
      type        = "ingress"
      cidr_blocks = ["0.0.0.0/0"]
    }

    ingress_self_all = {
      description = "Node to node all ports/protocols"
      protocol    = "-1"
      from_port   = 0
      to_port     = 0
      type        = "ingress"
      self        = true
    }

    egress_all = {
      description = "Node all egress"
      protocol    = "-1"
      from_port   = 0
      to_port     = 0
      type        = "egress"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  # Access entries to grant IAM principals access to the cluster
  access_entries = {
    # Grant cluster creator admin access (bootstrapping)
    current_user = {
      kubernetes_groups = []
      principal_arn     = data.aws_caller_identity.current.arn

      policy_associations = {
        admin = {
          policy_arn = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
          access_scope = {
            type = "cluster"
          }
        }
      }
    }

    # Grant bastion role access to the cluster
    bastion_role = {
      kubernetes_groups = []
      principal_arn     = var.bastion_role_arn

      policy_associations = {
        admin = {
          policy_arn = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
          access_scope = {
            type = "cluster"
          }
        }
      }
    }
  }

  tags = var.tags
}

# IAM role for the EBS CSI driver service account
module "ebs_csi_irsa_role" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.30"

  role_name             = "${var.cluster_name}-ebs-csi-controller"
  attach_ebs_csi_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:ebs-csi-controller-sa"]
    }
  }

  tags = var.tags
}
