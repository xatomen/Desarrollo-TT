# IAM Admin User for AWS CLI/programmatic access

resource "aws_iam_user" "admin" {
  name = var.admin_username

  tags = {
    Name        = "${var.project_name}-admin"
    Environment = var.environment
  }
}

# Admin user access key (for programmatic access via CLI)
resource "aws_iam_access_key" "admin" {
  user = aws_iam_user.admin.name
}

# Attach AdministratorAccess policy to admin user
resource "aws_iam_user_policy_attachment" "admin_policy" {
  user       = aws_iam_user.admin.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}
