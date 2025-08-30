// app/Home/Registro_de_obtencion_de_permisos/page.tsx
"use client";

import { useMemo, useState } from "react";

type Permiso = {
  ppu: string;
  rut: string;
  valor: number;
  fecha: string; // ISO YYYY-MM-DD
};

const MOCK: Permiso[] = [
  { ppu: "AB1234", rut: "13.345.678-9", valor: 65000, fecha: "2025-05-03" },
  { ppu: "FKTR32", rut: "13.456.789-5", valor: 120000, fecha: "2025-04-06" },
  { ppu: "HJKL45", rut: "16.235.468-2", valor: 90000,  fecha: "2025-05-07" },
  { ppu: "RST234", rut: "20.356.125-5", valor: 75000,  fecha: "2025-08-06" },
  { ppu: "XYZW12", rut: "14.852.963-1", valor: 83000,  fecha: "2025-09-05" },
  // agrega más filas según necesites
];

export default function RegistroObtencionPermisosPage() {
  // Filtros
  const [groupBy, setGroupBy] = useState<"day" | "month" | "year">("day");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // Paginación simple
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  // Datos filtrados por rango
  const dataFiltrada = useMemo(() => {
    const d = desde ? new Date(desde) : null;
    const h = hasta ? new Date(hasta) : null;
    return MOCK.filter((row) => {
      const f = new Date(row.fecha);
      if (d && f < d) return false;
      if (h && f > h) return false;
      return true;
    });
  }, [desde, hasta]);

  // KPIs
  const totalPermisos = dataFiltrada.length;
  const recaudacion = dataFiltrada.reduce((s, r) => s + r.valor, 0);
  const valorPromedio = totalPermisos ? recaudacion / totalPermisos : 0;

  // Paginación
  const totalPages = Math.max(1, Math.ceil(dataFiltrada.length / perPage));
  const rows = dataFiltrada.slice((page - 1) * perPage, page * perPage);

  // Datos para “mini gráfico” (por mes)
  const barras = useMemo(() => {
    // Contar por mes (1..12)
    const counts = new Array(12).fill(0);
    dataFiltrada.forEach((r) => {
      const m = new Date(r.fecha).getMonth(); // 0..11
      counts[m] += 1;
    });
    const max = Math.max(1, ...counts);
    return { counts, max };
  }, [dataFiltrada]);

  const descargarPDF = () => {
    // Hookea tu generador real aquí
    alert("Generar Informe (PDF) — conéctalo a tu backend cuando esté listo.");
  };

  return (
    <div className="container my-4">
      {/* Filtros */}
      <div className="row g-3 align-items-end">
        <div className="col-12 col-md-3">
          <label className="form-label small text-muted">Agrupar por</label>
          <select
            className="form-control"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as any)}
          >
            <option value="day">DÍA/MES/AÑO</option>
            <option value="month">MES/AÑO</option>
            <option value="year">AÑO</option>
          </select>
        </div>

        <div className="col-12 col-md-3">
          <label className="form-label small text-muted">Seleccione un período</label>
          <input
            type="date"
            className="form-control"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            placeholder="DD/MM/AAAA"
          />
          <small className="text-muted">Desde</small>
        </div>

        <div className="col-12 col-md-3">
          <label className="form-label invisible d-block">.</label>
          <input
            type="date"
            className="form-control"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            placeholder="DD/MM/AAAA"
          />
          <small className="text-muted">Hasta</small>
        </div>

        <div className="col-12 col-md-3 d-flex gap-2 justify-content-md-end">
          <button onClick={descargarPDF} className="btn btn-primary mt-1">
            <i className="cl cl-download me-2" /> Generar Informe (PDF)
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="row g-3 mt-3">
        <div className="col-12 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Total Permisos Emitidos</div>
              <div className="display-6 fw-bold">{totalPermisos}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Recaudación Total (CLP)</div>
              <div className="display-6 fw-bold">
                {recaudacion.toLocaleString("es-CL")}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-muted small">Valor Promedio (CLP)</div>
              <div className="display-6 fw-bold">
                {valorPromedio.toLocaleString("es-CL", {
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
            <div className="card-body">
              <div className="text-muted small mb-2">Permisos por mes</div>
              <MiniBarChart counts={barras.counts} max={barras.max} />
              <div className="text-center text-muted small mt-2">
                mes/día/año/etc
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th className="text-uppercase small text-muted">PPU</th>
                      <th className="text-uppercase small text-muted">RUT Propietario</th>
                      <th className="text-uppercase small text-muted">Valor (CLP)</th>
                      <th className="text-uppercase small text-muted">Fecha Emisión</th>
                      <th className="text-uppercase small text-muted text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={`${r.ppu}-${r.fecha}`}>
                        <td>{r.ppu}</td>
                        <td>{r.rut}</td>
                        <td>{r.valor.toLocaleString("es-CL")}</td>
                        <td>
                          {new Date(r.fecha).toLocaleDateString("es-CL", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-primary">
                            <i className="cl cl-eye" /> Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!rows.length && (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">
                          Sin resultados para el período seleccionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer tabla: paginación + tamaño página */}
              <div className="d-flex align-items-center justify-content-between px-3 py-2 border-top">
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">Mostrar</small>
                  <select
                    className="form-control form-control-sm"
                    style={{ width: 70 }}
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    {[5, 10, 20].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="d-flex align-items-center gap-1">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    ‹
                  </button>
                  <span className="small mx-2">
                    {page} / {totalPages}
                  </span>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>      
    </div>
  );
}

/**
 * Mini gráfico de barras con SVG (sin dependencias).
 * counts: cantidad por mes (12 valores)
 * max: valor máximo para escalar alturas
 */
function MiniBarChart({ counts, max }: { counts: number[]; max: number }) {
  // dimensiones
  const W = 320;
  const H = 160;
  const padding = { t: 10, r: 10, b: 20, l: 30 };

  const innerW = W - padding.l - padding.r;
  const innerH = H - padding.t - padding.b;

  const barW = innerW / counts.length - 4;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Barras por mes">
      {/* eje Y */}
      <line
        x1={padding.l}
        y1={padding.t}
        x2={padding.l}
        y2={padding.t + innerH}
        stroke="#e9ecef"
      />
      {/* eje X */}
      <line
        x1={padding.l}
        y1={padding.t + innerH}
        x2={padding.l + innerW}
        y2={padding.t + innerH}
        stroke="#e9ecef"
      />

      {counts.map((v, i) => {
        const h = max ? (v / max) * innerH : 0;
        const x = padding.l + i * (innerW / counts.length) + 2;
        const y = padding.t + innerH - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} fill="#0d6efd" opacity={0.85} rx={3} />
          </g>
        );
      })}
    </svg>
  );
}
