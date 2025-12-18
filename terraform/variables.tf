variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "Project name"
}

variable "environment" {
  type        = string
  description = "Environment (dev, staging, prod)"
  default     = "dev"
}

variable "vpc_cidr" {
  type        = string
  description = "VPC CIDR block"
  default     = "10.0.0.0/16"
}

variable "eks_node_instance_type" {
  type        = string
  description = "EKS node instance type"
  default     = "t3.small"
}

variable "eks_desired_size" {
  type        = number
  description = "Desired number of EKS nodes"
  default     = 2
}

variable "eks_min_size" {
  type        = number
  description = "Minimum number of EKS nodes"
  default     = 1
}

variable "eks_max_size" {
  type        = number
  description = "Maximum number of EKS nodes"
  default     = 4
}

variable "eks_disk_size" {
  type        = number
  description = "EKS node disk size in GB"
  default     = 50
}

variable "rds_instance_class" {
  type        = string
  description = "RDS instance class"
  default     = "db.t3.small"
}

variable "rds_allocated_storage" {
  type        = number
  description = "RDS allocated storage in GB"
  default     = 20
}

variable "rds_backup_retention_days" {
  type        = number
  description = "RDS backup retention period in days"
  default     = 7
}

variable "db_username" {
  type        = string
  description = "RDS master username"
  sensitive   = true
}

variable "db_password" {
  type        = string
  description = "RDS master password"
  sensitive   = true
}

variable "skip_final_snapshot" {
  type        = bool
  description = "Skip final snapshot on RDS destruction (true for dev, false for prod)"
  default     = true
}
