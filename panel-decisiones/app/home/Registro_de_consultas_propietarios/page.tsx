"use client";

import { useEffect, useMemo, useState } from "react";

// Tipos para la respuesta de la API
type ApiResponse = {
  status: string;
  message: string;
  data: {
    kpi: {
      total_consultas: number;
      usuarios_unicos_acumulados: number;
    };
    charts: {
      consultas_por_periodo: Array<{
        periodo: string;
        consultas: number;
      }>;
      usuarios_unicos_por_periodo: Array<{
        periodo: string;
        usuarios_unicos: number;
      }>;
    };
    tables: {
      ultimas_consultas: Array<{
        rut: string;
        ppu: string;
        fecha: string;
        nombre: string;
        marca: string;
        modelo: string;
      }>;
    };
    scope: string;
    period_type: string;
    from_date: string;
    to_date: string;
  };
};

type Consulta = {
  rut: string;
  ppu: string;
  fecha: string;
  nombre: string;
  marca: string;
  modelo: string;
};

type GroupBy = "DIA" | "MES" | "AÑO";

export default function RegistroConsultasPropietariosPage() {
  // Estados para datos de la API
  const [apiData, setApiData] = useState<ApiResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [groupBy, setGroupBy] = useState<GroupBy>("DIA");
  const [desde, setDesde] = useState<string>("2025-01-01");
  const [hasta, setHasta] = useState<string>("2025-12-31");

  // Tabla y paginación
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
      const response = await fetch(`${baseUrl}/calcular-metricas/consultas/${groupBy}/${desde}/${hasta}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scope: "consultas",
          period_type: groupBy,
          from_date: desde,
          to_date: hasta,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      console.log('Datos recibidos:', data);
      setApiData(data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, []);

  // Datos de consultas para la tabla (con filtros de fecha aplicados)
  const consultasData: Consulta[] = useMemo(() => {
    if (!apiData?.tables?.ultimas_consultas) return [];
    
    const d = desde ? new Date(desde) : null;
    const h = hasta ? new Date(hasta) : null;

    return apiData.tables.ultimas_consultas.filter((row) => {
      const fechaConsulta = new Date(row.fecha);
      if (d && fechaConsulta < d) return false;
      if (h && fechaConsulta > endOfDay(h)) return false;
      return true;
    });
  }, [apiData, desde, hasta]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(consultasData.length / perPage));
  const startIdx = (page - 1) * perPage;
  const currentRows = consultasData.slice(startIdx, startIdx + perPage);

  // Datos para gráficos
  const chartData = useMemo(() => {
    if (!apiData?.charts) return { consultas: [], usuarios: [] };

    return {
      consultas: apiData.charts.consultas_por_periodo || [],
      usuarios: apiData.charts.usuarios_unicos_por_periodo || [],
    };
  }, [apiData]);

  // Series para minigráficos (últimos 7 días de los datos)
  const recentData = useMemo(() => {
    const consultasRecent = chartData.consultas.slice(-7).map(item => ({
      label: formatDateLabel(item.periodo),
      v: item.consultas
    }));

    const usuariosRecent = chartData.usuarios.slice(-7).map(item => ({
      label: formatDateLabel(item.periodo),
      v: item.usuarios_unicos
    }));

    return { consultas: consultasRecent, usuarios: usuariosRecent };
  }, [chartData]);

  // Actualizar localStorage cuando se genere PDF
  function handleGeneratePDF() {
    if (typeof window !== 'undefined') {
      const timestamp = new Date().toLocaleString();
      localStorage.setItem('lastReport:consultas', timestamp);
    }
    alert("Generar PDF (por implementar)");
  }

  return (
    <div className="container my-4">
      <header className="mb-4">
        <h2 className="h3 d-flex align-items-center gap-2">
          <span role="img" aria-label="chart">📊</span>
          Registro de Consultas de Propietarios
        </h2>
        <p className="text-muted mb-0">
          Total de consultas: <strong>{apiData?.kpi?.total_consultas || 0}</strong> | 
          Usuarios únicos: <strong>{apiData?.kpi?.usuarios_unicos_acumulados || 0}</strong>
        </p>
      </header>

      {/* Filtros */}
      <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="row g-3 align-items-end">
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
            Cargando datos...
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Contenido */}
      <div className="row mt-4">
        {/* Tabla */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>RUT Propietario</th>
                      <th>Nombre</th>
                      <th>PPU</th>
                      <th>Vehículo</th>
                      <th>Fecha/Hora</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-muted">
                          {loading ? 'Cargando...' : 'Sin resultados'}
                        </td>
                      </tr>
                    )}

                    {currentRows.map((r, i) => (
                      <tr key={`${r.rut}-${i}`}>
                        <td><code>{r.rut}</code></td>
                        <td>{r.nombre}</td>
                        <td><strong>{r.ppu}</strong></td>
                        <td>
                          <small className="text-muted">{r.marca}</small><br/>
                          {r.modelo}
                        </td>
                        <td>{formatDateTime(r.fecha)}</td>
                        <td className="text-center">
                          <button className="btn btn-sm btn-outline-secondary">
                            <i className="bi bi-eye"></i> Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer tabla */}
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
                    de {consultasData.length}
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

        {/* Gráficos */}
        <div className="col-12 col-lg-5 mt-4 mt-lg-0">
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h6 className="mb-3">Consultas — Últimos períodos</h6>
              <MiniBars data={recentData.consultas} height={140} />
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">Usuarios únicos — Últimos períodos</h6>
              <MiniBars data={recentData.usuarios} height={140} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Mini chart (SVG) ===== */
function MiniBars({
  data,
  height = 120,
}: {
  data: { label: string; v: number }[];
  height?: number;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height }}>
        <span className="text-muted">Sin datos</span>
      </div>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.v));
  const barW = 28;
  const gap = 16;
  const padLeft = 50; // Aumentamos padding para mostrar números más grandes
  const padRight = 10;
  const width = padLeft + data.length * barW + (data.length - 1) * gap + padRight;
  const padBottom = 22;
  const padTop = 10;

  // Calcular valores del eje Y con números enteros
  const step = Math.max(1, Math.ceil(max / 4));
  const yAxisValues = [0, step, step * 2, step * 3, max];

  return (
    <div>
      {/* Etiqueta del eje Y */}
      <div className="text-center mb-2">
        <small className="text-muted">Cantidad de Consultas</small>
      </div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="barras">
        {/* líneas guía y etiquetas del eje Y */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, index) => {
          const y = padTop + (height - padTop - padBottom) * (1 - p);
          return (
            <g key={p}>
              <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="#eee" />
              <text 
                x={padLeft - 5} 
                y={y + 3} 
                textAnchor="end" 
                fontSize="10" 
                fill="#6c757d"
              >
                {yAxisValues[index]}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const x = padLeft + i * (barW + gap);
          const h = ((height - padTop - padBottom) * d.v) / max;
          const y = height - padBottom - h;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={4}
                fill="#0d6efd"
                opacity={0.85}
              />
              {/* Mostrar valor encima de cada barra */}
              <text 
                x={x + barW / 2} 
                y={y - 3} 
                textAnchor="middle" 
                fontSize="10" 
                fill="#495057"
                fontWeight="bold"
              >
                {d.v}
              </text>
              <text x={x + barW / 2} y={height - 6} textAnchor="middle" fontSize="11" fill="#6c757d">
                {d.label}
              </text>
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

function formatDateTime(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateLabel(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString("es-CL", {
    month: "short",
    day: "numeric",
  });
}
