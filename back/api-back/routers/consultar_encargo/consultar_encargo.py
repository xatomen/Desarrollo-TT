# Importamos librerías necesarias
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from datetime import date

from patentes_vehiculares_chile import validar_patente
import requests
from config.apis import API_CARABINEROS

# Instanciamos el router
router = APIRouter()

#####################################################
# Definimos los endpoints del router
#####################################################

# Consultar Encargo por Robo
@router.get("/consultar_encargo/{ppu}")
async def consultar_encargo(ppu: str):
    # Validar que no tenga caracteres especiales y/o espacios
    if not ppu.isalnum():
        raise HTTPException(status_code=400, detail="PPU no puede contener caracteres especiales o espacios")

    # Validar formato Placa Patente Única (PPU)
    if not validar_patente(ppu):
        raise HTTPException(status_code=400, detail="Formato de PPU inválido")

    # [DEPRECATED] Consultar a el endpoint http://host.docker.internal:5006/encargo_patente/{ppu}
    # response = requests.get(f"http://host.docker.internal:5006/encargo_patente/{ppu}")
    
    # Consultar usando variable de entorno
    response = requests.get(f"{API_CARABINEROS}/encargo_patente/{ppu}")

    if response.status_code == 200:
        # La respuesta debe entregar el valor de la variable "encargo"
        return {
            "encargo": response.json().get("encargo"),
            "patente_delantera": response.json().get("patente_delantera"),
            "patente_trasera": response.json().get("patente_trasera"),
            "vin": response.json().get("vin"),
            "motor": response.json().get("motor"),
        }
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)
