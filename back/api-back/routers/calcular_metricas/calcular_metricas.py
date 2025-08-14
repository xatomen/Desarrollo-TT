from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy import (
    create_engine, Column, Integer, String, DateTime, Date, Boolean,
    func, and_, or_, text
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Any
import os
from dotenv import load_dotenv

# Instanciamos el router
router = APIRouter()

############################################
# DB
############################################
load_dotenv()
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_host = os.getenv("DB_HOST")
db_name = os.getenv("DB_NAME")
DATABASE_URL = f"mysql+mysqlconnector://{db_user}:{db_password}@{db_host}/{db_name}"
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

############################################
# MODELOS SQLALCHEMY 
############################################

class LogFiscalizacion(Base):
    __tablename__ = "log_fiscalizacion"
    id = Column(Integer, primary_key=True, autoincrement=True)
    ppu = Column(String(10), nullable=False)
    rut_fiscalizador = Column(String(12), nullable=False)
    fecha = Column(DateTime, nullable=False)
    vigencia_permiso = Column(Boolean, nullable=False)
    vigencia_revision = Column(Boolean, nullable=False)
    vigencia_soap = Column(Boolean, nullable=False)
    encargo_robo = Column(Boolean, nullable=False)

class LogConsultasPropietarios(Base):
    __tablename__ = "log_consultas_propietarios"
    id = Column(Integer, primary_key=True, autoincrement=True)
    rut = Column(String(12), nullable=False)
    ppu = Column(String(10), nullable=False)
    fecha = Column(DateTime, nullable=False)

class PermisoCirculacion(Base):
    __tablename__ = "permiso_circulacion"
    id = Column(Integer, primary_key=True, autoincrement=True)
    ppu = Column(String(10), nullable=False)
    rut = Column(String(12), nullable=False)
    nombre = Column(String(100), nullable=False)
    fecha_emision = Column(Date, nullable=False)
    fecha_expiracion = Column(Date, nullable=False)
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

def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        print("Tablas creadas/actualizadas correctamente")
    except Exception as e:
        print(f"Error creando tablas: {e}")

############################################
# Utilidades métricas (sin SQL crudo)
############################################
def _parse_date(date_str: str) -> datetime:
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Formato de fecha inválido: {date_str}. Use YYYY-MM-DD")

def _period_expr(period_type: str, dt_col):
    if period_type == "DIA":
        return func.date(dt_col)                  # 'YYYY-MM-DD'
    elif period_type == "MES":
        return func.date_format(dt_col, "%Y-%m")  # 'YYYY-MM'
    elif period_type == "AÑO":
        return func.year(dt_col)                  # 2025
    return func.date(dt_col)

def _metricas_fiscalizacion(df: datetime, dt: datetime, period_type: str, db: Session) -> Dict[str, Any]:
    filtro = and_(func.date(LogFiscalizacion.fecha) >= df.date(),
                  func.date(LogFiscalizacion.fecha) <= dt.date())

    total = db.query(func.count(text("1"))).filter(filtro).scalar() or 0

    al_dia = db.query(func.sum(
        # case/when para portabilidad
        func.case(
            (
                and_(
                    LogFiscalizacion.vigencia_permiso == True,
                    LogFiscalizacion.vigencia_revision == True,
                    LogFiscalizacion.vigencia_soap == True,
                    LogFiscalizacion.encargo_robo == False
                ),
                1
            ),
            else_=0
        )
    )).filter(filtro).scalar() or 0

    con_prob = db.query(func.sum(
        func.case(
            (
                or_(
                    LogFiscalizacion.vigencia_permiso == False,
                    LogFiscalizacion.vigencia_revision == False,
                    LogFiscalizacion.vigencia_soap == False,
                    LogFiscalizacion.encargo_robo == True
                ),
                1
            ),
            else_=0
        )
    )).filter(filtro).scalar() or 0

    kpi_ok = round((al_dia/total)*100, 1) if total else 0.0
    kpi_bad = round((con_prob/total)*100, 1) if total else 0.0

    per = _period_expr(period_type, LogFiscalizacion.fecha)

    serie_cond = (
        db.query(
            per.label("periodo"),
            func.sum(func.case((
                and_(
                    LogFiscalizacion.vigencia_permiso == True,
                    LogFiscalizacion.vigencia_revision == True,
                    LogFiscalizacion.vigencia_soap == True,
                    LogFiscalizacion.encargo_robo == False
                ), 1), else_=0)).label("al_dia"),
            func.sum(func.case((
                or_(
                    LogFiscalizacion.vigencia_permiso == False,
                    LogFiscalizacion.vigencia_revision == False,
                    LogFiscalizacion.vigencia_soap == False,
                    LogFiscalizacion.encargo_robo == True
                ), 1), else_=0)).label("con_problemas"),
        ).filter(filtro).group_by(per).order_by(per).all()
    )

    serie_miles = (
        db.query(
            per.label("periodo"),
            func.round(func.count(text("1"))/1000.0, 2).label("miles_fiscalizados")
        ).filter(filtro).group_by(per).order_by(per).all()
    )

    detalle = (
        db.query(
            LogFiscalizacion.ppu,
            LogFiscalizacion.fecha,
            LogFiscalizacion.vigencia_permiso,
            LogFiscalizacion.vigencia_revision,
            LogFiscalizacion.vigencia_soap,
            LogFiscalizacion.encargo_robo,
            func.coalesce(PermisoCirculacion.marca, "N/A").label("marca"),
            func.coalesce(PermisoCirculacion.modelo, "N/A").label("modelo"),
            func.coalesce(PermisoCirculacion.anio, 0).label("anio"),
        )
        .outerjoin(PermisoCirculacion, PermisoCirculacion.ppu == LogFiscalizacion.ppu)
        .filter(filtro)
        .order_by(LogFiscalizacion.fecha.desc())
        .limit(100)
        .all()
    )

    return {
        "kpi": {
            "documentos_al_dia_pct": kpi_ok,
            "vencidos_o_encargo_pct": kpi_bad
        },
        "charts": {
            "vehiculos_por_condicion": [
                {"periodo": str(r.periodo), "al_dia": int(r.al_dia or 0), "con_problemas": int(r.con_problemas or 0)}
                for r in serie_cond
            ],
            "miles_fiscalizados": [
                {"periodo": str(r.periodo), "miles": float(r.miles_fiscalizados)} for r in serie_miles
            ],
            "pie_documentos": {"al_dia": kpi_ok, "con_problemas": kpi_bad}
        },
        "tables": {
            "vehiculos": [
                {
                    "ppu": r.ppu,
                    "fecha": r.fecha.strftime("%Y-%m-%d %H:%M:%S"),
                    "vigencia_permiso": bool(r.vigencia_permiso),
                    "vigencia_revision": bool(r.vigencia_revision),
                    "vigencia_soap": bool(r.vigencia_soap),
                    "encargo_robo": bool(r.encargo_robo),
                    "marca": r.marca,
                    "modelo": r.modelo,
                    "anio": int(r.anio or 0)
                } for r in detalle
            ]
        }
    }

def _metricas_consultas(df: datetime, dt: datetime, period_type: str, db: Session) -> Dict[str, Any]:
    filtro = and_(func.date(LogConsultasPropietarios.fecha) >= df.date(),
                  func.date(LogConsultasPropietarios.fecha) <= dt.date())

    tot_row = db.query(
        func.count(text("1")).label("total_consultas"),
        func.count(func.distinct(LogConsultasPropietarios.rut)).label("usuarios_unicos")
    ).filter(filtro).first()

    per = _period_expr(period_type, LogConsultasPropietarios.fecha)
    por_periodo = (
        db.query(
            per.label("periodo"),
            func.count(text("1")).label("consultas"),
            func.count(func.distinct(LogConsultasPropietarios.rut)).label("usuarios_unicos")
        ).filter(filtro).group_by(per).order_by(per).all()
    )

    ultimas = (
        db.query(
            LogConsultasPropietarios.rut,
            LogConsultasPropietarios.ppu,
            LogConsultasPropietarios.fecha,
            func.coalesce(PermisoCirculacion.nombre, "N/A").label("nombre"),
            func.coalesce(PermisoCirculacion.marca, "N/A").label("marca"),
            func.coalesce(PermisoCirculacion.modelo, "N/A").label("modelo"),
        )
        .outerjoin(
            PermisoCirculacion,
            and_(
                PermisoCirculacion.ppu == LogConsultasPropietarios.ppu,
                PermisoCirculacion.rut == LogConsultasPropietarios.rut
            )
        )
        .filter(filtro)
        .order_by(LogConsultasPropietarios.fecha.desc())
        .limit(50)
        .all()
    )

    return {
        "kpi": {
            "total_consultas": int((tot_row.total_consultas if tot_row else 0) or 0),
            "usuarios_unicos_acumulados": int((tot_row.usuarios_unicos if tot_row else 0) or 0)
        },
        "charts": {
            "consultas_por_periodo": [
                {"periodo": str(r.periodo), "consultas": int(r.consultas or 0)} for r in por_periodo
            ],
            "usuarios_unicos_por_periodo": [
                {"periodo": str(r.periodo), "usuarios_unicos": int(r.usuarios_unicos or 0)} for r in por_periodo
            ]
        },
        "tables": {
            "ultimas_consultas": [
                {
                    "rut": r.rut,
                    "ppu": r.ppu,
                    "fecha": r.fecha.strftime("%Y-%m-%d %H:%M:%S"),
                    "nombre": r.nombre, "marca": r.marca, "modelo": r.modelo
                } for r in ultimas
            ]
        }
    }

def _metricas_permisos(df: datetime, dt: datetime, period_type: str, db: Session) -> Dict[str, Any]:
    filtro = and_(func.date(PermisoCirculacion.fecha_emision) >= df.date(),
                  func.date(PermisoCirculacion.fecha_emision) <= dt.date())

    kpi = db.query(
        func.count(text("1")).label("total_permisos"),
        func.sum(PermisoCirculacion.valor_permiso).label("recaudacion_total"),
        func.avg(PermisoCirculacion.valor_permiso).label("valor_promedio")
    ).filter(filtro).first()

    per = _period_expr(period_type, PermisoCirculacion.fecha_emision)
    emisiones = (
        db.query(
            per.label("periodo"),
            func.round(func.count(text("1"))/1000.0, 2).label("miles")
        ).filter(filtro).group_by(per).order_by(per).all()
    )

    permisos_tbl = (
        db.query(
            PermisoCirculacion.ppu, PermisoCirculacion.rut, PermisoCirculacion.nombre,
            PermisoCirculacion.fecha_emision, PermisoCirculacion.fecha_expiracion,
            PermisoCirculacion.valor_permiso, PermisoCirculacion.marca,
            PermisoCirculacion.modelo, PermisoCirculacion.anio
        )
        .filter(filtro)
        .order_by(PermisoCirculacion.fecha_emision.desc())
        .limit(100)
        .all()
    )

    return {
        "kpi": {
            "total_permisos_emitidos": int((kpi.total_permisos if kpi else 0) or 0),
            "recaudacion_total_clp": float((kpi.recaudacion_total if kpi else 0.0) or 0.0),
            "valor_promedio_clp": float((kpi.valor_promedio if kpi else 0.0) or 0.0),
        },
        "charts": {
            "emisiones_por_periodo_miles": [
                {"periodo": str(r.periodo), "miles": float(r.miles)} for r in emisiones
            ]
        },
        "tables": {
            "permisos": [
                {
                    "ppu": r.ppu, "rut": r.rut, "nombre": r.nombre,
                    "fecha_emision": r.fecha_emision.strftime("%Y-%m-%d"),
                    "fecha_expiracion": r.fecha_expiracion.strftime("%Y-%m-%d"),
                    "valor_permiso": int(r.valor_permiso),
                    "marca": r.marca, "modelo": r.modelo, "anio": int(r.anio)
                } for r in permisos_tbl
            ]
        }
    }

############################################
# ENDPOINTS
############################################
@router.get("/")
def read_root():
    return {"message": "API back sin autenticación (demo)"}

@router.post("/calcular-metricas/{scope}/{period_type}/{from_date}/{to_date}")
async def calcular_metricas(scope: str, period_type: str, from_date: str, to_date: str, db: Session = Depends(get_db)):
    """
    Parameters:
      "scope": "fiscalizacion" | "consultas" | "permisos",
      "period_type": "DIA" | "MES" | "AÑO",
      "from_date": "YYYY-MM-DD",
      "to_date":   "YYYY-MM-DD"
    """
    try:
        if scope not in ["fiscalizacion", "consultas", "permisos"]:
            raise HTTPException(status_code=400, detail="Scope inválido. Debe ser uno de: ['fiscalizacion','consultas','permisos']")
        if period_type not in ["DIA", "MES", "AÑO"]:
            raise HTTPException(status_code=400, detail="Period type inválido. Debe ser uno de: ['DIA','MES','AÑO']")

        df = _parse_date(from_date)
        dt = _parse_date(to_date)
        if df > dt:
            raise HTTPException(status_code=400, detail="La fecha de inicio no puede ser mayor que la fecha de fin")

        if scope == "fiscalizacion":
            result = _metricas_fiscalizacion(df, dt, period_type, db)
        elif scope == "consultas":
            result = _metricas_consultas(df, dt, period_type, db)
        else:
            result = _metricas_permisos(df, dt, period_type, db)

        result.update({
            "scope": scope,
            "period_type": period_type,
            "from_date": from_date,
            "to_date": to_date
        })

        return {"status": "success", "message": "Métricas calculadas correctamente", "data": result}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error interno en /calcular-metricas: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")


