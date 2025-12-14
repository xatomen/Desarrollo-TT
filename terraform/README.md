# Infraestructura Terraform

Provisiona EKS, RDS Aurora MySQL y ECR en AWS.

## Requisitos

- Terraform >= 1.0
- AWS CLI configurada
- Credenciales AWS con permisos suficientes

## Uso

1. Copia env.tfvars.example a env.tfvars:
```bash
cp env.tfvars.example env.tfvars
```

2. Edita env.tfvars con tus valores

3. Inicializa Terraform:
```bash
terraform init
```

4. Planifica los cambios:
```bash
terraform plan -var-file="env.tfvars"
```

5. Aplica la configuracion:
```bash
terraform apply -var-file="env.tfvars"
```

## Componentes

- **VPC**: Red privada con subnets publicas y privadas
- **EKS**: Cluster Kubernetes con auto-scaling
- **Aurora MySQL**: Base de datos relacional con 2 instancias
- **ECR**: Registros privados para imagenes Docker
- **Security Groups**: Control de trafico entre componentes

## Salidas

Despues de terraform apply, obten los detalles:
```bash
terraform output
```

Para conectar kubectl:
```bash
aws eks update-kubeconfig --name $(terraform output -raw eks_cluster_name) --region us-east-1
```

## Limpieza

```bash
terraform destroy -var-file="env.tfvars"
```
