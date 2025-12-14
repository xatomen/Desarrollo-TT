# Guía Completa de Despliegue Paso a Paso

## FASE 1: PREPARACIÓN (Antes de cualquier deployment)

### 1.1 Verificar Requisitos
```bash
# Necesitas tener instalado:
aws --version          # AWS CLI v2
kubectl version        # Kubernetes CLI
terraform version      # Terraform v1.0+
git --version         # Git
gh --version          # GitHub CLI (opcional pero recomendado)
```

**Windows (PowerShell):**
```powershell
choco install awscli; choco install kubernetes-cli; choco install terraform; choco install github-cli
```

### 1.2 Configurar AWS
```bash
# Configurar credenciales AWS
aws configure
# Ingresar: AWS Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)

# Verificar que está funcionando
aws sts get-caller-identity
# Debe mostrar tu Account ID, User ARN, etc
```

### 1.3 Configurar GitHub
```bash
# Autenticarse en GitHub
gh auth login
# Seleccionar: GitHub.com, HTTPS, Y (authenticate Git with GitHub credentials)

# Verificar que está funcionando
gh auth status
```

### 1.4 Verificar Requisitos del Proyecto
```bash
# En la raíz del proyecto
pwd  # Debe ser: c:\Users\jorge\OneDrive\Escritorio\UTEM 11S\Trabajo de Título 1\desarrollo\Desarrollo-TT

# Verificar estructura
ls terraform/      # Ver archivos terraform
ls kubernetes/     # Ver manifests
ls .github/workflows/  # Ver workflows

# Verificar git
git status         # Debe estar limpio
git branch         # Ver rama actual
```

---

## FASE 2: CONFIGURAR GITHUB SECRETS (CRÍTICO)

Este paso debe hacerse ANTES de hacer push al repositorio.

### 2.1 Generar Valores Secretos

**En PowerShell (Windows):**
```powershell
# Generar JWT_SECRET (32 bytes hex)
$JwtSecret = -join ((0..63) | ForEach-Object {[Convert]::ToString($(Get-Random -Max 16),16)})
Write-Host "JWT_SECRET: $JwtSecret" -ForegroundColor Green

# Generar API_KEY (Base64)
$ApiKey = [Convert]::ToBase64String($(0..31 | ForEach-Object {[byte](Get-Random -Max 256)}))
Write-Host "API_KEY: $ApiKey" -ForegroundColor Green
```

**En Bash (Git Bash o WSL):**
```bash
echo "JWT_SECRET: $(openssl rand -hex 32)"
echo "API_KEY: $(openssl rand -base64 32)"
```

### 2.2 Obtener Datos AWS

```bash
# Tu Account ID
aws sts get-caller-identity --query Account --output text
# Salida: 123456789012 (guarda esto como AWS_ACCOUNT_ID)

# Si ya existe tu role OIDC, obtener ARN
aws iam get-role --role-name github-oidc-role --query 'Role.Arn' --output text
# Salida: arn:aws:iam::123456789012:role/github-oidc-role
# (Si no existe, se crea automáticamente en Terraform)

# RDS datos (después de Terraform)
# Por ahora usa: admin para DB_USERNAME
```

### 2.3 Crear Secretos en GitHub

**Opción A: GitHub CLI (más fácil)**
```bash
# Estar en la raíz del proyecto
cd c:\Users\jorge\OneDrive\Escritorio\UTEM 11S\Trabajo de Título 1\desarrollo\Desarrollo-TT

# Crear secretos (reemplazar valores)
gh secret set AWS_ACCOUNT_ID --body "123456789012"
gh secret set AWS_ROLE_ARN --body "arn:aws:iam::123456789012:role/github-oidc-role"
gh secret set EKS_CLUSTER_NAME --body "desarrollo-tt-eks-cluster"
gh secret set DB_USERNAME --body "admin"
gh secret set DB_PASSWORD --body "TuContraseñaSegura123!"
gh secret set JWT_SECRET --body "a1b2c3d4e5f6..."
gh secret set API_KEY --body "aBcDeFgHiJk..."

# Verificar que se crearon
gh secret list
```

**Opción B: GitHub Web UI**
1. Ir a: https://github.com/tu-usuario/tu-repo/settings/secrets/actions
2. Click "New repository secret"
3. Ingresar cada uno:
   - Name: `AWS_ACCOUNT_ID` → Body: `123456789012`
   - Name: `AWS_ROLE_ARN` → Body: `arn:aws:iam::...`
   - (etc para cada secreto)

**Opción C: GitHub CLI con archivo**
```bash
# Crear archivo temporal (NO COMMITEAR)
cat > /tmp/secrets.txt << EOF
AWS_ACCOUNT_ID=123456789012
AWS_ROLE_ARN=arn:aws:iam::123456789012:role/github-oidc-role
EKS_CLUSTER_NAME=desarrollo-tt-eks-cluster
DB_USERNAME=admin
DB_PASSWORD=TuContraseña123!
JWT_SECRET=$(openssl rand -hex 32)
API_KEY=$(openssl rand -base64 32)
EOF

# Crear cada secreto
while IFS='=' read -r name value; do
  gh secret set "$name" --body "$value"
done < /tmp/secrets.txt

# Eliminar archivo
rm /tmp/secrets.txt
```

### 2.4 Verificar Secretos

```bash
# Listar todos
gh secret list

# Verificar uno específico (no muestra valor, solo si existe)
gh secret view DB_PASSWORD
```

**Verificación en GitHub Web:**
1. Settings > Secrets and variables > Actions > Secrets
2. Debe haber 7 secretos listados
3. No se puede ver el valor (solo "Updated X ago")

---

## FASE 3: PREPARAR TERRAFORM

### 3.1 Configurar Variables Terraform

**Copiar y editar env.tfvars:**
```bash
cd terraform/

# Copiar desde el ejemplo
cp env.tfvars.example env.tfvars

# Editar el archivo
# En Windows: notepad env.tfvars
# En Linux: nano env.tfvars
# En PowerShell: code env.tfvars

# Valores a configurar:
aws_region = "us-east-1"
project_name = "desarrollo-tt"
environment = "dev"  # o "prod"
instance_type = "t3.medium"
rds_instance_class = "db.t3.small"
db_username = "admin"
db_password = "TuContraseñaSegura123!"  # Debe coincidir con GitHub Secret
skip_final_snapshot = true  # true para dev, false para prod
create_dns_records = false  # true si tienes dominio registrado
domain_name = "tudominio.com"  # Tu dominio (solo si create_dns_records = true)
```

### 3.2 Inicializar Terraform

```bash
# Desde la carpeta terraform/
terraform init
# Salida esperada: "Terraform has been successfully configured!"
```

### 3.3 Validar Terraform

```bash
# Validar sintaxis
terraform validate
# Salida esperada: "Success! The configuration is valid."

# Ver qué se va a crear (sin crear nada)
terraform plan -var-file="env.tfvars" -out=tfplan
# Esto mostrará todo lo que se crea (VPC, EKS, RDS, ECR, etc)
```

**Validación:**
- ✓ Muestra plan sin errores
- ✓ Muestra 30-40 recursos a crear (VPC, subnets, EKS, RDS, ECR, etc)
- ✓ No hay error messages

---

## FASE 4: CREAR INFRAESTRUCTURA AWS (Terraform)

### 4.1 Aplicar Terraform

```bash
# Desde terraform/
terraform apply -var-file="env.tfvars"

# Confirmar: type 'yes' y Enter
# Esto demora ~20-30 minutos
```

**Monitoreo:**
```bash
# En otra terminal, ver progreso
aws eks list-clusters --region us-east-1
aws rds describe-db-clusters --region us-east-1
aws ec2 describe-vpcs --region us-east-1
```

### 4.2 Obtener Outputs de Terraform

```bash
# Cuando termine, ver outputs
terraform output

# Guardar para después:
# - eks_cluster_endpoint
# - rds_cluster_endpoint
# - ecr_repository_urls (para las 13 imágenes)
```

**Ejemplo de outputs:**
```
eks_cluster_endpoint = "https://XXXXX.eks.us-east-1.amazonaws.com"
rds_cluster_endpoint = "desarrollo-tt-cluster.XXXXX.us-east-1.rds.amazonaws.com"
ecr_repository_urls = {
  "aach-api" = "123456789012.dkr.ecr.us-east-1.amazonaws.com/desarrollo-tt-aach-api:latest"
  ...
}
```

### 4.3 Configurar kubectl

```bash
# Obtener credenciales del EKS
aws eks update-kubeconfig --name desarrollo-tt-eks-cluster --region us-east-1

# Verificar que funciona
kubectl cluster-info
kubectl get nodes
```

**Salida esperada:**
```
NAME                          STATUS   ROLES    AGE
ip-10-0-xxx-xxx.compute...    Ready    <none>   5m
ip-10-0-xxx-xxx.compute...    Ready    <none>   5m
```

---

## FASE 5: PREPARAR KUBERNETES MANIFESTS

### 5.1 Actualizar ConfigMap con RDS Endpoint

```bash
cd kubernetes/

# Editar configmap.yaml
# Cambiar: DB_HOST=rds.tudominio.com
# Por: DB_HOST=desarrollo-tt-cluster.XXXXX.us-east-1.rds.amazonaws.com
# (Copiar el valor de: terraform output rds_cluster_endpoint)
```

### 5.2 Actualizar Ingress con Certificado ACM

```bash
# Si usas dominio personalizado:
# Editar ingress.yaml
# Cambiar: annotations.alb.ingress.kubernetes.io/certificate-arn
# Por: el ARN real del certificado (terraform output acm_certificate_arn)

# Cambiar hosts:
# - host: tudominio.com → tu dominio real
# - host: www.tudominio.com
# - host: api.tudominio.com
```

### 5.3 Validar Manifests

```bash
# Validar YAML
yamllint .

# Validar contra cluster
kubectl apply -f . --dry-run=client
```

---

## FASE 6: PREPARAR PUSH A GITHUB

### 6.1 Verificar Cambios Locales

```bash
# Ver cambios
git status

# Debe haber:
# - terraform/env.tfvars (NO COMMITEAR - .gitignore debe excluirlo)
# - kubernetes/* (SÍ COMMITEAR)
# - .github/workflows/* (SÍ COMMITEAR)
```

### 6.2 Configurar .gitignore

```bash
# Asegurar que terraform/env.tfvars no se commitea
cat >> .gitignore << EOF

# Terraform
terraform/*.tfvars
terraform/.terraform/
terraform/tfplan
!terraform/*.tfvars.example

# AWS
.env
.env.local
*.pem
EOF

git add .gitignore
git commit -m "Update .gitignore for sensitive files"
```

### 6.3 Commit de Manifests y Workflows

```bash
# Agregar cambios
git add kubernetes/
git add .github/
git add terraform/*.tf
git add terraform/README.md
git add terraform/variables.tf

# Verificar que no está env.tfvars
git status | grep env.tfvars  # NO debe aparecer

# Commit
git commit -m "Add Kubernetes manifests and GitHub Actions workflows"

# Push
git push origin main
```

---

## FASE 7: MONITOREAR GITHUB ACTIONS

### 7.1 Ver Workflow Ejecutándose

1. Abrir: https://github.com/tu-usuario/tu-repo/actions
2. Ver "Build and Deploy" ejecutándose
3. Click en el workflow para ver detalles

### 7.2 Monitorear Build

El workflow debería:
1. **build-images** (2-3 minutos): Construir 13 Docker images
2. **push-to-ecr** (1 minuto): Verificar push a ECR
3. **deploy-to-eks** (5 minutos): Aplicar manifests a Kubernetes

### 7.3 Ver Logs en Tiempo Real

```bash
# En terminal local, mientras se ejecuta
# Ver si los pods se están iniciando
kubectl get pods -n desarrollo-tt -w

# Ver logs de un pod
kubectl logs -n desarrollo-tt deployment/obtener-permiso

# Ver eventos
kubectl get events -n desarrollo-tt --sort-by='.lastTimestamp'
```

### 7.4 Esperar a que Complete

**Signos de éxito:**
```
✓ build-images job: 13 images built successfully
✓ push-to-ecr job: All images pushed to ECR
✓ deploy-to-eks job: All deployments rolled out successfully
```

**Ver estado final:**
```bash
# Ver todos los pods
kubectl get pods -n desarrollo-tt
# Debe haber 26+ pods (2 réplicas x 13 deployments)

# Ver servicios
kubectl get svc -n desarrollo-tt
# Debe haber 13 servicios

# Ver ingress
kubectl get ingress -n desarrollo-tt
# Debe haber 1 ingress con ALB
```

---

## FASE 8: VALIDAR DEPLOYMENT

### 8.1 Verificar Pods

```bash
# Todos los pods deben estar Running
kubectl get pods -n desarrollo-tt

# Salida esperada (ejemplo):
# NAME                                     READY   STATUS    RESTARTS   AGE
# obtener-permiso-xxxxx                    1/1     Running   0          2m
# panel-decisiones-xxxxx                   1/1     Running   0          2m
# aach-api-xxxxx                           1/1     Running   0          2m
# ... (13 deployments total)
```

### 8.2 Verificar que las APIs responden

```bash
# Obtener IP del ALB (puede demorar unos minutos)
kubectl get ingress -n desarrollo-tt -o wide
# Copiar ADDRESS (será un ALB DNS name)

# Testear un endpoint
curl http://<ALB-DNS>/aach/docs
# Debe mostrar Swagger UI de FastAPI
```

### 8.3 Verificar RDS Conectividad

```bash
# Port-forward a un pod para testear DB
kubectl port-forward -n desarrollo-tt deployment/aach-api 8000:8000

# En otra terminal
curl http://localhost:8000/health
# Debe responder que la base de datos está conectada (si el endpoint implementa /health)
```

### 8.4 Ver Logs de Aplicaciones

```bash
# Frontend
kubectl logs -n desarrollo-tt deployment/obtener-permiso -f

# API
kubectl logs -n desarrollo-tt deployment/aach-api -f

# Ver últimos 50 líneas
kubectl logs -n desarrollo-tt deployment/aach-api --tail=50
```

---

## FASE 9: CONFIGURAR DOMINIO (OPCIONAL)

Si configuraste `create_dns_records = true` en Terraform:

### 9.1 Actualizar Registrador de Dominios

```bash
# Obtener nameservers de Route 53
terraform output nameservers

# En tu registrador (Namecheap, GoDaddy, etc):
# 1. Custom Nameservers
# 2. Ingresar los 4 nameservers de Route 53
# 3. Guardar cambios (puede demorar 24-48 horas)
```

### 9.2 Verificar Propagación

```bash
# Esperar 24-48 horas, luego:
nslookup tudominio.com
dig tudominio.com
# Debe resolver a la IP del ALB
```

### 9.3 Testear HTTPS

```bash
# Una vez que el dominio propague
curl https://tudominio.com
curl https://api.tudominio.com/docs
```

---

## FASE 10: INICIALIZAR BASES DE DATOS

### 10.1 Conectar a RDS

```bash
# Obtener endpoint RDS
RDS_ENDPOINT=$(terraform output -raw rds_cluster_endpoint)

# Conectar con MySQL client
mysql -h $RDS_ENDPOINT -u admin -p
# Ingresar contraseña de db_password

# Ver bases de datos
SHOW DATABASES;
# Debe mostrar las 9 bases de datos: aach_db, carabineros_db, etc
```

### 10.2 Importar Schemas (si los tienes)

```bash
# Para cada API que tiene SQL script:
mysql -h $RDS_ENDPOINT -u admin -p aach_db < api-aach/script.sql
mysql -h $RDS_ENDPOINT -u admin -p carabineros_db < api-carabineros/script.sql
# ... etc
```

### 10.3 Verificar Tablas

```bash
mysql -h $RDS_ENDPOINT -u admin -p aach_db
USE aach_db;
SHOW TABLES;
```

---

## FASE 11: TESTING POST-DEPLOYMENT

### 11.1 Health Checks

```bash
# Verificar que todos los endpoints responden

# Frontends (Next.js)
curl -I https://tudominio.com  # obtener-permiso
curl -I https://tudominio.com:8001  # panel-decisiones

# APIs (Swagger)
curl -I https://api.tudominio.com/docs
curl -I https://api.tudominio.com/aach/docs
curl -I https://api.tudominio.com/carabineros/docs

# O localhost si no tienes dominio
kubectl port-forward -n desarrollo-tt svc/obtener-permiso 8080:8002
curl http://localhost:8080
```

### 11.2 Smoke Tests

```bash
# Testear endpoints básicos de APIs
curl https://api.tudominio.com/aach/
curl https://api.tudominio.com/carabineros/
curl https://api.tudominio.com/mtt/

# Cada uno debe retornar un status 200 OK o 404 (si no hay ruta raíz)
# NO debe haber 500 Server Error
```

### 11.3 Database Connectivity

```bash
# Verificar que las aplicaciones pueden conectarse a RDS
# Ver logs de los pods
kubectl logs -n desarrollo-tt deployment/aach-api | grep -i "database\|connected\|error"
```

---

## FASE 12: MONITOREO CONTINUO

### 12.1 Watch Resources

```bash
# Terminal 1: Monitorear pods
kubectl get pods -n desarrollo-tt -w

# Terminal 2: Monitorear nodos
kubectl get nodes -w

# Terminal 3: Ver eventos
kubectl get events -n desarrollo-tt --sort-by='.lastTimestamp' -w
```

### 12.2 Ver Métricas (si tienes Prometheus)

```bash
# Si instalaste Prometheus/Grafana
kubectl get svc -A | grep prometheus
# Acceder a Grafana en http://prometheus-svc:3000
```

### 12.3 Ver Logs Centralizados

```bash
# Si tienes CloudWatch Logs configurado
aws logs list-log-groups --region us-east-1
aws logs tail /aws/eks/desarrollo-tt-eks-cluster --follow
```

---

## TROUBLESHOOTING

### Problema: Pod stuck in "Pending"
```bash
kubectl describe pod <pod-name> -n desarrollo-tt
# Ver qué recurso falta (CPU, memoria, nodo, etc)
```

### Problema: CrashLoopBackOff
```bash
kubectl logs <pod-name> -n desarrollo-tt
# Ver el error específico en los logs
```

### Problema: 502 Bad Gateway
```bash
# Verificar que los servicios están healthy
kubectl get svc -n desarrollo-tt
kubectl get endpoints -n desarrollo-tt
```

### Problema: No se conecta a RDS
```bash
# Verificar security groups
aws ec2 describe-security-groups --region us-east-1 | grep desarrollo-tt

# Verificar que RDS está disponible
aws rds describe-db-clusters --region us-east-1
```

---

## CHECKLIST FINAL

Antes de considerar el deployment exitoso:

- [ ] Todos los 13 pods están en estado "Running"
- [ ] Todos los servicios tienen "Endpoints" asignados
- [ ] El ingress tiene "ADDRESS" (ALB) asignado
- [ ] Los endpoints responden a HTTP/HTTPS
- [ ] Las aplicaciones se conectan a RDS sin errores
- [ ] Los logs no muestran errores críticos
- [ ] El ALB responde con 200 OK a requests

**Congratulations! 🎉 El deployment está completamente operacional.**

---

## MANTENIMIENTO FUTURO

### Auto-Scaling
```bash
# Verificar que los nodos se escalan automáticamente
# Si hay más pods que recursos, EKS debe crear nuevos nodos
kubectl get nodes -w
```

### Updates y Patches
```bash
# Para actualizar una imagen:
# 1. Push nuevo código a GitHub
# 2. El workflow construirá nueva imagen
# 3. Los pods se actualizarán automáticamente con el nuevo SHA

# Ver historial de deployments
kubectl rollout history deployment/aach-api -n desarrollo-tt

# Rollback si algo falla
kubectl rollout undo deployment/aach-api -n desarrollo-tt
```

### Backup y Restore
```bash
# RDS hace backups automáticos (retención de 7 días)
aws rds describe-db-snapshots --region us-east-1

# Para restaurar desde un snapshot
aws rds restore-db-cluster-from-snapshot \
  --db-cluster-identifier desarrollo-tt-restored \
  --snapshot-identifier <snapshot-id>
```
