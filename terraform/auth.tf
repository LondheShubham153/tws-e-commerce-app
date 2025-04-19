# data "aws_eks_cluster" "eks" {
#   name = module.eks.cluster_name
#   depends_on = [module.eks]
# }

# data "aws_eks_cluster_auth" "eks" {
#   name = module.eks.cluster_name
#   depends_on = [module.eks]
# }

# provider "kubernetes" {
#   host                   = data.aws_eks_cluster.eks.endpoint
#   cluster_ca_certificate = base64decode(data.aws_eks_cluster.eks.certificate_authority[0].data)
#   token                  = data.aws_eks_cluster_auth.eks.token
# }

# resource "kubernetes_config_map" "aws_auth" {
#   metadata {
#     name      = "aws-auth"
#     namespace = "kube-system"
#   }

#   data = {
#     mapUsers = yamlencode([
#       {
#         userarn  = "arn:aws:iam::676206946737:user/dvharsh"
#         username = "dvharsh"
#         groups   = ["system:masters"]
#       }
#     ])
#   }

#   depends_on = [module.eks]
# }

