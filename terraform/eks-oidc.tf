# EKS OIDC Provider Configuration
# Enables IRSA (IAM Roles for Service Accounts) for pods in the cluster
# Note: The OIDC provider is now created automatically by EKS module v20.0+

# Outputs
output "eks_oidc_provider_arn" {
  description = "ARN of EKS OIDC provider"
  value       = module.eks.oidc_provider_arn
}
output "eks_oidc_issuer_url" {
  description = "URL of EKS OIDC issuer"
  value       = module.eks.cluster_oidc_issuer_url
}
