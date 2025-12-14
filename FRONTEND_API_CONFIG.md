# Actualización API Config - Frontend Apps

## Resumen de Cambios

Se han actualizado todos los archivos `config/api.ts` en las aplicaciones frontend para funcionar con el **hostname automático de AWS ALB** en lugar de URLs hardcodeadas.

---

## Cambios en Archivos TypeScript

### Archivos Actualizados

- ✅ `obtener-permiso/config/api.ts`
- ✅ `panel-decisiones/config/api.ts`
- ✅ `app-fiscalizadores/config/api.ts`
- ✅ `app-propietarios/config/api.ts`

### Antes

```typescript
const API_CONFIG = {
  // URLs hardcodeadas específicas
  SRCEI: `https://api-srcei.jorgegallardo.studio/`,
  PRT: `https://api-prt.jorgegallardo.studio/`,
  AACH: `https://api-aach.jorgegallardo.studio/`,
  // ... etc
};
```

### Después

```typescript
// Detecta automáticamente el hostname
const getApiBase = (): string => {
  // Si hay variable de entorno, usar esa
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  // En browser, usar window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  return 'http://localhost:3000';
};

const API_BASE = getApiBase();

const API_CONFIG = {
  // Rutas por PATH (funcionan en cualquier hostname)
  SRCEI: `${API_BASE}/srcei/`,
  PRT: `${API_BASE}/prt/`,
  AACH: `${API_BASE}/aach/`,
  SGD: `${API_BASE}/sgd/`,
  SII: `${API_BASE}/sii/`,
  CARABINEROS: `${API_BASE}/carabineros/`,
  TGR: `${API_BASE}/tgr/`,
  MTT: `${API_BASE}/mtt/`,
  BACKEND: `${API_BASE}/back/`,
};
```

---

## Cómo Funciona

### 1. En Kubernetes (AWS ALB) - Automático

```
URL en browser: http://desarrollo-tt-alb-123456789.us-east-1.elb.amazonaws.com/

getApiBase() detecta:
  window.location.origin = "http://desarrollo-tt-alb-123456789.us-east-1.elb.amazonaws.com"

API URLs se construyen automáticamente:
  BACKEND → http://desarrollo-tt-alb-123456789.us-east-1.elb.amazonaws.com/back
  AACH   → http://desarrollo-tt-alb-123456789.us-east-1.elb.amazonaws.com/aach
  MTT    → http://desarrollo-tt-alb-123456789.us-east-1.elb.amazonaws.com/mtt
  ... etc
```

### 2. En Desarrollo Local

```
URL en browser: http://localhost:3000/

getApiBase() detecta:
  window.location.origin = "http://localhost:3000"

API URLs:
  BACKEND → http://localhost:3000/back  (requiere proxy)
  AACH   → http://localhost:3000/aach   (requiere proxy)
  ... etc
```

### 3. Con Variable de Entorno (Opcional)

```
NEXT_PUBLIC_API_BASE_URL=http://custom-domain.com

getApiBase() devuelve:
  process.env.NEXT_PUBLIC_API_BASE_URL

Útil para:
- Dominios personalizados
- Testing específicos
- Configuración manual
```

---

## Cambios en Kubernetes Deployments

### Antes

```yaml
env:
- name: NEXT_PUBLIC_API_URL
  valueFrom:
    configMapKeyRef:
      name: app-config
      key: NEXT_PUBLIC_API_URL
```

### Después

```yaml
env:
# NEXT_PUBLIC_API_BASE_URL es opcional
# Por defecto, window.location.origin se usa automáticamente
# - name: NEXT_PUBLIC_API_BASE_URL
#   valueFrom:
#     configMapKeyRef:
#       name: app-config
#       key: API_BASE_URL
```

**Por qué?** 
- No hay variable de entorno fija, todo es dinámico
- `window.location.origin` detecta automáticamente el hostname
- Comentado por si necesitas override en futuro

---

## Flujo de Resolución de URLs

```
1. App se carga en browser
   ↓
2. config/api.ts se ejecuta (getApiBase())
   ↓
3. ¿Hay process.env.NEXT_PUBLIC_API_BASE_URL?
   ├─ SÍ → usar variable de entorno
   └─ NO → continuar
   ↓
4. ¿Estamos en browser (window existe)?
   ├─ SÍ → usar window.location.origin ✅ (lo más común)
   └─ NO → continuar
   ↓
5. Fallback a 'http://localhost:3000'
   ↓
6. Construir URLs: `${API_BASE}/back`, `${API_BASE}/aach`, etc.
```

---

## Testing URLs

### En Kubernetes
```bash
# En el pod
kubectl exec -it deployment/panel-decisiones-app -n desarrollo-tt -- bash

# Verificar que la app se ve
curl http://localhost:8001/

# Verificar que se pueden acceder las APIs
curl http://localhost:8001/back/healthcheck
curl http://localhost:8001/aach/healthcheck
```

### En Desarrollo Local
```bash
# Desde browser console
console.log(window.location.origin);  // http://localhost:3000
console.log(API_BASE);                 // http://localhost:3000

# Las APIs se construyen así:
// BACKEND: http://localhost:3000/back
// AACH: http://localhost:3000/aach
// Etc.
```

---

## Configuración para Diferentes Ambientes

### Desarrollo Local (sin Kubernetes)

**next.config.ts** (ejemplo):
```typescript
const nextConfig = {
  rewrites: async () => {
    return {
      fallback: [
        {
          source: '/back/:path*',
          destination: 'http://localhost:8000/:path*',
        },
        {
          source: '/aach/:path*',
          destination: 'http://localhost:5001/:path*',
        },
        // ... etc
      ],
    };
  },
};
```

### Producción (Kubernetes)

**No requiere cambios** - `window.location.origin` automáticamente detecta el ALB hostname

### Con Dominio Personalizado (Opcional)

Si necesitas un dominio personalizado, agregar a ConfigMap:

```yaml
# ConfigMap
API_BASE_URL: "https://api.tudominio.com"

# Deployment
- name: NEXT_PUBLIC_API_BASE_URL
  valueFrom:
    configMapKeyRef:
      name: app-config
      key: API_BASE_URL
```

---

## Ventajas de esta Aproximación

| Ventaja | Descripción |
|---------|------------|
| **Zero Config** | No necesita variables de entorno en K8S |
| **Dinámico** | Funciona con cualquier hostname automático |
| **Flexible** | Puede overridearse con variable si es necesario |
| **CORS Friendly** | Mismo origen = sin problemas de CORS |
| **Portátil** | Funciona en local, staging, y producción |

---

## Próximos Pasos

1. ✅ Actualizar `config/api.ts` (ya hecho)
2. ✅ Actualizar Kubernetes deployments (ya hecho)
3. ⏳ Hacer commit: `git add app-* obtener-permiso/ kubernetes/`
4. ⏳ Push a develop para testing
5. ⏳ Mergear a main para producción

---

## Troubleshooting

### Las APIs no responden (404)

**Verificar:**
1. El ALB hostname está en el navegador
2. El Ingress tiene los paths correctos: `/back`, `/aach`, etc.
3. Los servicios están corriendo: `kubectl get svc -n desarrollo-tt`

### window.location.origin devuelve algo inesperado

**Solución:** Setear variable de entorno `NEXT_PUBLIC_API_BASE_URL` explícitamente

### CORS errors

**Causa probable:** Las APIs en rutas diferentes dentro del mismo ALB
**Solución:** Usar mismo origen (ya está arreglado con esta arquitectura)

---

## Referencia Rápida

| Escenario | API Base | Endpoint |
|-----------|----------|----------|
| Kubernetes | `http://alb-hostname` | `http://alb-hostname/back` |
| Local Dev | `http://localhost:3000` | `http://localhost:3000/back` |
| Custom Domain | `https://api.domain.com` | `https://api.domain.com/back` |

