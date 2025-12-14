# Actualización Ingress - Usar AWS ALB Hostname Automático

## Resumen de Cambios

Se han actualizado los manifiestos de Kubernetes para usar el hostname automático que AWS entrega por defecto en lugar de dominios personalizados.

---

## Cambios Realizados

### 1. `kubernetes/ingress.yaml`

**Antes:**
```yaml
spec:
  rules:
  - host: tudominio.com
    http:
      paths:
      - path: /
  
  - host: www.tudominio.com
    http:
      paths:
      - path: /
  
  - host: api.tudominio.com
    http:
      paths:
      - path: /aach
      - path: /carabineros
      # ... etc
```

**Después:**
```yaml
spec:
  rules:
  # Panel de Decisiones (rutas por path)
  - http:
      paths:
      - path: /
        backend:
          service:
            name: panel-decisiones-app
  
  # API Backend y Servicios (rutas por path)
  - http:
      paths:
      - path: /aach
      - path: /carabineros
      # ... etc
```

**Cambios específicos:**
- ❌ Eliminados: `- host: tudominio.com`
- ❌ Eliminados: `- host: www.tudominio.com`
- ❌ Eliminados: `- host: api.tudominio.com`
- ✅ Ahora usa routing por **PATH** en un único hostname (AWS ALB automático)
- ⚠️ Comentadas: Anotaciones SSL y certificado ARN

### 2. `kubernetes/configmap.yaml`

**Antes:**
```yaml
NEXT_PUBLIC_API_URL: "https://api.tudominio.com"
```

**Después:**
```yaml
# NOTA: Usar el hostname automático de AWS ALB
# NEXT_PUBLIC_API_URL será obtenido del ALB hostname
# Ej: http://<alb-hostname>/back
# NEXT_PUBLIC_API_URL: "https://api.tudominio.com"
```

---

## Estructura de Rutas Post-Actualización

```
AWS ALB Hostname (ej: desarrollo-tt-alb-123456789.us-east-1.elb.amazonaws.com)
│
├── /              → panel-decisiones-app (frontend)
│
└── /back          → back-api
    /aach          → aach-api
    /carabineros   → carabineros-api
    /mtt           → mtt-api
    /prt           → prt-api
    /sgd           → sgd-api
    /sii           → sii-api
    /srcei         → srcei-api
    /tgr           → tgr-api
```

---

## Cómo Obtener el Hostname del ALB

Después de desplegar, obtener el hostname automático:

```bash
# Obtener el hostname del ALB
kubectl get ingress -n desarrollo-tt -o jsonpath='{.items[0].status.loadBalancer.ingress[0].hostname}'

# O con más detalles
kubectl describe ingress main-ingress -n desarrollo-tt
```

**Ejemplo de salida:**
```
desarrollo-tt-alb-123456789.us-east-1.elb.amazonaws.com
```

---

## Cómo Usar las Rutas

Con el hostname automático de AWS ALB, acceder a los servicios así:

| Servicio | URL |
|----------|-----|
| Frontend (Panel) | `http://desarrollo-tt-alb-xxx.us-east-1.elb.amazonaws.com/` |
| Backend API | `http://desarrollo-tt-alb-xxx.us-east-1.elb.amazonaws.com/back` |
| AACH API | `http://desarrollo-tt-alb-xxx.us-east-1.elb.amazonaws.com/aach` |
| Carabineros API | `http://desarrollo-tt-alb-xxx.us-east-1.elb.amazonaws.com/carabineros` |
| MTT API | `http://desarrollo-tt-alb-xxx.us-east-1.elb.amazonaws.com/mtt` |
| ... etc | ... |

---

## Actualizar Configuración de Frontend

En los archivos de frontend (`panel-decisiones`, `obtener-permiso`, etc), actualizar:

**Antes:**
```javascript
const API_URL = "https://api.tudominio.com/back"
```

**Después:**
```javascript
// Obtener el hostname del ALB dinámicamente
const ALB_HOSTNAME = window.location.origin
const API_URL = `${ALB_HOSTNAME}/back`
```

O setear como variable de entorno en el deployment:

```yaml
env:
- name: NEXT_PUBLIC_API_URL
  value: "http://desarrollo-tt-alb-xxx.us-east-1.elb.amazonaws.com/back"
```

---

## Anotaciones SSL Comentadas

Las siguientes anotaciones están **comentadas** por seguridad. Si necesitas SSL:

```yaml
# alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:123456789:certificate/xxxxx
# alb.ingress.kubernetes.io/ssl-policy: ELBSecurityPolicy-TLS-1-2-2017-01
# alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
# alb.ingress.kubernetes.io/ssl-redirect: '443'
```

Para activar SSL:
1. Crear un certificado en **AWS Certificate Manager**
2. Descomentar las anotaciones
3. Reemplazar `xxxxx` con el ARN del certificado
4. Aplicar: `kubectl apply -f kubernetes/ingress.yaml`

---

## Ventajas de esta Configuración

| Ventaja | Descripción |
|---------|------------|
| **Sin DNS personalizado** | Usa hostname automático de AWS |
| **Escalable** | Routing por path para múltiples servicios |
| **Flexible** | Fácil agregar nuevos servicios con nuevos paths |
| **Low Cost** | Sin necesidad de certificado SSL personalizado (por ahora) |
| **Simple** | Una única entrada de ALB para todo |

---

## Próximos Pasos

1. ✅ Actualizar manifiestos (ya hecho)
2. ⏳ Aplicar cambios: `kubectl apply -f kubernetes/`
3. ⏳ Esperar a que ALB esté listo (3-5 minutos)
4. ⏳ Obtener hostname: `kubectl get ingress -n desarrollo-tt`
5. ⏳ Actualizar variables en frontend apps con el hostname correcto
6. ⏳ Testear endpoints

---

## Troubleshooting

### Ingress sin hostname asignado

**Síntoma:** `kubectl get ingress` muestra IP/hostname vacío

**Solución:**
```bash
# Esperar más tiempo (ALB tarda 3-5 minutos)
kubectl get ingress -n desarrollo-tt -w

# Ver logs del AWS Load Balancer Controller
kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
```

### Rutas no funcionan

**Síntoma:** 404 en las rutas

**Solución:**
1. Verificar que los servicios existen: `kubectl get svc -n desarrollo-tt`
2. Verificar selector correcto: `kubectl describe svc <service-name> -n desarrollo-tt`
3. Ver eventos del ingress: `kubectl describe ingress main-ingress -n desarrollo-tt`

---

## Rollback

Si necesitas volver a usar dominios personalizados:

```bash
# Revert ingress
kubectl rollout undo ingress main-ingress -n desarrollo-tt
```

