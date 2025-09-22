'use client';
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth(); // ✅ Usar el hook de autenticación

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // ✅ Usar la función logout del contexto
    console.log('Cerrando sesión...');
    logout(); // Esto eliminará el token y redirigirá al login
    setIsDropdownOpen(false); // Cerrar el dropdown
  };

  // ✅ Obtener las iniciales del nombre o usar la primera letra del RUT
  const getInitials = () => {
    if (user?.nombre) {
      const names = user.nombre.split(' ');
      return names.length > 1 
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return user?.rut ? user.rut[0].toUpperCase() : 'U';
  };

  // ✅ Obtener el nombre para mostrar
  const getDisplayName = () => {
    return user?.nombre || user?.rut || '[Nombre apellido]';
  };

  return (
    <nav className="text-white px-6 py-4"
      style={{
        background: '#092039',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Imagen link Inicio */}
          <a href="/inicio">
            <img src="/img/tupermiso/logo-tupatente.svg" alt="" style={{ width: '150px', height: 'auto' }} />
          </a>
          {/* Link a Inicio */}
          <a href="/inicio" className="text-lg font-semibold hover:underline p-2" style={{ color: 'white' }}>
            Inicio
          </a>
          {/* Link a Tu Permiso */}
          <a href="/home" className="text-lg font-semibold hover:underline p-2" style={{ color: 'white' }}>
            Tu Permiso
          </a>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 hover:bg-slate-700 rounded-md px-2 py-1 transition-colors"
            >
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">{getInitials()}</span>
              </div>
              <span className="text-sm">{getDisplayName()}</span>
              <svg 
                className={`w-4 h-4 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <p className="font-medium">{getDisplayName()}</p>
                  <p className="text-xs text-gray-500">
                    {user?.email || user?.rut || 'usuario@email.com'}
                  </p>
                </div>
                
                {/* ✅ Agregar información adicional del usuario */}
                <div className="px-4 py-2 text-xs text-gray-500 border-b">
                  <p>RUT: {user?.rut || 'No disponible'}</p>
                  {/* {user?.id && <p>ID: {user.id}</p>} */}
                </div>

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Cerrar Sesión</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay para cerrar dropdown al hacer click fuera */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;