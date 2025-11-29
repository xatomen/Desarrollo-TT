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

# Modelo SQL Alchemy para logs consultas propietarios
class LogConsultaPropietario(Base):
    __tablename__ = "log_consultas_propietarios"
    id = Column(Integer, primary_key=True, index=True)
    rut = Column(String(12), nullable=False)
    ppu = Column(String(10), nullable=False)
    fecha = Column(DateTime, nullable=False)

# Modelo SQL Alchemy para logs fiscalización
class LogFiscalizacion(Base):
    __tablename__ = "log_fiscalizacion"
    id = Column(Integer, primary_key=True, index=True)
    ppu = Column(String(10), nullable=False)
    rut_fiscalizador = Column(String(12), nullable=False)
    fecha = Column(DateTime, nullable=False)
    vigencia_permiso = Column(Integer, nullable=False)  # BOOLEAN as Integer (0/1)
    vigencia_revision = Column(Integer, nullable=False)
    vigencia_soap = Column(Integer, nullable=False)
    encargo_robo = Column(Integer, nullable=False)

# Modelos Pydantic para validación de datos
class LogConsultaPropietarioModel(BaseModel):
    rut: str
    ppu: str
    fecha: datetime

class LogFiscalizacionModel(BaseModel):
    ppu: str
    rut_fiscalizador: str
    fecha: datetime
    vigencia_permiso: int  # BOOLEAN as Integer (0/1)
    vigencia_revision: int
    vigencia_soap: int
    encargo_robo: int

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/logs_consulta_propietario/", status_code=201)
def create_log_consulta_propietario(log: LogConsultaPropietarioModel, db: Session = Depends(get_db)):
    """Create a new log entry for vehicle owner consultation"""
    db_log = LogConsultaPropietario(
        rut=log.rut,
        ppu=log.ppu,
        fecha=log.fecha
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return {"message": "Log entry created successfully", "log_id": db_log.id}

@router.post("/logs_fiscalizacion/", status_code=201)
def create_log_fiscalizacion(log: LogFiscalizacionModel, db: Session = Depends(get_db)):
    """Create a new log entry for vehicle inspection"""
    db_log = LogFiscalizacion(
        ppu=log.ppu,
        rut_fiscalizador=log.rut_fiscalizador,
        fecha=log.fecha,
        vigencia_permiso=log.vigencia_permiso,
        vigencia_revision=log.vigencia_revision,
        vigencia_soap=log.vigencia_soap,
        encargo_robo=log.encargo_robo
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return {"message": "Log entry created successfully", "log_id": db_log.id}