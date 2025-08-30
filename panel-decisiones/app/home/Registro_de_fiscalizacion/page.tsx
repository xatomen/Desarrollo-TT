// app/Home/Registro_de_fiscalizacion/page.tsx
"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type Grupo = "DIA" | "MES" | "ANO";

type Row = {
  ppu: string;
  permiso: "Vigente" | "No Vigente";
  revision: "Vigente" | "No Vigente";
  soap: "Vigente" | "No Vigente";
  encargo: "SI" | "NO";
  fecha: string; // ISO yyyy-mm-dd
};

const MOCK_ROWS: Row[] = [
  { ppu: "BC1234", permiso: "Vigente", revision: "Vigente", soap: "Vigente", encargo: "NO", fecha: "2025-08-18" },
  { ppu: "DFG567", permiso: "No Vigente", revision: "No Vigente", soap: "No Vigente", encargo: "SI", fecha: "2025-08-19" },
  { ppu: "HJKL45", permiso: "No Vigente", revision: "Vigente", soap: "Vigente", encargo: "NO", fecha: "2025-08-20" },
  { ppu: "RST234", permiso: "Vigente", revision: "No Vigente", soap: "No Vigente", encargo: "NO", fecha: "2025-08-21" },
  { ppu: "HJK12",  permiso: "Vigente", revision: "Vigente", soap: "Vigente", encargo: "SI", fecha: "2025-08-22" },
  { ppu: "KLM789", permiso: "Vigente", revision: "Vigente", soap: "No Vigente", encargo: "NO", fecha: "2025-08-23" },
  { ppu: "PRQ456", permiso: "No Vigente", revision: "No Vigente", soap: "Vigente", encargo: "NO", fecha: "2025-08-24" },
  { ppu: "XYZ111", permiso: "Vigente", revision: "Vigente", soap: "Vigente", encargo: "NO", fecha: "2025-08-24" },
  { ppu: "XYZ222", permiso: "Vigente", revision: "No Vigente", soap: "Vigente", encargo: "NO", fecha: "2025-08-25" },
  { ppu: "XYZ333", permiso: "Vigente", revision: "Vigente", soap: "Vigente", encargo: "NO", fecha: "2025-08-26" },
];

const COLORS = ["#2e7d32", "#d32f2f"]; // ok / no ok

export default function FiscalizacionPage() {
  const [grupo, setGrupo] = useState<Grupo>("DIA");
  const [desde, setDesde] = useState<string>("");
  const [hasta, setHasta] = useState<string>("");
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);

  // Filtro por fechas
  const filtered = useMemo(() => {
    const d = desde ? new Date(desde) : null;
    const h = hasta ? new Date(hasta) : null;
    return MOCK_ROWS.filter((r) => {
      const f = new Date(r.fecha);
      if (d && f < d) return false;
      if (h && f > h) return false;
      return true;
    });
  }, [desde, hasta]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Datos: “Miles de vehículos fiscalizados” (mock por grupo)
  const barrasFiscalizados = useMemo(() => {
    // agrupa por día/mes/año contando filas
    const map = new Map<string, number>();
    filtered.forEach((r) => {
      const dt = new Date(r.fecha);
      let key = dt.toISOString().slice(0, 10); // día
      if (grupo === "MES") key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      if (grupo === "ANO") key = String(dt.getFullYear());
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([label, count]) => ({ label, fiscalizados: count * 10 })); // *10 => “miles”
  }, [filtered, grupo]);

  // Datos: “Vehículos (%)” por estado (permiso/revisión/SOAP vigentes vs no)
  const porcentajes = useMemo(() => {
    const total = filtered.length || 1;
    const okPermiso = filtered.filter((r) => r.permiso === "Vigente").length;
    const okRev = filtered.filter((r) => r.revision === "Vigente").length;
    const okSoap = filtered.filter((r) => r.soap === "Vigente").length;
    return [
      { name: "SOAP", ok: Math.round((okSoap / total) * 100), no: 100 - Math.round((okSoap / total) * 100) },
      { name: "Permiso", ok: Math.round((okPermiso / total) * 100), no: 100 - Math.round((okPermiso / total) * 100) },
      { name: "Revisión", ok: Math.round((okRev / total) * 100), no: 100 - Math.round((okRev / total) * 100) },
      { name: "Vencida", ok: 0, no: 0 }, // placeholder para mantener orden visual del mock
    ];
  }, [filtered]);

  // Pie: documentos al día vs vencidos o encargo
  const pieData = useMemo(() => {
    const total = filtered.length || 1;
    const alDia =
      filtered.filter(
        (r) => r.permiso === "Vigente" && r.revision === "Vigente" && r.soap === "Vigente" && r.encargo === "NO"
      ).length;
    const otros = total - alDia;
    return [
      { name: "Al día", value: Math.round((alDia / total) * 100) },
      { name: "Vencidos/Encargo", value: Math.round((otros / total) * 100) },
    ];
  }, [filtered]);

  const onExport = () => {
    // placeholder simple
    window.print();
  };

  // UI
  return (
    <div className="container py-4">
      {/* Filtros */}
      <div className="d-flex flex-wrap gap-3 align-items-end">
        <div>
          <small className="text-muted d-block">Agrupar por</small>
          <select
            className="form-select"
            style={{ width: 160 }}
            value={grupo}
            onChange={(e) => {
              setGrupo(e.target.value as Grupo);
            }}
          >
            <option value="DIA">DIA/MES/AÑO</option>
            <option value="MES">MES/AÑO</option>
            <option value="ANO">AÑO</option>
          </select>
        </div>

        <div>
          <small className="text-muted d-block">Desde</small>
          <input
            type="date"
            className="form-control"
            value={desde}
            onChange={(e) => {
              setPage(1);
              setDesde(e.target.value);
            }}
          />
        </div>

        <div>
          <small className="text-muted d-block">Hasta</small>
          <input
            type="date"
            className="form-control"
            value={hasta}
            onChange={(e) => {
              setPage(1);
              setHasta(e.target.value);
            }}
          />
        </div>

        <div className="ms-auto">
          <button className="btn btn-primary" onClick={onExport}>
            Generar Informe (PDF)
          </button>
        </div>
      </div>

      {/* Gráficos */}
      <div className="row g-4 mt-3">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Miles de vehículos fiscalizados</h6>
                <small className="text-muted">{grupo === "DIA" ? "mes/día/año/etc" : grupo === "MES" ? "mes/año" : "año"}</small>
              </div>
              <div style={{ height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={barrasFiscalizados}>
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="fiscalizados" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="mb-2">Vehículos (%)</h6>
              <div style={{ height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={porcentajes}>
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ok" name="Vigente" />
                    <Bar dataKey="no" name="No vigente" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Pie */}
        <div className="col-lg-5">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="mb-2">Documentos al día</h6>
              <div style={{ height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card mt-4">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>PPU</th>
                  <th>Permiso de Circulación</th>
                  <th>Revisión Técnica</th>
                  <th>SOAP</th>
                  <th>Encargo por Robo</th>
                </tr>
              </thead>
              <tbody>
                {current.map((r) => (
                  <tr key={r.ppu + r.fecha}>
                    <td>{r.ppu}</td>
                    <td className={r.permiso === "Vigente" ? "text-success" : "text-danger"}>{r.permiso}</td>
                    <td className={r.revision === "Vigente" ? "text-success" : "text-danger"}>{r.revision}</td>
                    <td className={r.soap === "Vigente" ? "text-success" : "text-danger"}>{r.soap}</td>
                    <td className={r.encargo === "NO" ? "text-success" : "text-danger"}>{r.encargo}</td>
                  </tr>
                ))}
                {current.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      Sin resultados para el rango seleccionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Controles de tabla */}
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <span>Mostrar</span>
              <select
                className="form-select form-select-sm"
                style={{ width: 70 }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[5, 10, 20].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-muted">
                Mostrando {current.length} de {filtered.length}
              </span>
            </div>

            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage(1)}>
                    «
                  </button>
                </li>
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    ‹
                  </button>
                </li>
                <li className="page-item disabled">
                  <span className="page-link">
                    {page} / {totalPages}
                  </span>
                </li>
                <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    ›
                  </button>
                </li>
                <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage(totalPages)}>
                    »
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
