"use client";

import { useMemo, useState } from "react";

type Consulta = {
  rut: string;
  ppu: string;
  fechaHora: string; // ISO
};

type GroupBy = "DIA" | "MES" | "ANO";

const MOCK: Consulta[] = [
  { rut: "12.345.678-9", ppu: "FKTR32", fechaHora: "2025-03-05T09:12:00" },
  { rut: "10.234.567-8", ppu: "HDPL88", fechaHora: "2025-04-07T13:45:00" },
  { rut: "12.345.679-9", ppu: "AB1234", fechaHora: "2025-05-08T10:30:00" },
  { rut: "18.987.654-3", ppu: "KJTL22", fechaHora: "2025-06-09T15:10:00" },
  { rut: "10.123.456-7", ppu: "XYZW12", fechaHora: "2025-07-10T08:01:00" },
  
];

export default function RegistroConsultasPropietariosPage() {
  // Filtros
  const [groupBy, setGroupBy] = useState<GroupBy>("DIA");
  const [desde, setDesde] = useState<string>("");
  const [hasta, setHasta] = useState<string>("");

  // Tabla y paginación
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  // Datos filtrados
  const filtrados = useMemo(() => {
    const d = desde ? new Date(desde) : null;
    const h = hasta ? new Date(hasta) : null;

    return MOCK.filter((row) => {
      const fh = new Date(row.fechaHora);
      if (d && fh < d) return false;
      if (h && fh > endOfDay(h)) return false;
      return true;
    });
  }, [desde, hasta]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtrados.length / perPage));
  const startIdx = (page - 1) * perPage;
  const currentRows = filtrados.slice(startIdx, startIdx + perPage);

  // Series para minigráficos (simple: cuenta por día de la semana)
  const weeklyCounts = useMemo(() => {
    const base = ["L", "M", "Mi", "J", "V", "S", "D"].map((k) => ({ label: k, v: 0 }));
    filtrados.forEach((r) => {
      const dow = new Date(r.fechaHora).getDay(); // 0=domingo
      const idx = dow === 0 ? 6 : dow - 1;
      base[idx].v++;
    });
    return base;
  }, [filtrados]);

  const uniqueUsersWeekly = useMemo(() => {
    // “usuarios únicos” por día (por RUT)
    const map: Record<number, Set<string>> = {
      0: new Set(), 1: new Set(), 2: new Set(), 3: new Set(),
      4: new Set(), 5: new Set(), 6: new Set(),
    };
    filtrados.forEach((r) => {
      const dow = new Date(r.fechaHora).getDay(); // 0=domingo
      const idx = dow === 0 ? 6 : dow - 1;
      map[idx].add(r.rut);
    });
    const labels = ["L", "M", "Mi", "J", "V", "S", "D"];
    return labels.map((label, i) => ({ label, v: map[i].size }));
  }, [filtrados]);

  function handleGeneratePDF() {
    // placeholder
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
          Filtros, tabla paginada y métricas semanales de ejemplo.
        </p>
      </header>

      {/* Filtros */}
      <div className="row g-3 align-items-end">
        <div className="col-12 col-md-3">
          <label className="form-label">Agrupar por</label>
          <select
            className="form-select"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
          >
            <option value="DIA">DIA/MES/AÑO</option>
            <option value="MES">MES/AÑO</option>
            <option value="ANO">AÑO</option>
          </select>
        </div>

        <div className="col-6 col-md-3">
          <label className="form-label">Desde</label>
          <input
            className="form-control"
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </div>

        <div className="col-6 col-md-3">
          <label className="form-label">Hasta</label>
          <input
            className="form-control"
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-3 d-grid">
          <button className="btn btn-primary" onClick={handleGeneratePDF}>
            Generar Informe (PDF)
          </button>
        </div>
      </div>

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
                      <th>Rut Propietario</th>
                      <th>PPU Consultada</th>
                      <th>Fecha/Hora de Consulta</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-5 text-muted">
                          Sin resultados
                        </td>
                      </tr>
                    )}

                    {currentRows.map((r, i) => (
                      <tr key={`${r.rut}-${i}`}>
                        <td>{r.rut}</td>
                        <td>{r.ppu}</td>
                        <td>{formatDateTime(r.fechaHora)}</td>
                        <td className="text-center">
                          <button className="btn btn-sm btn-outline-secondary">
                            <i className="bi bi-eye" /> Ver
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
                    {[5, 10, 15, 20].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <span className="text-muted">
                    de {filtrados.length}
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

        {/* Gráficos (SVG, sin librerías) */}
        <div className="col-12 col-lg-5 mt-4 mt-lg-0">
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h6 className="mb-3">Cantidad de Consultas — Esta semana</h6>
              <MiniBars data={weeklyCounts} height={140} />
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">Usuarios únicos que consultan — Esta semana</h6>
              <MiniBars data={uniqueUsersWeekly} height={140} />
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
  const max = Math.max(1, ...data.map((d) => d.v));
  const barW = 28;
  const gap = 16;
  const width = data.length * barW + (data.length - 1) * gap;
  const padBottom = 22;
  const padTop = 10;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="barras">
      {/* líneas guía */}
      {[0.25, 0.5, 0.75, 1].map((p) => {
        const y = padTop + (height - padTop - padBottom) * (1 - p);
        return <line key={p} x1={0} y1={y} x2={width} y2={y} stroke="#eee" />;
      })}

      {data.map((d, i) => {
        const x = i * (barW + gap);
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
            <text x={x + barW / 2} y={height - 6} textAnchor="middle" fontSize="11" fill="#6c757d">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ===== util ===== */
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
