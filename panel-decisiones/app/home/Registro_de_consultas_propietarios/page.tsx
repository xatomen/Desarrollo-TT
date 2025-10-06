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
import { applyChartTheme, palette, CHART_HEIGHT, buildBarOptions } from "@/app/components/charts/theme";
import API_CONFIG from "@/config/api";
import { generatePDFFromElement, generateStructuredPDFFromElement } from "@/app/utils/pdfGenerator";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Aplicar tema global
applyChartTheme();

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
  // Estados para generación de PDF
  const [generatingPDF, setGeneratingPDF] = useState(false);
  
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
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || API_CONFIG.BACKEND;
      const response = await fetch(`${baseUrl}calcular-metricas/consultas/${groupBy}/${desde}/${hasta}`, {
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

  // Configuración para gráficos Chart.js
  const consultasChartData = useMemo(() => {
    const periodsToShow = groupBy === "AÑO" ? 3 : groupBy === "MES" ? 6 : 7;
    const recentData = chartData.consultas.slice(-periodsToShow);
    return {
      labels: recentData.map(item => formatDateLabel(item.periodo, groupBy)),
      datasets: [
        {
          label: 'Consultas',
          data: recentData.map(item => item.consultas),
          backgroundColor: palette.primary,
          borderColor: palette.primary,
          borderWidth: 1,
        },
      ],
    };
  }, [chartData, groupBy]);

  const usuariosChartData = useMemo(() => {
    const periodsToShow = groupBy === "AÑO" ? 3 : groupBy === "MES" ? 6 : 7;
    const recentData = chartData.usuarios.slice(-periodsToShow);
    return {
      labels: recentData.map(item => formatDateLabel(item.periodo, groupBy)),
      datasets: [
        {
          label: 'Usuarios únicos',
          data: recentData.map(item => item.usuarios_unicos),
          backgroundColor: palette.success,
          borderColor: palette.success,
          borderWidth: 1,
        },
      ],
    };
  }, [chartData, groupBy]);

  // Opciones comunes para los gráficos
  const chartOptions = buildBarOptions({ showLegend: false });

  // Actualizar localStorage cuando se genere PDF
  async function handleGeneratePDF() {
    if (generatingPDF) return;
    
    setGeneratingPDF(true);
    
    try {
      // Preparar información para el PDF
      const currentDate = new Date().toLocaleDateString('es-CL');
      const subtitle = `Período: ${desde} al ${hasta} | Generado: ${currentDate}`;
      const filename = `Registro_Consultas_Propietarios_${desde}_${hasta}.pdf`;
      
      // Generar el PDF usando el método estructurado
      await generateStructuredPDFFromElement(
        'pdf-content',
        'Registro de Consultas de Propietarios',
        subtitle,
        filename
      );
      
      // Actualizar localStorage
      if (typeof window !== 'undefined') {
        const timestamp = new Date().toLocaleString();
        localStorage.setItem('lastReport:consultas', timestamp);
      }
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    } finally {
      setGeneratingPDF(false);
    }
  }

  return (
    <div className="my-4" id="pdf-content">
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
      <div className="card">
        <h5 className="card-header text-center" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>Filtros</h5>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchData();
          }}
          className="row g-3 align-items-end p-4"
        >
          <div className="col-12 col-md-2">
            <label className="form-label">Agrupar por</label>
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
            <button type="submit" className="btn btn-success w-100 pdf-hide-buttons" disabled={loading}>
              {loading ? 'Filtrando...' : 'Filtrar'}
            </button>
          </div>

          <div className="col-12 col-md-2 d-grid">
            <button
              type="button"
              className="btn btn-primary w-100 pdf-hide-buttons"
              onClick={handleGeneratePDF}
              disabled={generatingPDF}
            >
              {generatingPDF ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Generando...</span>
                  </div>
                  Generando...
                </>
              ) : (
                'Generar Informe'
              )}
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

        {/* Gráficos con Chart.js */}
        <div className="col-12 col-lg-6 mt-4 mt-lg-0">
          <div className="card shadow-sm mb-3">
            <h6 className="card-header" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
              Consultas — Últimos períodos
              </h6>
            <div className="card-body">
              <div style={{ height: CHART_HEIGHT.sm }}>
                {consultasChartData.datasets[0].data.length > 0 ? (
                  <Bar data={consultasChartData} options={chartOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <span className="text-muted">Sin datos disponibles</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <h6 className="card-header" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
              Usuarios únicos — Últimos períodos
            </h6>
            <div className="card-body">
              <div style={{ height: CHART_HEIGHT.sm }}>
                {usuariosChartData.datasets[0].data.length > 0 ? (
                  <Bar data={usuariosChartData} options={chartOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <span className="text-muted">Sin datos disponibles</span>
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
                      <th>RUT Propietario</th>
                      <th>PPU</th>
                      <th>Fecha/Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center py-5 text-muted">
                          {loading ? 'Cargando...' : 'Sin resultados'}
                        </td>
                      </tr>
                    )}

                    {currentRows.map((r, i) => (
                      <tr key={`${r.rut}-${i}`}>
                        <td><code>{r.rut}</code></td>
                        <td><strong>{r.ppu}</strong></td>
                        <td>{formatDateTime(r.fecha)}</td>
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
  switch (periodType) {
    case "AÑO":
      // Si es solo un año (como "2025"), devolverlo directamente
      if (dateString.length === 4 && !isNaN(Number(dateString))) {
        return dateString;
      }
      // Si es una fecha completa, extraer el año
      const yearDate = new Date(dateString); // Asegurar que se interprete como fecha local
      return yearDate.getFullYear().toString();
      
    case "MES":
      const monthDate = new Date(dateString + 'T00:00:00'); // Asegurar que se interprete como fecha local
      return monthDate.toLocaleDateString("es-CL", {
        month: "long", // Nombre completo del mes
      });
      
    case "DIA":
    default:
      const dayDate = new Date(dateString + 'T00:00:00'); // Asegurar que se interprete como fecha local
      return dayDate.toLocaleDateString("es-CL", {
        day: "numeric",
        month: "short", // Mes abreviado
      });
  }
}

