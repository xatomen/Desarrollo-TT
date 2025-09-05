# Importamos librerías necesarias
from fastapi import APIRouter, HTTPException, Depends, Request
from datetime import date
import os
from pydantic import BaseModel
import httpx
from typing import List, Optional
import requests 

# Instanciamos el router
router = APIRouter()

SII_BASE_URL = os.getenv("SII_API_URL", "http://host.docker.internal:5005/tasacion_fiscal/?codigo_sii={codigo_sii}")
SII_Factura_URL = os.getenv("SII_FACTURA_URL", "http://host.docker.internal:5005/factura_venta_num_chasis/?num_chasis={num_chasis}")
TGR_BASE_URL = os.getenv("TGR_API_URL", "http://host.docker.internal:5007/consultar_permiso/{ppu}")
SRCEI_BASE_URL = os.getenv("SRCEI_API_URL", "http://host.docker.internal:5001/padron/vehiculo/{ppu}")

#####################################################
# Modelos de respuesta
#####################################################

class ValorPermiso(BaseModel):
    valor: int
    puertas: Optional[int] = None
    asientos: Optional[int] = None
    combustible: Optional[str] = None
    peso: Optional[int] = None
    transmision: Optional[str] = None
    cilindrada: Optional[int] = None
    carga: Optional[int] = None
    equipamiento: Optional[str] = None
    tasacion: Optional[int] = None

#####################################################
# Definimos los endpoints del router
#####################################################

# Validar si es primera obtención o renovación de permiso
# Si es renovación obtener código desde permiso de circulación anterior
# Si es primera obtención, obtener el valor del vehiculo desde la factura y calcular el valor del permiso
# Devolver el valor del permiso
valor_UTM = 67429

def calcular_valor_permiso(valor_vehiculo: int) -> int:
    valor_permiso_UTM = 0
    valor_vehiculo_UTM = valor_vehiculo / valor_UTM
    if valor_vehiculo_UTM <= 60:
        valor_permiso_UTM = 0.01 * valor_vehiculo_UTM
    elif valor_vehiculo_UTM > 60 and valor_vehiculo_UTM <= 120:
        valor_permiso_UTM += 60 * 0.01
        valor_permiso_UTM += 0.02 * (valor_vehiculo_UTM - 60)
    elif valor_vehiculo_UTM > 120 and valor_vehiculo_UTM <= 250:
        valor_permiso_UTM += 60 * 0.01
        valor_permiso_UTM += 60 * 0.02  
        valor_permiso_UTM += 0.03 * (valor_vehiculo_UTM - 120)
    elif valor_vehiculo_UTM > 250 and valor_vehiculo_UTM <= 400:
        valor_permiso_UTM += 60 * 0.01
        valor_permiso_UTM += 60 * 0.02
        valor_permiso_UTM += 130 * 0.03
        valor_permiso_UTM += 0.04 * (valor_vehiculo_UTM - 250)
    elif valor_vehiculo_UTM > 400:
        valor_permiso_UTM += 60 * 0.01
        valor_permiso_UTM += 60 * 0.02
        valor_permiso_UTM += 130 * 0.03        
        valor_permiso_UTM += 150 * 0.04
        valor_permiso_UTM += 0.045 * (valor_vehiculo_UTM - 400)
    return int(valor_permiso_UTM * valor_UTM)
    
# Validar si tiene tasa fija
def tiene_tasa_fija(tipo: str, carga: int) -> int:
    if tipo == "Camión":
        if 1750 < carga <= 5000:
            return 1 * valor_UTM
        if 5000 < carga <= 10000:
            return 2 * valor_UTM
        if carga > 10000:
            return 3 * valor_UTM
    if tipo == "Tracto Camión":
        if 1750 < carga <= 5000:
            return 0.5 * valor_UTM  
        if 5000 < carga <= 10000:
            return 1 * valor_UTM
        if carga > 10000:
            return 1.5 * valor_UTM  
    if tipo.startswith("Semirremolque"):
        if 1750 < carga <= 5000:
            return 0.5 * valor_UTM
        if 5000 < carga <= 10000:
            return 1 * valor_UTM
        if carga > 10000:
            return 1.5 * valor_UTM
    if tipo.startswith("Remolque") or tipo.startswith("Carro"):
        if 1750 < carga <= 5000:
            return 1 * valor_UTM
        if 5000 < carga <= 10000:
            return 2 * valor_UTM
        if carga > 10000:
            return 3 * valor_UTM
    if tipo.startswith("Tractor") or tipo.startswith("Industrial") or tipo.startswith("Maquinaria"):
        return 0.5 * valor_UTM
    if tipo.startswith("Bici") or tipo.startswith("Triciclo") or "Scooter" in tipo:
        return 0.2 * valor_UTM
    else:
        return 0

    
@router.get("/consultar_valor_permiso/{ppu}", response_model=ValorPermiso)
async def consultar_valor_permiso(ppu: str):
    # Consultar si existe un permiso anterior vinculado a la PPU
    valor_permiso = 0
    
    # Inicializar variables con valores por defecto
    puertas = None
    asientos = None
    combustible = None
    peso = None
    transmision = None
    cilindrada = None
    carga = None
    equipamiento = None
    tasacion = None

    response = requests.get(TGR_BASE_URL.format(ppu=ppu))
    if response.status_code == 200:
        estado_permiso = "renovación"
        permiso = response.json()
    elif response.status_code == 404:
        estado_permiso = "primera obtención"
    else:
        raise HTTPException(status_code=500, detail="Error al consultar el permiso de circulación")
    
    # Si es renovación obtener código desde permiso de circulación anterior
    if estado_permiso == "renovación":
        codigo_sii = permiso.get("codigo_sii")
        response = requests.get(SII_BASE_URL.format(codigo_sii=codigo_sii))
        if response.status_code == 200:
            valor_permiso = tiene_tasa_fija(permiso.get("tipo_vehiculo"), permiso.get("carga", 0))
            sii_data = response.json()
            puertas = sii_data.get("puertas")
            asientos = sii_data.get("asientos")
            combustible = sii_data.get("combustible")
            peso = sii_data.get("peso")
            transmision = sii_data.get("transmision")
            cilindrada = sii_data.get("cilindrada")
            carga = sii_data.get("carga")    
            equipamiento = sii_data.get("equipamiento")
            tasacion = sii_data.get("tasacion")
            if valor_permiso != 0:
                return ValorPermiso(
                    valor=valor_permiso,
                    puertas=puertas,
                    asientos=asientos,
                    combustible=combustible,
                    peso=peso,
                    transmision=transmision,
                    cilindrada=cilindrada,
                    carga=carga,
                    equipamiento=equipamiento,
                    tasacion=tasacion
                )
            valor_permiso = sii_data.get("valor_permiso", 0)
            
        elif response.status_code == 404:
            raise HTTPException(status_code=404, detail="El Código SII no existe")
        else:
            raise HTTPException(status_code=500, detail="Error al consultar el SII")
        
    # Si es primera obtención, obtener el valor del vehiculo desde la factura y calcular el valor del permiso    
    if estado_permiso == "primera obtención":
        # Consultar Padrón
        response = requests.get(SRCEI_BASE_URL.format(ppu=ppu))
        if response.status_code == 200:
            padron = response.json()
            num_chasis = padron.get("num_chasis")
        elif response.status_code == 404:
            raise HTTPException(status_code=404, detail="La PPU no existe")
        else:
            raise HTTPException(status_code=500, detail="Error al consultar el Padrón")
        # Consultar Factura
        response = requests.get(SII_Factura_URL.format(num_chasis=num_chasis))
        if response.status_code == 200:
            factura = response.json()
            valor_permiso = tiene_tasa_fija(factura.get("tipo_vehiculo"), factura.get("carga", 0))
            puertas = factura.get("puertas")
            asientos = factura.get("asientos")
            combustible = factura.get("combustible")
            peso = factura.get("peso")
            transmision = factura.get("transmision")
            cilindrada = factura.get("cilindrada")
            carga = factura.get("carga")
            tasacion = factura.get("precio_neto")
            equipamiento = factura.get("equipamiento")
            if valor_permiso != 0:
                return ValorPermiso(
                    valor=valor_permiso,
                    puertas=puertas,
                    asientos=asientos,
                    combustible=combustible,
                    peso=peso,
                    transmision=transmision,
                    cilindrada=cilindrada,
                    carga=carga,
                    equipamiento=equipamiento,
                    tasacion=tasacion
                )
            valor_vehiculo = factura.get("precio_neto", 0)
            
        elif response.status_code == 404:
            raise HTTPException(status_code=404, detail="La factura no existe")
        else:
            raise HTTPException(status_code=500, detail="Error al consultar la factura")
        # Calcular el valor del permiso
        valor_permiso = calcular_valor_permiso(valor_vehiculo)
    
    # Verificar si vehiculo es electrico o hibrido
    if combustible in ["Eléctrico", "Híbrido"]:
        valor_permiso *= 0.25
        valor_permiso = int(valor_permiso)
    
    return ValorPermiso(
        valor=valor_permiso,
        puertas=puertas,
        asientos=asientos,
        combustible=combustible,
        peso=peso,
        transmision=transmision,
        cilindrada=cilindrada,
        carga=carga,
        equipamiento=equipamiento,
        tasacion=tasacion,
    )
