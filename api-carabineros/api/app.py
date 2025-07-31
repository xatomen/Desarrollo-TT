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
from patentes_vehiculares_chile import validar_patente

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

# Modelo de datos para la tabla encargos de patente
class EncargoPatenteModel(Base):
    __tablename__ = 'encargo_patente'

    id = Column(Integer, primary_key=True, index=True)
    ppu = Column(String(10), nullable=False)
    encargo = Column(Boolean, nullable=False)

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
class EncargoPatente(BaseModel): 
    id: int
    ppu: str
    encargo: bool

# Instancia de FastAPI
app = FastAPI()

# Crear endpoint inicial
@app.get("/")
def read_root():
   return {"message": "API de carabineros"}

# Get para obtener el encargo por robo de una patente
@app.get("/encargo_patente/{ppu}", response_model=EncargoPatente)
def get_encargo_patente(ppu: str, db: Session = Depends(get_db)):
    # Validar la patente
    resultado_validacion = validar_patente(ppu)
    if not resultado_validacion:
        raise HTTPException(status_code=400, detail="Formato de PPU inválido")
    encargo = db.query(EncargoPatenteModel).filter(EncargoPatenteModel.ppu == ppu).first()
    if not encargo:
        raise HTTPException(status_code=404, detail="Encargo no encontrado")
    return EncargoPatente.from_orm(encargo)