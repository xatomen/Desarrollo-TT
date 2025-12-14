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
