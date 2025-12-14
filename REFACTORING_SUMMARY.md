# Resumen de Refactoring - Backend APIs Configuration

## Objetivo Completado

Migrar todos los routers del backend para usar **centralización de configuración de APIs** en lugar de variables de entorno dispersas y hardcoded.

**Resultado:** Sistema que funciona automáticamente en:
- ✅ Docker Compose (desarrollo local)
- ✅ Kubernetes (producción)
- ✅ Localhost (desarrollo sin contenedores)

---

## Cambios Implementados

### 1. Archivo Central de Configuración

**Archivo:** `back/api-back/config/apis.py`

**Características:**
- Detección automática del modo de ejecución (`K8S_MODE`, `DOCKER_MODE`)
- URLs dinámicas según ambiente
- Endpoints preconfigurados (ej: `PADRON_VEHICULO`, `PERMISO_CIRCULACION`)
- Fallback values para desarrollo local

**Endpoints Disponibles:**
```python
# APIs Base
API_AACH, API_CARABINEROS, API_MTT, API_SII, API_SGD, API_TGR, API_SRCEI

# Endpoints Convenientes (con rutas)
PADRON_VEHICULO           # /padron/vehiculo
REVISION_TECNICA          # /revision_tecnica
MULTAS_TRANSITO           # /multas_transito
SOAP                      # /soap
RPI                       # /rpi
PERMISO_CIRCULACION       # /consultar_permiso
ENCARGO_PATENTE           # /encargo_patente
TASACION_FISCAL           # /tasacion_fiscal
FACTURA_VENTA             # /factura_venta_num_chasis
```

---

## Routers Actualizados

### ✅ Completamente Refactorizado

| Router | Cambios | Estado |
|--------|---------|--------|
| `consultar_patente.py` | Usa `API_AACH` + `PADRON_VEHICULO` | ✅ |
| `consultar_revision_tecnica.py` | Usa `API_CARABINEROS` + `REVISION_TECNICA` | ✅ |
| `consultar_soap.py` | Usa `API_MTT` + `SOAP` | ✅ |
| `consultar_permiso_circulacion.py` | Usa `API_TGR` + `PERMISO_CIRCULACION` (2 endpoints) | ✅ |
| `consultar_encargo.py` | Usa `API_SGD` + `ENCARGO_PATENTE` | ✅ |
| `consultar_valor_permiso.py` | Usa 4 endpoints: `PERMISO_CIRCULACION`, `TASACION_FISCAL`, `PADRON_VEHICULO`, `FACTURA_VENTA` | ✅ |
| `obtener_vehiculos_rut.py` | Usa `PADRON_VEHICULO` + `PERMISO_CIRCULACION` | ✅ |
| `consultar_rpi.py` | Usa `API_MTT` + `RPI` | ✅ |
| `consultar_multas_patente.py` | Usa `MULTAS_TRANSITO` | ✅ |

**Total de URLs Migradas:** 18 calls HTTP reemplazadas ✅

---

## Migración Antes vs Después

### Antes (Disperso)
```python
# router1.py
from config.apis import API_AACH
async def consultar():
    # Diferentes nombres de variables en cada router
    response = requests.get(f"http://host.docker.internal:5001/...")

# router2.py
import os
SRCEI_URL = os.getenv("SRCEI_API_URL", "http://host.docker.internal:5001/...")
# No funciona en Kubernetes

# router3.py
SII_BASE_URL = os.getenv("SII_API_URL", "http://host.docker.internal:5005/...")
# Hardcoded, no es escalable
```

### Después (Centralizado)
```python
# Cualquier router.py
from config.apis import PADRON_VEHICULO, PERMISO_CIRCULACION

async def consultar():
    # Automáticamente usa la URL correcta según el ambiente
    response = await client.get(f"{PADRON_VEHICULO}/{ppu}")
    # En Docker: http://host.docker.internal:5001/padron/vehiculo/{ppu}
    # En K8S: http://aach-api:5001/padron/vehiculo/{ppu}
    # En Local: http://localhost:5001/padron/vehiculo/{ppu}
```

---

## Documentación

### Archivos Creados/Actualizados

1. **`back/ENVIRONMENT_VARIABLES.md`**
   - Guía completa de configuración
   - Ejemplos Docker Compose
   - Ejemplos Kubernetes
   - Troubleshooting

2. **`.env.example`**
   - Template de variables de entorno
   - Valores por defecto
   - Instrucciones comentadas

---

## Configuración por Ambiente

### Docker Compose (Desarrollo)
```env
DOCKER_MODE=true
K8S_MODE=false
DB_HOST=db
DB_NAME=back_db
```

### Kubernetes (Producción)
```env
DOCKER_MODE=false
K8S_MODE=true
DB_HOST=mysql.default.svc.cluster.local
DB_NAME=back_db
```

---

## Beneficios de esta Refactorización

| Beneficio | Descripción |
|-----------|------------|
| **Centralización** | Un único archivo (`apis.py`) gestiona todas las URLs |
| **Escalabilidad** | Agregar nuevas APIs es trivial |
| **Portabilidad** | Funciona en Docker, K8S, y localhost sin cambios de código |
| **Mantenimiento** | Cambiar un puerto afecta a un solo lugar |
| **Testing** | URLs preconfiguradas facilitan mocking |
| **Documentación** | Endpoints bien documentados en un solo lugar |
| **Seguridad** | Variabables de entorno centralizadas, fáciles de auditar |

---

## Verificación

Para verificar que todo funciona correctamente:

### 1. Docker Compose
```bash
# Asegurarse que .env tiene:
# DOCKER_MODE=true
# K8S_MODE=false

docker-compose up

# En otra terminal, probar un endpoint:
curl http://localhost:8000/consultar/patente/ABC1234
```

### 2. Kubernetes
```bash
# Aplicar ConfigMaps y Secrets:
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secrets.yaml

# Asegurarse que K8S_MODE=true en el deployment

# Verificar logs:
kubectl logs -f deployment/api-back
```

### 3. Verificar Configuración
```bash
# Ejecutar el módulo de debug de apis.py
python back/api-back/config/apis.py

# Debe mostrar:
# K8S_MODE: False
# DOCKER_MODE: True  (o los valores que setees)
# API_AACH: http://host.docker.internal:5001
# ... etc
```

---

## Próximos Pasos Recomendados

1. **Deploy a Testing**
   - Verificar en ambiente similar a producción
   - Validar timeouts y reconexiones

2. **Monitoring**
   - Agregar logs de qué URL se está usando
   - Alerts si APIs externas no responden

3. **Circuit Breaker**
   - Implementar retry logic en `config/apis.py`
   - Fallback graceful si una API falla

4. **Rate Limiting**
   - Considerar agregar rate limiting por API
   - Evitar sobrecarga de servicios externos

---

## Notas Importantes

⚠️ **No olvidar:**
- Todos los `.env` locales deben tener `DOCKER_MODE=true` para desarrollo
- En CI/CD pipelines, setear `K8S_MODE=true` para producción
- Mantener actualizado `ENVIRONMENT_VARIABLES.md` con nuevas APIs
- Agregar nuevas APIs a `config/apis.py`, no crear variables en routers

---

## Contacto

Para preguntas sobre la configuración o agregar nuevas APIs, consultar:
- [back/ENVIRONMENT_VARIABLES.md](back/ENVIRONMENT_VARIABLES.md)
- [back/api-back/config/apis.py](back/api-back/config/apis.py)

