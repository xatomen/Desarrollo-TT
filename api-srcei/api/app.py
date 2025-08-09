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
from sqlalchemy.exc import OperationalError
import os
from dotenv import load_dotenv
import pymysql
import mysql.connector
from fastapi.middleware.cors import CORSMiddleware
import time
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

# Base de datos declarativa
Base = declarative_base()

# Variables globales para engine y session
engine = None
SessionLocal = None

def create_database_connection(max_retries=30, retry_delay=2):
    """Crear conexión a la base de datos con reintentos"""
    global engine, SessionLocal
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Intento {attempt + 1} de conexión a la base de datos...")
            engine = create_engine(DATABASE_URL, echo=True)
            
            # Probar la conexión
            connection = engine.connect()
            connection.close()
            
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
            logger.info("Conexión a la base de datos establecida exitosamente")
            return True
            
        except Exception as e:
            logger.warning(f"Fallo en el intento {attempt + 1}: {str(e)}")
            if attempt < max_retries - 1:
                logger.info(f"Reintentando en {retry_delay} segundos...")
                time.sleep(retry_delay)
            else:
                logger.error("Se agotaron todos los intentos de conexión")
                raise e
    
    return False

def create_tables():
    """Crear las tablas en la base de datos"""
    try:
        if engine is not None:
            Base.metadata.create_all(bind=engine)
            logger.info("Tablas creadas exitosamente")
        else:
            logger.error("No se puede crear tablas: engine no está inicializado")
    except Exception as e:
        logger.error(f"Error al crear tablas: {str(e)}")
        raise e

####################################################
# Modelo de datos para la tabla Padron
####################################################

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

####################################################
# Modelo de datos para la tabla multas de transito
####################################################

class MultasTransitoModel(Base):
    __tablename__ = 'multas_transito'
    
    id = Column(Integer, primary_key=True, index=True)
    ppu = Column(String(10), nullable=False)
    rol_causa = Column(Integer, nullable=False)
    jpl = Column(Integer, nullable=False)

#########################################################
# Eventos de inicio y cierre de la aplicación
#########################################################

@app.on_event("startup")
async def startup_event():
    """Evento que se ejecuta al iniciar la aplicación"""
    logger.info("Iniciando aplicación...")
    create_database_connection()
    create_tables()
    logger.info("Aplicación iniciada correctamente")

@app.on_event("shutdown")
async def shutdown_event():
    """Evento que se ejecuta al cerrar la aplicación"""
    logger.info("Cerrando aplicación...")
    if engine:
        engine.dispose()

#########################################################
# Dependencia para obtener la sesión de la base de datos
#########################################################

def get_db():
    if SessionLocal is None:
        raise HTTPException(status_code=500, detail="Base de datos no disponible")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#################
# Modelo de API
#################       

from datetime import datetime

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
    fecha_inscripcion: datetime
    
    class Config:
        from_attributes = True

# Modelo de datos para las multas
class MultasTransito(BaseModel): 
    id: int
    ppu: str
    rol_causa: int
    jpl: int
    
    class Config:
        from_attributes = True

#########################
# Endpoints de la API
#########################

# Crear endpoint inicial
@app.get("/")
def read_root():
   return {"message": "API de SRCEI"}

# Get para obtener los padrones de vehiculos de un propietario por RUT
@app.get("/padron/rut/{rut}", response_model=List[Padron])
def get_padron_by_rut(rut: str, db: Session = Depends(get_db)):
    try:
        logger.info(f'RUT recibido: {rut}')
        padrones = db.query(PadronModel).filter(PadronModel.rut == rut).all()
        if not padrones:
            raise HTTPException(status_code=404, detail="No se encontraron vehículos para este RUT")
        
        # Convertir usando from_orm (método correcto)
        return [Padron.from_orm(padron) for padron in padrones]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error en /padron/rut/{rut}: {str(e)}')
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# Get para obtener padron específico por PPU
@app.get("/padron/vehiculo/{ppu}", response_model=Padron)
def get_padron_by_ppu(ppu: str, db: Session = Depends(get_db)):
    try:
        logger.info(f'PPU recibida: {ppu}')
        padron = db.query(PadronModel).filter(PadronModel.ppu == ppu).first()
        if not padron:
            raise HTTPException(status_code=404, detail="Vehículo no encontrado")
        
        return Padron.from_orm(padron)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error en /padron/vehiculo/{ppu}: {str(e)}')
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# Get para obtener las multas de transito de un vehiculo
@app.get("/multas_transito/{ppu}", response_model=List[MultasTransito])
def get_multas_transito_by_ppu(ppu: str, db: Session = Depends(get_db)):
    try:
        logger.info(f'PPU para multas: {ppu}')
        multas = db.query(MultasTransitoModel).filter(MultasTransitoModel.ppu == ppu).all()
        if not multas:
            raise HTTPException(status_code=404, detail="No se encontraron multas para este vehículo")
        
        return [MultasTransito.from_orm(multa) for multa in multas]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error en /multas_transito/{ppu}: {str(e)}')
        raise HTTPException(status_code=500, detail="Error interno del servidor")