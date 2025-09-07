'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth, getRutFromCookies } from '@/contexts/AuthContext';
import API_CONFIG from '@/config/api';

interface DatosVehiculo {
  // Datos básicos
  ppu: string;
  rut: string;
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
  const nombre_propietario = user?.nombre || '';

  const [datosVehiculo, setDatosVehiculo] = useState<DatosVehiculo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // ✅ Cargar datos desde sessionStorage al montar el componente
  useEffect(() => {
    try {
      const datosGuardados = sessionStorage.getItem('datos_vehiculo_permiso');
      
      if (datosGuardados) {
        const datos: DatosVehiculo = JSON.parse(datosGuardados);
        
        // ✅ Validar que los datos no sean muy antiguos (30 minutos)
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

  // Extraer datos del vehículo para uso directo en el componente
  const ppu = datosVehiculo?.ppu || '';
  const rut = datosVehiculo?.rut || '';
  const valorPermiso = datosVehiculo?.valorPermiso || 0;
  const marca = datosVehiculo?.marca || '';
  const modelo = datosVehiculo?.modelo || '';
  const anioVehiculo = datosVehiculo?.anio || '';
  const color = datosVehiculo?.color || '';
  const tipoVehiculo = datosVehiculo?.tipoVehiculo || '';
  const fechaExpiracionSoap = datosVehiculo?.fechaExpiracionSoap || '';
  const fechaExpiracionRevision = datosVehiculo?.fechaExpiracionRevision || '';
  const fechaInscripcion = datosVehiculo?.fechaInscripcion || '';
  const numMotor = datosVehiculo?.numMotor || '';
  const numChasis = datosVehiculo?.numChasis || '';
  const codigoSii = datosVehiculo?.codigoSii || '';
  const capacidadCarga = datosVehiculo?.capacidadCarga || '';
  const tipoSello = datosVehiculo?.tipoSello || '';
  const tipoCombustible = datosVehiculo?.tipoCombustible || '';
  const cilindrada = datosVehiculo?.cilindrada || '';
  const tasacion = datosVehiculo?.tasacion || '';
  const peso = datosVehiculo?.peso || '';
  const asientos = datosVehiculo?.asientos || '';
  const puertas = datosVehiculo?.puertas || '';
  const transmision = datosVehiculo?.transmision || '';
  const equipamiento = datosVehiculo?.equipamiento || '';
  const revisionTecnica = datosVehiculo?.revisionTecnica || '';
  const soap = datosVehiculo?.soap || '';
  const encargoRobo = datosVehiculo?.encargoRobo || '';
  const multasTransito = datosVehiculo?.multasTransito || '';
  const multasRPI = datosVehiculo?.multasRPI || '';
  const fechaConsulta = datosVehiculo?.fechaConsulta || '';
  const todosDocumentosValidos = datosVehiculo?.todosDocumentosValidos || false;

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    numeroTarjeta: '',
    tipoTarjeta: '',
    codigoSeguridad: '',
    fechaVencimiento: ''
  });

  const [errors, setErrors] = useState({
    nombre: '',
    correo: '',
    numeroTarjeta: '',
    tipoTarjeta: '',
    codigoSeguridad: '',
    fechaVencimiento: ''
  });

  const [showGeneralError, setShowGeneralError] = useState(false);
  const [marcaTarjeta, setMarcaTarjeta] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // ✅ Estado para loading
  const [paymentError, setPaymentError] = useState(''); // ✅ Estado para errores de pago

  // Función para validar email
  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Función para validar número de tarjeta (algoritmo de Luhn)
  const validarNumeroTarjeta = (numero: string) => {
    const numeroLimpio = numero.replace(/\s/g, '');
    if (numeroLimpio.length < 13 || numeroLimpio.length > 19) return false;
    
    let suma = 0;
    let esSegundoDigito = false;
    
    for (let i = numeroLimpio.length - 1; i >= 0; i--) {
      let digito = parseInt(numeroLimpio.charAt(i));
      
      if (esSegundoDigito) {
        digito *= 2;
        if (digito > 9) digito -= 9;
      }
      
      suma += digito;
      esSegundoDigito = !esSegundoDigito;
    }
    
    return suma % 10 === 0;
  };

  // Función para validar fecha de vencimiento
  const validarFechaVencimiento = (fecha: string) => {
    const regex = /^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/;
    if (!regex.test(fecha)) return false;
    
    const [mes, año] = fecha.split('/').map(part => parseInt(part.trim()));
    const fechaActual = new Date();
    const añoCompleto = 2000 + año;
    const fechaTarjeta = new Date(añoCompleto, mes - 1);
    
    return fechaTarjeta > fechaActual;
  };

  // Función para validar código de seguridad
  const validarCodigoSeguridad = (codigo: string) => {
    return /^\d{3,4}$/.test(codigo);
  };

  // Función para detectar la marca de la tarjeta
  const detectarMarcaTarjeta = (numero: string) => {
    const numeroLimpio = numero.replace(/\s/g, '');
    
    if (numeroLimpio.match(/^4/)) {
      return 'Visa';
    } else if (numeroLimpio.match(/^5[1-5]/) || numeroLimpio.match(/^2[2-7]/)) {
      return 'Mastercard';
    } else if (numeroLimpio.match(/^3[47]/)) {
      return 'American Express';
    } else if (numeroLimpio.match(/^6/)) {
      return 'Discover';
    }
    return '';
  };

  // Formatear número de tarjeta con espacios
  const formatearNumeroTarjeta = (valor: string) => {
    const numeroLimpio = valor.replace(/\D/g, '');
    const numeroFormateado = numeroLimpio.replace(/(\d{4})(?=\d)/g, '$1 ');
    return numeroFormateado;
  };

  // Formatear fecha de vencimiento
  const formatearFecha = (valor: string) => {
    const numeroLimpio = valor.replace(/\D/g, '');
    if (numeroLimpio.length >= 3) {
      return numeroLimpio.slice(0, 2) + ' / ' + numeroLimpio.slice(2, 4);
    }
    return numeroLimpio;
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

      case 'numeroTarjeta':
        if (!value.trim()) {
          error = 'Ingrese los números frontales de su tarjeta';
        } else if (!validarNumeroTarjeta(value)) {
          error = 'Número de tarjeta inválido';
        }
        break;

      case 'tipoTarjeta':
        if (!value) {
          error = 'Seleccione el tipo de tarjeta';
        }
        break;

      case 'codigoSeguridad':
        if (!value.trim()) {
          error = 'Ingrese el código de seguridad de su tarjeta';
        } else if (!validarCodigoSeguridad(value)) {
          error = 'Código de seguridad inválido (3-4 dígitos)';
        }
        break;

      case 'fechaVencimiento':
        if (!value.trim()) {
          error = 'Selecciona la fecha de vencimiento de su tarjeta';
        } else if (!validarFechaVencimiento(value)) {
          error = 'Fecha de vencimiento inválida o expirada';
        }
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return error === '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;

    if (name === 'numeroTarjeta') {
      formattedValue = formatearNumeroTarjeta(value);
      const marca = detectarMarcaTarjeta(formattedValue);
      setMarcaTarjeta(marca);
    } else if (name === 'fechaVencimiento') {
      formattedValue = formatearFecha(value);
    } else if (name === 'codigoSeguridad') {
      formattedValue = value.replace(/\D/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Validar el campo en tiempo real
    validateField(name, formattedValue);
    setShowGeneralError(false);
    setPaymentError(''); // ✅ Limpiar errores de pago al escribir
  };

  // ✅ Función para procesar el pago con monto como query parameter
  const procesarPago = async () => {
    try {
      setIsProcessingPayment(true);
      setPaymentError('');

      // Extraer mes y año de la fecha de vencimiento
      const [mesStr, anioStr] = formData.fechaVencimiento.split('/').map(part => part.trim());
      const mes = parseInt(mesStr);
      const anio = parseInt(anioStr);

      // Preparar datos para la API (sin el monto en el body)
      const paymentData = {
        numero_tarjeta: formData.numeroTarjeta.replace(/\s/g, ''), // Remover espacios
        titular: formData.nombre,
        mes_vencimiento: mes,
        anio_vencimiento: anio,
        tipo_tarjeta: formData.tipoTarjeta,
        cvv: parseInt(formData.codigoSeguridad),
        monto_pago: valorPermiso // Monto del permiso de circulación
      };

      // ✅ Construir URL con el monto como query parameter
      const url = `${API_CONFIG.TGR}procesar_pago/`;

      console.log('Enviando datos de pago:', paymentData);
      console.log('URL con monto:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(paymentData),
      });

      console.log('Response status:', response.status);

      if (response.status === 200) {
        // ✅ Pago exitoso - redirigir a confirmación
        const responseData = await response.json();
        console.log('Pago exitoso:', responseData);

        // Opcional: guardar datos del pago en sessionStorage para la página de confirmación
        const pagoInfo = {
          ppu: ppu,
          rut: rut,
          valorPermiso: valorPermiso,
          marca: marca,
          modelo: modelo,
          anio: anioVehiculo,
          color: color,
          tipoVehiculo,
          numeroTarjeta: `****-****-****-${formData.numeroTarjeta.slice(-4)}`,
          titular: formData.nombre,
          correo: formData.correo,
          fechaPago: new Date().toISOString(),
          transactionId: responseData.transaction_id || responseData.id // Si la API devuelve ID de transacción
        };
        sessionStorage.setItem('pagoInfo', JSON.stringify(pagoInfo));

        // Cargar permiso de circulación en la base de datos TGR
        await fetch(`${API_CONFIG.TGR}subir_permiso/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ppu: ppu,
            rut: rut,
            nombre: nombre_propietario,
            fecha_emision: new Date().toISOString().slice(0, 10),
            fecha_expiracion: fechaExpiracionRevision || new Date().toISOString().slice(0, 10),
            valor_permiso: valorPermiso,
            motor: parseInt(numMotor) || 0,
            chasis: numChasis,
            tipo_vehiculo: tipoVehiculo,
            color: color,
            marca: marca,
            modelo: modelo,
            anio: parseInt(anioVehiculo) || 0,
            carga: parseInt(capacidadCarga) || 0,
            tipo_sello: tipoSello,
            combustible: tipoCombustible,
            cilindrada: parseInt(cilindrada) || 0,
            transmision: transmision,
            pts: parseInt(peso) || 0,
            ast: parseInt(asientos) || 0,
            equipamiento: equipamiento,
            codigo_sii: codigoSii,
            tasacion: parseInt(tasacion) || 0
          }),
        });
        // Cargar permiso de circulación en la base de datos local
        await fetch(`${API_CONFIG.BACKEND}emitir_permiso_circulacion/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ppu: ppu,
            rut: rut,
            nombre: nombre_propietario,
            fecha_emision: new Date().toISOString().slice(0, 10),
            fecha_expiracion: fechaExpiracionRevision || new Date().toISOString().slice(0, 10),
            valor_permiso: valorPermiso,
            motor: parseInt(numMotor) || 0,
            chasis: numChasis,
            tipo_vehiculo: tipoVehiculo,
            color: color,
            marca: marca,
            modelo: modelo,
            anio: parseInt(anioVehiculo) || 0,
            carga: parseInt(capacidadCarga) || 0,
            tipo_sello: tipoSello,
            combustible: tipoCombustible,
            cilindrada: parseInt(cilindrada) || 0,
            transmision: transmision,
            pts: parseInt(peso) || 0,
            ast: parseInt(asientos) || 0,
            equipamiento: equipamiento,
            codigo_sii: codigoSii,
            tasacion: parseInt(tasacion) || 0
          }),
        });

        // Redirigir a confirmación
        router.push('/home/confirmacion-pago');
      } else {
        // ✅ Error en el pago - manejar diferentes tipos de error
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: 'Error del servidor' };
        }

        console.error('Error en pago:', errorData);

        // ✅ Determinar el tipo de error específico
        let errorMessage = '';
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else {
          errorMessage = errorData.message || errorData.error || 'Error al procesar el pago. Intente nuevamente.';
        }

        setPaymentError(errorMessage);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setPaymentError('Error de conexión. Intente nuevamente.');
    } finally {
      setIsProcessingPayment(false);
    }
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
    
    // ✅ Procesar el pago
    await procesarPago();
  };

  return (
    <ProtectedRoute>
    <div className="container-fluid px-4 py-4" style={{ fontFamily: '"Dosis", sans-serif' }}>
      <div className="row g-4">
        {/* Columna izquierda - Resumen del vehículo */}
        <div className="col-lg-4 align-self-center">
          <div className="card-like border-0 shadow p-4">
            <div className="card-body text-center p-4">
              <h6 className="text-muted mb-2" style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.875rem', fontWeight: '400' }}>
                Patente a pagar
              </h6>
              <h1 className="display-4 fw-bold mb-3" style={{ fontFamily: '"Dosis", sans-serif', fontWeight: '700' }}>
                {ppu || 'AA BB 11'}
              </h1>

              <div><p className="text-muted mb-1" style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.875rem', fontWeight: '400' }}>Nombre</p>
                <p className="fw-bold text-dark" style={{ fontFamily: '"Dosis", sans-serif', fontSize: '1.25rem', fontWeight: '600' }}>
                  {nombre_propietario || '-'}
                </p>
              </div>


              <div className="mb-3">
                <p className="text-muted mb-1" style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.875rem', fontWeight: '400' }}>RUT</p>
                <p className="fw-bold" style={{ fontFamily: '"Dosis", sans-serif', fontSize: '1.25rem', fontWeight: '600' }}>
                  {rut || '12.345.678-9'}
                </p>
              </div>

              {/* ✅ Mostrar información del vehículo */}
              <div className="mb-3">
                <p className="text-muted mb-1" style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.875rem', fontWeight: '400' }}>Vehículo</p>
                <p className="fw-medium" style={{ fontFamily: '"Dosis", sans-serif', fontSize: '1rem', fontWeight: '500' }}>
                  {marca} {modelo} {anioVehiculo}
                </p>
                <p className="text-muted" style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.75rem' }}>
                  {color} - {tipoVehiculo}
                </p>
              </div>
              
              <div className="mt-4">
                <h6 className="text-muted mb-2" style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.875rem', fontWeight: '400' }}>
                  Valor Permiso de Circulación
                </h6>
                <h2 className="fw-bold mb-0" style={{ fontFamily: '"Dosis", sans-serif', fontWeight: '700', fontSize: '2.5rem' }}>
                  ${valorPermiso.toLocaleString('es-CL')}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Formularios */}
        <div className="col-lg-8">
          {/* ✅ Alerta de error de pago */}
          {paymentError && (
            <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert" style={{ fontFamily: '"Dosis", sans-serif' }}>
              <strong>Error en el pago:</strong> {paymentError}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setPaymentError('')}
              ></button>
            </div>
          )}

          {/* Alerta de error general */}
          {showGeneralError && (
            <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert" style={{ fontFamily: '"Dosis", sans-serif' }}>
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
                    <h5 className="mb-0 fw-bold text-dark" style={{ fontFamily: '"Dosis", sans-serif', fontWeight: '600', fontSize: '1.125rem' }}>
                      Datos de Facturación
                    </h5>
                  </div>
                  <div className="card-body">
                    {/* Nombre */}
                    <div className="mb-3">
                      <label className="form-label fw-medium text-dark" style={{ fontFamily: '"Dosis", sans-serif', fontWeight: '500' }}>
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
                          style={{ fontFamily: '"Dosis", sans-serif' }}
                        />
                      </div>
                      <small className={errors.nombre ? "text-danger" : "text-muted"} style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.75rem' }}>
                        {errors.nombre || "Ingrese el nombre completo que aparece en su tarjeta"}
                      </small>
                    </div>

                    {/* Correo electrónico */}
                    <div className="mb-3">
                      <label className="form-label fw-medium text-dark" style={{ fontFamily: '"Dosis", sans-serif', fontWeight: '500' }}>
                        Correo electrónico {errors.correo && <span className="text-danger">*</span>}
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0" style={{ borderColor: errors.correo ? '#dc3545' : '#ced4da' }}>
                          <svg width="16" height="16" fill="currentColor" className="text-muted" viewBox="0 0 16 16">
                            <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2H2Zm3.708 6.208L1 11.105V5.383l4.708 2.825ZM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2-7-4.2Z"/>
                            <path d="M14.247 14.269c1.01 0 1.587-.857 1.587-2.025v-.21C15.834 10.43 14.64 9 12.52 9h-.035C10.42 9 9 10.36 9 12.432v.214C9 14.82 10.438 16 12.358 16h.044c.594 0 1.018-.074 1.237-.175v-.73c-.245.11-.673.18-1.18.18h-.044c-1.334 0-2.571-.788-2.571-2.655v-.157c0-1.657 1.058-2.724 2.64-2.724h.04c1.535 0 2.484 1.05 2.484 2.326v.118c0 .975-.324 1.39-.639 1.39-.232 0-.41-.148-.41-.42v-2.19h-.906v.569h-.03c-.084-.298-.368-.63-.954-.63-.778 0-1.259.555-1.259 1.4v.528c0 .892.49 1.434 1.26 1.434.471 0 .896-.227 1.014-.643h.043c.118.42.617.648 1.12.648Zm-2.453-1.588v-.227c0-.546.227-.791.573-.791.297 0 .572.192.572.708v.367c0 .573-.253.744-.564.744-.354 0-.581-.215-.581-.8Z"/>
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
                          style={{ fontFamily: '"Dosis", sans-serif' }}
                        />
                      </div>
                      <small className={errors.correo ? "text-danger" : "text-muted"} style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.75rem' }}>
                        {errors.correo || "Ingrese un correo electrónico para recibir el comprobante de pago"}
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos de Tarjeta */}
              <div className="col-12 p-3">
                <div className="card-like shadow">
                  <div className="card-body text-center border-bottom">
                    <h5 className="mb-0 fw-bold text-dark" style={{ fontFamily: '"Dosis", sans-serif', fontWeight: '600', fontSize: '1.125rem' }}>
                      Datos de Tarjeta
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {/* Número de tarjeta */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium text-dark" style={{ fontFamily: '"Dosis", sans-serif', fontWeight: '500' }}>
                          Número de tarjeta {errors.numeroTarjeta && <span className="text-danger">*</span>}
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0" style={{ borderColor: errors.numeroTarjeta ? '#dc3545' : '#ced4da' }}>
                            <svg width="16" height="16" fill="currentColor" className="text-muted" viewBox="0 0 16 16">
                              <path d="M11 5.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1z"/>
                              <path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2zM1 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4z"/>
                            </svg>
                          </span>
                          <input
                            type="text"
                            className={`form-control border-start-0 ${errors.numeroTarjeta ? 'is-invalid border-danger' : ''}`}
                            name="numeroTarjeta"
                            placeholder="1111 2222 3333 4444"
                            value={formData.numeroTarjeta}
                            onChange={handleInputChange}
                            maxLength={19}
                            required
                            disabled={isProcessingPayment}
                            style={{ fontFamily: '"Dosis", sans-serif' }}
                          />
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className={errors.numeroTarjeta ? "text-danger" : "text-muted"} style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.75rem' }}>
                            {errors.numeroTarjeta || "Ingrese los números frontales de su tarjeta"}
                          </small>
                          {marcaTarjeta && (
                            <small className="badge bg-primary" style={{ fontFamily: '"Dosis", sans-serif' }}>{marcaTarjeta}</small>
                          )}
                        </div>
                      </div>

                      {/* Tipo de tarjeta */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium text-dark" style={{ fontFamily: '"Dosis", sans-serif', fontWeight: '500' }}>
                          Tipo de tarjeta {errors.tipoTarjeta && <span className="text-danger">*</span>}
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0" style={{ borderColor: errors.tipoTarjeta ? '#dc3545' : '#ced4da' }}>
                            <svg width="16" height="16" fill="currentColor" className="text-muted" viewBox="0 0 16 16">
                              <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                            </svg>
                          </span>
                          <select
                            className={`form-control border-start-0 ${errors.tipoTarjeta ? 'is-invalid border-danger' : ''}`}
                            name="tipoTarjeta"
                            value={formData.tipoTarjeta}
                            onChange={handleInputChange}
                            required
                            disabled={isProcessingPayment}
                            style={{ fontFamily: '"Dosis", sans-serif' }}
                          >
                            <option value="">Selecciona el tipo de tarjeta</option>
                            <option value="Crédito">Crédito</option>
                            <option value="Débito">Débito</option>
                            <option value="Prepago">Prepago</option>
                          </select>
                        </div>
                        <small className={errors.tipoTarjeta ? "text-danger" : "text-muted"} style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.75rem' }}>
                          {errors.tipoTarjeta || "Seleccione el tipo de tarjeta"}
                        </small>
                      </div>
                    </div>

                    <div className="row">
                      {/* Código de seguridad */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium text-dark" style={{ fontFamily: '"Dosis", sans-serif', fontWeight: '500' }}>
                          Código de seguridad {errors.codigoSeguridad && <span className="text-danger">*</span>}
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0" style={{ borderColor: errors.codigoSeguridad ? '#dc3545' : '#ced4da' }}>
                            <svg width="16" height="16" fill="currentColor" className="text-muted" viewBox="0 0 16 16">
                              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
                            </svg>
                          </span>
                          <input
                            type="text"
                            className={`form-control border-start-0 ${errors.codigoSeguridad ? 'is-invalid border-danger' : ''}`}
                            name="codigoSeguridad"
                            placeholder="123"
                            value={formData.codigoSeguridad}
                            onChange={handleInputChange}
                            maxLength={4}
                            required
                            disabled={isProcessingPayment}
                            style={{ fontFamily: '"Dosis", sans-serif' }}
                          />
                        </div>
                        <small className={errors.codigoSeguridad ? "text-danger" : "text-muted"} style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.75rem' }}>
                          {errors.codigoSeguridad || "Ingrese el código de seguridad de su tarjeta"}
                        </small>
                      </div>

                      {/* Fecha de vencimiento */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium text-dark" style={{ fontFamily: '"Dosis", sans-serif', fontWeight: '500' }}>
                          Fecha de vencimiento {errors.fechaVencimiento && <span className="text-danger">*</span>}
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0" style={{ borderColor: errors.fechaVencimiento ? '#dc3545' : '#ced4da' }}>
                            <svg width="16" height="16" fill="currentColor" className="text-muted" viewBox="0 0 16 16">
                              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                            </svg>
                          </span>
                          <input
                            type="text"
                            className={`form-control border-start-0 ${errors.fechaVencimiento ? 'is-invalid border-danger' : ''}`}
                            name="fechaVencimiento"
                            placeholder="MM / AA"
                            value={formData.fechaVencimiento}
                            onChange={handleInputChange}
                            maxLength={7}
                            required
                            disabled={isProcessingPayment}
                            style={{ fontFamily: '"Dosis", sans-serif' }}
                          />
                        </div>
                        <small className={errors.fechaVencimiento ? "text-danger" : "text-muted"} style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.75rem' }}>
                          {errors.fechaVencimiento || "Selecciona la fecha de vencimiento de su tarjeta"}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* ✅ Botón de pago con loading */}
              <div className="col-12 text-center">
                <div className="d-grid p-3">
                  <button 
                    type="submit"
                    className="btn btn-lg py-3 text-white fw-bold"
                    disabled={isProcessingPayment}
                    style={{ 
                      backgroundColor: isProcessingPayment ? '#6c757d' : '#0d6efd', 
                      border: 'none',
                      fontFamily: '"Dosis", sans-serif',
                      fontWeight: '600',
                      opacity: isProcessingPayment ? 0.7 : 1
                    }}
                  >
                    {isProcessingPayment ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Procesando pago...
                      </>
                    ) : (
                      <>
                        Pagar
                        <span className="ms-2">→</span>
                      </>
                    )}
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