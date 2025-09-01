'use client';

type EstadoValidacion = 'Vigente' | 'No' | 'Si';
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

export default function ValidacionesPago() {
  const documentos: DocumentoValidacion[] = [
    { nombre: 'Revisión Técnica', estado: 'Vigente' },
    { nombre: 'SOAP (Año vigente)', estado: 'Vigente' },
    { nombre: 'Encargo por Robo', estado: 'No' },
    { nombre: 'Multas de Tránsito', estado: 'No' },
    { nombre: 'Multas RPI', estado: 'No' },
  ];

  // Verificar si todos los documentos están en estado ideal
  const documentosNegativosPositivos = ['Encargo por Robo', 'Multas de Tránsito', 'Multas RPI'];
  const todosDocumentosValidos = documentos.every(doc => {
    const esDocumentoNegativo = documentosNegativosPositivos.includes(doc.nombre);
    return doc.estado === 'Vigente' || (doc.estado === 'No' && esDocumentoNegativo);
  });

  const informacionVehiculo = [
    { label: 'Fecha de expiración SOAP', valor: '-' },
    { label: 'Fecha de expiración revisión', valor: '-' },
    { label: 'Fecha de inscripción', valor: '-' },
    { label: 'N° Motor', valor: '-' },
    { label: 'N° Chasis', valor: '-' },
    { label: 'Tipo de vehículo', valor: '-' },
    { label: 'Color de la carrocería', valor: '-' },
    { label: 'Marca del vehículo', valor: '-' },
    { label: 'Modelo', valor: '-' },
    { label: 'Año', valor: '-' },
    { label: 'Capacidad de carga', valor: '-' },
    { label: 'Tipo de sello', valor: '-' },
    { label: 'Tipo de combustible', valor: '-' },
  ];

  return (
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
                AA BB 11
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
                  $75.000
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
          <div className="d-grid">
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
            >
              Proceder al Pago
              <span className="ms-2">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}