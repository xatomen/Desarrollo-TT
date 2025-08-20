# Importamos librerías necesarias
from fastapi import APIRouter, HTTPException, Depends, Request
from datetime import date
import os
from pydantic import BaseModel
import httpx
from typing import List
import requests 

# Instanciamos el router
router = APIRouter()

MTT_BASE_URL = os.getenv("MTT_API_URL", "http://host.docker.internal:5008/multas_pasajero/?rut={rut}")

#####################################################
# Modelos de respuesta
#####################################################

class MultaRPIResponse(BaseModel):
    rut_propietario: str
    cantidad_multas: int
    mensaje: str

#####################################################
# Definimos los endpoints del router
#####################################################

@router.get("/consultar-multas-rpi/{rut}", response_model=MultaRPIResponse)
async def consultar_multas_rpi(rut: str):
    """
    Consulta la cantidad de multas del propietario asociadas al Registro de Pasajeros Infractores (RPI)
    enviando el RUT del propietario a la API del MTT.
    
    Args:
        rut (str): RUT del propietario
        
    Returns:
        MultaRPIResponse: Respuesta con la cantidad de multas del RPI
    """
    try:
        # Usar la URL base definida arriba y reemplazar el placeholder
        url = MTT_BASE_URL.format(rut=rut)
        
        # Realizar la petición GET a la API del MTT
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            
            # Verificar si la respuesta es exitosa
            if response.status_code == 200:
                data = response.json()
                
                # Contar la cantidad de objetos en la respuesta
                cantidad_multas = len(data) if isinstance(data, list) else 0
                
                return MultaRPIResponse(
                    rut_propietario=rut,
                    cantidad_multas=cantidad_multas,
                    mensaje="Cuenta con multas de RPI"
                )
            
            elif response.status_code == 404:
                return MultaRPIResponse(
                    rut_propietario=rut,
                    cantidad_multas=0,
                    mensaje="No se encontraron multas para el RUT proporcionado"
                )
            
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Error al consultar la API del MTT: {response.text}"
                )
                
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error de conexión con la API del MTT: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error interno del servidor: {str(e)}"
        )


