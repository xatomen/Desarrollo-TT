'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
// Importar iconos de Bootstrap
import 'bootstrap-icons/font/bootstrap-icons.css';
import { AuthProvider } from '@/contexts/AuthContext';

export default function HomePage() {
  // Usuario

  return (
    <ProtectedRoute>
      <div className="">
        <div className="card-like p-4 m-4 shadow">
          <p className="mb-4">Bienvenido Usuario a TU PERMISO</p>
          {/* Descripción del sitio */}
          <h2 className="mb-3" style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>Tu Permiso - Gestión de Permisos de Circulación</h2>
        </div>
        {/* Tres secciones */}
        <div className="row mx-2">

          <div className="col mb-4 card-like p-3 m-3 shadow">
            <h4 className="text-center" style={{ fontFamily: 'Roboto' }}>Ver Documentos Vehiculares</h4>
            <hr />
            <p>En esta sección puedes revisar los documentos de tu vehículo.</p>
            <ol className="mb-3" style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
              <li>Permiso de Circulación</li>
              <li>Revisión Técnica</li>
              <li>Seguro Obligatorio</li>
              <li>Multas Asociadas</li>
              <li>Información del Vehículo</li>
            </ol>
            {/* Ícono */}
            <div className="text-center">
              <i className="bi bi-file-earmark-text" style={{ fontSize: '3rem', color: '#092039' }}></i>
            </div>
            {/* Botón */}
            <div className="text-center mt-3">
              <button className="btn btn-primary">Ir a Ver Documentos</button>
            </div>
          </div>

          <div className="col mb-4 card-like p-3 m-3 shadow">
            <h4 className="text-center" style={{ fontFamily: 'Roboto' }}>Pagar Mis Permisos de Circulación</h4>
            <hr />
            <p>En esta sección puedes pagar tus permisos de circulación de todos los vehículos a tu nombre.</p>
            {/* Ícono */}
            <div className="text-center">
              <i className="bi bi-credit-card" style={{ fontSize: '3rem', color: '#092039' }}></i>
            </div>
            {/* Botón */}
            <div className="text-center mt-3">
              <button className="btn btn-primary">Ir a Pagar Mis Permisos</button>
            </div>
          </div>

          <div className="col mb-4 card-like p-3 m-3 shadow">
            <h4 className="text-center" style={{ fontFamily: 'Roboto' }}>Pagar Otros Permisos de Circulación</h4>
            <hr />
            <p>En esta sección puedes pagar los permisos de circulación de vehículos que no estén a tu nombre.</p>
            {/* Ícono */}
            <div className="text-center">
              <i className="bi bi-wallet2" style={{ fontSize: '3rem', color: '#092039' }}></i>
            </div>
            {/* Botón */}
            <div className="text-center mt-3">
              <button className="btn btn-primary">Ir a Pagar Otros Permisos</button>
            </div>
          </div>
        </div>
        
      </div>
    </ProtectedRoute>
  );
}