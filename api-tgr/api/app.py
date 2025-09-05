#####################################################################################
# API con el framework FastAPI que interactúa con la base de datos MySQL para la
# base de datos de la Tesorería General de la República
#####################################################################################

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, Time, Boolean, and_, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
import os
from dotenv import load_dotenv
import pymysql
import mysql.connector
from fastapi import Depends
from datetime import date
from fastapi.middleware.cors import CORSMiddleware
import re

# Librerías para validar formatos
from patentes_vehiculares_chile import (
    validar_patente,
    detectar_tipo_patente,
    limpiar_patente,
    validar_rut,
    validar_patente,
    generar_patente_vehiculo_antiguo,
    generar_patente_vehiculo_nuevo,
    generar_patente_motocicleta_antigua,
    generar_patente_motocicleta_nueva,
    generar_rut
)

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
    cvv = Column(Integer, nullable=False)
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

class PermisoCirculacionUploadModel(BaseModel):
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
    numero_tarjeta: str
    titular: str
    mes_vencimiento: int  # Fecha en formato MM-YY
    anio_vencimiento: int  # Fecha en formato MM-YY
    tipo_tarjeta: str  # Puede ser 'crédito' o 'débito'
    cvv: int

class ConfirmacionPagoModel(BaseModel):
    # id: int  # Aquí deberías generar un ID único
    numero_tarjeta: str
    monto_pago: int
    fecha_pago: date  # Fecha en formato ISO 8601
    estado: str  # Puede ser 'exitoso' o 'fallido'

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
    permiso = db.query(PermisoCirculacion).filter(PermisoCirculacion.ppu == ppu).order_by(PermisoCirculacion.fecha_emision.desc()).first()
    if not permiso:
        raise HTTPException(status_code=404, detail="Permiso de circulación no encontrado")
    return PermisoCirculacionModel(
        id=permiso.id,
        ppu=permiso.ppu,
        rut=permiso.rut,
        nombre=permiso.nombre,
        fecha_emision=permiso.fecha_emision,
        fecha_expiracion=permiso.fecha_expiracion,
        valor_permiso=permiso.valor_permiso,
        motor=permiso.motor,
        chasis=permiso.chasis,
        tipo_vehiculo=permiso.tipo_vehiculo,
        color=permiso.color,
        marca=permiso.marca,
        modelo=permiso.modelo,
        anio=permiso.anio,
        carga=permiso.carga,
        tipo_sello=permiso.tipo_sello,
        combustible=permiso.combustible,
        cilindrada=permiso.cilindrada,
        transmision=permiso.transmision,
        pts=permiso.pts,
        ast=permiso.ast,
        equipamiento=permiso.equipamiento,
        codigo_sii=permiso.codigo_sii,
        tasacion=permiso.tasacion
    )

# POST - Endpoint para cargar un nuevo Permiso de Circulación
@app.post("/subir_permiso/", response_model=PermisoCirculacionUploadModel)
def cargar_permiso_circulacion(permiso: PermisoCirculacionUploadModel, db: Session = Depends(get_db)):
    # # Verificar si el PPU ya existe
    nuevo_permiso = PermisoCirculacion(**permiso.dict())
    db.add(nuevo_permiso)
    db.commit()
    db.refresh(nuevo_permiso)
    return PermisoCirculacionUploadModel(
        ppu=nuevo_permiso.ppu,
        rut=nuevo_permiso.rut,
        nombre=nuevo_permiso.nombre,
        fecha_emision=nuevo_permiso.fecha_emision,
        fecha_expiracion=nuevo_permiso.fecha_expiracion,
        valor_permiso=nuevo_permiso.valor_permiso,
        motor=nuevo_permiso.motor,
        chasis=nuevo_permiso.chasis,
        tipo_vehiculo=nuevo_permiso.tipo_vehiculo,
        color=nuevo_permiso.color,
        marca=nuevo_permiso.marca,
        modelo=nuevo_permiso.modelo,
        anio=nuevo_permiso.anio,
        carga=nuevo_permiso.carga,
        tipo_sello=nuevo_permiso.tipo_sello,
        combustible=nuevo_permiso.combustible,
        cilindrada=nuevo_permiso.cilindrada,
        transmision=nuevo_permiso.transmision,
        pts=nuevo_permiso.pts,
        ast=nuevo_permiso.ast,
        equipamiento=nuevo_permiso.equipamiento,
        codigo_sii=nuevo_permiso.codigo_sii,
        tasacion=nuevo_permiso.tasacion
    )

# POST - Endpoint para validar las credenciales de fiscalizador
@app.post("/validar_credenciales/", response_model=TokenModel)
def validar_credenciales(credenciales: LoginModel, db: Session = Depends(get_db)):
    # Verificar que el RUT y la contraseña no estén vacíos
    if not credenciales.rut or not credenciales.contrasena:
        raise HTTPException(status_code=400, detail="RUT y contraseña son obligatorios")
    # Verificar que el RUT no contenga espacios
    if credenciales.rut != credenciales.rut.strip():
        raise HTTPException(status_code=400, detail="RUT no puede contener espacios")
    # Verificar que no tenga caracteres especiales (Solo puede tener números, un guión y una k)
    if not re.match(r"^\d{1,8}-[\dkK]$", credenciales.rut):
        raise HTTPException(status_code=400, detail="RUT inválido")
    # Verificar que el RUT tenga un formato válido
    if not rut_chile.is_valid_rut(credenciales.rut) or "-" not in credenciales.rut:
        raise HTTPException(status_code=400, detail="RUT inválido")
    # Verificar las credenciales en la base de datos
    usuario = db.query(Credenciales).filter(
        and_(
            text("BINARY rut = :rut"),
            text("BINARY contrasena = :contrasena")
        ).params(
            {"rut": credenciales.rut, "contrasena": credenciales.contrasena}
        )
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

# POST - Endpoint para simular el proceso de pago
@app.post("/procesar_pago/", response_model=ConfirmacionPagoModel)
def procesar_pago(tarjeta: TarjetasModel, db: Session = Depends(get_db), monto_pago: int = 0):
    # Validar el formato del número de tarjeta
    if len(tarjeta.numero_tarjeta) != 16 or not tarjeta.numero_tarjeta.isdigit():
        raise HTTPException(status_code=400, detail="Datos de tarjeta inválidos")
    # Convertir la fecha de vencimiento a un objeto date
    try:
        fecha_vencimiento = date(
            year=2000+tarjeta.anio_vencimiento, # Ejemplo: 23 para 2023
            month=tarjeta.mes_vencimiento,      # Ejemplo: 12 para diciembre
            day=1                               # Asumimos el primer día del mes para simplificar
        )
    # Si la fecha de vencimiento no es válida, lanzar una excepción HTTP 400
    except ValueError:
        raise HTTPException(status_code=400, detail="Fecha inválida")
    # Validar la fecha de vencimiento
    if fecha_vencimiento < date.today():
        raise HTTPException(status_code=400, detail="Tarjeta vencida")
    # Validar si la tarjeta coincide con alguna tarjeta registrada en la base de datos
    existing_tarjeta = db.query(Tarjetas).filter(Tarjetas.numero_tarjeta == tarjeta.numero_tarjeta).first()
    if not existing_tarjeta:
        raise HTTPException(status_code=404, detail="Datos de tarjeta inválidos")
    # Validar que los datos de la tarjeta coincidan
    if (existing_tarjeta.titular != tarjeta.titular or
        existing_tarjeta.fecha_vencimiento != fecha_vencimiento or
        existing_tarjeta.tipo_tarjeta != tarjeta.tipo_tarjeta or
        existing_tarjeta.cvv != tarjeta.cvv):
        raise HTTPException(status_code=400, detail="Datos de tarjeta inválidos")
    # Validar el saldo de la tarjeta
    if existing_tarjeta.saldo < monto_pago:
        raise HTTPException(status_code=400, detail="Saldo insuficiente en la tarjeta")
    # Si todo es válido, proceder con el pago
    confirmacion_pago = ConfirmacionPagoModel(
        # id=1,  # Aquí deberías generar un ID único
        numero_tarjeta=tarjeta.numero_tarjeta,
        monto_pago=monto_pago,
        fecha_pago=date.today(),
        estado="exitoso"
    )
    return confirmacion_pago