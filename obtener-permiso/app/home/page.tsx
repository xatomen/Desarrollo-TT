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
        <div className="card-like p-4 m-4 shadow" style={{
          background: 'linear-gradient(135deg, #ecf2f7ff 0%, #d8edfdff 100%)',
          color: '#222', // Cambiado a negro
          borderRadius: '18px',
          boxShadow: '0 4px 16px #0002',
          textAlign: 'center',
          fontFamily: 'Roboto'
        }}>
          <p style={{
            fontWeight: 700,
            fontSize: '2.2rem',
            marginTop: '1.5rem',
            marginBottom: '1rem',
            letterSpacing: '1px',
            color: '#222' // Cambiado a negro
          }}>
            ¡Bienvenido{user.name ? `, ${user.name}` : ''}!
          </p>
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '0.5rem',
            fontWeight: 500,
            letterSpacing: '0.5px',
            color: '#222' // Cambiado a negro
          }}>
            a <span style={{ fontWeight: 700, color: '#000000ff', textShadow: '0 1px 8px #0004' }}>TU PERMISO</span>
          </p>
          <h2 className="mb-3" style={{
            fontFamily: 'Roboto',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            color: '#222' // Cambiado a negro
          }}>
            Gestión de Permisos de Circulación
          </h2>
        </div>
        {/* Tres secciones */}
        <div className="row mx-2">

          
          {/* <div className="col mb-4 card-like p-3 m-3 shadow">
            <h4 className="text-center" style={{ fontFamily: 'Roboto', fontWeight: 'bold', fontSize: '1.25rem', color: '#222' }}>Ver Documentos Vehiculares</h4> */}
            {/* Ícono */}
            {/* <div className="text-center">
              <i className="bi bi-file-earmark-text" style={{ fontSize: '3rem', color: '#092039' }}></i>
            </div>
            <hr />
            <p>En esta sección puedes revisar los documentos de tu vehículo.</p>
            <ol className="mb-3" style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
              <li>Permiso de Circulación</li>
              <li>Revisión Técnica</li>
              <li>Seguro Obligatorio</li>
              <li>Multas Asociadas</li>
              <li>Información del Vehículo</li>
            </ol> */}
            {/* Botón */}
            {/* <div className="text-center mt-3">
              <button className="btn btn-primary">Ir a Ver Documentos</button>
            </div>
          </div> */}

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
            <div className="text-center mt-3">
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
            <div className="text-center mt-3">
              <button className="btn btn-primary" onClick={() => router.push('/home/historial-permisos')}>Ir a Historial de Permisos</button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}



