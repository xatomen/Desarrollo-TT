# Quick Start Checklist - Despliegue Rápido

## ⚡ Resumen en 30 Minutos (Configuración)

Tiempo total estimado:
- **Configuración inicial:** 30 minutos
- **Despliegue Terraform:** 20-30 minutos
- **Despliegue Kubernetes:** 5-10 minutos
- **Validación:** 5-10 minutos

---

## 1️⃣ Paso 1: Requisitos (5 min)

```bash
# Verificar que está instalado
aws --version
kubectl version
terraform version
git --version
gh --version

# Configurar AWS
aws configure
# Ingresar: Access Key, Secret Key, Region: us-east-1, Format: json

# Configurar GitHub
gh auth login
# Seleccionar: GitHub.com, HTTPS, Yes para Git

# Verificar
aws sts get-caller-identity  # Debe mostrar tu Account ID
gh auth status              # Debe mostrar tu usuario GitHub
```

✓ Estimado: **5 minutos**

---

## 2️⃣ Paso 2: Generar Secretos (5 min)

### Windows PowerShell:
```powershell
# Generar JWT_SECRET
$JwtSecret = -join ((0..63) | ForEach-Object {[Convert]::ToString($(Get-Random -Max 16),16)})
Write-Host "JWT_SECRET=$JwtSecret"

# Generar API_KEY
$ApiKey = [Convert]::ToBase64String($(0..31 | ForEach-Object {[byte](Get-Random -Max 256)}))
Write-Host "API_KEY=$ApiKey"

# Tu Account ID AWS
aws sts get-caller-identity --query Account --output text
```

### Linux/Bash:
```bash
echo "JWT_SECRET=$(openssl rand -hex 32)"
echo "API_KEY=$(openssl rand -base64 32)"
aws sts get-caller-identity --query Account --output text
```

**Guarda estos valores ahora** ↓

```
AWS_ACCOUNT_ID = ___________________
AWS_ROLE_ARN = arn:aws:iam::___________:role/github-oidc-role  (o dejar vacío por ahora)
EKS_CLUSTER_NAME = desarrollo-tt-eks-cluster
DB_USERNAME = admin
DB_PASSWORD = ___________________
JWT_SECRET = ___________________
API_KEY = ___________________
```

✓ Estimado: **5 minutos**

---

## 3️⃣ Paso 3: Crear Secretos en GitHub (5 min)

### Opción A (Recomendado - GitHub CLI):
```bash
gh secret set AWS_ACCOUNT_ID --body "123456789012"
gh secret set AWS_ROLE_ARN --body "arn:aws:iam::123456789012:role/github-oidc-role"
gh secret set EKS_CLUSTER_NAME --body "desarrollo-tt-eks-cluster"
gh secret set DB_USERNAME --body "admin"
gh secret set DB_PASSWORD --body "TuContraseña123!"
gh secret set JWT_SECRET --body "a1b2c3d4e5f6..."
gh secret set API_KEY --body "aBcDeFgHi..."

# Verificar
gh secret list
```

### Opción B (Web):
1. https://github.com/tu-usuario/tu-repo/settings/secrets/actions
2. "New repository secret" × 7
3. Copiar valores de arriba

✓ Estimado: **5 minutos**

---

## 4️⃣ Paso 4: Configurar Terraform (5 min)

```bash
cd terraform/

# Copiar ejemplo
cp env.tfvars.example env.tfvars

# Editar (reemplazar valores)
# En Windows:
code env.tfvars

# Valores necesarios:
# aws_region = "us-east-1"
# project_name = "desarrollo-tt"
# environment = "dev"
# db_username = "admin"
# db_password = "TuContraseña123!"  # Mismo que GitHub Secret
# skip_final_snapshot = true
```

**Validar:**
```bash
terraform init
terraform validate  # ✓ Success! The configuration is valid.
terraform plan -var-file="env.tfvars" -out=tfplan
```

✓ Estimado: **5 minutos**

---

## 5️⃣ Paso 5: Desplegar Infraestructura AWS (25-30 min)

```bash
# Desde terraform/
terraform apply -var-file="env.tfvars"
# Type: yes
# Esperar ~25-30 minutos

# Ver progreso en otra terminal:
aws eks list-clusters --region us-east-1
aws rds describe-db-clusters --region us-east-1

# Cuando termine, guardar outputs
terraform output > outputs.txt
cat outputs.txt  # Copiar valores importantes
```

**Importante guardar:**
```
eks_cluster_endpoint = https://XXXXX.eks.us-east-1.amazonaws.com
rds_cluster_endpoint = desarrollo-tt-cluster.XXXXX.us-east-1.rds.amazonaws.com
acm_certificate_arn = arn:aws:acm:...
```

✓ Estimado: **25-30 minutos** (principalmente esperar)

---

## 6️⃣ Paso 6: Configurar kubectl (2 min)

```bash
# Actualizar kubeconfig
aws eks update-kubeconfig \
  --name desarrollo-tt-eks-cluster \
  --region us-east-1

# Verificar
kubectl cluster-info
kubectl get nodes  # Debe haber 2-3 nodos
```

✓ Estimado: **2 minutos**

---

## 7️⃣ Paso 7: Actualizar Kubernetes Manifests (5 min)

```bash
cd kubernetes/

# Editar configmap.yaml
# Reemplazar:
# DB_HOST=rds.tudominio.com
# Por: DB_HOST=desarrollo-tt-cluster.XXXXX.us-east-1.rds.amazonaws.com
# (Copiar de terraform output)

# Validar
yamllint .  # Debe pasar sin errores
```

✓ Estimado: **5 minutos**

---

## 8️⃣ Paso 8: Push a GitHub (5 min)

```bash
git add kubernetes/
git add .github/
git add terraform/*.tf
git add terraform/README.md

# Verificar que env.tfvars NO está
git status | grep env.tfvars  # NO debe aparecer

# Commit
git commit -m "Add Kubernetes manifests and GitHub Actions workflows"

# Push
git push origin main
```

✓ Estimado: **5 minutos**

---

## 9️⃣ Paso 9: Monitorear Workflow (10 min)

1. Ir a: **https://github.com/tu-usuario/tu-repo/actions**
2. Ver workflow "Build and Deploy" ejecutándose
3. Monitorear progreso:
   - **build-images**: ~2-3 minutos (13 imágenes paralelas)
   - **push-to-ecr**: ~1 minuto
   - **deploy-to-eks**: ~5 minutos

```bash
# En terminal local, ver pods iniciándose
kubectl get pods -n desarrollo-tt -w

# Ver logs de un pod
kubectl logs -n desarrollo-tt deployment/obtener-permiso
```

✓ Estimado: **10 minutos** (esperar workflow)

---

## 🔟 Paso 10: Validar Deployment (5 min)

```bash
# Ver todos los pods
kubectl get pods -n desarrollo-tt
# ✓ Debe haber 26+ pods (2 réplicas × 13 apps)

# Ver servicios
kubectl get svc -n desarrollo-tt
# ✓ Debe haber 13 servicios

# Ver ingress
kubectl get ingress -n desarrollo-tt
# ✓ Debe haber 1 ingress con ADDRESS (ALB)

# Testear un endpoint
curl https://api.tudominio.com/docs
# ✓ Debe responder con Swagger UI
```

✓ Estimado: **5 minutos**

---

## 🎉 Deployment Completado!

### Checklist Final:
- [ ] AWS Account ID configurado
- [ ] 7 GitHub Secrets creados
- [ ] Terraform validó sin errores
- [ ] Terraform apply completó exitosamente
- [ ] kubectl cluster-info funciona
- [ ] Kubernetes manifests validaron
- [ ] Push a GitHub exitoso
- [ ] GitHub Actions workflow completó
- [ ] 26+ pods están en estado "Running"
- [ ] 13 servicios tienen "Endpoints"
- [ ] Ingress tiene "ADDRESS" asignado

---

## 📍 Próximos Pasos

### Inicializar Bases de Datos:
```bash
# Obtener endpoint RDS
RDS_ENDPOINT=$(terraform output -raw rds_cluster_endpoint)

# Conectar
mysql -h $RDS_ENDPOINT -u admin -p

# Importar schemas si los tienes
mysql -h $RDS_ENDPOINT -u admin -p aach_db < api-aach/script.sql
```

### Configurar Dominio Personalizado (Opcional):
```bash
# Si usaste create_dns_records = true en Terraform
terraform output nameservers
# Actualizar en tu registrador de dominio (Namecheap, GoDaddy, etc)
# Esperar 24-48 horas para propagación
```

### Monitoreo Continuo:
```bash
# Ver pods en tiempo real
kubectl get pods -n desarrollo-tt -w

# Ver logs
kubectl logs -n desarrollo-tt -f deployment/obtener-permiso

# Ver eventos
kubectl get events -n desarrollo-tt --sort-by='.lastTimestamp'
```

---

## ⚠️ Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| Pod stuck in "Pending" | `kubectl describe pod <pod-name> -n desarrollo-tt` |
| CrashLoopBackOff | `kubectl logs <pod-name> -n desarrollo-tt` |
| 502 Bad Gateway | `kubectl get endpoints -n desarrollo-tt` |
| Workflow fails | Verificar GitHub Secrets: `gh secret list` |
| No puedo conectar a RDS | Verificar security groups: `aws ec2 describe-security-groups` |
| terraform init error | Verificar AWS credentials: `aws sts get-caller-identity` |

---

## 📞 Documentación Completa

- **Despliegue paso a paso:** `DEPLOYMENT_GUIDE.md`
- **Validación pre-deployment:** `.github/workflows/VALIDATION.md`
- **Generar secretos:** `.github/workflows/GENERATE_SECRETS.md`
- **Setup GitHub Actions:** `.github/workflows/SETUP.md`
- **Infrastructure Management:** `.github/workflows/INFRASTRUCTURE_MANAGEMENT.md`
- **Kubernetes:** `kubernetes/README.md`
- **Terraform:** `terraform/README.md`

---

## 📊 Estimación de Costos

Con la configuración default:
- **EKS**: $0.10/hora
- **EC2 nodes (2 t3.medium)**: $0.0832/hora
- **RDS Aurora (2 db.t3.small)**: $0.21/hora
- **ALB**: ~$0.06/hora
- **Total**: ~$0.43/hora (~$310/mes)

---

## 🔐 Seguridad - Recordar

- ✅ No commitear `terraform/env.tfvars`
- ✅ No pushear `.env` files
- ✅ Regenerar secretos si los expones
- ✅ Usar IAM roles en lugar de access keys
- ✅ Mantener OIDC authentication activo

---

**¡Listo para desplegar! 🚀**

Tiempo total: ~90 minutos (incluyendo esperas de Terraform)
