from datetime import date, datetime
from sqlite3 import Date
from xmlrpc.client import Boolean

from requests import Session
from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean as SQLBoolean  # ✅ Agregado DateTime y Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from itertools import cycle
import re
from patentes_vehiculares_chile import validar_patente

#validar formato de rut o cambiar por la librería chilena discutir con mis compañeros
# ---- Utilidad para validar RUT ---- 
def validar_rut(rut: str) -> bool:
    # Verificar que no contenga espacios en blanco
    rut_sin_espacios = rut.strip()
    if len(rut) != len(rut_sin_espacios):
        return False
    
    # Verificar que contenga obligatoriamente el guión
    if "-" not in rut:
        return False
    
    # Normalizar
    rut = rut.replace(".", "").replace("-", "").upper()
    if not re.match(r"^\d{7,8}[0-9K]$", rut):
        return False
    aux = rut[:-1]
    dv = rut[-1]
    revertido = map(int, reversed(aux))
    factores = cycle(range(2, 8))
    s = sum(d * f for d, f in zip(revertido, factores))
    res = (-s) % 11
    if res == 10:
        res = "K"
    else:
        res = str(res)
    return dv == res

# Cargar variables de entorno
load_dotenv()
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_host = os.getenv("DB_HOST")
db_name = os.getenv("DB_NAME")
DATABASE_URL = f"mysql+mysqlconnector://{db_user}:{db_password}@{db_host}/{db_name}"

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Modelos SQLAlchemy ---
class MultaRPI(Base):
    __tablename__ = "MULTAS_RPI"
    id = Column(Integer, primary_key=True, autoincrement=True)
    rut = Column(String(12), index=True)
    rol_causa = Column(String(20))
    anio_causa = Column(Integer)
    nombre_jpl = Column(String(80))
    monto_multa = Column(Integer)

class RegistroTransporte(Base):
    __tablename__ = "REG_TRANSPORTE"
    ppu = Column(String(10), primary_key=True)
    fecha_entrada_rnt = Column(DateTime, nullable=False)  # ✅ Cambiado a DateTime
    tipo_servicio = Column(String(30), nullable=False)
    capacidad = Column(Integer, nullable=False)
    estado_vehiculo = Column(String(30), nullable=False)
    fecha_vencimiento_certificado = Column(DateTime, nullable=False)  # ✅ Cambiado a DateTime
    region = Column(Integer, nullable=False)
    anio_fabricacion = Column(Integer, nullable=False)
    cinturon_obligatorio = Column(SQLBoolean, nullable=False)  # ✅ Cambiado a SQLBoolean
    antiguedad_vehiculo = Column(Integer, nullable=False)
    marca = Column(String(30), nullable=False)
    modelo = Column(String(30), nullable=False)

# --- Modelos Pydantic ---
class MultaRPIResponse(BaseModel):
    rut: str
    rol_causa: str
    anio_causa: int
    nombre_jpl: str
    monto_multa: int

class RegistroTransporteResponse(BaseModel):
    ppu: str
    fecha_entrada_rnt: datetime
    tipo_servicio: str
    capacidad: int
    estado_vehiculo: str
    fecha_vencimiento_certificado: datetime
    region: int
    anio_fabricacion: int
    cinturon_obligatorio: bool
    antiguedad_vehiculo: int
    marca: str
    modelo: str

app = FastAPI(title="API MTT - Registro de Pasajeros Infractores", root_path="/mtt")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ Corregido de [""] a ["*"]
    allow_credentials=True,
    allow_methods=["*"],  # ✅ Corregido de [""] a ["*"]
    allow_headers=["*"],
)

# Configuramos la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def home():
    return {"message": "API MTT - Registro de Pasajeros Infractores"}

@app.get("/multas_pasajero/", response_model=list[MultaRPIResponse])
def consultar_multas_pasajero(rut: str = Query(..., description="RUT del propietario"), db: Session = Depends(get_db)):
    if not rut:
        raise HTTPException(status_code=400, detail="Debe ingresar un RUT.")
    if not validar_rut(rut):
        raise HTTPException(status_code=400, detail="RUT inválido o con formato incorrecto.")
    
    try:
        multas = db.query(MultaRPI).filter(MultaRPI.rut == rut).all()
        if not multas:
            raise HTTPException(status_code=404, detail="No se encontraron multas para este RUT.")
        return [MultaRPIResponse(
            rut=multa.rut,
            rol_causa=multa.rol_causa,
            anio_causa=multa.anio_causa,
            nombre_jpl=multa.nombre_jpl,
            monto_multa=multa.monto_multa
        ) for multa in multas]
    finally:
        db.close()

@app.get("/registro_transporte/", response_model=RegistroTransporteResponse)
def consultar_registro_transporte(ppu: str = Query(..., description="PPU del vehículo"), db: Session = Depends(get_db)):
    if not ppu:
        raise HTTPException(status_code=400, detail="Debe ingresar un PPU.")
    # Validar formato PPU
    if not validar_patente(ppu):
        raise HTTPException(status_code=400, detail="Formato de PPU inválido.")

    try:
        registro = db.query(RegistroTransporte).filter(RegistroTransporte.ppu == ppu).first()
        if not registro:
            raise HTTPException(status_code=404, detail="No se encontró el registro de transporte para este PPU.")
        return RegistroTransporteResponse(
            ppu=registro.ppu,
            fecha_entrada_rnt=registro.fecha_entrada_rnt,
            tipo_servicio=registro.tipo_servicio,
            capacidad=registro.capacidad,
            estado_vehiculo=registro.estado_vehiculo,
            fecha_vencimiento_certificado=registro.fecha_vencimiento_certificado,
            region=registro.region,
            anio_fabricacion=registro.anio_fabricacion,
            cinturon_obligatorio=registro.cinturon_obligatorio,
            antiguedad_vehiculo=registro.antiguedad_vehiculo,
            marca=registro.marca,
            modelo=registro.modelo
        )
    finally:
        db.close()

# Endpoint para eliminar todas las multas de un pasajero dado su RUT (En el caso de que se paguen las multas)
@app.delete("/delete_multas_rpi/", response_model=dict)
def eliminar_multas_pasajero(rut: str = Query(..., description="RUT del propietario"), db: Session = Depends(get_db)):
    if not rut:
        raise HTTPException(status_code=400, detail="Debe ingresar un RUT.")
    if not validar_rut(rut):
        raise HTTPException(status_code=400, detail="RUT inválido o con formato incorrecto.")
    
    try:
        multas = db.query(MultaRPI).filter(MultaRPI.rut == rut).all()
        if not multas:
            raise HTTPException(status_code=404, detail="No se encontraron multas para este RUT.")
        
        for multa in multas:
            db.delete(multa)
        db.commit()
        
        return {"message": f"Se eliminaron {len(multas)} multas para el RUT {rut}."}
    finally:
        db.close()