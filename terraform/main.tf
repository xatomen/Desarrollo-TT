module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "5.1.2"

  name = "${var.project_name}-vpc"
  cidr = var.vpc_cidr

  azs            = slice(data.aws_availability_zones.available.names, 0, 2)
  public_subnets = [for i, az in slice(data.aws_availability_zones.available.names, 0, 2) : cidrsubnet(var.vpc_cidr, 4, i)]

  enable_nat_gateway        = false
  map_public_ip_on_launch   = true
  single_nat_gateway   = true
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-vpc"
    Environment = var.environment
  }
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "${var.project_name}-eks-cluster"
  cluster_version = "1.34"

  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true
  cluster_ip_family               = "ipv4"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.public_subnets

  eks_managed_node_groups = {
    default = {
      name           = "${var.project_name}-nodes"
      instance_types = [var.eks_node_instance_type]

      desired_size = var.eks_desired_size
      min_size     = var.eks_min_size
      max_size     = var.eks_max_size

      disk_size = var.eks_disk_size

      tags = {
        Environment = var.environment
      }
    }
  }

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

  tags = {
    Environment = var.environment
  }
}

resource "aws_security_group" "rds" {
  name   = "${var.project_name}-rds-sg"
  vpc_id = module.vpc.vpc_id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}


resource "aws_db_subnet_group" "public" {
  name       = "${var.project_name}-db-subnet-group-public"
  subnet_ids = module.vpc.public_subnets

  tags = {
    Name = "${var.project_name}-db-subnet-group-public"
  }
}

resource "aws_db_instance" "main" {
  allocated_storage       = 20
  db_name                 = "appdb"
  engine                  = "mysql"
  engine_version          = "8.0.43"
  instance_class          = "db.t3.micro"
  username                = var.db_username
  password                = var.db_password
  db_subnet_group_name    = aws_db_subnet_group.public.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  skip_final_snapshot     = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.project_name}-mysql-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  backup_retention_period = 0
  publicly_accessible     = true

  tags = {
    Name        = "${var.project_name}-mysql"
    Environment = var.environment
  }
}

resource "aws_ecr_repository" "main" {
  for_each = toset([
    "aach-api",
    "carabineros-api",
    "mtt-api",
    "prt-api",
    "sgd-api",
    "sii-api",
    "srcei-api",
    "tgr-api",
    "back-api",
    "fiscalizadores-app",
    "propietarios-app",
    "obtener-permiso-app",
    "panel-decisiones-app"
  ])

  name                 = "${var.project_name}/${each.value}"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
  
  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Environment = var.environment
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}
# ACM Certificate for HTTPS
resource "aws_acm_certificate" "website" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = [
    "*.${var.domain_name}"
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "${var.project_name}-cert"
    Environment = var.environment
  }
}

# Optional: DNS validation records (if you want to manage them with Terraform)
# Uncomment and configure your Route53 hosted zone if needed
# resource "aws_route53_record" "cert_validation" {
#   for_each = {
#     for dvo in aws_acm_certificate.website.domain_validation_options : dvo.domain_name => {
#       name   = dvo.resource_record_name
#       record = dvo.resource_record_value
#       type   = dvo.resource_record_type
#     }
#   }
#
#   allow_overwrite = true
#   name            = each.value.name
#   records         = [each.value.record]
#   ttl             = 60
#   type            = each.value.type
#   zone_id         = data.aws_route53_zone.website.zone_id
# }
#
# resource "aws_acm_certificate_validation" "website" {
#   certificate_arn           = aws_acm_certificate.website.arn
#   timeouts {
#     create = "5m"
#   }
#   depends_on = [aws_route53_record.cert_validation]
# }