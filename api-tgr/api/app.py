#####################################################################################
# API con el framework FastAPI que interactúa con la base de datos MySQL para la
# base de datos de la Tesorería General de la República
#####################################################################################

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
from fastapi import Depends
from datetime import date
from fastapi.middleware.cors import CORSMiddleware

# Librerías para validar formatos
from patentes_vehiculares_chile import validar_patente, detectar_tipo_patente, limpiar_patente
from rut_chile import rut_chile

# Librerías para manejo de seguridad y autenticación
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import secrets

#########################################################
# Configuración de seguridad
#########################################################

SECRET_KEY = secrets.token_urlsafe(32)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

#########################################################
# Instancia de FastAPI
#########################################################

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

class PermisoCirculacion(Base):
    __tablename__ = 'permiso_circulacion'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    ppu = Column(String(10), nullable=False)
    rut = Column(String(12), nullable=False)
    nombre = Column(String(100), nullable=False)
    fecha_emision = Column(DateTime, nullable=False)
    fecha_expiracion = Column(DateTime, nullable=False)
    valor_permiso = Column(Integer, nullable=False)
    motor = Column(Integer, nullable=False)
    chasis = Column(String(50), nullable=False)
    tipo_vehiculo = Column(String(50), nullable=False)
    color = Column(String(50), nullable=False)
    marca = Column(String(50), nullable=False)
    modelo = Column(String(50), nullable=False)
    anio = Column(Integer, nullable=False)
    carga = Column(Integer, nullable=False)
    tipo_sello = Column(String(50), nullable=False)
    combustible = Column(String(50), nullable=False)
    cilindrada = Column(Integer, nullable=False)
    transmision = Column(String(50), nullable=False)
    pts = Column(Integer, nullable=False)
    ast = Column(Integer, nullable=False)
    equipamiento = Column(String(100), nullable=False)
    codigo_sii = Column(String(20), nullable=False)
    tasacion = Column(Integer, nullable=False)
    
class Credenciales(Base):
    __tablename__ = 'credenciales'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    rut = Column(String(12), nullable=False)
    nombre = Column(String(100), nullable=False)
    contrasena = Column(String(100), nullable=False)
    rol = Column(String(20), nullable=False)  # Puede ser 'usuario' o 'administrador'

class Tarjetas(Base):
    __tablename__ = 'tarjetas'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    numero_tarjeta = Column(String(16), nullable=False)
    titular = Column(String(100), nullable=False)
    fecha_vencimiento = Column(DateTime, nullable=False)
    tipo_tarjeta = Column(String(20), nullable=False)  # Puede ser 'credito' o 'debito'
    banco = Column(String(50), nullable=False)
    cvv = Column(String(3), nullable=False)
    saldo = Column(Integer, nullable=False)


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

class PermisoCirculacionModel(BaseModel):
    id: int
    ppu: str
    rut: str
    nombre: str
    fecha_emision: date  # Fecha en formato ISO 8601
    fecha_expiracion: date  # Fecha en formato ISO 8601
    valor_permiso: int
    motor: int
    chasis: str
    tipo_vehiculo: str
    color: str
    marca: str
    modelo: str
    anio: int
    carga: int
    tipo_sello: str
    combustible: str
    cilindrada: int
    transmision: str
    pts: int
    ast: int
    equipamiento: str
    codigo_sii: str
    tasacion: int

class CredencialesModel(BaseModel):
    id: int
    rut: str
    nombre: str
    contrasena: str
    rol: str  # Puede ser 'usuario' o 'administrador'

class LoginModel(BaseModel):
    rut: str
    contrasena: str

class TokenModel(BaseModel):
    access_token: str
    token_type: str
    user_info: dict
    expires_in: int

class TarjetasModel(BaseModel):
    id: int
    numero_tarjeta: str
    titular: str
    fecha_vencimiento: date  # Fecha en formato ISO 8601
    tipo_tarjeta: str  # Puede ser 'credito' o 'debito'
    banco: str
    cvv: str
    saldo: int

#########################################################
# Endpoints de la API
#########################################################

# GET - Endpoint inicial
@app.get("/")
def read_root():
    return {"message": "API de la Tesorería General de la República"}

# GET - Endpoint para consultar el Permiso de Circulación a través del PPU
@app.get("/consultar_permiso/{ppu}", response_model=PermisoCirculacionModel)
def get_permiso_circulacion(ppu: str, db: Session = Depends(get_db)):
    # Validar el formato del PPU
    resultado_validacion = validar_patente(ppu)
    if not resultado_validacion:
        raise HTTPException(status_code=400, detail="Formato de PPU inválido")
    # Obtener el permiso de circulación desde la base de datos
    permiso = db.query(PermisoCirculacion).filter(PermisoCirculacion.ppu == ppu).first()
    if not permiso:
        raise HTTPException(status_code=404, detail="Permiso de circulación no encontrado")
    return PermisoCirculacionModel.from_orm(permiso)

# POST - Endpoint para cargar un nuevo Permiso de Circulación
@app.post("/subir_permiso/", response_model=PermisoCirculacionModel)
def cargar_permiso_circulacion(permiso: PermisoCirculacionModel, db: Session = Depends(get_db)):
    # Verificar si el PPU ya existe
    existing_permiso = db.query(PermisoCirculacion).filter(PermisoCirculacion.ppu == permiso.ppu).first()
    if existing_permiso:
        raise HTTPException(status_code=400, detail="El PPU ya está registrado")
    # Crear una nueva instancia del modelo de base de datos
    nuevo_permiso = PermisoCirculacion(**permiso.dict())
    db.add(nuevo_permiso)
    db.commit()
    db.refresh(nuevo_permiso)
    return PermisoCirculacionModel.from_orm(nuevo_permiso)

# POST - Endpoint para validar las credenciales de fiscalizador
@app.post("/validar_credenciales/", response_model=TokenModel)
def validar_credenciales(credenciales: LoginModel, db: Session = Depends(get_db)):
    # Verificar que el RUT y la contraseña no estén vacíos
    if not credenciales.rut or not credenciales.contrasena:
        raise HTTPException(status_code=400, detail="RUT y contraseña son obligatorios")
    # Verificar que el RUT tenga un formato válido
    try:
        rut_chile.is_valid_rut(credenciales.rut)
    except ValueError:
        raise HTTPException(status_code=400, detail="RUT inválido")
    # Verificar las credenciales en la base de datos
    usuario = db.query(Credenciales).filter(
        Credenciales.rut == credenciales.rut,
        Credenciales.contrasena == credenciales.contrasena
    ).first()
    # Si las credenciales son incorrectas, lanzar una excepción HTTP 401
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales inválidas", headers={"WWW-Authenticate": "Bearer"})
    # Si las credenciales son correctas, creamos el token de acceso
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": usuario.rut},
        expires_delta=access_token_expires
    )
    return TokenModel(
        access_token=access_token,
        token_type="bearer",
        user_info={
            "rut": usuario.rut,
            "nombre": usuario.nombre,
            "rol": usuario.rol
        },
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
