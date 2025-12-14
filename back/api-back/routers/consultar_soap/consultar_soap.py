# Importamos librerías necesarias
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from datetime import date

from patentes_vehiculares_chile import validar_patente
import requests
from config.apis import API_AACH

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

  # [DEPRECATED] response = requests.get(f"http://host.docker.internal:5003/soap/{ppu}")
  
  # Consultar usando variable de entorno
  response = requests.get(f"{API_AACH}/soap/{ppu}")
  
  if response.status_code == 404:
      raise HTTPException(status_code=404, detail="No se encontró información para la patente proporcionada")

  if response.status_code != 200:
      raise HTTPException(status_code=500, detail="Error al consultar el servicio SOAP")

  # Convertir "rige_desde" a fecha y obtener el año de emisión
  rige_desde_str = response.json().get("rige_desde")
  rige_desde_fecha = date.fromisoformat(rige_desde_str)
  anio_emision = rige_desde_fecha.year
  if anio_emision == date.today().year:
    vigencia_permiso = "Vigente"
  else:
    vigencia_permiso = "No Vigente"

  return {
      "num_poliza": response.json().get("num_poliza"),
      "ppu": response.json().get("ppu"),
      "compania": response.json().get("compania"),
      "rige_desde": response.json().get("rige_desde"),
      "rige_hasta": response.json().get("rige_hasta"),
      "prima": response.json().get("prima"),
      "vigencia": response.json().get("vigencia"),
      "vigencia_permiso": vigencia_permiso
  }