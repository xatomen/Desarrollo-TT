'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
// Importar iconos de Bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState } from 'react';
import { transform } from 'html2canvas/dist/types/css/property-descriptors/transform';

export default function HomePage() {
  // Obtener usuario desde user_data en Cookies
  const [user, setUser] = useState({ rut: '', name: '', email: '' });

  useEffect(() => {
    const cookieValue = document.cookie.split('user_data=')[1]?.split(';')[0];
    if (cookieValue) {
      const decodedValue = decodeURIComponent(cookieValue);
      const userData = JSON.parse(decodedValue);
      setUser({
        rut: userData.rut || '',
        name: userData.nombre || '',
        email: userData.email || ''
      });
    }
  }, []);
  const router = useRouter();
  return (
    <ProtectedRoute>
      <div className="" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div
          className="card-like p-4 m-4 shadow"
          style={{
            background: 'linear-gradient(135deg, #e0e7ff 0%, #fbeaf6 100%)',
            color: '#222',
            borderRadius: '22px',
            boxShadow: '0 6px 24px #0002',
            textAlign: 'center',
            fontFamily: 'Dosis, Roboto, Arial, sans-serif',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Marca de agua decorativa */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-18deg)',
              fontSize: '5rem',
              color: '#6D20771a',
              fontWeight: 900,
              letterSpacing: '8px',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 0,
              textShadow: '0 2px 16px #fff8'
            }}
          >
            {/* TU PERMISO */}
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p
              style={{
                fontWeight: 700,
                fontSize: '2.3rem',
                marginTop: '1.5rem',
                marginBottom: '0.5rem',
                letterSpacing: '1px',
                color: '#6D2077',
                fontFamily: 'Dosis, Roboto, Arial, sans-serif',
                textShadow: '1px 1px 8px #fff'
              }}
            >
              ¡Bienvenido{user.name ? `, ${user.name}` : ''}!
            </p>
            <p
              style={{
                fontSize: '1.15rem',
                marginBottom: '0.5rem',
                fontWeight: 500,
                letterSpacing: '0.5px',
                color: '#222'
              }}
            >
              <span style={{ fontWeight: 700, color: '#D00070', textShadow: '0 1px 8px #fff4' }}>Tu Permiso</span> es tu plataforma digital para gestionar permisos de circulación y mantener todos tus documentos vehiculares organizados y accesibles.
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '1.2rem 0 0.5rem 0'
              }}
            >
              <span style={{ color: '#555', fontSize: '1.05rem' }}>
                <i className="bi bi-person-badge" style={{ color: '#6D2077', marginRight: 6 }}></i>
                <b>RUT:</b> {user.rut || 'No disponible'}
              </span>
              <span style={{ color: '#555', fontSize: '1.05rem' }}>
                <i className="bi bi-envelope" style={{ color: '#6D2077', marginRight: 6 }}></i>
                <b>Email:</b> {user.email || 'No disponible'}
              </span>
            </div>
            <hr style={{ margin: '1.5rem 0', borderColor: '#6D2077' }} />
            <div style={{ fontSize: '1.08rem', color: '#333', fontWeight: 500 }}>
              <i className="bi bi-info-circle" style={{ color: '#00C7B1', marginRight: 6 }}></i>
              Desde aquí puedes pagar tus permisos, revisar tu historial y acceder a todos los documentos de tus vehículos de forma rápida y segura.
            </div>
          </div>
        </div>
        {/* Tres secciones */}
        <div className="row mx-2">
          <div className="col mb-4 card-like p-3 m-3 shadow">
            <h4 className="text-center" style={{ fontFamily: 'Roboto', fontWeight: 'bold', fontSize: '1.25rem', color: '#222' }}>
              Ver Documentos Vehiculares
            </h4>
            {/* Ícono */}
            <div className="text-center">
              <i className="bi bi-file-earmark-text" style={{ fontSize: '3rem', color: '#092039' }}></i>
            </div>
            <hr />
            <div className="py-2 px-3">
              <p>
                Accede de manera centralizada y segura a todos los documentos importantes de tus vehículos. Consulta, descarga y verifica la vigencia de cada documento en cualquier momento.
              </p>
              <ul className="mb-3" style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                <li>Permiso de Circulación vigente y anteriores</li>
                <li>Revisión Técnica y fecha de vencimiento</li>
                <li>Seguro Obligatorio (SOAP)</li>
                <li>Multas asociadas y su estado</li>
                <li>Información técnica y legal del vehículo</li>
              </ul>
              <p>
                Mantén tus papeles al día y evita sorpresas. Toda la información está disponible en un solo lugar, lista para ser consultada o descargada cuando la necesites.
              </p>
            </div>
            {/* Botón */}
            <div className="text-center mt-3" >
              <button className="btn btn-primary" onClick={() => router.push('/home/ver-documentos')}>Ir a Ver Documentos</button>
            </div>
          </div>

          <div className="col mb-4 card-like p-3 m-3 shadow">
            <h4 className="text-center" style={{ fontFamily: 'Roboto', fontWeight: 'bold', fontSize: '1.25rem', color: '#222' }}>Pagar Mis Permisos de Circulación</h4>
            {/* Ícono */}
            <div className="text-center">
              <i className="bi bi-credit-card" style={{ fontSize: '3rem', color: '#092039' }}></i>
            </div>
            <hr />
            <div className="py-2 px-4">
              <p>En esta sección puedes pagar los permisos de circulación de los vehículos que desees.</p>
              <ol className="mb-3" style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                <li>Pagar permiso de circulación de tus vehículos</li>
                <li>Pagar permiso de circulación de otros vehículos</li>
              </ol>
              <p>Puedes pagar con tarjeta de crédito, débito y prepago a través de WebPay.</p>
              <p>No necesitas ingresar ningún documento o información adicional, solo selecciona el vehículo, selecciona tu medio de pago y confirma la transacción!</p>
            </div>
            {/* Botón */}
            <div className="text-center mt-3" style={{ position: 'absolute', bottom: 0, width: '100%', left: 0, paddingBottom: '16px'}}>
              <button className="btn btn-primary" onClick={() => router.push('/home/ver-vehiculos')}>Ir a Pagar Permisos</button>
            </div>
          </div>

          <div className="col mb-4 card-like p-3 m-3 shadow">
            <h4 className="text-center" style={{ fontFamily: 'Roboto', fontWeight: 'bold', fontSize: '1.25rem', color: '#222' }}>Historial de Permisos de Circulación Pagados</h4>
            {/* Ícono */}
            <div className="text-center">
              <i className="bi bi-wallet2" style={{ fontSize: '3rem', color: '#092039' }}></i>
            </div>
            <hr />
            <div className="py-2 px-4">
              <p>En esta sección puedes ver el historial de permisos de circulación que has pagado.</p>
              <ol className="mb-3" style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                <li>Ver historial de permisos pagados</li>
                <li>Descargar comprobantes de pago</li>
                <li>Ver detalles de cada permiso</li>
              </ol>
              <p>Revisa fácilmente los permisos que has pagado, descarga tus comprobantes y mantén un registro actualizado de tus trámites.</p>
            </div>
            {/* Botón */}
            <div className="text-center mt-3" style={{ position: 'absolute', bottom: 0, width: '100%', left: 0, paddingBottom: '16px' }}>
              <button className="btn btn-primary" onClick={() => router.push('/home/historial-permisos')}>Ir a Historial de Permisos</button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}



