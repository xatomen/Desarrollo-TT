from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy import (
    create_engine, Column, Integer, String, DateTime, Date, Boolean,
    func, and_, or_, text, case
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime, date
from typing import Dict, Any
import os
from dotenv import load_dotenv
import re
import httpx
import logging
import json

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Instanciamos el router
router = APIRouter()

############################################
# DB
############################################
load_dotenv()
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_host = os.getenv("DB_HOST")
db_name = os.getenv("DB_NAME")
DATABASE_URL = f"mysql+mysqlconnector://{db_user}:{db_password}@{db_host}/{db_name}"
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class PermisoCirculacion(Base):
    __tablename__ = "permiso_circulacion"
    id = Column(Integer, primary_key=True, autoincrement=True)
    ppu = Column(String(10), nullable=False)
    rut = Column(String(12), nullable=False)
    nombre = Column(String(100), nullable=False)
    fecha_emision = Column(Date, nullable=False)
    fecha_expiracion = Column(Date, nullable=False)
    valor_permiso = Column(Integer, nullable=False)
    motor = Column(Integer, nullable=False)
    chasis = Column(String(50), nullable=False)
    tipo_vehiculo = Column(String(50), nullable=False)
    color = Column(String(50), nullable=False)
    marca = Column(String(50), nullable=False)
    modelo = Column(String(50), nullable=False)
    anio = Column(Integer, nullable=False)
    carga = Column(Integer, nullable=False)
    tipo_sello = Column(String(50), nullable=False)
    combustible = Column(String(50), nullable=False)
    cilindrada = Column(Integer, nullable=False)
    transmision = Column(String(50), nullable=False)
    pts = Column(Integer, nullable=False)
    ast = Column(Integer, nullable=False)
    equipamiento = Column(String(100), nullable=False)
    codigo_sii = Column(String(20), nullable=False)
    tasacion = Column(Integer, nullable=False)

# Crear las tablas
Base.metadata.create_all(bind=engine)

class PermisoCirculacionRequest(BaseModel):
    ppu: str
    rut: str
    nombre: str
    fecha_emision: str
    fecha_expiracion: str
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

class UpdateFechaRequest(BaseModel):
    id: int
    fecha_expiracion: str

def validar_rut(rut: str) -> bool:
    """Valida el formato del RUT chileno y permite ambos formatos"""
    # Permitir formato con puntos: 12.345.678-9 o sin puntos: 12345678-9
    rut_pattern_con_puntos = re.compile(r"^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$")
    rut_pattern_sin_puntos = re.compile(r"^\d{7,8}-[\dkK]$")
    
    return rut_pattern_con_puntos.match(rut) or rut_pattern_sin_puntos.match(rut)

def validar_ppu(ppu: str) -> bool:
    """Valida el formato de la PPU chilena"""
    # Formato chileno: 4 letras + 2 números (ABCD12) o formato antiguo
    ppu_pattern = re.compile(r"^[A-Z]{4}\d{2}$|^[A-Z]{2}\d{4}$")
    return ppu_pattern.match(ppu.upper())

@router.post("/emitir_permiso_circulacion/")
async def emitir_permiso_circulacion(
    permiso_data: PermisoCirculacionRequest,
    db: Session = Depends(get_db)
):
    try:
        # Validar formato de RUT
        if not validar_rut(permiso_data.rut):
            raise HTTPException(
                status_code=400, 
                detail="Formato de RUT inválido. Use formato XX.XXX.XXX-X o XXXXXXXX-X"
            )

        # Validar formato de PPU
        if not validar_ppu(permiso_data.ppu):
            raise HTTPException(
                status_code=400, 
                detail="Formato de PPU inválido. Use formato ABCD12 o AB1234"
            )

        # Validar fechas
        try:
            fecha_emision = datetime.strptime(permiso_data.fecha_emision, "%Y-%m-%d").date()
            fecha_expiracion = datetime.strptime(permiso_data.fecha_expiracion, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(
                status_code=400, 
                detail="Formato de fecha inválido. Use YYYY-MM-DD"
            )

        if fecha_expiracion <= fecha_emision:
            raise HTTPException(
                status_code=400, 
                detail="La fecha de expiración debe ser posterior a la fecha de emisión"
            )

        # Validar que la fecha de emisión no sea futura
        if fecha_emision > date.today():
            raise HTTPException(
                status_code=400, 
                detail="La fecha de emisión no puede ser futura"
            )

        # Validar valores numéricos
        if (permiso_data.valor_permiso < 0 or permiso_data.motor < 0 or 
            permiso_data.anio < 1886 or permiso_data.anio > date.today().year + 1 or
            permiso_data.carga < 0 or permiso_data.cilindrada < 0 or 
            permiso_data.pts < 0 or permiso_data.ast < 0 or permiso_data.tasacion < 0):
            raise HTTPException(
                status_code=400, 
                detail="Valores numéricos inválidos"
            )

        # Crear nuevo permiso de circulación
        nuevo_permiso = PermisoCirculacion(
            ppu=permiso_data.ppu.upper(),  # Normalizar PPU a mayúsculas
            rut=permiso_data.rut,
            nombre=permiso_data.nombre.title(),  # Capitalizar nombre
            fecha_emision=fecha_emision,
            fecha_expiracion=fecha_expiracion,
            valor_permiso=permiso_data.valor_permiso,
            motor=permiso_data.motor,
            chasis=permiso_data.chasis.upper(),  # Normalizar chasis
            tipo_vehiculo=permiso_data.tipo_vehiculo,
            color=permiso_data.color,
            marca=permiso_data.marca,
            modelo=permiso_data.modelo,
            anio=permiso_data.anio,
            carga=permiso_data.carga,
            tipo_sello=permiso_data.tipo_sello,
            combustible=permiso_data.combustible,
            cilindrada=permiso_data.cilindrada,
            transmision=permiso_data.transmision,
            pts=permiso_data.pts,
            ast=permiso_data.ast,
            equipamiento=permiso_data.equipamiento,
            codigo_sii=permiso_data.codigo_sii,
            tasacion=permiso_data.tasacion
        )

        db.add(nuevo_permiso)
        db.commit()
        db.refresh(nuevo_permiso)

        logger.info(f"Permiso de circulación emitido exitosamente para PPU: {permiso_data.ppu}")
        
        return {
            "mensaje": "Permiso de circulación emitido exitosamente", 
            "id": nuevo_permiso.id,
            "ppu": nuevo_permiso.ppu,
            "fecha_emision": fecha_emision.isoformat(),
            "fecha_expiracion": fecha_expiracion.isoformat()
        }
        
    except HTTPException as he:
        db.rollback()
        logger.error(f"Error de validación: {he.detail}")
        raise he
    except Exception as e:
        db.rollback()
        logger.error(f"Error inesperado al emitir permiso: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Error interno del servidor al emitir permiso de circulación"
        )

# Endpoint para actualizar fecha de expiración usando id del permiso
@router.patch("/update_fecha_permiso/")
async def update_fecha_permiso(
    update_data: UpdateFechaRequest,
    db: Session = Depends(get_db)
):
    try:
        # Validar fecha
        try:
            nueva_fecha_expiracion = datetime.strptime(update_data.fecha_expiracion, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(
                status_code=400, 
                detail="Formato de fecha inválido. Use YYYY-MM-DD"
            )

        # Buscar permiso por id
        permiso = db.query(PermisoCirculacion).filter(PermisoCirculacion.id == update_data.id).first()
        if not permiso:
            raise HTTPException(
                status_code=404, 
                detail="Permiso de circulación no encontrado"
            )

        # Validar que la nueva fecha de expiración sea posterior a la actual
        if nueva_fecha_expiracion <= permiso.fecha_expiracion:
            raise HTTPException(
                status_code=400, 
                detail="La nueva fecha de expiración debe ser posterior a la fecha actual"
            )

        # Actualizar fecha de expiración
        permiso.fecha_expiracion = nueva_fecha_expiracion
        db.commit()
        db.refresh(permiso)

        logger.info(f"Fecha de expiración actualizada exitosamente para ID: {update_data.id}")
        
        return {
            "mensaje": "Fecha de expiración actualizada exitosamente", 
            "id": permiso.id,
            "ppu": permiso.ppu,
            "nueva_fecha_expiracion": nueva_fecha_expiracion.isoformat()
        }
        
    except HTTPException as he:
        db.rollback()
        logger.error(f"Error de validación: {he.detail}")
        raise he
    except Exception as e:
        db.rollback()
        logger.error(f"Error inesperado al actualizar fecha: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Error interno del servidor al actualizar fecha de expiración"
        )