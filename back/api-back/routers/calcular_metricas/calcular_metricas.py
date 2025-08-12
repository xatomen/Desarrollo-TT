# Importamos librerías necesarias
from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy import text
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, List, Any
import os
from dotenv import load_dotenv

# Importar configuración desde el app principal
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from app import get_db

# Instanciamos el router
router = APIRouter()

def parse_date(date_str: str) -> datetime:
    """Convierte string de fecha a datetime"""
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Formato de fecha inválido: {date_str}. Use YYYY-MM-DD")

def get_date_filter(period_type: str, from_date: datetime, to_date: datetime) -> str:
    """Genera filtro SQL según el tipo de período"""
    if period_type == "DIA":
        return "DATE(fecha)"
    elif period_type == "MES":
        return "DATE_FORMAT(fecha, '%Y-%m')"
    elif period_type == "AÑO":
        return "YEAR(fecha)"
    else:
        return "DATE(fecha)"

def calcular_metricas_fiscalizacion(from_date: datetime, to_date: datetime, period_type: str, db: Session) -> Dict:
    """Calcula métricas de fiscalización"""
    try:
        # KPIs generales
        query_kpi = text("""
            SELECT 
                COUNT(*) as total_fiscalizaciones,
                SUM(CASE WHEN vigencia_permiso = 1 AND vigencia_revision = 1 AND vigencia_soap = 1 AND encargo_robo = 0 THEN 1 ELSE 0 END) as documentos_al_dia,
                SUM(CASE WHEN vigencia_permiso = 0 OR vigencia_revision = 0 OR vigencia_soap = 0 OR encargo_robo = 1 THEN 1 ELSE 0 END) as vencidos_o_encargo
            FROM log_fiscalizacion 
            WHERE DATE(fecha) BETWEEN :from_date AND :to_date
        """)
        
        kpi_result = db.execute(query_kpi, {"from_date": from_date.date(), "to_date": to_date.date()}).fetchone()
        
        total = kpi_result[0] if kpi_result[0] else 1
        documentos_al_dia_pct = round((kpi_result[1] / total) * 100, 1) if total > 0 else 0
        vencidos_o_encargo_pct = round((kpi_result[2] / total) * 100, 1) if total > 0 else 0
        
        # Datos para gráficos por período
        date_format = get_date_filter(period_type, from_date, to_date)
        
        query_vehiculos_condicion = text(f"""
            SELECT 
                {date_format} as periodo,
                SUM(CASE WHEN vigencia_permiso = 1 AND vigencia_revision = 1 AND vigencia_soap = 1 AND encargo_robo = 0 THEN 1 ELSE 0 END) as al_dia,
                SUM(CASE WHEN vigencia_permiso = 0 OR vigencia_revision = 0 OR vigencia_soap = 0 OR encargo_robo = 1 THEN 1 ELSE 0 END) as con_problemas
            FROM log_fiscalizacion 
            WHERE DATE(fecha) BETWEEN :from_date AND :to_date
            GROUP BY {date_format}
            ORDER BY {date_format}
        """)
        
        vehiculos_condicion = db.execute(query_vehiculos_condicion, {"from_date": from_date.date(), "to_date": to_date.date()}).fetchall()
        
        # Fiscalizaciones por miles
        query_miles = text(f"""
            SELECT 
                {date_format} as periodo,
                ROUND(COUNT(*) / 1000, 2) as miles_fiscalizados
            FROM log_fiscalizacion 
            WHERE DATE(fecha) BETWEEN :from_date AND :to_date
            GROUP BY {date_format}
            ORDER BY {date_format}
        """)
        
        miles_fiscalizados = db.execute(query_miles, {"from_date": from_date.date(), "to_date": to_date.date()}).fetchall()
        
        # Tabla de vehículos fiscalizados
        query_vehiculos = text("""
            SELECT 
                f.ppu,
                f.fecha,
                f.vigencia_permiso,
                f.vigencia_revision,
                f.vigencia_soap,
                f.encargo_robo,
                COALESCE(p.marca, 'N/A') as marca,
                COALESCE(p.modelo, 'N/A') as modelo,
                COALESCE(p.anio, 0) as anio
            FROM log_fiscalizacion f
            LEFT JOIN permiso_circulacion p ON f.ppu = p.ppu
            WHERE DATE(f.fecha) BETWEEN :from_date AND :to_date
            ORDER BY f.fecha DESC
            LIMIT 100
        """)
        
        vehiculos = db.execute(query_vehiculos, {"from_date": from_date.date(), "to_date": to_date.date()}).fetchall()
        
        return {
            "kpi": {
                "documentos_al_dia_pct": documentos_al_dia_pct,
                "vencidos_o_encargo_pct": vencidos_o_encargo_pct
            },
            "charts": {
                "vehiculos_por_condicion": [
                    {"periodo": str(row[0]), "al_dia": row[1], "con_problemas": row[2]} 
                    for row in vehiculos_condicion
                ],
                "miles_fiscalizados": [
                    {"periodo": str(row[0]), "miles": float(row[1])} 
                    for row in miles_fiscalizados
                ],
                "pie_documentos": {
                    "al_dia": documentos_al_dia_pct,
                    "con_problemas": vencidos_o_encargo_pct
                }
            },
            "tables": {
                "vehiculos": [
                    {
                        "ppu": row[0],
                        "fecha": row[1].strftime("%Y-%m-%d %H:%M:%S"),
                        "vigencia_permiso": bool(row[2]),
                        "vigencia_revision": bool(row[3]),
                        "vigencia_soap": bool(row[4]),
                        "encargo_robo": bool(row[5]),
                        "marca": row[6],
                        "modelo": row[7],
                        "anio": row[8]
                    } for row in vehiculos
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculando métricas fiscalización: {str(e)}")

def calcular_metricas_consultas(from_date: datetime, to_date: datetime, period_type: str, db: Session) -> Dict:
    """Calcula métricas de consultas"""
    try:
        # Total consultas
        query_total = text("""
            SELECT COUNT(*) as total_consultas,
                   COUNT(DISTINCT rut) as usuarios_unicos
            FROM log_consultas_propietarios 
            WHERE DATE(fecha) BETWEEN :from_date AND :to_date
        """)
        
        total_result = db.execute(query_total, {"from_date": from_date.date(), "to_date": to_date.date()}).fetchone()
        
        # Consultas por período
        date_format = get_date_filter(period_type, from_date, to_date)
        
        query_periodo = text(f"""
            SELECT 
                {date_format} as periodo,
                COUNT(*) as consultas,
                COUNT(DISTINCT rut) as usuarios_unicos
            FROM log_consultas_propietarios 
            WHERE DATE(fecha) BETWEEN :from_date AND :to_date
            GROUP BY {date_format}
            ORDER BY {date_format}
        """)
        
        periodo_result = db.execute(query_periodo, {"from_date": from_date.date(), "to_date": to_date.date()}).fetchall()
        
        # Últimas consultas
        query_ultimas = text("""
            SELECT 
                c.rut, 
                c.ppu, 
                c.fecha, 
                COALESCE(p.nombre, 'N/A') as nombre,
                COALESCE(p.marca, 'N/A') as marca,
                COALESCE(p.modelo, 'N/A') as modelo
            FROM log_consultas_propietarios c
            LEFT JOIN permiso_circulacion p ON c.ppu = p.ppu AND c.rut = p.rut
            WHERE DATE(c.fecha) BETWEEN :from_date AND :to_date
            ORDER BY c.fecha DESC
            LIMIT 50
        """)
        
        ultimas_consultas = db.execute(query_ultimas, {"from_date": from_date.date(), "to_date": to_date.date()}).fetchall()
        
        return {
            "kpi": {
                "total_consultas": total_result[0] if total_result else 0,
                "usuarios_unicos_acumulados": total_result[1] if total_result else 0
            },
            "charts": {
                "consultas_por_periodo": [
                    {"periodo": str(row[0]), "consultas": row[1]} 
                    for row in periodo_result
                ],
                "usuarios_unicos_por_periodo": [
                    {"periodo": str(row[0]), "usuarios_unicos": row[2]} 
                    for row in periodo_result
                ]
            },
            "tables": {
                "ultimas_consultas": [
                    {
                        "rut": row[0],
                        "ppu": row[1],
                        "fecha": row[2].strftime("%Y-%m-%d %H:%M:%S"),
                        "nombre": row[3],
                        "marca": row[4],
                        "modelo": row[5]
                    } for row in ultimas_consultas
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculando métricas consultas: {str(e)}")

def calcular_metricas_permisos(from_date: datetime, to_date: datetime, period_type: str, db: Session) -> Dict:
    """Calcula métricas de permisos"""
    try:
        # KPIs de permisos
        query_kpi = text("""
            SELECT 
                COUNT(*) as total_permisos,
                SUM(valor_permiso) as recaudacion_total,
                AVG(valor_permiso) as valor_promedio
            FROM permiso_circulacion 
            WHERE DATE(fecha_emision) BETWEEN :from_date AND :to_date
        """)
        
        kpi_result = db.execute(query_kpi, {"from_date": from_date.date(), "to_date": to_date.date()}).fetchone()
        
        # Emisiones por período
        date_format = get_date_filter(period_type, from_date, to_date)
        
        query_emisiones = text(f"""
            SELECT 
                {date_format} as periodo,
                ROUND(COUNT(*) / 1000, 2) as miles_emisiones
            FROM permiso_circulacion 
            WHERE DATE(fecha_emision) BETWEEN :from_date AND :to_date
            GROUP BY {date_format}
            ORDER BY {date_format}
        """)
        
        emisiones_result = db.execute(query_emisiones, {"from_date": from_date.date(), "to_date": to_date.date()}).fetchall()
        
        # Tabla de permisos
        query_permisos = text("""
            SELECT 
                ppu, 
                rut, 
                nombre, 
                fecha_emision, 
                fecha_expiracion, 
                valor_permiso,
                COALESCE(marca, 'N/A') as marca,
                COALESCE(modelo, 'N/A') as modelo,
                COALESCE(anio, 0) as anio
            FROM permiso_circulacion 
            WHERE DATE(fecha_emision) BETWEEN :from_date AND :to_date
            ORDER BY fecha_emision DESC
            LIMIT 100
        """)
        
        permisos = db.execute(query_permisos, {"from_date": from_date.date(), "to_date": to_date.date()}).fetchall()
        
        return {
            "kpi": {
                "total_permisos_emitidos": kpi_result[0] if kpi_result else 0,
                "recaudacion_total_clp": float(kpi_result[1]) if kpi_result and kpi_result[1] else 0.0,
                "valor_promedio_clp": float(kpi_result[2]) if kpi_result and kpi_result[2] else 0.0
            },
            "charts": {
                "emisiones_por_periodo_miles": [
                    {"periodo": str(row[0]), "miles": float(row[1])} 
                    for row in emisiones_result
                ]
            },
            "tables": {
                "permisos": [
                    {
                        "ppu": row[0],
                        "rut": row[1],
                        "nombre": row[2],
                        "fecha_emision": row[3].strftime("%Y-%m-%d"),
                        "fecha_expiracion": row[4].strftime("%Y-%m-%d"),
                        "valor_permiso": row[5],
                        "marca": row[6],
                        "modelo": row[7],
                        "anio": row[8]
                    } for row in permisos
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculando métricas permisos: {str(e)}")

# Endpoint para calcular métricas
@router.post("/calcular-metricas")
async def calcular_metricas(request: Request, db: Session = Depends(get_db)):
    """
    Endpoint para calcular métricas de los diferentes tableros.
    Acepta parámetros: scope, period_type, from_date, to_date
    """
    try:
        # Obtener datos del request
        data = await request.json()
        
        # Validar parámetros requeridos
        required_params = ['scope', 'period_type', 'from_date', 'to_date']
        for param in required_params:
            if param not in data:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Parámetro requerido '{param}' no encontrado"
                )
        
        scope = data.get('scope')
        period_type = data.get('period_type')
        from_date_str = data.get('from_date')
        to_date_str = data.get('to_date')
        
        # Validar scope
        valid_scopes = ['fiscalizacion', 'consultas', 'permisos']
        if scope not in valid_scopes:
            raise HTTPException(
                status_code=400,
                detail=f"Scope inválido. Debe ser uno de: {valid_scopes}"
            )
        
        # Validar period_type
        valid_periods = ['DIA', 'MES', 'AÑO']
        if period_type not in valid_periods:
            raise HTTPException(
                status_code=400,
                detail=f"Period type inválido. Debe ser uno de: {valid_periods}"
            )
        
        # Convertir fechas
        from_date = parse_date(from_date_str)
        to_date = parse_date(to_date_str)
        
        # Validar rango de fechas
        if from_date > to_date:
            raise HTTPException(
                status_code=400,
                detail="La fecha de inicio no puede ser mayor que la fecha de fin"
            )
        
        # Calcular métricas según el scope
        if scope == "fiscalizacion":
            result = calcular_metricas_fiscalizacion(from_date, to_date, period_type, db)
        elif scope == "consultas":
            result = calcular_metricas_consultas(from_date, to_date, period_type, db)
        elif scope == "permisos":
            result = calcular_metricas_permisos(from_date, to_date, period_type, db)
        
        # Agregar metadatos
        result.update({
            "scope": scope,
            "period_type": period_type,
            "from_date": from_date_str,
            "to_date": to_date_str
        })
        
        return {
            "status": "success",
            "message": "Métricas calculadas correctamente",
            "data": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error interno del servidor: {str(e)}"
        )
