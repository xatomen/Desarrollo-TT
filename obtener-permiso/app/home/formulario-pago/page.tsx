'use client';
import { useState, useEffect } from 'react';

export default function FormularioPago() {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    numeroTarjeta: '',
    tipoTarjeta: '',
    codigoSeguridad: '',
    fechaVencimiento: ''
  });

  const [marcaTarjeta, setMarcaTarjeta] = useState('');

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'numeroTarjeta') {
      const numeroFormateado = formatearNumeroTarjeta(value);
      const marca = detectarMarcaTarjeta(numeroFormateado);
      setMarcaTarjeta(marca);
      setFormData(prev => ({
        ...prev,
        [name]: numeroFormateado
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para procesar el pago
    console.log('Procesando pago...', formData);
  };

  return (
    <div className="container-fluid px-4 py-4" style={{ fontFamily: '"Roboto", Arial, sans-serif' }}>
      <div className="row g-4">
        {/* Columna izquierda - Resumen del vehículo */}
        <div className="col-lg-4 align-self-center">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center p-4">
              <h6 className="text-muted mb-2" style={{ fontWeight: '400', fontSize: '0.875rem' }}>
                Patente a pagar
              </h6>
              <h1 className="display-4 fw-bold mb-3 text-dark" style={{ fontWeight: '700' }}>
                AA BB 11
              </h1>
              
              <div className="mb-3">
                <p className="text-muted mb-1" style={{ fontSize: '0.875rem' }}>RUT</p>
                <p className="fw-bold text-dark" style={{ fontSize: '1.25rem' }}>12.345.678-9</p>
              </div>
              
              <div className="mt-4">
                <h6 className="text-muted mb-2" style={{ fontWeight: '400', fontSize: '0.875rem' }}>
                  Valor Permiso de Circulación
                </h6>
                <h2 className="fw-bold mb-0 text-dark" style={{ fontWeight: '700', fontSize: '2.5rem' }}>
                  $75.000
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Formularios */}
        <div className="col-lg-8">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* Datos de Facturación */}
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-light">
                    <h5 className="mb-0 fw-bold text-dark" style={{ fontWeight: '600', fontSize: '1.125rem' }}>
                      Datos de Facturación
                    </h5>
                  </div>
                  <div className="card-body">
                    {/* Nombre */}
                    <div className="mb-3">
                      <label className="form-label fw-medium text-dark">
                        Nombre
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          name="nombre"
                          placeholder="Ingrese nombre completo"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          required
                        />
                        <span className="input-group-text">
                          <i className="bi bi-person"></i>
                        </span>
                      </div>
                      <small className="text-muted">Ingrese el nombre completo que aparece en su tarjeta</small>
                    </div>

                    {/* Correo electrónico */}
                    <div className="mb-3">
                      <label className="form-label fw-medium text-dark">
                        Correo electrónico
                      </label>
                      <div className="input-group">
                        <input
                          type="email"
                          className="form-control"
                          name="correo"
                          placeholder="ejemplo@ejemplo.com"
                          value={formData.correo}
                          onChange={handleInputChange}
                          required
                        />
                        <span className="input-group-text">
                          <i className="bi bi-envelope"></i>
                        </span>
                      </div>
                      <small className="text-muted">Ingrese un correo electrónico para recibir el comprobante de pago</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos de Tarjeta */}
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-light">
                    <h5 className="mb-0 fw-bold text-dark" style={{ fontWeight: '600', fontSize: '1.125rem' }}>
                      Datos de Tarjeta
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {/* Número de tarjeta */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium text-dark">
                          Número de tarjeta
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">#</span>
                          <input
                            type="text"
                            className="form-control"
                            name="numeroTarjeta"
                            placeholder="1111 2222 3333 4444"
                            value={formData.numeroTarjeta}
                            onChange={handleInputChange}
                            maxLength={19}
                            required
                          />
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">Ingrese los números frontales de su tarjeta</small>
                          {marcaTarjeta && (
                            <small className="badge bg-primary">{marcaTarjeta}</small>
                          )}
                        </div>
                      </div>

                      {/* Tipo de tarjeta */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium text-dark">
                          Tipo de tarjeta
                        </label>
                        <select
                          className="form-select"
                          name="tipoTarjeta"
                          value={formData.tipoTarjeta}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Seleccione el tipo de tarjeta</option>
                          <option value="credito">Crédito</option>
                          <option value="debito">Débito</option>
                          <option value="prepago">Prepago</option>
                        </select>
                        <small className="text-muted">Seleccione el tipo de tarjeta</small>
                      </div>
                    </div>

                    <div className="row">
                      {/* Código de seguridad */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium text-dark">
                          Código de seguridad
                        </label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            name="codigoSeguridad"
                            placeholder="123"
                            value={formData.codigoSeguridad}
                            onChange={handleInputChange}
                            maxLength={4}
                            required
                          />
                          <span className="input-group-text">
                            <i className="bi bi-shield-lock"></i>
                          </span>
                        </div>
                        <small className="text-muted">Ingrese el código de seguridad de su tarjeta</small>
                      </div>

                      {/* Fecha de vencimiento */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium text-dark">
                          Fecha de vencimiento
                        </label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            name="fechaVencimiento"
                            placeholder="MM / AA"
                            value={formData.fechaVencimiento}
                            onChange={handleInputChange}
                            maxLength={7}
                            required
                          />
                          <span className="input-group-text">
                            <i className="bi bi-calendar"></i>
                          </span>
                        </div>
                        <small className="text-muted">Selecciona la fecha de vencimiento de su tarjeta</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de pago */}
              <div className="col-12">
                <div className="d-grid">
                  <button 
                    type="submit"
                    className="btn btn-lg py-3 text-white fw-bold"
                    style={{ 
                      backgroundColor: '#0d6efd', 
                      border: 'none',
                      fontWeight: '600'
                    }}
                  >
                    Pagar
                    <span className="ms-2">→</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}