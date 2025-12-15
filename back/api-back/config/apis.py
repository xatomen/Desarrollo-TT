# Configuración centralizada de endpoints para APIs externas
# Esta configuración soporta múltiples entornos: desarrollo local, Docker Compose y Kubernetes

import os

# ============================================================
# MODO DE EJECUCIÓN
# ============================================================
# Se detecta automáticamente si está en Kubernetes (existe la variable K8S_MODE)
# En Kubernetes: usa nombres de servicio (ej: http://aach-api:5001)
# En Docker: usa host.docker.internal:puerto
# En desarrollo: usa localhost:puerto

K8S_MODE = os.getenv("K8S_MODE", "false").lower() == "true"
DOCKER_MODE = os.getenv("DOCKER_MODE", "true").lower() == "true"

# ============================================================
# PUERTOS POR DEFECTO
# ============================================================
# En Kubernetes, los servicios están expuestos en puerto 80 (HTTP)
# En Docker local, usan host.docker.internal con puertos específicos
PORT_AACH = 80
PORT_CARABINEROS = 80
PORT_MTT = 80
PORT_PRT = 80
PORT_SII = 80
PORT_SGD = 80
PORT_TGR = 80
PORT_SRCEI = 80

# ============================================================
# NOMBRES DE SERVICIO KUBERNETES
# ============================================================
SERVICE_AACH = "aach-api"
SERVICE_CARABINEROS = "carabineros-api"
SERVICE_MTT = "mtt-api"
SERVICE_PRT = "prt-api"
SERVICE_SII = "sii-api"
SERVICE_SGD = "sgd-api"
SERVICE_TGR = "tgr-api"
SERVICE_SRCEI = "srcei-api"

# ============================================================
# FUNCIÓN AUXILIAR PARA CONSTRUIR URLs
# ============================================================
def _build_url(service_name: str, port: int) -> str:
    """
    Construye la URL según el entorno
    - Kubernetes: http://service-name:port
    - Docker: http://host.docker.internal:port
    - Desarrollo: http://localhost:port
    """
    if K8S_MODE:
        return f"http://{service_name}:{port}"
    elif DOCKER_MODE:
        return f"http://host.docker.internal:{port}"
    else:
        return f"http://localhost:{port}"

# ============================================================
# URLs DE LAS APIs (PUEDEN SER SOBRESCRITAS POR ENV VARS)
# ============================================================

# API AACH - Padrón vehicular y multas de tránsito
API_AACH = os.getenv("API_AACH", _build_url(SERVICE_AACH, PORT_AACH) + "/aach")

# API Carabineros - Revisión técnica
API_CARABINEROS = os.getenv("API_CARABINEROS", _build_url(SERVICE_CARABINEROS, PORT_CARABINEROS) + "/carabineros")

# API MTT - Multas transito y RPI (Registro de Pasajero Infractor)
API_MTT = os.getenv("API_MTT", _build_url(SERVICE_MTT, PORT_MTT) + "/mtt")

# API PRT - (Por definir)
API_PRT = os.getenv("API_PRT", _build_url(SERVICE_PRT, PORT_PRT) + "/prt")

# API SII - Tasación fiscal y facturas
API_SII = os.getenv("API_SII", _build_url(SERVICE_SII, PORT_SII) + "/sii")

# API SGD - Encargo de patente
API_SGD = os.getenv("API_SGD", _build_url(SERVICE_SGD, PORT_SGD) + "/sgd")

# API TGR - Permiso de circulación
API_TGR = os.getenv("API_TGR", _build_url(SERVICE_TGR, PORT_TGR) + "/tgr")

# API SRCEI - Padrón y multas
API_SRCEI = os.getenv("API_SRCEI", _build_url(SERVICE_SRCEI, PORT_SRCEI) + "/srcei")

# ============================================================
# ENDPOINTS ESPECÍFICOS (COMODIDAD)
# ============================================================

# Padrón vehicular
PADRON_VEHICULO = f"{API_SRCEI}/padron/vehiculo"

# Revisión técnica
REVISION_TECNICA = f"{API_PRT}/revision_tecnica"

# Multas de tránsito
MULTAS_TRANSITO = f"{API_SRCEI}/multas_transito"

# SOAP (Multas de tránsito detalladas)
SOAP = f"{API_AACH}/soap"

# RPI (Registro de Pasajero Infractor)
RPI = f"{API_MTT}/multas_pasajero"

# Permiso de circulación
PERMISO_CIRCULACION = f"{API_TGR}/consultar_permiso"
PERMISO_CIRCULACION_ID = f"{API_TGR}/consultar_permiso_id"

# Encargo de patente
ENCARGO_PATENTE = f"{API_CARABINEROS}/encargo_patente"

# Tasación fiscal (SII)
TASACION_FISCAL = f"{API_SII}/tasacion_fiscal"
FACTURA_VENTA = f"{API_SII}/factura_venta_num_chasis"

# ============================================================
# DEBUG
# ============================================================
if __name__ == "__main__":
    print("=== Configuración de APIs ===")
    print(f"K8S_MODE: {K8S_MODE}")
    print(f"DOCKER_MODE: {DOCKER_MODE}")
    print(f"\nAPI_AACH: {API_AACH}")
    print(f"API_CARABINEROS: {API_CARABINEROS}")
    print(f"API_MTT: {API_MTT}")
    print(f"API_SII: {API_SII}")
    print(f"API_SGD: {API_SGD}")
    print(f"API_TGR: {API_TGR}")


