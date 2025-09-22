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

# Base Model Padrón
class PadronModel(BaseModel): 
    ppu : str
    rut: str
    nombre: str
    tipo_vehiculo: str
    marca: str
    modelo: str
    anio: int
    color: str
    cilindrada: int
    num_motor: str
    num_chasis: str
    fecha_inscripcion: date 

# Consultar Patente
@router.get("/consultar_patente/{ppu}")
async def consultar_patente(ppu: str):
    
    # Validar formato patente
    if not validar_patente(ppu):
        raise HTTPException(status_code=400, detail="Formato de patente inválido")

    # Consultar patente a la API http://localhost:5001/padron/vehiculo
    try:
        response = requests.get(f"http://host.docker.internal:5001/padron/vehiculo/{ppu}")  # Usar el parámetro ppu
        
        # Si obtuvimos una respuesta exitosa retornamos el padron
        if response.status_code == 200:
            return response.json()
        
        # Si la patente no fue encontrada, retornamos un error 404
        elif response.status_code == 404:
            raise HTTPException(status_code=404, detail="Patente no encontrada")
        else:
            raise HTTPException(status_code=response.status_code, detail="Error en el servicio de padrón")
            
    # Si ocurre un error de conexión, lanzamos una excepción HTTP
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error al conectar con el servicio de padrón: {str(e)}")