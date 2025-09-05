// app/Home/Registro_de_obtencion_de_permisos/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

// Tipos para la respuesta de la API
type ApiResponse = {
  status: string;
  message: string;
  data: {
    kpi: {
      total_permisos_emitidos: number;
      recaudacion_total_clp: number;
      valor_promedio_clp: number;
    };
    charts: {
      emisiones_por_periodo_miles: Array<{
        periodo: string;
        miles: number;
      }>;
    };
    tables: {
      permisos: Array<{
        ppu: string;
        rut: string;
        nombre: string;
        fecha_emision: string;
        fecha_expiracion: string;
        valor_permiso: number;
        marca: string;
        modelo: string;
        anio: number;
      }>;
    };
    scope: string;
    period_type: string;
    from_date: string;
    to_date: string;
  };
};

type Permiso = {
  ppu: string;
  rut: string;
  nombre: string;
  fecha_emision: string;
  fecha_expiracion: string;
  valor_permiso: number;
  marca: string;
  modelo: string;
  anio: number;
};

type GroupBy = "DIA" | "MES" | "AÑO";

export default function RegistroObtencionPermisosPage() {
  // Estados para datos de la API
  const [apiData, setApiData] = useState<ApiResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [groupBy, setGroupBy] = useState<GroupBy>("DIA");
  const [desde, setDesde] = useState<string>("2025-01-01");
  const [hasta, setHasta] = useState<string>("2025-12-31");

  // Paginación
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Función para hacer fetch a la API
  const fetchData = async () => {
    if (!desde || !hasta) {
      setError("Por favor selecciona fechas válidas");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/calcular-metricas/permisos/${groupBy}/${desde}/${hasta}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scope: "permisos",
          period_type: groupBy,
          from_date: desde,
          to_date: hasta,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      console.log('Datos de permisos recibidos:', data);
      setApiData(data.data);
    } catch (err) {
      console.error('Error fetching permisos data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, []);

  // Datos filtrados por rango de fechas
  const permisosData: Permiso[] = useMemo(() => {
    if (!apiData?.tables?.permisos) return [];
    
    const d = desde ? new Date(desde) : null;
    const h = hasta ? new Date(hasta) : null;

    return apiData.tables.permisos.filter((permiso) => {
      const fechaEmision = new Date(permiso.fecha_emision);
      if (d && fechaEmision < d) return false;
      if (h && fechaEmision > endOfDay(h)) return false;
      return true;
    });
  }, [apiData, desde, hasta]);

  // KPIs calculados
  const kpis = useMemo(() => {
    if (!apiData?.kpi) {
      return {
        totalPermisos: 0,
        recaudacion: 0,
        valorPromedio: 0
      };
    }

    return {
      totalPermisos: apiData.kpi.total_permisos_emitidos,
      recaudacion: apiData.kpi.recaudacion_total_clp,
      valorPromedio: apiData.kpi.valor_promedio_clp
    };
  }, [apiData]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(permisosData.length / perPage));
  const currentRows = permisosData.slice((page - 1) * perPage, page * perPage);

  // Datos para mini gráfico (últimos períodos)
  const chartData = useMemo(() => {
    if (!apiData?.charts?.emisiones_por_periodo_miles) return [];
    
    // Determinar cuántos períodos mostrar según el tipo
    const periodsToShow = groupBy === "AÑO" ? 3 : groupBy === "MES" ? 6 : 7;
    
    return apiData.charts.emisiones_por_periodo_miles.slice(-periodsToShow).map(item => ({
      label: formatDateLabel(item.periodo, groupBy),
      v: item.miles
    }));
  }, [apiData, groupBy]);

  // Función para manejar el submit del formulario
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Resetear a la primera página
    fetchData(); // Hacer el fetch con los nuevos filtros
  };

  // Actualizar localStorage cuando se genere PDF
  function handleGeneratePDF() {
    if (typeof window !== 'undefined') {
      const timestamp = new Date().toLocaleString();
      localStorage.setItem('lastReport:permisos', timestamp);
    }
    alert("Generar PDF (por implementar)");
  }

  return (
    <div className="container my-4">
      <header className="mb-4">
        <h2 className="h3 d-flex align-items-center gap-2">
          <span role="img" aria-label="document">📋</span>
          Registro de Obtención de Permisos
        </h2>
        <p className="text-muted mb-0">
          Total permisos: <strong>{kpis.totalPermisos}</strong> | 
          Recaudación: <strong>${kpis.recaudacion.toLocaleString("es-CL")}</strong> | 
          Valor promedio: <strong>${kpis.valorPromedio.toLocaleString("es-CL")}</strong>
        </p>
      </header>

      {/* Filtros */}
      <form onSubmit={handleFilterSubmit} className="row g-3 align-items-end">
        <div className="col-12 col-md-3">
          <label className="form-label">Agrupar por</label>
          <select
            className="form-select"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
          >
            <option value="DIA">DÍA</option>
            <option value="MES">MES</option>
            <option value="AÑO">AÑO</option>
          </select>
        </div>

        <div className="col-6 col-md-3">
          <label className="form-label">Desde</label>
          <input
            className="form-control"
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            required
          />
        </div>

        <div className="col-6 col-md-3">
          <label className="form-label">Hasta</label>
          <input
            className="form-control"
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            required
          />
        </div>

        <div className="col-12 col-md-3 d-grid">
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Consultando...' : 'Consultar Datos'}
          </button>
        </div>
      </form>

      <div className="row mt-2">
        <div className="col-12 col-md-3 d-grid">
          <button className="btn btn-primary" onClick={handleGeneratePDF}>
            Generar Informe (PDF)
          </button>
        </div>
      </div>

      {/* Mensajes de estado */}
      {loading && (
        <div className="alert alert-info mt-3" role="status">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            Cargando datos de permisos...
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="row g-3 mt-3">
        <div className="col-12 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <div className="text-muted small">Total Permisos Emitidos</div>
              <div className="display-6 fw-bold text-primary">{kpis.totalPermisos}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <div className="text-muted small">Recaudación Total (CLP)</div>
              <div className="display-6 fw-bold text-success">
                ${kpis.recaudacion.toLocaleString("es-CL")}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <div className="text-muted small">Valor Promedio (CLP)</div>
              <div className="display-6 fw-bold text-info">
                ${kpis.valorPromedio.toLocaleString("es-CL", {
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout: mini gráfico + tabla */}
      <div className="row g-3 mt-3">
        <div className="col-12 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-light">
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-bar-chart-fill text-primary"></i>
                Emisiones por período (miles)
              </h6>
            </div>
            <div className="card-body">
              <MiniBars data={chartData} height={200} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>PPU</th>
                      <th>Propietario</th>
                      <th>Vehículo</th>
                      <th>Valor (CLP)</th>
                      <th>Fecha Emisión</th>
                      <th>Fecha Expiración</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-5 text-muted">
                          {loading ? 'Cargando...' : 'Sin resultados para el período seleccionado'}
                        </td>
                      </tr>
                    )}

                    {currentRows.map((r, i) => (
                      <tr key={`${r.ppu}-${i}`}>
                        <td><strong>{r.ppu}</strong></td>
                        <td>
                          <div><strong>{r.nombre}</strong></div>
                          <small className="text-muted">{r.rut}</small>
                        </td>
                        <td>
                          <div><strong>{r.marca} {r.modelo}</strong></div>
                          <small className="text-muted">{r.anio}</small>
                        </td>
                        <td>
                          <strong className="text-success">
                            ${r.valor_permiso.toLocaleString("es-CL")}
                          </strong>
                        </td>
                        <td>{formatDate(r.fecha_emision)}</td>
                        <td>{formatDate(r.fecha_expiracion)}</td>
                        <td className="text-center">
                          <button className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-eye"></i> Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer tabla: paginación + tamaño página */}
              <div className="d-flex justify-content-between align-items-center p-3">
                <div className="d-flex align-items-center gap-2">
                  <span>Mostrar</span>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: 70 }}
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    {[5, 10, 15, 20, 50].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <span className="text-muted">
                    de {permisosData.length}
                  </span>
                </div>

                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setPage(1)}>&laquo;</button>
                    </li>
                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>&lsaquo;</button>
                    </li>
                    <li className="page-item disabled">
                      <span className="page-link">
                        {page} / {totalPages}
                      </span>
                    </li>
                    <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>&rsaquo;</button>
                    </li>
                    <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setPage(totalPages)}>&raquo;</button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>      
    </div>
  );
}

/* ===== Mini gráfico de barras (SVG) ===== */
function MiniBars({
  data,
  height = 200,
}: {
  data: { label: string; v: number }[];
  height?: number;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center flex-column" style={{ height }}>
        <div style={{ fontSize: '32px', color: '#6c757d' }}>📊</div>
        <span className="text-muted mt-2">Sin datos disponibles</span>
      </div>
    );
  }

  // Si todos los valores son 0, mostrar mensaje especial
  const hasData = data.some(d => d.v > 0);
  if (!hasData) {
    return (
      <div className="d-flex align-items-center justify-content-center flex-column" style={{ height }}>
        <div style={{ fontSize: '32px', color: '#6c757d' }}>📈</div>
        <span className="text-muted mt-2 text-center">
          No hay emisiones registradas<br/>
          <small>en el período seleccionado</small>
        </span>
      </div>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.v));
  const barWidth = Math.min(50, Math.max(30, 280 / data.length));
  const gap = 10;
  const totalWidth = data.length * barWidth + (data.length - 1) * gap;
  const padBottom = 30;
  const padTop = 20;
  const padSides = 25;

  return (
    <div style={{ width: '100%', height: height, position: 'relative' }}>
      {/* Título del eje Y */}
      <div className="text-center mb-2">
        <small className="text-muted">Miles emitidos</small>
      </div>
      
      <svg 
        width="100%" 
        height={height - 20} 
        viewBox={`0 0 ${totalWidth + padSides * 2} ${height - 20}`}
        style={{ overflow: 'visible' }}
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padTop + (height - 20 - padTop - padBottom) * (1 - ratio);
          const value = Math.round(max * ratio);
          return (
            <g key={i}>
              <line 
                x1={padSides} 
                y1={y} 
                x2={totalWidth + padSides} 
                y2={y} 
                stroke="#e9ecef" 
                strokeWidth="1"
              />
              <text 
                x={padSides - 5} 
                y={y + 3} 
                textAnchor="end" 
                fontSize="10" 
                fill="#6c757d"
              >
                {value}
              </text>
            </g>
          );
        })}
        
        {data.map((d, i) => {
          const x = padSides + i * (barWidth + gap);
          const barHeight = ((height - 20 - padTop - padBottom) * d.v) / max;
          const y = height - 20 - padBottom - barHeight;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#0d6efd"
                rx={4}
                opacity={0.85}
              />
              
              {/* Etiqueta del período */}
              <text 
                x={x + barWidth / 2} 
                y={height - 20 - padBottom + 15} 
                textAnchor="middle" 
                fontSize="10" 
                fill="#6c757d"
              >
                {d.label}
              </text>
              
              {/* Valor encima de la barra */}
              {d.v > 0 && (
                <text 
                  x={x + barWidth / 2} 
                  y={y - 5} 
                  textAnchor="middle" 
                  fontSize="11" 
                  fill="#333"
                  fontWeight="bold"
                >
                  {d.v}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ===== Utilidades ===== */
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateLabel(dateString: string, periodType: string = "DIA") {
  const d = new Date(dateString);
  
  switch (periodType) {
    case "AÑO":
      return d.getFullYear().toString();
    case "MES":
      return d.toLocaleDateString("es-CL", {
        year: "numeric",
        month: "short",
      });
    case "DIA":
    default:
      return d.toLocaleDateString("es-CL", {
        month: "short",
        day: "numeric",
      });
  }
}
