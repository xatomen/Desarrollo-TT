'use client';
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface PagoInfo {
  ppu: string;
  rut: string;
  valorPermiso: number;
  marca: string;
  modelo: string;
  anio: string;
  color: string;
  tipoVehiculo: string;
  numeroTarjeta: string;
  titular: string;
  correo: string;
  fechaPago: string;
  transactionId?: string;
}

export default function ConfirmacionPago() {
  const router = useRouter();
  const { logout } = useAuth();
  const [pagoInfo, setPagoInfo] = useState<PagoInfo | null>(null);
  const [numeroComprobante, setNumeroComprobante] = useState('');

  useEffect(() => {
    // Obtener datos del pago desde sessionStorage
    const stored = sessionStorage.getItem('pagoInfo');
    if (stored) {
      const data = JSON.parse(stored);
      setPagoInfo(data);
      
      // Generar número de comprobante único
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 10000);
      setNumeroComprobante(`${timestamp}${random}`.slice(-10));
    } else {
      // Si no hay datos de pago, redirigir al home
      router.push('/home');
    }
  }, [router]);

  const handleVolverSistema = () => {
    // Limpiar datos del pago
    sessionStorage.removeItem('pagoInfo');
    router.push('/home');
  };

  const handleCerrarSesion = () => {
    // Limpiar datos del pago y cerrar sesión
    sessionStorage.removeItem('pagoInfo');
    logout();
  };

  if (!pagoInfo) {
    return (
      <ProtectedRoute>
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-vh-100 d-flex align-items-center justify-content-center pt-3" 
           style={{ 
             backgroundColor: '#f8f9fa',
             fontFamily: '"Dosis", sans-serif'
           }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 col-sm-10">
              {/* Tarjeta principal de confirmación */}
              <div className="card border-0 shadow-lg">
                <div className="card-body text-center p-5">
                  {/* Ícono de éxito */}
                  <div className="mb-4">
                    <div className="mx-auto d-flex align-items-center justify-content-center"
                         style={{
                           width: '120px',
                           height: '120px',
                           backgroundColor: '#28a745',
                           borderRadius: '50%'
                         }}>
                      <svg width="60" height="60" fill="white" viewBox="0 0 16 16">
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Título principal */}
                  <h1 className="fw-bold mb-3" 
                      style={{ 
                        fontFamily: '"Dosis", sans-serif',
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        color: '#212529'
                      }}>
                    Pago Exitoso
                  </h1>

                  {/* Texto descriptivo */}
                  <p className="text-muted mb-4" 
                     style={{ 
                       fontFamily: '"Dosis", sans-serif',
                       fontSize: '1.1rem',
                       fontWeight: '400'
                     }}>
                    Puede revisar el Permiso de Circulación obtenido<br />
                    en la aplicación para propietarios
                  </p>

                  {/* Información del vehículo */}
                  <div className="mb-4 p-3 bg-light rounded">
                    <h6 className="text-muted mb-2" 
                        style={{ 
                          fontFamily: '"Dosis", sans-serif',
                          fontSize: '0.875rem',
                          fontWeight: '400'
                        }}>
                      Vehículo pagado
                    </h6>
                    <h4 className="fw-bold mb-1" 
                        style={{ 
                          fontFamily: '"Dosis", sans-serif',
                          fontWeight: '600',
                          color: '#212529'
                        }}>
                      {pagoInfo.ppu}
                    </h4>
                    <small className="text-muted" 
                           style={{ 
                             fontFamily: '"Dosis", sans-serif',
                             fontSize: '0.875rem'
                           }}>
                      {pagoInfo.marca} {pagoInfo.modelo} {pagoInfo.anio} - {pagoInfo.color}
                    </small>
                  </div>

                  {/* Número de comprobante */}
                  <div className="mb-4">
                    <h6 className="text-muted mb-2" 
                        style={{ 
                          fontFamily: '"Dosis", sans-serif',
                          fontSize: '0.875rem',
                          fontWeight: '400'
                        }}>
                      N° de comprobante
                    </h6>
                    <h2 className="fw-bold mb-0" 
                        style={{ 
                          fontFamily: '"Dosis", sans-serif',
                          fontSize: '2rem',
                          fontWeight: '700',
                          color: '#212529',
                          letterSpacing: '2px'
                        }}>
                      {numeroComprobante}
                    </h2>
                  </div>

                  {/* Monto pagado */}
                  <div className="mb-5">
                    <h6 className="text-muted mb-2" 
                        style={{ 
                          fontFamily: '"Dosis", sans-serif',
                          fontSize: '0.875rem',
                          fontWeight: '400'
                        }}>
                      Monto pagado
                    </h6>
                    <h1 className="fw-bold mb-0" 
                        style={{ 
                          fontFamily: '"Dosis", sans-serif',
                          fontSize: '3rem',
                          fontWeight: '700',
                          color: '#212529'
                        }}>
                      ${pagoInfo.valorPermiso.toLocaleString('es-CL')}
                    </h1>
                  </div>

                  {/* Información adicional */}
                  <div className="mb-4 p-3 bg-light rounded">
                    <div className="row text-start">
                      <div className="col-6">
                        <small className="text-muted d-block" 
                               style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.75rem' }}>
                          RUT:
                        </small>
                        <small className="fw-medium" 
                               style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.875rem' }}>
                          {pagoInfo.rut}
                        </small>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block" 
                               style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.75rem' }}>
                          Fecha de pago:
                        </small>
                        <small className="fw-medium" 
                               style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.875rem' }}>
                          {new Date(pagoInfo.fechaPago).toLocaleDateString('es-CL')}
                        </small>
                      </div>
                      <div className="col-6 mt-2">
                        <small className="text-muted d-block" 
                               style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.75rem' }}>
                          Tarjeta:
                        </small>
                        <small className="fw-medium" 
                               style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.875rem' }}>
                          {pagoInfo.numeroTarjeta}
                        </small>
                      </div>
                      <div className="col-6 mt-2">
                        <small className="text-muted d-block" 
                               style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.75rem' }}>
                          Titular:
                        </small>
                        <small className="fw-medium" 
                               style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.875rem' }}>
                          {pagoInfo.titular}
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <button 
                        onClick={handleVolverSistema}
                        className="btn btn-lg w-100 py-3 text-white fw-bold"
                        style={{ 
                          backgroundColor: '#0d6efd',
                          border: 'none',
                          fontFamily: '"Dosis", sans-serif',
                          fontWeight: '600'
                        }}
                      >
                        Volver al sistema
                      </button>
                    </div>
                    <div className="col-md-6">
                      <button 
                        onClick={handleCerrarSesion}
                        className="btn btn-outline-secondary btn-lg w-100 py-3 fw-bold"
                        style={{ 
                          fontFamily: '"Dosis", sans-serif',
                          fontWeight: '600'
                        }}
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información adicional en la parte inferior */}
              <div className="text-center mt-4">
                <p className="text-muted mb-2" 
                   style={{ 
                     fontFamily: '"Dosis", sans-serif',
                     fontSize: '0.875rem'
                   }}>
                  Se ha enviado un comprobante de pago a: <strong>{pagoInfo.correo}</strong>
                </p>
                <small className="text-muted" 
                       style={{ 
                         fontFamily: '"Dosis", sans-serif',
                         fontSize: '0.75rem'
                       }}>
                  Guarde este número de comprobante para futuras consultas
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}