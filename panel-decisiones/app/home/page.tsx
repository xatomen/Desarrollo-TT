"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import API_CONFIG from "@/config/api";

// -------- utilidades de fecha --------
function fmt(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function rangeDays(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - (days - 1));
  return { from: fmt(from), to: fmt(to) };
}

// -------- tipos mínimos (solo lo que usamos) --------
type Scope = "consultas" | "fiscalizacion" | "permisos";
type ApiResp<T> = { status: string; data: T };

type RespConsultas = {
  kpi: { total_consultas: number; usuarios_unicos_acumulados: number };
  charts: {
    consultas_por_periodo: { periodo: string; consultas: number }[];
    usuarios_unicos_por_periodo: { periodo: string; usuarios_unicos: number }[];
  };
};

type RespFiscalizacion = {
  kpi: { documentos_al_dia_pct: number; vencidos_o_encargo_pct: number };
  charts: {
    vehiculos_por_condicion: {
      periodo: string; al_dia: number; con_problemas: number;
    }[];
    miles_fiscalizados: { periodo: string; miles: number }[];
    pie_documentos: { al_dia: number; con_problemas: number };
  };
};

type RespPermisos = {
  kpi: {
    total_permisos_emitidos: number;
    recaudacion_total_clp: number;
    valor_promedio_clp: number;
  };
  charts: { emisiones_por_periodo_miles: { periodo: string; miles: number }[] };
};

// -------- client fetch al back --------
async function fetchMetricas<T>(scope: Scope, period: "DIA" | "MES" | "AÑO", from: string, to: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || API_CONFIG.BACKEND;
  const res = await fetch(
    `${baseUrl}calcular-metricas/${scope}/${period}/${from}/${to}`,
    { 
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        scope: scope,
        period_type: period,
        from_date: from,
        to_date: to,
      }),
    }
  );
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const json = (await res.json()) as ApiResp<T>;
  return json.data;
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [days, setDays] = useState<7 | 14 | 30>(7);
  const { from, to } = useMemo(() => rangeDays(days), [days]);
  const { token, user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // estados por scope
  const [consultas, setConsultas] = useState<RespConsultas | null>(null);
  const [fisc, setFisc] = useState<RespFiscalizacion | null>(null);
  const [permisos, setPermisos] = useState<RespPermisos | null>(null);

  // Estado para localStorage (evita problemas de hidratación)
  const [lastReports, setLastReports] = useState<Record<Scope, string>>({
    consultas: "Sin registro",
    fiscalizacion: "Sin registro", 
    permisos: "Sin registro"
  });

  // Efectos de montaje
  useEffect(() => {
    setMounted(true);
    
    // Cargar datos de localStorage solo después del montaje
    if (typeof window !== "undefined") {
      setLastReports({
        consultas: localStorage.getItem("lastReport:consultas") ?? "Sin registro",
        fiscalizacion: localStorage.getItem("lastReport:fiscalizacion") ?? "Sin registro",
        permisos: localStorage.getItem("lastReport:permisos") ?? "Sin registro"
      });
    }
  }, []);

  // carga de métricas
  const loadAll = async () => {
    if (!token) return;
    
    setLoading(true);
    setErr(null);
    try {
      const [c, f, p] = await Promise.all([
        fetchMetricas<RespConsultas>("consultas", "DIA", from, to, token),
        fetchMetricas<RespFiscalizacion>("fiscalizacion", "DIA", from, to, token),
        fetchMetricas<RespPermisos>("permisos", "DIA", from, to, token),
      ]);
      setConsultas(c);
      setFisc(f);
      setPermisos(p);
    } catch (e: any) {
      console.error('Error cargando métricas:', e);
      setErr(e?.message ?? "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (mounted && token) {
      loadAll();
    }
  }, [from, to, mounted, token]);

  // ---- helpers de "cambio drástico" (umbral simple) ----
  function pctChange(current: number, prev: number) {
    if (prev === 0) return current === 0 ? 0 : 100;
    return ((current - prev) / prev) * 100;
  }

  function drasticBadge(pchange: number, label: string) {
    if (Math.abs(pchange) >= 25) {
      // >= 25% de cambio
      const color = pchange > 0 ? "bg-success" : "bg-danger";
      const txt = pchange > 0 ? "alza" : "baja";
      const icon = pchange > 0 ? "bi-arrow-up" : "bi-arrow-down";
      return (
        <span className={`badge ${color} ms-2`} title={`Cambio ${txt} ${label}`}>
          <i className={`bi ${icon} me-1`}></i>
          {Math.abs(pchange).toFixed(0)}%
        </span>
      );
    }
    return null;
  }

  // --- lecturas para tarjetas ---
  const consultasSerie = consultas?.charts.consultas_por_periodo ?? [];
  const consultasCurrent = consultasSerie.at(-1)?.consultas ?? 0;
  const consultasPrev = consultasSerie.at(-2)?.consultas ?? 0;
  const consultasChange = pctChange(consultasCurrent, consultasPrev);

  const a11y = fisc?.kpi.documentos_al_dia_pct ?? 0;
  // intentar detectar cambio por series de condición:
  const condSerie = fisc?.charts.vehiculos_por_condicion ?? [];
  const okNow = condSerie.length ? condSerie.at(-1)!.al_dia : 0;
  const okPrev = condSerie.length > 1 ? condSerie.at(-2)!.al_dia : 0;
  const condChange = pctChange(okNow, okPrev);

  const permisosTotal = permisos?.kpi.total_permisos_emitidos ?? 0;
  const permisosSerie = permisos?.charts.emisiones_por_periodo_miles ?? [];
  const milesNow = permisosSerie.at(-1)?.miles ?? 0;
  const milesPrev = permisosSerie.at(-2)?.miles ?? 0;
  const permisosChange = pctChange(milesNow, milesPrev);

  // --- funciones para manejar localStorage ---
  const setLast = (scope: Scope) => {
    if (!mounted) return;
    
    const ts = new Date().toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    localStorage.setItem(`lastReport:${scope}`, ts);
    
    // Actualizar el estado local
    setLastReports(prev => ({
      ...prev,
      [scope]: ts
    }));
  };

  // No renderizar contenido que dependa de localStorage hasta estar montado
  if (!mounted) {
    return (
      <div className="container-fluid mb-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3 text-muted">Inicializando panel de decisiones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mb-5">
      {/* Header mejorado */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                <i className="bi bi-speedometer2 me-2 text-primary"></i>
                Panel de Decisiones
              </h1>
              {user && (
                <p className="text-muted mb-0">
                  Bienvenido, <strong>{user.nombre || user.email || 'Usuario'}</strong> • 
                  <span className="ms-2">{new Date().toLocaleDateString('es-CL')}</span>
                </p>
              )}
            </div>
            <div className="text-end">
              <small className="text-muted d-block">Última actualización</small>
              <small className="text-muted">{new Date().toLocaleTimeString('es-CL')}</small>
            </div>
          </div>
        </div>
      </div>

      {/* Controles mejorados */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-12 col-md-6">
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted fw-medium">Período de análisis:</span>
                <div className="btn-group" role="group" aria-label="Rango de días">
                  {[7, 14, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`btn btn-sm ${days === d ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setDays(d as 7 | 14 | 30)}
                    >
                      {d} días
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 mt-2 mt-md-0">
              <div className="d-flex justify-content-md-end align-items-center gap-3">
                <small className="text-muted">
                  <i className="bi bi-calendar-range me-1"></i>
                  {from} → {to}
                </small>
                <button 
                  className="btn btn-outline-primary btn-sm" 
                  onClick={loadAll} 
                  disabled={loading}
                >
                  <i className={`bi ${loading ? 'bi-arrow-clockwise spin' : 'bi-arrow-clockwise'} me-1`}></i>
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes de estado */}
      {err && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Error:</strong> {err}
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={loadAll}>
            Reintentar
          </button>
        </div>
      )}

      {loading && (
        <div className="alert alert-info border-0" role="status">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <div>
              <strong>Cargando métricas...</strong>
              <div className="small text-muted">Obteniendo datos de consultas, fiscalización y permisos</div>
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas mejoradas */}
      <div className="row g-4">
        {/* Consultas */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
                    <i className="bi bi-eye text-primary fs-4"></i>
                  </div>
                  <div>
                    <h5 className="card-title mb-0" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                      Consultas
                    </h5>
                    <small className="text-muted">Propietarios</small>
                  </div>
                </div>
                {drasticBadge(consultasChange, "consultas")}
              </div>
              
              <div className="mb-3">
                <div className="display-6 fw-bold text-primary">
                  {(consultas?.kpi.total_consultas ?? 0).toLocaleString('es-CL')}
                </div>
                <div className="d-flex align-items-center mt-2">
                  <i className="bi bi-people me-1 text-muted"></i>
                  <small className="text-muted">
                    Usuarios únicos: <strong>{(consultas?.kpi.usuarios_unicos_acumulados ?? 0).toLocaleString('es-CL')}</strong>
                  </small>
                </div>
              </div>
            </div>
            
            <div className="card-footer bg-transparent border-0">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  <i className="bi bi-clock me-1"></i>
                  {lastReports.consultas}
                </small>
                <div>
                  <button 
                    className="btn btn-sm btn-outline-secondary me-2 m-2 p-3" 
                    onClick={() => setLast("consultas")}
                    title="Marcar como generado"
                  >
                    {/* <i className="bi bi-check-circle me-1"></i> */}
                    Marcar
                  </button>
                  <Link href="/home/Registro_de_consultas_propietarios" className="btn btn-sm btn-primary m-2 p-3">
                    {/* <i className="bi bi-arrow-right me-1"></i> */}
                    Ver detalle
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fiscalización */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 rounded-3 p-2 me-3">
                    <i className="bi bi-shield-check text-success fs-4"></i>
                  </div>
                  <div>
                    <h5 className="card-title mb-0" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                      Fiscalización
                    </h5>
                    <small className="text-muted">Vehículos</small>
                  </div>
                </div>
                {drasticBadge(condChange, "vehículos al día")}
              </div>
              
              <div className="mb-3">
                <div>
                  <span className="text-muted">{((fisc?.charts.miles_fiscalizados.at(-1)?.miles ?? 0)).toLocaleString('es-CL')}</span>
                </div>
                <div className="d-flex align-items-baseline gap-2">
                  <span className="display-6 fw-bold text-success">
                    {a11y.toFixed(1)}%
                  </span>
                  <small className="text-muted">al día</small>
                </div>
                <div className="d-flex align-items-center mt-2">
                  <i className="bi bi-exclamation-triangle me-1 text-warning"></i>
                  <small className="text-muted">
                    Con problemas: <strong>{(fisc?.kpi.vencidos_o_encargo_pct ?? 0).toFixed(1)}%</strong>
                  </small>
                </div>
              </div>
            </div>
            
            <div className="card-footer bg-transparent border-0">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  <i className="bi bi-clock me-1"></i>
                  {lastReports.fiscalizacion}
                </small>
                <div>
                  <button className="btn btn-sm btn-outline-secondary me-2 m-2 p-3" 
                    onClick={() => setLast("fiscalizacion")}
                    title="Marcar como generado"
                  >
                    {/* <i className="bi bi-check-circle me-1"></i> */}
                    Marcar
                  </button>
                  <Link href="/home/Registro_de_fiscalizacion" className="btn btn-sm btn-success m-2 p-3">
                    {/* <i className="bi bi-arrow-right me-1"></i> */}
                    Ver detalle
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Permisos */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div className="d-flex align-items-center">
                  <div className="bg-info bg-opacity-10 rounded-3 p-2 me-3">
                    <i className="bi bi-file-earmark-text text-info fs-4"></i>
                  </div>
                  <div>
                    <h5 className="card-title mb-0" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                      Permisos
                    </h5>
                    <small className="text-muted">Emisión</small>
                  </div>
                </div>
                {drasticBadge(permisosChange, "emisiones")}
              </div>
              
              <div className="mb-3">
                <div className="display-6 fw-bold text-info">
                  {permisosTotal.toLocaleString('es-CL')}
                </div>
                <div className="mt-2">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-currency-dollar me-1 text-success"></i>
                    <small className="text-muted">
                      Recaudación: <strong>
                        ${Math.round(permisos?.kpi.recaudacion_total_clp ?? 0).toLocaleString("es-CL")}
                      </strong>
                    </small>
                  </div>
                  <div className="d-flex align-items-center mt-1">
                    <i className="bi bi-calculator me-1 text-muted"></i>
                    <small className="text-muted">
                      Promedio: <strong>
                        ${Math.round(permisos?.kpi.valor_promedio_clp ?? 0).toLocaleString("es-CL")}
                      </strong>
                    </small>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-footer bg-transparent border-0">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  <i className="bi bi-clock me-1"></i>
                  {lastReports.permisos}
                </small>
                <div>
                  <button 
                    className="btn btn-sm btn-outline-secondary me-2 m-2 p-3" 
                    onClick={() => setLast("permisos")}
                    title="Marcar como generado"
                  >
                    {/* <i className="bi bi-check-circle me-1"></i> */}
                    Marcar
                  </button>
                  <Link href="/home/Registro_de_obtencion_de_permisos" className="btn btn-sm btn-info m-2 p-3">
                    {/* <i className="bi bi-arrow-right me-1"></i> */}
                    Ver detalle
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nota informativa
      <div className="card mt-4 border-0 bg-light">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-12 col-md-8">
              <h6 className="mb-1">
                <i className="bi bi-info-circle me-2 text-primary"></i>
                Información sobre alertas de cambios
              </h6>
              <small className="text-muted">
                Los badges de alerta aparecen cuando hay cambios ≥25% entre períodos consecutivos. 
                Use "Marcar" cuando genere informes para trackear la última generación.
              </small>
            </div>
            <div className="col-12 col-md-4 text-md-end mt-2 mt-md-0">
              <Link href="/reportes" className="btn btn-outline-primary btn-sm">
                <i className="bi bi-download me-1"></i>
                Centro de reportes
              </Link>
            </div>
          </div>
        </div>
      </div> */}

      {/* CSS personalizado para animaciones */}
      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </div>
  );
}
