// Page sencillo
'use client';
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/dist/client/components/navigation";
import React, { useState } from "react";
import API_CONFIG from "@/config/api";
import { useAuth } from '@/contexts/AuthContext';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

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
        <div className="row" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="card-like shadow col p-3 m-3">
                <h1 className="text-center my-4" style={{ fontSize: '2rem', fontWeight: '500', fontFamily: '"Roboto", Arial, sans-serif' }}>Historial de Permisos de Circulación</h1>
                <p className="text-center mb-4">Aquí puedes ver el historial de permisos de circulación que has emitido.</p>
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">PPU</th>
                                <th scope="col">Fecha de Emisión</th>
                                <th scope="col">Tarjeta</th>
                                <th scope="col">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {permisos.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center">No hay permisos emitidos.</td>
                                </tr>
                            ) : (
                                permisos.map((permiso, index) => (
                                    <tr key={permiso.id}>
                                        <td>{index + 1}</td>
                                        <td>{permiso.ppu}</td>
                                        <td>{new Date(permiso.fecha_emision).toLocaleDateString()}</td>
                                        <td>{"**** **** **** " + permiso.tarjeta}</td>
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