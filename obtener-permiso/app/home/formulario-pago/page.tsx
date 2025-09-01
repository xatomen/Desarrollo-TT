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
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    // Lógica para procesar el pago
    console.log('Procesando pago...', formData);
  };

  return (
    <div className="container-fluid px-4 py-4" style={{ fontFamily: '"Dosis", sans-serif' }}>
      <div className="row g-4">
        {/* Columna izquierda - Resumen del vehículo */}
        <div className="col-lg-4 align-self-center">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center p-4">
              <h6 className="text-muted mb-2" style={{ fontWeight: '400', fontSize: '0.875rem' }}>
                Patente a pagar
              </h6>
              <h1 className="display-4 fw-bold mb-3 text-dark" style={{ fontFamily: '"Dosis", sans-serif', fontWeight: '700' }}>
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
          {/* Alerta de error general */}
          {showGeneralError && (
            <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
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
                        Nombre {errors.nombre && <span className="text-danger">*</span>}
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          className={`form-control ${errors.nombre ? 'is-invalid border-danger' : ''}`}
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
                      <small className={errors.nombre ? "text-danger" : "text-muted"}>
                        {errors.nombre || "Ingrese el nombre completo que aparece en su tarjeta"}
                      </small>
                    </div>

                    {/* Correo electrónico */}
                    <div className="mb-3">
                      <label className="form-label fw-medium text-dark">
                        Correo electrónico {errors.correo && <span className="text-danger">*</span>}
                      </label>
                      <div className="input-group">
                        <input
                          type="email"
                          className={`form-control ${errors.correo ? 'is-invalid border-danger' : ''}`}
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
                      <small className={errors.correo ? "text-danger" : "text-muted"}>
                        {errors.correo || "Ingrese un correo electrónico para recibir el comprobante de pago"}
                      </small>
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
                          Número de tarjeta {errors.numeroTarjeta && <span className="text-danger">*</span>}
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">#</span>
                          <input
                            type="text"
                            className={`form-control ${errors.numeroTarjeta ? 'is-invalid border-danger' : ''}`}
                            name="numeroTarjeta"
                            placeholder="1111 2222 3333 4444"
                            value={formData.numeroTarjeta}
                            onChange={handleInputChange}
                            maxLength={19}
                            required
                          />
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className={errors.numeroTarjeta ? "text-danger" : "text-muted"}>
                            {errors.numeroTarjeta || "Ingrese los números frontales de su tarjeta"}
                          </small>
                          {marcaTarjeta && (
                            <small className="badge bg-primary">{marcaTarjeta}</small>
                          )}
                        </div>
                      </div>

                      {/* Tipo de tarjeta */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium text-dark">
                          Tipo de tarjeta {errors.tipoTarjeta && <span className="text-danger">*</span>}
                        </label>
                        <select
                          className={`form-control ${errors.tipoTarjeta ? 'is-invalid border-danger' : ''}`}
                          name="tipoTarjeta"
                          value={formData.tipoTarjeta}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Selecciona el tipo de tarjeta</option>
                          <option value="credito">Crédito</option>
                          <option value="debito">Débito</option>
                          <option value="prepago">Prepago</option>
                        </select>
                        <small className={errors.tipoTarjeta ? "text-danger" : "text-muted"}>
                          {errors.tipoTarjeta || "Seleccione el tipo de tarjeta"}
                        </small>
                      </div>
                    </div>

                    <div className="row">
                      {/* Código de seguridad */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium text-dark">
                          Código de seguridad {errors.codigoSeguridad && <span className="text-danger">*</span>}
                        </label>
                        <div className="input-group">
                          <input
                            type="text"
                            className={`form-control ${errors.codigoSeguridad ? 'is-invalid border-danger' : ''}`}
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
                        <small className={errors.codigoSeguridad ? "text-danger" : "text-muted"}>
                          {errors.codigoSeguridad || "Ingrese el código de seguridad de su tarjeta"}
                        </small>
                      </div>

                      {/* Fecha de vencimiento */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium text-dark">
                          Fecha de vencimiento {errors.fechaVencimiento && <span className="text-danger">*</span>}
                        </label>
                        <div className="input-group">
                          <input
                            type="text"
                            className={`form-control ${errors.fechaVencimiento ? 'is-invalid border-danger' : ''}`}
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
                        <small className={errors.fechaVencimiento ? "text-danger" : "text-muted"}>
                          {errors.fechaVencimiento || "Selecciona la fecha de vencimiento de su tarjeta"}
                        </small>
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