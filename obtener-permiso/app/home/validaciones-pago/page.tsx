'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';

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
        fontFamily: '"Dosis", sans-serif'
      }}
    >
      {estado}
    </span>
  );
}

function ValidacionesPagoContent() {
  const searchParams = useSearchParams();
  const ppu = searchParams.get('plate'); // Obtener la PPU de la URL
  const rut = searchParams.get('RUT'); // Obtener el RUT de la URL

  // Valor permiso
  const [valorPermiso, setValorPermiso] = useState<number | null>(null);

  // Estados para cada API
  const [revisionTecnica, setRevisionTecnica] = useState<EstadoValidacion>('Desconocido');
  const [soap, setSoap] = useState<EstadoValidacion>('Desconocido');
  const [encargoRobo, setEncargoRobo] = useState<EstadoValidacion>('Desconocido');
  const [multasTransito, setMultasTransito] = useState<EstadoValidacion>('Desconocido');
  const [multasRPI, setMultasRPI] = useState<EstadoValidacion>('Desconocido');
  const [loading, setLoading] = useState(true);

  // Estados para información del vehículo
  const [fechaExpiracionSoap, setFechaExpiracionSoap] = useState<string>('-');
  const [fechaExpiracionRevision, setFechaExpiracionRevision] = useState<string>('-');
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
  // Obtener desde consultar valor permiso
  const [cilindrada, setCilindrada] = useState<string>('-');
  const [tasacion, setTasacion] = useState<string>('-');
  const [peso, setPeso] = useState<string>('-');
  const [asientos, setAsientos] = useState<string>('-');
  const [puertas, setPuertas] = useState<string>('-');
  const [transmision, setTransmision] = useState<string>('-');
  const [equipamiento, setEquipamiento] = useState<string>('-');

  // Crear documentos dinámicamente basado en los estados
  const documentos: DocumentoValidacion[] = [
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
          const inscripcionRes = await fetch(`http://localhost:8000/consultar_patente/${ppu}`);
          const inscripcionData = await inscripcionRes.json();
          console.log('Fecha de inscripción:', inscripcionData.fecha_inscripcion);
          setFechaInscripcion(inscripcionData.fecha_inscripcion || '-');
        } catch (error) {
          console.error('Error fetching fecha inscripcion:', error);
          setFechaInscripcion('Desconocido');
        }

        // Obtener Revisión Técnica
        try {
          const revisionRes = await fetch(`http://localhost:8000/consultar_revision_tecnica/${ppu}`);
          const revisionData = await revisionRes.json();
          setRevisionTecnica(revisionData.vigencia || 'Desconocido');
          // Obtener fecha de expiración de revisión técnica
          setFechaExpiracionRevision(revisionData.fecha_vencimiento || '-');
        } catch (error) {
          console.error('Error fetching revision tecnica:', error);
          setRevisionTecnica('Desconocido');
        }

        // Obtener SOAP
        try {
          const soapRes = await fetch(`http://localhost:8000/consultar_soap/${ppu}`);
          const soapData = await soapRes.json();
          setSoap(soapData.vigencia_permiso || 'Desconocido');
          // Obtener fecha de expiración SOAP
          setFechaExpiracionSoap(soapData.rige_hasta || '-');
        } catch (error) {
          console.error('Error fetching SOAP:', error);
          setSoap('Desconocido');
        }

        // Obtener Encargo por Robo
        try {
          const roboRes = await fetch(`http://localhost:8000/consultar_encargo/${ppu}`);
          const roboData = await roboRes.json();
          if (roboData.encargo) {
            setEncargoRobo(roboData.encargo);
          } else {
            setEncargoRobo('No');
          }
        } catch (error) {
          console.error('Error fetching encargo robo:', error);
          setEncargoRobo('Desconocido');
        }

        // Obtener Multas de Tránsito
        try {
          const transitoRes = await fetch(`http://localhost:8000/consultar_multas/${ppu}`);
          const transitoData = await transitoRes.json();
          if (transitoData.total_multas != 0) {
            setMultasTransito('Si');
          } else {
            setMultasTransito('No');
          }
        } catch (error) {
          console.error('Error fetching multas transito:', error);
          setMultasTransito('Desconocido');
        }

        // Obtener Multas RPI
        try {
          const rpiRes = await fetch(`http://localhost:8000/consultar-multas-rpi/${rut}`);
          const rpiData = await rpiRes.json();
          if (rpiData.cantidad_multas != 0) {
            setMultasRPI('Si');
          } else {
            setMultasRPI('No');
          }
        } catch (error) {
          console.error('Error fetching multas RPI:', error);
          setMultasRPI('Desconocido');
        }

        // ✅ Mover el fetch de información del vehículo aquí
        try {
          const vehiculoRes = await fetch(`http://localhost:8000/consultar_permiso_circulacion/${ppu}`);
          const vehiculoData = await vehiculoRes.json();
          console.log('Vehículo data:', vehiculoData);
          
          // Actualizar todos los estados de información del vehículo
          // setFechaInscripcion(vehiculoData.fecha_inscripcion || '-');
          setNumMotor(vehiculoData.motor || '-');
          setNumChasis(vehiculoData.chasis || '-');
          setTipoVehiculo(vehiculoData.tipo_vehiculo || '-');
          setColor(vehiculoData.color || '-');
          setMarca(vehiculoData.marca || '-');
          setModelo(vehiculoData.modelo || '-');
          setAnio(vehiculoData.anio || '-');
          setCapacidadCarga(vehiculoData.carga || '-');
          setTipoSello(vehiculoData.tipo_sello || '-');
          setCodigoSii(vehiculoData.codigo_sii || '-');
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
  }, [ppu, rut]); // ✅ Agregar rut como dependencia

  // Verificar si todos los documentos están en estado ideal
  const documentosNegativosPositivos = ['Encargo por Robo', 'Multas de Tránsito', 'Multas RPI'];
  const todosDocumentosValidos = documentos.every(doc => {
    if (doc.estado === 'Desconocido') return false; // Si hay datos desconocidos, no es válido
    const esDocumentoNegativo = documentosNegativosPositivos.includes(doc.nombre);
    return doc.estado === 'Vigente' || (doc.estado === 'No' && esDocumentoNegativo);
  });

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

  // Obtener valor permiso de circulación
  const fetchValorPermiso = async (ppu: string) => {
    try {
      const response = await fetch(`http://localhost:8000/consultar_valor_permiso/${ppu}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setValorPermiso(data.valor || 0);
      // Nuevos datos
      setCilindrada(data.cilindrada || '-');
      setTasacion(data.tasacion || '-');
      setPeso(data.peso || '-');
      setAsientos(data.asientos || '-');
      setPuertas(data.puertas || '-');
      setTransmision(data.transmision || '-');
      setEquipamiento(data.equipamiento || '-');
      setTipoCombustible(data.combustible || '-');
    } catch (error) {
      console.error('Error fetching valor permiso:', error);
    }
  };
  useEffect(() => {
    if (ppu) {
      fetchValorPermiso(ppu);
    }
  }, [ppu]);

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="container-fluid px-4 py-4 text-center" style={{ fontFamily: '"Dosis", sans-serif' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando validaciones del vehículo...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container-fluid px-4 py-4" style={{ fontFamily: '"Dosis", sans-serif' }}>
        <div className="row g-4">
          {/* Columna izquierda */}
          <div className="col-lg-6">
            {/* Card de patente */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body text-center p-4">
              <h6 className="text-muted mb-2" style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.875rem', fontWeight: '400' }}>
                Patente a pagar
              </h6>
              <h1 className="display-4 fw-bold mb-3 text-dark" style={{ fontFamily: '"Dosis", sans-serif', fontWeight: '700' }}>
                {ppu || 'AA BB 11'}
              </h1>
              <p className="text-muted mb-3" style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.875rem', fontWeight: '400' }}>
                Estado
              </p>
              <span 
                className="badge rounded-pill px-4 py-2 mb-4 text-white fw-medium"
                style={{ 
                  backgroundColor: todosDocumentosValidos ? '#2E7D32' : '#CD1E2C',
                  fontFamily: '"Dosis", sans-serif',
                  fontWeight: '500'
                }}
              >
                {todosDocumentosValidos ? 'Vehículo al Día' : 'No Apto'}
              </span>
              
              <div className="mt-4">
                <h6 className="text-muted mb-2" style={{ fontFamily: '"Dosis", sans-serif', fontSize: '0.875rem', fontWeight: '400' }}>
                  Valor Permiso de Circulación
                </h6>
                <h2 className="fw-bold mb-0 text-dark" style={{ fontFamily: '"Dosis", sans-serif', fontWeight: '700', fontSize: '2rem' }}>
                  ${valorPermiso}
                </h2>
              </div>
            </div>
          </div>

          {/* Card de validaciones */}
          <div className="card border-0 shadow-sm">
            <div className="card-header text-white" style={{ backgroundColor: '#0d6efd' }}>
              <div className="row">
                <div className="col-6">
                  <h6 className="mb-0 fw-bold" style={{ fontFamily: '"Dosis", sans-serif', fontWeight: '600' }}>
                    Documento
                  </h6>
                </div>
                <div className="col-6">
                  <h6 className="mb-0 fw-bold" style={{ fontFamily: '"Dosis", sans-serif', fontWeight: '600' }}>
                    Estado
                  </h6>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              {documentos.map((doc, index) => (
                <div key={index} className={`row align-items-center py-3 px-3 ${index % 2 === 1 ? 'bg-light' : 'bg-white'} ${index !== documentos.length - 1 ? 'border-bottom border-light' : ''}`}>
                  <div className="col-6">
                    <span className="fw-medium text-dark" style={{ fontFamily: '"Dosis", sans-serif', fontWeight: '500' }}>
                      {doc.nombre}
                    </span>
                  </div>
                  <div className="col-6">
                    <EstadoChip estado={doc.estado} documento={doc.nombre} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="col-lg-6">
          {/* Card información del vehículo */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-light border-bottom text-center">
              <h5 className="mb-0 fw-bold text-dark" style={{ fontFamily: '"Dosis", sans-serif', fontWeight: '600', fontSize: '1.125rem' }}>
                Información Vehículo
              </h5>
            </div>
            <div className="card-body bg-white">
              {informacionVehiculo.map((item, index) => (
                <div key={index} className={`row py-2 ${index !== informacionVehiculo.length - 1 ? 'border-bottom border-light' : ''}`}>
                  <div className="col-8">
                    <span className="text-muted" style={{ fontFamily: '"Dosis", sans-serif', fontWeight: '400', fontSize: '0.875rem' }}>
                      {item.label}
                    </span>
                  </div>
                  <div className="col-4 text-end">
                    <span className="fw-medium text-dark" style={{ fontFamily: '"Dosis", sans-serif', fontWeight: '500' }}>
                      {item.valor}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botón proceder al pago */}
          <div className="d-grid text-center">
            <button 
              className="btn btn-lg py-3 text-white fw-bold" 
              disabled={!todosDocumentosValidos}
              style={{ 
                backgroundColor: todosDocumentosValidos ? '#0d6efd' : '#6c757d', 
                border: 'none',
                fontFamily: '"Dosis", sans-serif',
                fontWeight: '600',
                cursor: todosDocumentosValidos ? 'pointer' : 'not-allowed',
                opacity: todosDocumentosValidos ? 1 : 0.7
              }}
              onClick={() => {
                if (todosDocumentosValidos) {
                    // Enviamos todos los datos recuperados
                    const params = new URLSearchParams({
                    plate: ppu || '',
                    rut: rut || '',
                    valor: valorPermiso?.toString() || '0',
                    marca: marca,
                    modelo: modelo,
                    anio: anio,
                    color: color,
                    tipoVehiculo: tipoVehiculo,
                    fechaExpiracionSoap: fechaExpiracionSoap,
                    fechaExpiracionRevision: fechaExpiracionRevision,
                    fechaInscripcion: fechaInscripcion,
                    numMotor: numMotor,
                    numChasis: numChasis,
                    capacidadCarga: capacidadCarga,
                    tipoSello: tipoSello,
                    tipoCombustible: tipoCombustible,
                    revisionTecnica: revisionTecnica,
                    soap: soap,
                    encargoRobo: encargoRobo,
                    multasTransito: multasTransito,
                    multasRPI: multasRPI,
                    cilindrada: cilindrada,
                    tasacion: tasacion,
                    peso: peso,
                    asientos: asientos,
                    puertas: puertas,
                    transmision: transmision,
                    equipamiento: equipamiento,
                    codigoSii: codigoSii
                    });
                  
                  window.location.href = `/home/formulario-pago?${params.toString()}`;
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
      <div className="container-fluid px-4 py-4 text-center" style={{ fontFamily: '"Dosis", sans-serif' }}>
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