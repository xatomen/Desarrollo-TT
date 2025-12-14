# Validación Pre-Deployment del Workflow

## 1. Validar Sintaxis YAML

### Con yamllint (recomendado)
```bash
# Instalar yamllint si no lo tienes
pip install yamllint

# Validar syntax del workflow
yamllint .github/workflows/build-and-deploy.yml
yamllint .github/workflows/infrastructure-management.yml

# Validar todo
yamllint .github/workflows/
```

### Con python (sin instalar)
```bash
python -c "import yaml; yaml.safe_load(open('.github/workflows/build-and-deploy.yml'))"
python -c "import yaml; yaml.safe_load(open('.github/workflows/infrastructure-management.yml'))"
```

### Con PowerShell (Windows)
```powershell
# Validar YAML básico
(Get-Content .github\workflows\build-and-deploy.yml) | ConvertFrom-Json
```

## 2. Validación del Workflow en GitHub

### Pre-requisitos
- GitHub CLI instalado (`choco install gh` en Windows)
- Estar autenticado: `gh auth login`

### Listar workflows disponibles
```bash
gh workflow list
```

### Ver detalles de workflow
```bash
gh workflow view build-and-deploy.yml
gh workflow view infrastructure-management.yml
```

## 3. Verificar Secretos Configurados

```bash
# Listar todos los secretos
gh secret list

# Salida esperada:
# NAME                   UPDATED
# API_KEY                Jan 1, 2025
# AWS_ACCOUNT_ID         Jan 1, 2025
# AWS_ROLE_ARN           Jan 1, 2025
# DB_PASSWORD            Jan 1, 2025
# DB_USERNAME            Jan 1, 2025
# EKS_CLUSTER_NAME       Jan 1, 2025
# JWT_SECRET             Jan 1, 2025
```

## 4. Validar Estructura de Archivos

```bash
# Verificar que todos los archivos necesarios existen
ls -la .github/workflows/
ls -la kubernetes/deployments/
ls -la terraform/
```

### Checklist de archivos:
- ✓ `.github/workflows/build-and-deploy.yml`
- ✓ `.github/workflows/infrastructure-management.yml`
- ✓ `.github/workflows/SETUP.md`
- ✓ `kubernetes/configmap.yaml`
- ✓ `kubernetes/secrets.yaml`
- ✓ `kubernetes/ingress.yaml`
- ✓ `kubernetes/deployments/*.yaml` (13 archivos)
- ✓ `terraform/main.tf`
- ✓ `terraform/variables.tf`
- ✓ `terraform/provider.tf`
- ✓ `terraform/outputs.tf`
- ✓ `.env.example` (en cada aplicación)

## 5. Validar Terraform

```bash
cd terraform/

# Inicializar terraform
terraform init

# Validar sintaxis
terraform validate

# Plan sin aplicar (verificar qué se va a crear)
terraform plan -var-file="env.tfvars.example" -out=tfplan

# Verificar que no hay errores
terraform validate
```

## 6. Validar Dockerfiles

### Sintaxis básica
```bash
# Verificar que cada Dockerfile es válido
docker build --dry-run -t test obtener-permiso/
docker build --dry-run -t test panel-decisiones/
docker build --dry-run -t test api-aach/api/
# ... etc para cada API
```

### Sin instalar Docker (validación simple)
```bash
# Verificar que existen
ls api-*/api/Dockerfile
ls obtener-permiso/Dockerfile
ls panel-decisiones/Dockerfile
ls app-fiscalizadores/Dockerfile
ls app-propietarios/Dockerfile

# Verificar que tienen las líneas clave
grep "FROM" */Dockerfile */api/Dockerfile
grep "EXPOSE" */Dockerfile */api/Dockerfile
```

## 7. Validar Kubernetes Manifests

```bash
# Validar YAML de manifests
yamllint kubernetes/

# O con python
python -c "import yaml; yaml.safe_load_all(open('kubernetes/configmap.yaml'))"
python -c "import yaml; yaml.safe_load_all(open('kubernetes/ingress.yaml'))"
python -c "import yaml; yaml.safe_load_all(open('kubernetes/deployments/obtener-permiso.yaml'))"
```

### Validar con kubectl (sin cluster)
```bash
# Verificar manifests contra schema (requiere kubectl)
kubectl apply -f kubernetes/deployments/ --dry-run=client -o yaml
kubectl apply -f kubernetes/ingress.yaml --dry-run=client -o yaml
```

## 8. Checklist Pre-Push

Antes de hacer `git push`, verifica:

### Configuración
- [ ] `AWS_ACCOUNT_ID` configurado en GitHub Secrets
- [ ] `AWS_ROLE_ARN` configurado en GitHub Secrets
- [ ] `EKS_CLUSTER_NAME` configurado en GitHub Secrets
- [ ] `DB_USERNAME` configurado en GitHub Secrets
- [ ] `DB_PASSWORD` configurado en GitHub Secrets
- [ ] `JWT_SECRET` configurado en GitHub Secrets
- [ ] `API_KEY` configurado en GitHub Secrets

### Código
- [ ] Terraform válido (`terraform validate` sin errores)
- [ ] Dockerfiles existen en todas las aplicaciones
- [ ] Kubernetes manifests son válido YAML
- [ ] `.env.example` presente en todas las apps
- [ ] No hay secretos hardcodeados en el código

### Git
- [ ] No hay cambios locales pendientes
- [ ] Rama actual es `main` o `develop`
- [ ] Último commit es limpio

```bash
# Checklist automatizado
git status          # Debe estar limpio
git log --oneline -5  # Ver últimos commits
```

## 9. Simular Ejecución Local

### Crear archivo de test
```bash
# Crear archivo test.yml que simule el workflow
cat > test-workflow.yml << 'EOF'
name: Test Build
on: push

jobs:
  test-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Test Docker Build
        run: |
          echo "Simulando build de obtener-permiso..."
          echo "FROM node:22-alpine" > Dockerfile.test
          docker build -f Dockerfile.test .
          
      - name: Test Kubernetes Manifests
        run: |
          apt-get update && apt-get install -y yamllint
          yamllint kubernetes/
EOF
```

## 10. Validación Final Antes de Push

```bash
#!/bin/bash
# Script de validación completa

echo "=== VALIDACIÓN PRE-DEPLOYMENT ==="

# 1. Terraform
echo "1. Validando Terraform..."
cd terraform
terraform validate || exit 1
cd ..

# 2. Dockerfiles
echo "2. Verificando Dockerfiles..."
ls -q */Dockerfile api-*/api/Dockerfile || exit 1

# 3. Kubernetes
echo "3. Validando Kubernetes..."
yamllint kubernetes/ || exit 1

# 4. YAML del workflow
echo "4. Validando workflows..."
python -c "import yaml; yaml.safe_load(open('.github/workflows/build-and-deploy.yml'))" || exit 1

# 5. Secretos
echo "5. Verificando secretos..."
gh secret list | grep -q "AWS_ROLE_ARN" || exit 1
gh secret list | grep -q "DB_PASSWORD" || exit 1

echo ""
echo "✓ TODAS LAS VALIDACIONES PASARON"
echo "Listo para hacer: git push"
```

## 11. Errores Comunes y Soluciones

### Error: "yamllint: command not found"
```bash
pip install yamllint
```

### Error: "terraform validate" falla
- Revisar que `terraform/provider.tf` está correcto
- Revisar indentación en `main.tf`
- Buscar variables indefinidas en `variables.tf`

### Error: Secret not found en workflow
- Verificar que el nombre es exacto (case-sensitive)
- Ir a Settings > Secrets and variables > Actions
- Usar `gh secret list` para verificar

### Error: Kubernetes manifest validation falla
- Verificar apiVersion (debe ser v1, apps/v1, etc)
- Verificar kind (Deployment, Service, Ingress, etc)
- Verificar indentación (debe ser YAML válido)

## 12. Próximos Pasos Después del Push

1. **Ir a Actions en GitHub:**
   - Abrír: https://github.com/tu-usuario/tu-repo/actions
   - Ver workflow "Build and Deploy" ejecutándose

2. **Monitorear el build:**
   - Esperar ~2-3 minutos para que construya 13 imágenes
   - Ver logs en "build-images" job
   - Verificar que push a ECR fue exitoso

3. **Verificar deployment a EKS:**
   - Ver logs de "deploy-to-eks" job
   - Buscar "Rollout successful" messages
   - Verificar "All pods healthy"

4. **En caso de error:**
   - Ver logs completos del workflow
   - Copiar mensaje de error
   - Revisar este documento para la solución

## 13. Monitoreo Post-Deployment

```bash
# Después de que el workflow complete

# Ver estado de pods
kubectl get pods -n desarrollo-tt

# Ver logs de un deployment
kubectl logs -n desarrollo-tt deployment/obtener-permiso

# Ver servicios
kubectl get svc -n desarrollo-tt

# Ver ingress
kubectl get ingress -n desarrollo-tt

# Ver events (últimos eventos)
kubectl get events -n desarrollo-tt --sort-by='.lastTimestamp'
```

## 14. Rollback en Caso de Problemas

```bash
# Si algo falla en el deployment:

# Opción 1: Volver a la versión anterior
kubectl rollout undo deployment/obtener-permiso -n desarrollo-tt

# Opción 2: Ver historial de rollouts
kubectl rollout history deployment/obtener-permiso -n desarrollo-tt

# Opción 3: Re-ejecutar el workflow desde GitHub Actions
# (Buscar en Actions > Workflow > Re-run all jobs)
```
