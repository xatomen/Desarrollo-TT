// app/ver-vehiculos/page.tsx
'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useAuth, getRutFromCookies } from '@/contexts/AuthContext';
import API_CONFIG from '@/config/api';
import React from 'react';
import { useRouter } from 'next/navigation';
import { FaTrashAlt, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import { BiEdit } from 'react-icons/bi';

type Estado = 'PAGADO' | 'HABILITADO' | 'VENCIDO';
type Vehiculo = { 
  id?: number; 
  name?: string;
  rut_propietario?: string;
  plate?: string; 
  ppu?: string; // <-- Agregado para evitar error de propiedad inexistente
  brand?: string; 
  model?: string; 
  estado?: Estado;
  estadoVehiculo?: EstadoVehiculoDetalle;
  nombre_vehiculo?: string; // <-- Agregado para evitar error de propiedad inexistente
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
      : estado === 'Apto para pagar'
      ? { cls: 'status--habilitado', label: 'Apto para pagar' }
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
    const goodStatuses = [
      'Vigente',
      'No posee multas',
      'Primera obtención',
      'No tiene encargo por robo',
      'Sin multas'
    ];
    return goodStatuses.includes(status) ? '#28a745' : '#dc3545';
  };

  const getStatusIcon = (status: string) => {
    const goodStatuses = [
      'Vigente',
      'No posee multas',
      'Primera obtención',
      'No tiene encargo por robo',
      'Sin multas'
    ];
    if (goodStatuses.includes(status)) {
      return <FaCheckCircle style={{ color: '#28a745', marginRight: 6, fontSize: '1.1em' }} />;
    }
    if (status === 'No vigente' || status === 'Posee multas' || status === 'Posee encargo por robo' || status === 'Con multas') {
      return <FaTimesCircle style={{ color: '#dc3545', marginRight: 6, fontSize: '1.1em' }} />;
    }
    return <FaExclamationCircle style={{ color: '#ffc107', marginRight: 6, fontSize: '1.1em' }} />;
  };

  const rows = [
    { label: 'Revisión Técnica', value: detalle.revision },
    { label: 'SOAP', value: detalle.soap },
    { label: 'Multas', value: detalle.multas },
    { label: 'Permiso de Circulación', value: detalle.permiso },
    { label: 'Encargo por Robo', value: detalle.encargo },
    { label: 'Estado en RPI', value: detalle.rpi },
    // detalle.fechaVencimientoPermiso && {
    //   label: 'Fecha Vencimiento Permiso',
    //   value: formatearFechaLarga(detalle.fechaVencimientoPermiso)
    // }
  ].filter(Boolean);

  return (
    <div
      className="custom-tooltip"
      style={{
        minWidth: 290,
        background: 'linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%)',
        border: '1.5px solid #bdbdfc',
        borderRadius: 14,
        boxShadow: '0 4px 18px #0002',
        padding: 18,
        fontSize: '1em',
        zIndex: 9999,
        color: '#222',
        fontFamily: '"Roboto", "Roboto", Arial, sans-serif',
      }}
    >
      <div className="d-flex" style={{ textAlign: 'center', fontWeight: 700, color: '#6D2077', fontSize: '1.1em', marginBottom: 8 }}>
        <FaExclamationCircle style={{ color: '#6D2077', marginRight: 6, fontSize: '1.2em', verticalAlign: 'middle' }} />
        Detalle del Estado del Vehículo
      </div>
      <hr style={{ margin: '10px 0', borderColor: '#e0e7ff' }} />
      <ul className="list-unstyled mb-0 mt-2" style={{ padding: 0 }}>
        {rows.map((row, idx) => (
          <li
            key={row.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: idx === rows.length - 1 ? 0 : 10,
              padding: '4px 0',
              borderBottom: idx === rows.length - 1 ? 'none' : '1px solid #f3e6f0'
            }}
          >
            <span style={{ flex: 1, fontWeight: 500 }}>{row.label}:</span>
            <span
              className="badge rounded-pill d-flex align-items-center"
              style={{
                backgroundColor: getStatusColor(row.value),
                color: 'white',
                fontSize: '0.95em',
                // minWidth: 120,
                justifyContent: 'flex-start',
                padding: '6px 12px',
                marginLeft: 10,
                fontWeight: 500,
                boxShadow: '0 1px 4px #0001',
              }}
            >
              {/* {getStatusIcon(row.value)} */}
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function VerVehiculos() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const rutFromCookies = getRutFromCookies();
  const rut = user?.rut || rutFromCookies || '';
  const nombre = user?.nombre || 'Usuario';

  // Dropdown agregar vehículo
  const [mostrarDropdownAgregar, setMostrarDropdownAgregar] = useState(false);
  const [nombrePersonalizado, setNombrePersonalizado] = useState('');

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

  // Agrega este useEffect después de los hooks de estado
  useEffect(() => {
    if (patenteError) {
      const timer = setTimeout(() => setPatenteError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [patenteError]);

  // Estado para la vista actual (mis-vehiculos o guardados)
  const [currentView, setCurrentView] = useState<'mis-vehiculos' | 'guardados'>('mis-vehiculos');

  // Vehículos guardados
  const [savedVehicles, setSavedVehicles] = useState<Vehiculo[]>([]);

  // Estado para mostrar el resultado de la búsqueda en el modal
  const [vehiculoBuscado, setVehiculoBuscado] = useState<{
    plate: string;
    brand: string;
    model: string;
    estadoVehiculo: EstadoVehiculoDetalle;
  } | null>(null);
  const [buscandoVehiculo, setBuscandoVehiculo] = useState(false);

  // Estado para feedback de guardado
  const [guardandoVehiculo, setGuardandoVehiculo] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState<string | null>(null);

  // Estado para el modal de edición
  const [modalEditar, setModalEditar] = useState<{ open: boolean, ppu?: string, nombreActual?: string }>(
    { open: false }
  );
  const [modalEliminar, setModalEliminar] = useState<{ open: boolean, ppu?: string }>(
    { open: false }
  );
  const [nuevoNombreVehiculo, setNuevoNombreVehiculo] = useState('');

  // Mueve aquí los hooks de paginación de guardados:
  const [currentPageGuardados, setCurrentPageGuardados] = useState(1);
  const [itemsPerPageGuardados, setItemsPerPageGuardados] = useState(5);

  // Estado para el buscador
  const [busqueda, setBusqueda] = useState('');

  // Estado para el filtro de estado del vehículo
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'al-dia' | 'no-vigente'>('todos');

  // Obtener mis vehículos guardados por rut
  const fetchSavedVehicles = async (rut: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND}mis_vehiculos_guardados/${rut}`);
      if (!response.ok) {
        throw new Error('Error al obtener vehículos guardados');
      }
      const data = await response.json();

      // Enriquecer cada vehículo con marca, modelo y estadoVehiculo
      const vehiclesWithDetails = await Promise.all(
        data.map(async (vehicle: any) => {
          let brand = 'N/A';
          let model = 'N/A';
          let rut_propietario = 'N/A';
          let estadoVehiculo = undefined;
          try {
            // Marca y modelo
            const patenteResponse = await fetch(`${API_CONFIG.BACKEND}consultar_patente/${vehicle.ppu}`);
            if (patenteResponse.ok) {
              const patenteData = await patenteResponse.json();
              brand = patenteData.marca || 'N/A';
              model = patenteData.modelo || 'N/A';
              rut_propietario = patenteData.rut || 'N/A';
            }
          } catch (error) {
            // Si falla, deja N/A
          }
          try {
            // Estado del vehículo
            estadoVehiculo = await getVehicleStatus(vehicle.ppu, rut_propietario);
          } catch (error) {
            // Si falla, deja indefinido
          }
          return {
            ...vehicle,
            brand,
            model,
            estadoVehiculo,
          };
        })
      );

      setSavedVehicles(vehiclesWithDetails);
      console.log('Vehículos guardados con detalles:', vehiclesWithDetails);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Llamar a la función para obtener los vehículos guardados al cargar el componente
  useEffect(() => {
    if (isAuthenticated && rut) {
      fetchSavedVehicles(rut);
    }
  }, [isAuthenticated, rut]);

  useEffect(() => {
    if (mensajeGuardado && mensajeGuardado.includes('exitosamente')) {
      // Refresca la tabla de vehículos guardados
      fetchSavedVehicles(rut);
      // Limpia el mensaje después de 5 segundos
      const timer = setTimeout(() => setMensajeGuardado(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensajeGuardado, rut]);

  const mapApiToVehiculoSaved = (apiData: any, index: number): Vehiculo => ({
    id: apiData.id,
    plate: apiData.ppu,
    name: apiData.nombre,
    // brand: apiData.brand,
    // model: apiData.model,
    // estado: apiData.estado
  });

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
        estadoPermiso = 'No vigente';
        fechaVencimientoPermiso = null;
      } else {
        const permisoData = await permisoResponse.json();
        estadoPermiso = permisoData.vigencia === true ? 'Vigente' : 'No vigente';
        fechaVencimientoPermiso = permisoData.fecha_expiracion || null;
      }
      

      // Encargo por robo
      let estadoEncargo = null;
      const encargoResponse = await fetch(`${API_CONFIG.BACKEND}consultar_encargo/${plate}`);
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

      // Lógica final - NUEVA LÓGICA PARA "APTO PARA PAGAR"
      let estadoGeneral = '';
      
      // Verificar si todos los documentos están vigentes (Al día)
      if (
        estadoRevision === 'Vigente' &&
        estadoSoap === 'Vigente' &&
        estadoMultas === 'No posee multas' &&
        estadoPermiso === 'Vigente' &&
        estadoEncargo === 'No tiene encargo por robo' &&
        estadoRPI === 'Sin multas'
      ) {
        estadoGeneral = 'Al día';
      } 
      // Verificar si solo el permiso está vencido (Apto para pagar)
      else if (
        estadoRevision === 'Vigente' &&
        estadoSoap === 'Vigente' &&
        estadoMultas === 'No posee multas' &&
        estadoPermiso === 'No vigente' &&
        estadoEncargo === 'No tiene encargo por robo' &&
        estadoRPI === 'Sin multas'
      ) {
        estadoGeneral = 'Apto para pagar';
      }
      // En cualquier otro caso
      else {
        estadoGeneral = 'No vigente';
      }

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
              const estadoVehiculo = await getVehicleStatus(veh.plate || '', rut);
              return { ...veh, estadoVehiculo };
            })
          );
          setVehicles(vehiclesWithEstado);
        }
      };

      loadVehicles();
    }
  }, [rut, isAuthenticated, isLoading]); // ✅ Agregar dependencias correctas

  // Filtrado para Mis Vehículos
  const filteredVehicles = vehicles.filter(v => {
    const coincideBusqueda =
      (v.plate || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (v.brand || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (v.model || '').toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado =
      filtroEstado === 'todos'
        ? true
        : filtroEstado === 'al-dia'
        ? v.estadoVehiculo?.estadoGeneral === 'Al día' || v.estadoVehiculo?.estadoGeneral === 'Apto para pagar'
        : v.estadoVehiculo?.estadoGeneral !== 'Al día' && v.estadoVehiculo?.estadoGeneral !== 'Apto para pagar';
    return coincideBusqueda && coincideEstado;
  });

  // Filtrado para Vehículos Guardados
  const filteredSavedVehicles = savedVehicles.filter(v => {
    const coincideBusqueda =
      (v.ppu || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (v.brand || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (v.model || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (v.nombre_vehiculo || '').toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado =
      filtroEstado === 'todos'
        ? true
        : filtroEstado === 'al-dia'
        ? v.estadoVehiculo?.estadoGeneral === 'Al día' || v.estadoVehiculo?.estadoGeneral === 'Apto para pagar'
        : v.estadoVehiculo?.estadoGeneral !== 'Al día' && v.estadoVehiculo?.estadoGeneral !== 'Apto para pagar';
    return coincideBusqueda && coincideEstado;
  });

  // Cálculos para paginación usando los filtrados
  const totalItems = filteredVehicles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);

  // Ya tienes esto arriba, ¡úsalo!
  const totalItemsGuardados = filteredSavedVehicles.length;
  const totalPagesGuardados = Math.ceil(totalItemsGuardados / itemsPerPageGuardados);
  const startIndexGuardados = (currentPageGuardados - 1) * itemsPerPageGuardados;
  const endIndexGuardados = Math.min(startIndexGuardados + itemsPerPageGuardados, totalItemsGuardados);
  const currentSavedVehicles = filteredSavedVehicles.slice(startIndexGuardados, endIndexGuardados);

  const getPageNumbersGuardados = () => {
    const pages = [];
    for (let i = 1; i <= totalPagesGuardados; i++) {
      pages.push(i);
    }
    return pages;
  };

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
    setVehiculoBuscado(null);
    const plate = patenteInput.trim().toUpperCase();

    if (!plate || plate.length !== 5 && plate.length !== 6) {
      setPatenteError('La placa patente debe tener exactamente 5 o 6 caracteres.');
      return;
    }

    setBuscandoVehiculo(true);
    try {
      const response = await fetch(`${API_CONFIG.BACKEND}consultar_patente/${plate}`);
      if (!response.ok) {
        setPatenteError('La placa patente no existe en los registros del Servicio de Registro Civil e Identificación.');
        setBuscandoVehiculo(false);
        return;
      }
      const data = await response.json();
      if (!data || data.error || data.not_found) {
        setPatenteError('La placa patente no existe en el sistema.');
        setBuscandoVehiculo(false);
        return;
      }
      // Marca y modelo desde la consulta
      const brand = data.marca || 'N/A';
      const model = data.modelo || 'N/A';

      const rutPropietario = data.rut || '';

      // Si existe, consulta el estado del vehículo
      const estadoVehiculo = await getVehicleStatus(plate, rutPropietario);
      setVehiculoBuscado({
        plate,
        brand,
        model,
        estadoVehiculo
      });
    } catch (err) {
      setPatenteError('Error al consultar la placa. Intente nuevamente.');
    } finally {
      setBuscandoVehiculo(false);
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

  // Función para agregar el vehículo a mis vehículos
  const handleAgregarVehiculo = async () => {
    if (!vehiculoBuscado) return;
    setGuardandoVehiculo(true);
    setMensajeGuardado(null);
    try {
      const response = await fetch(`${API_CONFIG.BACKEND}guardar_vehiculo/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rut,
          ppu: vehiculoBuscado.plate,
          nombre_vehiculo: `${vehiculoBuscado.brand} ${vehiculoBuscado.model}`,
          fecha_agregado: new Date().toISOString()
        })
      });
      if (response.ok) {
        setMensajeGuardado('Vehículo agregado exitosamente.');
      } else {
        const data = await response.json();
        setMensajeGuardado(data?.detail || 'No se pudo agregar el vehículo.');
      }
    } catch (err) {
      setMensajeGuardado('Error al agregar el vehículo.');
    } finally {
      setGuardandoVehiculo(false);
    }
  };

  // Eliminar vehículo guardado
  const eliminarVehiculo = async (rut: string, ppu: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND}eliminar_vehiculo/${rut}/${ppu}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchSavedVehicles(rut);
      } else {
        alert('No se pudo eliminar el vehículo.');
      }
    } catch (err) {
      alert('Error al eliminar el vehículo.');
    }
  };

  // Editar nombre de vehículo guardado
  const editarVehiculo = async (rut: string, ppu: string, nuevoNombre: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND}cambiar_nombre_vehiculo/${rut}/${ppu}?nuevo_nombre=${encodeURIComponent(nuevoNombre)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        fetchSavedVehicles(rut);
      } else {
        alert('No se pudo cambiar el nombre del vehículo.');
      }
    } catch (err) {
      alert('Error al cambiar el nombre del vehículo.');
    }
  };

  // Mostrar loading
  if (loading) {
    return (
      <section className="section card-like" style={{ fontFamily: '"Roboto", Arial, sans-serif', maxWidth: '1200px', alignContent: 'center', margin: '0 auto' }}>
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
        {/* Volver atrás y Breadcrumb */}
        <div className="row align-self-center d-flex align-items-center mb-4 px-3">
          <button className="p-2" style={{ backgroundColor: 'white', border: '1px solid #007bff', color: '#007bff', cursor: 'pointer' }} onClick={() => router.push('/home')}>
            <span>← Volver</span>
          </button>
          <nav aria-label="breadcrumb" className="col">
            <ol className="breadcrumb p-0 m-0">
              <li className="align-self-center breadcrumb-item" aria-current="page">Vehículos</li>
              <li className="align-self-center breadcrumb-item active" aria-current="page">Validación documentos</li>
              <li className="align-self-center breadcrumb-item active" aria-current="page">Detalles de pago</li>
              <li className="align-self-center breadcrumb-item active" aria-current="page">Confirmación de pago</li>
            </ol>
          </nav>
        </div>

        <div className="row" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            className="card-like shadow p-4 m-3"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #f3e6f0 0%, #e0e7ff 100%)',
              borderRadius: '18px',
              boxShadow: '0 4px 16px #0002',
              color: '#222',
              fontFamily: '"Roboto", "Roboto", sans-serif'
            }}
          >
            <h2 className="mb-3" style={{
              fontFamily: 'Roboto',
              fontWeight: 'bold',
              fontSize: '1.3rem',
              color: '#6D2077'
            }}>
              Selecciona un vehículo para continuar
            </h2>
            <div className="row justify-content-center g-3 mb-2">
              <div className="col-12 col-md-4">
                <div style={{
                  background: 'linear-gradient(90deg, #fbeaf6 0%, #e0e7ff 100%)',
                  borderRadius: '14px',
                  boxShadow: '0 2px 8px #0001',
                  padding: '1.2rem 1rem',
                  minHeight: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%'
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#6D2077',
                    marginBottom: 10
                  }} />
                  <b>Mis Vehículos</b>
                  <span style={{ fontSize: '1rem', fontWeight: 400 }}>
                    Aquí verás los vehículos asociados a tu RUT y podrás gestionar su permiso de circulación.
                  </span>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div style={{
                  background: 'linear-gradient(90deg, #e0e7ff 0%, #fbeaf6 100%)',
                  borderRadius: '14px',
                  boxShadow: '0 2px 8px #0001',
                  padding: '1.2rem 1rem',
                  minHeight: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%'
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#D00070',
                    marginBottom: 10
                  }} />
                  <b>Vehículos Guardados</b>
                  <span style={{ fontSize: '1rem', fontWeight: 400 }}>
                    Aquí puedes acceder rápidamente a los vehículos que hayas guardado manualmente.
                  </span>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div style={{
                  background: 'linear-gradient(90deg, #e0e7ff 0%, #fbeaf6 100%)',
                  borderRadius: '14px',
                  boxShadow: '0 2px 8px #0001',
                  padding: '1.2rem 1rem',
                  minHeight: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%'
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#00C7B1',
                    marginBottom: 10
                  }} />
                  <b>Pagar otro vehículo</b>
                  <span style={{ fontSize: '1rem', fontWeight: 400 }}>
                    Si quieres agregar o pagar el permiso de un vehículo nuevo, usa esta opción para buscarlo por su placa patente.
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3" style={{ fontSize: '1rem', color: '#555' }}>
              Selecciona la opción que necesites usando los botones de abajo.
            </div>
          </div>
        </div>
        
        <div className="row" style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
            
            {/* RENDERIZADO CONDICIONAL BASADO EN currentView */}
            {currentView === 'mis-vehiculos' ? (
              // Mis Vehículos
              <div>
                <h1 className="p-3 h4 m-0 text-center">Mis Vehículos</h1>
                <div className="row mb-3">
                  <div className="col-12 col-md-10 mx-auto d-flex gap-2">
                    <span style={{ color: '#555' }}>Filtros de búsqueda</span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar por placa, marca, modelo o nombre..."
                      value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                      style={{ border: '1px solid #ced4da', borderRadius: '6px', height: '40px' }}
                    />
                    <select
                      className="form-select"
                      style={{ maxWidth: 180, border: '1px solid #ced4da', borderRadius: '6px', fontSize: '0.9rem', height: '40px' }}
                      value={filtroEstado}
                      onChange={e => setFiltroEstado(e.target.value as any)}
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="al-dia">Al día / Apto para pagar</option>
                      <option value="no-vigente">Presenta problemas</option>
                    </select>
                  </div>
                </div>
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
                                    onMouseLeave={() => {
                                      setTooltipVisible(false);
                                      setTooltipDetalle(null);
                                    }}
                                    onClick={() => abrirModal(v.estadoVehiculo!)}
                                  >
                                    <span
                                      className={`status-chip p-2 d-flex align-items-center justify-content-center ${
                                        v.estadoVehiculo.estadoGeneral === 'Al día' 
                                          ? 'status--pagado' 
                                          : v.estadoVehiculo.estadoGeneral === 'Apto para pagar'
                                          ? 'status--habilitado'
                                          : 'status--vencido'
                                      }`}
                                    >
                                      <span className="status-dot" />
                                      <span className="ms-1">
                                        {v.estadoVehiculo.estadoGeneral === 'Al día' 
                                          ? 'Al día' 
                                          : v.estadoVehiculo.estadoGeneral === 'Apto para pagar'
                                          ? 'Apto para pagar'
                                          : 'Presenta problemas'
                                        }
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
                                    <span className="text-muted">Vehículo nuevo</span>
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
                  {/* Paginación para Mis Vehículos */}
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
            ) : (
              // Vehículos Guardados
              <div>
                <h1 className="p-3 h4 m-0 text-center">Vehículos Guardados</h1>
                <div className="row mb-3">
                  <div className="col-12 col-md-10 mx-auto d-flex gap-2">
                    <span style={{ color: '#555' }}>Filtros de búsqueda</span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar por placa, marca, modelo o nombre..."
                      value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                      style={{ border: '1px solid #ced4da', borderRadius: '6px', height: '40px' }}
                    />
                    <select
                      className="form-select"
                      style={{ maxWidth: 180, border: '1px solid #ced4da', borderRadius: '6px', fontSize: '0.9rem', height: '40px' }}
                      value={filtroEstado}
                      onChange={e => setFiltroEstado(e.target.value as any)}
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="al-dia">Al día / Apto para pagar</option>
                      <option value="no-vigente">Presenta problemas</option>
                    </select>
                  </div>
                </div>
                <div className="d-flex justify-content-center">
                  <div className="table-responsive">
                    <table className="table align-middle table-striped">
                      <thead>
                        <tr className="bg-primary text-white">
                          <th className="fw-bold">Placa</th>
                          <th className="fw-bold">Nombre del Vehículo</th>
                          <th className="fw-bold">Marca</th>
                          <th className="fw-bold">Estado Vehículo</th>
                          <th className="fw-bold">Fecha Vencimiento Permiso</th>
                          <th className="fw-bold">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentSavedVehicles.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-4 text-muted">
                              No tienes vehículos guardados.
                            </td>
                          </tr>
                        ) : (
                          currentSavedVehicles.map((vehicle, index) => (
                            <tr key={vehicle.id || index}>
                              <td className="fw-bold text-dark align-middle" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {vehicle.ppu}
                              </td>
                              <td className="align-middle" style={{ fontSize: '1rem' }}>
                                {vehicle.nombre_vehiculo}
                              </td>
                              <td className="align-middle mb-0">
                                {vehicle.brand || 'N/A'}
                                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>{vehicle.model || 'N/A'}</p>
                              </td>
                              <td className="align-middle">
                                {vehicle.estadoVehiculo ? (
                                  <div
                                    className="d-flex align-items-center"
                                    style={{ cursor: 'pointer' }}
                                    onMouseEnter={e => {
                                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                      setTooltipDetalle(vehicle.estadoVehiculo!);
                                      setTooltipPos({
                                        x: rect.left + rect.width / 2,
                                        y: rect.top + window.scrollY,
                                      });
                                      setTooltipVisible(true);
                                    }}
                                    onMouseLeave={() => {
                                      setTooltipVisible(false);
                                      setTooltipDetalle(null);
                                    }}
                                    onClick={() => abrirModal(vehicle.estadoVehiculo!)}
                                  >
                                    <span
                                      className={`status-chip p-2 d-flex align-items-center justify-content-center ${
                                        vehicle.estadoVehiculo.estadoGeneral === 'Al día' 
                                          ? 'status--pagado' 
                                          : vehicle.estadoVehiculo.estadoGeneral === 'Apto para pagar'
                                          ? 'status--habilitado'
                                          : 'status--vencido'
                                      }`}
                                    >
                                      <span className="status-dot" />
                                      <span className="ms-1">
                                        {vehicle.estadoVehiculo.estadoGeneral === 'Al día' 
                                          ? 'Al día' 
                                          : vehicle.estadoVehiculo.estadoGeneral === 'Apto para pagar'
                                          ? 'Apto para pagar'
                                          : 'Presenta problemas'
                                        }
                                      </span>
                                    </span>
                                  </div>
                                ) : (
                                  <span className="spinner-border spinner-border-sm text-primary" role="status" />
                                )}
                              </td>
                              <td className="align-middle">
                                {vehicle.estadoVehiculo?.fechaVencimientoPermiso
                                  ? (
                                    <span>
                                      {formatearFechaLarga(vehicle.estadoVehiculo.fechaVencimientoPermiso)}
                                    </span>
                                  )
                                  : (
                                    <span className="text-muted">No disponible</span>
                                  )
                                }
                              </td>
                              {/* <td className="align-middle">
                                {vehicle.fecha_agregado 
                                  ? new Date(vehicle.fecha_agregado).toLocaleDateString('es-CL')
                                  : <span className="text-muted">No disponible</span>
                                }
                              </td> */}
                              <td className="align-middle row">
                                <button
                                  type="button"
                                  className="col btn btn-sm px-3 text-decoration-none btn-primary"
                                  onClick={() => {
                                    sessionStorage.setItem('ppu', vehicle.ppu || '');
                                    sessionStorage.setItem('rut', rut);
                                    window.location.href = `/home/validaciones-pago`;
                                  }}
                                >
                                  Ver
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm px-3 text-decoration-none btn-success mx-2"
                                  onClick={() => {
                                    setModalEditar({ open: true, ppu: vehicle.ppu, nombreActual: vehicle.nombre_vehiculo });
                                    setNuevoNombreVehiculo(vehicle.nombre_vehiculo || '');
                                  }}
                                >
                                  Editar
                                  {/* <BiEdit /> */}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm px-3 text-decoration-none btn-danger"
                                  onClick={() => {
                                    setModalEliminar({ open: true, ppu: vehicle.ppu });
                                  }}
                                >
                                  Eliminar
                                  {/* <FaTrashAlt /> */}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* PAGINACIÓN PARA VEHÍCULOS GUARDADOS */}
                {savedVehicles.length > 0 && (
                  <div style={{ maxWidth: '75%', margin: '0 auto' }}>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-3">
                      <div className="d-flex align-items-center gap-2">
                        <label className="form-label mb-0">Mostrar</label>
                        <select 
                          className="form-select form-select-sm" 
                          value={itemsPerPageGuardados}
                          onChange={(e) => {
                            setItemsPerPageGuardados(Number(e.target.value));
                            setCurrentPageGuardados(1);
                          }}
                          style={{ width: 80 }}
                        >
                          <option value={1}>1</option>
                          <option value={3}>3</option>
                          <option value={5}>5</option>
                        </select>
                        <span className="text-muted small ms-2">
                          Mostrando {startIndexGuardados + 1} - {endIndexGuardados} de {totalItemsGuardados}
                        </span>
                      </div>
                      <nav aria-label="Paginación">
                        <ul className="pagination pagination-sm mb-0">
                          <li className={`page-item ${currentPageGuardados === 1 ? 'disabled' : ''}`}>
                            <button 
                              className="page-link"
                              onClick={() => setCurrentPageGuardados(currentPageGuardados - 1)}
                              disabled={currentPageGuardados === 1}
                            >
                              &laquo;
                            </button>
                          </li>
                          {getPageNumbersGuardados().map(n => (
                            <li key={n} className={`page-item ${n === currentPageGuardados ? 'active' : ''}`}>
                              <button 
                                className="page-link"
                                onClick={() => setCurrentPageGuardados(n)}
                              >
                                {n}
                              </button>
                            </li>
                          ))}
                          <li className={`page-item ${currentPageGuardados === totalPagesGuardados ? 'disabled' : ''}`}>
                            <button 
                              className="page-link"
                              onClick={() => setCurrentPageGuardados(currentPageGuardados + 1)}
                              disabled={currentPageGuardados === totalPagesGuardados}
                            >
                              &raquo;
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
                )}
              </div>
            )}
            
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
          onClick={() => {
            setModalPagarOtro(false);
            setVehiculoBuscado(null);
            setPatenteInput('');
            setPatenteError('');
          }}
        >
          <div
            className="modal-dialog"
            role="document"
            style={{ pointerEvents: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-2 card-like">
              <div className="modal-header">
                <h5 className="modal-title">Buscar estado de vehículo</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => {
                  setModalPagarOtro(false);
                  setVehiculoBuscado(null);
                  setPatenteInput('');
                  setPatenteError('');
                }} />
              </div>
              <div className="modal-body">
                <p className="text-justify">
                  Si deseas consultar el estado de un vehículo que no está registrado con tu RUT, puedes hacerlo ingresando su placa patente en el siguiente campo.
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
                      setVehiculoBuscado(null);
                    }}
                    style={{ textTransform: 'uppercase', width: 180, textAlign: 'center' }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handlePagarOtroVehiculo}
                    disabled={buscandoVehiculo}
                  >
                    {buscandoVehiculo ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      'Buscar Vehículo'
                    )}
                  </button>
                </div>
                {patenteError && (
                  <div className="alert alert-danger text-center mt-2 py-2 px-3" role="alert" style={{ fontSize: '1em' }}>
                    {patenteError}
                  </div>
                )}
                {/* Mostrar resultado de la búsqueda */}
                {vehiculoBuscado && (
                  <div className="mt-4">
                    <div className="border rounded p-3 mb-2 bg-light">
                      <div className="mb-2">
                        <b>Placa patente:</b> <span className="text-primary">{vehiculoBuscado.plate}</span>
                      </div>
                      <div className="mb-2">
                        <b>Marca:</b> {vehiculoBuscado.brand}
                      </div>
                      <div className="mb-2">
                        <b>Modelo:</b> {vehiculoBuscado.model}
                      </div>
                      <div className="mb-2 d-flex align-items-center gap-2">
                        <b>Estado general:</b>
                        <div
                          className="d-inline-flex align-items-center"
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={e => {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setTooltipDetalle(vehiculoBuscado.estadoVehiculo);
                            setTooltipPos({
                              x: rect.left + rect.width / 2,
                              y: rect.top + window.scrollY,
                            });
                            setTooltipVisible(true);
                          }}
                          onMouseLeave={() => {
                            setTooltipVisible(false);
                            setTooltipDetalle(null);
                          }}
                        >
                          <EstadoVehiculoTag estado={vehiculoBuscado.estadoVehiculo.estadoGeneral} />
                        </div>
                      </div>
                      <div className="mb-2">
                        <b>Fecha vencimiento permiso:</b>{' '}
                        {vehiculoBuscado.estadoVehiculo.fechaVencimientoPermiso
                          ? formatearFechaLarga(vehiculoBuscado.estadoVehiculo.fechaVencimientoPermiso)
                          : <span className="text-muted">Vehículo Nuevo</span>
                        }
                      </div>
                      <div className="mt-3 d-flex gap-2">
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            sessionStorage.setItem('ppu', vehiculoBuscado.plate);
                            sessionStorage.setItem('rut', rut);
                            window.location.href = `/home/validaciones-pago`;
                          }}
                        >
                          Pagar
                        </button>
                        <button
                          className="btn btn-outline-success"
                          onClick={handleAgregarVehiculo}
                          disabled={guardandoVehiculo}
                        >
                          {guardandoVehiculo ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            'Agregar a mis vehículos'
                          )}
                        </button>
                      </div>
                      {mensajeGuardado && (
                        <div className={`mt-2 ${mensajeGuardado.includes('exitosamente') ? 'text-success alert alert-success text-center' : 'text-danger alert alert-danger text-center'}`}>
                          {mensajeGuardado}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {modalEditar.open && (
        <div
          className="modal fade show"
          style={{
            display: 'block',
            background: 'rgba(0,0,0,0.35)',
            zIndex: 1060,
          }}
          tabIndex={-1}
          role="dialog"
          onClick={() => setModalEditar({ open: false })}
        >
          <div
            className="modal-dialog"
            role="document"
            style={{ pointerEvents: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="card-like">
              <div className="modal-header">
                <h5 className="modal-title">Editar nombre del vehículo</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setModalEditar({ open: false })} />
              </div>
              <div className="modal-body">
                <label className="form-label">Nuevo nombre para {modalEditar.ppu}:</label>
                <input
                  type="text"
                  className="form-control"
                  value={nuevoNombreVehiculo}
                  onChange={e => setNuevoNombreVehiculo(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalEditar({ open: false })}>Cancelar</button>
                <button
                  className="btn btn-success"
                  onClick={async () => {
                    await editarVehiculo(rut, modalEditar.ppu!, nuevoNombreVehiculo);
                    setModalEditar({ open: false });
                  }}
                  disabled={!nuevoNombreVehiculo.trim()}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalEliminar.open && (
        <div
          className="modal fade show"
          style={{
            display: 'block',
            background: 'rgba(0,0,0,0.35)',
            zIndex: 1060,
          }}
          tabIndex={-1}
          role="dialog"
          onClick={() => setModalEliminar({ open: false })}
        >
          <div
            className="modal-dialog"
            role="document"
            style={{ pointerEvents: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="card-like">
              <div className="modal-header">
                <h5 className="modal-title">Eliminar vehículo</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setModalEliminar({ open: false })} />
              </div>
              <div className="modal-body">
                ¿Estás seguro de que deseas eliminar el vehículo <b>{modalEliminar.ppu}</b>?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalEliminar({ open: false })}>Cancelar</button>
                <button
                  className="btn btn-danger"
                  onClick={async () => {
                    await eliminarVehiculo(rut, modalEliminar.ppu!);
                    setModalEliminar({ open: false });
                  }}
                >
                  Eliminar
                </button>
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


