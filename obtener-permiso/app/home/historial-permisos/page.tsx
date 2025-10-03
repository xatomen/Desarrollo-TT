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
import ModalVehicular from '@/components/ModalVehicular';

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
  // const [showModal, setShowModal] = useState(false);
  const [permisoSeleccionado, setPermisoSeleccionado] = useState<any>(null);

  // Estados para búsqueda y paginación
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  console.log(permisos)

  // Filtrar permisos por búsqueda
  const permisosFiltrados = permisos.filter(
    (permiso) =>
      permiso.id?.toString().includes(search.toLowerCase()) ||
      permiso.ppu?.toLowerCase().includes(search.toLowerCase()) ||
      permiso.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      permiso.rut?.toLowerCase().includes(search.toLowerCase())
  );

  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState<any>(null);

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

  async function mostrarDocumento(tipo: string, id: number, ppu: string) {
    const [padronRes, permisoRes, revisionRes, soapRes] = await Promise.all([
      fetch(`${API_CONFIG.BACKEND}consultar_patente/${ppu}`),
      fetch(`${API_CONFIG.BACKEND}consultar_permiso_circulacion_id/${id}`),
      fetch(`${API_CONFIG.BACKEND}consultar_revision_tecnica/${ppu}`),
      fetch(`${API_CONFIG.BACKEND}consultar_soap/${ppu}`),
    ]);
    const [padron, permiso, revision, soap] = await Promise.all([
      padronRes.json(),
      permisoRes.json(),
      revisionRes.json(),
      soapRes.json(),
    ]);
    setModalTitle(tipo.charAt(0).toUpperCase() + tipo.slice(1));
    setModalData({
      padron,
      permiso,
      revision,
      soap,
    });
    setShowModal(true);
  }


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
            <div
              style={{
                maxWidth: '900px',
                background: 'linear-gradient(135deg, #e0e7ff 0%, #fbeaf6 100%)',
                borderRadius: '18px',
                boxShadow: '0 4px 16px #0002',
                color: '#222',
                fontFamily: '"Dosis", "Roboto", Arial, sans-serif',
                padding: '1.5rem 1.2rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                margin: '0 auto 2rem auto'
              }}
            >
              <div style={{
                background: '#6D2077',
                borderRadius: '50%',
                width: 56,
                height: 56,
                fontFamily: '"Dosis", "Roboto", Arial, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 18,
                flexShrink: 0
              }}>
                <i className="bi bi-file-earmark-pdf" style={{ color: '#fff', fontSize: 32 }} />
              </div>
              <div>
                <h2 style={{
                  fontWeight: 700,
                  fontSize: '1.3rem',
                  marginBottom: 6,
                  color: '#6D2077',
                  fontFamily: '"Dosis", "Roboto", Arial, sans-serif'
                }}>
                  Historial de Permisos Pagados
                </h2>
                <p style={{ fontSize: '1.08rem', marginBottom: 0, fontFamily: '"Dosis", "Roboto", Arial, sans-serif' }}>
                  Aquí puedes consultar todos los permisos de circulación que has pagado, revisar su información detallada y descargar cada uno en formato PDF para tus registros o trámites.
                </p>
              </div>
            </div>
            
            {/* Barra de búsqueda */}
            <div className="mb-3 d-flex justify-content-center">
              <Form.Control
                type="text"
                placeholder="Buscar por PPU, nombre o RUT..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ maxWidth: 320, borderRadius: 10}}
              />
            </div>

            <div className="p-3">
              <table
                className="table card-like shadow"
                style={{
                  // background: "#fff",
                  maxWidth: '900px',
                  flex: 1,
                  margin: '0 auto',
                  borderRadius: 16,
                  boxShadow: '0 2px 8px #0001'
                }}
              >
                <thead style={{ backgroundColor: "#0d6efd", color: "#fff", borderRadius: 16 }}>
                  <tr>
                    <th scope="col">PPU</th>
                    <th scope="col">N° Permiso</th>
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
                    permisosFiltrados.map((permiso) => (
                      <tr key={permiso.id}>
                        <td style={{ fontWeight: 600 }}>{permiso.ppu}</td>
                        <td>{permiso.id_permiso}</td>
                        <td>{new Date(permiso.fecha_pago).toLocaleDateString()}</td>
                        <td>{"**** **** **** " + permiso.tarjeta.slice(-4)}</td>
                        <td>${permiso.monto_pago?.toLocaleString('es-CL')}</td>
                        <td>{permiso.cuota_pagada}/{permiso.cuotas}</td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => mostrarDocumento('permiso', permiso.id_permiso, permiso.ppu)}
                          >
                            Ver Permiso
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Paginación */}
              <div className="d-flex justify-content-center mt-4">
                <nav>
                  <ul className="pagination">
                    {Array.from({ length: Math.ceil(permisosFiltrados.length / 10) }, (_, i) => i + 1).map(page => (
                      <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
              
            </div>
          </div>
        </div>
        {/* Modal para mostrar el permiso */}
        <ModalVehicular
          show={showModal}
          onClose={() => setShowModal(false)}
          title={modalTitle}
          data={modalData}
        />
      </div>
    </ProtectedRoute>
  );
}