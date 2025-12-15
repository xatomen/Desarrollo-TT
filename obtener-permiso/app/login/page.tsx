'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FiHelpCircle } from "react-icons/fi";
import { Img } from "@/components/Img";

// Función para validar RUT chileno
function validarRUT(rut: string): boolean {
  // Limpiar el RUT
  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  
  // Verificar formato básico
  if (!/^\d{7,8}[0-9K]$/.test(rutLimpio)) {
    return false;
  }
  
  // Obtener dígitos y dígito verificador
  const digitos = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  
  // Calcular dígito verificador
  let suma = 0;
  let multiplicador = 2;
  
  for (let i = digitos.length - 1; i >= 0; i--) {
    suma += parseInt(digitos[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const resto = suma % 11;
  const dvCalculado = resto === 0 ? '0' : resto === 1 ? 'K' : (11 - resto).toString();
  
  return dv === dvCalculado;
}

// Función para formatear RUT automáticamente
function formatearRUT(valor: string): string {
  // Eliminar todo lo que no sea número o K
  const limpio = valor.replace(/[^0-9kK]/g, '').toUpperCase();
  
  // Si está vacío, retornar vacío
  if (limpio.length === 0) return '';
  
  // Si solo tiene un carácter, retornarlo
  if (limpio.length === 1) return limpio;
  
  // Separar cuerpo y dígito verificador
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  
  // Formatear el cuerpo con puntos
  let cuerpoFormateado = '';
  for (let i = 0; i < cuerpo.length; i++) {
    if (i > 0 && (cuerpo.length - i) % 3 === 0) {
      cuerpoFormateado += '.';
    }
    cuerpoFormateado += cuerpo[i];
  }
  
  // Retornar con guión antes del dígito verificador
  return `${cuerpoFormateado}-${dv}`;
}

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    rut: '',
    claveUnica: ''
  });
  const [errors, setErrors] = useState({
    rut: '',
    claveUnica: '',
    general: ''
  });
  const [showClaveUnicaHelp, setShowClaveUnicaHelp] = useState(false);

  // Manejar cambios en el input de RUT
  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    
    // Solo permitir números, puntos, guión y K
    if (!/^[0-9kK.\-]*$/.test(valor)) {
      return; // No actualizar si contiene caracteres inválidos
    }
    
    // Limitar longitud máxima (12.345.678-9 = 12 caracteres)
    if (valor.length > 12) {
      return;
    }
    
    // Formatear automáticamente
    const rutFormateado = formatearRUT(valor);
    
    setFormData(prev => ({
      ...prev,
      rut: rutFormateado
    }));
    
    // Limpiar errores si existen
    if (errors.rut || errors.general) {
      setErrors(prev => ({
        ...prev,
        rut: '',
        general: ''
      }));
    }
  };

  // Manejar cambios en clave única
  const handleClaveUnicaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      claveUnica: valor
    }));
    
    // Limpiar errores si existen
    if (errors.claveUnica || errors.general) {
      setErrors(prev => ({
        ...prev,
        claveUnica: '',
        general: ''
      }));
    }
  };

  // Validar formulario
  const validarFormulario = (): boolean => {
    const nuevosErrores = {
      rut: '',
      claveUnica: '',
      general: ''
    };
    
    // Validar RUT
    if (!formData.rut.trim()) {
      nuevosErrores.rut = 'El RUT es obligatorio';
    } else if (!validarRUT(formData.rut)) {
      nuevosErrores.rut = 'El RUT ingresado no es válido';
    }
    
    // Validar Clave Única
    if (!formData.claveUnica.trim()) {
      nuevosErrores.claveUnica = 'La Clave Única es obligatoria';
    } else if (formData.claveUnica.length < 6) {
      nuevosErrores.claveUnica = 'La Clave Única debe tener al menos 6 caracteres';
    }
    
    setErrors(nuevosErrores);
    
    // Retornar true si no hay errores
    return !nuevosErrores.rut && !nuevosErrores.claveUnica;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    try {
      // ✅ Enviar RUT con formato original (con puntos y guión)
      // La API espera el RUT en formato "20961960-1"
      formData.rut = formData.rut.replace(/\./g, '').toUpperCase();
      const success = await login(formData.rut, formData.claveUnica);
      
      if (!success) {
        setErrors(prev => ({
          ...prev,
          general: 'Credenciales inválidas. Verifique su RUT y Clave Única.'
        }));
      }
      // Si el login es exitoso, el AuthContext se encarga de la redirección
      
    } catch (error) {
      console.error('Error en login:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Error al conectar con el servidor. Intente nuevamente.'
      }));
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="container flex-grow-1 d-flex justify-content-center align-items-center">
        <div className="card shadow-sm p-4 mb-5" style={{ maxWidth: "480px", width: "100%" }}>
          <div className="text-center mb-4">
            <Img src="/img/gob-header.svg" alt="Gobierno de Chile" height={70} />
            <h1 className="h4 mt-3 font-weight-bold">Permiso de Circulación</h1>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Error general */}
            {errors.general && (
              <div className="alert alert-danger" role="alert">
                {errors.general}
              </div>
            )}

            {/* RUT */}
            <div className="form-group">
              <label htmlFor="rut">Ingrese su RUT</label>
              <div className="input-group">
                <input 
                  id="rut" 
                  name="rut" 
                  className={`form-control ${errors.rut ? 'is-invalid' : formData.rut && validarRUT(formData.rut) ? 'is-valid' : ''}`}
                  type="text" 
                  placeholder="12.345.678-9"
                  value={formData.rut}
                  onChange={handleRutChange}
                  maxLength={12}
                  autoComplete="off"
                  disabled={isLoading}
                />
                <div className="input-group-append">
                  <span className="input-group-text">
                    <i className="cl cl-user"></i>
                  </span>
                </div>
                {errors.rut && (
                  <div className="invalid-feedback">
                    {errors.rut}
                  </div>
                )}
              </div>
              <small className="form-text text-muted">
                Formato: 12.345.678-9 (se formatea automáticamente)
              </small>
            </div>

            {/* Clave Única */}
            <div className="form-group">
              <label htmlFor="claveUnica" className="d-flex align-items-center">
                Ingrese su Clave Única
                <button
                  type="button"
                  className="btn btn-link p-0 ml-2"
                  style={{ lineHeight: 1 }}
                  tabIndex={-1}
                  onClick={() => setShowClaveUnicaHelp(true)}
                  aria-label="¿Qué es la Clave Única?"
                >
                  <FiHelpCircle />
                </button>
              </label>
              <div className="input-group">
                <input 
                  id="claveUnica" 
                  name="claveUnica" 
                  className={`form-control ${errors.claveUnica ? 'is-invalid' : formData.claveUnica.length >= 6 ? 'is-valid' : ''}`}
                  type="password" 
                  placeholder="Clave Única"
                  value={formData.claveUnica}
                  onChange={handleClaveUnicaChange}
                  minLength={6}
                  disabled={isLoading}
                />
                <div className="input-group-append">
                  <span className="input-group-text">
                    <i className="cl cl-key"></i>
                  </span>
                </div>
                {errors.claveUnica && (
                  <div className="invalid-feedback">
                    {errors.claveUnica}
                  </div>
                )}
              </div>
              <small className="form-text text-muted">
                Mínimo 6 caracteres
              </small>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm mr-2" role="status"></span>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <i className="cl cl-login mr-2"></i>
                  Iniciar sesión
                </>
              )}
            </button>
          </form>

          {/* Modal de ayuda Clave Única */}
          {showClaveUnicaHelp && (
            <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex={-1} role="dialog">
              <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <i className="cl cl-help mr-2" style={{ fontSize: 24, color: "#0051A8" }}></i>
                    <h5 className="modal-title" style={{ fontFamily: "Roboto, sans-serif", fontWeight: 'bold' }}>¿Qué es la Clave Única?</h5>
                    <button type="button" className="close" onClick={() => setShowClaveUnicaHelp(false)} aria-label="Cerrar">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <p>
                      <b>La Clave Única</b> es una contraseña personal que se obtiene en el <b>Servicio de Registro Civil e Identificación (SRCeI)</b> y permite acceder a trámites y servicios digitales del Estado.
                    </p>
                    <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
                      <li>Es la misma clave que usas para el Registro Social de Hogares, Fonasa, y otros servicios públicos.</li>
                      <li>Si no la tienes, puedes solicitarla presencialmente en el Registro Civil o en <a href="https://claveunica.gob.cl" target="_blank" rel="noopener noreferrer">claveunica.gob.cl</a>.</li>
                      <li>Si la olvidaste, puedes recuperarla en el mismo sitio web.</li>
                    </ul>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-primary" onClick={() => setShowClaveUnicaHelp(false)}>
                      Entendido
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="content-always-on-display">
        <div className="container">
          <div className="line"></div>
          <div className="row">
            <div className="col-md-3 a11y-fonts-col-12">
              <Img className="mw-100 mb-3" src="/img/favicon/ms-icon-150x150.png"/>
              <p>La alternativa para digitalizar los trámites de la ciudadanía.</p>
              <p>Esta plataforma es administrada:</p>
              <Img className="mw-100 mb-3" src="/img/gob-footer.svg"/>
              <a className="py-0" href="www.digital.gob.cl">www.digital.gob.cl</a>
            </div>
            <div className="col-md-3 a11y-fonts-col-12">
              <div className="text-uppercase mb-3">Secciones</div>
              <a href="#">Conjuntos de Datos</a>
              <a href="#">Organizaciones</a>
              <a href="#">Categorías</a>
              <a href="#">Documentos</a>
              <a href="#">Ayuda</a>
              <a href="#">Iniciativas Destacadas</a>
            </div>
            <div className="col-md-3 a11y-fonts-col-12">
              <div className="text-uppercase mb-3">Enlaces internos</div>
              <a href="#">Políticas de Privacidad</a>
              <a href="#">Normativas</a>
              <a href="#">Términos y Condiciones</a>
              <a href="#">Sitios relacionados</a>
              <a href="#">Licenciamiento</a>
              <a href="#">Notificar error</a>
            </div>
            <div className="col-md-3 a11y-fonts-col-12">
              <div className="text-uppercase mb-3">Ayuda institucional</div>
              <a href="#">Ingreso de solicitud de ayuda</a>
              <b className="d-block mt-3">Mesa de Ayuda</b>
              <p className="mb-0">
                Horario Lu - Vi / 9:00hrs - 18:00hrs
              </p>
              <a className="py-0" href="tel:6003970000">600 397 0000</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
