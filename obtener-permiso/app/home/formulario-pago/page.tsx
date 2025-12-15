'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, redirect } from 'next/navigation';
import { useAuth, getRutFromCookies } from '@/contexts/AuthContext';
import API_CONFIG from '@/config/api';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCreditCard, FaMoneyCheckAlt } from 'react-icons/fa';
import { Img } from '@/components/Img';

interface DatosVehiculo {
  // Datos básicos
  ppu: string;
  rut: string;
  nombre: string;
  valorPermiso: number;
  
  // Información del vehículo
  marca: string;
  modelo: string;
  anio: string;
  color: string;
  tipoVehiculo: string;
  
  // Fechas importantes
  fechaExpiracionSoap: string;
  fechaExpiracionRevision: string;
  fechaInscripcion: string;
  
  // Identificadores
  numMotor: string;
  numChasis: string;
  codigoSii: string;
  
  // Características técnicas
  capacidadCarga: string;
  tipoSello: string;
  tipoCombustible: string;
  cilindrada: string;
  tasacion: string;
  peso: string;
  asientos: string;
  puertas: string;
  transmision: string;
  equipamiento: string;
  
  // Estados de validación
  revisionTecnica: string;
  soap: string;
  encargoRobo: string;
  multasTransito: string;
  multasRPI: string;
  
  // Metadatos
  fechaConsulta: string;
  todosDocumentosValidos: boolean;
}

export default function FormularioPago() {
  const router = useRouter();
  const { user } = useAuth();

  const [datosVehiculo, setDatosVehiculo] = useState<DatosVehiculo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // ✅ Cargar datos desde sessionStorage al montar el componente
  useEffect(() => {
    try {
      const datosGuardados = sessionStorage.getItem('datos_vehiculo_permiso');
      if (datosGuardados) {
        const datos: DatosVehiculo = JSON.parse(datosGuardados);
        const fechaConsulta = new Date(datos.fechaConsulta);
        const ahora = new Date();
        const diferenciaMinutos = (ahora.getTime() - fechaConsulta.getTime()) / (1000 * 60);
        if (diferenciaMinutos > 30) {
          setError('Los datos del vehículo han expirado. Por favor, vuelva a realizar las validaciones.');
          sessionStorage.removeItem('datos_vehiculo_permiso');
        } else {
          setDatosVehiculo(datos);
          console.log('Datos del vehículo cargados desde sessionStorage:', datos);
        }
      } else {
        setError('No se encontraron datos del vehículo. Por favor, realice las validaciones primero.');
      }
    } catch (error) {
      console.error('Error cargando datos desde sessionStorage:', error);
      setError('Error al cargar los datos del vehículo.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Al cargar datos del vehículo, también setear nombre y correo si existen en user
  useEffect(() => {
    try {
      const datosGuardados = sessionStorage.getItem('datos_vehiculo_permiso');
      if (datosGuardados) {
        const datos: DatosVehiculo = JSON.parse(datosGuardados);
        setDatosVehiculo(datos);
        setFormData(prev => ({
          ...prev,
          nombre: user?.nombre || '',
          correo: user?.email || ''
        }));
      } else {
        setError('No se encontraron datos del vehículo. Por favor, realice las validaciones primero.');
      }
    } catch (error) {
      console.error('Error cargando datos desde sessionStorage:', error);
      setError('Error al cargar los datos del vehículo.');
    } finally {
      setLoading(false);
    }
  }, [user?.nombre, user?.email]);

  const [formatoPago, setFormatoPago] = useState<{ num_cuotas: number, cuota: number, monto_pago: number } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const formatoPagoGuardado = sessionStorage.getItem('formato_pago');
      if (formatoPagoGuardado) {
        setFormatoPago(JSON.parse(formatoPagoGuardado));
      }
    }
  }, []);

  // Luego usa:
  const numCuotas = formatoPago?.num_cuotas ?? 1;
  const cuota = formatoPago?.cuota ?? 1;
  const montoPago = formatoPago?.monto_pago ?? (datosVehiculo?.valorPermiso || 0);

  // Extraer datos del vehículo para uso directo en el componente
  const ppu = datosVehiculo?.ppu || '';
  const rut = datosVehiculo?.rut || '';
  const nombre_propietario = datosVehiculo?.nombre || 'Usuario';
  const valorPermiso = datosVehiculo?.valorPermiso || 0;
  const marca = datosVehiculo?.marca || '';
  const modelo = datosVehiculo?.modelo || '';
  const anioVehiculo = datosVehiculo?.anio || '';
  const color = datosVehiculo?.color || '';
  const tipoVehiculo = datosVehiculo?.tipoVehiculo || '';

  const [formData, setFormData] = useState({
    nombre: '',
    correo: ''
  });

  const [errors, setErrors] = useState({
    nombre: '',
    correo: ''
  });

  const [showGeneralError, setShowGeneralError] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Función para validar email
  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          error = 'Ingrese el nombre completo que aparece en su tarjeta';
        } else if (value.trim().length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres';
        }
        break;
      case 'correo':
        if (!value.trim()) {
          error = 'Ingrese un correo electrónico para recibir el comprobante de pago';
        } else if (!validarEmail(value)) {
          error = 'Formato de correo electrónico inválido';
        }
        break;
    }
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    return error === '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    validateField(name, value);
    setShowGeneralError(false);
    setPaymentError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validar todos los campos
    const isValidForm = Object.keys(formData).every(key =>
      validateField(key, formData[key as keyof typeof formData])
    );
    if (!isValidForm) {
      setShowGeneralError(true);
      return;
    }
    setShowGeneralError(false);
    // Setear monto_pago en sessionStorage antes de redirigir
    sessionStorage.setItem('monto_pago', valorPermiso.toString());
    // Aquí podrías guardar nombre/correo si lo necesitas en el flujo
    sessionStorage.setItem('nombre_pago', formData.nombre);
    sessionStorage.setItem('correo_pago', formData.correo);
    // Redirigir a Webpay
    router.push('/webpay');
  };

  return (
    <ProtectedRoute>
      <div className="container-fluid px-4 py-4" style={{ fontFamily: '"Roboto", sans-serif' }}>
        {/* Volver atrás y Breadcrumb */}
        <div className="row align-self-center d-flex align-items-center mb-4 px-3">
          <button className="p-2" style={{ backgroundColor: 'white', border: '1px solid #007bff', color: '#007bff', cursor: 'pointer' }} onClick={() => router.back()}>
            <span>← Volver</span>
          </button>
          <nav aria-label="breadcrumb" className="col">
            <ol className="breadcrumb p-0 m-0">
              <li className="align-self-center breadcrumb-item active" aria-current="page">Vehículos</li>
              <li className="align-self-center breadcrumb-item active" aria-current="page">Validación documentos</li>
              <li className="align-self-center breadcrumb-item" aria-current="page">Detalles de pago</li>
              <li className="align-self-center breadcrumb-item active" aria-current="page">Confirmación de pago</li>
            </ol>
          </nav>
        </div>

        <div className="row g-4">
          {/* Columna izquierda - Resumen del vehículo */}
          <div className="col-lg-4 align-self-center">
            <div className="card-like border-0 shadow p-4">
              <div className="card-body text-center p-4">
                <h6 className="text-muted mb-2" style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.875rem', fontWeight: '400' }}>
                  Patente a pagar
                </h6>
                <h1 className="display-4 fw-bold mb-3" style={{ fontFamily: '"Roboto", sans-serif', fontWeight: '700' }}>
                  {ppu || 'AA BB 11'}
                </h1>

                <div><p className="text-muted mb-1" style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.875rem', fontWeight: '400' }}>Nombre</p>
                  <p className="fw-bold text-dark" style={{ fontFamily: '"Roboto", sans-serif', fontSize: '1.25rem', fontWeight: '600' }}>
                    {nombre_propietario || '-'}
                  </p>
                </div>


                <div className="mb-3">
                  <p className="text-muted mb-1" style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.875rem', fontWeight: '400' }}>RUT</p>
                  <p className="fw-bold" style={{ fontFamily: '"Roboto", sans-serif', fontSize: '1.25rem', fontWeight: '600' }}>
                    {rut || '12.345.678-9'}
                  </p>
                </div>

                {/* ✅ Mostrar información del vehículo */}
                <div className="mb-3">
                  <p className="text-muted mb-1" style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.875rem', fontWeight: '400' }}>Vehículo</p>
                  <p className="fw-medium" style={{ fontFamily: '"Roboto", sans-serif', fontSize: '1rem', fontWeight: '500' }}>
                    {marca} {modelo} {anioVehiculo}
                  </p>
                  <p className="text-muted" style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.75rem' }}>
                    {color} - {tipoVehiculo}
                  </p>
                </div>
                
                <div className="mt-4">
                  <h6 className="text-muted mb-2" style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.875rem', fontWeight: '400' }}>
                    Monto a pagar
                  </h6>
                  <h2 className="fw-bold mb-0" style={{ fontFamily: '"Roboto", sans-serif', fontWeight: '700', fontSize: '2.5rem' }}>
                    ${montoPago.toLocaleString('es-CL')}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Formulario */}
          <div className="col-lg-8">
            {/* Información sobre medios de pago */}
            <div className="alert alert-info d-flex align-items-center mb-4" role="alert" style={{ fontFamily: '"Roboto", sans-serif' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#0d6efd" className="me-2" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 3H1v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
              </svg>
              <div>
                <strong>¿Cómo puedes pagar?</strong><br />
                Puedes pagar con tarjetas <b>crédito</b>, <b>débito</b> y <b>prepago</b> de todos los bancos en Chile.<br />
                Si pagas con tarjeta de crédito, puedes elegir pagar en <b>cuotas</b> según las condiciones de tu banco emisor.<br />
                <span className="text-muted" style={{ fontSize: '0.95em' }}>
                  Aceptamos Visa, Mastercard, American Express y otras tarjetas bancarias.
                </span>
              </div>
            </div>

            {/* Alerta de error general */}
            {showGeneralError && (
              <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert" style={{ fontFamily: '"Roboto", sans-serif' }}>
                <strong>Formato inválido y/o datos faltantes</strong>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowGeneralError(false)}
                ></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                {/* Datos de Facturación */}
                <div className="col-12">
                  <div className="card-like border-0 shadow">
                    <div className="card-body text-center border-bottom">
                      <h5 className="mb-0 fw-bold text-dark" style={{ fontFamily: '"Roboto", sans-serif', fontWeight: '600', fontSize: '1.125rem' }}>
                        Datos para enviar comprobante de pago
                      </h5>
                    </div>
                    <div className="card-body">
                      {/* Nombre */}
                      <div className="mb-3">
                        <label className="form-label fw-medium text-dark" style={{ fontFamily: '"Roboto", sans-serif', fontWeight: '500' }}>
                          Nombre {errors.nombre && <span className="text-danger">*</span>}
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0" style={{ borderColor: errors.nombre ? '#dc3545' : '#ced4da' }}>
                            <svg width="16" height="16" fill="currentColor" className="text-muted" viewBox="0 0 16 16">
                              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/>
                            </svg>
                          </span>
                          <input
                            type="text"
                            className={`form-control border-start-0 ${errors.nombre ? 'is-invalid border-danger' : ''}`}
                            name="nombre"
                            placeholder="Ingrese nombre completo"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            required
                            disabled={isProcessingPayment}
                            style={{ fontFamily: '"Roboto", sans-serif' }}
                          />
                        </div>
                        <small className={errors.nombre ? "text-danger" : "text-muted"} style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.75rem' }}>
                          {errors.nombre || "Ingrese su nombre"}
                        </small>
                      </div>

                      {/* Correo electrónico */}
                      <div className="mb-3">
                        <label className="form-label fw-medium text-dark" style={{ fontFamily: '"Roboto", sans-serif', fontWeight: '500' }}>
                          Correo electrónico {errors.correo && <span className="text-danger">*</span>}
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0" style={{ borderColor: errors.correo ? '#dc3545' : '#ced4da' }}>
                            <svg width="16" height="16" fill="currentColor" className="text-muted" viewBox="0 0 16 16">
                              <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2H2Zm3.708 6.208L1 11.105V5.383l4.708 2.825ZM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2-7-4.2Z"/>
                              <path d="M14.247 14.269c1.01 0 1.587-.857 1.587-2.025v-.210C15.834 10.43 14.64 9 12.52 9h-.035C10.42 9 9 10.36 9 12.432v.214C9 14.82 10.438 16 12.358 16h.044c.594 0 1.018-.074 1.237-.175v-.73c-.245.11-.673.18-1.18.18h-.044c-1.334 0-2.571-.788-2.571-2.655v-.157c0-1.657 1.058-2.724 2.64-2.724h.04c1.535 0 2.484 1.05 2.484 2.326v.118c0 .975-.324 1.39-.639 1.39-.232 0-.41-.148-.41-.42v-2.19h-.906v.569h-.03c-.084-.298-.368-.63-.954-.63-.778 0-1.259.555-1.259 1.4v.528c0 .892.49 1.434 1.26 1.434.471 0 .896-.227 1.014-.643h.043c.118.42.617.648 1.12.648Zm-2.453-1.588v-.227c0-.546.227-.791.573-.791.297 0 .572.192.572.708v.367c0 .573-.253.744-.564.744-.354 0-.581-.215-.581-.8Z"/>
                            </svg>
                          </span>
                          <input
                            type="email"
                            className={`form-control border-start-0 ${errors.correo ? 'is-invalid border-danger' : ''}`}
                            name="correo"
                            placeholder="ejemplo@ejemplo.com"
                            value={formData.correo}
                            onChange={handleInputChange}
                            required
                            disabled={isProcessingPayment}
                            style={{ fontFamily: '"Roboto", sans-serif' }}
                          />
                        </div>
                        <small className={errors.correo ? "text-danger" : "text-muted"} style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.75rem' }}>
                          {errors.correo || "Ingrese un correo electrónico para recibir el comprobante de pago"}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Botón de pago */}
                <div className="col-12 text-center">
                  <div className="d-grid p-3">
                    <button
                      className="btn border-0"
                      type="submit"
                      disabled={isProcessingPayment}
                      style={{
                        backgroundColor: '#f7bc3eff',
                        color: 'black',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        borderRadius: '60px',
                        padding: '20px 40px',
                        cursor: isProcessingPayment ? 'not-allowed' : 'pointer',
                        opacity: isProcessingPayment ? 0.7 : 1,
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        transition: 'background-color 0.3s ease',
                        fontFamily: '"Roboto", sans-serif'
                      }}
                    >
                      Pagar con
                      <Img
                        src="/img/webpay-logo-nofondo.png"
                        alt="Pagar con OnePay"
                        className="img-fluid"
                        style={{
                          maxWidth: '150px',
                          height: 'auto',
                          opacity: isProcessingPayment ? 0.7 : 1
                        }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}