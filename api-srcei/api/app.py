# API con el framework FastAPI que interactúa con la base de datos MySQL para la base de datos de encargos por robo
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, Time, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
import os
from dotenv import load_dotenv
import pymysql
import mysql.connector

# Conexión a la base de datos
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
# Modelo de datos para la tabla del padrón
class PadronModel(Base):
    __tablename__ = 'padron'
    
    ppu = Column(String(10), primary_key=True, index=True)
    rut = Column(String(20), nullable=False)
    tipo_vehiculo = Column(String(50), nullable=False)
    marca = Column(String(50), nullable=False)
    modelo = Column(String(50), nullable=False)
    anio = Column(Integer, nullable=False)
    color = Column(String(50), nullable=False)
    cilindrada = Column(Integer, nullable=False)
    num_motor = Column(String(50), nullable=False)
    num_chasis = Column(String(50), nullable=False)
    fecha_inscripcion = Column(DateTime, nullable=False)

# Modelo de datos para la tabla multas de transito
class MultasTransitoModel(Base):
    __tablename__ = 'multas_transito'
    
    id = Column(Integer, primary_key=True, index=True)
    ppu = Column(String(10), nullable=False)
    rol_causa = Column(Integer, nullable=False)
    jpl = Column(Integer, nullable=False)

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Crear una sesión de base de datos
# db = SessionLocal()

# Add this dependency function:
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Modelo de datos para el padron
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
    fecha_inscripcion: str 

# Modelo de datos para el padron
class MultasTransito(BaseModel): 
    id: int
    ppu: str
    rol_causa: int
    jpl: int
# Instancia de FastAPI
app = FastAPI()

# Crear endpoint inicial
@app.get("/")
def read_root():
   return {"message": "API de SRCEI"}

# Get para obtener los padrones de vehiculos de un propietario
@app.get("/padron/{rut}", response_model=List[Padron])
def get_padron_by_rut(rut: str, db: Session = Depends(get_db)):
    padrones = db.query(PadronModel).filter(PadronModel.rut == rut).all()
    return [Padron(**padron.__dict__) for padron in padrones]

# Get para obtener las multas de transito de un vehiculo
@app.get("/multas_transito/{ppu}", response_model=List[MultasTransito])
def get_multas_transito_by_ppu(ppu: str, db: Session = Depends(get_db)):
    multas = db.query(MultasTransitoModel).filter(MultasTransitoModel.ppu == ppu).all()
    return [MultasTransito(**multa.__dict__) for multa in multas]

# Get para obtener padron en especifico
@app.get("/padron/vehiculo/{ppu}", response_model=Padron)
def get_padron_by_ppu(ppu: str, db: Session = Depends(get_db)):
    padron = db.query(PadronModel).filter(PadronModel.ppu == ppu).first()
    if not padron:
        raise HTTPException(status_code=404, detail="Padrón no encontrado")
    return Padron(**padron.__dict__)