'use client';

import { useState } from 'react';
import { 
  emailTemplate, 
  fiestasPatriasTemplate, 
  anoNuevoTemplate, 
  navidadTemplate, 
  primaveraTemplate, 
  eleganteTemplate 
} from '../../components/email_templates/emailTemplate';

export default function Page() {
  const [selectedTemplate, setSelectedTemplate] = useState('recordatorio_pago');
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado para loading

  const documento = {
    permiso: 'Permiso de Circulación',
    revision: 'Revisión Técnica',
    soap: 'Seguro Obligatorio (SOAP)',
    multas_transito: 'Multas de Tránsito',
    multas_rpi: 'Multas RPI',
  };

  const emailStyles = {
    recordatorio_pago: {
      title: 'Recordatorio de Pago de Documentos Vehiculares',
      subject: '¡No olvides pagar tus documentos en TU PERMISO!',
      template: emailTemplate,
    },
    fiestas_patrias: {
      title: 'Fiestas Patrias - Celebración y Documentación',
      subject: '🇨🇱 ¡Celebra las Fiestas Patrias con TU PERMISO al día!',
      template: fiestasPatriasTemplate,
    },
    ano_nuevo: {
      title: 'Año Nuevo - Actualiza tu Permiso',
      subject: '🎆 ¡Comienza el 2025 con TU PERMISO actualizado!',
      template: anoNuevoTemplate,
    },
    navidad: {
      title: 'Navidad - Regálate Tranquilidad',
      subject: '🎄 ¡Feliz Navidad! Regálate tranquilidad con TU PERMISO',
      template: navidadTemplate,
    },
    primavera: {
      title: 'Primavera - Renueva tu Permiso',
      subject: '🌸 ¡Florece esta Primavera con TU PERMISO renovado!',
      template: primaveraTemplate,
    },
    elegante: {
      title: 'Estilo Elegante - Profesional y Sofisticado',
      subject: 'TU PERMISO - Recordatorio de documentación vehicular',
      template: eleganteTemplate,
    }
  };

  // Función para manejar el cambio de plantilla
  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    setShowPreview(false); // Resetear vista previa al cambiar plantilla
  };

  // Función para mostrar/ocultar vista previa
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Función actualizada para enviar campaña con SendGrid
  const handleSendCampaign = async () => {
    setIsLoading(true);
    
    try {
      const selectedStyle = emailStyles[selectedTemplate as keyof typeof emailStyles];
      
      // Datos para modo demo (puedes expandir esto para envío masivo)
      const emailData = {
        to: 'jgallardoc@utem.cl', // Email de prueba
        subject: selectedStyle.subject,
        html: selectedStyle.template,
        templateType: selectedTemplate
      };

      console.log('Enviando campaña con datos:', emailData);

      // Llamar a la API de envío
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Campaña enviada con éxito!\n📧 Enviado a: ${result.sentTo}\n🎨 Plantilla: ${selectedStyle.subject}`);
        console.log('Respuesta exitosa:', result);
      } else {
        throw new Error(result.error || 'Error desconocido');
      }

    } catch (error: any) {
      console.error('Error enviando campaña:', error);
      alert(`❌ Error enviando campaña:\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Función actualizada para envío de prueba
  const handleTestSend = async () => {
    setIsLoading(true);
    
    try {
      const selectedStyle = emailStyles[selectedTemplate as keyof typeof emailStyles];
      
      const emailData = {
        to: 'jgallardoc@utem.cl',
        subject: `[PRUEBA] ${selectedStyle.subject}`,
        html: selectedStyle.template,
        templateType: `test_${selectedTemplate}`
      };

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`🧪 Correo de prueba enviado exitosamente!\n📧 Enviado a: ${result.sentTo}`);
      } else {
        throw new Error(result.error || 'Error desconocido');
      }

    } catch (error: any) {
      console.error('Error enviando prueba:', error);
      alert(`❌ Error enviando prueba:\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h1 className="h3 d-flex align-items-center gap-3 mb-3 text-primary">
                <span role="img" aria-label="email" className="fs-2">📨</span>
                Campaña de Correos Electrónicos
              </h1>
              <p className="text-muted mb-0">
                Envía notificaciones personalizadas a los propietarios de vehículos sobre documentos vencidos y por vencer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h5 className="card-title mb-4 d-flex align-items-center gap-2">
                <span role="img" aria-label="settings">⚙️</span>
                Configuración de Campaña
              </h5>
              
              {/* Template Selection */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <label htmlFor="templateSelect" className="form-label fw-semibold">
                    <span role="img" aria-label="template" className="me-2">🎨</span>
                    Seleccionar Plantilla de Email
                  </label>
                  <select 
                    id="templateSelect"
                    className="form-select form-select-lg"
                    style={{ height: '50px',
                      padding: '0.375rem 0.75rem',
                      fontSize: '1.25rem',
                      lineHeight: '1.5',
                      borderRadius: '0.375rem',
                      border: '1px solid #ced4da',
                      backgroundColor: '#fff',
                      backgroundClip: 'padding-box',
                      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                    }}
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                  >
                    {emailStyles && Object.entries(emailStyles).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.title}
                      </option>
                    ))}
                  </select>
                  <div className="form-text">
                    Elige la plantilla más adecuada según la época del año o el tono deseado.
                  </div>
                </div>
                
                <div className="col-md-6 d-flex align-items-end">
                  <div className="w-100">
                    <label className="form-label fw-semibold">
                      <span role="img" aria-label="preview" className="me-2">👀</span>
                      Vista Previa del Asunto
                    </label>
                    <div className="p-3 bg-light rounded border" style={{ height: '50px', display: 'flex', alignItems: 'center' }}>
                      <small className="text-dark fw-medium">
                        {emailStyles[selectedTemplate as keyof typeof emailStyles]?.subject || 'Selecciona una plantilla'}
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="row">
                <div className="col-12">
                  <div className="d-flex gap-3 justify-content-center flex-wrap">
                    <button 
                      type="button"
                      className="btn btn-outline-primary px-4 py-2"
                      onClick={togglePreview}
                      disabled={isLoading}
                    >
                      <span role="img" aria-label="preview" className="me-2">👁️</span>
                      {showPreview ? 'Ocultar Vista Previa' : 'Ver Vista Previa'}
                    </button>
                    
                    <button 
                      type="button"
                      className={`btn btn-primary px-5 py-2 ${isLoading ? 'disabled' : ''}`}
                      onClick={handleSendCampaign}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <span role="img" aria-label="send" className="me-2">🚀</span>
                          Enviar Campaña
                        </>
                      )}
                    </button>
                    
                    <button 
                      type="button"
                      className="btn btn-outline-secondary px-4 py-2"
                      onClick={handleTestSend}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <span role="img" aria-label="test" className="me-2">🧪</span>
                          Envío de Prueba
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Vista Previa del Email */}
              {showPreview && (
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="card border-primary">
                      <div className="card-header bg-primary text-white">
                        <h6 className="mb-0 d-flex align-items-center gap-2">
                          <span role="img" aria-label="email">📧</span>
                          Vista Previa del Email - {emailStyles[selectedTemplate as keyof typeof emailStyles]?.subject}
                        </h6>
                      </div>
                      <div className="card-body p-0">
                        <div 
                          className="email-preview"
                          style={{ 
                            maxHeight: '600px', 
                            overflowY: 'auto',
                            border: 'none'
                          }}
                          dangerouslySetInnerHTML={{ 
                            __html: emailStyles[selectedTemplate as keyof typeof emailStyles]?.template || '' 
                          }}
                        />
                      </div>
                      <div className="card-footer text-muted">
                        <small>
                          <span role="img" aria-label="info" className="me-1">ℹ️</span>
                          Esta es una vista previa del email que se enviará a los propietarios de vehículos.
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Information Panel */}
              <div className="row mt-4">
                <div className="col-12">
                  <div className="alert alert-info border-0" role="alert">
                    <div className="d-flex align-items-start gap-3">
                      <span role="img" aria-label="info" className="fs-4">ℹ️</span>
                      <div>
                        <h6 className="alert-heading mb-2">Información de la Campaña</h6>
                        <p className="mb-2">
                          <strong>Modo Demo:</strong> El sistema enviará un correo de prueba a una dirección fija para demostración.
                        </p>
                        <p className="mb-0">
                          <strong>Documentos incluidos:</strong> Permiso de Circulación, SOAP, Multas de Tránsito y Multas RPI.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


//=============================================================================

  // // Lógica de envío de correos (A nivel completo - No se aplica debido a la gran cantidad de datos y correos a enviar que esto implicaría)
  // // 1. Recuperar el listado de todos los padrones vehículares desde el SRCEI
  // // 2. Agregar en un set el listado de RUTs únicos de los propietarios
  // // 3. Transformar el set en un map y a cada rut, obtener el correo electrónico asociado desde el SGD
  // // 4. Crear map <<rut,correo>,[array patentes]>> y a cada rut, obtener el listado de patentes asociadas desde el BACKEND
  // // 5. Consultar Permiso, Revisión Técnica, SOAP y Multas de tránsito desde el BACKEND para cada patente
  // // 6. Consultar multas RPI desde el BACKEND para cada rut
  // // 7. Generar el contenido del correo para cada rut con la información obtenida y de acuerdo al botón presionado
  // // 8. Enviar el correo electrónico a cada rut con el contenido generado

  // // Lógica de envío de correos (A nivel demostrativo - Solo se envía un correo de prueba a un rut y patente fijos)
  // // 1. Definir rut y patente fijos para la demostración
  // const rutFijo = '20961960-1';
  // const nombreFijo = 'Jorge Gallardo';
  // const patentes = ['HFXX27', 'AH1234', 'BWFD87', 'CBKS56', 'BRK90', 'RSDY20'];
  // const correoFijo = 'jgallardoc@utem.cl';
  // // 2. Consultar Permiso, Revisión Técnica, SOAP y Multas de tránsito desde el BACKEND para la patente fija
  // for (const patente of patentes) {
  //   // Aquí se realizaría la consulta al BACKEND para cada patente
  //   // Ejemplo: await consultarDatosVehiculo(patente);
  // }
  // // 3. Consultar multas RPI desde el BACKEND para el rut fijo
  // // 4. Generar el contenido del correo para el rut fijo con la información obtenida y de acuerdo al botón presionado
  // // 5. Enviar el correo electrónico al rut fijo con el contenido generado