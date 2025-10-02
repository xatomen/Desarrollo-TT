// Page sencillo
'use client';
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/dist/client/components/navigation";
import React, { useState } from "react";
import API_CONFIG from "@/config/api";
import { useAuth } from '@/contexts/AuthContext';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

// Componente para mostrar el permiso de circulación en un modal
function PermisoCirculacionModal({ show, onHide, permiso }: { show: boolean, onHide: () => void, permiso: any }) {
  if (!permiso) return null;
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Permiso de Circulación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{
          // background: 'linear-gradient(135deg, #f3e6f0 0%, #e0e7ff 100%)',
          // borderRadius: '18px',
          // boxShadow: '0 4px 16px #0002',
          // padding: '32px 28px',
          fontFamily: '"Roboto", Arial, sans-serif',
          color: '#222'
        }}>
          <h3 style={{ color: '#000000ff', fontWeight: 700, fontSize: '1.3rem', fontFamily: '"Roboto", Arial, sans-serif' }}>Datos del Permiso</h3>
          <div className="row">
            <div className="col-md-6">
              <b>PPU:</b> {permiso.ppu}<br />
              <b>Nombre:</b> {permiso.nombre}<br />
              <b>RUT:</b> {permiso.rut}<br />
              <b>Marca:</b> {permiso.marca}<br />
              <b>Modelo:</b> {permiso.modelo}<br />
              <b>Año:</b> {permiso.anio}<br />
              <b>Color:</b> {permiso.color}<br />
              <b>Tipo Vehículo:</b> {permiso.tipo_vehiculo}<br />
              <b>Motor:</b> {permiso.motor}<br />
              <b>Chasis:</b> {permiso.chasis}<br />
              <b>Cilindrada:</b> {permiso.cilindrada}<br />
              <b>Transmisión:</b> {permiso.transmision}<br />
              <b>Combustible:</b> {permiso.combustible}<br />
              <b>Tipo Sello:</b> {permiso.tipo_sello}<br />
            </div>
            <div className="col-md-6">
              <b>Fecha Emisión:</b> {new Date(permiso.fecha_emision).toLocaleDateString()}<br />
              <b>Fecha Expiración:</b> {new Date(permiso.fecha_expiracion).toLocaleDateString()}<br />
              <b>Valor Permiso:</b> ${permiso.valor_permiso?.toLocaleString('es-CL')}<br />
              <b>Tasación:</b> ${permiso.tasacion?.toLocaleString('es-CL')}<br />
              <b>Código SII:</b> {permiso.codigo_sii || 'No disponible'}<br />
              <b>Carga:</b> {permiso.carga}<br />
              <b>Equipamiento:</b> {permiso.equipamiento}<br />
              <b>PTS:</b> {permiso.pts}<br />
              <b>AST:</b> {permiso.ast}<br />
              <b>Vigencia:</b> {permiso.vigencia ? 'Vigente' : 'No vigente'}<br />
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function HistorialPermisosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [permisos, setPermisos] = React.useState<Array<any>>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  // Estado para el modal
  const [showModal, setShowModal] = useState(false);
  const [permisoSeleccionado, setPermisoSeleccionado] = useState<any>(null);

  // Estados para búsqueda y paginación
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const permisosPorPagina = 8;

  // Filtrar permisos por búsqueda
  const permisosFiltrados = permisos.filter(
    (permiso) =>
      permiso.ppu?.toLowerCase().includes(search.toLowerCase()) ||
      permiso.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      permiso.rut?.toLowerCase().includes(search.toLowerCase())
  );

  // Paginación
  const totalPaginas = Math.ceil(permisosFiltrados.length / permisosPorPagina);
  const permisosPagina = permisosFiltrados.slice(
    (currentPage - 1) * permisosPorPagina,
    currentPage * permisosPorPagina
  );

  console.log("RUT del usuario autenticado:", user?.rut);
  // Obtener los permisos emitidos por el usuario
  React.useEffect(() => {
    const fetchPermisos = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BACKEND}mis_permisos_emitidos/${user?.rut}`);
        const data = await response.json();
        setPermisos(data);
        console.log("Permisos obtenidos:", data);
      } catch (error) {
        console.error("Error fetching permisos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermisos();
  }, [user?.rut]);
  if (loading) {
    return (
      <ProtectedRoute>
        <div>Cargando...</div>
      </ProtectedRoute>
    );
  }

  // Obtener permiso de circulación
  const obtenerPermisoCirculacion = async (ppu: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND}consultar_permiso_circulacion/${ppu}`);
      const data = await response.json();
      setPermisoSeleccionado(data);
      setShowModal(true);
      console.log("Permiso de circulación obtenido:", data);
    } catch (error) {
      console.error("Error fetching permiso de circulación:", error);
    }
  };
  
  // Renderizar la tabla de permisos


  return (
    <ProtectedRoute>
      <div className="" style={{ fontFamily: '"Roboto", Arial, sans-serif', minHeight: 'max-content', width: '100%' }}>
        {/* Volver atrás y Breadcrumb */}
        <div className="row align-self-center d-flex align-items-center mb-4 px-3">
          <button className="p-2" style={{ backgroundColor: 'white', border: '1px solid #007bff', color: '#007bff', cursor: 'pointer' }} onClick={() => router.back()}>
            <span>← Volver</span>
          </button>
          <nav aria-label="breadcrumb" className="col">
            <ol className="breadcrumb p-0 m-0">
              <li className="align-self-center breadcrumb-item active" aria-current="page">Historial de Permisos de Circulación</li>
            </ol>
          </nav>
        </div>
        
        <div className="row" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="card-like shadow col p-3 m-3">
            <h1 className="text-center my-4" style={{ fontSize: '2rem', fontWeight: '500', fontFamily: '"Roboto", Arial, sans-serif' }}>Historial de Permisos de Circulación</h1>
            <p className="text-center mb-4">Aquí puedes ver el historial de permisos de circulación que has emitido.</p>
            
            {/* Barra de búsqueda */}
            <div className="mb-3 d-flex justify-content-end">
              <Form.Control
                type="text"
                placeholder="Buscar por PPU, nombre o RUT..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ maxWidth: 320 }}
              />
            </div>

            <div className="table-responsive">
              <table
                className="table"
                style={{
                  background: "#fff",
                  width: '75%',
                  flex: 1,
                  margin: '0 auto',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px #0001'
                }}
              >
                <thead style={{ backgroundColor: "#0d6efd", color: "#fff" }}>
                  <tr>
                    <th scope="col">PPU</th>
                    <th scope="col">Fecha de Emisión</th>
                    <th scope="col">Tarjeta</th>
                    <th scope="col">Valor Permiso</th>
                    <th scope="col">Cuota</th>
                    <th scope="col">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {permisosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center">No hay permisos emitidos.</td>
                    </tr>
                  ) : (
                    permisosPagina.map((permiso) => (
                      <tr key={permiso.id}>
                        <td style={{ fontWeight: 600 }}>{permiso.ppu}</td>
                        <td>{new Date(permiso.fecha_pago).toLocaleDateString()}</td>
                        <td>{"**** **** **** " + permiso.tarjeta.slice(-4)}</td>
                        <td>${permiso.monto_pago?.toLocaleString('es-CL')}</td>
                        <td>{permiso.cuota_pagada}/{permiso.cuotas}</td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => obtenerPermisoCirculacion(permiso.ppu)}
                          >
                            Ver Permiso
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Modal para mostrar el permiso */}
        <PermisoCirculacionModal show={showModal} onHide={() => setShowModal(false)} permiso={permisoSeleccionado} />
      </div>
    </ProtectedRoute>
  );
}