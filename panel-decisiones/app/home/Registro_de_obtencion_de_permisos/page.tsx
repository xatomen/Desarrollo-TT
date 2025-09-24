// app/Home/Registro_de_obtencion_de_permisos/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { applyChartTheme, palette, CHART_HEIGHT, buildBarOptions, buildLineOptions, pieOptions as sharedPieOptions } from "@/app/components/charts/theme";
import API_CONFIG from "@/config/api";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Aplicar tema global
applyChartTheme();

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

// Tipos para los nuevos endpoints
type PadronCountResponse = {
  count: number;
};

type PermisoCountResponse = {
  count: number;
  year: number;
};

export default function RegistroObtencionPermisosPage() {
  // Estados para datos de la API
  const [apiData, setApiData] = useState<ApiResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para el nuevo gráfico de comparación
  const [padronCount, setPadronCount] = useState<number>(0);
  const [permisosCount, setPermisosCount] = useState<number>(0);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [comparisonYear, setComparisonYear] = useState<number>(new Date().getFullYear());

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

  // Función para obtener datos de comparación (padrones vs permisos)
  const fetchComparisonData = async () => {
    setLoadingComparison(true);
    
    try {
      // Inicializar con valores por defecto
      let padronData: PadronCountResponse = { count: 0 };
      let permisoData: PermisoCountResponse = { count: 0, year: comparisonYear };

      try {
        // Obtener cantidad total de padrones a través del proxy de Next.js
        const padronResponse = await fetch('/api/padron-count', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (padronResponse.ok) {
          padronData = await padronResponse.json();
          console.log('✅ Datos de padrones obtenidos vía proxy:', padronData);
        } else {
          console.error('❌ Error en proxy de padrones:', padronResponse.status, padronResponse.statusText);
          throw new Error(`Error ${padronResponse.status}`);
        }
      } catch (padronError) {
        console.error('❌ Error conectando al proxy de padrones:', padronError);
        // Sin fallback - dejar en 0 para mostrar el error real
      }

      try {
        // Obtener cantidad de permisos emitidos a través del proxy de Next.js
        const permisoResponse = await fetch(`/api/permiso-count/${comparisonYear}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (permisoResponse.ok) {
          permisoData = await permisoResponse.json();
          console.log('✅ Datos de permisos obtenidos vía proxy:', permisoData);
        } else {
          console.error('❌ Error en proxy de permisos:', permisoResponse.status, permisoResponse.statusText);
          throw new Error(`Error ${permisoResponse.status}`);
        }
      } catch (permisoError) {
        console.error('❌ Error conectando al proxy de permisos:', permisoError);
        // Sin fallback - dejar en 0 para mostrar el error real
      }
      
      // Actualizar estados con los datos obtenidos
      setPadronCount(padronData.count || 0);
      setPermisosCount(permisoData.count || 0);
      
    } catch (err) {
      console.error('❌ Error general en fetchComparisonData:', err);
      // Sin fallback - mantener valores en 0 para mostrar error real
    } finally {
      setLoadingComparison(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchData();
    fetchComparisonData();
  }, []);

  // Cargar datos de comparación cuando cambie el año
  useEffect(() => {
    fetchComparisonData();
  }, [comparisonYear]);

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
          backgroundColor: palette.primary,
          borderColor: palette.primary,
          borderWidth: 1,
        },
      ],
    };
  }, [chartData, groupBy]);

  // Opciones para el gráfico
  const chartOptions = buildBarOptions({ showLegend: false, yTitle: 'Permisos emitidos (unidades)' });

  // Configuración para el gráfico de comparación
  const comparisonChartData = useMemo(() => {
    const porcentajePagado = padronCount > 0 ? ((permisosCount / padronCount) * 100) : 0;
    
    return {
      labels: ['Total Padrones', `Permisos Pagados ${comparisonYear}`, 'Porcentaje Pagado (%)'],
      datasets: [
        {
          label: 'Cantidad',
          data: [padronCount, permisosCount, porcentajePagado],
          backgroundColor: [
            palette.info,      // Azul para total padrones
            palette.success,   // Verde para permisos pagados
            palette.warning    // Naranja para porcentaje
          ],
          borderColor: [
            palette.info,
            palette.success,
            palette.warning
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [padronCount, permisosCount, comparisonYear]);

  const comparisonChartOptions = buildBarOptions({ 
    showLegend: false, 
    yTitle: 'Cantidad / Porcentaje'
  });

  // Datos para gráfico de distribución por valor
  const valorRangeChartData = useMemo(() => {
    const ranges = {
      bajo: 0,      // < 50,000
      medio: 0,     // 50,000 - 100,000
      alto: 0,      // 100,000 - 200,000
      premium: 0    // > 200,000
    };
    
    permisosData.forEach(permiso => {
      const valor = permiso.valor_permiso;
      if (valor < 50000) ranges.bajo++;
      else if (valor <= 100000) ranges.medio++;
      else if (valor <= 200000) ranges.alto++;
      else ranges.premium++;
    });

    return {
      labels: ['Bajo (<$50.000)', 'Medio ($50.000-$100.000)', 'Alto ($100.000-$200.000)', 'Premium (>$200.000)'],
      datasets: [{
        data: [ranges.bajo, ranges.medio, ranges.alto, ranges.premium],
        backgroundColor: [
          '#16a34a', // verde para bajo
          '#3b82f6', // azul para medio
          '#f59e0b', // amarillo para alto
          '#ef4444'  // rojo para premium
        ],
        borderColor: ['#ffffff'],
        borderWidth: 2,
      }],
    };
  }, [permisosData]);

  // Datos para gráfico de línea por fecha de emisión
  const fechaEmisionChartData = useMemo(() => {
    // Agrupar por día
    const fechaCounts: { [key: string]: number } = {};
    
    permisosData.forEach(permiso => {
      const fecha = new Date(permiso.fecha_emision);
      const fechaKey = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
      fechaCounts[fechaKey] = (fechaCounts[fechaKey] || 0) + 1;
    });

    // Ordenar fechas y tomar las últimas 10
    const sortedFechas = Object.keys(fechaCounts)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-10);

    return {
      labels: sortedFechas.map(fecha => formatDateLabel(fecha, "DIA")),
      datasets: [{
        label: 'Permisos por día',
        data: sortedFechas.map(fecha => fechaCounts[fecha]),
        borderColor: palette.primary,
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
      }],
    };
  }, [permisosData]);

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

      {/* Contenido principal */}
      <div className="row mt-4">
        {/* Col izquierda: gráficos principales */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm mb-3">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                <i className="bi bi-pie-chart-fill" style={{ color: palette.success }}></i>
                Padrones vs Permisos
              </h6>
              <div className="d-flex align-items-center gap-2">
                <label className="form-label mb-0 small">Año:</label>
                <select
                  className="form-select form-select-sm"
                  style={{ width: '80px', fontSize: '12px' }}
                  value={comparisonYear}
                  onChange={(e) => setComparisonYear(Number(e.target.value))}
                >
                  {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="card-body">
              {loadingComparison ? (
                <div className="d-flex align-items-center justify-content-center" style={{ height: CHART_HEIGHT.lg }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : padronCount === 0 && permisosCount === 0 ? (
                <div className="d-flex align-items-center justify-content-center" style={{ height: CHART_HEIGHT.lg }}>
                  <span className="text-muted">Servicios no disponibles</span>
                </div>
              ) : (
                <div style={{ height: CHART_HEIGHT.lg }}>
                  <Bar data={comparisonChartData} options={comparisonChartOptions} />
                </div>
              )}
              
              {/* Resumen de datos */}
              <div className="mt-3 pt-3 border-top">
                <div className="row text-center">
                  <div className="col-4">
                    <div className="text-info">
                      <strong>{padronCount.toLocaleString()}</strong>
                      <div className="small text-muted">Total Padrones</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="text-success">
                      <strong>{permisosCount.toLocaleString()}</strong>
                      <div className="small text-muted">Permisos {comparisonYear}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="text-warning">
                      <strong>{padronCount > 0 ? ((permisosCount / padronCount) * 100).toFixed(1) : 0}%</strong>
                      <div className="small text-muted">Pagados</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm mb-3">
            <div className="card-header bg-light">
              <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                <i className="bi bi-bar-chart-fill" style={{ color: palette.primary }}></i>
                Emisiones por período (unidades)
              </h6>
            </div>
            <div className="card-body">
              <div style={{ height: CHART_HEIGHT.md }}>
                {emisionesChartData.datasets[0].data.length > 0 ? (
                  <Bar data={emisionesChartData} options={chartOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <span className="text-muted">Sin datos disponibles</span>
                  </div>
                )}
              </div>
              <div className="mt-2 text-center">
                <small className="text-muted">Cada barra representa permisos emitidos en el período.</small>
              </div>
            </div>
          </div>
        </div>

        {/* Col derecha: tabla */}
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
                      <th>Valor</th>
                      <th>Emisión</th>
                      <th>Expiración</th>
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
                          <span className="badge bg-success" style={{ borderRadius: '0.5rem', color: 'white', fontWeight: '400', width: '90px', display: 'inline-block', textAlign: 'center', fontSize: '11px' }}>
                            ${r.valor_permiso.toLocaleString("es-CL")}
                          </span>
                        </td>
                        <td>{formatDate(r.fecha_emision)}</td>
                        <td>{formatDate(r.fecha_expiracion)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
                  <span className="text-muted">de {permisosData.length}</span>
                </div>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPage(1)}>&laquo;</button>
                    </li>
                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>&lsaquo;</button>
                    </li>
                    <li className="page-item disabled">
                      <span className="page-link">{page} / {totalPages}</span>
                    </li>
                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>&rsaquo;</button>
                    </li>
                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPage(totalPages)}>&raquo;</button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos adicionales de análisis */}
      <div className="col-12 mt-4">
        <div className="row">
          {/* Análisis por valor de permiso */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-light">
                <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                  <i className="bi bi-pie-chart" style={{ color: palette.success }}></i>
                  Distribución por Rango de Valor
                </h6>
              </div>
              <div className="card-body">
                <div style={{ height: CHART_HEIGHT.md }}>
                  {valorRangeChartData.datasets[0].data.some((val: number) => val > 0) ? (
                    <Pie data={valorRangeChartData} options={sharedPieOptions} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <span className="text-muted">Sin datos disponibles</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tendencia de emisiones por fecha */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-light">
                <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                  <i className="bi bi-graph-up" style={{ color: palette.primary }}></i>
                  Emisiones por día (últimos 10 días)
                </h6>
              </div>
              <div className="card-body">
                <div style={{ height: CHART_HEIGHT.md }}>
                  {fechaEmisionChartData.datasets[0].data.length > 0 ? (
                    <Line data={fechaEmisionChartData} options={buildLineOptions({ yTitle: 'Número de permisos' })} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <span className="text-muted">Sin datos disponibles</span>
                    </div>
                  )}
                </div>
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
