# API con el framework FastAPI que interactúa con la base de datos MySQL para la base de datos de encargos por robo
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, Date, Time, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
import os
from dotenv import load_dotenv
import pymysql
import mysql.connector
from fastapi import Depends
from datetime import date
from fastapi.middleware.cors import CORSMiddleware
from patentes_vehiculares_chile import validar_patente, detectar_tipo_patente, limpiar_patente

#########################################################
# Instancia de FastAPI
#########################################################

app = FastAPI(root_path="/aach")

#########################################################
# Configurar Middleware CORS
#########################################################

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas las orígenes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#########################################################
# Conexión a la base de datos
#########################################################

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

#########################################################
# Modelo de Base de Datos (ORM)
#########################################################

class Soap(Base):
    __tablename__ = 'soap'
    
    num_poliza = Column(Integer, primary_key=True, autoincrement=True)
    ppu = Column(String(10), nullable=False)
    compania = Column(String(50), nullable=False)
    rige_desde = Column(Date, nullable=False)
    rige_hasta = Column(Date, nullable=False)
    prima = Column(Integer, nullable=False)

#########################################################
# Crear las tablas en la base de datos
#########################################################
Base.metadata.create_all(bind=engine)

#########################################################
# Crear una sesión de base de datos
#########################################################

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#########################################################
# Modelo de API
#########################################################

class SoapModel(BaseModel):
    num_poliza: int
    ppu: str
    compania: str
    rige_desde: date  # Fecha en formato ISO 8601
    rige_hasta: date  # Fecha en formato ISO 8601
    prima: int
    vigencia: Optional[str] = None  # Vigencia del SOAP, puede ser "Vigente" o "No Vigente"

#########################################################
# Endpoints de la API
#########################################################

# GET - Endpoint inicial
@app.get("/")
def read_root():
    return {"message": "API de Encargos por Robo"}

# GET - Endpoint para consultar el SOAP a través del PPU
@app.get("/soap/{ppu}", response_model=SoapModel)   # Para la respuesta usamos el BaseModel
def get_soap(ppu: str, db: Session = Depends(get_db)):
    # Validar el formato del PPU
    resultado_validacion = validar_patente(ppu)
    if not resultado_validacion:
        raise HTTPException(status_code=400, detail=f"Formato de PPU inválido: {ppu}")
    # Obtener la fecha actual
    fecha_actual = date.today()
    # Para la Query usamos el modelo de la Base de Datos
    # Recuperar el registro con la fecha de rige_hasta más alta para el PPU dado
    soap = db.query(Soap).filter(Soap.ppu == ppu).order_by(Soap.rige_hasta.desc()).first()
    # Si recuperamos el SOAP, calculamos la vigencia
    if soap:
        # Si la fecha de "rige hasta" es mayor o igual a la fecha actual, el SOAP está vigente
        # En caso contrario, no está vigente
        vigencia = "Vigente" if soap.rige_hasta.date() >= fecha_actual else "No Vigente"
        # Asignamos la vigencia al modelo de respuesta
        soap.vigencia = vigencia
    # Si no se encuentra el SOAP, lanzamos una excepción HTTP 404 indicando que no se encontró el SOAP
    if not soap:
        raise HTTPException(status_code=404, detail="SOAP no encontrado")
    # Retornamos el modelo de respuesta con los datos del SOAP
    return SoapModel(
        num_poliza=soap.num_poliza,
        ppu=soap.ppu,
        compania=soap.compania,
        rige_desde=soap.rige_desde,
        rige_hasta=soap.rige_hasta,
        prima=soap.prima,
        vigencia=vigencia
    )

@app.post("/create_soap/", response_model=SoapModel)
def create_soap(soap: SoapModel, db: Session = Depends(get_db)):
    # Validar el formato del PPU
    if not validar_patente(soap.ppu):
        raise HTTPException(status_code=400, detail="Formato de PPU inválido")
    # Crear una nueva instancia del modelo de base de datos
    new_soap = Soap(
        ppu=soap.ppu,
        compania=soap.compania,
        rige_desde=soap.rige_desde,
        rige_hasta=soap.rige_hasta,
        prima=soap.prima
    )
    # Agregar a la sesión y hacer commit
    db.add(new_soap)
    db.commit()
    db.refresh(new_soap)
    # Retornar el nuevo SOAP creado
    return SoapModel(
        num_poliza=new_soap.num_poliza,
        ppu=new_soap.ppu,
        compania=new_soap.compania,
        rige_desde=new_soap.rige_desde,
        rige_hasta=new_soap.rige_hasta,
        prima=new_soap.prima
    )

#####################################################
# Endpoints utilizados para validar los formatos de
# las PPU que agregué para probar la API
#####################################################

# # GET - Endpoint para devolver el listado de todas las PPU (solo PPU) inválidas en cuanto a formato
# @app.get("/ppu/invalid", response_model=List[str])
# def get_invalid_ppu(db: Session = Depends(get_db)):
#     # Recuperamos todas las PPU de la tabla SOAP
#     soap_list = db.query(Soap.ppu).all()
#     # Si no hay SOAP, retornamos una lista vacía
#     if not soap_list:
#         return []
#     # Filtramos las PPU inválidas
#     invalid_ppu = [soap.ppu for soap in soap_list if not validar_patente(soap.ppu)]
#     # Retornamos una lista de PPU inválidas
#     return invalid_ppu

# # GET - Endpoint para devolver el listado de todas las PPU (solo PPU)
# @app.get("/ppu/list", response_model=List[str])
# def get_all_ppu(db: Session = Depends(get_db)):
#     # Recuperamos todas las PPU de la tabla SOAP
#     soap_list = db.query(Soap.ppu).all()
#     # Si no hay SOAP, retornamos una lista vacía
#     if not soap_list:
#         return []
#     # Retornamos una lista de PPU
#     return [soap.ppu for soap in soap_list]