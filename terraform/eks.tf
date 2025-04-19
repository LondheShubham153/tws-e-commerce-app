module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.16"

  cluster_name                   = local.name
  cluster_version                = var.eks_version
  cluster_endpoint_public_access = true
  cluster_endpoint_private_access = true

  # Enhanced security: Enable encryption for EKS secrets
  cluster_encryption_config = {
    resources        = ["secrets"]
    provider_key_arn = aws_kms_key.eks_secrets_key.arn
  }

  # Comprehensive cluster logging
  cluster_enabled_log_types = [
    "api", 
    "audit", 
    "authenticator", 
    "controllerManager", 
    "scheduler"
  ]
  cloudwatch_log_group_retention_in_days = var.retention_days
  cloudwatch_log_group_kms_key_id        = aws_kms_key.cloudwatch_logs_key.arn

  # Network configuration - use private subnets for worker nodes
  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.intra_subnets

  # Enable IAM Roles for Service Accounts (IRSA)
  enable_irsa = true
  
  # Enable the AWS EBS CSI driver
  enable_amazon_eks_aws_ebs_csi_driver = true

  # Add EKS managed addons with latest versions
  cluster_addons = {
    coredns = {
      most_recent = true
      configuration_values = jsonencode({
        nodeSelector: { "kubernetes.io/os": "linux" }
        tolerations: [
          {
            key: "node-role.kubernetes.io/master",
            operator: "Exists",
            effect: "NoSchedule"
          }
        ]
        resources: {
          limits: {
            cpu: "100m",
            memory: "150Mi"
          },
          requests: {
            cpu: "50m",
            memory: "100Mi"
          }
        }
      })
    }
    kube-proxy = {
      most_recent = true
      configuration_values = jsonencode({
        nodeSelector: { "kubernetes.io/os": "linux" }
      })
    }
    vpc-cni = {
      most_recent = true
      configuration_values = jsonencode({
        env: {
          ENABLE_PREFIX_DELEGATION: "true",
          WARM_PREFIX_TARGET: "1"
        }
      })
    }
    aws-ebs-csi-driver = {
      most_recent = true
      service_account_role_arn = module.ebs_csi_irsa_role.iam_role_arn
    }
    aws-load-balancer-controller = {
      most_recent = true
      service_account_role_arn = module.lb_controller_irsa_role.iam_role_arn
    }
  }

  # EKS Managed Node Group defaults
  eks_managed_node_group_defaults = {
    ami_type               = "AL2_x86_64"
    disk_size              = 50
    instance_types         = var.eks_node_group_instance_types
    vpc_security_group_ids = [aws_security_group.eks_nodes.id]

    # Enable detailed monitoring for CloudWatch
    enable_monitoring = true
    
    # Use IMDSv2 for security
    metadata_options = {
      http_endpoint               = "enabled"
      http_tokens                 = "required"  # IMDSv2 required
      http_put_response_hop_limit = 2
    }

    # Use launch templates for customization
    use_custom_launch_template = true
    
    # Use gp3 volumes by default with encryption
    block_device_mappings = {
      xvda = {
        device_name = "/dev/xvda"
        ebs = {
          volume_size           = 50
          volume_type           = "gp3"
          iops                  = 3000
          throughput            = 150
          encrypted             = true
          kms_key_id            = aws_kms_key.ebs_encryption_key.arn
          delete_on_termination = true
        }
      }
    }
  }

  # Configure node groups
  eks_managed_node_groups = {
    # Application node group
    app_nodes = {
      name         = "app-nodes"
      min_size     = var.eks_node_group_min_size
      max_size     = var.eks_node_group_max_size
      desired_size = var.eks_node_group_desired_size

      instance_types = var.eks_node_group_instance_types
      capacity_type  = "ON_DEMAND"  # For production workloads

      # Apply labels for node selection in deployments
      labels = {
        role = "application"
        environment = var.environment
        workload-type = "general"
      }

      # Ensure taints are defined
      taints = {}
      
      # Enable cluster autoscaler
      tags = {
        "k8s.io/cluster-autoscaler/enabled"             = "true"
        "k8s.io/cluster-autoscaler/${local.name}"       = "owned"
      }
    }
    
    # Database workload optimized nodes
    db_nodes = {
      name         = "db-nodes"
      min_size     = 2
      max_size     = 4
      desired_size = 2

      instance_types = ["r6i.xlarge"]  # Memory optimized for databases
      capacity_type  = "ON_DEMAND"
      
      # Apply labels for node selection in deployments
      labels = {
        role = "database"
        environment = var.environment
        workload-type = "memory-optimized"
      }
      
      # Add taints to ensure only database workloads run on these nodes
      taints = [{
        key    = "workload-type"
        value  = "database"
        effect = "NO_SCHEDULE"
      }]
      
      tags = {
        "k8s.io/cluster-autoscaler/enabled"             = "true"
        "k8s.io/cluster-autoscaler/${local.name}"       = "owned"
      }
      
      # Customize launch template for database nodes
      block_device_mappings = {
        xvda = {
          device_name = "/dev/xvda"
          ebs = {
            volume_size           = 100
            volume_type           = "gp3"
            iops                  = 4000
            throughput            = 200
            encrypted             = true
            kms_key_id            = aws_kms_key.ebs_encryption_key.arn
            delete_on_termination = true
          }
        }
      }
    }
  }
  
  # Manage aws-auth configmap
  manage_aws_auth_configmap = true
  
  # Add cluster role mappings
  aws_auth_roles = [
    {
      rolearn  = aws_iam_role.eks_admin_role.arn
      username = "admin"
      groups   = ["system:masters"]
    },
  ]
  
  tags = local.tags
}

# Create IAM role for Kubernetes administrators
resource "aws_iam_role" "eks_admin_role" {
  name = "eks-admin-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action = "sts:AssumeRole"
        Condition = {}
      }
    ]
  })
  
  tags = local.common_tags
}

# Create IRSA role for EBS CSI driver
module "ebs_csi_irsa_role" {
  source = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.30"

  role_name             = "ebs-csi-controller-sa"
  attach_ebs_csi_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:ebs-csi-controller-sa"]
    }
  }
  
  tags = local.common_tags
}

# Create IRSA role for Load Balancer Controller
module "lb_controller_irsa_role" {
  source = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.30"

  role_name                              = "aws-load-balancer-controller"
  attach_load_balancer_controller_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:aws-load-balancer-controller"]
    }
  }
  
  tags = local.common_tags
}

# Create KMS key for EKS Secrets Encryption
resource "aws_kms_key" "eks_secrets_key" {
  description             = "KMS key for EKS Secrets Encryption"
  deletion_window_in_days = var.ebs_kms_deletion_window_in_days
  enable_key_rotation     = true
  policy                  = data.aws_iam_policy_document.eks_secrets_key_policy.json
  
  tags = local.common_tags
}

# Create KMS policy for EKS secrets
data "aws_iam_policy_document" "eks_secrets_key_policy" {
  # Allow root full access
  statement {
    sid       = "EnableIAMUserPermissions"
    effect    = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
    actions   = ["kms:*"]
    resources = ["*"]
  }
  
  # Allow EKS to use the key
  statement {
    sid    = "AllowEKSClusterUse"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["eks.amazonaws.com"]
    }
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey"
    ]
    resources = ["*"]
    condition {
      test     = "ArnLike"
      variable = "kms:EncryptionContext:aws:eks:arn"
      values   = ["arn:aws:eks:${var.aws_region}:${data.aws_caller_identity.current.account_id}:cluster/${local.name}"]
    }
  }
}

resource "aws_kms_alias" "eks_secrets_key_alias" {
  name          = "alias/eks-secrets-key"
  target_key_id = aws_kms_key.eks_secrets_key.key_id
}

# Create security group for EKS nodes with improved security
resource "aws_security_group" "eks_nodes" {
  name        = "eks-nodes-sg"
  description = "Security group for EKS nodes"
  vpc_id      = module.vpc.vpc_id

  # Allow nodes to communicate with each other
  ingress {
    description = "Allow node to communicate with each other"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    self        = true
  }

  # Allow worker nodes to access services running on Vault
  ingress {
    description     = "Allow worker nodes to access Vault"
    from_port       = 8200
    to_port         = 8200
    protocol        = "tcp"
    security_groups = [aws_security_group.vault_sg.id]
    description     = "Vault API access"
  }
  
  # Allow worker nodes to receive connections from the ALB
  ingress {
    description     = "Allow worker nodes to receive ALB traffic"
    from_port       = 30000
    to_port         = 32767
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_alb_sg.id]
    description     = "ALB to NodePort"
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "eks-nodes-sg"
  })
}

# Create security group for EKS ALBs
resource "aws_security_group" "eks_alb_sg" {
  name        = "eks-alb-sg"
  description = "Security group for Load Balancers in front of EKS"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    description = "HTTP from everywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    description = "HTTPS from everywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = merge(local.common_tags, {
    Name = "eks-alb-sg"
  })
}

# Get node instance IDs
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

# Install Vault agent injector using Helm
resource "helm_release" "vault_injector" {
  count = var.enable_vault_integration ? 1 : 0
  
  name       = "vault"
  repository = "https://helm.releases.hashicorp.com"
  chart      = "vault"
  namespace  = "vault-system"
  version    = "0.25.0"
  
  create_namespace = true
  
  # Custom values for Vault injector
  values = [
    <<-EOT
    injector:
      enabled: true
      replicas: 2
      resources:
        requests:
          memory: "128Mi"
          cpu: "100m"
        limits:
          memory: "256Mi"
          cpu: "250m"
      externalVaultAddr: "https://vault.${var.domain_name}"
      authPath: "auth/kubernetes"
      logLevel: "info"
      logFormat: "json"
      metrics:
        enabled: true
        
    controller:
      enabled: true
      replicas: 2
      resources:
        requests:
          memory: "128Mi"
          cpu: "100m"
        limits:
          memory: "256Mi"
          cpu: "250m"
    EOT
  ]
  
  set {
    name  = "global.tlsDisable"
    value = "false"
  }
  
  depends_on = [module.eks, aws_instance.vault_server]
}

# Deploy metrics server
resource "helm_release" "metrics_server" {
  name       = "metrics-server"
  repository = "https://kubernetes-sigs.github.io/metrics-server/"
  chart      = "metrics-server"
  namespace  = "kube-system"
  version    = "3.11.0"
  
  set {
    name  = "args[0]"
    value = "--kubelet-insecure-tls"
  }
  
  set {
    name  = "resources.requests.cpu"
    value = "50m"
  }
  
  set {
    name  = "resources.requests.memory"
    value = "64Mi"
  }
  
  set {
    name  = "resources.limits.cpu"
    value = "100m"
  }
  
  set {
    name  = "resources.limits.memory"
    value = "128Mi"
  }
  
  depends_on = [module.eks]
}

# Deploy cluster autoscaler
resource "helm_release" "cluster_autoscaler" {
  name       = "cluster-autoscaler"
  repository = "https://kubernetes.github.io/autoscaler"
  chart      = "cluster-autoscaler"
  namespace  = "kube-system"
  version    = "9.29.0"
  
  set {
    name  = "autoDiscovery.clusterName"
    value = module.eks.cluster_name
  }
  
  set {
    name  = "autoDiscovery.enabled"
    value = "true"
  }
  
  set {
    name  = "awsRegion"
    value = var.aws_region
  }
  
  set {
    name  = "rbac.serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
    value = module.cluster_autoscaler_irsa_role.iam_role_arn
  }
  
  set {
    name  = "resources.requests.cpu"
    value = "100m"
  }
  
  set {
    name  = "resources.requests.memory"
    value = "128Mi"
  }
  
  set {
    name  = "resources.limits.cpu"
    value = "200m"
  }
  
  set {
    name  = "resources.limits.memory"
    value = "256Mi"
  }
  
  depends_on = [module.eks]
}

# Create IRSA role for Cluster Autoscaler
module "cluster_autoscaler_irsa_role" {
  source = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.30"

  role_name                        = "cluster-autoscaler"
  attach_cluster_autoscaler_policy = true
  cluster_autoscaler_cluster_ids   = [module.eks.cluster_name]

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:cluster-autoscaler"]
    }
  }
  
  tags = local.common_tags
}