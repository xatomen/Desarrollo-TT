########################################################################
# API con el framework FastAPI que interactúa con la base de datos MySQL
# para la base de datos de carabineros
########################################################################

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
from fastapi.middleware.cors import CORSMiddleware
from patentes_vehiculares_chile import validar_patente

##############################
# Instancia de FastAPI
##############################

app = FastAPI()

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

    id = Column(Integer, primary_key=True, index=True)
    ppu = Column(String(10), nullable=False)
    encargo = Column(Boolean, nullable=False)

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
        # Don't crash the app if database is not available

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
# Modelo de API
#################

class EncargoPatente(BaseModel): 
    id: int
    ppu: str
    encargo: bool

#########################
# Endpoints de la API
#########################

# Crear endpoint inicial
@app.get("/")
def read_root():
    return {"message": "API de carabineros"}

# Health check endpoint
@app.get("/health")
def health_check():
    try:
        # Test database connection
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

#######################################################
# Get para obtener el encargo por robo de una patente
#######################################################

@app.get("/encargo_patente/{ppu}", response_model=EncargoPatente)
def get_encargo_patente(ppu: str, db: Session = Depends(get_db)):
    # Validar la patente
    try:
        resultado_validacion = validar_patente(ppu)
        if not resultado_validacion:
            raise HTTPException(status_code=400, detail="Formato de PPU inválido")
        
        encargo = db.query(EncargoPatenteModel).filter(EncargoPatenteModel.ppu == ppu).first()
        if not encargo:
            raise HTTPException(status_code=404, detail="Encargo no encontrado")
        
        return EncargoPatente.from_orm(encargo)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error de base de datos: {str(e)}")

# #######################################
# # Evento de inicio para crear tablas
# #######################################

# @app.on_event("startup")
# async def startup_event():
#     """Create tables on startup if database is available"""
#     create_tables()