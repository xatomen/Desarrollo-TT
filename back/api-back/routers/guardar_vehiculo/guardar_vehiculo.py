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

# Modelo SQL Alchemy para guardar vehículos
class MisVehiculos(Base):
    __tablename__ = "mis_vehiculos"
    id = Column(Integer, primary_key=True, index=True)
    rut = Column(String(12), nullable=False)
    ppu = Column(String(10), nullable=False)
    nombre_vehiculo = Column(String(100), nullable=False)
    fecha_agregado = Column(DateTime, nullable=False)

# Modelo Pydantic para validación de datos
class MisVehiculosModel(BaseModel):
    rut: str
    ppu: str
    nombre_vehiculo: str
    fecha_agregado: datetime

# Dependencia para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoint para guardar un vehículo
@router.post("/guardar_vehiculo/", response_model=MisVehiculosModel)
def guardar_vehiculo(vehiculo: MisVehiculosModel, db: Session = Depends(get_db)):
    # Validar que el vehículo no esté ya guardado para el rut
    vehiculo_existente = db.query(MisVehiculos).filter(
        MisVehiculos.rut == vehiculo.rut,
        MisVehiculos.ppu == vehiculo.ppu
    ).first()
    
    if vehiculo_existente:
        raise HTTPException(status_code=400, detail="El vehículo ya está guardado para este usuario")
    
    db_vehiculo = MisVehiculos(**vehiculo.dict())
    db.add(db_vehiculo)
    db.commit()
    db.refresh(db_vehiculo)
    return db_vehiculo

# Endpoint para obtener todos los vehículos guardados de un usuario
@router.get("/mis_vehiculos_guardados/{rut}", response_model=List[MisVehiculosModel])
def obtener_mis_vehiculos_guardados(rut: str, db: Session = Depends(get_db)):
    vehiculos = db.query(MisVehiculos).filter(MisVehiculos.rut == rut).all()
    return vehiculos