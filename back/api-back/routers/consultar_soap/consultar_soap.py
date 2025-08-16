# Importamos librerías necesarias
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from datetime import date

from patentes_vehiculares_chile import validar_patente
import requests

# Instanciamos el router
router = APIRouter()

#####################################################
# Definimos los endpoints del router
#####################################################

# Endpoint para consultar el SOAP del endpoint http://host.docker.internal:5003/soap/{ppu}
@router.get("/consultar_soap/{ppu}")
async def consultar_soap(ppu: str):
  # Validar que la PPU no tenga carácteres especiales
  if not ppu.isalnum():
      raise HTTPException(status_code=400, detail="Patente inválida")

  if not validar_patente(ppu):
      raise HTTPException(status_code=400, detail="Patente inválida")

  response = requests.get(f"http://host.docker.internal:5003/soap/{ppu}")
  
  if response.status_code == 404:
      return {"detail": "No se encontró información para la patente proporcionada"}

  if response.status_code != 200:
      return {"detail": "Error al consultar el servicio SOAP"}

  return response.json()