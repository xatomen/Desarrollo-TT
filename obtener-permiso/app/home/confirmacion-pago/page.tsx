'use client';
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect, useRef, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import API_CONFIG from "@/config/api";

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
  resultadoPago?: 'exitoso' | 'fallido';
}

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

interface PermisoCirculacionPDFProps {
  ppu: string;
}

interface PermisoCirculacionDatos {
  ppu: string;
  rut: string;
  nombre: string;
  fecha_emision: string;
  fecha_expiracion: string;
  valor_permiso: number;
  motor: number;
  chasis: string;
  tipo_vehiculo: string;
  color: string;
  marca: string;
  modelo: string;
  anio: number;
  carga: number;
  tipo_sello: string;
  combustible: string;
  cilindrada: number;
  transmision: string;
  pts: number;
  ast: number;
  equipamiento: string;
  codigo_sii: string;
  tasacion: number;
  vigencia: boolean;
}

const PermisoCirculacionPDF = forwardRef<HTMLDivElement, PermisoCirculacionPDFProps>((props , ref) => {
  // Hacer get al endpoint API_CONFIG.BACK/consultar_permiso_circulacion/{ppu} para obtener los datos del permiso
  const router = useRouter();
  const { user } = useAuth();
  const [datos, setDatos] = useState<PermisoCirculacionDatos | null>(null);
  const [loading, setLoading] = useState(true);
  const permisoRef = useRef<HTMLDivElement>(null);
  const [datosVehiculo, setDatosVehiculo] = useState<DatosVehiculo | null>(null);

  console.log("PPU recibido en props:", props.ppu);

  useEffect(() => {
    if (props.ppu) {
      // Hacer get al endpoint API_CONFIG.BACK/consultar_permiso_circulacion/{ppu} para obtener los datos del permiso
      const fetchData = async () => {
        try {
          const response = await fetch(`${API_CONFIG.BACKEND}consultar_permiso_circulacion/${props.ppu}`);
          const result = await response.json();
          setDatos(result);
          console.log("Datos del permiso:", result);
        } catch (error) {
          console.error("Error fetching payment info:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [props.ppu]);

  const handleDownloadPDF = async () => {
    if (permisoRef.current) {
      const element = permisoRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`permiso_circulacion_${props.ppu}.pdf`);
    }
  };

  return (
    <div
      ref={ref}
      style={{
        width: '1400px',
        height: 'auto',
        background: 'linear-gradient(135deg, #cfe8fdff, #e5d8ffff)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="pb-3">
        <img src="/img/tupermiso/logo-texto-permiso.svg" style={{ height: '25px' }} />
      </div>
      <div
        style={{
          background: 'center/15% url(/img/tupermiso/marca-agua-simple.png)',
        }}
      >
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)', padding: '10px' }}>
          {/* Inicio permiso */}
          {/* Información Contribuyente */}
          <div className="row m-0 p-2"
            style={{
              border: '2px dashed #dee2e6',
            }}
          >
            <p className="col m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Información Contribuyente</strong></p>
            <p className="col m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Nombre</strong> {datos?.nombre}</p>
            <p className="col m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>RUT</strong> {datos?.rut?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</p>
          </div>
          
          <div className="row m-0 p-0">

            {/* Información Vehículo */}
            <div className="col-8 m-0 p-0"
              style={{
                border: '2px dashed #dee2e6',
              }}
            >
              <div className="pt-2">
                <p className="text-center m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Información Vehículo</strong></p>
              </div>
              <div className="row m-0 p-2">
                <div className="col m-0 p-0">
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>PPU</strong> {datos?.ppu}</p>
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Marca</strong> {datos?.marca}</p>
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Modelo</strong> {datos?.modelo}</p>
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Año</strong> {datos?.anio}</p>
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Color</strong> {datos?.color}</p>
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Tipo de Vehículo</strong> {datos?.tipo_vehiculo}</p>
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Número Motor</strong> {datos?.motor}</p>
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Número Chasis</strong> {datos?.chasis}</p>
                </div>
                <div className="col m-0 p-0">
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Puertas</strong> {datos?.pts}</p>
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Asientos</strong> {datos?.ast}</p>
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Cilindrada</strong> {datos?.cilindrada}</p>
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Capacidad Carga</strong> {datos?.carga}</p>
                  {/* <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Peso</strong> {datos?.peso}</p> */}
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Tipo Combusatible</strong> {datos?.combustible}</p>
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Tipo Sello</strong> {datos?.tipo_sello}</p>
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Transmisión</strong> {datos?.transmision}</p>
                </div>
              </div>
            </div>
            
            {/* Información Pago */}
            <div className="col-4 m-0 p-0"
              style={{
                border: '2px dashed #dee2e6',
              }}
            >
              <div className="pt-2">
                <p className="text-center m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Información Pago</strong></p>
              </div>
              <div className="row m-0 p-2">
                <div className="col m-0 p-0">
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Número Comprobante</strong> -</p>
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Tasación</strong> ${datos?.tasacion.toLocaleString('es-CL')}</p>
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Código SII</strong> {datos?.codigo_sii ? datos.codigo_sii : 'No disponible'}</p>
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Valor Permiso</strong> ${datos?.valor_permiso.toLocaleString('es-CL')}</p>
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Fecha Pago</strong> {datos?.fecha_emision}</p>
                  <p className="m-0 p-0" style={{ fontFamily: 'Dosis, sans-serif' }}><strong>Fecha Vencimiento</strong> {datos?.fecha_expiracion}</p>
                </div>
                <div className="col m-0 p-2 text-center justify-content-center align-items-center">
                  <img src="/img/tupermiso/logo-cert.png" style={{ width: '75%', height: 'auto' }} className="d-flex text-center justify-content-center align-items-center" />
                </div>
              </div>
            </div>
          </div>
          {/* Fin permiso */}
        </div>
      </div>
    </div>
  );
});

export default function ConfirmacionPago() {
  const router = useRouter();
  const { logout } = useAuth();
  const [pagoInfo, setPagoInfo] = useState<PagoInfo | null>(null);
  const [numeroComprobante, setNumeroComprobante] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  // Datos vehículo desde datos_vehiculo_permiso en sessionStorage
  const [datosVehiculo, setDatosVehiculo] = useState<DatosVehiculo | null>(null);
  // Cargar datos del vehículo desde sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('datos_vehiculo_permiso');
    if (stored) {
      const data = JSON.parse(stored);
      setDatosVehiculo(data);
      console.log('Datos vehículo cargados:', data);
    }
  }, []);

  useEffect(() => {
    // Obtener datos del pago desde sessionStorage
    const stored = sessionStorage.getItem('pago_info');
    if (stored) {
      const data = JSON.parse(stored);
      setPagoInfo(data);
      
      // Generar número de comprobante único
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 10000);
      setNumeroComprobante(data.transactionId ? data.transactionId.toString() : `${timestamp}${random}`);
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

  // Si el resultado del pago es correcto, cargar permiso de circulación
  const emitirPermiso = async () => {
    if (pagoInfo?.resultadoPago === 'exitoso') {
      try {
        // Obtener datos del vehículo desde sessionStorage
        const datosString = sessionStorage.getItem('datos_vehiculo_permiso');
        const datos = datosString ? JSON.parse(datosString) : null;
        
        if (!datos) return;
        
        // Cargar permiso de circulación en la base de datos TGR
        await fetch(`${API_CONFIG.TGR}subir_permiso/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ppu: datos.ppu,
            rut: datos.rut,
            nombre: datos.nombre,
            fecha_emision: new Date().toISOString().slice(0, 10),
            fecha_expiracion: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
            valor_permiso: datos.valorPermiso,
            motor: parseInt(datos.numMotor) || 0,
            chasis: datos.numChasis,
            tipo_vehiculo: datos.tipoVehiculo,
            color: datos.color,
            marca: datos.marca,
            modelo: datos.modelo,
            anio: parseInt(datos.anio) || 0,
            carga: parseInt(datos.capacidadCarga) || 0,
            tipo_sello: datos.tipoSello,
            combustible: datos.tipoCombustible,
            cilindrada: parseInt(datos.cilindrada) || 0,
            transmision: datos.transmision,
            pts: parseInt(datos.puertas) || 0, // Fixed: was using datos.peso instead of datos.puertas
            ast: parseInt(datos.asientos) || 0,
            equipamiento: datos.equipamiento || '',
            codigo_sii: datos.codigoSII || '',
            tasacion: parseInt(datos.tasacion) || 0
          }),
        });
        
        // Cargar permiso de circulación en la base de datos local
        await fetch(`${API_CONFIG.BACKEND}emitir_permiso_circulacion/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ppu: datos.ppu,
            rut: datos.rut,
            nombre: datos.nombre,
            fecha_emision: new Date().toISOString().slice(0, 10),
            fecha_expiracion: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
            valor_permiso: datos.valorPermiso,
            motor: parseInt(datos.numMotor) || 0,
            chasis: datos.numChasis,
            tipo_vehiculo: datos.tipoVehiculo,
            color: datos.color,
            marca: datos.marca,
            modelo: datos.modelo,
            anio: parseInt(datos.anio) || 0,
            carga: parseInt(datos.capacidadCarga) || 0,
            tipo_sello: datos.tipoSello,
            combustible: datos.tipoCombustible,
            cilindrada: parseInt(datos.cilindrada) || 0,
            transmision: datos.transmision,
            pts: parseInt(datos.puertas) || 0, // Fixed: was using datos.peso instead of datos.puertas
            ast: parseInt(datos.asientos) || 0,
            equipamiento: datos.equipamiento || '',
            codigo_sii: datos.codigoSII || '',
            tasacion: parseInt(datos.tasacion) || 0
          }),
        });

        // Emitir nuevo comprobante en BACKEND/mis_permisos_emitidos/
        await fetch(`${API_CONFIG.BACKEND}mis_permisos_emitidos/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ppu: datos.ppu,
            rut: pagoInfo.rut,
            valor_permiso: datos.valorPermiso,
            fecha_emision: new Date(),
            tarjeta: pagoInfo.numeroTarjeta.slice(-4),
          }),
        });

      } catch (error) {
        console.error('Error al emitir el permiso:', error);
      }
    }
  };

  useEffect(() => {
    if (pagoInfo?.resultadoPago === 'exitoso') {
      console.log('Emitiendo permiso de circulación...');
      emitirPermiso();
    }
  }, [pagoInfo]);

  // Si el resultasdo del pago es correcto, permitir descargar PDF

  const handleDescargarPDF = async () => {
    console.log('Entrando a handleDescargarPDF');
    console.log('pdfRef.current:', pdfRef.current);
    if (!pdfRef.current) return;
    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`permiso_circulacion_${pagoInfo?.ppu || 'vehiculo'}.pdf`);
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
      {/* Volver atrás y Breadcrumb */}
      <div className="row align-self-center d-flex align-items-center mb-4 px-3">
        <button className="p-2" style={{ backgroundColor: 'white', border: '1px solid #bebebeff', color: '#bebebeff', cursor: 'pointer' }} onClick={() => router.back()} disabled={true}>
          <span>← Volver</span>
        </button>
        <nav aria-label="breadcrumb" className="col">
          <ol className="breadcrumb p-0 m-0">
            <li className="align-self-center breadcrumb-item active" aria-current="page">Vehículos</li>
            <li className="align-self-center breadcrumb-item active" aria-current="page">Validación documentos</li>
            <li className="align-self-center breadcrumb-item active" aria-current="page">Detalles de pago</li>
            <li className="align-self-center breadcrumb-item" aria-current="page">Confirmación de pago</li>
          </ol>
        </nav>
      </div>
      <div className="min-vh-100 d-flex align-items-center justify-content-center py-3" 
        style={{ 
        //  backgroundColor: '#f8f9fa',
          fontFamily: '"Roboto", sans-serif'
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 col-sm-10">
              {/* Tarjeta principal de confirmación */}
              <div className="card-like border-0 shadow" ref={cardRef}>
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
                        fontFamily: '"Roboto", sans-serif',
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        color: '#212529'
                      }}>
                    Pago Exitoso
                  </h1>

                  {/* Texto descriptivo */}
                  <p className="text-muted mb-4" 
                     style={{ 
                       fontFamily: '"Roboto", sans-serif',
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
                          fontFamily: '"Roboto", sans-serif',
                          fontSize: '0.875rem',
                          fontWeight: '400'
                        }}>
                      Vehículo pagado
                    </h6>
                    <h4 className="fw-bold mb-1" 
                        style={{ 
                          fontFamily: '"Roboto", sans-serif',
                          fontWeight: '600',
                          color: '#212529'
                        }}>
                      {datosVehiculo?.ppu}
                    </h4>
                    <small className="text-muted" 
                           style={{ 
                             fontFamily: '"Roboto", sans-serif',
                             fontSize: '0.875rem'
                           }}>
                      {datosVehiculo?.marca} {datosVehiculo?.modelo} {datosVehiculo?.anio} - {datosVehiculo?.color}
                    </small>
                  </div>

                  {/* Número de comprobante */}
                  <div className="mb-4">
                    <h6 className="text-muted mb-2" 
                        style={{ 
                          fontFamily: '"Roboto", sans-serif',
                          fontSize: '0.875rem',
                          fontWeight: '400'
                        }}>
                      N° de comprobante
                    </h6>
                    <h2 className="fw-bold mb-0" 
                        style={{ 
                          fontFamily: '"Roboto", sans-serif',
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
                          fontFamily: '"Roboto", sans-serif',
                          fontSize: '0.875rem',
                          fontWeight: '400'
                        }}>
                      Monto pagado
                    </h6>
                    <h1 className="fw-bold mb-0" 
                        style={{ 
                          fontFamily: '"Roboto", sans-serif',
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
                               style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.75rem' }}>
                          RUT:
                        </small>
                        <small className="fw-medium" 
                               style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.875rem' }}>
                          {pagoInfo.rut}
                        </small>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block" 
                               style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.75rem' }}>
                          Fecha de pago:
                        </small>
                        <small className="fw-medium" 
                               style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.875rem' }}>
                          {new Date(pagoInfo.fechaPago).toLocaleDateString('es-CL')}
                        </small>
                      </div>
                      <div className="col-6 mt-2">
                        <small className="text-muted d-block" 
                               style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.75rem' }}>
                          Tarjeta:
                        </small>
                        <small className="fw-medium" 
                               style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.875rem' }}>
                          **** **** **** {pagoInfo.numeroTarjeta.slice(-4)}
                        </small>
                      </div>
                      <div className="col-6 mt-2">
                        <small className="text-muted d-block" 
                               style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.75rem' }}>
                          Titular:
                        </small>
                        <small className="fw-medium" 
                               style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.875rem' }}>
                          {pagoInfo.titular}
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="row g-3">
                    <div className="col-md-4">
                      <button
                        onClick={() => {
                          console.log("Descargando PDF del permiso de circulación...");
                          console.log("Placa del vehículo:", datosVehiculo?.ppu);
                          handleDescargarPDF();
                        }}
                        className="btn btn-lg w-100 py-3 text-white fw-bold"
                        style={{
                          backgroundColor: '#33b158ff',
                          border: 'none',
                          fontFamily: '"Roboto", sans-serif',
                          fontWeight: '600'
                        }}
                      >
                        Descargar Permiso
                      </button>
                    </div>
                    <div className="col-md-4">
                      <button 
                        onClick={handleVolverSistema}
                        className="btn btn-lg w-100 py-3 text-white fw-bold"
                        style={{ 
                          backgroundColor: '#0d6efd',
                          border: 'none',
                          fontFamily: '"Roboto", sans-serif',
                          fontWeight: '600'
                        }}
                      >
                        Volver al sistema
                      </button>
                    </div>
                    <div className="col-md-4">
                      <button 
                        onClick={handleCerrarSesion}
                        className="btn btn-outline-secondary btn-lg w-100 py-3 fw-bold"
                        style={{ 
                          fontFamily: '"Roboto", sans-serif',
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
                     fontFamily: '"Roboto", sans-serif',
                     fontSize: '0.875rem'
                   }}>
                  Se ha enviado un comprobante de pago a: <strong>{pagoInfo.correo}</strong>
                </p>
                <small className="text-muted" 
                       style={{ 
                         fontFamily: '"Roboto", sans-serif',
                         fontSize: '0.75rem'
                       }}>
                  Guarde este número de comprobante para futuras consultas
                </small>
              </div>
            </div>
          </div>
          {/* Renderiza el PDF oculto para la descarga */}
          <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
            {datosVehiculo?.ppu && <PermisoCirculacionPDF ppu={datosVehiculo?.ppu ? datosVehiculo.ppu : ''} ref={pdfRef} />}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}