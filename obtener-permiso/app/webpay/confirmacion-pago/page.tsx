// Página con un card de confirmación de pago
// que muestra detalles del pago realizado

'use client';
import { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// Bancos
const bancoPredeterminado = {
  nombre: "Banco Predeterminado",
  mensajeBienvenida: 'Ingresa a tu Banca en Línea',
  color: '#ffffffff',
  logo: '',
  mensajeProblemaClave: '¿Problemas con tu clave?'
}

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

export default function ConfirmacionPagoLayout({ children }: { children: React.ReactNode }) {
  const [selectedBank, setSelectedBank] = useState(bancoEstado);
  const [numTarjeta, setNumTarjeta] = useState('');
  const [tipoTarjeta, setTipoTarjeta] = useState<"crédito" | "débito">("crédito");
  const [montoPago, setMontoPago] = useState(15000);
  const [resultadoPago, setResultadoPago] = useState<'exitoso' | 'fallido' | null>('exitoso');
  const [loadingBank, setLoadingBank] = useState(true); // Estado para loading

  // Recuperamos resultado del pago desde sessionStorage
  useEffect(() => {
    const resultado = sessionStorage.getItem('resultado_pago');
    if (resultado === 'exitoso' || resultado === 'fallido') {
      setResultadoPago(resultado);
    }
  }, []);

  // Recuperar banco desde el sessión storage
  useEffect(() => {
    setLoadingBank(true);
    const banco = sessionStorage.getItem('banco');
    setTimeout(() => { // Simula carga real
      if (banco && bancosMap[banco]) {
        setSelectedBank(bancosMap[banco]);
      } else {
        setSelectedBank(bancoEstado); // fallback
      }
      setLoadingBank(false);
    }, 600); // 600ms de carga simulada
  }, []);

  // Recuperar datos desde el sessión storage
  useEffect(() => {
    const userInfo = sessionStorage.getItem('user_info');
    if (userInfo) {
      const datos = JSON.parse(userInfo);
      setNumTarjeta(datos.numero_tarjeta);
      setTipoTarjeta(datos.tipo_tarjeta);
      // setMontoPago(Number(datos.monto_pago).toLocaleString());
    }
  }, []);

  return (
    <div style={{
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
      {loadingBank ? (
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 320 }}>
          <div className="spinner-border" style={{ width: 60, height: 60, color: '#6D2077' }} role="status">
            <span className="visually-hidden">Cargando banco...</span>
          </div>
          <div className="mt-3" style={{ color: '#6D2077', fontWeight: 600, fontSize: '1.2rem' }}>
            Cargando banco...
          </div>
        </div>
      ) : (
      <div className="card-like m-4" style={{ maxWidth: '600px', minWidth: '500px', margin: 'auto', borderRadius: '30px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: 'white' }}>
        <div className="col p-4">
          {/* Logo Banco */}
          <div className="text-center mb-4 justify-content-center d-flex">
            <img src={selectedBank.logo} alt={`${selectedBank.nombre} Logo`} style={{ height: '50px', width: 'auto', margin: '10px' }} />
          </div>
          <p className="text-center" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Confirmación de Pago</p>
          {/* Resultado del pago */}
          <div
            className="text-center mb-4"
            style={{
              padding: '10px',
              borderRadius: '10px',
              color: 'white',
              backgroundColor: resultadoPago === 'exitoso' ? '#4caf50' : '#ff3535',
              fontWeight: 'bold',
            }}
          >
            {/* Ícono de éxito o fallo */}
            {resultadoPago === 'exitoso' ? (
              <div className="d-flex flex-column align-items-center">
                  <FaCheckCircle className="m-4" size={48} />
                <p style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>Pago Exitoso</p>
              </div>
            ) : (
              <div className="d-flex flex-column align-items-center">
                <FaTimesCircle className="m-4" size={48} />
                <p style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>Pago Fallido</p>
              </div>
            )}
          </div>
          {/* Detalles del Pago */}
            <div
              className="mb-4"
              style={{
                textAlign: 'left',
                backgroundColor: '#f9f9f9',
                padding: '15px',
                borderRadius: '10px',
                color: '#333',
                marginTop: '20px'
              }}
            >
              <p className="text-center"><strong>Detalles del Pago</strong></p>
              <p><strong>Banco:</strong> {selectedBank.nombre}</p>
              <p><strong>Número de Tarjeta:</strong> **** **** **** {numTarjeta.slice(-4)}</p>
              <p><strong>Tipo de Tarjeta:</strong> {tipoTarjeta}</p>
              <p><strong>Monto de Pago:</strong> ${montoPago.toLocaleString()}</p>
              <p><strong>Resultado de Pago:</strong> {resultadoPago === 'exitoso' ? 'Pago Aprobado' : 'Pago Rechazado'}</p>
            </div>
          <div className="text-center mt-4 row">
            {resultadoPago === 'exitoso' && (
            <button className="col m-2 p-4" style={{ backgroundColor: '#6b6b6bff', color: 'white', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.8rem' }}>Descargar comprobante</button>
            )}
            <button
              className="col m-2 p-4"
              style={{ backgroundColor: selectedBank.color, color: 'white', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.8rem' }}
              onClick={() => {
                // Redirigir a /home/confirmacion-pago
                window.location.href = '/home/confirmacion-pago';
              }}
            >
              Volver al comercio
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}