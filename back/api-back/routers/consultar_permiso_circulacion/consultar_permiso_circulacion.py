# Importamos librerías necesarias
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from datetime import date

from patentes_vehiculares_chile import validar_patente
import requests
from config.apis import API_TGR

# Instanciamos el router
router = APIRouter()

#####################################################
# Definimos los endpoints del router
#####################################################

# Endpoint para consultar el permiso de circulación a la API http://host.docker.internal:5007/consultar_permiso/{ppu}
@router.get("/consultar_permiso_circulacion/{patente}")
async def consultar_permiso_circulacion(patente: str):
    # Validamos la patente
    if not validar_patente(patente):
        raise HTTPException(status_code=400, detail="Patente inválida")

    # [DEPRECATED] Realizamos la consulta al servicio externo
    # response = requests.get(f"http://host.docker.internal:5007/consultar_permiso/{patente}")
    
    # Realizamos la consulta usando variable de entorno
    response = requests.get(f"{API_TGR}/consultar_permiso/{patente}")
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Permiso de circulación no encontrado")
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Error al consultar el permiso de circulación")

    # Calcular vigencia del permiso
    fecha_actual = date.today()
    fecha_exp = date.fromisoformat(response.json().get("fecha_expiracion"))
    if fecha_exp >= fecha_actual:
        vigencia = True
    else:
        vigencia = False

    # Retornamos la información obtenida
    return{
        "id": response.json().get("id"),
        "ppu": response.json().get("ppu"),
        "rut": response.json().get("rut"),
        "nombre": response.json().get("nombre"),
        "fecha_emision": response.json().get("fecha_emision"),
        "fecha_expiracion": response.json().get("fecha_expiracion"),
        "valor_permiso": response.json().get("valor_permiso"),
        "motor": response.json().get("motor"),
        "chasis": response.json().get("chasis"),
        "tipo_vehiculo": response.json().get("tipo_vehiculo"),
        "color": response.json().get("color"),
        "marca": response.json().get("marca"),
        "modelo": response.json().get("modelo"),
        "anio": response.json().get("anio"),
        "carga": response.json().get("carga"),
        "tipo_sello": response.json().get("tipo_sello"),
        "combustible": response.json().get("combustible"),
        "cilindrada": response.json().get("cilindrada"),
        "transmision": response.json().get("transmision"),
        "pts": response.json().get("pts"),
        "ast": response.json().get("ast"),
        "equipamiento": response.json().get("equipamiento"),
        "codigo_sii": response.json().get("codigo_sii"),
        "tasacion": response.json().get("tasacion"),
        "vigencia": vigencia
    }

# Consultar permiso de circulación usando el id del permiso
@router.get("/consultar_permiso_circulacion_id/{id_permiso}")
async def consultar_permiso_circulacion_id(id_permiso: int):
    # [DEPRECATED] Realizamos la consulta al servicio externo
    # response = requests.get(f"http://host.docker.internal:5007/consultar_permiso_id/{id_permiso}")
    
    # Realizamos la consulta usando variable de entorno
    response = requests.get(f"{API_TGR}/consultar_permiso_id/{id_permiso}")
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Permiso de circulación no encontrado")
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Error al consultar el permiso de circulación")

    # Calcular vigencia del permiso
    fecha_actual = date.today()
    fecha_exp = date.fromisoformat(response.json().get("fecha_expiracion"))
    if fecha_exp >= fecha_actual:
        vigencia = True
    else:
        vigencia = False

    # Retornamos la información obtenida
    return{
        "id": response.json().get("id"),
        "ppu": response.json().get("ppu"),
        "rut": response.json().get("rut"),
        "nombre": response.json().get("nombre"),
        "fecha_emision": response.json().get("fecha_emision"),
        "fecha_expiracion": response.json().get("fecha_expiracion"),
        "valor_permiso": response.json().get("valor_permiso"),
        "motor": response.json().get("motor"),
        "chasis": response.json().get("chasis"),
        "tipo_vehiculo": response.json().get("tipo_vehiculo"),
        "color": response.json().get("color"),
        "marca": response.json().get("marca"),
        "modelo": response.json().get("modelo"),
        "anio": response.json().get("anio"),
        "carga": response.json().get("carga"),
        "tipo_sello": response.json().get("tipo_sello"),
        "combustible": response.json().get("combustible"),
        "cilindrada": response.json().get("cilindrada"),
        "transmision": response.json().get("transmision"),
        "pts": response.json().get("pts"),
        "ast": response.json().get("ast"),
        "equipamiento": response.json().get("equipamiento"),
        "codigo_sii": response.json().get("codigo_sii"),
        "tasacion": response.json().get("tasacion"),
        "vigencia": vigencia
    }