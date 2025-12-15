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
import React from 'react';

function VerDocumentosContent() {
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

  // Barra de búsqueda y paginación
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtrado de vehículos
  const filteredVehicles = vehicles.filter((vehiculo) => {
    const patente = (vehiculo.ppu || '').toLowerCase();
    const marca = (vehiculo.marca || '').toLowerCase();
    const modelo = (vehiculo.modelo || '').toLowerCase();
    const q = search.toLowerCase();
    return patente.includes(q) || marca.includes(q) || modelo.includes(q);
  });

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / itemsPerPage));
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Cambiar página
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Resetear página al buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

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
              <li className="align-self-center breadcrumb-item active" aria-current="page">Ver documentos</li>
            </ol>
          </nav>
        </div>

        <div className="row" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="card-like shadow col p-3 m-3 text-center">
            <h1 style={{
              fontWeight: 700,
              fontSize: '2rem',
              marginBottom: '0.5rem',
              letterSpacing: '1px',
              fontFamily: 'Roboto',
              color: '#0d6efd'
            }}>
              Documentos de tus vehículos
            </h1>
            <div className="col" style={{
              background: 'linear-gradient(90deg, #fbeaf6 0%, #e0e7ff 100%)',
              borderRadius: '14px',
              boxShadow: '0 2px 8px #0001',
              padding: '1.2rem 1rem',
              marginBottom: '1.5rem',
              alignContent: 'center',
              justifyContent: 'center',
              flex: 1,
              width: '50%',
              margin: '0 auto 1.5rem auto',
              // minHeight: 80,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              fontFamily: 'Roboto, Roboto, Arial, sans-serif',
              // height: '100%'
            }}>
              <span style={{
                display: 'inline-block',
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#6D2077',
                marginBottom: 10,
                fontFamily: 'Roboto, Roboto, Arial, sans-serif'
              }} />
              <b>¿Qué puedes hacer aquí?</b>
              <span style={{ fontSize: '1rem', fontWeight: 400 }}>
                Visualiza y descarga los documentos de tus vehículos. Haz clic en los botones de cada fila para acceder al documento correspondiente.
              </span>
            </div>

            {/* Barra de búsqueda */}
            <div className="row mb-3">
              <div className="col-12 col-md-6 mx-auto">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por patente, marca o modelo..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ borderRadius: 8, fontSize: '1rem' }}
                />
              </div>
            </div>

            {/* Lista de vehículos en formato tabla */}
            <div className="row">
              <div className="col">
                <table className="table" style={{ background: "#fff", width: '75%', flex: 1, margin: '0 auto', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
                  <thead style={{ backgroundColor: "#0d6efd", color: "#fff" }}>
                    <tr>
                      <th>Patente</th>
                      <th>Marca</th>
                      <th>Modelo</th>
                      <th style={{ minWidth: 320 }}>Documentos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedVehicles.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center text-muted py-4">
                          No tienes vehículos registrados o no hay resultados para tu búsqueda.
                        </td>
                      </tr>
                    )}
                    {paginatedVehicles.map((vehiculo) => (
                      <tr key={vehiculo.ppu}>
                        <td style={{ fontWeight: 600 }}>{vehiculo.ppu}</td>
                        <td>{vehiculo.marca}</td>
                        <td>{vehiculo.modelo}</td>
                        <td style={{ verticalAlign: 'middle', padding: '0.5rem', justifyContent: 'center', textAlign: 'center', alignItems: 'center', display: 'flex' }}>
                          <div className="d-flex flex-wrap gap-2">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => mostrarDocumento('padron', vehiculo.ppu)}
                              disabled={!vehicleDocs[vehiculo.ppu]}
                            >
                              Padrón
                            </button>
                            <button
                              className="btn btn-outline-success btn-sm"
                              onClick={() => mostrarDocumento('permiso', vehiculo.ppu)}
                              disabled={!vehicleDocs[vehiculo.ppu]}
                            >
                              Permiso
                            </button>
                            <button
                              className="btn btn-outline-warning btn-sm"
                              onClick={() => mostrarDocumento('soap', vehiculo.ppu)}
                              disabled={!vehicleDocs[vehiculo.ppu]}
                            >
                              SOAP
                            </button>
                            <button
                              className="btn btn-outline-info btn-sm"
                              onClick={() => mostrarDocumento('revision', vehiculo.ppu)}
                              disabled={!vehicleDocs[vehiculo.ppu]}
                            >
                              Revisión
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Paginación */}
                <nav className="d-flex justify-content-center align-items-center mt-3">
                  <ul className="pagination mb-0">
                    <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
                      <button className="page-link" onClick={() => goToPage(currentPage - 1)}>
                        &laquo;
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li key={i + 1} className={`page-item${currentPage === i + 1 ? ' active' : ''}`}>
                        <button className="page-link" onClick={() => goToPage(i + 1)}>
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
                      <button className="page-link" onClick={() => goToPage(currentPage + 1)}>
                        &raquo;
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>


          </div>
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

export default function VerDocumentosPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <VerDocumentosContent />
    </Suspense>
  );
}