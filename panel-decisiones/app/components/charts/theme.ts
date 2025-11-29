// app/components/charts/theme.ts
// Paleta y utilidades para unificar estilo de gráficos
import {
  Chart as ChartJS,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

export const palette = {
  primary: '#0d6efd', // azul
  success: '#198754', // verde
  danger:  '#dc3545', // rojo
  warning: '#ffc107',
  info:    '#0dcaf0',
  neutral: {
    50:  '#f8f9fa',
    100: '#f1f3f5',
    200: '#e9ecef',
    300: '#dee2e6',
    600: '#6c757d',
    800: '#343a40',
  },
};

export const CHART_HEIGHT = {
  sm: 220,
  md: 260,
  lg: 300,
};

// Aplicar defaults globales de Chart.js para un look consistente
export function applyChartTheme() {
  // Evitar reconfigurar múltiples veces
  // @ts-ignore
  if ((ChartJS as any)._ttThemeApplied) return;

  ChartJS.register(Filler, Tooltip, Legend);

  ChartJS.defaults.color = palette.neutral[800];
  ChartJS.defaults.borderColor = palette.neutral[200];
  ChartJS.defaults.font.family = "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";
  ChartJS.defaults.font.size = 12;
  ChartJS.defaults.plugins.legend.labels.boxWidth = 12;
  ChartJS.defaults.plugins.legend.labels.padding = 12;
  ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(0,0,0,0.85)';
  ChartJS.defaults.plugins.tooltip.borderColor = '#ddd';
  ChartJS.defaults.plugins.tooltip.borderWidth = 1;

  // @ts-ignore
  (ChartJS as any)._ttThemeApplied = true;
}

// Construir opciones base para barras
export function buildBarOptions({
  stacked = false,
  yTitle,
  showLegend = true,
}: { stacked?: boolean; yTitle?: string; showLegend?: boolean } = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: showLegend, position: 'bottom' as const },
    },
    interaction: { mode: 'index' as const, intersect: false },
    scales: {
      x: {
        stacked,
        grid: { display: false },
        ticks: { maxRotation: 45 },
      },
      y: {
        stacked,
        beginAtZero: true,
        grid: { color: palette.neutral[200] },
        ticks: {
          stepSize: 1,
          callback: (v: any) => (Number.isInteger(v) ? v : ''),
        },
        title: yTitle ? { display: true, text: yTitle } : undefined,
      },
    },
    elements: { bar: { borderRadius: 6, borderSkipped: false } },
  } as const;
}

export function buildLineOptions({ yTitle }:{ yTitle?: string } = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 45 } },
      y: {
        beginAtZero: true,
        grid: { color: palette.neutral[200] },
        ticks: { stepSize: 1, callback: (v: any) => (Number.isInteger(v) ? v : '') },
        title: yTitle ? { display: true, text: yTitle } : undefined,
      },
    },
    elements: { point: { radius: 4, hoverRadius: 6 } },
  } as const;
}

export const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { boxWidth: 12, padding: 12 },
    },
  },
} as const;
