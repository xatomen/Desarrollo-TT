'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import API_CONFIG from '@/config/api';
import Link from 'next/dist/client/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ModalVehicular from '@/components/ModalVehicular';

export default function VerDocumentosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { user, isAuthenticated, isLoading } = useAuth();
  const [padron, setPadron] = useState<any>(null);
  const [permiso, setPermiso] = useState<any>(null);
  const [revision, setRevision] = useState<any>(null);
  const [soap, setSoap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vehicleDocs, setVehicleDocs] = useState<{ [ppu: string]: any }>({});
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState<any>(null);

  const rut = user?.rut || '';

  const fetchVehicleData = async ({ ppu }: { ppu: string }) => {
    try {
      setLoading(true);
      const padronResponse = await fetch(`${API_CONFIG.BACKEND}consultar_patente/${ppu}`);
      const permisoResponse = await fetch(`${API_CONFIG.BACKEND}consultar_permiso_circulacion/${ppu}`);
      const revisionResponse = await fetch(`${API_CONFIG.BACKEND}consultar_revision_tecnica/${ppu}`);
      const soapResponse = await fetch(`${API_CONFIG.BACKEND}consultar_soap/${ppu}`);
      if (!padronResponse.ok || !permisoResponse.ok || !revisionResponse.ok || !soapResponse.ok) {
        throw new Error('Error fetching data');
      }
      const padronData = await padronResponse.json();
      const permisoData = await permisoResponse.json();
      const revisionData = await revisionResponse.json();
      const soapData = await soapResponse.json();
      setPadron(padronData);
      setPermiso(permisoData);
      setRevision(revisionData);
      setSoap(soapData);
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
    }
    finally {
      setLoading(false);
    }
  };

  const getVehicleList = async ({ rut }: { rut: string }) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND}vehiculos_rut/${rut}`);
      if (!response.ok) {
        throw new Error('Error fetching user vehicles');
      }
      const vehicles = await response.json();
      return vehicles;
    } catch (error) {
      console.error('Error fetching user vehicles:', error);
      return [];
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  // Recuperar vehículos del usuario
  const [vehicles, setVehicles] = useState<any[]>([]);
  useEffect(() => {
    if (rut) {
      getVehicleList({ rut }).then(setVehicles);
      console.log(vehicles);
    }
  }, [rut]);

  useEffect(() => {
    if (vehicles.length > 0) {
      vehicles.forEach((vehiculo) => {
        fetchVehicleDocs(vehiculo.ppu);
      });
    }
  }, [vehicles]);

  const fetchVehicleDocs = async (ppu: string) => {
    try {
      // Busca el vehículo actual
      const vehiculo = vehicles.find(v => v.ppu === ppu);

      const [padronRes, permisoRes, soapRes, revisionRes] = await Promise.all([
        fetch(`${API_CONFIG.BACKEND}consultar_patente/${ppu}`),
        fetch(`${API_CONFIG.BACKEND}consultar_permiso_circulacion/${ppu}`),
        fetch(`${API_CONFIG.BACKEND}consultar_soap/${ppu}`),
        fetch(`${API_CONFIG.BACKEND}consultar_revision_tecnica/${ppu}`),
      ]);
      const [padron, permiso, soap, revision] = await Promise.all([
        padronRes.json(),
        permisoRes.json(),
        soapRes.json(),
        revisionRes.json(),
      ]);

      // Fusiona los datos del vehículo con los del SOAP
      const soapConVehiculo = { ...soap, ...vehiculo };

      setVehicleDocs((prev) => ({
        ...prev,
        [ppu]: { padron, permiso, soap, revision },
      }));
    } catch (error) {
      setVehicleDocs((prev) => ({
        ...prev,
        [ppu]: { padron: null, permiso: null, soap: null, revision: null, error: true },
      }));
    }
  };

  function mostrarDocumento(tipo: string, ppu: string) {
    const doc = vehicleDocs[ppu]?.[tipo];
    setModalTitle(tipo.charAt(0).toUpperCase() + tipo.slice(1));
    setModalData({
      padron: vehicleDocs[ppu].padron,
      permiso: vehicleDocs[ppu].permiso,
      revision: vehicleDocs[ppu].revision,
      soap: vehicleDocs[ppu].soap,
    });
    setShowModal(true);
  }

  return (
    <ProtectedRoute>
      <div style={{ fontFamily: '"Roboto", Arial, sans-serif', minHeight: 'max-content', width: '100%' }}>
        
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
          <div className="card-like shadow col p-3 m-3">
            <h1>Ver Documentos</h1>
          </div>
        </div>

        {/* Lista de vehículos */}
        <div className="row">
          {vehicles.length === 0 && (
            <div className="col-12 text-center py-4 text-muted">
              No tienes vehículos registrados.
            </div>
          )}
          {vehicles.map((vehiculo) => (
            <div
              key={vehiculo.ppu}
              className="col-12 col-md-6 col-lg-4 mb-4"
              style={{ display: 'flex', alignItems: 'stretch' }}
            >
              <div
                className="card-like shadow p-3 d-flex flex-column w-100"
                style={{
                  borderRadius: 16,
                  border: `1.5px solid #e0e7ff`,
                  background: '#fff',
                  minHeight: 210,
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div className="d-flex align-items-center mb-2">
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0d6efd' }}>
                      {vehiculo.marca} {vehiculo.modelo}
                    </span>
                  </div>
                  <div className="text-muted" style={{ fontSize: '1rem', marginBottom: 8 }}>
                    Patente: <span style={{ fontWeight: 600 }}>{vehiculo.ppu}</span>
                  </div>
                </div>
                <div className="mt-auto d-flex flex-wrap gap-2 justify-content-between">
                  <button
                    className="btn btn-outline-primary flex-fill"
                    onClick={() => mostrarDocumento('padron', vehiculo.ppu)}
                    disabled={!vehicleDocs[vehiculo.ppu]}
                  >
                    Padrón
                  </button>
                  <button
                    className="btn btn-outline-success flex-fill"
                    onClick={() => mostrarDocumento('permiso', vehiculo.ppu)}
                    disabled={!vehicleDocs[vehiculo.ppu]}
                  >
                    Permiso
                  </button>
                  <button
                    className="btn btn-outline-warning flex-fill"
                    onClick={() => mostrarDocumento('soap', vehiculo.ppu)}
                    disabled={!vehicleDocs[vehiculo.ppu]}
                  >
                    SOAP
                  </button>
                  <button
                    className="btn btn-outline-info flex-fill"
                    onClick={() => mostrarDocumento('revision', vehiculo.ppu)}
                    disabled={!vehicleDocs[vehiculo.ppu]}
                  >
                    Revisión
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

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