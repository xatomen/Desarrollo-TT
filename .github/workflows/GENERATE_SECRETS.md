# Guía para Generar Secretos de GitHub Actions

## 1. Requisitos Previos
- AWS CLI configurado (`aws configure`)
- OpenSSL instalado (incluido en Git Bash en Windows)
- Acceso a la cuenta AWS
- Permisos en el repositorio GitHub

## 2. Generar Secretos Criptográficos

### JWT_SECRET
```bash
# Opción 1: OpenSSL (más seguro - 32 bytes = 256 bits)
openssl rand -hex 32

# Opción 2: PowerShell (Windows)
-join ((0..63) | ForEach-Object {[Convert]::ToString($(Get-Random -Max 16),16)})

# Salida esperada (ejemplo):
# a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
```

### API_KEY
```bash
# Opción 1: OpenSSL (Base64)
openssl rand -base64 32

# Opción 2: PowerShell (Windows)
[Convert]::ToBase64String($(0..31 | ForEach-Object {[byte](Get-Random -Max 256)}))

# Salida esperada (ejemplo):
# aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789+/==
```

## 3. Obtener Datos AWS

### AWS_ACCOUNT_ID
```bash
aws sts get-caller-identity --query Account --output text
# Salida: 123456789012
```

### AWS_ROLE_ARN
```bash
# Listar roles disponibles
aws iam list-roles --output table

# O buscar específicamente
aws iam get-role --role-name github-oidc-role --query 'Role.Arn'
# Salida: arn:aws:iam::123456789012:role/github-oidc-role
```

### EKS_CLUSTER_NAME
```bash
# Listar clusters disponibles
aws eks list-clusters --region us-east-1 --output table

# O usar el nombre del Terraform
# Valor: desarrollo-tt-eks-cluster (verificar en terraform/variables.tf)
```

### DB_USERNAME y DB_PASSWORD
```bash
# El usuario debe coincidir con la variable de Terraform
# Username: admin (configurado en terraform/variables.tf)

# Password: generada en el despliegue de terraform
# Para recuperarla desde Secrets Manager:
aws secretsmanager get-secret-value \
  --secret-id rds-master-password \
  --region us-east-1

# O la que configuraste en env.tfvars
```

## 4. Verificar Secretos Registrados

### En GitHub (Web UI)
1. Settings > Secrets and variables > Actions > Secrets
2. Verificar que todos aparecen listados
3. NO se puede ver el valor (solo indica "Updated X ago")

### En GitHub CLI
```bash
# Listar secretos (nombres solo)
gh secret list

# Verificar un secreto específico (no muestra valor)
gh secret view DB_PASSWORD
```

## 5. Validar Antes de Hacer Push

### Script de validación
```bash
#!/bin/bash
# Verificar que todos los secretos estén configurados

REQUIRED_SECRETS=(
  "AWS_ROLE_ARN"
  "AWS_ACCOUNT_ID"
  "EKS_CLUSTER_NAME"
  "DB_USERNAME"
  "DB_PASSWORD"
  "JWT_SECRET"
  "API_KEY"
)

echo "Verificando secretos en GitHub..."
for secret in "${REQUIRED_SECRETS[@]}"; do
  if gh secret list | grep -q "$secret"; then
    echo "✓ $secret configurado"
  else
    echo "✗ FALTA: $secret"
  fi
done
```

## 6. Flujo de Configuración Recomendado

1. **Generar valores localmente:**
   ```bash
   # Crear archivo temporal (NO commitear a git)
   cat > /tmp/secrets.env << EOF
   JWT_SECRET=$(openssl rand -hex 32)
   API_KEY=$(openssl rand -base64 32)
   EOF
   ```

2. **Obtener valores AWS:**
   ```bash
   aws sts get-caller-identity
   aws eks list-clusters --region us-east-1
   ```

3. **Configurar en GitHub:**
   - Abrir Settings > Secrets and variables > Actions
   - Crear cada secreto manualmente
   - O usar GitHub CLI:
   ```bash
   gh secret set JWT_SECRET --body "$(openssl rand -hex 32)"
   gh secret set API_KEY --body "$(openssl rand -base64 32)"
   ```

4. **Verificar configuración:**
   ```bash
   gh secret list
   ```

5. **Hacer push de código:**
   ```bash
   git add .
   git commit -m "Add GitHub Actions workflows with Kubernetes integration"
   git push origin main
   ```

## 7. Seguridad

⚠️ **Importante:**
- Nunca commitear secretos en el código
- Nunca pegar valores de secretos en logs
- Rotar secretos regularmente
- Usar valores diferentes para dev/prod (si es posible)
- Auditar acceso a secretos: Settings > Logs > Authentication log

## 8. Troubleshooting

### Error: Secret not found
- Verificar que el nombre coincida exactamente (case-sensitive)
- Verificar en Settings > Secrets and variables > Actions

### Error: Invalid token format
- JWT_SECRET debe ser formato hexadecimal (openssl rand -hex)
- API_KEY debe ser válido (openssl rand -base64 o similar)

### Error: AWS credentials expired
- Re-generar tokens: `aws configure` y actualizar secretos
- O usar OIDC (recomendado) en lugar de access keys

### Error: EKS cluster not found
- Verificar nombre del cluster: `aws eks list-clusters`
- Verificar región en GitHub Actions matches Terraform
