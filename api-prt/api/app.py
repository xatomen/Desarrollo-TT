from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, Date, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
from dotenv import load_dotenv

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
    __tablename__ = 'REVISION_TECNICA'
    id_rev_tecnica = Column(Integer, primary_key=True, autoincrement=True)
    ppu = Column(String(10), nullable=False)
    fecha = Column(Date)
    codigo_planta = Column(String(20))
    planta = Column(String(100))
    nom_certificado = Column(String(100))
    fecha_vencimiento = Column(Date)
    estado = Column(Enum('vigente', 'rechazada', 'vencida'))

# crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)
#crea una sesión de base de datos

db = SessionLocal()

# Modelo Pydantic para la respuesta
class RevisionTecnicaModel(BaseModel):
    id_rev_tecnica: int
    ppu: str
    fecha: str
    codigo_planta: str
    planta: str
    nom_certificado: str
    fecha_vencimiento: str
    estado: str


# FastAPI app
app = FastAPI(title="API PRT - Revisión Técnica")


# Endpoint de saludo
@app.get("/")
def read_root():
    return {"message": "API de Revisión Técnica (PRT)"}

# GET para obtener revisiones técnicas por PPU devuelta como objeto
@app.get("/revision_tecnica/{ppu}", response_model=RevisionTecnicaModel)
def get_revision(ppu: str):
    revision = db.query(RevisionTecnicaModel).filter(RevisionTecnicaModel.ppu == ppu).first()
    if not revision:
        raise HTTPException(status_code=404, detail="Revisión no encontrada")
    return RevisionTecnicaModel(
        id_rev_tecnica=revision.id_rev_tecnica,
        ppu=revision.ppu,
        fecha=str(revision.fecha),
        codigo_planta=revision.codigo_planta,
        planta=revision.planta,
        nom_certificado=revision.nom_certificado,
        fecha_vencimiento=str(revision.fecha_vencimiento),
        estado=revision.estado
    )

