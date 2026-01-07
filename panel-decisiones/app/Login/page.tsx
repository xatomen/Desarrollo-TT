'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Img } from '@/components/Img';

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
  const [formData, setFormData] = useState({
    rut: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    rut: '',
    password: '',
    general: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirección automática si ya está autenticado
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="sr-only">Verificando sesión...</span>
        </div>
      </div>
    );
  }

  // Si ya está autenticado, no mostrar el formulario
  if (isAuthenticated) {
    return null;
  }

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

  // Manejar cambios en contraseña
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      password: valor
    }));
    
    // Limpiar errores si existen
    if (errors.password || errors.general) {
      setErrors(prev => ({
        ...prev,
        password: '',
        general: ''
      }));
    }
  };

  // Validar formulario
  const validarFormulario = (): boolean => {
    const nuevosErrores = {
      rut: '',
      password: '',
      general: ''
    };
    
    // Validar RUT
    if (!formData.rut.trim()) {
      nuevosErrores.rut = 'El RUT es obligatorio';
    } else if (!validarRUT(formData.rut)) {
      nuevosErrores.rut = 'El RUT ingresado no es válido';
    }
    
    // Validar Contraseña
    if (!formData.password.trim()) {
      nuevosErrores.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(nuevosErrores);
    
    // Retornar true si no hay errores
    return !nuevosErrores.rut && !nuevosErrores.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Enviar RUT sin formato (sin puntos ni guión)
      const rutLimpio = formData.rut.replace(/\./g, '').toUpperCase();
      
      const success = await login({
        rut: rutLimpio,
        password: formData.password
      });

      if (success) {
        router.push('/home'); // Redirigir a la página principal
      } else {
        setErrors(prev => ({
          ...prev,
          general: 'Credenciales inválidas. Por favor, verifique su RUT y clave.'
        }));
      }
    } catch (error) {
      console.error('Error en login:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Error de conexión. Por favor, intente nuevamente.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Wrapper: hace sticky footer y ocupa alto completo
    <div className="d-flex flex-column min-vh-100">
      {/* Contenido centrado */}
      <main className="container flex-grow-1 d-flex justify-content-center align-items-center">
        <div className="card shadow-sm p-4 mb-5" style={{ maxWidth: "480px", width: "100%" }}>
          <div className="text-center mb-4">
            <Img src="/img/gob-header.svg" alt="Gobierno de Chile" height={70} />
            <h1 className="h4 mt-3 font-weight-bold">Dashboard</h1>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Error general */}
            {errors.general && (
              <div className="alert alert-danger" role="alert">
                {errors.general}
              </div>
            )}

            {/* Rut */}
            <div className="form-group">
              <label htmlFor="rut">Ingrese su Rut</label>
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
                  disabled={isSubmitting}
                />
                <div className="input-group-append">
                  <span className="input-group-text"><i className="cl cl-user"></i></span>
                </div>
                {errors.rut && (
                  <div className="invalid-feedback">
                    {errors.rut}
                  </div>
                )}
              </div>
              <small className="form-text text-muted">Formato: 12.345.678-9 (se formatea automáticamente)</small>
            </div>

            {/* Clave Única */}
            <div className="form-group">
              <label htmlFor="password">Ingrese su contraseña</label>
              <div className="input-group">
                <input 
                  id="password" 
                  name="password" 
                  className={`form-control ${errors.password ? 'is-invalid' : formData.password.length >= 6 ? 'is-valid' : ''}`}
                  type="password" 
                  placeholder="Credencial"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  minLength={6}
                  disabled={isSubmitting}
                />
                <div className="input-group-append">
                  <span className="input-group-text"><i className="cl cl-key"></i></span>
                </div>
                {errors.password && (
                  <div className="invalid-feedback">
                    {errors.password}
                  </div>
                )}
              </div>
              <small className="form-text text-muted">Mínimo 6 caracteres</small>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <i className="cl cl-login mr-2"></i> Iniciar sesión
                </>
              )}
            </button>
          </form>
        </div>
      </main>
      <footer className="content-always-on-display">
        <div className="container">
          <div className="line"></div>
          <div className="row">
            <div className="col-md-3 a11y-fonts-col-12"><img className="mw-100 mb-3" src="/img/favicon/ms-icon-150x150.png"/>
              <p>La alternativa para digitalizar los trámites de la ciudadanía.</p>
              <p>Esta plataforma es administrada:</p><img className="mw-100 mb-3" src="/img/gob-footer.svg"/><a className="py-0" href="www.digital.gob.cl">www.digital.gob.cl</a>
            </div>
            <div className="col-md-3 a11y-fonts-col-12">
              <div className="text-uppercase mb-3">Secciones</div><a href="#">Conjuntos de Datos</a><a href="#">Organizaciones</a><a href="#">Categorías</a><a href="#">Documentos</a><a href="#">Ayuda</a><a href="#">Iniciativas Destacadas</a>
            </div>
            <div className="col-md-3 a11y-fonts-col-12">
              <div className="text-uppercase mb-3">Enlaces internos</div><a href="#">Políticas de Privacidad</a><a href="#">Normativas</a><a href="#">Términos y Condiciones</a><a href="#">Sitios relacinados</a><a href="#">Licenciamiento</a><a href="#">Notificar error</a>
            </div>
            <div className="col-md-3 a11y-fonts-col-12">
              <div className="text-uppercase mb-3">Ayuda institucional</div><a href="#">Ingreso de solicitud de ayuda</a><b className="d-block mt-3">Mesa de Ayuda</b>
              <p className="mb-0">
                Horario Lu - Vi / 9:00hrs -
                18:00hrs
              </p><a className="py-0" href="tel:6003970000">600 397 0000</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

