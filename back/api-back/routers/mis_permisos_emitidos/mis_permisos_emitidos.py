from fastapi import APIRouter, HTTPException, Depends, Request
from datetime import date, datetime
import os
from pydantic import BaseModel
from typing import List
import requests 
from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Instanciamos el router
router = APIRouter()

#######################################
# Conexión a la base de datos
#######################################

load_dotenv()
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_host = os.getenv("DB_HOST")
db_name = os.getenv("DB_NAME")
DATABASE_URL = f"mysql+mysqlconnector://{db_user}:{db_password}@{db_host}/{db_name}"
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base de datos declarativa
Base = declarative_base()

# Modelo SQL Alchemy para mis permisos emitidos
class MisPermisosEmitidos(Base):
    __tablename__ = "mis_permisos_emitidos"
    id = Column(Integer, primary_key=True, index=True)
    rut = Column(String(12), nullable=False)
    ppu = Column(String(10), nullable=False)
    fecha_emision = Column(DateTime, nullable=False)
    valor_permiso = Column(Integer, nullable=False)
    tarjeta = Column(String(16), nullable=False)

# Modelo Pydantic para validación de datos
class MisPermisosEmitidosModel(BaseModel):
    rut: str
    ppu: str
    fecha_emision: datetime
    valor_permiso: int
    tarjeta: str

# Dependencia para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoint para guardar un permiso emitido
@router.post("/mis_permisos_emitidos/", response_model=MisPermisosEmitidosModel)
def guardar_permiso_emitido(permiso: MisPermisosEmitidosModel, db: Session = Depends(get_db)):
    # Validar que el permiso no esté ya guardado para el rut y ppu
    existing_permiso = db.query(MisPermisosEmitidos).filter(
        MisPermisosEmitidos.rut == permiso.rut,
        MisPermisosEmitidos.ppu == permiso.ppu,
        MisPermisosEmitidos.fecha_emision == permiso.fecha_emision
    ).first()
    if existing_permiso:
        raise HTTPException(status_code=400, detail="El permiso ya está guardado para este RUT y PPU en la fecha especificada.")
    
    nuevo_permiso = MisPermisosEmitidos(
        rut=permiso.rut,
        ppu=permiso.ppu,
        fecha_emision=permiso.fecha_emision,
        valor_permiso=permiso.valor_permiso,
        tarjeta=permiso.tarjeta
    )
    db.add(nuevo_permiso)
    db.commit()
    db.refresh(nuevo_permiso)
    return nuevo_permiso

# Endpoint para obtener los permisos emitidos por RUT
@router.get("/mis_permisos_emitidos/{rut}", response_model=List[MisPermisosEmitidosModel])
def obtener_permisos_emitidos(rut: str, db: Session = Depends(get_db)):
    permisos = db.query(MisPermisosEmitidos).filter(MisPermisosEmitidos.rut == rut).all()
    return permisos