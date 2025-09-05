// app/Home/Registro_de_fiscalizacion/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

// Tipos para la respuesta de la API
type ApiResponse = {
  status: string;
  message: string;
  data: {
    kpi: {
      documentos_al_dia_pct: number;
      vencidos_o_encargo_pct: number;
    };
    charts: {
      vehiculos_por_condicion: Array<{
        periodo: string;
        al_dia: number;
        con_problemas: number;
      }>;
      miles_fiscalizados: Array<{
        periodo: string;
        miles: number;
      }>;
      pie_documentos: {
        al_dia: number;
        con_problemas: number;
      };
    };
    tables: {
      vehiculos: Array<{
        ppu: string;
        fecha: string;
        vigencia_permiso: boolean;
        vigencia_revision: boolean;
        vigencia_soap: boolean;
        encargo_robo: boolean;
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

type Grupo = "DIA" | "MES" | "AÑO";

type Row = {
  ppu: string;
  permiso: "Vigente" | "No Vigente";
  revision: "Vigente" | "No Vigente";
  soap: "Vigente" | "No Vigente";
  encargo: "SI" | "NO";
  fecha: string;
  marca: string;
  modelo: string;
  anio: number;
};

export default function RegistroFiscalizacionPage() {
  // Estados para datos de la API
  const [apiData, setApiData] = useState<ApiResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [groupBy, setGroupBy] = useState<Grupo>("DIA");
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
      const response = await fetch(`${baseUrl}/calcular-metricas/fiscalizacion/${groupBy}/${desde}/${hasta}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scope: "fiscalizacion",
          period_type: groupBy,
          from_date: desde,
          to_date: hasta,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      console.log('Datos de fiscalización recibidos:', data);
      setApiData(data.data);
    } catch (err) {
      console.error('Error fetching fiscalization data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    fetchData();
  }, []);

  // Transformar datos de la API para la tabla
  const tableData: Row[] = useMemo(() => {
    if (!apiData?.tables?.vehiculos) return [];
    
    const d = desde ? new Date(desde) : null;
    const h = hasta ? new Date(hasta) : null;

    return apiData.tables.vehiculos
      .filter((vehicle) => {
        const fechaFiscalizacion = new Date(vehicle.fecha);
        if (d && fechaFiscalizacion < d) return false;
        if (h && fechaFiscalizacion > endOfDay(h)) return false;
        return true;
      })
      .map((vehicle) => ({
        ppu: vehicle.ppu,
        permiso: vehicle.vigencia_permiso ? "Vigente" : "No Vigente",
        revision: vehicle.vigencia_revision ? "Vigente" : "No Vigente",
        soap: vehicle.vigencia_soap ? "Vigente" : "No Vigente",
        encargo: vehicle.encargo_robo ? "SI" : "NO",
        fecha: vehicle.fecha,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        anio: vehicle.anio,
      }));
  }, [apiData, desde, hasta]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(tableData.length / perPage));
  const startIdx = (page - 1) * perPage;
  const currentRows = tableData.slice(startIdx, startIdx + perPage);

  // Datos para gráficos
  const chartData = useMemo(() => {
    if (!apiData?.charts) return { vehiculos: [], miles: [] };

    return {
      vehiculos: apiData.charts.vehiculos_por_condicion || [],
      miles: apiData.charts.miles_fiscalizados || [],
    };
  }, [apiData]);

  // Series para minigráficos (últimos períodos según el tipo)
  const recentData = useMemo(() => {
    // Determinar cuántos períodos mostrar según el tipo
    const periodsToShow = groupBy === "AÑO" ? 3 : groupBy === "MES" ? 6 : 7;
    
    const vehiculosRecent = chartData.vehiculos.slice(-periodsToShow).map(item => ({
      label: formatDateLabel(item.periodo, groupBy),
      alDia: item.al_dia,
      conProblemas: item.con_problemas
    }));

    const milesRecent = chartData.miles.slice(-periodsToShow).map(item => ({
      label: formatDateLabel(item.periodo, groupBy),
      v: item.miles
    }));

    return { vehiculos: vehiculosRecent, miles: milesRecent };
  }, [chartData, groupBy]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = tableData.length;
    if (total === 0) return { alDia: 0, conProblemas: 0, pctAlDia: 0, pctConProblemas: 0 };

    const alDia = tableData.filter(r => 
      r.permiso === "Vigente" && 
      r.revision === "Vigente" && 
      r.soap === "Vigente" && 
      r.encargo === "NO"
    ).length;
    
    const conProblemas = total - alDia;

    return {
      alDia,
      conProblemas,
      pctAlDia: total > 0 ? (alDia / total) * 100 : 0,
      pctConProblemas: total > 0 ? (conProblemas / total) * 100 : 0,
    };
  }, [tableData]);

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
      localStorage.setItem('lastReport:fiscalizacion', timestamp);
    }
    alert("Generar PDF (por implementar)");
  }

  return (
    <div className="container my-4">
      <header className="mb-4">
        <h2 className="h3 d-flex align-items-center gap-2">
          <span role="img" aria-label="shield">🛡️</span>
          Registro de Fiscalización
        </h2>
        <p className="text-muted mb-0">
          Documentos al día: <strong>{apiData?.kpi?.documentos_al_dia_pct?.toFixed(1) || 0}%</strong> | 
          Con problemas: <strong>{apiData?.kpi?.vencidos_o_encargo_pct?.toFixed(1) || 0}%</strong>
        </p>
      </header>

      {/* Filtros */}
      <form onSubmit={handleFilterSubmit} className="row g-3 align-items-end">
        <div className="col-12 col-md-3">
          <label className="form-label">Agrupar por</label>
          <select
            className="form-select"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as Grupo)}
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
            {loading ? 'Filtrando...' : 'Filtrar'}
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
            Cargando datos de fiscalización...
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="row mt-4">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-success">Al día</h5>
              <p className="display-6 mb-0">{stats.alDia}</p>
              <small className="text-muted">{stats.pctAlDia.toFixed(1)}%</small>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-danger">Con problemas</h5>
              <p className="display-6 mb-0">{stats.conProblemas}</p>
              <small className="text-muted">{stats.pctConProblemas.toFixed(1)}%</small>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Total</h5>
              <p className="display-6 mb-0">{tableData.length}</p>
              <small className="text-muted">vehículos</small>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="row mt-4">
        {/* Tabla */}
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>PPU</th>
                      <th>Vehículo</th>
                      <th>Permiso</th>
                      <th>Revisión</th>
                      <th>SOAP</th>
                      <th>Encargo</th>
                      <th>Fecha</th>
                      <th className="text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-5 text-muted">
                          {loading ? 'Cargando...' : 'Sin resultados'}
                        </td>
                      </tr>
                    )}

                    {currentRows.map((r, i) => {
                      const alDia = r.permiso === "Vigente" && 
                                   r.revision === "Vigente" && 
                                   r.soap === "Vigente" && 
                                   r.encargo === "NO";
                      
                      return (
                        <tr key={`${r.ppu}-${i}`} className={alDia ? "" : "table-warning"}>
                          <td><strong>{r.ppu}</strong></td>
                          <td>
                            <small className="text-muted">{r.marca}</small><br/>
                            {r.modelo} ({r.anio})
                          </td>
                          <td>
                            <span className={`badge ${r.permiso === "Vigente" ? "bg-success" : "bg-danger"}`}>
                              {r.permiso}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${r.revision === "Vigente" ? "bg-success" : "bg-danger"}`}>
                              {r.revision}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${r.soap === "Vigente" ? "bg-success" : "bg-danger"}`}>
                              {r.soap}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${r.encargo === "NO" ? "bg-success" : "bg-danger"}`}>
                              {r.encargo}
                            </span>
                          </td>
                          <td>{formatDateTime(r.fecha)}</td>
                          <td className="text-center">
                            <i className={`bi ${alDia ? "bi-check-circle-fill text-success" : "bi-exclamation-triangle-fill text-warning"}`}></i>
                          </td>
                        </tr>
                      );
                    })}
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
                    de {tableData.length}
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
        <div className="col-12 col-lg-4 mt-4 mt-lg-0">
          <div className="card shadow-sm mb-3">
            <div className="card-header bg-light">
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-bar-chart-fill text-primary"></i>
                Vehículos por condición
              </h6>
            </div>
            <div className="card-body">
              <StackedMiniChart data={recentData.vehiculos} height={160} />
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h6 className="mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-speedometer2 text-info"></i>
                Miles fiscalizados
              </h6>
            </div>
            <div className="card-body">
              <MiniBars data={recentData.miles} height={160} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Componentes de gráficos ===== */

// Gráfico de barras apiladas para vehículos al día vs con problemas
function StackedMiniChart({
  data,
  height = 140,
}: {
  data: { label: string; alDia: number; conProblemas: number }[];
  height?: number;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height }}>
        <span className="text-muted">Sin datos disponibles</span>
      </div>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.alDia + d.conProblemas));
  const barWidth = Math.min(40, Math.max(20, 250 / data.length));
  const gap = 8;
  const totalWidth = data.length * barWidth + (data.length - 1) * gap;
  const padBottom = 25;
  const padTop = 15;
  const padSides = 20;

  return (
    <div style={{ width: '100%', height: height, position: 'relative' }}>
      <svg 
        width="100%" 
        height={height} 
        viewBox={`0 0 ${totalWidth + padSides * 2} ${height}`} 
        style={{ overflow: 'visible' }}
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padTop + (height - padTop - padBottom) * (1 - ratio);
          return (
            <line 
              key={i}
              x1={padSides} 
              y1={y} 
              x2={totalWidth + padSides} 
              y2={y} 
              stroke="#e9ecef" 
              strokeWidth="1"
            />
          );
        })}
        
        {data.map((d, i) => {
          const x = padSides + i * (barWidth + gap);
          const total = d.alDia + d.conProblemas;
          const barHeight = total > 0 ? ((height - padTop - padBottom) * total) / max : 0;
          
          const problemasHeight = total > 0 ? (barHeight * d.conProblemas) / total : 0;
          const alDiaHeight = barHeight - problemasHeight;
          
          const yBase = height - padBottom;
          const yProblemas = yBase - barHeight;
          const yAlDia = yProblemas + problemasHeight;

          return (
            <g key={i}>
              {/* Barra problemas (rojo) */}
              {problemasHeight > 0 && (
                <rect
                  x={x}
                  y={yProblemas}
                  width={barWidth}
                  height={problemasHeight}
                  fill="#dc3545"
                  rx={2}
                />
              )}
              
              {/* Barra al día (verde) */}
              {alDiaHeight > 0 && (
                <rect
                  x={x}
                  y={yAlDia}
                  width={barWidth}
                  height={alDiaHeight}
                  fill="#198754"
                  rx={2}
                />
              )}
              
              {/* Etiqueta del período */}
              <text 
                x={x + barWidth / 2} 
                y={height - 8} 
                textAnchor="middle" 
                fontSize="10" 
                fill="#6c757d"
              >
                {d.label}
              </text>
              
              {/* Valor total */}
              {total > 0 && (
                <text 
                  x={x + barWidth / 2} 
                  y={yProblemas - 5} 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill="#333"
                  fontWeight="bold"
                >
                  {total}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Leyenda */}
      <div className="d-flex justify-content-center gap-3 mt-2" style={{ fontSize: '11px' }}>
        <div className="d-flex align-items-center gap-1">
          <div style={{ width: 12, height: 12, backgroundColor: '#198754', borderRadius: 2 }}></div>
          <span>Al día</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <div style={{ width: 12, height: 12, backgroundColor: '#dc3545', borderRadius: 2 }}></div>
          <span>Con problemas</span>
        </div>
      </div>
    </div>
  );
}

// Gráfico de barras simple para miles
function MiniBars({
  data,
  height = 140,
}: {
  data: { label: string; v: number }[];
  height?: number;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height }}>
        <span className="text-muted">Sin datos disponibles</span>
      </div>
    );
  }

  // Si todos los valores son 0, mostrar mensaje especial
  const hasData = data.some(d => d.v > 0);
  if (!hasData) {
    return (
      <div className="d-flex align-items-center justify-content-center flex-column" style={{ height }}>
        <div style={{ fontSize: '24px', color: '#6c757d' }}>📊</div>
        <span className="text-muted mt-2">No hay miles registrados</span>
      </div>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.v));
  const barWidth = Math.min(40, Math.max(20, 250 / data.length));
  const gap = 12;
  const totalWidth = data.length * barWidth + (data.length - 1) * gap;
  const padBottom = 25;
  const padTop = 15;
  const padSides = 20;

  return (
    <div style={{ width: '100%', height: height, position: 'relative' }}>
      <svg 
        width="100%" 
        height={height} 
        viewBox={`0 0 ${totalWidth + padSides * 2} ${height}`}
        style={{ overflow: 'visible' }}
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padTop + (height - padTop - padBottom) * (1 - ratio);
          return (
            <line 
              key={i}
              x1={padSides} 
              y1={y} 
              x2={totalWidth + padSides} 
              y2={y} 
              stroke="#e9ecef" 
              strokeWidth="1"
            />
          );
        })}
        
        {data.map((d, i) => {
          const x = padSides + i * (barWidth + gap);
          const barHeight = ((height - padTop - padBottom) * d.v) / max;
          const y = height - padBottom - barHeight;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#0d6efd"
                rx={3}
              />
              
              {/* Etiqueta del período */}
              <text 
                x={x + barWidth / 2} 
                y={height - 8} 
                textAnchor="middle" 
                fontSize="10" 
                fill="#6c757d"
              >
                {d.label}
              </text>
              
              {/* Valor */}
              {d.v > 0 && (
                <text 
                  x={x + barWidth / 2} 
                  y={y - 5} 
                  textAnchor="middle" 
                  fontSize="10" 
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
