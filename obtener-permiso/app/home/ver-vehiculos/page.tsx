// app/ver-vehiculos/page.tsx
'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useAuth, getRutFromCookies } from '@/contexts/AuthContext';
import API_CONFIG from '@/config/api';

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

  const { user, isAuthenticated, isLoading } = useAuth();
  
  // ✅ También puedes acceder directamente desde cookies
  const rutFromCookies = getRutFromCookies();
  
  console.log('Datos del usuario:', user);
  console.log('RUT:', user?.rut);
  console.log('Nombre:', user?.nombre);
  console.log('Email:', user?.email);

  // Usar cualquiera de los dos
  const rut = user?.rut || rutFromCookies || '';

  const [vehicles, setVehicles] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Obtener vehículos por rut
  const fetchVehiclesByRut = async (rut: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_CONFIG.BACKEND}vehiculos_rut/${rut}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Datos de la API:', data);
      
      // Verificar si data es un array
      if (!Array.isArray(data)) {
        throw new Error('La respuesta de la API no es un array');
      }
      
      return data;
    } catch (error) {
      // console.error('Error al obtener vehículos:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Mapear datos de la API al tipo Vehiculo
  const mapApiToVehiculo = (apiData: any, index: number): Vehiculo => ({
    id: index + 1, // Usar índice como ID único
    plate: apiData.ppu || 'N/A',
    brand: apiData.marca || 'N/A',
    model: apiData.modelo || 'N/A',
    estado:
      apiData.estado === 'vigente'
        ? 'PAGADO'
        : apiData.estado === 'habilitado'
        ? 'HABILITADO'
        : 'VENCIDO',
  });

  // useEffect para obtener vehículos al montar el componente
  useEffect(() => {
    if (!isLoading && isAuthenticated && rut) {
      const loadVehicles = async () => {
        const data = await fetchVehiclesByRut(rut);
        if (data && data.length > 0) {
          const mappedVehicles = data.map(mapApiToVehiculo);
          setVehicles(mappedVehicles);
        }
      };

      loadVehicles();
    }
  }, [rut, isAuthenticated, isLoading]); // ✅ Agregar dependencias correctas

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

  // Mostrar loading
  if (loading) {
    return (
      <section className="section card-like" style={{ fontFamily: '"Roboto", Arial, sans-serif' }}>
        <div className="section-header px-4 pt-4 pb-3 border-bottom border-primary">
          <h1 className="h4 m-0 text-center">Vehículos Disponibles</h1>
        </div>
        <div className="section-body p-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando vehículos...</p>
        </div>
      </section>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <section className="section card-like" style={{ fontFamily: '"Roboto", Arial, sans-serif' }}>
        <div className="section-header px-4 pt-4 pb-3 border-bottom border-primary">
          <h1 className="h4 m-0 text-center">Vehículos Disponibles</h1>
        </div>
        <div className="section-body p-4">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error</h4>
            <p>{error}</p>
            <button 
              className="btn btn-outline-danger"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <ProtectedRoute>
    <section className="section card-like shadow" style={{ fontFamily: '"Roboto", Arial, sans-serif', minHeight: 'max-content' }}>
      <div className="section-header px-4 pt-4 pb-3">
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
                {vehicles.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-muted">
                  No se encontraron vehículos para este RUT.
                </td>
              </tr>
                ) : (
              currentVehicles.map(v => (
                <tr key={v.id}>
                  <td className="fw-bold text-dark" style={{ fontSize: '2.0rem', fontWeight: 'bold' }}>
                {v.plate}
                  </td>
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
                  onClick={() => {
                  if (v.estado !== 'PAGADO') {
                    // Cargar PPU en storage y redirigir
                    sessionStorage.setItem('ppu', v.plate);
                    sessionStorage.setItem('rut', rut);
                    window.location.href = `/home/validaciones-pago`;
                  }
                  }}
                >
                  Pagar
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
        
      </div>
    </section>
    </ProtectedRoute>
  );
}
