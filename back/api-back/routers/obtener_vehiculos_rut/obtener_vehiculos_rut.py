# Importamos librerías necesarias
from datetime import date
from fastapi import APIRouter, HTTPException, Depends, Request
import os
from pydantic import BaseModel
import httpx
from typing import List

# Instanciamos el router
router = APIRouter()

# Configuración de las APIs
SRCEI_BASE_URL = os.getenv("SRCEI_API_URL", "http://localhost:5001/padron/")
TGR_BASE_URL = os.getenv("TGR_API_URL", "http://localhost:5007/consultar_permiso/")


#####################################################
# Definimos los endpoints del router
#####################################################

# Base Model Padrón

class Padron(BaseModel): 
    ppu : str
    rut: str
    tipo_vehiculo: str
    marca: str
    modelo: str
    anio: int
    color: str
    cilindrada: int
    num_motor: str
    num_chasis: str
    fecha_inscripcion: date 

# Base Model Permiso de Circulación

class PermisoCirculacionModel(BaseModel):
    id: int
    ppu: str
    rut: str
    nombre: str
    fecha_emision: date  # Fecha en formato ISO 8601
    fecha_expiracion: date  # Fecha en formato ISO 8601
    valor_permiso: int
    motor: int
    chasis: str
    tipo_vehiculo: str
    color: str
    marca: str
    modelo: str
    anio: int
    carga: int
    tipo_sello: str
    combustible: str
    cilindrada: int
    transmision: str
    pts: int
    ast: int
    equipamiento: str
    codigo_sii: str
    tasacion: int

# Base Model Vehículo

class Vehiculo(BaseModel):
    ppu: str
    marca: str
    modelo: str
    estado: str

# Endpoint para obtener vehículos asociados a un RUT
@router.get("/vehiculos_rut/{rut}", response_model=List[Vehiculo])
async def obtener_vehiculos_por_rut(rut: str):
    """
    Obtiene los vehículos asociados a un RUT.
    Retorna PPU, marca, modelo y estado de cada vehículo.
    """
    try:
        # Consultar vehículos en el padrón por RUT
        async with httpx.AsyncClient() as client:
            padron_response = await client.get(
                f"{SRCEI_BASE_URL}rut/{rut}",
                timeout=30.0
            )
            
            if padron_response.status_code == 404:
                return []  # No hay vehículos asociados al RUT
            
            if padron_response.status_code != 200:
                raise HTTPException(
                    status_code=500, 
                    detail="Error al consultar el padrón vehicular"
                )
            
            padron_data = padron_response.json()
            
            # Si padron_data es una lista
            if isinstance(padron_data, list):
                vehiculos_padron = padron_data
            else:
                vehiculos_padron = [padron_data]
            
            vehiculos_resultado = []
            
            # Para cada vehículo del padrón, verificar su estado con TGR
            for vehiculo_padron in vehiculos_padron:
                ppu = vehiculo_padron.get("ppu", "")
                marca = vehiculo_padron.get("marca", "")
                modelo = vehiculo_padron.get("modelo", "")
                
                # Consultar permiso de circulación para determinar estado
                try:
                    permiso_response = await client.get(
                        f"{TGR_BASE_URL}{ppu}",
                        timeout=30.0
                    )
                    
                    if permiso_response.status_code == 200:
                        permiso_data = permiso_response.json()
                        # Verificar si el permiso está vigente
                        fecha_expiracion = permiso_data.get("fecha_expiracion")
                        if fecha_expiracion:
                            fecha_exp = date.fromisoformat(fecha_expiracion)
                            estado = "vigente" if fecha_exp >= date.today() else "vencido"
                        else:
                            estado = "sin_permiso"
                    else:
                        estado = "sin_permiso"
                        
                except Exception:
                    estado = "desconocido"
                
                # Crear objeto Vehiculo
                vehiculo = Vehiculo(
                    ppu=ppu,
                    marca=marca,
                    modelo=modelo,
                    estado=estado
                )
                
                vehiculos_resultado.append(vehiculo)
            
            return vehiculos_resultado
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error interno del servidor: {str(e)}"
        )

