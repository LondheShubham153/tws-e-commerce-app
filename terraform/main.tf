locals {
  eks_addon_versions = {
    coredns            = "v1.10.1-eksbuild.1"
    kube-proxy         = "v1.27.3-eksbuild.1"
    vpc-cni            = "v1.12.6-eksbuild.1"
    aws-ebs-csi-driver = "v1.16.0-eksbuild.1"
  }
}

# Create IAM role for bastion
resource "aws_iam_role" "bastion" {
  name = "${local.tags.Name}-bastion-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Attach policies to bastion role
resource "aws_iam_role_policy_attachment" "bastion_eks" {
  role       = aws_iam_role.bastion.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

# Additional policies for comprehensive EKS management
resource "aws_iam_role_policy_attachment" "bastion_ecr" {
  role       = aws_iam_role.bastion.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "bastion_ec2" {
  role       = aws_iam_role.bastion.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2FullAccess"
}

resource "aws_iam_role_policy_attachment" "bastion_ssm" {
  role       = aws_iam_role.bastion.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Create instance profile for bastion
resource "aws_iam_instance_profile" "bastion" {
  name = "${local.tags.Name}-bastion-profile"
  role = aws_iam_role.bastion.name
}

module "vpc" {
  source          = "./modules/vpc"
  vpc_name        = local.vpc_name
  vpc_cidr        = local.vpc_cidr
  azs             = local.azs
  public_subnets  = local.public_subnets
  private_subnets = local.private_subnets
  intra_subnets   = local.intra_subnets
  tags            = local.tags
}

module "security_group" {
  source      = "./modules/security_group"
  name        = local.sg_name
  vpc_id      = module.vpc.vpc_id
  vpc_cidr    = local.vpc_cidr
  tags        = local.tags
  environment = local.environment
}

module "eks" {
  source                    = "./modules/eks"
  cluster_name              = local.cluster_name
  cluster_version           = local.cluster_version
  environment               = local.environment
  vpc_id                    = module.vpc.vpc_id
  subnet_ids                = module.vpc.public_subnets
  control_plane_subnet_ids  = module.vpc.private_subnets
  bastion_security_group_id = module.security_group.bastion_security_group_id
  bastion_role_arn          = aws_iam_role.bastion.arn
  eks_addon_versions        = local.eks_addon_versions
  tags                      = local.tags
}

module "bastion" {
  source               = "./modules/bastion"
  depends_on           = [module.eks]
  name                 = local.tags.Name
  key_name             = local.key_name
  instance_type        = local.instance_type
  region               = local.region
  cluster_name         = local.cluster_name
  tags                 = local.tags
  subnet_id            = module.vpc.public_subnets[0]
  security_group_id    = module.security_group.bastion_security_group_id
  iam_instance_profile = aws_iam_instance_profile.bastion.name
}