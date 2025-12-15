########################################################################
# API con el framework FastAPI que interactúa con la base de datos MySQL
# para la base de datos de carabineros
########################################################################

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, Time, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
import os
from dotenv import load_dotenv
import pymysql
import mysql.connector
from fastapi.middleware.cors import CORSMiddleware
from patentes_vehiculares_chile import validar_patente
from datetime import datetime

##############################
# Instancia de FastAPI
##############################

app = FastAPI(root_path="/carabineros")

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

####################################################
# Modelo de datos para la tabla encargos de patente
####################################################

class EncargoPatenteModel(Base):
    __tablename__ = 'encargo_patente' 

    ID = Column(Integer, primary_key=True, index=True)
    PPU = Column(String(10), nullable=False)
    ENCARGO = Column(Boolean, nullable=False)
    PATENTE_DELANTERA = Column(Boolean, nullable=False)
    PATENTE_TRASERA = Column(Boolean, nullable=False)
    VIN = Column(Boolean, nullable=False)
    MOTOR = Column(Boolean, nullable=False)

#######################################
# Función para crear las tablas
#######################################

def create_tables():
    """Create database tables if they don't exist"""
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating tables: {e}")

#########################################################
# Dependencia para obtener la sesión de la base de datos
#########################################################

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#################
# Modelos de API
#################

class EncargoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    ppu: str
    encargo: bool
    patente_delantera: Optional[bool] = None
    patente_trasera: Optional[bool] = None
    vin: Optional[bool] = None
    motor: Optional[bool] = None
    mensaje: str

#########################
# Endpoints de la API
#########################

@app.get("/")
def read_root():
    return {"message": "API de carabineros"}

@app.get("/health")
def health_check():
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

#######################################################
# Get para obtener el encargo por robo de una patente
#######################################################

@app.get("/encargo_patente/{ppu}")
def get_encargo_patente(ppu: str, db: Session = Depends(get_db)):
    try:
        # Validar la patente
        resultado_validacion = validar_patente(ppu.upper())
        if not resultado_validacion:
            raise HTTPException(
                status_code=400, 
                detail="Formato de PPU inválido."
            )
        
        # Buscar en base de datos
        encargo = db.query(EncargoPatenteModel).filter(EncargoPatenteModel.PPU == ppu.upper()).first()
        
        if not encargo:
            return EncargoResponse(
                ppu=ppu.upper(),
                encargo=False,
                patente_delantera=False,
                patente_trasera=False,
                vin=False,
                motor=False,
                mensaje=f"La patente {ppu.upper()} no presenta encargo por robo"
            )

        # Crear respuesta exitosa
        mensaje = "Vehículo con encargo vigente" if encargo.ENCARGO else "Vehículo sin encargo"
        
        return EncargoResponse(
            ppu=encargo.PPU,
            encargo=encargo.ENCARGO,
            patente_delantera=encargo.PATENTE_DELANTERA,
            patente_trasera=encargo.PATENTE_TRASERA,
            vin=encargo.VIN,
            motor=encargo.MOTOR,
            mensaje=mensaje
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail="Error interno del servidor. No se pudo conectar con la base de datos"
        )