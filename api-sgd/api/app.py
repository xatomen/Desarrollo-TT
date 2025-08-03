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
from fastapi.middleware.cors import CORSMiddleware
from rut_chile import rut_chile

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

#####################################################################
# Modelo de datos para la tabla SGD (Secretaría de Gobierno Digital)
#####################################################################

class SGDModel(Base):
    __tablename__ = 'SGD'

    id = Column(Integer, primary_key=True, index=True)
    rut = Column(String(12), nullable=False)
    contrasena = Column(String(255), nullable=False)

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

#########################
# Endpoints de la API
#########################

class SGD(BaseModel): 
    id: int
    rut: str
    contrasena: str

#########################
# Endpoints de la API
#########################

# Crear endpoint inicial
@app.get("/")
def read_root():
   return {"message": "API de la secretaría de gobierno digital"}

# Get para consultar validez de clave única
@app.get("/validar_clave_unica/{rut}/{contrasena}", response_model=SGD)
def validar_clave_unica(rut: str, contrasena: str, db: Session = Depends(get_db)):
    """Valida la clave única de un usuario"""
    if not rut_chile.validar_rut(rut):
        raise HTTPException(status_code=400, detail="RUT inválido")
    
    user = db.query(SGDModel).filter(SGDModel.rut == rut, SGDModel.contrasena == contrasena).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado o contraseña incorrecta")
    
    return SGD(id=user.id, rut=user.rut, contrasena=user.contrasena)

# # Endpoint para crear datos de prueba (solo para desarrollo)
# @app.post("/crear_datos_prueba")
# def crear_datos_prueba(db: Session = Depends(get_db)):
#     """Crear datos de prueba en la base de datos"""
#     try:
#         # Verificar si ya existen datos
#         existing_count = db.query(SGDModel).count()
#         if existing_count > 0:
#             return {"message": f"Ya existen {existing_count} registros en la base de datos"}
        
#         # Datos de prueba con RUTs válidos chilenos
#         test_users = [
#             SGDModel(rut="12345678-9", contrasena="password123"),
#             SGDModel(rut="98765432-1", contrasena="clave456"),
#             SGDModel(rut="11111111-1", contrasena="test789"),
#             SGDModel(rut="22222222-2", contrasena="demo321"),
#             SGDModel(rut="15678234-6", contrasena="secreto654")
#         ]
        
#         # Insertar datos
#         for user in test_users:
#             db.add(user)
        
#         db.commit()
        
#         return {
#             "message": "Datos de prueba creados exitosamente",
#             "usuarios_creados": len(test_users),
#             "datos": [{"rut": user.rut, "contrasena": user.contrasena} for user in test_users]
#         }
        
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail=f"Error al crear datos de prueba: {str(e)}")

# # Endpoint para listar todos los usuarios (solo para desarrollo)
# @app.get("/listar_usuarios")
# def listar_usuarios(db: Session = Depends(get_db)):
#     """Listar todos los usuarios de la base de datos"""
#     try:
#         users = db.query(SGDModel).all()
#         return {
#             "total_usuarios": len(users),
#             "usuarios": [{"id": user.id, "rut": user.rut, "contrasena": user.contrasena} for user in users]
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error al listar usuarios: {str(e)}")