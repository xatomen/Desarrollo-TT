"use client";

import { useEffect, useMemo, useState } from "react";

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
async function fetchMetricas<T>(scope: Scope, period: "DIA" | "MES" | "AÑO", from: string, to: string) {
  const res = await fetch(
    `/api/calcular-metricas/${scope}/${period}/${from}/${to}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("Error cargando métricas");
  const json = (await res.json()) as ApiResp<T>;
  return json.data;
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [days, setDays] = useState<7 | 14 | 30>(7);
  const { from, to } = useMemo(() => rangeDays(days), [days]);

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
    setLoading(true);
    setErr(null);
    try {
      const [c, f, p] = await Promise.all([
        fetchMetricas<RespConsultas>("consultas", "DIA", from, to),
        fetchMetricas<RespFiscalizacion>("fiscalizacion", "DIA", from, to),
        fetchMetricas<RespPermisos>("permisos", "DIA", from, to),
      ]);
      setConsultas(c);
      setFisc(f);
      setPermisos(p);
    } catch (e: any) {
      setErr(e?.message ?? "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (mounted) {
      loadAll();
    }
  }, [from, to, mounted]);

  // ---- helpers de "cambio drástico" (umbral simple) ----
  function pctChange(current: number, prev: number) {
    if (prev === 0) return current === 0 ? 0 : 100;
    return ((current - prev) / prev) * 100;
  }

  function drasticBadge(pchange: number, label: string) {
    if (Math.abs(pchange) >= 25) {
      // >= 25% de cambio
      const color = pchange > 0 ? "bg-danger" : "bg-success";
      const txt = pchange > 0 ? "alza" : "baja";
      return (
        <span className={`badge ${color} ms-2`} title={`Cambio ${txt} ${label}`}>
          {`${txt} ${label} ${pchange.toFixed(0)}%`}
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
    
    const ts = new Date().toLocaleString();
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
      <div className="container mb-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mb-5">
      {/* Selector de rango */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="text-muted">Rango:</span>
        <div className="btn-group" role="group" aria-label="Rango de días">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              type="button"
              className={`btn ${days === d ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setDays(d as 7 | 14 | 30)}
            >
              {d} días
            </button>
          ))}
        </div>
        <small className="ms-3 text-muted">{from} → {to}</small>
        <button className="btn btn-link ms-auto" onClick={loadAll} disabled={loading}>
          <i className="bi bi-arrow-clockwise me-1" /> 
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {err && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          {err}
        </div>
      )}

      {loading && (
        <div className="alert alert-info" role="status">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            Cargando métricas…
          </div>
        </div>
      )}

      {/* Tarjetas */}
      <div className="row g-3">
        {/* Consultas */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title d-flex align-items-center">
                <i className="bi bi-eye me-2" /> Consultas
                {drasticBadge(consultasChange, "en consultas")}
              </h5>
              <p className="display-6 mb-0">{consultas?.kpi.total_consultas ?? 0}</p>
              <small className="text-muted">Usuarios únicos: {consultas?.kpi.usuarios_unicos_acumulados ?? 0}</small>
            </div>
            <div className="card-footer d-flex justify-content-between align-items-center">
              <small className="text-muted">Último informe: {lastReports.consultas}</small>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setLast("consultas")}>
                Marcar informe
              </button>
            </div>
          </div>
        </div>

        {/* Fiscalización */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title d-flex align-items-center">
                <i className="bi bi-shield-check me-2" /> Fiscalización
                {drasticBadge(condChange, "en vehículos al día")}
              </h5>
              <p className="mb-1">Documentos al día</p>
              <p className="display-6 mb-0">{a11y.toFixed(1)}%</p>
              <small className="text-muted">
                Vencidos o encargo: {fisc?.kpi.vencidos_o_encargo_pct.toFixed(1) ?? 0}%
              </small>
            </div>
            <div className="card-footer d-flex justify-content-between align-items-center">
              <small className="text-muted">Último informe: {lastReports.fiscalizacion}</small>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setLast("fiscalizacion")}>
                Marcar informe
              </button>
            </div>
          </div>
        </div>

        {/* Permisos */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title d-flex align-items-center">
                <i className="bi bi-file-earmark-text me-2" /> Permisos
                {drasticBadge(permisosChange, "en emisiones")}
              </h5>
              <p className="mb-1">Total emitidos</p>
              <p className="display-6 mb-0">{permisosTotal}</p>
              <small className="text-muted d-block">
                Recaudación: CLP {Math.round(permisos?.kpi.recaudacion_total_clp ?? 0).toLocaleString("es-CL")}
              </small>
              <small className="text-muted">
                Valor promedio: CLP {Math.round(permisos?.kpi.valor_promedio_clp ?? 0).toLocaleString("es-CL")}
              </small>
            </div>
            <div className="card-footer d-flex justify-content-between align-items-center">
              <small className="text-muted">Último informe: {lastReports.permisos}</small>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setLast("permisos")}>
                Marcar informe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nota de ayuda */}
      <div className="mt-3">
        <small className="text-muted">
          Consejo: cuando el usuario haga clic en "Generar Informe (PDF)" en cada módulo,
          llama a <code>localStorage.setItem('lastReport:&lt;scope&gt;', new Date().toLocaleString())</code> para registrar la fecha.
        </small>
      </div>
    </div>
  );
}
