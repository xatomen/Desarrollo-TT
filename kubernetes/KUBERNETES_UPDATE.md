# Actualización Manifiestos Kubernetes - Backend APIs

## Resumen de Cambios

Se han actualizado los manifiestos de Kubernetes para soportar la nueva configuración centralizada de APIs del backend.

### Archivos Actualizados

1. **`kubernetes/configmap.yaml`**
   - Agregadas variables para Kubernetes Mode
   - Agregadas URLs de APIs externas con service discovery

2. **`kubernetes/deployments/back-api.yaml`**
   - Agregadas variables de entorno para K8S_MODE, DOCKER_MODE
   - Agregada variable LOG_LEVEL

---

## Detalles de Cambios

### 1. ConfigMap - Variables Globales

**Nuevas variables agregadas:**

```yaml
# Backend API Configuration (Kubernetes Mode)
K8S_MODE: "true"
DOCKER_MODE: "false"

# APIs Endpoints (for service discovery in Kubernetes)
AACH_API_URL: "http://aach-api:5001"
CARABINEROS_API_URL: "http://carabineros-api:5004"
MTT_API_URL: "http://mtt-api:5003"
SII_API_URL: "http://sii-api:5005"
SGD_API_URL: "http://sgd-api:5006"
TGR_API_URL: "http://tgr-api:5007"
SRCEI_API_URL: "http://srcei-api:5001"
```

**Propósito:**
- `K8S_MODE=true`: Activa modo Kubernetes en `config/apis.py`
- `DOCKER_MODE=false`: Desactiva modo Docker
- URLs de APIs: Permiten service discovery automático via DNS de Kubernetes

### 2. Back API Deployment - Variables de Entorno

**Nuevas variables en el contenedor:**

```yaml
env:
- name: K8S_MODE
  valueFrom:
    configMapKeyRef:
      name: app-config
      key: K8S_MODE
      
- name: DOCKER_MODE
  valueFrom:
    configMapKeyRef:
      name: app-config
      key: DOCKER_MODE
      
- name: LOG_LEVEL
  valueFrom:
    configMapKeyRef:
      name: app-config
      key: LOG_LEVEL
```

**Beneficios:**
- Configuración centralizada en ConfigMap
- Fácil cambio sin actualizar deployment
- Consistencia con otras variables

---

## Service Discovery en Kubernetes

Con estas configuraciones, el backend automáticamente descubre los servicios:

```
back-api → aach-api:5001        (AACH)
        → carabineros-api:5004  (Carabineros)
        → mtt-api:5003          (MTT)
        → sii-api:5005          (SII)
        → sgd-api:5006          (SGD)
        → tgr-api:5007          (TGR)
        → srcei-api:5001        (SRCEI)
        → mysql:3306            (Base de datos)
```

---

## Requisitos Previos

Asegurar que todos los servicios API tengan un **Service** que coincida con los nombres:

```yaml
# Ejemplo para aach-api
apiVersion: v1
kind: Service
metadata:
  name: aach-api
  namespace: desarrollo-tt
spec:
  type: ClusterIP
  selector:
    app: aach-api
  ports:
  - port: 5001
    targetPort: 5001
    protocol: TCP
```

Verificar que cada API tiene su correspondiente Service con el nombre correcto.

---

## Validación Post-Actualización

### 1. Verificar ConfigMap
```bash
kubectl get configmap app-config -n desarrollo-tt -o yaml | grep -A 15 "K8S_MODE"
```

Debe mostrar:
```yaml
K8S_MODE: "true"
DOCKER_MODE: "false"
```

### 2. Verificar Deployment
```bash
kubectl get deployment back-api -n desarrollo-tt -o yaml | grep -A 5 "K8S_MODE"
```

### 3. Verificar Logs del Pod
```bash
kubectl logs -f deployment/back-api -n desarrollo-tt
```

Buscar mensajes que confirmen:
```
K8S_MODE: True
DOCKER_MODE: False
API_AACH: http://aach-api:5001
```

### 4. Probar Conectividad
```bash
# Acceder al pod
kubectl exec -it pod/back-api-xxxxx -n desarrollo-tt -- /bin/bash

# Probar DNS
nslookup aach-api
nslookup mysql

# Probar conectividad
curl -v http://aach-api:5001/health
```

---

## Rollback

Si necesitas revertir los cambios:

```bash
# Revert configmap
kubectl rollout undo configmap/app-config -n desarrollo-tt

# Revert deployment
kubectl rollout undo deployment/back-api -n desarrollo-tt
```

---

## Próximos Pasos

1. ✅ Actualizar ConfigMap con nuevas variables
2. ✅ Actualizar Back API Deployment
3. ⏳ Aplicar cambios: `kubectl apply -f kubernetes/`
4. ⏳ Monitorear logs: `kubectl logs -f deployment/back-api -n desarrollo-tt`
5. ⏳ Validar endpoints: Probar endpoints del backend

---

## Notas Importantes

⚠️ **Importante:**
- Asegurar que TODOS los servicios API tengan su correspondiente **Service** en Kubernetes
- Los nombres de los servicios debe coincidir con las URLs en el ConfigMap
- Las variables K8S_MODE y DOCKER_MODE DEBEN estar correctamente seteadas
- Si las APIs no responden, verificar DNS del cluster: `kubectl get svc -n desarrollo-tt`

---

## Contacto

Para preguntas sobre la configuración:
- Ver: [kubernetes/README.md](kubernetes/README.md)
- Ver: [back/ENVIRONMENT_VARIABLES.md](back/ENVIRONMENT_VARIABLES.md)

