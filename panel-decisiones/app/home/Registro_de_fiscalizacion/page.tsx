// app/Home/Registro_de_fiscalizacion/page.tsx
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
import { generatePDFFromElement, generateStructuredPDFFromElement } from "@/app/utils/pdfGenerator";

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

// Aplicar tema global una vez
applyChartTheme();

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
        multas: boolean;
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
  multas: "SI" | "NO";
  fecha: string;
  marca: string;
  modelo: string;
  anio: number;
};

export default function RegistroFiscalizacionPage() {
  // Estados para generación de PDF
  const [generatingPDF, setGeneratingPDF] = useState(false);
  
  // Estados para datos de la API
  const [apiData, setApiData] = useState<ApiResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para datos de SRCEI
  const [srceiData, setSrceiData] = useState<{
    total_matriculas: number;
    vehiculos_pagados: number;
  } | null>(null);
  const [srceiLoading, setSrceiLoading] = useState(false);

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
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || API_CONFIG.BACKEND;
      const response = await fetch(`${baseUrl}calcular-metricas/fiscalizacion/${groupBy}/${desde}/${hasta}`, {
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

  // Función para hacer fetch de datos SRCEI
  const fetchSrceiData = async () => {
    setSrceiLoading(true);
    try {
      // Simular API call a SRCEI - en producción sería una llamada real
      // Ejemplo: http://localhost:8006/estadisticas/annual
      
      // Por ahora simulamos los datos basados en el año actual
      const currentYear = new Date().getFullYear();
      
      // Datos simulados realistas basados en los datos de prueba creados
      // En producción esto vendría de queries como:
      // Total matrículas 2025: SELECT COUNT(*) FROM PADRON WHERE YEAR(FECHA_INSCRIPCION) = 2025
      // Vehículos sin multas: SELECT COUNT(DISTINCT p.PPU) FROM PADRON p WHERE YEAR(p.FECHA_INSCRIPCION) = 2025 AND p.PPU NOT IN (SELECT DISTINCT m.PPU FROM MULTAS_TRANSITO m)
      
      const mockData = {
        total_matriculas: 73, // Total de vehículos inscritos en 2025 (datos originales + adicionales)
        vehiculos_pagados: 48, // Vehículos sin multas (al día con sus pagos)
        anio: currentYear
      };
      
      setSrceiData(mockData);
    } catch (err) {
      console.error('Error fetching SRCEI data:', err);
    } finally {
      setSrceiLoading(false);
    }
  };

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    fetchData();
    fetchSrceiData(); // Cargar datos de SRCEI
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
        multas: vehicle.multas ? "SI" : "NO",
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

  // Datos para Chart.js - Vehículos por condición (gráfico apilado)
  const vehiculosChartData = useMemo(() => {
    const periodsToShow = groupBy === "AÑO" ? 3 : groupBy === "MES" ? 6 : 7;
    const recentData = chartData.vehiculos.slice(-periodsToShow);

    return {
      labels: recentData.map(item => formatDateLabel(item.periodo, groupBy)),
      datasets: [
        {
          label: 'Al día',
          data: recentData.map(item => item.al_dia),
          backgroundColor: '#16a34a', // green-600
          borderColor: '#16a34a',
          borderWidth: 1,
          stack: 'stack1',
        },
        {
          label: 'Con problemas',
          data: recentData.map(item => item.con_problemas),
          backgroundColor: '#dc2626', // red-600
          borderColor: '#dc2626',
          borderWidth: 1,
          stack: 'stack1',
        },
      ],
    };
  }, [chartData, groupBy]);

  // (El gráfico de "Vehículos fiscalizados" fue removido a petición del usuario)

  // Datos para gráficos de estado de documentos usando datos del endpoint
  const documentStatusCharts = useMemo(() => {
    if (!apiData?.tables?.vehiculos) {
      return {
        permiso: {
          labels: ['Vigente', 'No Vigente'],
          datasets: [{ data: [0, 0], backgroundColor: ['#16a34a', '#dc2626'], borderColor: ['#16a34a', '#dc2626'], borderWidth: 1 }],
        },
        revision: {
          labels: ['Vigente', 'No Vigente'],
          datasets: [{ data: [0, 0], backgroundColor: ['#16a34a', '#dc2626'], borderColor: ['#16a34a', '#dc2626'], borderWidth: 1 }],
        },
        soap: {
          labels: ['Vigente', 'No Vigente'],
          datasets: [{ data: [0, 0], backgroundColor: ['#16a34a', '#dc2626'], borderColor: ['#16a34a', '#dc2626'], borderWidth: 1 }],
        },
      };
    }

    const permisoCount = { vigente: 0, noVigente: 0 };
    const revisionCount = { vigente: 0, noVigente: 0 };
    const soapCount = { vigente: 0, noVigente: 0 };

    // Usar directamente los datos del endpoint
    apiData.tables.vehiculos.forEach(vehicle => {
      // Permiso
      if (vehicle.vigencia_permiso) permisoCount.vigente++;
      else permisoCount.noVigente++;
      
      // Revisión
      if (vehicle.vigencia_revision) revisionCount.vigente++;
      else revisionCount.noVigente++;
      
      // SOAP
      if (vehicle.vigencia_soap) soapCount.vigente++;
      else soapCount.noVigente++;
    });

    return {
      permiso: {
        labels: ['Vigente', 'No Vigente'],
        datasets: [{
          data: [permisoCount.vigente, permisoCount.noVigente],
          backgroundColor: ['#16a34a', '#dc2626'],
          borderColor: ['#16a34a', '#dc2626'],
          borderWidth: 1,
        }],
      },
      revision: {
        labels: ['Vigente', 'No Vigente'],
        datasets: [{
          data: [revisionCount.vigente, revisionCount.noVigente],
          backgroundColor: ['#16a34a', '#dc2626'],
          borderColor: ['#16a34a', '#dc2626'],
          borderWidth: 1,
        }],
      },
      soap: {
        labels: ['Vigente', 'No Vigente'],
        datasets: [{
          data: [soapCount.vigente, soapCount.noVigente],
          backgroundColor: ['#16a34a', '#dc2626'],
          borderColor: ['#16a34a', '#dc2626'],
          borderWidth: 1,
        }],
      },
    };
  }, [apiData]);

  // Datos para gráfico de pastel de Multas usando datos del endpoint
  const multasChartData = useMemo(() => {
    if (!apiData?.tables?.vehiculos) {
      return {
        labels: ['Sin multas', 'Con multas'],
        datasets: [{
          data: [0, 0],
          backgroundColor: ['#16a34a', '#dc2626'],
          borderColor: ['#ffffff'],
          borderWidth: 2,
        }],
      };
    }

    const multasCount = { si: 0, no: 0 };
    
    // Usar directamente los datos del endpoint
    apiData.tables.vehiculos.forEach(vehicle => {
      if (vehicle.multas) multasCount.si++;
      else multasCount.no++;
    });

    return {
      labels: ['Sin multas', 'Con multas'],
      datasets: [{
        data: [multasCount.no, multasCount.si],
        backgroundColor: ['#16a34a', '#dc2626'],
        borderColor: ['#ffffff'],
        borderWidth: 2,
      }],
    };
  }, [apiData]);

  // Datos para gráfico de pastel de Encargo usando datos del endpoint
  const encargoChartData = useMemo(() => {
    if (!apiData?.tables?.vehiculos) {
      return {
        labels: ['Sin Encargo', 'Con Encargo'],
        datasets: [{
          data: [0, 0],
          backgroundColor: ['#16a34a', '#dc2626'],
          borderColor: ['#ffffff'],
          borderWidth: 2,
        }],
      };
    }

    const encargoCount = { si: 0, no: 0 };
    
    // Usar directamente los datos del endpoint
    apiData.tables.vehiculos.forEach(vehicle => {
      if (vehicle.encargo_robo) encargoCount.si++;
      else encargoCount.no++;
    });

    return {
      labels: ['Sin Encargo', 'Con Encargo'],
      datasets: [{
        data: [encargoCount.no, encargoCount.si],
        backgroundColor: ['#16a34a', '#dc2626'],
        borderColor: ['#ffffff'],
        borderWidth: 2,
      }],
    };
  }, [apiData]);

  // Datos para gráfico de línea por fecha
  const fechaChartData = useMemo(() => {
    // Agrupar por día
    const fechaCounts: { [key: string]: number } = {};
    
    tableData.forEach(row => {
      const fecha = new Date(row.fecha);
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
        label: 'Fiscalizaciones por día',
        data: sortedFechas.map(fecha => fechaCounts[fecha]),
        borderColor: palette.primary,
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
      }],
    };
  }, [tableData]);

  // Datos para gráfico de SRCEI (matrículas vs pagados)
  const srceiChartData = useMemo(() => {
    if (!srceiData) {
      return {
        labels: ['Al día', 'Con multas'],
        datasets: [{
          data: [0, 0],
          backgroundColor: ['#16a34a', '#dc2626'],
          borderColor: ['#ffffff'],
          borderWidth: 2,
        }],
      };
    }

    const conMultas = Math.max(0, srceiData.total_matriculas - srceiData.vehiculos_pagados);
    return {
      labels: ['Al día', 'Con multas'],
      datasets: [{
        data: [srceiData.vehiculos_pagados, conMultas],
        backgroundColor: ['#16a34a', '#dc2626'],
        borderColor: ['#ffffff'],
        borderWidth: 2,
      }],
    };
  }, [srceiData]);

  // Opciones para gráfico apilado (usando tema)
  const stackedChartOptions = {
    ...buildBarOptions({ stacked: true, showLegend: true }),
    plugins: {
      ...(buildBarOptions({ stacked: true, showLegend: true }) as any).plugins,
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        borderColor: '#ddd',
        borderWidth: 1,
        callbacks: {
          afterLabel: function(context: any) {
            const dataIndex = context.dataIndex;
            const datasets = context.chart.data.datasets as any[];
            let total = 0;
            datasets.forEach((ds) => { const v = ds.data[dataIndex]; if (v != null) total += v; });
            const currentValue = context.dataset.data[dataIndex];
            const percentage = total > 0 ? ((currentValue / total) * 100).toFixed(1) : 0;
            return `${percentage}% del total de este período`;
          },
          footer: function(context: any) {
            if (!context.length) return '';
            const dataIndex = context[0].dataIndex;
            const datasets = context[0].chart.data.datasets as any[];
            let total = 0;
            datasets.forEach((ds) => { const v = ds.data[dataIndex]; if (v != null) total += v; });
            return `Total: ${total} vehículos`;
          },
        },
      },
    },
  } as const;

  // Opciones para gráfico simple
  // (Sin gráfico de barras simple en esta vista)

  // Calcular estadísticas usando los datos del endpoint
  const stats = useMemo(() => {
    if (!apiData?.charts?.vehiculos_por_condicion) {
      return { alDia: 0, conProblemas: 0, pctAlDia: 0, pctConProblemas: 0 };
    }

    // Sumar todos los vehículos al día y con problemas del período seleccionado
    const totales = apiData.charts.vehiculos_por_condicion.reduce(
      (acc, item) => ({
        alDia: acc.alDia + item.al_dia,
        conProblemas: acc.conProblemas + item.con_problemas
      }),
      { alDia: 0, conProblemas: 0 }
    );

    const total = totales.alDia + totales.conProblemas;

    return {
      alDia: totales.alDia,
      conProblemas: totales.conProblemas,
      pctAlDia: apiData.kpi?.documentos_al_dia_pct || 0,
      pctConProblemas: apiData.kpi?.vencidos_o_encargo_pct || 0,
    };
  }, [apiData]);

  // Función para manejar el submit del formulario
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Resetear a la primera página
    fetchData(); // Hacer el fetch con los nuevos filtros
  };

  // Actualizar localStorage cuando se genere PDF
  async function handleGeneratePDF() {
    if (generatingPDF) return;
    
    setGeneratingPDF(true);
    
    try {
      // Preparar información para el PDF
      const currentDate = new Date().toLocaleDateString('es-CL');
      const subtitle = `Período: ${desde} al ${hasta} | Generado: ${currentDate}`;
      const filename = `Registro_Fiscalizacion_${desde}_${hasta}.pdf`;
      
      // Generar el PDF usando el método estructurado
      await generateStructuredPDFFromElement(
        'pdf-content',
        'Registro de Fiscalización',
        subtitle,
        filename
      );
      
      // Actualizar localStorage
      if (typeof window !== 'undefined') {
        const timestamp = new Date().toLocaleString();
        localStorage.setItem('lastReport:fiscalizacion', timestamp);
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
          <span role="img" aria-label="shield">🛡️</span>
          Registro de Fiscalización
        </h2>
        <p className="text-muted mb-0">
          Documentos al día: <strong>{apiData?.kpi?.documentos_al_dia_pct?.toFixed(1) || 0}%</strong> | 
          Con problemas: <strong>{apiData?.kpi?.vencidos_o_encargo_pct?.toFixed(1) || 0}%</strong>
        </p>
      </header>

      {/* Filtros */}
      <div className="card">
        <h5 className="card-header text-center" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>Filtros</h5>
        <form onSubmit={handleFilterSubmit} className="row g-3 align-items-end p-4">
          <div className="col-12 col-md-2">
            <label className="form-label">Agrupar por</label>
            <select
              className="form-control"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as Grupo)}
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
      <div className="card mt-4">
        <h5 className="card-header text-center" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>Resumen fiscalizaciones</h5>
        <div className="row p-4">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card text-center">
              <div className="card-body" style={{ backgroundColor: '#e6ffe6', border: '1px solid #b3ffb3' }}>
                <h3 className="card-title text-success" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>Al día</h3>
                <h3 className="display-6" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>{stats.alDia}</h3>
                <h4 className="text-muted" style={{ fontFamily: 'Roboto', fontWeight: 'normal' }}>{stats.pctAlDia.toFixed(1)}%</h4>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card text-center">
              <div className="card-body" style={{ backgroundColor: '#ffe6e6', border: '1px solid #ffb3b3' }}>
                <h3 className="card-title text-danger" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>Con problemas</h3>
                <h3 className="display-6" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>{stats.conProblemas}</h3>
                <h4 className="text-muted" style={{ fontFamily: 'Roboto', fontWeight: 'normal' }}>{stats.pctConProblemas.toFixed(1)}%</h4>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card text-center">
              <div className="card-body" style={{ backgroundColor: '#e6f0ff', border: '1px solid #b3d1ff' }}>
                <h3 className="card-title" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>Total</h3>
                <h3 className="display-6" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>{stats.conProblemas + stats.alDia}</h3>
                <h4 className="text-muted" style={{ fontFamily: 'Roboto', fontWeight: 'normal' }}>vehículos</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gráficos de estado de documentos - Primero */}
      <div className="col-12 mt-4">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Estado Permiso */}
          <div style={{ flex: '1 1 calc(20% - 0.75rem)', minWidth: '180px' }}>
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-light">
                <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                  <i className="bi bi-file-earmark-text" style={{ color: palette.success }}></i>
                  Estado Permiso (%)
                </h6>
              </div>
              <div className="card-body">
                <div style={{ height: CHART_HEIGHT.sm }}>
                  {documentStatusCharts.permiso.datasets[0].data.some((val: number) => val > 0) ? (
                    <Bar data={documentStatusCharts.permiso} options={statusBarOptions} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <span className="text-muted">Sin datos disponibles</span>
                    </div>
                  )}
                </div>
                {documentStatusCharts.permiso.datasets[0].data.some((val: number) => val > 0) && (
                  <div className="text-center mt-3">
                    <div className="d-inline-flex gap-3 flex-wrap" style={{ fontSize: '0.9rem' }}>
                      <span><strong>Total:</strong> {documentStatusCharts.permiso.datasets[0].data[0] + documentStatusCharts.permiso.datasets[0].data[1]}</span>
                      <span><strong>Vigente:</strong> {documentStatusCharts.permiso.datasets[0].data[0]}</span>
                      <span><strong>No vigente:</strong> {documentStatusCharts.permiso.datasets[0].data[1]}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Estado Revisión */}
          <div style={{ flex: '1 1 calc(20% - 0.75rem)', minWidth: '180px' }}>
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-light">
                <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                  <i className="bi bi-gear" style={{ color: palette.warning }}></i>
                  Estado Revisión (%)
                </h6>
              </div>
              <div className="card-body">
                <div style={{ height: CHART_HEIGHT.sm }}>
                  {documentStatusCharts.revision.datasets[0].data.some((val: number) => val > 0) ? (
                    <Bar data={documentStatusCharts.revision} options={statusBarOptions} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <span className="text-muted">Sin datos disponibles</span>
                    </div>
                  )}
                </div>
                {documentStatusCharts.revision.datasets[0].data.some((val: number) => val > 0) && (
                  <div className="text-center mt-3">
                    <div className="d-inline-flex gap-3 flex-wrap" style={{ fontSize: '0.9rem' }}>
                      <span><strong>Total:</strong> {documentStatusCharts.revision.datasets[0].data[0] + documentStatusCharts.revision.datasets[0].data[1]}</span>
                      <span><strong>Vigente:</strong> {documentStatusCharts.revision.datasets[0].data[0]}</span>
                      <span><strong>No vigente:</strong> {documentStatusCharts.revision.datasets[0].data[1]}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Estado SOAP */}
          <div style={{ flex: '1 1 calc(20% - 0.75rem)', minWidth: '180px' }}>
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-light">
                <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                  <i className="bi bi-shield-check" style={{ color: palette.info }}></i>
                  Estado SOAP (%)
                </h6>
              </div>
              <div className="card-body">
                <div style={{ height: CHART_HEIGHT.sm }}>
                  {documentStatusCharts.soap.datasets[0].data.some((val: number) => val > 0) ? (
                    <Bar data={documentStatusCharts.soap} options={statusBarOptions} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <span className="text-muted">Sin datos disponibles</span>
                    </div>
                  )}
                </div>
                {documentStatusCharts.soap.datasets[0].data.some((val: number) => val > 0) && (
                  <div className="text-center mt-3">
                    <div className="d-inline-flex gap-3 flex-wrap" style={{ fontSize: '0.9rem' }}>
                      <span><strong>Total:</strong> {documentStatusCharts.soap.datasets[0].data[0] + documentStatusCharts.soap.datasets[0].data[1]}</span>
                      <span><strong>Vigente:</strong> {documentStatusCharts.soap.datasets[0].data[0]}</span>
                      <span><strong>No vigente:</strong> {documentStatusCharts.soap.datasets[0].data[1]}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Estado Multas (%) */}
          <div style={{ flex: '1 1 calc(20% - 0.75rem)', minWidth: '180px' }}>
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-light">
                <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                    <i className="bi bi-receipt" style={{ color: palette.warning }}></i>
                  Estado Multas (%)
                </h6>
              </div>
              <div className="card-body">
                <div style={{ height: CHART_HEIGHT.sm }}>
                  {multasChartData.datasets[0].data.some((val: number) => val > 0) ? (
                    <Pie data={multasChartData} options={sharedPieOptions} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <span className="text-muted">Sin datos disponibles</span>
                    </div>
                  )}
                </div>
                {multasChartData.datasets[0].data.some((val: number) => val > 0) && (
                  <div className="text-center mt-3">
                    <div className="d-inline-flex gap-3 flex-wrap" style={{ fontSize: '0.9rem' }}>
                      <span><strong>Total:</strong> {multasChartData.datasets[0].data[0] + multasChartData.datasets[0].data[1]}</span>
                      <span><strong>Sin multas:</strong> {multasChartData.datasets[0].data[0]}</span>
                      <span><strong>Con multas:</strong> {multasChartData.datasets[0].data[1]}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Distribución Encargo/Robo */}
          <div style={{ flex: '1 1 calc(20% - 0.75rem)', minWidth: '180px' }}>
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-light">
                <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                  <i className="bi bi-pie-chart" style={{ color: palette.danger }}></i>
                  Distribución Encargo/Robo (%)
                </h6>
              </div>
              <div className="card-body">
                <div style={{ height: CHART_HEIGHT.sm }}>
                  {encargoChartData.datasets[0].data.some((val: number) => val > 0) ? (
                    <Pie data={encargoChartData} options={sharedPieOptions} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <span className="text-muted">Sin datos disponibles</span>
                    </div>
                  )}
                </div>
                {encargoChartData.datasets[0].data.some((val: number) => val > 0) && (
                  <div className="text-center mt-3">
                    <div className="d-inline-flex gap-3 flex-wrap" style={{ fontSize: '0.9rem' }}>
                      <span><strong>Total:</strong> {encargoChartData.datasets[0].data[0] + encargoChartData.datasets[0].data[1]}</span>
                      <span><strong>Sin encargo:</strong> {encargoChartData.datasets[0].data[0]}</span>
                      <span><strong>Con encargo:</strong> {encargoChartData.datasets[0].data[1]}</span>
                    </div>
                  </div>
                )}
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
            <div className="card-header bg-light">
              <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                <i className="bi bi-bar-chart-fill" style={{ color: palette.primary }}></i>
                Vehículos por condición (apilado)
              </h6>
            </div>
            <div className="card-body">
              <div style={{ height: CHART_HEIGHT.lg }}>
                {vehiculosChartData.datasets[0].data.length > 0 ? (
                  <Bar data={vehiculosChartData} options={stackedChartOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <span className="text-muted">Sin datos disponibles</span>
                  </div>
                )}
              </div>
              <div className="mt-2 text-center">
                <small className="text-muted">Cada barra muestra vehículos al día (verde) vs con problemas (rojo).</small>
              </div>
            </div>
          </div>

          <div className="card shadow-sm mb-3">
            <div className="card-header bg-light">
              <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                <i className="bi bi-graph-up" style={{ color: palette.primary }}></i>
                Fiscalizaciones por día (últimos 10 días)
              </h6>
            </div>
            <div className="card-body">
              <div style={{ height: CHART_HEIGHT.md }}>
                {fechaChartData.datasets[0].data.length > 0 ? (
                  <Line data={fechaChartData} options={buildLineOptions({ yTitle: 'Número de fiscalizaciones' })} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <span className="text-muted">Sin datos disponibles</span>
                  </div>
                )}
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
                      <th>Permiso</th>
                      <th>Revisión</th>
                      <th>SOAP</th>
                      <th>Encargo</th>
                      <th>Multas</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-5 text-muted">
                          {loading ? 'Cargando...' : 'Sin resultados'}
                        </td>
                      </tr>
                    )}

                    {currentRows.map((r, i) => {
                      const alDia = r.permiso === 'Vigente' && r.revision === 'Vigente' && r.soap === 'Vigente' && r.encargo === 'NO' && r.multas === 'NO';
                      return (
                        <tr key={`${r.ppu}-${i}`} className={alDia ? '' : 'table-warning'}>
                          <td><strong>{r.ppu}</strong></td>
                          <td>
                            <span className={`badge ${r.permiso === 'Vigente' ? 'bg-success' : 'bg-danger'}`} style={{ borderRadius: '0.5rem', color: 'white', fontWeight: '400', width: '75px', display: 'inline-block', textAlign: 'center' }}>
                              {r.permiso}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${r.revision === 'Vigente' ? 'bg-success' : 'bg-danger'}`} style={{ borderRadius: '0.5rem', color: 'white', fontWeight: '400', width: '75px', display: 'inline-block', textAlign: 'center' }}>
                              {r.revision}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${r.soap === 'Vigente' ? 'bg-success' : 'bg-danger'}`} style={{ borderRadius: '0.5rem', color: 'white', fontWeight: '400', width: '75px', display: 'inline-block', textAlign: 'center' }}>
                              {r.soap}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${r.encargo === 'NO' ? 'bg-success' : 'bg-danger'}`} style={{ borderRadius: '0.5rem', color: 'white', fontWeight: '400', width: '75px', display: 'inline-block', textAlign: 'center' }}>
                              {r.encargo}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${r.multas === 'NO' ? 'bg-success' : 'bg-danger'}`} style={{ borderRadius: '0.5rem', color: 'white', fontWeight: '400', width: '75px', display: 'inline-block', textAlign: 'center' }}>
                              {r.multas}
                            </span>
                          </td>
                          <td>{formatDateTime(r.fecha)}</td>
                        </tr>
                      );
                    })}
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
                  <span className="text-muted">de {tableData.length}</span>
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

// Opciones para gráficos de barras de estado
const statusBarOptions = buildBarOptions({ showLegend: false });

// Pie options vienen del tema como sharedPieOptions si se necesitan fuera

// Opciones para gráfico de línea vienen del tema (buildLineOptions)
