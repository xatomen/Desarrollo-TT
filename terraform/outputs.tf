output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_security_group_id" {
  description = "EKS cluster security group ID"
  value       = module.eks.cluster_security_group_id
}

output "rds_endpoint" {
  description = "RDS database endpoint"
  value       = aws_db_instance.main.endpoint
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_db_instance.main.db_name
}

output "rds_master_username" {
  description = "RDS master username"
  value       = aws_db_instance.main.username
  sensitive   = true
}

output "rds_master_password" {
  description = "RDS master password"
  value       = aws_db_instance.main.password
  sensitive   = true
}

output "ecr_repository_urls" {
  description = "ECR repository URLs"
  value = {
    for repo, ecr in aws_ecr_repository.main : repo => ecr.repository_url
  }
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "acm_certificate_arn" {
  description = "ARN of ACM certificate for HTTPS"
  value       = aws_acm_certificate.website.arn
}

output "acm_certificate_domain_name" {
  description = "Domain name of ACM certificate"
  value       = aws_acm_certificate.website.domain_name
}

output "admin_user_arn" {
  description = "ARN of admin IAM user"
  value       = aws_iam_user.admin.arn
}

output "admin_user_name" {
  description = "Name of admin IAM user"
  value       = aws_iam_user.admin.name
}

output "admin_user_access_key_id" {
  description = "Access key ID for admin user (save this securely)"
  value       = aws_iam_access_key.admin.id
  sensitive   = true
}

output "admin_user_secret_access_key" {
  description = "Secret access key for admin user (save this securely and never commit to version control)"
  value       = aws_iam_access_key.admin.secret
  sensitive   = true
}
