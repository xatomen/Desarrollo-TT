# API con el framework FastAPI que interactúa con la base de datos MySQL para la base de datos de encargos por robo
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, validator
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
import re

# Librerías para manejo de seguridad y autenticación
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import secrets
from sqlalchemy import and_, text

#########################################################
# Configuración de seguridad
#########################################################

SECRET_KEY = secrets.token_urlsafe(32)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#########################################################
# Funciones de validación personalizadas
#########################################################

def validar_contrasena(contrasena: str) -> bool:
    """
    Valida que la contraseña cumpla con requisitos básicos
    """
    if not contrasena:
        return False
    
    # Verificar longitud
    if len(contrasena) < 1 or len(contrasena) > 255:
        return False
    
    return True

# Función para encriptar contraseñas
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Función para verificar el token JWT
def verify_token(token: str, credentials_exception):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        rut: str = payload.get("sub")
        if rut is None:
            raise credentials_exception
        return rut
    except JWTError:
        raise credentials_exception

##############################
# Instancia de FastAPI
##############################

app = FastAPI(root_path="/sgd")

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
    __tablename__ = 'sgd'

    id = Column(Integer, primary_key=True, index=True)
    rut = Column(String(12), nullable=False)
    contrasena = Column(String(255), nullable=False)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True)

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

# Crear las tablas al iniciar la aplicación
create_tables()

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
# Modelos Pydantic
#########################

class SGD(BaseModel): 
    id: int
    rut: str
    contrasena: str
    nombre: str
    email: str

# Modelo para recibir credenciales en el POST con validaciones
class CredencialesLogin(BaseModel):
    rut: str
    contrasena: str
    
    @validator('rut')
    def validar_rut_format(cls, v):
        if not v or not v.strip():
            raise ValueError('RUT no puede estar vacío')
        
        # Verificar longitud máxima
        if len(v.strip()) > 12:
            raise ValueError('RUT demasiado largo')
        
        # Verificar caracteres básicos
        if not re.match(r'^[\d\.\-kK\s]+$', v.strip()):
            raise ValueError('RUT contiene caracteres no válidos')
        
        return v.strip()
    
    @validator('contrasena')
    def validar_contrasena_format(cls, v):
        if not v:
            raise ValueError('Contraseña no puede estar vacía')
        
        if len(v) > 255:
            raise ValueError('Contraseña demasiado larga')
        
        return v

# Modelo de respuesta para la validación de clave única
class TokenModel(BaseModel):
    access_token: str
    token_type: str
    user_info: dict
    expires_in: int

#########################
# Endpoints de la API
#########################

# Crear endpoint inicial
@app.get("/")
def read_root():
   return {"message": "API de la secretaría de gobierno digital"}

# POST para consultar validez de clave única
@app.post("/validar_clave_unica", response_model=TokenModel)
def validar_clave_unica(credentials: CredencialesLogin, db: Session = Depends(get_db)):
    """Valida la clave única de un usuario"""
    
    try:
        # Validar que rut no contenga espacios al inicio y al final, comparando la longitud de strings
        rut_sin_espacios = credentials.rut.strip()
        if len(credentials.rut) != len(rut_sin_espacios):
            raise HTTPException(status_code=400, detail="RUT inválido")
        # Validar rut
        if not rut_chile.is_valid_rut(credentials.rut) or not "-" in credentials.rut:
            raise HTTPException(status_code=400, detail="RUT inválido")

        # Validación adicional de la contraseña
        if not validar_contrasena(credentials.contrasena):
            raise HTTPException(status_code=400, detail="Contraseña inválida")
        
        # Buscar usuario en la base de datos
        try:
            user = db.query(SGDModel).filter(
                and_(
                    text("BINARY rut = :rut"),
                    text("BINARY contrasena = :contrasena")
                ).params(
                    {"rut": credentials.rut, "contrasena": credentials.contrasena}
                )
            ).first()
        except Exception as db_error:
            print(f"Error de base de datos: {db_error}")
            raise HTTPException(status_code=500, detail="Error interno del servidor")
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado o contraseña incorrecta")

        # Generar token JWT
        try:
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user.rut}, expires_delta=access_token_expires
            )
        except Exception as token_error:
            print(f"Error generando token: {token_error}")
            raise HTTPException(status_code=500, detail="Error interno del servidor")

        return TokenModel(
            access_token=access_token,
            token_type="bearer",
            user_info={"id": user.id, "rut": user.rut, "nombre": user.nombre, "email": user.email},
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    except HTTPException:
        # Re-lanzar HTTPExceptions tal como están
        raise
    except Exception as e:
        # Capturar cualquier otra excepción no manejada
        print(f"Error inesperado en validar_clave_unica: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# Manejador de excepciones global para casos no capturados
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print(f"Error global no manejado: {exc}")
    return HTTPException(status_code=500, detail="Error interno del servidor")

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