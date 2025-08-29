// app/ver-vehiculos/page.tsx
'use client';
import { useState } from 'react';

type Estado = 'PAGADO' | 'HABILITADO' | 'VENCIDO';
type Vehiculo = { id: number; plate: string; brand: string; model: string; estado: Estado };

function EstadoTag({ estado }: { estado: Estado }) {
  const cfg =
    estado === 'PAGADO'
      ? { cls: 'status--pagado', label: 'Pagado' }
      : estado === 'HABILITADO'
      ? { cls: 'status--habilitado', label: 'Habilitado para pagar' }
      : { cls: 'status--vencido', label: 'Vencido' };

  return (
    <span className={`status-chip ${cfg.cls}`}>
      <span className="status-dot" />
      {cfg.label}
    </span>
  );
}

export default function VerVehiculos() {
  // Mock para la UI (cámbialo luego por fetch a tu API)
  const vehicles: Vehiculo[] = [
    { id: 1, plate: 'AA BB 11', brand: 'Marca 1', model: 'Modelo 1', estado: 'PAGADO' },
    { id: 2, plate: 'AAA 111', brand: 'Marca 2', model: 'Modelo 2', estado: 'PAGADO' },
    { id: 3, plate: 'BB CC 22', brand: 'Marca 3', model: 'Modelo 3', estado: 'HABILITADO' },
    { id: 4, plate: 'CC DD 44', brand: 'Marca 4', model: 'Modelo 4', estado: 'HABILITADO' },
    { id: 5, plate: 'GG LL 55', brand: 'Marca 5', model: 'Modelo 5', estado: 'VENCIDO' },
  ];

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Cálculos para paginación
  const totalItems = vehicles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentVehicles = vehicles.slice(startIndex, endIndex);

  // Función para cambiar página
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Función para cambiar elementos por página
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Resetear a la primera página
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <section className="section card-like" style={{ fontFamily: '"Roboto", Arial, sans-serif' }}>
      <div className="section-header px-4 pt-4 pb-3 border-bottom border-primary">
        <h1 className="h4 m-0 text-center">Vehículos Disponibles</h1>
      </div>

      <div className="section-body p-4">
        <div className="d-flex justify-content-center">
          <div className="table-responsive" style={{ maxWidth: '75%' }}>
            <table className="table align-middle table-striped">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="fw-bold">Placa Patente Única</th>
                  <th className="fw-bold">Marca</th>
                  <th className="fw-bold">Modelo</th>
                  <th className="fw-bold">Estado Pago</th>
                  <th className="fw-bold text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {currentVehicles.map(v => (
                  <tr key={v.id}>
                    <td className="fw-bold text-dark" style={{ fontSize: '2.0rem', fontWeight: 'bold' }}>{v.plate}</td>
                    <td>{v.brand}</td>
                    <td>{v.model}</td>
                    <td><EstadoTag estado={v.estado} /></td>
                    <td className="text-center">
                      <button
                        type="button"
                        className={`btn btn-sm px-3 text-decoration-none ${
                          v.estado === 'PAGADO' 
                            ? 'btn-outline-secondary' 
                            : 'btn-primary'
                        }`}
                        disabled={v.estado === 'PAGADO'}
                        style={{ 
                          textDecoration: 'none',
                          ...(v.estado === 'PAGADO' && {
                            backgroundColor: '#7E8FA0',
                            borderColor: '#7E8FA0',
                            color: 'white'
                          })
                        }}
                      >
                        Pagar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pie de controles (formato visual del kit + Bootstrap) */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-3">
          <div className="d-flex align-items-center gap-2">
            <label className="form-label mb-0">Mostrar</label>
            <select 
              className="form-select form-select-sm" 
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              style={{ width: 80 }}
            >
              <option value={1}>1</option>
              <option value={3}>3</option>
              <option value={5}>5</option>
            </select>
            <span className="text-muted small ms-2">
              Mostrando {startIndex + 1} - {endIndex} de {totalItems}
            </span>
          </div>

          <nav aria-label="Paginación">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &laquo;
                </button>
              </li>
              {getPageNumbers().map(n => (
                <li key={n} className={`page-item ${n === currentPage ? 'active' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => handlePageChange(n)}
                  >
                    {n}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  &raquo;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
