from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from itertools import cycle
import re

#validar formato de rut o cambiar por la librería chilena discutir con mis compañeros
# ---- Utilidad para validar RUT ---- 
def validar_rut(rut: str) -> bool:
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
# Base.metadata.create_all(bind=engine)  # Descomenta si quieres crear las tablas desde el código

# --- Modelos Pydantic ---
class MultaRPIResponse(BaseModel):
    rut: str
    rol_causa: str
    anio_causa: int
    nombre_jpl: str
    monto_multa: int


app = FastAPI(title="API MTT - Registro de Pasajeros Infractores")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[""],  # Permitir todas las orígenes
    allow_credentials=True,
    allow_methods=[""],
    allow_headers=["*"],
)

db = SessionLocal()


@app.get("/")
def home():
    return {"message": "API MTT - Registro de Pasajeros Infractores"}

@app.get("/multas_pasajero/", response_model=list[MultaRPIResponse])
def consultar_multas_pasajero(rut: str = Query(..., description="RUT del propietario")):
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
