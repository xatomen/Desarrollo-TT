// ModalVehicular.tsx
import React from 'react';

export default function ModalVehicular({ show, onClose, title, data }: {
  show: boolean;
  onClose: () => void;
  title: string;
  data: any;
}) {
  if (!show) return null;

  // Cierra el modal al hacer click fuera del contenido
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

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
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          minWidth: 340,
        //   maxWidth: 820,
          width: title.toLowerCase() === 'padron' ? '1200px' : 500,
          boxShadow: '0 8px 32px #0003',
          padding: 0,
          position: 'relative',
          animation: 'modalIn 0.2s',
        }}
      >
        {/* Header */}
        <div style={{
          borderBottom: '1px solid #eee',
          padding: '18px 28px 12px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
        <div style={{
          padding: '24px 28px',
          maxHeight: 480,
          overflowY: 'auto',
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
                                <td>: {data.propietario || data.nombre || '-'}</td>
                            </tr>
                            <tr>
                                <td>DOMICILIO</td>
                                <td>: {data.domicilio || '-'}</td>
                            </tr>
                            <tr>
                                <td><br /></td>
                                <td><br /></td>
                            </tr>
                            <tr>
                                <td>TIPO VEHICULO</td>
                                <td>: {data.tipo_vehiculo || '-'}</td>
                            </tr>
                            <tr>
                                <td>AÑO</td>
                                <td>: {data.anio || '-'}</td>
                            </tr>
                            <tr>
                                <td>MARCA</td>
                                <td>: {data.marca || '-'}</td>
                            </tr>
                            <tr>
                                <td>MODELO</td>
                                <td>: {data.modelo || '-'}</td>
                            </tr>
                            <tr>
                                <td>Nro. MOTOR</td>
                                <td>: {data.num_motor || '-'}</td>
                            </tr>
                            <tr>
                                <td>Nro. CHASIS</td>
                                <td>: {data.num_chasis || '-'}</td>
                            </tr>
                            <tr>
                                <td>Nro. SERIE</td>
                                <td>: {data.serie || '-'}</td>
                            </tr>
                            <tr>
                                <td>Nro. VIN</td>
                                <td>: {data.num_vin || '-'}</td>
                            </tr>
                            <tr>
                                <td>COLOR</td>
                                <td>: {data.color || '-'}</td>
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
                                            <td style={{ fontWeight: 'bold' }}>: {data.ppu || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ fontWeight: 'bold' }}>RUN o RUT</td>
                                            <td style={{ fontWeight: 'bold' }}>: {data.rut || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td>ADQUISICIÓN</td>
                                            <td>: {data.fecha_inscripcion || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td>INSCRIPCIÓN</td>
                                            <td>: {data.fecha_inscripcion || '-'}</td>
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
            ) : (
              // FORMATO TABLA PARA OTROS DOCUMENTOS
              <table style={{ width: '100%', fontSize: '1rem', borderCollapse: 'collapse' }}>
                <tbody>
                  {Object.entries(data).map(([key, value]) => (
                    <tr key={key}>
                      <td style={{ fontWeight: 500, padding: '6px 10px', borderBottom: '1px solid #eee', width: 180 }}>{key}</td>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #eee' }}>{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
        </div>
      </div>
    </div>
  );
}