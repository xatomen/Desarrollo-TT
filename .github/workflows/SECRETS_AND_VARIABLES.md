# GitHub Secrets & Variables - Configuración Completa

Listado de todos los secretos y variables que necesitas configurar en GitHub para el despliegue automático.

---

## 📍 Dónde Configurarlos

**URL:** https://github.com/tu-usuario/tu-repo/settings/secrets-and-variables/actions

O en GitHub CLI:
```bash
# Para secretos
gh secret set NAME --body "value"

# Para variables
gh variable set NAME --body "value"
```

---

## 🔐 SECRETOS (8 Total)

Los secretos son valores sensibles que NO se mostrarán en los logs.

### 1. AWS_ACCOUNT_ID
- **Tipo:** Secreto
- **Descripción:** Tu ID de cuenta AWS
- **Formato:** 12 dígitos (ej: 123456789012)
- **Obtener:**
  ```bash
  aws sts get-caller-identity --query Account --output text
  ```
- **Ejemplo:** `123456789012`

### 2. AWS_ROLE_ARN
- **Tipo:** Secreto
- **Descripción:** ARN del IAM role para OIDC authentication
- **Formato:** `arn:aws:iam::ACCOUNT_ID:role/github-oidc-role`
- **Obtener:**
  ```bash
  aws iam get-role --role-name github-oidc-role --query 'Role.Arn' --output text
  ```
- **Ejemplo:** `arn:aws:iam::123456789012:role/github-oidc-role`
- **Nota:** Si el role no existe, Terraform lo crea automáticamente

### 3. EKS_CLUSTER_NAME
- **Tipo:** Secreto
- **Descripción:** Nombre del cluster EKS
- **Formato:** `desarrollo-tt-eks-cluster` (del Terraform)
- **Valor fijo:** `desarrollo-tt-eks-cluster`
- **Obtener (después de Terraform):**
  ```bash
  aws eks list-clusters --region us-east-1 --output text
  ```

### 4. DB_USERNAME
- **Tipo:** Secreto
- **Descripción:** Usuario maestro de RDS
- **Formato:** String
- **Valor recomendado:** `admin`
- **Nota:** Debe coincidir con `db_username` en `terraform/env.tfvars`

### 5. DB_PASSWORD
- **Tipo:** Secreto (SENSIBLE)
- **Descripción:** Contraseña de RDS
- **Formato:** String fuerte (min 12 caracteres)
- **Requisitos:**
  - Mínimo 12 caracteres
  - Debe incluir mayúsculas, minúsculas, números, símbolos
  - No puede contener: @, $, /, \, ", '
- **Generar:**
  ```bash
  # PowerShell
  -join ((0..15) | ForEach-Object {[char](Get-Random -Min 33 -Max 126)})
  
  # Bash
  openssl rand -base64 12 | tr -d '/' | cut -c1-16
  ```
- **Nota:** Debe coincidir con `db_password` en `terraform/env.tfvars`

### 6. JWT_SECRET
- **Tipo:** Secreto (SENSIBLE)
- **Descripción:** Secret para firmar JWT tokens
- **Formato:** Hexadecimal (64 caracteres = 32 bytes)
- **Generar:**
  ```bash
  # PowerShell
  -join ((0..63) | ForEach-Object {[Convert]::ToString($(Get-Random -Max 16),16)})
  
  # Bash
  openssl rand -hex 32
  ```
- **Ejemplo:** `a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0`
- **Uso:** Firmar y validar JWT tokens en APIs

### 7. API_KEY
- **Tipo:** Secreto (SENSIBLE)
- **Descripción:** API key general para autenticación
- **Formato:** Base64 o string aleatorio (min 32 caracteres)
- **Generar:**
  ```bash
  # PowerShell
  [Convert]::ToBase64String($(0..31 | ForEach-Object {[byte](Get-Random -Max 256)}))
  
  # Bash
  openssl rand -base64 32
  ```
- **Ejemplo:** `aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789+/==`
- **Uso:** Autenticación general de APIs
### 8. TERRAFORM_TFVARS
- **Tipo:** Secreto (SENSIBLE)
- **Descripción:** Archivo completo `env.tfvars` con todas las variables de Terraform
- **Contenido:** Texto literal con toda la configuración
- **Generación:** Copiar el contenido de `terraform/env.tfvars` local
- **Ejemplo:**
  ```hcl
  aws_region              = "us-east-1"
  project_name            = "desarrollo-tt"
  environment             = "dev"
  db_username             = "admin"
  db_password             = "TuContraseña123!@"
  skip_final_snapshot     = true
  create_dns_records      = false
  domain_name             = "tudominio.com"
  instance_type           = "t3.medium"
  rds_instance_class      = "db.t3.small"
  ```
- **Uso en Workflow:**
  - El workflow `infrastructure-management.yml` lo usa para crear `terraform/env.tfvars`
  - Se ejecuta antes de `terraform plan/apply`
  - Se elimina después del workflow (por seguridad)
- **Nota:** Este secreto reemplaza la necesidad de tener `env.tfvars` en git
---

## 📋 VARIABLES (1 Total)

Las variables son valores públicos que se mostrarán en los logs.

### 1. AWS_REGION
- **Tipo:** Variable
- **Descripción:** Región AWS para desplegar
- **Formato:** Región AWS válida
- **Valor recomendado:** `us-east-1`
- **Opciones válidas:**
  - `us-east-1` (N. Virginia) - Recomendado
  - `us-west-2` (Oregon)
  - `eu-west-1` (Irlanda)
  - `ap-southeast-1` (Singapur)
- **Nota:** Debe coincidir con `aws_region` en `terraform/env.tfvars`

---

## ✅ Checklist de Configuración

Marca conforme configures cada uno:

### Secretos (Marcar 8)
- [ ] AWS_ACCOUNT_ID
- [ ] AWS_ROLE_ARN
- [ ] EKS_CLUSTER_NAME
- [ ] DB_USERNAME
- [ ] DB_PASSWORD
- [ ] JWT_SECRET
- [ ] API_KEY
- [ ] TERRAFORM_TFVARS

### Variables (Marcar 1)
- [ ] AWS_REGION

---

## 🔧 Cómo Configurar en GitHub

### Opción A: GitHub CLI (Recomendado)

```bash
# Secretos básicos
gh secret set AWS_ACCOUNT_ID --body "123456789012"
gh secret set AWS_ROLE_ARN --body "arn:aws:iam::123456789012:role/github-oidc-role"
gh secret set EKS_CLUSTER_NAME --body "desarrollo-tt-eks-cluster"
gh secret set DB_USERNAME --body "admin"
gh secret set DB_PASSWORD --body "TuContraseña123!@"
gh secret set JWT_SECRET --body "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0"
gh secret set API_KEY --body "aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789+/=="

# TERRAFORM_TFVARS (opción 1: desde archivo local)
gh secret set TERRAFORM_TFVARS < terraform/env.tfvars

# TERRAFORM_TFVARS (opción 2: copiar contenido manualmente)
gh secret set TERRAFORM_TFVARS --body 'aws_region = "us-east-1"
project_name = "desarrollo-tt"
environment = "dev"
db_username = "admin"
db_password = "TuContraseña123!@"
skip_final_snapshot = true
create_dns_records = false
domain_name = "tudominio.com"
instance_type = "t3.medium"
rds_instance_class = "db.t3.small"'

# Variable
gh variable set AWS_REGION --body "us-east-1"

# Verificar que se crearon
gh secret list
gh variable list
```

### Opción B: GitHub Web UI

1. Ir a: https://github.com/tu-usuario/tu-repo/settings/secrets-and-variables/actions
2. Click en "New repository secret"
3. Agregar cada secreto:

**Secretos:**
| Name | Body |
|------|------|
| AWS_ACCOUNT_ID | `123456789012` |
| AWS_ROLE_ARN | `arn:aws:iam::123456789012:role/github-oidc-role` |
| EKS_CLUSTER_NAME | `desarrollo-tt-eks-cluster` |
| DB_USERNAME | `admin` |
| DB_PASSWORD | `TuContraseña123!@` |
| JWT_SECRET | `a1b2c3d4e5f6...` |
| API_KEY | `aBcDeFgHiJk...` |
| TERRAFORM_TFVARS | `aws_region = "us-east-1"` ... (contenido completo) |

4. Click en "New repository variable"
5. Agregar variable:

**Variables:**
| Name | Value |
|------|-------|
| AWS_REGION | `us-east-1` |

### Opción C: Script Automatizado (PowerShell)

```powershell
# Crear archivo con los secretos
$secrets = @{
    "AWS_ACCOUNT_ID" = "123456789012"
    "AWS_ROLE_ARN" = "arn:aws:iam::123456789012:role/github-oidc-role"
    "EKS_CLUSTER_NAME" = "desarrollo-tt-eks-cluster"
    "DB_USERNAME" = "admin"
    "DB_PASSWORD" = "TuContraseña123!@"
    "JWT_SECRET" = "a1b2c3d4e5f6..."
    "API_KEY" = "aBcDeFgHiJk..."
}

# Crear cada secreto
foreach ($key in $secrets.Keys) {
    gh secret set $key --body $secrets[$key]
    Write-Host "✓ $key configurado"
}

# Crear variable
gh variable set AWS_REGION --body "us-east-1"
Write-Host "✓ AWS_REGION configurado"
```

---

## 🔍 Verificar Configuración

### Con GitHub CLI
```bash
# Listar todos los secretos (sin ver valores)
gh secret list

# Listar todas las variables
gh variable list

# Ver detalles de uno (sin ver valor)
gh secret view JWT_SECRET
gh variable view AWS_REGION
```

### Salida esperada:
```
NAME                   UPDATED
AWS_ACCOUNT_ID         Jan 11, 2025
AWS_ROLE_ARN           Jan 11, 2025
EKS_CLUSTER_NAME       Jan 11, 2025
DB_USERNAME            Jan 11, 2025
DB_PASSWORD            Jan 11, 2025
JWT_SECRET             Jan 11, 2025
API_KEY                Jan 11, 2025
```

### En GitHub Web UI
1. Settings > Secrets and variables > Actions
2. Sección "Secrets": Debe mostrar 7 secretos
3. Sección "Variables": Debe mostrar 1 variable
4. No se puede ver el valor (solo "Updated X ago")

---

## 📋 Correlación con Terraform

Estos valores deben coincidir con tu archivo `terraform/env.tfvars`:

| GitHub Secret | terraform/env.tfvars |
|---------------|--------------------|
| DB_USERNAME | `db_username` |
| DB_PASSWORD | `db_password` |
| - | `aws_region` (en GitHub Variable) |
| - | `project_name` = "desarrollo-tt" |
| - | `environment` = "dev" o "prod" |

**Archivo env.tfvars ejemplo:**
```hcl
aws_region = "us-east-1"           # Coincide con AWS_REGION variable
project_name = "desarrollo-tt"
environment = "dev"
db_username = "admin"               # Coincide con DB_USERNAME secret
db_password = "TuContraseña123!@"  # Coincide con DB_PASSWORD secret
skip_final_snapshot = true
create_dns_records = false
```

---

## 🔐 Seguridad - Recomendaciones

✅ **HACER:**
- Usar valores únicos y fuertes para secretos
- Regenerar secretos regularmente (cada 3-6 meses)
- Usar diferentes valores para dev y prod
- Auditar acceso a secretos: Settings > Logs > Authentication log
- Rotar DB_PASSWORD después del primer despliegue

❌ **NO HACER:**
- Commitear secretos en el código
- Usar valores de prueba en producción
- Compartir secretos en chat/email
- Guardar secretos en archivos locales (solo en GitHub)
- Usar la misma contraseña en múltiples servicios

---

## 🚨 Si Expones un Secreto Accidentalmente

1. **Inmediatamente:** Regenera el secreto
   ```bash
   gh secret set NOMBRE_SECRETO --body "nuevo-valor"
   ```

2. **En GitHub:** Settings > Secrets and variables > Delete the old one

3. **En AWS:** Si DB_PASSWORD fue expuesto:
   ```bash
   # Cambiar contraseña en RDS
   aws rds modify-db-cluster \
     --db-cluster-identifier desarrollo-tt-cluster \
     --master-user-password "nueva-contraseña"
   ```

4. **Monitorear:** Revisar logs de acceso por actividad sospechosa

---

## 📞 Troubleshooting

### Error: Secret not found en workflow
- Verificar que el nombre coincida exactamente (case-sensitive)
- Verificar en Settings > Secrets and variables > Actions
- Usar `gh secret list` para listar

### Error: Invalid AWS credentials
- Verificar que AWS_ACCOUNT_ID es correcto: `aws sts get-caller-identity`
- Verificar que AWS_ROLE_ARN existe: `aws iam get-role --role-name github-oidc-role`

### Error: DB_PASSWORD rejected
- Verificar que no contiene caracteres prohibidos: @, $, /, \, ", '
- Mínimo 12 caracteres
- Regenerar con comando seguro

### Error: EKS cluster not found
- Verificar nombre del cluster: `aws eks list-clusters --region us-east-1`
- Asegúrese de que EKS_CLUSTER_NAME = "desarrollo-tt-eks-cluster"

### Error: env.tfvars not found en workflow
- Verificar que TERRAFORM_TFVARS está configurado: `gh secret view TERRAFORM_TFVARS`
- Verificar que el contenido es válido HCL
- Asegurarse de que todas las variables requeridas estén presentes

### Error: TERRAFORM_TFVARS contiene variables inválidas
- Comparar con `terraform/env.tfvars.example`
- Verificar sintaxis HCL (comillas, valores, etc)
- Actualizar el secreto con contenido correcto: `gh secret set TERRAFORM_TFVARS < terraform/env.tfvars`

---

## 📊 Resumen de Configuración Requerida

**Total de configuraciones:** 9 (8 secretos + 1 variable)

**Tiempo estimado:** 10 minutos

**Críticas para CI/CD:**
- ✅ AWS_ACCOUNT_ID
- ✅ AWS_ROLE_ARN
- ✅ EKS_CLUSTER_NAME
- ✅ DB_USERNAME
- ✅ DB_PASSWORD
- ✅ JWT_SECRET
- ✅ API_KEY
- ✅ TERRAFORM_TFVARS (Nuevo - Replaces env.tfvars file)
- ✅ AWS_REGION

**Sin estas configuraciones, el workflow fallará.**

### Secreto TERRAFORM_TFVARS - Flujo de Uso

```
Local Development:
1. Crear archivo: terraform/env.tfvars
2. Configurar en GitHub Secret: TERRAFORM_TFVARS
3. NO commitar a git (está en .gitignore)

GitHub Actions Workflow:
1. Checkout del código
2. Crear terraform/env.tfvars desde secreto TERRAFORM_TFVARS
3. terraform init
4. terraform plan/apply/destroy
5. Limpiar el archivo (por seguridad)
```

---

**Status:** Listo para configurar ✅
