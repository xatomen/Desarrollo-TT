#################################################################
# Router para los endpoints del Backend
#################################################################

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, Date, Time, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
import os
from dotenv import load_dotenv
import pymysql
import mysql.connector
from fastapi import Depends
from datetime import date
from fastapi.middleware.cors import CORSMiddleware

# Instanciamos la clase FastAPI

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#################################################################
# Conexión a la base de datos
#################################################################

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

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#################################################################
# Incluimos las rutas de los endpoints
#################################################################

from routers.calcular_metricas import calcular_metricas
from routers.consultar_encargo import consultar_encargo
from routers.consultar_logs_consultas_realizadas import consultar_logs_consultas_realizadas
from routers.consultar_logs_fiscalizacion import consultar_logs_fiscalizacion
from routers.consultar_logs_obtencion_permisos import consultar_logs_obtencion_permisos
from routers.consultar_multas_patente import consultar_multas_patente
from routers.consultar_permiso_circulacion import consultar_permiso_circulacion
from routers.consultar_revision_tecnica import consultar_revision_tecnica
from routers.consultar_rpi import consultar_rpi
from routers.consultar_soap import consultar_soap
from routers.consultar_valor_permiso import consultar_valor_permiso
from routers.consultar_vehiculos_rut import consultar_vehiculos_rut
from routers.emitir_permiso_circulacion import emitir_permiso_circulacion
from routers.mostrar_informacion_vehicular import mostrar_informacion_vehicular
from routers.obtener_vehiculos_rut import obtener_vehiculos_rut
from routers.recepcionar_solicitud import recepcionar_solicitud

app.include_router(calcular_metricas.router)
app.include_router(consultar_encargo.router)
app.include_router(consultar_logs_consultas_realizadas.router)
app.include_router(consultar_logs_fiscalizacion.router)
app.include_router(consultar_logs_obtencion_permisos.router)
app.include_router(consultar_multas_patente.router)
app.include_router(consultar_permiso_circulacion.router)
app.include_router(consultar_revision_tecnica.router)
app.include_router(consultar_rpi.router)
app.include_router(consultar_soap.router)
app.include_router(consultar_valor_permiso.router)
app.include_router(consultar_vehiculos_rut.router)
app.include_router(emitir_permiso_circulacion.router)
app.include_router(mostrar_informacion_vehicular.router)
app.include_router(obtener_vehiculos_rut.router)
app.include_router(recepcionar_solicitud.router)



