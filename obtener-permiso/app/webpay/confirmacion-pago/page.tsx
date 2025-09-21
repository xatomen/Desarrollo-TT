// Página con un card de confirmación de pago
// que muestra detalles del pago realizado

'use client';
import { useState } from "react";
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

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

export default function ConfirmacionPagoLayout({ children }: { children: React.ReactNode }) {
  // Estado para el banco seleccionado, por ahora está definido estáticamente
  const [selectedBank, setSelectedBank] = useState(bancoEstado);
  const [numTarjeta, setNumTarjeta] = useState('');
  const [tipoTarjeta, setTipoTarjeta] = useState<"crédito" | "débito">("crédito");
  const [montoPago, setMontoPago] = useState(0);
  const [resultadoPago, setResultadoPago] = useState<'exitoso' | 'fallido' | null>('exitoso');
  
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
              // height: '150px',
              // display: 'flex',
              // justifyContent: 'center',
              // alignItems: 'center'
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
              <p><strong>Número de Tarjeta:</strong> {numTarjeta}</p>
              <p><strong>Tipo de Tarjeta:</strong> {tipoTarjeta}</p>
              <p><strong>Monto de Pago:</strong> ${montoPago.toFixed(2)}</p>
              <p><strong>Resultado de Pago:</strong> {resultadoPago === 'exitoso' ? 'Pago Aprobado' : 'Pago Rechazado'}</p>
            </div>
          <div className="text-center mt-4 row">
            {resultadoPago === 'exitoso' && (
            <button className="col m-2 p-4" style={{ backgroundColor: '#6b6b6bff', color: 'white', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.8rem' }}>Descargar comprobante</button>
            )}
            <button className="col m-2 p-4" style={{ backgroundColor: selectedBank.color, color: 'white', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.8rem' }}>Volver al comercio</button>
          </div>
        </div>
      </div>
    </div>
  );
}