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

TGR_BASE_URL = os.getenv("TGR_API_URL", "http://host.docker.internal:5007/subir_permiso/")

#####################################################
# Definimos los endpoints del router
#####################################################

@router.post("/emitir_permiso_circulacion/")
async def emitir_permiso_circulacion(request: Request):
    data = await request.json()
    response = await httpx.post(f"{TGR_BASE_URL}", json=data)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    return response.json()