# GitHub Secrets - Guía Rápida

## Ubicación
**GitHub → Settings → Secrets and variables → Actions**

## Secretos a Agregar (REQUERIDOS)

| Secret | Valor Ejemplo | Descripción |
|--------|---------------|------------|
| `AWS_ACCOUNT_ID` | `123456789012` | ID de tu cuenta AWS |
| `AWS_ROLE_ARN` | `arn:aws:iam::123456789012:role/github-actions-role` | ARN del rol IAM para OIDC |
| `EKS_CLUSTER_NAME` | `desarrollo-tt-cluster` | Nombre del cluster EKS |
| `DB_USERNAME` | `admin` | Usuario de RDS |
| `DB_PASSWORD` | `P@ssw0rd123!SecurePassword` | Password de RDS (strong) |
| `JWT_SECRET` | `your-secret-jwt-key-12345678` | Secret para JWT (tokens de sesión) |
| `GEMINI_API_KEY` | Tu API key de Google Gemini | Secret para chatbot con IA |
| `SENDGRID_API_KEY` | `SG.xxxxxxxxxxxxxxxxxxxxx` | Secret para envío de emails |
| `TERRAFORM_TFVARS` | Ver sección Terraform | Archivo tfvars completo para Terraform |

## Variables a Agregar (OPCIONALES)

| Variable | Valor Ejemplo | Descripción | Default |
|----------|---------------|------------|---------|
| `AWS_REGION` | `us-east-1` | Región AWS | `us-east-1` |

**Nota:** Las variables son configurables y visibles (no secretas). Los secretos son privados.

## Cómo Agregar Secretos

### Opción 1: GitHub CLI
```bash
gh secret set AWS_ACCOUNT_ID --body "123456789012"
gh secret set AWS_ROLE_ARN --body "arn:aws:iam::123456789012:role/github-actions-role"
gh secret set EKS_CLUSTER_NAME --body "desarrollo-tt-cluster"
gh secret set DB_USERNAME --body "admin"
gh secret set DB_PASSWORD --body "P@ssw0rd123!SecurePassword"
gh secret set JWT_SECRET --body "tu-jwt-secret-aleatorio-aqui"
gh secret set GEMINI_API_KEY --body "tu-gemini-api-key-aqui"
gh secret set SENDGRID_API_KEY --body "SG.xxxxxxxxxxxxxxxxxxxxx"
```

### Opción 2: GitHub UI
1. Ve a **GitHub → Settings → Secrets and variables → Actions**
2. Click en **New repository secret**
3. Agrega cada secreto uno por uno

## Terraform - env.tfvars Secret (CRÍTICO)

El secret `TERRAFORM_TFVARS` debe contener el contenido completo del archivo de variables de Terraform.

**Ver archivo:** [terraform/env.tfvars.example](terraform/env.tfvars.example)

### Cómo agregar TERRAFORM_TFVARS

**GitHub CLI:**
```bash
# Usando el archivo example como base
gh secret set TERRAFORM_TFVARS --body "$(cat terraform/env.tfvars.example)"
```

**Vía GitHub UI:**
1. Copia el contenido de `terraform/env.tfvars.example`
2. Ve a **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Name: `TERRAFORM_TFVARS`
5. Value: (pega el contenido)
6. Click **Add secret**

## Variables - AWS_REGION

**GitHub CLI:**
```bash
gh variable set AWS_REGION --body "us-east-1"
```

**Vía GitHub UI:**
1. Ve a **Settings → Secrets and variables → Actions**
2. Click en **New repository variable**
3. Name: `AWS_REGION`
4. Value: `us-east-1` (o tu región preferida)
5. Click **Add variable**

## Terraform Version

**Versión actual:** `1.6.0`
- Archivo: `.github/workflows/infrastructure-management.yml` (línea 18)
- Variable: `TF_VERSION: 1.6.0`
- Para cambiar: Edita ese valor en el workflow

## Checklist Completo

**Secretos (9 REQUERIDOS):**
- [ ] AWS_ACCOUNT_ID
- [ ] AWS_ROLE_ARN
- [ ] EKS_CLUSTER_NAME
- [ ] DB_USERNAME
- [ ] DB_PASSWORD
- [ ] JWT_SECRET (token de sesión admin)
- [ ] GEMINI_API_KEY (chatbot IA)
- [ ] SENDGRID_API_KEY (envío de emails)
- [ ] TERRAFORM_TFVARS ⭐ (contenido de env.tfvars)

**Variables (OPCIONAL):**
- [ ] AWS_REGION (default: us-east-1)

## Notas Importantes

- ⚠️ Cambiar valores de ejemplo con valores reales
- ✅ DB_PASSWORD debe ser fuerte (12+ caracteres, símbolos, números)
- ✅ JWT_SECRET y API_KEY generados aleatoriamente
- ✅ TERRAFORM_TFVARS es un multi-line secret con el contenido completo
- ⚠️ NO copiar/pegar en público - usar generador seguro
- ✅ Una vez agregados, no se pueden ver de nuevo (por seguridad)

## Validación

```bash
# Ver secretos configurados
gh secret list

# Ver variables configuradas
gh variable list
```

## ¿Dónde se usan?

- `AWS_ACCOUNT_ID`, `AWS_ROLE_ARN`, `EKS_CLUSTER_NAME` → build-and-deploy workflow
- `DB_USERNAME`, `DB_PASSWORD` → Kubernetes Secret (db-credentials)
- `JWT_SECRET` → Kubernetes Secret (api-secrets) - Autenticación de admin
- `GEMINI_API_KEY` → Kubernetes Secret (api-secrets) - Chatbot con Google Gemini IA
- `SENDGRID_API_KEY` → Kubernetes Secret (api-secrets) - Envío de emails
- `TERRAFORM_TFVARS` → infrastructure-management workflow (Terraform provisioning)
- `AWS_REGION` → Ambos workflows (fallback a us-east-1)
