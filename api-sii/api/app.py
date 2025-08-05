from fastapi import FastAPI, HTTPException, CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

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
class TasacionFiscal(Base):
    __tablename__ = "TASACION_FISCAL"
    codigo_sii = Column(String(20), primary_key=True)
    tipo = Column(String(50))
    anio = Column(Integer)
    marca = Column(String(50))
    modelo = Column(String(50))
    version = Column(String(50))
    combustible = Column(String(30))
    cilindrada = Column(Integer)
    potencia = Column(Integer)
    marchas = Column(Integer)
    transmision = Column(String(30))
    traccion = Column(String(30))
    puertas = Column(Integer)
    pais = Column(String(50))
    equipamiento = Column(String(100))
    tasacion = Column(Integer)
    num_ejes = Column(Integer)
    valor_permiso = Column(Integer)

class FacturaCompra(Base):
    __tablename__ = "FACTURA_COMPRA"
    num_factura = Column(Integer, primary_key=True)
    precio_neto = Column(Integer)
    puertas = Column(Integer)
    asientos = Column(Integer)
    combustible = Column(String(30))
    peso = Column(String(20))
    transmision = Column(String(30))
    traccion = Column(String(30))
    cilindrada = Column(Integer)
    carga = Column(Integer)
    tipo_sello = Column(String(30))

# Base.metadata.create_all(bind=engine)  # Descomenta si quieres crear las tablas desde el código

# --- Modelos Pydantic ---
class TasacionFiscalResponse(BaseModel):
    tipo: str
    anio: int
    marca: str
    modelo: str
    version: str
    combustible: str
    cilindrada: int
    potencia: int
    marchas: int
    transmision: str
    traccion: str
    puertas: int
    pais: str
    equipamiento: str
    tasacion: int
    num_ejes: int
    valor_permiso: int

class FacturaCompraResponse(BaseModel):
    num_factura: int
    precio_neto: int
    puertas: int
    asientos: int
    combustible: str
    peso: str
    transmision: str
    traccion: str
    cilindrada: int
    carga: int
    tipo_sello: str

app = FastAPI(title="API SII - Tasación y Factura Vehículos")
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
    return {"message": "API SII - Tasación Fiscal y Factura Venta"}

# Endpoint: Consultar Tasación Fiscal
@app.get("/tasacion_fiscal", response_model=TasacionFiscalResponse)
def consultar_tasacion_fiscal(codigo_sii: str):
    row = db.query(TasacionFiscal).filter(TasacionFiscal.codigo_sii == codigo_sii).first()
    if not row:
        raise HTTPException(status_code=404, detail="El Código SII no existe")
    return TasacionFiscalResponse(
        tipo=row.tipo, anio=row.anio, marca=row.marca, modelo=row.modelo,
        version=row.version, combustible=row.combustible, cilindrada=row.cilindrada,
        potencia=row.potencia, marchas=row.marchas, transmision=row.transmision,
        traccion=row.traccion, puertas=row.puertas, pais=row.pais,
        equipamiento=row.equipamiento, tasacion=row.tasacion,
        num_ejes=row.num_ejes, valor_permiso=row.valor_permiso
    )

# Endpoint: Consultar Factura de Venta
@app.get("/factura_venta", response_model=FacturaCompraResponse)
def consultar_factura_venta(num_factura: int):
    row = db.query(FacturaCompra).filter(FacturaCompra.num_factura == num_factura).first()
    if not row:
        raise HTTPException(status_code=404, detail="El N° de Factura no existe")
    return FacturaCompraResponse(
        precio_neto=row.precio_neto, puertas=row.puertas, asientos=row.asientos,
        combustible=row.combustible, peso=row.peso, transmision=row.transmision,
        traccion=row.traccion, cilindrada=row.cilindrada, carga=row.carga,
        tipo_sello=row.tipo_sello
    )
