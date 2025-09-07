// app/Home/Registro_de_obtencion_de_permisos/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import API_CONFIG from "@/config/api";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || API_CONFIG.BACKEND; // Asegúrate de definir esta variable de entorno
      const response = await fetch(`${baseUrl}calcular-metricas/permisos/${groupBy}/${desde}/${hasta}`, {
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

  // Datos para Chart.js
  const chartData = useMemo(() => {
    if (!apiData?.charts?.emisiones_por_periodo_miles) return [];
    
    // Determinar cuántos períodos mostrar según el tipo
    const periodsToShow = groupBy === "AÑO" ? 3 : groupBy === "MES" ? 6 : 7;
    
    return apiData.charts.emisiones_por_periodo_miles.slice(-periodsToShow);
  }, [apiData, groupBy]);

  // Configuración para Chart.js
  const emisionesChartData = useMemo(() => {
    return {
      labels: chartData.map(item => formatDateLabel(item.periodo, groupBy)),
      datasets: [
        {
          label: 'Permisos emitidos',
          data: chartData.map(item => item.miles), // Ya son unidades individuales, no miles
          backgroundColor: '#0d6efd',
          borderColor: '#0d6efd',
          borderWidth: 1,
        },
      ],
    };
  }, [chartData, groupBy]);

  // Opciones para el gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#ddd',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `Permisos emitidos: ${context.parsed.y.toLocaleString('es-CL')}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            return Number.isInteger(value) ? value.toLocaleString('es-CL') : '';
          },
          font: {
            size: 11,
          },
        },
        grid: {
          color: '#e9ecef',
        },
        title: {
          display: true,
          text: 'Permisos emitidos (unidades)',
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          maxRotation: 45,
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
      },
    },
  };

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
    <div className="my-4">
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
      <div className="card">
        <h5 className="card-header text-center" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>Filtros</h5>
        <form onSubmit={handleFilterSubmit} className="row g-3 align-items-end p-4">
          <div className="col-12 col-md-2">            <label className="form-label">Agrupar por</label>
            <select
              className="form-control"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              style={{ 
                height: '38px',
                fontSize: '14px',
                borderColor: '#ced4da',
                borderRadius: '0.375rem'
              }}
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

          <div className="col-12 col-md-2 d-grid">
            <button type="submit" className="btn btn-success w-100" disabled={loading}>
              {loading ? 'Filtrando...' : 'Filtrar'}
            </button>
          </div>

          <div className="col-12 col-md-2 d-grid">
            <button type="button" className="btn btn-primary w-100" onClick={handleGeneratePDF}>
              Generar Informe
            </button>
          </div>

        </form>
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
      <div className="card mt-4">
        <h5 className="card-header text-center" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>Resumen obtención de permisos</h5>
        <div className="row p-4">
          <div className="col-12 col-md-4">
            <div className="card text-center">
              <div className="card-body" style={{ backgroundColor: '#e6f0ff', border: '1px solid #b3d1ff' }}>
                <h3 className="card-title text-primary" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>Total Permisos</h3>
                <h3 className="display-6" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>{kpis.totalPermisos}</h3>
                <h4 className="text-muted" style={{ fontFamily: 'Roboto', fontWeight: 'normal' }}>emitidos</h4>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card text-center">
              <div className="card-body" style={{ backgroundColor: '#e6ffe6', border: '1px solid #b3ffb3' }}>
                <h3 className="card-title text-success" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>Recaudación</h3>
                <h3 className="display-6" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                  ${kpis.recaudacion.toLocaleString("es-CL")}
                </h3>
                <h4 className="text-muted" style={{ fontFamily: 'Roboto', fontWeight: 'normal' }}>CLP total</h4>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card text-center">
              <div className="card-body" style={{ backgroundColor: '#fff2e6', border: '1px solid #ffcc99' }}>
                <h3 className="card-title text-warning" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>Valor Promedio</h3>
                <h3 className="display-6" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                  ${kpis.valorPromedio.toLocaleString("es-CL", {
                    maximumFractionDigits: 0,
                  })}
                </h3>
                <h4 className="text-muted" style={{ fontFamily: 'Roboto', fontWeight: 'normal' }}>CLP promedio</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout: gráfico Chart.js + tabla */}
      <div className="row g-3 mt-3">

        {/* Gráficos */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-light">
              <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                <i className="bi bi-bar-chart-fill text-primary"></i>
                Emisiones por período (unidades)
              </h6>
            </div>
            <div className="card-body">
              <div style={{ height: '250px' }}>
                {emisionesChartData.datasets[0].data.length > 0 ? (
                  <Bar data={emisionesChartData} options={chartOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 flex-column">
                    <div style={{ fontSize: '32px', color: '#6c757d' }}>📊</div>
                    <span className="text-muted mt-2 text-center">
                      No hay emisiones registradas<br/>
                      <small>en el período seleccionado</small>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="col-12 col-lg-6">
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
  switch (periodType) {
    case "AÑO":
      // Si es solo un año (como "2025"), devolverlo directamente
      if (dateString.length === 4 && !isNaN(Number(dateString))) {
        return dateString;
      }
      // Si es una fecha completa, extraer el año
      const yearDate = new Date(dateString);
      return yearDate.getFullYear().toString();
      
    case "MES":
      const monthDate = new Date(dateString + 'T00:00:00');
      return monthDate.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "short",
      });
      
    case "DIA":
    default:
      const dayDate = new Date(dateString + 'T00:00:00');
      console.log('Formateando fecha:', dateString, '->', dayDate);
      return dayDate.toLocaleDateString("es-CL", {
      month: "short",
      day: "numeric",
      });
  }
}
