'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import API_CONFIG from '@/config/api';
import Link from 'next/dist/client/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';

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

type EstadoValidacion = 'Vigente' | 'No' | 'Si' | 'Desconocido';
type DocumentoValidacion = {
  nombre: string;
  estado: EstadoValidacion;
};

function EstadoChip({ estado, documento }: { estado: EstadoValidacion; documento: string }) {
  // Para estos documentos, "No" es positivo (verde)
  const documentosNegativosPositivos = ['Encargo por Robo', 'Multas de Tránsito', 'Multas RPI'];
  const esDocumentoNegativo = documentosNegativosPositivos.includes(documento);
  
  // Determinar si debe ser verde
  const esPositivo = estado === 'Vigente' || (estado === 'No' && esDocumentoNegativo);
  
  return (
    <span 
      className="badge rounded-pill px-3 py-2 fw-medium text-white"
      style={{ 
        backgroundColor: esPositivo ? '#2E7D32' : '#CD1E2C',
        fontFamily: '"Roboto", sans-serif'
      }}
    >
      {estado}
    </span>
  );
}

function ValidacionesPagoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [modalDocumento, setModalDocumento] = useState<{ open: boolean, doc?: DocumentoValidacion }>(
    { open: false }
  );

  const [ppu, setPpu] = useState<string | null>(null);
  const [rut, setRut] = useState<string | null>(null);

  // Recuperar PPU del sessionStorage
  useEffect(() => {
    const storedPpu = sessionStorage.getItem('ppu');
    const storedRut = sessionStorage.getItem('rut');
    setPpu(storedPpu);
    setRut(storedRut);
  }, []);
  
  // Valor permiso
  const [valorPermiso, setValorPermiso] = useState<number | null>(null);
  const [mensajeAtraso, setMensajeAtraso] = useState<string>('');

  // Estados para cada API
  const [revisionTecnica, setRevisionTecnica] = useState<EstadoValidacion>('Desconocido');
  const [soap, setSoap] = useState<EstadoValidacion>('Desconocido');

  const [loading, setLoading] = useState(true);

  // Datos de multas de tránsito SRCeI
  const [multasTransito, setMultasTransito] = useState<EstadoValidacion>('Desconocido');
  const [detallesMultasTransito, setDetallesMultasTransito] = useState<any[]>([]);

  // Datos de multas RPI
  const [multasRPI, setMultasRPI] = useState<EstadoValidacion>('Desconocido');
  const [detallesMultasRPI, setDetallesMultasRPI] = useState<any[]>([]);

  // Estados para información del vehículo
  const [rutPropietario, setRutPropietario] = useState<string>('-');
  const [nombrePropietario, setNombrePropietario] = useState<string>('-');
  const [fechaInscripcion, setFechaInscripcion] = useState<string>('-');
  const [numMotor, setNumMotor] = useState<string>('-');
  const [numChasis, setNumChasis] = useState<string>('-');
  const [tipoVehiculo, setTipoVehiculo] = useState<string>('-');
  const [color, setColor] = useState<string>('-');
  const [marca, setMarca] = useState<string>('-');
  const [modelo, setModelo] = useState<string>('-');
  const [anio, setAnio] = useState<string>('-');
  const [capacidadCarga, setCapacidadCarga] = useState<string>('-');
  const [tipoSello, setTipoSello] = useState<string>('-');
  const [tipoCombustible, setTipoCombustible] = useState<string>('-');
  const [codigoSii, setCodigoSii] = useState<string>('-');

  // Permiso de circulación
  const [fechaEmisionPermiso, setFechaEmisionPermiso] = useState<Date | string | null>(null);
  const [fechaVencimientoPermiso, setFechaVencimientoPermiso] = useState<Date | string | null>(null);
  const [permisoJson, setPermisoJson] = useState<any>(null);

  // Obtener desde consultar valor permiso
  const [cilindrada, setCilindrada] = useState<string>('-');
  const [tasacion, setTasacion] = useState<string>('-');
  const [peso, setPeso] = useState<string>('-');
  const [asientos, setAsientos] = useState<string>('-');
  const [puertas, setPuertas] = useState<string>('-');
  const [transmision, setTransmision] = useState<string>('-');
  const [equipamiento, setEquipamiento] = useState<string>('-');
  
  // Datos encargo por robo
  const [encargoRobo, setEncargoRobo] = useState<EstadoValidacion>('Desconocido');
  const [encargoPatenteDelantera, setEncargoPatenteDelantera] = useState<boolean | null>(null);
  const [encargoPatenteTrasera, setEncargoPatenteTrasera] = useState<boolean | null>(null);
  const [encargoVin, setEncargoVin] = useState<boolean | null>(null);
  const [encargoMotor, setEncargoMotor] = useState<boolean | null>(null);

  // Datos SOAP
  const [numPoliza, setNumPoliza] = useState<string>('-');
  const [aseguradora, setAseguradora] = useState<string>('-'); // Esta por ahora no se utilizará
  const [fechaEmisionSoap, setFechaEmisionSoap] = useState<string>('-');
  const [fechaExpiracionSoap, setFechaExpiracionSoap] = useState<string>('-');
  const [primaSoap, setPrimaSoap] = useState<string>('-');

  // Datos revisión técnica
  const [fechaRevision, setFechaRevision] = useState<string>('-');
  const [codigoPlanta, setCodigoPlanta] = useState<string>('-');
  const [planta, setPlanta] = useState<string>('-');
  const [estadoRevision, setEstadoRevision] = useState<string>('-');
  const [numCertificado, setNumCertificado] = useState<string>('-');
  const [fechaExpiracionRevision, setFechaExpiracionRevision] = useState<string>('-');
  // Caso - Es para indicar si es renovación o primera obtención del permiso
  const [caso, setCaso] = useState<string | null>(null);

  // Permiso del año actual pagado?
  const [permisoAnioActualPagado, setPermisoAnioActualPagado] = useState<string>('');

  // Crear documentos dinámicamente basado en los estados
  const documentos: DocumentoValidacion[] = [
    { nombre: 'Permiso de Circulación', estado: permisoJson && permisoJson.vigencia === true ? 'Vigente' : 'No Vigente' },
    { nombre: 'Revisión Técnica', estado: revisionTecnica },
    { nombre: 'SOAP (Año vigente)', estado: soap },
    { nombre: 'Encargo por Robo', estado: encargoRobo },
    { nombre: 'Multas de Tránsito', estado: multasTransito },
    { nombre: 'Multas RPI', estado: multasRPI },
  ];

  useEffect(() => {
    if (!ppu) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Obtener fecha de inscripción desde el padrón
        try {
          const inscripcionRes = await fetch(`${API_CONFIG.BACKEND}consultar_patente/${ppu}`);
          const inscripcionData = await inscripcionRes.json();
          console.log('Fecha de inscripción:', inscripcionData.fecha_inscripcion);
          setFechaInscripcion(inscripcionData.fecha_inscripcion || '-');
          setTipoVehiculo(inscripcionData.tipo_vehiculo || '-');
          setMarca(inscripcionData.marca || '-');
          setModelo(inscripcionData.modelo || '-');
          setAnio(inscripcionData.anio || '-');
          setColor(inscripcionData.color || '-');
          setNumChasis(inscripcionData.num_chasis || '-');
          setNumMotor(inscripcionData.num_motor || '-');
          setRutPropietario(inscripcionData.rut || '-');
          setNombrePropietario(inscripcionData.nombre || '-');
          console.log("Rut propietario:", inscripcionData.rut);
          console.log("Nombre propietario:", inscripcionData.nombre);
        } catch (error) {
          console.error('Error fetching fecha inscripcion:', error);
          setFechaInscripcion('Desconocido');
        }

        // Obtener fecha de emisión permiso de circulación
        try {
          const permisoRes = await fetch(`${API_CONFIG.BACKEND}consultar_permiso_circulacion/${ppu}`);
          const permisoData = await permisoRes.json();
          setFechaEmisionPermiso(permisoData.fecha_emision || '-');
          console.log('Fecha emisión permiso:', permisoData.fecha_emision);
          setFechaVencimientoPermiso(permisoData.fecha_expiracion || '-');
          // Obtener año de emisión del permiso
          const anioEmisionPermiso = permisoData.fecha_emision ? new Date(permisoData.fecha_emision).getFullYear() : null;
          console.log('Año emisión permiso:', anioEmisionPermiso);
          if (anioEmisionPermiso == new Date().getFullYear()) {
            setPermisoAnioActualPagado(`Permiso de circulación del año ${anioEmisionPermiso} pagado`);
            // MOSTRAR MENSAJE ALMACENADO ARRIBA DE PROCEDER AL PAGO SI EL AÑO ACTUAL YA ESTÁ PAGADO ADEMAS DE BLOQUEAR EL BOTÓN
          }
        } catch (error) {
          console.error('Error fetching fecha emision permiso:', error);
          // setPermisoAnioActualPagado('Desconocido');
        }

        // Obtener Revisión Técnica
        try {
          const revisionRes = await fetch(`${API_CONFIG.BACKEND}consultar_revision_tecnica/${ppu}`);
          const revisionData = await revisionRes.json();
          setRevisionTecnica(revisionData.vigencia || 'Desconocido');
          setFechaRevision(revisionData.fecha_revision || '-');
          setCodigoPlanta(revisionData.codigo_planta || '-');
          setPlanta(revisionData.planta || '-');
          setEstadoRevision(revisionData.estado || '-');
          setNumCertificado(revisionData.nom_certificado || '-');
          // Obtener fecha de expiración de revisión técnica
          setFechaExpiracionRevision(revisionData.fecha_vencimiento || '-');
        } catch (error) {
          console.error('Error fetching revision tecnica:', error);
          setRevisionTecnica('Desconocido');
        }

        // Obtener SOAP
        try {
          const soapRes = await fetch(`${API_CONFIG.BACKEND}consultar_soap/${ppu}`);
          const soapData = await soapRes.json();
          setSoap(soapData.vigencia_permiso || 'Desconocido');
          setNumPoliza(soapData.num_poliza || '-');
          setAseguradora(soapData.compania || '-');
          setFechaEmisionSoap(soapData.rige_desde || '-');
          setPrimaSoap(soapData.prima ? `$${Number(soapData.prima).toLocaleString('es-CL')}` : '-');
          console.log('SOAP data:', soapData);
          // Obtener fecha de expiración SOAP
          setFechaExpiracionSoap(soapData.rige_hasta || '-');
        } catch (error) {
          console.error('Error fetching SOAP:', error);
          setSoap('Desconocido');
        }

        // Obtener Encargo por Robo
        try {
          const roboRes = await fetch(`${API_CONFIG.BACKEND}consultar_encargo/${ppu}`);
          const roboData = await roboRes.json();
          console.log('Encargo por robo data:', roboData);
          setEncargoPatenteDelantera(roboData.patente_delantera);
          setEncargoPatenteTrasera(roboData.patente_trasera);
          setEncargoVin(roboData.vin);
          setEncargoMotor(roboData.motor);
          if (roboData.encargo) {
            if (roboData.encargo == 1) {
              setEncargoRobo('Si');
            } else if (roboData.encargo == 0) {
              setEncargoRobo('No');
            }
          } else {
            setEncargoRobo('No');
          }
        } catch (error) {
          console.error('Error fetching encargo robo:', error);
          setEncargoRobo('Desconocido');
        }

        // Obtener Multas de Tránsito
        try {
          const transitoRes = await fetch(`${API_CONFIG.BACKEND}consultar_multas/${ppu}`);
          const transitoData = await transitoRes.json();
          console.log('Multas de tránsito data:', transitoData);
          if (transitoData.total_multas != 0) {
            setMultasTransito('Si');
            setDetallesMultasTransito(transitoData.multas || []);
          } else {
            setMultasTransito('No');
            setDetallesMultasTransito([]);
          }
        } catch (error) {
          console.error('Error fetching multas transito:', error);
          setMultasTransito('Desconocido');
        }

        // Obtener Multas RPI
        try {
          // Esperar a que se recupere el RUT del propietario
          if (!rutPropietario || rutPropietario === '-') {
            await new Promise(resolve => {
              const interval = setInterval(() => {
                if (rutPropietario && rutPropietario !== '-') {
                  clearInterval(interval);
                  resolve(null);
                }
              }, 100);
            });
          }
          const rpiRes = await fetch(`${API_CONFIG.BACKEND}consultar-multas-rpi/${rutPropietario}`);
          const rpiData = await rpiRes.json();
          console.log('Multas RPI data:', rpiData);
          if (rpiData.cantidad_multas != 0) {
            setMultasRPI('Si');
            setDetallesMultasRPI(rpiData.multas || []);
          } else {
            setMultasRPI('No');
            setDetallesMultasRPI([]);
          }
        } catch (error) {
          console.error('Error fetching multas RPI:', error);
          setMultasRPI('Desconocido');
        }

        // ✅ Mover el fetch de información del vehículo aquí
        try {
          const vehiculoRes = await fetch(`${API_CONFIG.BACKEND}consultar_permiso_circulacion/${ppu}`);
          const vehiculoData = await vehiculoRes.json();
          console.log('Vehículo data:', vehiculoData);
          
          // Actualizar todos los estados de información del vehículo
          // setFechaInscripcion(vehiculoData.fecha_inscripcion || '-');
          setCodigoSii(vehiculoData.codigo_sii || '-');
          if (vehiculoRes.ok) {
            // setCapacidadCarga(vehiculoData.capacidad_carga || '-');
            setTipoSello(vehiculoData.tipo_sello);
            setCaso("Renovación");
          } else {
            console.log('Buscando tipo de sello desde la factura...');
            const inscripcionRes = await fetch(`${API_CONFIG.BACKEND}consultar_patente/${ppu}`);
            const inscripcionData = await inscripcionRes.json();
            // Recuperamos tipo de sello desde la factura
            const facturaRes = await fetch(`${API_CONFIG.SII}factura_venta_num_chasis/?num_chasis=${encodeURIComponent(inscripcionData.num_chasis)}`, {
              headers: {
                'Accept': 'application/json'
              }
            });
            const facturaData = await facturaRes.json();
            setTipoSello(facturaData.tipo_sello || '-');
            setCaso("Primera Obtención");
            // setCapacidadCarga(vehiculoData.capacidad_carga || '-');
          }

          // console.log(  'Código SII:', vehiculoData.codigo_sii);
        } catch (error) {
          console.error('Error fetching vehiculo data:', error);
        }

      } catch (error) {
        console.error('Error general:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [ppu, rutPropietario]); // ✅ Agregar rut como dependencia

  // Verificar si todos los documentos están en estado ideal
  const documentosNegativosPositivos = ['Encargo por Robo', 'Multas de Tránsito', 'Multas RPI'];
  const todosDocumentosValidos = documentos
    .filter(doc => doc.nombre !== 'Permiso de Circulación')
    .every(doc => {
      if (doc.estado === 'Desconocido') return false;
      const esDocumentoNegativo = documentosNegativosPositivos.includes(doc.nombre);
      return doc.estado === 'Vigente' || (doc.estado === 'No' && esDocumentoNegativo);
    });

  // Obtener valor permiso de circulación
  const fetchValorPermiso = async (ppu: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND}consultar_valor_permiso/${ppu}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      const permisoRes = await fetch(`${API_CONFIG.BACKEND}consultar_permiso_circulacion/${ppu}`);
      const permisoData = await permisoRes.json();
      setPermisoJson(permisoData);
      if (permisoData.fecha_emision) {
        const anioUltimaEmision = new Date(permisoData.fecha_emision).getFullYear();
        const anioActual = new Date().getFullYear();
        const aniosAPagar = Math.max(0, anioActual - anioUltimaEmision);
        console.log('#########Años a pagar:', aniosAPagar);
        const valorTotal = (data.valor || 0) * aniosAPagar;
        setValorPermiso(valorTotal);
        // Mostrar mensaje si la patente está atrasada
        if (aniosAPagar > 1) {
          setMensajeAtraso(`La patente estaba atrasada por ${aniosAPagar} años.`);
        } else {
          setMensajeAtraso('');
        }
      } else {
        setValorPermiso(data.valor || 0);
        setMensajeAtraso('');
      }
      // Nuevos datos
      setCilindrada(data.cilindrada || '-');
      setTasacion(data.tasacion || '-');
      setPeso(data.peso || '-');
      setAsientos(data.asientos || '-');
      setPuertas(data.puertas || '-');
      setTransmision(data.transmision || '-');
      setEquipamiento(data.equipamiento || '-');
      setTipoCombustible(data.combustible || '-');
      setCapacidadCarga(data.carga || '-');
    } catch (error) {
      console.error('Error fetching valor permiso:', error);
    }
  };
  useEffect(() => {
    if (ppu) {
      fetchValorPermiso(ppu);
    }
  }, [ppu]);


  const informacionVehiculo = [
    { label: 'Fecha de expiración SOAP', valor: fechaExpiracionSoap },
    { label: 'Fecha de expiración revisión', valor: fechaExpiracionRevision },
    { label: 'Fecha de inscripción', valor: fechaInscripcion },
    { label: 'N° Motor', valor: numMotor },
    { label: 'N° Chasis', valor: numChasis },
    { label: 'Tipo de vehículo', valor: tipoVehiculo },
    { label: 'Color de la carrocería', valor: color },
    { label: 'Marca del vehículo', valor: marca },
    { label: 'Modelo', valor: modelo },
    { label: 'Año', valor: anio },
    { label: 'Capacidad de carga', valor: capacidadCarga },
    { label: 'Tipo de sello', valor: tipoSello },
    { label: 'Tipo de combustible', valor: tipoCombustible },
  ];

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="container-fluid px-4 py-4 text-center" style={{ fontFamily: '"Roboto", sans-serif' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando validaciones del vehículo...</p>
      </div>
    );
  }

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
              <li className="align-self-center breadcrumb-item" aria-current="page">Validación documentos</li>
              <li className="align-self-center breadcrumb-item active" aria-current="page">Detalles de pago</li>
              <li className="align-self-center breadcrumb-item active" aria-current="page">Confirmación de pago</li>
            </ol>
          </nav>
        </div>
        
        <div className="row g-4">
          {/* Columna izquierda */}
          <div className="col-lg-6">
            {/* Card de patente */}
          <div className="card-like mb-4 shadow">
            <div className="card-body text-center p-4">
              <h6 className="text-muted mb-2" style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.875rem', fontWeight: '400' }}>
                Patente a pagar
              </h6>
              <h1 className="display-4 fw-bold text-dark" style={{ fontFamily: '"Roboto", sans-serif', fontWeight: '700' }}>
                {ppu || 'AA BB 11'}
              </h1>

              <span 
                className="badge rounded-pill px-3 py-2 mb-4 text-white fw-medium"
                style={{ 
                  backgroundColor: '#17a2b8',
                  fontFamily: '"Roboto", sans-serif'
                }}
              >
                {caso || '-'}
              </span>
              <p className="text-muted mb-3" style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.875rem', fontWeight: '400' }}>
                RUT propietario
              </p>
              <h2 className="fw-bold mb-4 text-dark" style={{ fontFamily: '"Roboto", sans-serif', fontWeight: '700', fontSize: '1.5rem' }}>
                {rutPropietario || '-'}
              </h2>
              <p className="text-muted mb-3" style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.875rem', fontWeight: '400' }}>
                Nombre propietario
              </p>
              <h2 className="fw-bold mb-4 text-dark" style={{ fontFamily: '"Roboto", sans-serif', fontWeight: '700', fontSize: '1.5rem' }}>
                {nombrePropietario || '-'}
              </h2>

              <p className="text-muted" style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.875rem', fontWeight: '400' }}>
                Estado
              </p>
              <span 
                className="badge rounded-pill px-4 py-2 mb-4 text-white fw-medium"
                style={{ 
                  backgroundColor: todosDocumentosValidos ? '#2E7D32' : '#CD1E2C',
                  fontFamily: '"Roboto", sans-serif',
                  fontWeight: '500'
                }}
              >
                {todosDocumentosValidos ? 'Vehículo al Día' : 'No Apto'}
              </span>
              
              <div className="">
                <h6 className="text-muted" style={{ fontFamily: '"Roboto", sans-serif', fontSize: '0.875rem', fontWeight: '400' }}>
                  Valor Permiso de Circulación
                </h6>
                <h2 className="fw-bold mb-0 text-dark" style={{ fontFamily: '"Roboto", sans-serif', fontWeight: '700', fontSize: '2rem' }}>
                  ${valorPermiso?.toLocaleString('es-CL') || '0'}
                </h2>
                {mensajeAtraso && (
                  <div className="mt-2" style={{ color: '#CD1E2C', fontWeight: 500, fontSize: '1rem' }}>
                    {mensajeAtraso}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card de validaciones */}
          <div className="card border shadow">
            <div className="card-header text-white " style={{ backgroundColor: '#0d6efd' }}>
              <div className="row">
                <div className="col-6">
                  <h6 className="mb-0 fw-bold" style={{ fontFamily: '"Roboto", sans-serif', fontWeight: '600' }}>
                    Documento
                  </h6>
                </div>
                <div className="col-6">
                  <h6 className="mb-0 fw-bold" style={{ fontFamily: '"Roboto", sans-serif', fontWeight: '600' }}>
                    Estado
                  </h6>
                </div>
              </div>
            </div>
            <div className="card-body">
              {documentos.map((doc, index) => (
                <div key={index} className={`row align-items-center py-3 px-0 ${index % 2 === 1 ? 'bg-light' : 'bg-white'} ${index !== documentos.length - 1 ? 'border-bottom border-light' : ''}`}>
                  <div className="col-5">
                    <span className="fw-medium text-dark" style={{ fontFamily: '"Roboto", sans-serif', fontWeight: '500' }}>
                      {doc.nombre}
                    </span>
                  </div>
                  <div className="col-4">
                    <EstadoChip estado={doc.estado} documento={doc.nombre} />
                  </div>
                  <div className="col-3 text-end">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      type="button"
                      // Aquí puedes agregar la lógica para mostrar el documento real si lo tienes
                      onClick={() => setModalDocumento({ open: true, doc })}
                    >
                      Ver documento
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {modalDocumento.open && modalDocumento.doc && (
        <div
          className="modal fade show"
          style={{
            display: 'block',
            background: 'rgba(0,0,0,0.35)',
            zIndex: 1060,
          }}
          tabIndex={-1}
          role="dialog"
          onClick={() => setModalDocumento({ open: false })}
        >
          <div
            className="modal-dialog"
            role="document"
            style={{ pointerEvents: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalDocumento.doc.nombre}</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setModalDocumento({ open: false })} />
              </div>
              <div className="modal-body">
                <p>
                  <b>Estado:</b>{' '}
                  <EstadoChip estado={modalDocumento.doc.estado} documento={modalDocumento.doc.nombre} />
                </p>
                {/* Detalles Permiso */}
                {modalDocumento.doc.nombre === 'Permiso de Circulación' && permisoJson && (
                  <div>
                    <p><b>PPU:</b> {ppu}</p>
                    <p><b>RUT Propietario:</b> {rutPropietario}</p>
                    <p><b>Nombre Propietario:</b> {nombrePropietario}</p>
                    <p><b>Fecha Emisión:</b> {permisoJson.fecha_emision || '-'}</p>
                    <p><b>Fecha Expiración:</b> {permisoJson.fecha_expiracion || '-'}</p>
                    <p><b>Código SII:</b> {codigoSii}</p>
                    <p><b>Cilindrada:</b> {cilindrada}</p>
                    <p><b>Tasación:</b> {tasacion}</p>
                    <p><b>Peso:</b> {peso}</p>
                    <p><b>N° Asientos:</b> {asientos}</p>
                    <p><b>N° Puertas:</b> {puertas}</p>
                    <p><b>Transmisión:</b> {transmision}</p>
                    <p><b>Equipamiento:</b> {equipamiento}</p>
                  </div>
                )}
                {/* Detalles SOAP */}
                {modalDocumento.doc.nombre === 'SOAP (Año vigente)' && (
                  <div>
                    <p><b>N° Póliza:</b> {numPoliza}</p>
                    <p><b>Aseguradora:</b> {aseguradora}</p>
                    <p><b>Fecha de emisión:</b> {fechaEmisionSoap}</p>
                    <p><b>Fecha de expiración:</b> {fechaExpiracionSoap}</p>
                    <p><b>Prima:</b> {primaSoap}</p>
                  </div>
                )}
                {/* Detalles Revisión Técnica */}
                {modalDocumento.doc.nombre === 'Revisión Técnica' && (
                  <div>
                    <p><b>Fecha de revisión:</b> {fechaRevision}</p>
                    <p><b>Fecha de expiración:</b> {fechaExpiracionRevision}</p>
                    <p><b>Planta:</b> {planta}</p>
                    <p><b>Código planta:</b> {codigoPlanta}</p>
                    <p><b>Estado revisión:</b> {estadoRevision}</p>
                    <p><b>N° Certificado:</b> {numCertificado}</p>
                  </div>
                )}
                {/* Detalles Encargo por Robo */}
                {modalDocumento.doc.nombre === 'Encargo por Robo' && (
                  <div>
                    <table className="table table-bordered mt-3">
                      <thead>
                        <tr>
                          <th>Tipo de Encargo</th>
                          <th>¿Posee encargo?</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Patente Delantera</td>
                          <td>{encargoPatenteDelantera === null ? 'Desconocido' : (encargoPatenteDelantera ? 'Sí' : 'No')}</td>
                        </tr>
                        <tr>
                          <td>Patente Trasera</td>
                          <td>{encargoPatenteTrasera === null ? 'Desconocido' : (encargoPatenteTrasera ? 'Sí' : 'No')}</td>
                        </tr>
                        <tr>
                          <td>VIN</td>
                          <td>{encargoVin === null ? 'Desconocido' : (encargoVin ? 'Sí' : 'No')}</td>
                        </tr>
                        <tr>
                          <td>Motor</td>
                          <td>{encargoMotor === null ? 'Desconocido' : (encargoMotor ? 'Sí' : 'No')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
                {/* Detalles Multas RPI */}
                {modalDocumento.doc.nombre === 'Multas RPI' && (
                  <div>
                    <table className="table table-bordered mt-3">
                      <thead>
                        <tr>
                          <th>Rol Causa</th>
                          <th>Año</th>
                          <th>Juzgado</th>
                          <th>Monto Multa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detallesMultasRPI.map((multa, index) => (
                          <tr key={index}>
                            <td>{multa.rol_causa}</td>
                            <td>{multa.anio_causa}</td>
                            <td>{multa.nombre_jpl}</td>
                            <td>{multa.monto_multa}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {/* Detalles Multas de Tránsito */}
                {modalDocumento.doc.nombre === 'Multas de Tránsito' && (
                  <div>
                    <table className="table table-bordered mt-3">
                      <thead>
                        <tr>
                          <th>Rol Causa</th>
                          <th>Nombre Juzgado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detallesMultasTransito.map((multa, index) => (
                          <tr key={index}>
                            <td>{multa.rol_causa}</td>
                            <td>{multa.jpl}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalDocumento({ open: false })}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Columna derecha */}
        <div className="col-lg-6">
          {/* Card información del vehículo */}
          <div className="card-like border-0 shadow mb-4">
            <div className="card-body border-bottom text-center">
              <h5 className="mb-0 fw-bold text-dark" style={{ fontFamily: '"Roboto", sans-serif', fontWeight: '600', fontSize: '1.125rem' }}>
                Información Vehículo
              </h5>
            </div>
            <div className="card-body">
              {informacionVehiculo.map((item, index) => (
                <div key={index} className={`row py-2 ${index !== informacionVehiculo.length - 1 ? 'border-bottom border-light' : ''}`}>
                  <div className="col-8">
                    <span className="text-muted" style={{ fontFamily: '"Roboto", sans-serif', fontWeight: '400', fontSize: '0.875rem' }}>
                      {item.label}
                    </span>
                  </div>
                  <div className="col-4 text-end">
                    <span className="fw-medium text-dark" style={{ fontFamily: '"Roboto", sans-serif', fontWeight: '500' }}>
                      {item.valor}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mostrar mensaje si el permiso del año actual ya está pagado */}
          {permisoAnioActualPagado !== '' && (
            <div
              className="mb-4"
              style={{
                backgroundColor: '#c7eed3ff',
                color: '#33b158',
                // borderRadius: '14px',
                border: '2px solid #33b158',
                padding: '18px 20px',
                fontWeight: 600,
                fontSize: '1rem',
                textAlign: 'center',
                fontFamily: '"Roboto", sans-serif',
                boxShadow: '0 2px 8px #0001'
              }}
            >
              {permisoAnioActualPagado}
            </div>
          )}

          {/* Botón proceder al pago */}
          <div className="d-grid text-center">
            <button 
              className="btn btn-lg py-3 text-white fw-bold" 
              disabled={!todosDocumentosValidos || permisoAnioActualPagado !== ''}
              style={{ 
                backgroundColor: todosDocumentosValidos && permisoAnioActualPagado === '' ? '#0d6efd' : '#6c757d', 
                border: 'none',
                fontFamily: '"Roboto", sans-serif',
                fontWeight: '600',
                cursor: todosDocumentosValidos && permisoAnioActualPagado === '' ? 'pointer' : 'not-allowed',
                opacity: todosDocumentosValidos && permisoAnioActualPagado === '' ? 1 : 0.7
              }}
              onClick={() => {
                if (todosDocumentosValidos && permisoAnioActualPagado === '') {
                  // ✅ Crear objeto con todos los datos
                  const datosVehiculo: DatosVehiculo = {
                    // Datos básicos
                    ppu: ppu || '',
                    rut: rutPropietario || '',
                    nombre: nombrePropietario || '',
                    valorPermiso: valorPermiso || 0,
                    
                    // Información del vehículo
                    marca,
                    modelo,
                    anio,
                    color,
                    tipoVehiculo,
                    
                    // Fechas importantes
                    fechaExpiracionSoap,
                    fechaExpiracionRevision,
                    fechaInscripcion,
                    
                    // Identificadores
                    numMotor,
                    numChasis,
                    codigoSii,
                    
                    // Características técnicas
                    capacidadCarga,
                    tipoSello,
                    tipoCombustible,
                    cilindrada,
                    tasacion,
                    peso,
                    asientos,
                    puertas,
                    transmision,
                    equipamiento,
                    
                    // Estados de validación
                    revisionTecnica,
                    soap,
                    encargoRobo,
                    multasTransito,
                    multasRPI,
                    
                    // Metadatos
                    fechaConsulta: new Date().toISOString(),
                    todosDocumentosValidos
                  };
                  
                  // ✅ Guardar en sessionStorage
                  try {
                    sessionStorage.setItem('datos_vehiculo_permiso', JSON.stringify(datosVehiculo));
                    console.log('Datos guardados en sessionStorage:', datosVehiculo);
                    
                    // ✅ Redirigir sin parámetros en la URL
                    window.location.href = '/home/formulario-pago';
                  } catch (error) {
                    console.error('Error guardando datos en sessionStorage:', error);
                    alert('Error al preparar los datos. Intente nuevamente.');
                  }
                }
              }}
            >
              Proceder al Pago
              <span className="ms-2">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}

export default function ValidacionesPago() {
  return (
    <Suspense fallback={
      <div className="container-fluid px-4 py-4 text-center" style={{ fontFamily: '"Roboto", sans-serif' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando información del vehículo...</p>
      </div>
    }>
      <ValidacionesPagoContent />
    </Suspense>
  );
}