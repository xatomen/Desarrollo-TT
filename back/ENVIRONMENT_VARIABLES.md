# Variables de Entorno - Backend API

Este documento describe las variables de entorno necesarias para conectar el backend con las otras APIs de microservicios.

## Configuración para Desarrollo Local (Docker)

Para desarrollo local con Docker, puedes usar los valores por defecto que apuntan a `host.docker.internal`:

```bash
export API_AACH=http://host.docker.internal:5001
export API_CARABINEROS=http://host.docker.internal:5002
export API_MTT=http://host.docker.internal:5003
export API_PRT=http://host.docker.internal:5004
export API_SII=http://host.docker.internal:5005
export API_SGD=http://host.docker.internal:5006
export API_TGR=http://host.docker.internal:5007
export API_SRCEI=http://host.docker.internal:5001
```

## Configuración para Producción (EKS/Kubernetes)

Para producción en EKS, usa los nombres de servicio de Kubernetes:

```bash
export API_AACH=http://aach-api:5001
export API_CARABINEROS=http://carabineros-api:5002
export API_MTT=http://mtt-api:5003
export API_PRT=http://prt-api:5004
export API_SII=http://sii-api:5005
export API_SGD=http://sgd-api:5006
export API_TGR=http://tgr-api:5007
export API_SRCEI=http://srcei-api:5001
```

## Mapeo de APIs

| Variable | Descripción | API | Puerto (Docker) |
|----------|-------------|-----|-----------------|
| API_AACH | Padrón vehicular | AACH | 5001 |
| API_CARABINEROS | Revisión técnica | Carabineros | 5002 |
| API_MTT | Multas de tránsito, SOAP | MTT | 5003 |
| API_PRT | Permiso de circulación (?) | PRT | 5004 |
| API_SII | Tasación fiscal, facturas | SII | 5005 |
| API_SGD | Encargo de patente | SGD | 5006 |
| API_TGR | Permiso de circulación | TGR | 5007 |
| API_SRCEI | Padrón y multas | SRCEI | 5001 |

## Routers Actualizados

Los siguientes routers han sido actualizados para usar variables de entorno:

- ✅ `consultar_patente.py` - Usa `API_AACH`
- ✅ `consultar_revision_tecnica.py` - Usa `API_CARABINEROS`
- ✅ `consultar_soap.py` - Usa `API_MTT`
- ✅ `consultar_permiso_circulacion.py` - Usa `API_TGR`
- ✅ `consultar_encargo.py` - Usa `API_SGD`
- `obtener_vehiculos_rut.py` - Ya usa variables (necesita revisión)
- `consultar_valor_permiso.py` - Ya usa variables (necesita revisión)
- `consultar_rpi.py` - Ya usa variables (necesita revisión)
- `consultar_multas_patente.py` - Ya usa variables (necesita revisión)

## Docker Compose

En el archivo `docker-compose.yml`, agrega las variables de entorno al servicio del backend:

```yaml
services:
  back-api:
    environment:
      - API_AACH=http://aach-api:5001
      - API_CARABINEROS=http://carabineros-api:5002
      - API_MTT=http://mtt-api:5003
      - API_PRT=http://prt-api:5004
      - API_SII=http://sii-api:5005
      - API_SGD=http://sgd-api:5006
      - API_TGR=http://tgr-api:5007
      - API_SRCEI=http://srcei-api:5001
```

## Kubernetes

En los manifiestos de Kubernetes, agrega las variables de entorno:

```yaml
containers:
- name: back-api
  env:
  - name: API_AACH
    value: "http://aach-api:5001"
  - name: API_CARABINEROS
    value: "http://carabineros-api:5002"
  - name: API_MTT
    value: "http://mtt-api:5003"
  - name: API_PRT
    value: "http://prt-api:5004"
  - name: API_SII
    value: "http://sii-api:5005"
  - name: API_SGD
    value: "http://sgd-api:5006"
  - name: API_TGR
    value: "http://tgr-api:5007"
  - name: API_SRCEI
    value: "http://srcei-api:5001"
```

## Notas

- Los routers ya cuentan con valores por defecto, por lo que es opcional configurar las variables de entorno en desarrollo
- En producción, **es obligatorio** configurar las variables de entorno con las URLs correctas de Kubernetes
- Algunos routers pueden tener múltiples referencias a las APIs, revisa el código completo para asegurar que todas usen las variables de entorno
