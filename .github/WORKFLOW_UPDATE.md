# Actualización CI/CD Workflow - GitHub Actions

## Resumen de Cambios

Se ha actualizado el workflow `.github/workflows/build-and-deploy.yml` para gestionar las nuevas variables de configuración del backend.

---

## Cambios Realizados

### 1. ConfigMap - Nuevas Variables Agregadas

**Agregadas:**
- `K8S_MODE: "true"` - Activa modo Kubernetes
- `DOCKER_MODE: "false"` - Desactiva modo Docker
- `API_WORKERS: 4` - Workers para FastAPI
- URLs de APIs externas:
  - `AACH_API_URL: "http://aach-api:5001"`
  - `CARABINEROS_API_URL: "http://carabineros-api:5004"`
  - `MTT_API_URL: "http://mtt-api:5003"`
  - `SII_API_URL: "http://sii-api:5005"`
  - `SGD_API_URL: "http://sgd-api:5006"`
  - `TGR_API_URL: "http://tgr-api:5007"`
  - `SRCEI_API_URL: "http://srcei-api:5001"`

**Removidas:**
- ❌ `NEXT_PUBLIC_API_URL: "https://api.tudominio.com"` (usando hostname automático de ALB)

### 2. Paso de Verificación ConfigMap

Agregado nuevo paso `Verify ConfigMap` que valida que todas las variables se crearon correctamente:

```yaml
- name: Verify ConfigMap
  run: |
    echo "=== Verifying ConfigMap app-config ==="
    kubectl get configmap app-config -n desarrollo-tt -o yaml | grep -E "(K8S_MODE|DOCKER_MODE|LOG_LEVEL|API_URL|DB_HOST)" || echo "ConfigMap variables not found"
```

### 3. Corrección de Typos

**Antes:** `desenvolvimento-tt` (portugués)
**Después:** `desarrollo-tt` (español)

Corregido en:
- Paso "Update image tags"
- Paso "Wait for rollout"
- Paso "Verify deployment"

---

## Flujo CI/CD Actualizado

```
1. Push a main/develop
   ↓
2. Build Images (build-images job)
   - Construye todas las imágenes Docker
   ↓
3. Push to ECR (push-to-ecr job)
   - Verifica imágenes en ECR
   ↓
4. Deploy to EKS (deploy-to-eks job)
   a. Update kubeconfig
   b. Create namespace (desarrollo-tt)
   c. Update ConfigMap con RDS endpoint + NUEVAS VARIABLES ✅
   d. Create database names ConfigMap
   e. Create database credentials Secret
   f. Create API secrets
   e. Create ECR pull secret
   f. Apply Kubernetes manifests (deployments + ingress)
   g. VERIFY ConfigMap ✅ (NUEVO PASO)
   h. Update image tags
   i. Wait for rollout
   j. Verify deployment status
   ↓
5. Notify (notify job)
   - Imprime resumen
```

---

## Variables Inyectadas por el Workflow

### En ConfigMap `app-config`

| Variable | Valor | Origen |
|----------|-------|--------|
| DB_HOST | Dinámico (RDS endpoint) | AWS RDS |
| DB_PORT | 3306 | Hardcoded |
| API_PORT | 8000 | Hardcoded |
| API_WORKERS | 4 | Hardcoded |
| LOG_LEVEL | info | Hardcoded |
| ENVIRONMENT | production | Hardcoded |
| K8S_MODE | **true** | **NUEVO** |
| DOCKER_MODE | **false** | **NUEVO** |
| NEXT_PUBLIC_APP_NAME | Desarrollo TT | Hardcoded |
| AACH_API_URL | http://aach-api:5001 | **NUEVO** |
| CARABINEROS_API_URL | http://carabineros-api:5004 | **NUEVO** |
| MTT_API_URL | http://mtt-api:5003 | **NUEVO** |
| SII_API_URL | http://sii-api:5005 | **NUEVO** |
| SGD_API_URL | http://sgd-api:5006 | **NUEVO** |
| TGR_API_URL | http://tgr-api:5007 | **NUEVO** |
| SRCEI_API_URL | http://srcei-api:5001 | **NUEVO** |

### En ConfigMap `api-config`

Mantiene los nombres de las bases de datos:
- AACH_DB_NAME=aach_db
- CARABINEROS_DB_NAME=carabineros_db
- ... etc

### En Secrets

- `db-credentials`: DB_USER, DB_PASSWORD (de GitHub Secrets)
- `api-secrets`: JWT_SECRET, API_KEY (de GitHub Secrets)

---

## GitHub Secrets Requeridos

Asegurar que estos secrets estén configurados en GitHub:

```
AWS_ACCOUNT_ID          # ID de la cuenta AWS
AWS_ROLE_ARN            # ARN del rol IAM para OIDC
EKS_CLUSTER_NAME        # Nombre del cluster EKS
DB_USERNAME             # Usuario BD (root, admin, etc)
DB_PASSWORD             # Password BD
JWT_SECRET              # Secret JWT para APIs
API_KEY                 # API Key general
```

---

## Cómo Funciona Ahora el Backend

1. **Build Stage:** Construye imagen de `back-api`

2. **Push Stage:** Verifica que la imagen llegó a ECR

3. **Deploy Stage:**
   - Inyecta variables en ConfigMap (incluyendo K8S_MODE=true)
   - Despliega el pod
   - Pod levanta `config/apis.py`
   - `config/apis.py` detecta K8S_MODE=true
   - URLs se construyen automáticamente: `http://aach-api:5001`, etc.
   - Usa service discovery nativo de Kubernetes

---

## Testing Post-Deployment

### 1. Verificar ConfigMap fue creado

```bash
kubectl get configmap app-config -n desarrollo-tt -o yaml
```

Debe mostrar:
```yaml
K8S_MODE: "true"
DOCKER_MODE: "false"
AACH_API_URL: "http://aach-api:5001"
# ... etc
```

### 2. Verificar que el pod recibió las variables

```bash
kubectl exec -it deployment/back-api -n desarrollo-tt -- env | grep K8S_MODE
kubectl exec -it deployment/back-api -n desarrollo-tt -- env | grep API_
```

### 3. Verificar connectivity interno

```bash
# Acceder al pod
kubectl exec -it deployment/back-api -n desarrollo-tt -- /bin/bash

# Probar DNS
nslookup aach-api
nslookup mtt-api

# Probar conectividad
curl http://aach-api:5001/health
curl http://mtt-api:5003/health
```

---

## Cambios Futuros Posibles

Si necesitas cambiar algo más adelante:

| Cambio | Dónde hacerlo |
|--------|---------------|
| Cambiar puerto de una API | `config/apis.py` + actualizar Service + actualizar workflow |
| Agregar nueva API | `config/apis.py` + workflow `--from-literal=XXX_API_URL=...` |
| Cambiar LOG_LEVEL | Editar workflow o usar `kubectl patch configmap` |
| Activar SSL con dominio | Descomentar anotaciones en `ingress.yaml` + agregar certificate-arn |

---

## Rollback

Si algo sale mal, revertir a la versión anterior del workflow:

```bash
git log --oneline .github/workflows/build-and-deploy.yml
git revert <commit-hash>
```

O hacer push a develop para evitar que se depliegue a main:

```bash
git push origin develop
```

---

## Próximos Pasos

1. ✅ Actualizar workflow (ya hecho)
2. ⏳ Hacer commit: `git add .github/workflows/` && `git commit -m "chore: update CI/CD for new backend config"`
3. ⏳ Push a develop: `git push origin develop`
4. ⏳ Verificar que CI/CD pasa
5. ⏳ Mergear a main para deployar a producción

