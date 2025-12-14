# Importamos librerías necesarias
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from datetime import date

from patentes_vehiculares_chile import validar_patente
import requests
from config.apis import API_PRT

# Instanciamos el router
router = APIRouter()

#####################################################
# Definimos los endpoints del router
#####################################################

# Endpoint para consultar la revisión técnica a la API http://host.docker.internal:5002/revision_tecnica/{ppu}
@router.get("/consultar_revision_tecnica/{ppu}")
async def consultar_revision_tecnica(ppu: str):
    # Validar que no tenga caracteres especiales y/o espacios
    if not ppu.isalnum():
        raise HTTPException(status_code=400, detail="PPU no puede contener caracteres especiales o espacios")

    # Validar formato Placa Patente Única (PPU)
    if not validar_patente(ppu):
        raise HTTPException(status_code=400, detail="Formato de PPU inválido")

    # [DEPRECATED] Consultar a el endpoint http://host.docker.internal:5002/revision_tecnica/{ppu}
    # response = requests.get(f"http://host.docker.internal:5002/revision_tecnica/{ppu}")
    
    # Consultar a el endpoint Carabineros usando variable de entorno
    response = requests.get(f"{API_PRT}/revision_tecnica/{ppu}")

    if response.status_code == 200:
        # La respuesta debe entregar el valor de la variable "revision"
        return response.json()
    elif response.status_code == 404:
        raise HTTPException(status_code=404, detail="Revisión técnica no encontrada")
    else:     
        raise HTTPException(status_code=response.status_code)