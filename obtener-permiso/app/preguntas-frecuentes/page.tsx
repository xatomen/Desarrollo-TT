'use client';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState } from 'react';

const preguntasFrecuentes = [
  {
    pregunta: "¿Qué es TU PERMISO?",
    respuesta: "Es un sistema digital integrado propuesto para gestionar de forma unificada el permiso de circulación de vehículos a nivel nacional en Chile. Busca reemplazar el sistema actual descentralizado por municipalidades.",
    categoria: "General"
  },
  {
    pregunta: "¿Por qué se creó TU PERMISO?",
    respuesta: "Se propuso para solucionar las ineficiencias, fragmentación y procesos manuales del sistema actual, facilitando el trámite para los usuarios, optimizando la fiscalización y modernizando los servicios del Estado.",
    categoria: "General"
  },
  {
    pregunta: "¿Será obligatorio usar TU PERMISO?",
    respuesta: "Si, actualmente es obligatorio utilizar TU PERMISO para obtener el permiso de circulación en Chile. El objetivo de esto es proporcionar una experiencia más sencilla y eficiente para los usuarios.",
    categoria: "General"
  },
  {
    pregunta: "¿Cómo y dónde pagaré mi permiso de circulación ahora?",
    respuesta: "Podrás pagar tu permiso a través de TU PERMISO. Ya no dependerás de la municipalidad específica donde resides o donde pagaste anteriormente. El pago se realizará en línea.",
    categoria: "Pago y Obtención"
  },
  {
    pregunta: "¿Qué necesito para pagar mi permiso en la plataforma?",
    respuesta: "Necesitarás acceso a internet y ClaveÚnica para iniciar sesión en TU PERMISO. El sistema verificará automáticamente si cumples los requisitos (SOAP vigente, Revisión Técnica al día, sin multas impagas de tránsito ni en el RPI, y sin encargo por robo) consultando a las entidades correspondientes.",
    categoria: "Pago y Obtención"
  },
  {
    pregunta: "¿Qué métodos de pago se aceptarán?",
    respuesta: "La plataforma permitirá el pago en línea con tarjetas de débito o crédito. El pago será procesado a través de la Tesorería General de la República (TGR).",
    categoria: "Pago y Obtención"
  },
  {
    pregunta: "¿Podré pagar en cuotas?",
    respuesta: "El sistema actual permite pagar en dos cuotas presencialmente o en línea. La propuesta indica que el portal de la TGR podría ofrecer opciones de financiamiento con tarjetas de crédito en varias cuotas.",
    categoria: "Pago y Obtención"
  },
  {
    pregunta: "¿Cómo obtengo el documento del permiso una vez pagado?",
    respuesta: "Después de realizar el pago exitoso en la plataforma web, el sistema emitirá el permiso de circulación. Podrás recibirlo por correo electrónico o descargarlo. También estará disponible para consulta en la aplicación móvil para propietarios.",
    categoria: "Pago y Obtención"
  },
  {
    pregunta: "¿Qué pasa si tengo multas de tránsito o del RPI (Registro de Pasajeros Infractores) pendientes?",
    respuesta: "No podrás obtener tu permiso de circulación si tienes multas de tránsito pendientes registradas en el SRCeI o si estás en el Registro de Pasajeros Infractores (RPI) del MTT. El sistema validará esto automáticamente antes de permitir el pago.",
    categoria: "Pago y Obtención"
  },
  {
    pregunta: "¿Cómo pago el primer permiso para un auto nuevo?",
    respuesta: "La plataforma web permitirá la obtención del primer permiso. Deberás ingresar el número de factura de compra del vehículo. El sistema calculará el valor proporcional a pagar por los meses restantes del año, usando el valor neto de la factura como base.",
    categoria: "Pago y Obtención"
  },
  {
    pregunta: "¿Tendré que seguir imprimiendo el permiso de circulación?",
    respuesta: "La propuesta incluye una aplicación móvil para propietarios donde podrás tener todos tus documentos vehiculares de manera digitalizada (Permiso, Padrón, SOAP, Revisión Técnica), eliminando la necesidad de portar documentos físicos. Los fiscalizadores también tendrán una app para verificar la información digitalmente.",
    categoria: "Documentos y Apps"
  },
  {
    pregunta: "¿Cómo accederé a mis documentos en la aplicación móvil?",
    respuesta: "Necesitarás iniciar sesión en la aplicación móvil usando tu ClaveÚnica. Una vez dentro, podrás ver el listado de tus vehículos y consultar sus documentos asociados.",
    categoria: "Documentos y Apps"
  },
  {
    pregunta: "¿El dinero del permiso seguirá yendo a las municipalidades?",
    respuesta: "Sí, aunque el pago se centralice a través de la Tesorería General de la República (TGR), la propuesta indica que el Estado (a través de la TGR) repartirá posteriormente los fondos recaudados entre las municipalidades, similar a como se hace con las contribuciones.",
    categoria: "Municipalidades"
  },
  {
    pregunta: "¿Ya no podré elegir en qué comuna pagar para que reciba los fondos?",
    respuesta: "La plataforma unificada gestionará el permiso independientemente de la municipalidad de residencia. La recaudación será centralizada por la TGR, y la distribución posterior a las municipalidades se haría según criterios definidos por el Estado, no por elección directa del usuario al momento del pago.",
    categoria: "Municipalidades"
  },
  {
    pregunta: "¿Es seguro ingresar mis datos y pagar en esta plataforma?",
    respuesta: "El proyecto contempla medidas de seguridad como el uso de HTTPS, autenticación mediante ClaveÚnica y la gestión de pagos a través de la TGR. Además, considera la Ley N°21.719 de Protección de Datos Personales, lo que implicaría medidas como cifrado de datos sensibles.",
    categoria: "Seguridad y Soporte"
  },
  {
    pregunta: "¿Qué pasa si tengo problemas o mi información es incorrecta?",
    respuesta: "Aunque el documento no detalla un canal de soporte específico, se menciona la implementación de principios ITIL, incluyendo la Gestión de Incidentes, lo que sugiere que existirían mecanismos para reportar y resolver errores funcionales o problemas con los datos.",
    categoria: "Seguridad y Soporte"
  }
];

const PAGE_SIZE = 5;

// Obtener categorías únicas
const categorias = [
  ...new Set(preguntasFrecuentes.map((p) => p.categoria))
];

export default function PreguntasFrecuentesPage({
}: Readonly<{}>) {
  const [abierta, setAbierta] = useState<number | null>(null);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');

  // Filtrado por búsqueda y categoría
  const preguntasFiltradas = preguntasFrecuentes.filter(
    ({ pregunta, respuesta, categoria }) =>
      (categoriaSeleccionada === 'Todas' || categoria === categoriaSeleccionada) &&
      (
        pregunta.toLowerCase().includes(busqueda.toLowerCase()) ||
        respuesta.toLowerCase().includes(busqueda.toLowerCase())
      )
  );

  const totalPaginas = Math.ceil(preguntasFiltradas.length / PAGE_SIZE);
  const inicio = (pagina - 1) * PAGE_SIZE;
  const fin = inicio + PAGE_SIZE;
  const preguntasPagina = preguntasFiltradas.slice(inicio, fin);

  // Reiniciar a la primera página si cambia la búsqueda o categoría
  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPagina(1);
    setAbierta(null);
  };

  const handleCategoria = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoriaSeleccionada(e.target.value);
    setPagina(1);
    setAbierta(null);
  };

  return (
    <div className="min-vh-100" style={{ background: '#f8fafc' }}>
      <Navbar />
      <div className="container mx-auto my-5 p-5 card-like">
        <h1 style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 'bold', textAlign: 'center' }}>Preguntas Frecuentes</h1>
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-6">
            <div
              className="h-100 p-4"
              style={{
                background: 'linear-gradient(90deg, #e0e7ff 60%, #fbeaf6 100%)',
                border: '1px solid #c7d2fe',
                borderRadius: '12px',
                boxShadow: '0 2px 8px #0001',
              }}
            >
              <h2 style={{
                color: '#1a2a41',
                fontWeight: 700,
                fontSize: '1.15rem',
                fontFamily: 'Roboto, Roboto, Arial, sans-serif',
                marginBottom: '0.5rem'
              }}>
                ¿Qué es este sitio?
              </h2>
              <p style={{
                color: '#3b3b3b',
                fontFamily: 'Roboto, Arial, sans-serif',
                fontWeight: 400,
                fontSize: '1.05rem'
              }}>
                Este sitio de ayuda está diseñado para resolver las dudas más comunes sobre el uso de la plataforma. Aquí puedes consultar información sobre acceso, recuperación de contraseña, visualización de vehículos y soporte.
              </p>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div
              className="h-100 p-4"
              style={{
                background: 'linear-gradient(90deg, #fbeaf6 60%, #e0e7ff 100%)',
                border: '1px solid #f8bbd0',
                borderRadius: '12px',
                boxShadow: '0 2px 8px #0001',
              }}
            >
              <h2 style={{
                color: '#6D2077',
                fontWeight: 700,
                fontSize: '1.15rem',
                fontFamily: 'Roboto, Roboto, Arial, sans-serif',
                marginBottom: '0.5rem'
              }}>
                ¿Cómo usar la sección?
              </h2>
              <p style={{
                color: '#3b3b3b',
                fontFamily: 'Roboto, Arial, sans-serif',
                fontWeight: 400,
                fontSize: '1.05rem'
              }}>
                Haz clic sobre cada pregunta para desplegar la respuesta. Si tu duda no está resuelta aquí, puedes contactarnos por los canales oficiales.
              </p>
            </div>
          </div>
        </div>
        {/* Barra de búsqueda y filtro de categoría */}
        <div className="mb-4 d-flex flex-wrap justify-content-center align-items-center" style={{ gap: '1rem', maxWidth: 700, margin: '0 auto' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar pregunta o palabra clave..."
            value={busqueda}
            onChange={handleBusqueda}
            style={{
              borderRadius: '8px',
              border: '1px solid #c7d2fe',
              fontSize: '1rem',
              padding: '0.75rem 1rem',
              minWidth: 220,
              flex: '1 1 220px',
              height: '50px'
            }}
          />
          <select
            className="form-select"
            value={categoriaSeleccionada}
            onChange={handleCategoria}
            style={{
              borderRadius: '8px',
              border: '1px solid #c7d2fe',
              fontSize: '1rem',
              padding: '0.75rem 1rem',
              minWidth: 180,
              flex: '1 1 180px',
              height: '50px'
            }}
          >
            <option value="Todas">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          {preguntasPagina.length === 0 ? (
            <div className="text-center text-muted py-5">
              No se encontraron preguntas con ese término.
            </div>
          ) : (
            preguntasPagina.map((item, idx) => {
              const globalIdx = inicio + idx;
              return (
                <div key={globalIdx} style={{ marginBottom: 16, borderBottom: '1px solid #eee' }}>
                  <button
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      padding: '12px 0',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                    onClick={() => setAbierta(abierta === globalIdx ? null : globalIdx)}
                    aria-expanded={abierta === globalIdx}
                    aria-controls={`faq-respuesta-${globalIdx}`}
                  >
                    {item.pregunta}
                  </button>
                  {abierta === globalIdx && (
                    <div id={`faq-respuesta-${globalIdx}`} style={{ padding: '8px 0', color: '#444' }}>
                      {item.respuesta}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        {/* Paginador */}
        {preguntasFiltradas.length > PAGE_SIZE && (
          <div className="d-flex justify-content-center align-items-center mt-4">
            <button
              style={{ border: '1px solid #eee', borderRadius: '4px' }}
              className="btn px-3 mx-3"
              disabled={pagina === 1}
              onClick={() => {
                setAbierta(null);
                setPagina(pagina - 1);
              }}
            >
              Anterior
            </button>
            <span style={{ fontWeight: 500, fontSize: '1rem', color: '#000000' }}>
              Página {pagina} de {totalPaginas}
            </span>
            <button
              style={{ border: '1px solid #eee', borderRadius: '4px' }}
              className="btn px-3 mx-3"
              disabled={pagina === totalPaginas}
              onClick={() => {
                setAbierta(null);
                setPagina(pagina + 1);
              }}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}