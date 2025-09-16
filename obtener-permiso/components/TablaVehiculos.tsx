import React, { useState } from 'react';

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

interface TablaVehiculosProps {
  vehicles: Vehiculo[];
  rut: string;
  onPagar: (plate: string, rut: string) => void;
}

export default function TablaVehiculos({ vehicles, rut, onPagar }: TablaVehiculosProps) {
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
    <>
      <div className="d-flex justify-content-center">
        <div className="table-responsive">
          <table className="table align-middle table-striped">
            <thead>
              <tr className="bg-primary text-white">
                <th className="fw-bold text-center">Placa</th>
                <th className="fw-bold text-center">Marca</th>
                <th className="fw-bold text-center">Estado Permiso</th>
                <th className="fw-bold text-center">Estado Vehículo</th>
                <th className="fw-bold text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    No se encontraron vehículos para este RUT.
                  </td>
                </tr>
              ) : (
                currentVehicles.map(v => (
                    <tr key={v.id}>
                    <td className="fw-bold text-dark align-middle" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {v.plate}
                    </td>
                    <td className="align-middle">
                      <p className="mb-0">
                      {v.brand}
                      </p>
                      <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                      {v.model}
                      </p>
                    </td>
                    <td className="align-middle"><EstadoTag estado={v.estado} /></td>
                    <td className="align-middle"><EstadoTag estado={v.estadoDocumentos} /></td>
                    <td className="text-center align-middle">
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
                      onClick={() => {
                        if (v.estado !== 'PAGADO') {
                        onPagar(v.plate, rut);
                        }
                      }}
                      >
                      →
                      </button>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>        
      </div>
      <div style={{ maxWidth: '75%', margin: '0 auto' }}>
        {/* Mostrar paginación solo si hay vehículos */}
        {vehicles.length > 0 && (
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
        )}
      </div>
    </>
  );
}