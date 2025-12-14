# Importamos librerías necesarias
from datetime import date
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
import httpx
from typing import List

from config.apis import MULTAS_TRANSITO

# Instanciamos el router
router = APIRouter()

# [DEPRECATED] Configuración de las APIs
# SRCEI_BASE_URL = os.getenv("SRCEI_API_URL", "http://host.docker.internal:5001/multas_transito/{ppu}")

#####################################################
# Definimos los endpoints del router
#####################################################

# crear endpoint 
# obtener respuesta del endpoint enviando ppu
# si tiene multas, retornar no vigente 
# si no tiene, retornar vigente

# Response model for better API documentation
class MultasResponse(BaseModel):
    estado: str
    ppu: str
    multas: List[dict] = []
    total_multas: int = 0

@router.get("/consultar_multas/{ppu}", response_model=MultasResponse)
async def consultar_multas(ppu: str):
    # Convert PPU to uppercase for display
    ppu_upper = ppu.upper()
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{MULTAS_TRANSITO}/{ppu}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if data is a list (direct array of multas) or dict with multas key
                if isinstance(data, list):
                    multas = data
                else:
                    multas = data.get("multas", [])
                
                if multas:
                    return MultasResponse(
                        estado="no vigente",
                        ppu=ppu_upper,
                        multas=multas,
                        total_multas=len(multas)
                    )
                else:
                    return MultasResponse(
                        estado="vigente",
                        ppu=ppu_upper,
                        total_multas=0
                    )
            elif response.status_code == 404:
                # 404 means no multas found, so it's "vigente"
                return MultasResponse(
                    estado="vigente",
                    ppu=ppu_upper,
                    multas=[],
                    total_multas=0
                )
            elif response.status_code == 400:
                # 400 means invalid patente format
                raise HTTPException(
                    status_code=400, 
                    detail=f"Formato de patente inválido: {ppu_upper}"
                )
            else:
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"Error al consultar multas para PPU {ppu_upper}"
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503, 
                detail=f"Error de conexión con el servicio de multas: {str(e)}"
            )

