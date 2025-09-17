// app/ver-vehiculos/page.tsx
'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useAuth, getRutFromCookies } from '@/contexts/AuthContext';
import API_CONFIG from '@/config/api';
import React from 'react';

type Estado = 'PAGADO' | 'HABILITADO' | 'VENCIDO';
type Vehiculo = { 
  id: number; 
  plate: string; 
  brand: string; 
  model: string; 
  estado: Estado;
  estadoVehiculo?: EstadoVehiculoDetalle;
};

type EstadoVehiculoDetalle = {
  estadoGeneral: string;
  revision: string;
  soap: string;
  multas: string;
  permiso: string;
  encargo: string;
  rpi: string;
  fechaVencimientoPermiso?: string; // <-- Agrega este campo
};

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

function EstadoVehiculoTag({ estado }: { estado: string }) {
  const cfg =
    estado === 'Al día'
      ? { cls: 'status--pagado', label: 'Al día' }
      : { cls: 'status--vencido', label: 'No vigente' };

  return (
    <span className={`status-chip ${cfg.cls}`}>
      <span className="status-dot" />
      {cfg.label}
    </span>
  );
}

// Tooltip personalizado para mostrar detalles del estado del vehículo
function EstadoVehiculoTooltip({ detalle }: { detalle: EstadoVehiculoDetalle }) {
  const getStatusColor = (status: string) => {
    // Estados que se consideran "buenos" (verde)
    const goodStatuses = [
      'Vigente',
      'No posee multas', 
      'Primera obtención',
      'No tiene encargo por robo',
      'Sin multas'
    ];
    
    return goodStatuses.includes(status) ? '#28a745' : '#dc3545'; // Verde o rojo
  };

  return (
    <div
      className="custom-tooltip"
      style={{
        minWidth: 260,
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        padding: 12,
        fontSize: '0.95em',
        zIndex: 9999,
      }}
    >
      <b className="text-center">Detalle del Estado del Vehículo</b>
      <hr className="my-2" />
      <ul className="list-unstyled mb-0 mt-2">
        <li>
          <b>Revisión Técnica:</b>{' '}
          <span 
            className="badge rounded-pill"
            style={{ 
              backgroundColor: getStatusColor(detalle.revision),
              color: 'white',
              fontSize: '0.8em'
            }}
          >
            {detalle.revision}
          </span>
        </li>
        <li>
          <b>SOAP:</b>{' '}
          <span 
            className="badge rounded-pill"
            style={{ 
              backgroundColor: getStatusColor(detalle.soap),
              color: 'white',
              fontSize: '0.8em'
            }}
          >
            {detalle.soap}
          </span>
        </li>
        <li>
          <b>Multas:</b>{' '}
          <span 
            className="badge rounded-pill"
            style={{ 
              backgroundColor: getStatusColor(detalle.multas),
              color: 'white',
              fontSize: '0.8em'
            }}
          >
            {detalle.multas}
          </span>
        </li>
        <li>
          <b>Permiso de Circulación:</b>{' '}
          <span 
            className="badge rounded-pill"
            style={{ 
              backgroundColor: getStatusColor(detalle.permiso),
              color: 'white',
              fontSize: '0.8em'
            }}
          >
            {detalle.permiso}
          </span>
        </li>
        <li>
          <b>Encargo por Robo:</b>{' '}
          <span 
            className="badge rounded-pill"
            style={{ 
              backgroundColor: getStatusColor(detalle.encargo),
              color: 'white',
              fontSize: '0.8em'
            }}
          >
            {detalle.encargo}
          </span>
        </li>
        <li>
          <b>Estado en RPI:</b>{' '}
          <span 
            className="badge rounded-pill"
            style={{ 
              backgroundColor: getStatusColor(detalle.rpi),
              color: 'white',
              fontSize: '0.8em'
            }}
          >
            {detalle.rpi}
          </span>
        </li>
      </ul>
    </div>
  );
}

export default function VerVehiculos() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const rutFromCookies = getRutFromCookies();
  const rut = user?.rut || rutFromCookies || '';
  const nombre = user?.nombre || 'Usuario';

  // TODOS LOS HOOKS VAN AQUÍ, ANTES DE CUALQUIER RETURN
  const [vehicles, setVehicles] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [patenteInput, setPatenteInput] = useState('');
  const [patenteError, setPatenteError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Estado para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState<EstadoVehiculoDetalle | null>(null);

  // Estado para el modal "Pagar otro vehículo"
  const [modalPagarOtro, setModalPagarOtro] = useState(false);

  // Estado para tooltip flotante (¡Mueve esto aquí!)
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipDetalle, setTooltipDetalle] = useState<EstadoVehiculoDetalle | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Estado para la vista actual (mis-vehiculos o guardados)
  const [currentView, setCurrentView] = useState<'mis-vehiculos' | 'guardados'>('mis-vehiculos');

  // Nueva función para obtener el estado del vehículo de forma aislada
  const getVehicleStatus = async (plate: string, rut: string): Promise<EstadoVehiculoDetalle> => {
    try {
      // Revisión técnica
      let estadoRevision = null;
      const response = await fetch(`${API_CONFIG.BACKEND}consultar_revision_tecnica/${plate}`);
      if (!response.ok) {
        estadoRevision = "No vigente";
      } else {
        const data = await response.json();
        estadoRevision = data.vigencia || "No vigente";
      }

      // SOAP
      let estadoSoap = null;
      const soapResponse = await fetch(`${API_CONFIG.BACKEND}consultar_soap/${plate}`);
      if (!soapResponse.ok) {
        estadoSoap = "No vigente";
      } else { 
        const soapData = await soapResponse.json();
        estadoSoap = soapData.vigencia_permiso || "No vigente";
      }

      // Multas
      let estadoMultas = null;
      const multasResponse = await fetch(`${API_CONFIG.BACKEND}consultar_multas/${plate}`);
      if (!multasResponse.ok) {
        estadoMultas = "No vigente";
      } else {
        const multasData = await multasResponse.json();
        estadoMultas = multasData.total_multas === 0 ? 'No posee multas' : 'Posee multas';
      }

      // Permiso de circulación
      let estadoPermiso = null;
      let fechaVencimientoPermiso = null;
      const permisoResponse = await fetch(`${API_CONFIG.BACKEND}consultar_permiso_circulacion/${plate}`);
      if (permisoResponse.status === 404) {
        estadoPermiso = 'Primera obtención';
        fechaVencimientoPermiso = null;
      } else {
        const permisoData = await permisoResponse.json();
        estadoPermiso = permisoData.vigencia === true ? 'Vigente' : 'No vigente';
        fechaVencimientoPermiso = permisoData.fecha_expiracion || null;
      }
      

      // Encargo por robo
      let estadoEncargo = null;
      const encargoResponse = await fetch(`${API_CONFIG.BACKEND}consultar_encargo_robo/${plate}`);
      if (!encargoResponse.ok) {
        estadoEncargo = "No tiene encargo por robo";
      } else {
        const encargoData = await encargoResponse.json();
        estadoEncargo = encargoData.encargo === true ? 'Posee encargo por robo' : 'No tiene encargo por robo';
      }

      // Estado usuario en RPI
      let estadoRPI = null;
      const rpiResponse = await fetch(`${API_CONFIG.BACKEND}consultar-multas-rpi/${rut}`);
      if (!rpiResponse.ok) {
        estadoRPI = "Con multas";
      } else {
        const rpiData = await rpiResponse.json();
        estadoRPI = rpiData.cantidad_multas === 0 ? 'Sin multas' : 'Con multas';
      }

      // Lógica final
      const estadoGeneral = (
        estadoRevision === 'Vigente' &&
        estadoSoap === 'Vigente' &&
        estadoMultas === 'No posee multas' &&
        (estadoPermiso === 'Vigente' || estadoPermiso === 'Primera obtención') &&
        estadoEncargo === 'No tiene encargo por robo' &&
        estadoRPI === 'Sin multas'
      ) ? 'Al día' : 'No vigente';

      return {
        estadoGeneral,
        revision: estadoRevision,
        soap: estadoSoap,
        multas: estadoMultas,
        permiso: estadoPermiso,
        encargo: estadoEncargo,
        rpi: estadoRPI,
        fechaVencimientoPermiso
      };
    } catch (error) {
      return {
        estadoGeneral: 'No vigente',
        revision: 'No vigente',
        soap: 'No vigente',
        multas: 'No vigente',
        permiso: 'No vigente',
        encargo: 'No vigente',
        rpi: 'No vigente',
      };
    }
  };

  const [rpiStatus, setRPIStatus] = useState<string>('Cargando...');

  // Obtener estado de RPI de un rut
  const getRPIStatus = async (rut: string): Promise<string> => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND}consultar-multas-rpi/${rut}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data.cantidad_multas === 0 ? 'Sin multas' : 'Con multas';
    } catch (error) {
      console.error('Error al obtener estado de RPI:', error);
      return 'No vigente';
    }
  };

  // useEffect para obtener estado de RPI al montar el componente
  useEffect(() => {
    if (rut) {
      getRPIStatus(rut).then(status => setRPIStatus(status));
    }
  }, [rut]);

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
          // Consultar estado de cada vehículo
          const vehiclesWithEstado = await Promise.all(
            mappedVehicles.map(async (veh) => {
              const estadoVehiculo = await getVehicleStatus(veh.plate, rut);
              return { ...veh, estadoVehiculo };
            })
          );
          setVehicles(vehiclesWithEstado);
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

  // Nueva función para validar y redirigir
  const handlePagarOtroVehiculo = async () => {
    setPatenteError('');
    const plate = patenteInput.trim().toUpperCase();

    if (!plate || plate.length !== 6) {
      setPatenteError('La placa patente debe tener exactamente 6 caracteres.');
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BACKEND}consultar_patente/${plate}`);
      if (!response.ok) {
        setPatenteError('La placa patente no existe en los registros del Servicio de Registro Civil e Identificación.');
        return;
      }
      const data = await response.json();
      if (!data || data.error || data.not_found) {
        setPatenteError('La placa patente no existe en el sistema.');
        return;
      }
      // Si existe, redirigir
      sessionStorage.setItem('ppu', plate);
      sessionStorage.setItem('rut', rut);
      window.location.href = `/home/validaciones-pago`;
    } catch (err) {
      setPatenteError('Error al consultar la placa. Intente nuevamente.');
    }
  };

  function abrirModal(detalle: EstadoVehiculoDetalle) {
    setDetalleSeleccionado(detalle);
    setModalOpen(true);
  }

  function cerrarModal() {
    setModalOpen(false);
    setDetalleSeleccionado(null);
  }

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
          <h1 className="h4 m-0 text-center">Mis vehículos</h1>
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
      <section className="" style={{ fontFamily: '"Roboto", Arial, sans-serif', minHeight: 'max-content', width: '100%' }}>
        <div className="card-like shadow p-3 m-3">
          <p className="mb-1">Nombre: {nombre}</p>
          <p className="mb-4">RUT: {rut}</p>
          {/* Descripción del sitio */}
          <h2 className="mb-3" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>Tu Permiso - Gestión de Permisos de Circulación</h2>
        </div>
        <div className="row">
          <div className="card-like shadow col p-3 m-3">
            <div className="row">
              <data className="col p-3 m-3"></data>
              {/* Botones unidos para cambiar entre vistas */}
              <div className="col p-3 m-3 justify-content-center align-items-center d-flex">
                <div className="btn-group" role="group" aria-label="Selector de vista">
                <button 
                  type="button" 
                  className={`btn ${currentView === 'mis-vehiculos' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setCurrentView('mis-vehiculos')}
                  style={{ minWidth: '300px' }}
                >
                  Mis Vehículos
                </button>
                <button 
                  type="button" 
                  className={`btn ${currentView === 'guardados' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setCurrentView('guardados')}
                  style={{ minWidth: '300px' }}
                >
                  Vehículos Guardados
                </button>
                </div>
              </div>
              {/* Botón "Pagar otro vehículo" */}
              <div className="col p-3 m-3 d-flex align-items-center justify-content-center">
                <button className="btn btn-danger" style={{ backgroundColor: '#6633CC', borderColor: '#6633CC' }} onClick={() => setModalPagarOtro(true)}>
                  Pagar otro vehículo
                </button>
              </div>
            </div>
            <h1 className="p-3 h4 m-0 text-center">Mis Vehículos</h1>
            
            {/* Mostrar el resultado de la función getRPIStatus */}
            <div className="d-flex justify-content-center">
              {rpiStatus !== 'Sin multas' && rpiStatus !== 'Cargando...' && (
                <div className="alert alert-danger text-center" role="alert">
                  <strong>¡Atención!</strong> Posees multas asociadas al Registro de Pasajeros Infractores, por lo que no podrás realizar el pago del permiso de circulación de tus vehículos. Por favor, regulariza tu situación en el Registro de Pasajeros Infractores para poder continuar con el proceso de pago.
                </div>
              )}
            </div>
            <div className="d-flex justify-content-center">
              <div className="table-responsive">
                <table className="table align-middle table-striped">
                  <thead>
                    <tr className="bg-primary text-white">
                      <th className="fw-bold">Placa</th>
                      <th className="fw-bold">Marca</th>
                      <th className="fw-bold">Estado Vehículo</th>
                      <th className="fw-bold">Fecha Vencimiento Permiso</th>
                      <th className="fw-bold">Acción</th>
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
                            <p className="mb-0">{v.brand}</p>
                            <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>{v.model}</p>
                          </td>
                          
                          <td className="align-middle">
                            {v.estadoVehiculo ? (
                              <div
                                className="d-flex align-items-center"
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={e => {
                                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                  setTooltipDetalle(v.estadoVehiculo!);
                                  setTooltipPos({
                                    x: rect.left + rect.width / 2,
                                    y: rect.top + window.scrollY,
                                  });
                                  setTooltipVisible(true);
                                }}
                                // Elimina onMouseMove para que la posición no cambie con el mouse
                                onMouseLeave={() => {
                                  setTooltipVisible(false);
                                  setTooltipDetalle(null);
                                }}
                                onClick={() => abrirModal(v.estadoVehiculo!)}
                              >
                                <span
                                  className={`status-chip p-2 d-flex align-items-center justify-content-center ${v.estadoVehiculo.estadoGeneral === 'Al día' ? 'status--pagado' : 'status--vencido'}`}
                                >
                                  <span className="status-dot" />
                                  <span className="ms-1">
                                    {v.estadoVehiculo.estadoGeneral === 'Al día' ? 'Al día' : 'Presenta problemas'}
                                  </span>
                                </span>
                              </div>
                            ) : (
                              <span className="spinner-border spinner-border-sm text-primary" role="status" />
                            )}
                          </td>
                          <td className="align-middle">
                            {v.estadoVehiculo?.fechaVencimientoPermiso
                              ? (
                                <span>
                                  {formatearFechaLarga(v.estadoVehiculo.fechaVencimientoPermiso)}
                                </span>
                              )
                              : (
                                <span className="text-muted">No disponible</span>
                              )
                            }
                          </td>
                          <td className="align-middle">
                            <button
                              type="button"
                              className="btn btn-sm px-3 text-decoration-none btn-primary"
                              onClick={() => {
                                sessionStorage.setItem('ppu', v.plate);
                                sessionStorage.setItem('rut', rut);
                                window.location.href = `/home/validaciones-pago`;
                              }}
                            >
                              Ver
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
        </div>
      </section>

      {/* Modal "Pagar otro vehículo" */}
      {modalPagarOtro && (
        <div
          className="modal fade show"
          style={{
            display: 'block',
            background: 'rgba(0,0,0,0.35)',
            zIndex: 1050,
            height: '100vh'
          }}
          tabIndex={-1}
          role="dialog"
          onClick={() => setModalPagarOtro(false)}
        >
          <div
            className="modal-dialog"
            role="document"
            style={{ pointerEvents: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-2 card-like">
              <div className="modal-header">
                <h5 className="modal-title">Pagar otro vehículo</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setModalPagarOtro(false)} />
              </div>
              <div className="modal-body">
                <p className="text-justify">
                  Si deseas pagar otro vehículo que no está registrado con tu RUT, puedes hacerlo ingresando su placa patente en el siguiente campo.
                </p>
                <p className="text-center">Ingrese la placa patente</p>
                <div className="d-flex justify-content-center align-items-center gap-4">
                  <input
                    ref={inputRef}
                    type="text"
                    className="form-control"
                    placeholder="ABCD12"
                    maxLength={6}
                    value={patenteInput}
                    onChange={e => {
                      // Solo mayúsculas y máximo 6 caracteres
                      const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
                      setPatenteInput(val);
                      setPatenteError('');
                    }}
                    style={{ textTransform: 'uppercase', width: 180, textAlign: 'center' }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handlePagarOtroVehiculo}
                  >
                    Buscar Vehículo
                  </button>
                </div>
                {patenteError && (
                  <div className="text-danger text-center mt-2">{patenteError}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip flotante fuera de la tabla */}
      {tooltipVisible && tooltipDetalle && (
        <div
          style={{
            position: 'absolute',
            top: tooltipPos.y + 24,
            left: tooltipPos.x,
            transform: 'translate(-50%, 0)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <EstadoVehiculoTooltip detalle={tooltipDetalle} />
        </div>
      )}
    </ProtectedRoute>
  );
}

function formatearFechaLarga(fechaIso?: string) {
  if (!fechaIso) return '';
  const fecha = new Date(fechaIso);
  if (isNaN(fecha.getTime())) return '';
  return fecha.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).replace(' de ', ' de ').replace(',', '') // Asegura formato correcto
    .replace(/(\d+) de ([a-z]+) de (\d{4})/, '$1 de $2 del $3');
}
