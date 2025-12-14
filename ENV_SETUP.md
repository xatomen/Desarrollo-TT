# Configuración de Variables de Entorno - Proyecto Completo

Este documento contiene TODAS las variables de entorno necesarias para provisionar el proyecto en diferentes ambientes.

---

## 📋 Tabla de Contenidos

1. [GitHub Secrets (CI/CD)](#github-secrets)
2. [Terraform Variables](#terraform-variables)
3. [Kubernetes - ConfigMaps](#kubernetes-configmaps)
4. [Kubernetes - Secrets](#kubernetes-secrets)
5. [Backend - Variables Locales](#backend-variables-locales)
6. [Frontend - Variables](#frontend-variables)
7. [Ambiente Checklist](#ambiente-checklist)

---

## GitHub Secrets

Estos secrets deben configurarse en **GitHub → Settings → Secrets and variables → Actions**.

### Requeridos

| Secret | Descripción | Ejemplo |
|--------|------------|---------|
| `AWS_ACCOUNT_ID` | ID de cuenta AWS | `123456789012` |
| `AWS_ROLE_ARN` | ARN del rol IAM para OIDC | `arn:aws:iam::123456789012:role/github-actions-role` |
| `EKS_CLUSTER_NAME` | Nombre del cluster EKS | `desarrollo-tt-cluster` |
| `DB_USERNAME` | Usuario de base de datos RDS | `admin` |
| `DB_PASSWORD` | Password de base de datos RDS | `P@ssw0rd123!` |
| `JWT_SECRET` | Secret para JWT en APIs | `super-secret-jwt-key-random` |
| `API_KEY` | API Key general | `sk-1234567890abcdefghij` |

### Cómo Configurar

```bash
# Opción 1: GitHub CLI
gh secret set AWS_ACCOUNT_ID --body "123456789012"
gh secret set AWS_ROLE_ARN --body "arn:aws:iam::123456789012:role/github-actions-role"
gh secret set EKS_CLUSTER_NAME --body "desarrollo-tt-cluster"
gh secret set DB_USERNAME --body "admin"
gh secret set DB_PASSWORD --body "P@ssw0rd123!"
gh secret set JWT_SECRET --body "super-secret-jwt-key-random"
gh secret set API_KEY --body "sk-1234567890abcdefghij"

# Opción 2: Manual en GitHub UI
# Settings → Secrets and variables → Actions → New repository secret
```

---

## Terraform Variables

### Archivo: `terraform/terraform.tfvars`

Crear este archivo (NO commitar, agregar a `.gitignore`):

```hcl
# AWS General
aws_region             = "us-east-1"
project_name           = "desarrollo-tt"
environment            = "production"

# EKS
cluster_name           = "desarrollo-tt-cluster"
cluster_version        = "1.28"
desired_size           = 2
min_size               = 1
max_size               = 4
instance_type          = "t3.medium"

# RDS MySQL
db_engine_version      = "8.0.35"
db_instance_class      = "db.t3.small"
db_allocated_storage   = 100
db_username            = "admin"
db_password            = "P@ssw0rd123!"  # Cambiar en producción
db_backup_retention    = 7
db_storage_encrypted   = true

# VPC
cidr_block             = "10.0.0.0/16"
private_subnet_1_cidr  = "10.0.1.0/24"
private_subnet_2_cidr  = "10.0.2.0/24"
public_subnet_1_cidr   = "10.0.10.0/24"
public_subnet_2_cidr   = "10.0.11.0/24"

# Tags
tags = {
  Project     = "Desarrollo TT"
  Environment = "production"
  ManagedBy   = "Terraform"
  CreatedAt   = "2024-12-13"
}
```

### Variables Disponibles en `terraform/variables.tf`

Ver el archivo `terraform/variables.tf` para todas las opciones disponibles.

---

## Kubernetes ConfigMaps

### ConfigMap: `app-config`

Se crea automáticamente por el workflow CI/CD. Contiene:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: desarrollo-tt
data:
  # Database
  DB_HOST: "desarrollo-tt-mysql-cluster.cluster-czzzzzzzzzz.us-east-1.rds.amazonaws.com"
  DB_PORT: "3306"
  
  # API Configuration
  API_PORT: "8000"
  API_WORKERS: "4"
  
  # Application
  NEXT_PUBLIC_APP_NAME: "Desarrollo TT"
  
  # Backend API Mode (NUEVO)
  K8S_MODE: "true"
  DOCKER_MODE: "false"
  
  # Logging
  LOG_LEVEL: "info"
  ENVIRONMENT: "production"
  
  # Internal API URLs (NUEVO)
  AACH_API_URL: "http://aach-api:5001"
  CARABINEROS_API_URL: "http://carabineros-api:5004"
  MTT_API_URL: "http://mtt-api:5003"
  SII_API_URL: "http://sii-api:5005"
  SGD_API_URL: "http://sgd-api:5006"
  TGR_API_URL: "http://tgr-api:5007"
  SRCEI_API_URL: "http://srcei-api:5001"
```

### ConfigMap: `api-config`

Se crea automáticamente por el workflow CI/CD. Contiene nombres de bases de datos:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
  namespace: desarrollo-tt
data:
  AACH_DB_NAME: "aach_db"
  CARABINEROS_DB_NAME: "carabineros_db"
  MTT_DB_NAME: "mtt_db"
  PRT_DB_NAME: "prt_db"
  SGD_DB_NAME: "sgd_db"
  SII_DB_NAME: "sii_db"
  SRCEI_DB_NAME: "srcei_db"
  TGR_DB_NAME: "tgr_db"
  BACK_DB_NAME: "back_db"
```

---

## Kubernetes Secrets

### Secret: `db-credentials`

Se crea automáticamente por el workflow CI/CD:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
  namespace: desarrollo-tt
type: Opaque
stringData:
  DB_USER: "admin"
  DB_PASSWORD: "P@ssw0rd123!"
```

**Origen:** GitHub Secrets `DB_USERNAME` y `DB_PASSWORD`

### Secret: `api-secrets`

Se crea automáticamente por el workflow CI/CD:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
  namespace: desarrollo-tt
type: Opaque
stringData:
  JWT_SECRET: "super-secret-jwt-key-random"
  API_KEY: "sk-1234567890abcdefghij"
```

**Origen:** GitHub Secrets `JWT_SECRET` y `API_KEY`

---

## Backend - Variables Locales

### Archivo: `.env` (Desarrollo)

Crear en raíz del proyecto para desarrollo local:

```env
# ========================================
# MODO DE EJECUCIÓN
# ========================================
DOCKER_MODE=true
K8S_MODE=false

# ========================================
# BASE DE DATOS
# ========================================
DB_USER=admin
DB_PASSWORD=admin123
DB_HOST=localhost
DB_NAME=back_db
DB_PORT=3306

# ========================================
# LOGGING
# ========================================
LOG_LEVEL=DEBUG

# ========================================
# APIS EXTERNAS (Opcional - Defaults)
# ========================================
# En Docker Compose, usa host.docker.internal automáticamente
# AACH_API_URL=http://host.docker.internal:5001
# CARABINEROS_API_URL=http://host.docker.internal:5004
# MTT_API_URL=http://host.docker.internal:5003
# SII_API_URL=http://host.docker.internal:5005
# SGD_API_URL=http://host.docker.internal:5006
# TGR_API_URL=http://host.docker.internal:5007
# SRCEI_API_URL=http://host.docker.internal:5001
```

**Nota:** Para Docker Compose, ver `docker-compose.yml` en cada carpeta de API.

---

## Frontend - Variables

### Variables en Build Time

Las aplicaciones frontend usan `config/api.ts` que detecta automáticamente:

| Variable | Donde se usa | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Frontend apps | `window.location.origin` |
| `NEXT_PUBLIC_APP_NAME` | Frontend UI | "Desarrollo TT" |
| `ENVIRONMENT` | Logging/Analytics | "production" |

### Aplicaciones Frontend

1. **obtener-permiso**
   - Puerto: 8002
   - Archivo config: `obtener-permiso/config/api.ts`

2. **panel-decisiones**
   - Puerto: 8001
   - Archivo config: `panel-decisiones/config/api.ts`

3. **app-fiscalizadores**
   - Puerto: 8081
   - Archivo config: `app-fiscalizadores/config/api.ts`

4. **app-propietarios**
   - Puerto: 8082
   - Archivo config: `app-propietarios/config/api.ts`

### Variables Opcional en Docker Compose

```yaml
services:
  panel-decisiones:
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://localhost:3000  # Opcional
      - NEXT_PUBLIC_APP_NAME=Desarrollo TT
      - ENVIRONMENT=development
```

---

## Ambiente Checklist

### ✅ Desarrollo Local (Docker Compose)

```bash
# 1. Variables Backend
cp .env.example .env
# Editar .env:
# DOCKER_MODE=true
# K8S_MODE=false
# DB_HOST=localhost

# 2. Docker Compose
docker-compose up

# 3. Verificar
curl http://localhost:8000/docs  # Backend
curl http://localhost:3000       # Frontend
```

**Variables Requeridas:**
- ✅ `.env` en raíz (backend)
- ✅ Docker Compose environment variables

---

### ✅ Kubernetes (Producción)

```bash
# 1. GitHub Secrets
gh secret set AWS_ACCOUNT_ID --body "123456789012"
gh secret set AWS_ROLE_ARN --body "arn:aws:iam::123456789012:role/github-actions-role"
gh secret set EKS_CLUSTER_NAME --body "desarrollo-tt-cluster"
gh secret set DB_USERNAME --body "admin"
gh secret set DB_PASSWORD --body "P@ssw0rd123!"
gh secret set JWT_SECRET --body "super-secret-jwt-key-random"
gh secret set API_KEY --body "sk-1234567890abcdefghij"

# 2. Terraform
cp terraform/env.tfvars.example terraform/terraform.tfvars
# Editar terraform/terraform.tfvars con valores reales
terraform -chdir=terraform plan
terraform -chdir=terraform apply

# 3. GitHub Actions (CI/CD)
git push origin main  # Dispara workflow automáticamente
# El workflow:
# - Construye imágenes Docker
# - Las sube a ECR
# - Crea ConfigMaps y Secrets en K8S
# - Despliega apps

# 4. Verificar
kubectl get configmap -n desarrollo-tt
kubectl get secret -n desarrollo-tt
kubectl get pods -n desarrollo-tt
```

**Variables Requeridas:**
- ✅ GitHub Secrets (7)
- ✅ `terraform/terraform.tfvars`
- ✅ Kubernetes ConfigMaps (creados por workflow)
- ✅ Kubernetes Secrets (creados por workflow)

---

## Mapeo de Variables por Sistema

### Backend API (Python FastAPI)

```
back/api-back/config/apis.py
  ├─ Detecta: K8S_MODE, DOCKER_MODE
  ├─ Usa: AACH_API_URL, CARABINEROS_API_URL, etc.
  └─ Construye URLs dinámicas según el ambiente
  
Routers (back/api-back/routers/*)
  └─ Importan de config.apis: PADRON_VEHICULO, PERMISO_CIRCULACION, etc.
```

### Frontend Apps (Next.js)

```
*/config/api.ts
  ├─ Detecta: window.location.origin
  ├─ Lee: NEXT_PUBLIC_API_BASE_URL (opcional)
  └─ Construye URLs: ${API_BASE}/back, ${API_BASE}/aach, etc.
```

### Kubernetes

```
kubernetes/configmap.yaml
  └─ app-config: DB_HOST, API URLs, K8S_MODE, etc.
     api-config: Nombres de bases de datos
  
kubernetes/secrets.yaml
  └─ db-credentials: DB_USER, DB_PASSWORD
     api-secrets: JWT_SECRET, API_KEY
```

### Terraform

```
terraform/variables.tf
  └─ Declara todas las variables disponibles
  
terraform/terraform.tfvars
  └─ Valores específicos del proyecto
```

---

## Checklist de Seguridad

- [ ] Nunca commitear `.env`, `terraform.tfvars`, o archivos con passwords
- [ ] Usar `.gitignore` para archivos locales:
  ```
  .env
  .env.local
  terraform/terraform.tfvars
  terraform/*.tfstate*
  ```
- [ ] GitHub Secrets usar valores strong (12+ caracteres, mixed case, números, símbolos)
- [ ] RDS: Cambiar password por defecto después de creación
- [ ] K8S: No commitear secrets en manifiestos YAML (usar workflow CI/CD)
- [ ] API Keys: Regenerar regularmente
- [ ] DB Password: Cambiar cada 90 días

---

## Cambios Recientes

### Agregadas en la Refactorización Reciente

- ✅ `K8S_MODE` / `DOCKER_MODE` - Detección automática de ambiente
- ✅ `AACH_API_URL`, `CARABINEROS_API_URL`, `MTT_API_URL`, `SII_API_URL`, `SGD_API_URL`, `TGR_API_URL`, `SRCEI_API_URL`
- ✅ Removida: `NEXT_PUBLIC_API_URL` (ahora usa hostname automático)
- ✅ Frontend `config/api.ts` ahora detecta `window.location.origin` automáticamente

---

## Troubleshooting

### "ConfigMap not found"
```bash
kubectl get configmap -n desarrollo-tt
# Si no está, el workflow de CI/CD no corrió correctamente
# Revisar: .github/workflows/build-and-deploy.yml
```

### "Secret not found"
```bash
kubectl get secret -n desarrollo-tt
# Verificar que GitHub Secrets están configurados correctamente
```

### Variables no se actualizan en pod
```bash
# Los pods usan snapshot de ConfigMap al iniciarse
# Para actualizar, hacer rollout restart:
kubectl rollout restart deployment/back-api -n desarrollo-tt
```

### "Failed to authenticate to registry"
```bash
# Verificar ECR pull secret
kubectl get secret ecr-secret -n desarrollo-tt
# Si no existe, workflow de CI/CD debe haberlo creado
```

---

## Referencias Rápidas

### Archivos Importantes

- **Documentación Backend**: [back/ENVIRONMENT_VARIABLES.md](back/ENVIRONMENT_VARIABLES.md)
- **Documentación Kubernetes**: [kubernetes/KUBERNETES_UPDATE.md](kubernetes/KUBERNETES_UPDATE.md)
- **Documentación Ingress**: [kubernetes/INGRESS_UPDATE.md](kubernetes/INGRESS_UPDATE.md)
- **Documentación CI/CD**: [.github/WORKFLOW_UPDATE.md](.github/WORKFLOW_UPDATE.md)
- **Documentación Frontend**: [FRONTEND_API_CONFIG.md](FRONTEND_API_CONFIG.md)
- **Resumen Refactoring**: [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)

### Comandos Útiles

```bash
# Ver todas las variables en ConfigMap
kubectl get configmap app-config -n desarrollo-tt -o yaml

# Ver todas las variables en Secret
kubectl get secret db-credentials -n desarrollo-tt -o yaml

# Actualizar una variable de ConfigMap
kubectl patch configmap app-config -n desarrollo-tt \
  -p '{"data":{"LOG_LEVEL":"DEBUG"}}'

# Ver logs de un pod
kubectl logs -f deployment/back-api -n desarrollo-tt

# Ejecutar un comando en un pod
kubectl exec -it deployment/back-api -n desarrollo-tt -- bash
```

---

## Soporte

Para preguntas sobre configuración, revisar:
1. El archivo específico de documentación (referencias arriba)
2. Los archivos de ejemplo (`.env.example`, `terraform/env.tfvars.example`)
3. Los manifiestos YAML en `kubernetes/`

