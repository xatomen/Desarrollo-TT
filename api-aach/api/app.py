# API con el framework FastAPI que interactúa con la base de datos MySQL para la base de datos de encargos por robo
from fastapi import FastAPI, HTTPException
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

# Modelo de datos para la tabla soap
class SoapModel(Base):
    __tablename__ = 'soap'
    
    num_poliza = Column(Integer, primary_key=True, autoincrement=True)
    ppu = Column(String(10), nullable=False)
    rige_desde = Column(DateTime, nullable=False)
    rige_hasta = Column(DateTime, nullable=False)
    prima = Column(Integer, nullable=False)

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Crear una sesión de base de datos
db = SessionLocal()

# Modelo de datos para el SOAP
class SoapModel(BaseModel):
    num_poliza: int
    ppu: str
    rige_desde: str  # Fecha en formato ISO 8601
    rige_hasta: str  # Fecha en formato ISO 8601
    prima: int

# Instancia de FastAPI
app = FastAPI()

# Crear endpoint inicial
@app.get("/")
def read_root():
    return {"message": "API de Encargos por Robo"}

# GET para consultar el SOAP
@app.get("/soap/{ppu}", response_model=SoapModel)
def get_soap(ppu: str):
    soap = db.query(SoapModel).filter(SoapModel.ppu == ppu).first()
    if not soap:
        raise HTTPException(status_code=404, detail="SOAP no encontrado")
    return SoapModel(num_poliza=soap.num_poliza, ppu=soap.ppu, rige_desde=soap.rige_desde, rige_hasta=soap.rige_hasta, prima=soap.prima)