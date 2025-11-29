# Importamos librerías necesarias
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy import (
    create_engine, Column, Integer, String, DateTime, Date, Boolean,
    func, and_, or_, text, case
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
import os
from dotenv import load_dotenv


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

# Instanciamos el router
router = APIRouter()

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

# Modelo SQL Alchemy para usuarios administradores
class UsuarioAdminModel(Base):
    __tablename__ = "usuarios_admin"
    id = Column(Integer, primary_key=True, index=True)
    rut = Column(String(12), unique=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)

class UsuarioAdmin(BaseModel):
    rut: str
    nombre: str
    email: str
    password: str

class LoginRequest(BaseModel):
    rut: str
    password: str

class TokenModel(BaseModel):
    access_token: str
    token_type: str
    user_info: dict
    expires_in: int


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

@router.post("/login_admin", response_model=TokenModel)
def login_admin(request: Request, credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Endpoint para que un usuario administrador inicie sesión
    """
    # Validar que la contraseña cumpla con los requisitos
    if not validar_contrasena(credentials.password):
        raise HTTPException(status_code=400, detail="Contraseña inválida")

    # Buscar el usuario en la base de datos SOLO por RUT
    try:
        usuario_db = db.query(UsuarioAdminModel).filter(
            UsuarioAdminModel.rut == credentials.rut
        ).first()
    except Exception as e:
        print(f"Error al buscar usuario: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

    if not usuario_db:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    # Verificar la contraseña usando bcrypt
    try:
        # Si la contraseña en la BD está en texto plano (para desarrollo/testing)
        if len(usuario_db.password) < 20:  # Las contraseñas hasheadas son más largas
            # Comparación directa para contraseñas en texto plano
            if credentials.password != usuario_db.password:
                raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
        else:
            # Verificación con bcrypt para contraseñas hasheadas
            if not pwd_context.verify(credentials.password, usuario_db.password):
                raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    except Exception as e:
        print(f"Error al verificar contraseña: {e}")
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    # Crear el token de acceso
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": usuario_db.rut}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_info": {
            "rut": usuario_db.rut,
            "nombre": usuario_db.nombre,
            "email": usuario_db.email
        },
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60  # en segundos
    }

