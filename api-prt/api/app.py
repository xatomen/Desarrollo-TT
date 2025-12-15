from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, Date, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
from dotenv import load_dotenv
from datetime import date
from sqlalchemy.exc import SQLAlchemyError

# Librerías de validación de patente
from patentes_vehiculares_chile import validar_patente, limpiar_patente

# Cargar variables de entorno
load_dotenv()
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_host = os.getenv("DB_HOST")
db_name = os.getenv("DB_NAME")

DATABASE_URL = f"mysql+mysqlconnector://{db_user}:{db_password}@{db_host}/{db_name}"

# Configuración SQLAlchemy
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modelo SQLAlchemy (tabla REVISION_TECNICA)
class RevisionTecnica(Base):
    __tablename__ = 'revision_tecnica'
    id_rev_tecnica = Column(Integer, primary_key=True, autoincrement=True)
    ppu = Column(String(10), nullable=False)
    fecha = Column(Date)
    codigo_planta = Column(String(20))
    planta = Column(String(100))
    nom_certificado = Column(String(100))
    fecha_vencimiento = Column(Date)
    estado = Column(Enum('aprobada', 'rechazada'))

# crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)
#crea una sesión de base de datos

db = SessionLocal()

# Modelo Pydantic para la respuesta
class RevisionTecnicaModel(BaseModel):
    id_rev_tecnica: int
    ppu: str
    fecha: date
    codigo_planta: str
    planta: str
    nom_certificado: str
    fecha_vencimiento: date
    estado: str
    vigencia: str

# FastAPI app
app = FastAPI(title="API PRT - Revisión Técnica", root_path="/prt")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas las orígenes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint de saludo
@app.get("/")
def read_root():
    return {"message": "API de Revisión Técnica (PRT)"}

# GET para obtener revisiones técnicas por PPU devuelta como objeto y devuelve la mas reciente y aprobada
@app.get("/revision_tecnica/{ppu}", response_model=RevisionTecnicaModel)
def get_revision_tecnica(ppu: str):
    if not ppu.isalnum():
        raise HTTPException(status_code=400, detail=f"PPU no puede contener caracteres especiales: {ppu}")
    # Validar formato de patente
    resultado_validacion = validar_patente(ppu)
    if not resultado_validacion:
        raise HTTPException(status_code=400, detail=f"Formato de PPU inválido: {ppu}")

    with SessionLocal() as session:
        # recuperar todas las revisiones técnicas
        revision = session.query(RevisionTecnica).filter(
            RevisionTecnica.ppu == ppu
        ).order_by(RevisionTecnica.fecha.desc())
        if not revision:
            raise HTTPException(status_code=404, detail="Revisión técnica no encontrada")
        
        # iterar sobre las revisiones y buscar si tenemos al menos una aprobada,en el caso de encontrar una aprobada, verificamos la fecha de vencimiento
        revision = next((rev for rev in revision if rev.estado == "aprobada"), None)
        if not revision:
            raise HTTPException(status_code=404, detail="No hay revisiones técnicas aprobadas para este PPU")
        # Verificar la vigencia de la revisión técnica
        fecha_actual = date.today()
        # Obtener la revisión más reciente primero
        revision = session.query(RevisionTecnica).filter(
            RevisionTecnica.ppu == ppu,
            RevisionTecnica.estado == "aprobada"
        ).order_by(RevisionTecnica.fecha.desc()).first()

        if not revision:
            raise HTTPException(status_code=404, detail="No hay revisiones técnicas aprobadas para este PPU")
        
        # Verificar vigencia
        vigencia = "Vigente" if revision.fecha_vencimiento >= fecha_actual else "No vigente"

        return RevisionTecnicaModel(
            id_rev_tecnica=revision.id_rev_tecnica,
            ppu=revision.ppu,
            fecha=revision.fecha,
            codigo_planta=revision.codigo_planta,
            planta=revision.planta,
            nom_certificado=revision.nom_certificado,
            fecha_vencimiento=revision.fecha_vencimiento,
            estado=revision.estado,
            vigencia=vigencia
        )