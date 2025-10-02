// ModalVehicular.tsx
import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';

export default function ModalVehicular({ show, onClose, title, data }: {
  show: boolean;
  onClose: () => void;
  title: string;
  data: any;
}) {
  const docRef = useRef<HTMLDivElement>(null);

  if (!show) return null;

  // Cierra el modal al hacer click fuera del contenido
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleDownload = () => {
    if (docRef.current) {
      const rect = docRef.current.getBoundingClientRect();
      html2pdf()
        .set({
          margin: 0,
          filename: `${title.replace(/\s/g, '_').toLowerCase()}_${data?.padron?.ppu || 'documento'}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'pt', format: [rect.width, rect.height], orientation: 'landscape' },
          pagebreak: { mode: ['avoid-all'] }
        })
        .from(docRef.current)
        .save();
    }
  };

  const { padron, permiso, revision, soap } = data;

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 9999,
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        padding: 24,
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          minWidth: 340,
          width:
            title.toLowerCase() === 'padron'
              ? 'auto'
              : title.toLowerCase() === 'permiso'
              ? 'auto'
              : title.toLowerCase() === 'soap'
              ? 'auto'
              : 'auto',
          maxWidth: '95vw',
          maxHeight: '95vh',
          boxShadow: '0 8px 32px #0003',
          padding: 0,
          position: 'relative',
          animation: 'modalIn 0.2s',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          borderBottom: '1px solid #eee',
          padding: '18px 28px 12px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <h5 style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem', color: '#6D2077' }}>
            {title} - Detalle
          </h5>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 22,
              color: '#888',
              cursor: 'pointer',
              fontWeight: 700,
              lineHeight: 1,
            }}
            aria-label="Cerrar"
          >×</button>
        </div>
        {/* Body */}
        <div
          ref={docRef}
          style={{
            padding: '24px 28px',
            overflow: 'visible',
            flexGrow: 1,
          }}>
          {data ? (
            title.toLowerCase() === 'padron' ? (
              // FORMATO PERSONALIZADO PARA PADRÓN
              <div
                style={{
                  border: '2px dashed orange',
                  padding: 18,
                  fontFamily: 'serif',
                  background: '#fff',
                  fontSize: '1.05rem',
                  position: 'relative',
                  width: '1200px',
                }}
              >
                <div className="row" style={{ width: '100%' }}>
                  <div className="col">
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 8 }}>
                    CERTIFICADO DE INSCRIPCIÓN R.V.M.
                    </div>
                    <table style={{ width: '100%', fontSize: '1rem', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <td>PROPIETARIO</td>
                                <td>: {padron.nombre || '-'}</td>
                            </tr>
                            <tr>
                                <td>DOMICILIO</td>
                                <td>: {padron.domicilio || '-'}</td>
                            </tr>
                            <tr>
                                <td><br /></td>
                                <td><br /></td>
                            </tr>
                            <tr>
                                <td>TIPO VEHICULO</td>
                                <td>: {padron.tipo_vehiculo || '-'}</td>
                            </tr>
                            <tr>
                                <td>AÑO</td>
                                <td>: {padron.anio || '-'}</td>
                            </tr>
                            <tr>
                                <td>MARCA</td>
                                <td>: {padron.marca || '-'}</td>
                            </tr>
                            <tr>
                                <td>MODELO</td>
                                <td>: {padron.modelo || '-'}</td>
                            </tr>
                            <tr>
                                <td>Nro. MOTOR</td>
                                <td>: {padron.num_motor || '-'}</td>
                            </tr>
                            <tr>
                                <td>Nro. CHASIS</td>
                                <td>: {padron.num_chasis || '-'}</td>
                            </tr>
                            <tr>
                                <td>Nro. SERIE</td>
                                <td>: {padron.serie || '-'}</td>
                            </tr>
                            <tr>
                                <td>Nro. VIN</td>
                                <td>: {padron.num_vin || '-'}</td>
                            </tr>
                            <tr>
                                <td>COLOR</td>
                                <td>: {padron.color || '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                  </div>
                  <div className="col">
                    <div className="row">
                        <div className="col">
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 8 }}>
                                SRCeI
                                </div>
                                <table style={{ width: '100%', fontSize: '1rem', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ fontWeight: 'bold' }}>INSC. PPU</td>
                                            <td style={{ fontWeight: 'bold' }}>: {padron.ppu || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ fontWeight: 'bold' }}>RUN o RUT</td>
                                            <td style={{ fontWeight: 'bold' }}>: {padron.rut || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td>ADQUISICIÓN</td>
                                            <td>: {padron.fecha_inscripcion || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td>INSCRIPCIÓN</td>
                                            <td>: {padron.fecha_inscripcion || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td>EMISIÓN</td>
                                            <td>: {new Date().toLocaleDateString() || '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                        </div>
                        <div className="col">
                            <div style={{ marginTop: 12 }}>
                            <b>FOLIO:</b> <span style={{ fontWeight: 400 }}>{Math.floor(Math.random() * 1000000)}</span>
                            </div>
                            <div><b>Código Verificación:</b> <span style={{ fontWeight: 700 }}>{data.codigo_verificacion || '-'}</span></div>
                            <div style={{ marginTop: 12, alignItems: 'center', gap: 8, textAlign: 'center' }}>
                              <img src="/img/barcode.png" alt="" />
                              <span style={{ fontWeight: 'bold', textAlign: 'center' }}>{Math.floor(Math.random() * 1000000)}</span>
                            </div>
                            
                        </div>
                    </div>
                    
                    <div className="row mt-4">
                        <div className="row d-flex">
                            <img src="/img/qrcode.png" alt="" style={{ width: 120, height: 120 }} />
                            <img src="/img/imagenes_padron.png" alt="" style={{ width: 'auto', height: 120 }} />
                        </div>
                        {/* <div className="col"></div>
                        <div className="col"></div> */}
                        <div className="row" style={{ justifyContent: 'flex-end', textAlign: 'right' }}>
                          <div style={{ fontSize: '0.95rem', marginTop: 10, textAlign: 'right' }}>
                            FECHA EMISIÓN: {new Date().toLocaleString() || '-'}<br />
                          </div>
                        </div>
                    </div>
                    
                    
                    <div style={{ margin: '10px 0' }}>
                      {data.qr_url && (
                        <img src={data.qr_url} alt="QR" style={{ width: 80, height: 80 }} />
                      )}
                    </div>
                  </div>
                </div>
                
              </div>
            ) : title.toLowerCase() === 'permiso' ? (
              // FORMATO PERSONALIZADO PARA PERMISO
              <div
                style={{
                  width: '1400px',
                  // maxWidth: '100vw',
                  background: 'linear-gradient(135deg, #cfe8fdff, #e5d8ffff)',
                  padding: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                  margin: '0 auto'
                }}
              >
                <div style={{ paddingBottom: 12 }}>
                  <img src="/img/tupermiso/logo-texto-permiso.png" style={{ height: 25 }} alt="Logo Permiso" />
                </div>
                <div
                  style={{
                    background: 'center/15% url(/img/tupermiso/marca-agua-simple.png)',
                  }}
                >
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)', padding: 10, borderRadius: 8 }}>
                    {/* Información Contribuyente */}
                    <div
                      style={{
                        display: 'flex',
                        gap: 24,
                        border: '2px dashed #dee2e6',
                        padding: 12,
                        fontFamily: 'Dosis, sans-serif'
                      }}
                    >
                      <div style={{ fontWeight: 700, minWidth: 180 }}>Información Contribuyente</div>
                      <div><b>Nombre:</b> {permiso?.nombre}</div>
                      <div><b>RUT:</b> {permiso?.rut?.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      {/* Información Vehículo */}
                      <div
                        style={{
                          flex: 2,
                          border: '2px dashed #dee2e6',
                          marginRight: 8,
                          padding: 12,
                          fontFamily: 'Dosis, sans-serif'
                        }}
                      >
                        <div style={{ fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Información Vehículo</div>
                        <div style={{ display: 'flex', gap: 32 }}>
                          <div>
                            <div><b>PPU:</b> {permiso?.ppu}</div>
                            <div><b>Marca:</b> {permiso?.marca}</div>
                            <div><b>Modelo:</b> {permiso?.modelo}</div>
                            <div><b>Año:</b> {permiso?.anio}</div>
                            <div><b>Color:</b> {permiso?.color}</div>
                            <div><b>Tipo de Vehículo:</b> {permiso?.tipo_vehiculo}</div>
                            <div><b>Número Motor:</b> {permiso?.motor}</div>
                            <div><b>Número Chasis:</b> {permiso?.chasis}</div>
                          </div>
                          <div>
                            <div><b>Puertas:</b> {permiso?.pts}</div>
                            <div><b>Asientos:</b> {permiso?.ast}</div>
                            <div><b>Cilindrada:</b> {permiso?.cilindrada}</div>
                            <div><b>Capacidad Carga:</b> {permiso?.carga}</div>
                            <div><b>Tipo Combustible:</b> {permiso?.combustible}</div>
                            <div><b>Tipo Sello:</b> {permiso?.tipo_sello}</div>
                            <div><b>Transmisión:</b> {permiso?.transmision}</div>
                          </div>
                        </div>
                      </div>
                      {/* Información Pago */}
                      <div
                        className="col"
                        style={{
                          flex: 1,
                          border: '2px dashed #dee2e6',
                          padding: 12,
                          fontFamily: 'Dosis, sans-serif'
                        }}
                      >
                        <div style={{ fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Información Pago</div>
                        <div className="row">
                          <div className="col">
                            <div><b>Número Comprobante:</b> {data?.id}</div>
                            <div><b>Tasación:</b> ${data?.tasacion?.toLocaleString('es-CL')}</div>
                            <div><b>Código SII:</b> {data?.codigo_sii || 'No disponible'}</div>
                            <div><b>Valor Permiso:</b> ${data?.valor_permiso?.toLocaleString('es-CL')}</div>
                            <div><b>Fecha Pago:</b> {data?.fecha_emision}</div>
                            <div><b>Fecha Vencimiento:</b> {data?.fecha_expiracion}</div>
                          </div>
                          <div className="col" style={{ textAlign: 'center', marginTop: 16 }}>
                            <img src="/img/tupermiso/logo-cert.png" style={{ width: '75%', height: 'auto' }} alt="Certificado" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : title.toLowerCase() === 'soap' ? (
              <div
                style={{
                  background: '#fff',
                  border: '2px solid #222',
                  fontFamily: 'serif',
                  fontSize: '0.8rem',
                  width: '1000px',
                  height: 'auto',
                }}
              >
                <div className="">
                  <div className="col">
                    <div className="row" style={{ borderBottom: '2px solid #222' }}>
                      
                      <div className="col-5" style={{ borderRight: '2px solid #222' }}>
                        <div className="row">
                          <div className="col"><b>ORIGINAL: ASEGURADO</b></div>
                          <div className="col"><b>N° Folio {soap.folio || '-'}</b></div>
                        </div>
                        <div style={{ fontStyle: 'italic', textAlign: 'justify', fontSize: '0.9rem' }}>
                          Este certificado acredita que el vehículo aquí individualizado está
                          asegurado contra el riesgo de Accidentes Personales de acuerdo a la Ley
                          Nº 18.490 y la Póliza del Seguro Obligatorio de Accidentes Personales
                          causados por Vehículos Motorizados, incorporada en el Depósito de
                          Pólizas de la Comisión para el Mercado Financiero bajo el código POL
                          320130487.
                        </div>
                      </div>
                      
                      <div className="col-7">
                        <div className="row text-center">
                          <div className="col"><b>Seguros {soap.compania || '-'} S.A.</b></div>
                          <div className="col">
                            <b>Póliza N° {soap.num_poliza || '-'}</b>
                            <br />
                            <div style={{ fontSize: '0.8rem', textAlign: 'justify' }}>
                              Consulta sobre la vigencia de este seguro en www.seguros{soap.compania.toLowerCase() || '-'}.cl o en el fono 600 411 1000
                            </div>
                          </div>
                        </div>
                        <div className="row text-center">
                          <div className="col"><b>CERTIFICADO SEGURO OBLIGATORIO ACCIDENTES PERSONALES ELECTRONICO LEY 18.490</b></div>
                          <div className="col" style={{ alignContent: 'center', justifyContent: 'center', display: 'flex' }}>
                            <img src={`/img/aseguradoras/${soap.compania}.png`} alt="" style={{ height: '60px', objectFit: 'contain' }} />
                          </div>
                        </div>
                      </div>

                    </div>
                    <div className="row" style={{ borderBottom: '2px solid #222' }}>
                      <div className="col-5" style={{ borderRight: '2px solid #222' }}>
                        <b>Inscripción R.V.M</b>
                        <br />
                        {soap.ppu || '-'}
                      </div>
                      <div className="col-7 d-flex align-self-center">
                        <b>Propietario</b>
                      </div>
                    </div>

                    <div className="row" style={{ borderBottom: '2px solid #222' }}>
                      <div className="col-5" style={{ borderRight: '2px solid #222' }}>
                        <b>Tipo Vehículo</b>
                        <br />
                        {padron.tipo_vehiculo || '-'}
                      </div>
                      <div className="col-7">
                        {padron.rut || '-'}
                      </div>
                    </div>

                    <div className="row" style={{ borderBottom: '2px solid #222' }}>
                      <div className="col-5" style={{ borderRight: '2px solid #222' }}>
                        <b>Marca</b>
                        <br />
                        {padron.marca || '-'}
                      </div>
                      <div className="col-7">
                        <div className="row" style={{ height: '100' }}>
                          <div className="col" style={{ borderRight: '2px solid #222' }}><br /><b>Rut</b></div>
                          <div className="col" style={{ borderRight: '2px solid #222' }}><br /><b>Rige Desde</b></div>
                          <div className="col"><br /><b>Rige Hasta</b></div>
                        </div>
                      </div>
                    </div>

                    <div className="row" style={{ borderBottom: '2px solid #222' }}>
                      <div className="col-5" style={{ borderRight: '2px solid #222' }}>
                        <div className="row">
                          <div className="col">
                            <b>Modelo</b>
                            <br />
                            {padron.modelo || '-'}
                          </div>
                          <div className="col">
                            <b>Año</b>
                            <br />
                            {padron.anio || '-'}
                          </div>
                        </div>
                      </div>
                      <div className="col-7">
                        <div className="row">
                          <div className="col" style={{ borderRight: '2px solid #222' }}><br />{padron.rut || '-'}</div>
                          <div className="col" style={{ borderRight: '2px solid #222' }}><br />{soap.rige_desde || '-'}</div>
                          <div className="col"><br />{soap.rige_hasta || '-'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-5" style={{ borderRight: '2px solid #222' }}>
                        <b>N° Motor</b>
                        <br />
                        {padron.num_motor || '-'}
                      </div>
                      <div className="col-7">
                        <div className="row">
                          <div className="col" style={{ borderRight: '2px solid #222' }}>
                            <b>Prima</b>
                            <br />
                            {soap.prima ? `$${soap.prima.toLocaleString('es-CL')}` : '-'}
                          </div>
                          <div className="col-8">
                            <div className="row">
                              <img src="/img/aseguradoras/timbre.png" alt="" style={{ height: '50px', objectFit: 'contain', flex: 1 }} />
                            </div>
                            <div className="row">
                              <div className="col text-center" style={{ borderTop: '2px solid #222', margin: '0px 50px 0px 50px' }}><b>Firma apoderado compañía</b></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div
                className="row"
                style={{
                  background: '#fff',
                  fontFamily: 'serif',
                  fontSize: '0.8rem',
                  width: 'auto',           // Cambiado de '1200px' a 'auto'
                  maxWidth: '100%',        // Para que no se pase del contenedor
                  minWidth: 1200,           // Opcional: mínimo igual que el modal
                  margin: '0 auto',        // Centrado
                  boxSizing: 'border-box', // Asegura que padding/border no desborden
                }}
              >

                <div className="col" style={{ border: '2px solid #222', marginRight: 16, fontFamily: 'Roboto' }}>
                  <div className="row">
                    <div className="col text-center" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>CERTIFICADO DE REVISIÓN TÉCNICA</div>
                  </div>
                  <div className="row" style={{ borderBottom: '2px solid #222' }}>
                    <div className="col">FECHA REVISIÓN: {revision.fecha || '-'}</div>
                    <div className="col">N°: {revision.nom_certificado || '-'}</div>
                  </div>
                  <div className="row">
                    <div className="col-8" style={{ borderRight: '2px solid #222' }}>
                      <div className="row" style={{ borderBottom: '2px solid #222' }}>
                        <div className="col">
                          {revision.planta || '-'}
                          <br />
                          Santiago, Chile
                          <br />
                          PLANTA: {revision.codigo_planta || '-'} / FONO: 225826218
                        </div>
                      </div>
                      <div className="row text-center" style={{ borderBottom: '2px solid #222' }}>
                        <div className="col" style={{ borderRight: '2px solid #222', fontSize: '1rem' }}>PLACA PATENTE<br /><b>{revision.ppu || '-'}</b></div>
                        <div className="col" style={{ background: 'url(/img/aseguradoras/timbre.png) no-repeat center center', backgroundSize: 'contain', height: '75px', alignSelf: 'center', textAlign: 'center', justifyItems: 'center', alignItems: 'center', fontWeight: 'bold', color: 'black', fontSize: '1.5rem' }}>
                          <br />
                          APROBADO
                        </div>
                      </div>
                      <div className="row">
                        <div className="col">
                          FIRMA ELECTRONICA AVANZADA
                          <br />
                          {revision.fecha || '-'}
                        </div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="row" style={{ borderBottom: '2px solid #222', textAlign: 'center' }}>
                        <div className="col">
                          <img src="/img/qrcode.png" alt="" style={{ height: '200px', objectFit: 'contain' }} />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col">
                          VÁLIDO HASTA
                          <br />
                          {revision.fecha_vencimiento || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col" style={{ border: '2px solid #222', marginLeft: 16 }}>
                  <div className="row" style={{ borderBottom: '2px solid #222' }}>
                    <div className="col-8" style={{ borderRight: '2px solid #222' }}>
                      NOMBRE DEL PROPIETARIO
                      <br />
                      {padron.nombre || '-'}
                    </div>
                    <div className="col-4">
                      RUT
                      <br />
                      {padron.rut || '-'}
                    </div>
                  </div>
                  <div className="row" style={{ borderBottom: '2px solid #222' }}>
                    <div className="col-8" style={{ borderRight: '2px solid #222' }}>
                      TIPO DE VEHICULO
                      <br />
                      {padron.tipo_vehiculo || '-'}
                    </div>
                    <div className="col-4">
                      AÑO
                      <br />
                      {padron.anio || '-'}
                    </div>
                  </div>
                  <div className="row" style={{ borderBottom: '2px solid #222' }}>
                    <div className="col-8" style={{ borderRight: '2px solid #222' }}>
                      MARCA
                      <br />
                      {padron.marca || '-'}
                    </div>
                    <div className="col-4">
                      COLOR
                      <br />
                      {padron.color || '-'}
                    </div>
                  </div>
                  <div className="row" style={{ borderBottom: '2px solid #222' }}>
                    <div className="col-8" style={{ borderRight: '2px solid #222' }}>
                      MODELO
                      <br />
                      {padron.modelo || '-'}
                    </div>
                    <div className="col-4">
                      SELLO
                      <br />
                      {permiso.tipo_sello || '-'}
                    </div>
                  </div>
                  <div className="row" style={{ borderBottom: '2px solid #222' }}>
                    <div className="col">
                      N° CHASIS/N° VIN
                      <br />
                      {padron.num_chasis || '-'} / {padron.num_vin || '-'}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      N° MOTOR
                      <br />
                      {padron.num_motor || '-'}
                    </div>
                  </div>
                </div>
              
              </div>
            )
          ) : (
            <div style={{ textAlign: 'center', color: '#888' }}>No hay datos disponibles.</div>
          )}
        </div>
        {/* Footer */}
        <div style={{
          borderTop: '1px solid #eee',
          padding: '14px 28px',
          textAlign: 'right',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8
        }}>
          <button
            onClick={onClose}
            style={{
              background: '#6D2077',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 22px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Cerrar
          </button>
          <button
            onClick={handleDownload}
            style={{
              background: '#0d6efd',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 22px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Descargar
          </button>
        </div>
      </div>
    </div>
  );
}