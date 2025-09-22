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
          backgroundColor: '#198754',
          borderColor: '#198754',
          borderWidth: 1,
          stack: 'stack1',
        },
        {
          label: 'Con problemas',
          data: recentData.map(item => item.con_problemas),
          backgroundColor: '#dc3545',
          borderColor: '#dc3545',
          borderWidth: 1,
          stack: 'stack1',
        },
      ],
    };
  }, [chartData, groupBy]);

  // Datos para Chart.js - Miles fiscalizados
  const milesChartData = useMemo(() => {
    const periodsToShow = groupBy === "AÑO" ? 3 : groupBy === "MES" ? 6 : 7;
    const recentData = chartData.miles.slice(-periodsToShow);

    return {
      labels: recentData.map(item => formatDateLabel(item.periodo, groupBy)),
      datasets: [
        {
          label: 'Vehículos fiscalizados',
          data: recentData.map(item => item.miles), // Ya son unidades individuales, no miles
          backgroundColor: '#0d6efd',
          borderColor: '#0d6efd',
          borderWidth: 1,
        },
      ],
    };
  }, [chartData, groupBy]);

  // Datos para gráficos de estado de documentos (Permiso, Revisión, SOAP)
  const documentStatusCharts = useMemo(() => {
    const permisoCount = { vigente: 0, noVigente: 0 };
    const revisionCount = { vigente: 0, noVigente: 0 };
    const soapCount = { vigente: 0, noVigente: 0 };

    tableData.forEach(row => {
      // Permiso
      if (row.permiso === "Vigente") permisoCount.vigente++;
      else permisoCount.noVigente++;
      
      // Revisión
      if (row.revision === "Vigente") revisionCount.vigente++;
      else revisionCount.noVigente++;
      
      // SOAP
      if (row.soap === "Vigente") soapCount.vigente++;
      else soapCount.noVigente++;
    });

    return {
      permiso: {
        labels: ['Vigente', 'No Vigente'],
        datasets: [{
          data: [permisoCount.vigente, permisoCount.noVigente],
          backgroundColor: ['#198754', '#dc3545'],
          borderColor: ['#198754', '#dc3545'],
          borderWidth: 1,
        }],
      },
      revision: {
        labels: ['Vigente', 'No Vigente'],
        datasets: [{
          data: [revisionCount.vigente, revisionCount.noVigente],
          backgroundColor: ['#198754', '#dc3545'],
          borderColor: ['#198754', '#dc3545'],
          borderWidth: 1,
        }],
      },
      soap: {
        labels: ['Vigente', 'No Vigente'],
        datasets: [{
          data: [soapCount.vigente, soapCount.noVigente],
          backgroundColor: ['#198754', '#dc3545'],
          borderColor: ['#198754', '#dc3545'],
          borderWidth: 1,
        }],
      },
    };
  }, [tableData]);

  // Datos para gráfico de pastel de Encargo
  const encargoChartData = useMemo(() => {
    const encargoCount = { si: 0, no: 0 };
    
    tableData.forEach(row => {
      if (row.encargo === "SI") encargoCount.si++;
      else encargoCount.no++;
    });

    return {
      labels: ['Sin Encargo', 'Con Encargo'],
      datasets: [{
        data: [encargoCount.no, encargoCount.si],
        backgroundColor: ['#198754', '#dc3545'],
        borderColor: ['#ffffff'],
        borderWidth: 2,
      }],
    };
  }, [tableData]);

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
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
      }],
    };
  }, [tableData]);

  // Opciones para gráfico apilado
  const stackedChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#ddd',
        borderWidth: 1,
        callbacks: {
          afterLabel: function(context: any) {
            const dataIndex = context.dataIndex;
            const datasets = context.chart.data.datasets;
            
            // Calcular el total correctamente para este período específico
            let total = 0;
            datasets.forEach((dataset: any) => {
              if (dataset.data[dataIndex] !== undefined && dataset.data[dataIndex] !== null) {
                total += dataset.data[dataIndex];
              }
            });
            
            // Obtener el valor real del dataset actual
            const currentValue = context.dataset.data[dataIndex];
            const percentage = total > 0 ? ((currentValue / total) * 100).toFixed(1) : 0;
            return `${percentage}% del total de este período`;
          },
          footer: function(context: any) {
            if (context.length === 0) return '';
            
            const dataIndex = context[0].dataIndex;
            const datasets = context[0].chart.data.datasets;
            
            // Calcular el total correctamente para este período
            let total = 0;
            datasets.forEach((dataset: any) => {
              if (dataset.data[dataIndex] !== undefined && dataset.data[dataIndex] !== null) {
                total += dataset.data[dataIndex];
              }
            });
            
            return `Total: ${total} vehículos`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
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
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            return Number.isInteger(value) ? value : '';
          },
          font: {
            size: 11,
          },
        },
        grid: {
          color: '#e9ecef',
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 0,
        borderSkipped: false,
      },
    },
  };

  // Opciones para gráfico simple
  const simpleChartOptions = {
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
            return `Vehículos fiscalizados: ${context.parsed.y.toLocaleString('es-CL')}`;
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
          text: 'Vehículos fiscalizados (unidades)',
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
    <div className="my-4">
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
                <h3 className="display-6" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>{tableData.length}</h3>
                <h4 className="text-muted" style={{ fontFamily: 'Roboto', fontWeight: 'normal' }}>vehículos</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="row mt-4">

        {/* Gráficos con Chart.js */}
        <div className="col-12 col-lg-6 mt-4 mt-lg-0">
          <div className="card shadow-sm mb-3">
            <div className="card-header bg-light">
              <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                <i className="bi bi-bar-chart-fill text-primary"></i>
                Vehículos por condición (apilado)
              </h6>
            </div>
            <div className="card-body">
              <div style={{ height: '250px' }}> {/* Altura un poco mayor para la leyenda */}
                {vehiculosChartData.datasets[0].data.length > 0 ? (
                  <Bar data={vehiculosChartData} options={stackedChartOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <span className="text-muted">Sin datos disponibles</span>
                  </div>
                )}
              </div>
              {/* Información adicional */}
              <div className="mt-2 text-center">
                <small className="text-muted">
                  Cada barra muestra la composición de vehículos al día (verde) vs con problemas (rojo) por período
                </small>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                <i className="bi bi-speedometer2 text-info"></i>
                Vehículos fiscalizados (unidades)
              </h6>
            </div>
            <div className="card-body">
              <div style={{ height: '200px' }}>
                {milesChartData.datasets[0].data.length > 0 ? (
                  <Bar data={milesChartData} options={simpleChartOptions} />
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
                      <th>PPU</th>
                      <th>Permiso</th>
                      <th>Revisión</th>
                      <th>SOAP</th>
                      <th>Encargo</th>
                      <th>Fecha</th>
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

                    {currentRows.map((r, i) => {
                      const alDia = r.permiso === "Vigente" && 
                                   r.revision === "Vigente" && 
                                   r.soap === "Vigente" && 
                                   r.encargo === "NO";
                      
                      return (
                        <tr key={`${r.ppu}-${i}`} className={alDia ? "" : "table-warning"}>
                          <td><strong>{r.ppu}</strong></td>
                          <td>
                            <span className={`badge ${r.permiso === "Vigente" ? "bg-success" : "bg-danger"}`} style={{ borderRadius: '0.5rem', color: 'white', fontWeight: '400', width: '75px', display: 'inline-block', textAlign: 'center' }}>
                              {r.permiso}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${r.revision === "Vigente" ? "bg-success" : "bg-danger"}`} style={{ borderRadius: '0.5rem', color: 'white', fontWeight: '400', width: '75px', display: 'inline-block', textAlign: 'center' }}>
                              {r.revision}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${r.soap === "Vigente" ? "bg-success" : "bg-danger"}`} style={{ borderRadius: '0.5rem', color: 'white', fontWeight: '400', width: '75px', display: 'inline-block', textAlign: 'center' }}>
                              {r.soap}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${r.encargo === "NO" ? "bg-success" : "bg-danger"}`} style={{ borderRadius: '0.5rem', color: 'white', fontWeight: '400', width: '75px', display: 'inline-block', textAlign: 'center' }}>
                              {r.encargo}
                            </span>
                          </td>
                          <td>{formatDateTime(r.fecha)}</td>
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

      </div>

      {/* Gráficos adicionales de análisis */}
      <div className="col-12 mt-4">
        <div className="row">
          {/* Gráficos de estado de documentos */}
          <div className="col-12 col-md-4">
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-light">
                <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                  <i className="bi bi-file-earmark-text text-success"></i>
                  Estado Permiso
                </h6>
              </div>
              <div className="card-body">
                <div style={{ height: '200px' }}>
                  {documentStatusCharts.permiso.datasets[0].data.some((val: number) => val > 0) ? (
                    <Bar data={documentStatusCharts.permiso} options={statusBarOptions} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <span className="text-muted">Sin datos disponibles</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-light">
                <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                  <i className="bi bi-gear text-warning"></i>
                  Estado Revisión
                </h6>
              </div>
              <div className="card-body">
                <div style={{ height: '200px' }}>
                  {documentStatusCharts.revision.datasets[0].data.some((val: number) => val > 0) ? (
                    <Bar data={documentStatusCharts.revision} options={statusBarOptions} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <span className="text-muted">Sin datos disponibles</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-light">
                <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                  <i className="bi bi-shield-check text-info"></i>
                  Estado SOAP
                </h6>
              </div>
              <div className="card-body">
                <div style={{ height: '200px' }}>
                  {documentStatusCharts.soap.datasets[0].data.some((val: number) => val > 0) ? (
                    <Bar data={documentStatusCharts.soap} options={statusBarOptions} />
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

        <div className="row">
          {/* Gráfico de pastel para Encargo */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-light">
                <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                  <i className="bi bi-pie-chart text-danger"></i>
                  Distribución Encargo/Robo
                </h6>
              </div>
              <div className="card-body">
                <div style={{ height: '250px' }}>
                  {encargoChartData.datasets[0].data.some((val: number) => val > 0) ? (
                    <Pie data={encargoChartData} options={pieOptions} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <span className="text-muted">Sin datos disponibles</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de línea por fecha */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm mb-3">
              <div className="card-header bg-light">
                <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>
                  <i className="bi bi-graph-up text-primary"></i>
                  Fiscalizaciones por día (últimos 10 días)
                </h6>
              </div>
              <div className="card-body">
                <div style={{ height: '250px' }}>
                  {fechaChartData.datasets[0].data.length > 0 ? (
                    <Line data={fechaChartData} options={lineOptions} />
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
const statusBarOptions = {
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
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((context.parsed.y / total) * 100).toFixed(1);
          return `${context.parsed.y} (${percentage}%)`;
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
          return Number.isInteger(value) ? value : '';
        },
        font: {
          size: 11,
        },
      },
      grid: {
        color: '#e9ecef',
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
      },
    },
  },
  elements: {
    bar: {
      borderRadius: 4,
    },
  },
};

// Opciones para gráfico de pastel
const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        boxWidth: 12,
        padding: 15,
        font: {
          size: 11,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: '#ddd',
      borderWidth: 1,
      callbacks: {
        label: function(context: any) {
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((context.parsed / total) * 100).toFixed(1);
          return `${context.label}: ${context.parsed} (${percentage}%)`;
        },
      },
    },
  },
};

// Opciones para gráfico de línea
const lineOptions = {
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
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        callback: function(value: any) {
          return Number.isInteger(value) ? value : '';
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
        text: 'Número de fiscalizaciones',
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
    point: {
      radius: 4,
      hoverRadius: 6,
    },
  },
};
