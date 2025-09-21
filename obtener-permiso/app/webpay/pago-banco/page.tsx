// Página de pago banco
'use client';
import { useState } from "react";

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


export default function PagoBancoPage() {
  // Estado para el banco seleccionado, por ahora está definido estáticamente
  const [selectedBank, setSelectedBank] = useState(bancoEstado);
  const [numTarjeta, setNumTarjeta] = useState('4345591084215296');
  const [tipoTarjeta, setTipoTarjeta] = useState<"crédito" | "débito">("crédito");

  // Formatear fecha y hora actuales
  const date = new Date();
  const formattedDate = date.toLocaleDateString('es-CL', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).replace(',', ' de');
  const formattedTime = date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

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
      {/* Payment Card */}
      <div className="card-like m-4 row" style={{ minWidth: '300px', maxWidth: '1200px', margin: 'auto', borderRadius: '30px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div className="col p-4 m-4 mx-4">
          {/* Logo banco */}
          <div className="text-center mb-4 d-flex justify-content-center">
            <img src={selectedBank.logo} alt={`Logo ${selectedBank.nombre}`} style={{ maxHeight: '50px' }} />
          </div>
          {/* Mensaje de bienvenida */}
          <div className="text-center mb-4">
            <p>Pago en línea</p>
          </div>
          {/* Mostrar número de tarjeta (**** **** **** 1234) */}
          <div className="text-left mb-4">
            <p style={{ fontWeight: 'bold' }}>Número de tarjeta</p>
            <input 
              type="text" 
              value={`**** **** **** ${numTarjeta.slice(-4)}`} 
              disabled 
              className="form-control text-left" 
              style={{ 
                borderRadius: '10px', 
                border: '1px solid #ccc', 
                padding: '10px', 
                fontSize: '1rem',
                // fontWeight: 'bold',
                backgroundColor: '#f5f5f5',
                color: '#333',
                height: '3rem'
              }} 
            />
            {/* Tipo de tarjeta */}
            <div className="text-left my-4">
              <p style={{ fontWeight: 'bold' }}>Tipo de tarjeta</p>
              <input
                className="form-control text-left"
                style={{
                  borderRadius: '10px', 
                  border: '1px solid #ccc', 
                  padding: '10px', 
                  fontSize: '1rem',
                  // fontWeight: 'bold',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  height: '3rem',
                  width: '100%'
                }}
                value={tipoTarjeta.charAt(0).toUpperCase() + tipoTarjeta.slice(1)}
                disabled
              />
            </div>
            {/* Si es crédito, mostrar select de cuotas (3, 6, 9, 12, 18, 24) */}
            {tipoTarjeta === "crédito" && (
              <div className="mb-4">
                <label htmlFor="cuotas" style={{ fontWeight: 'bold' }}>Cuotas</label>
                <select id="cuotas" className="form-control" style={{ borderRadius: '10px', border: '1px solid #ccc', padding: '10px', fontSize: '1rem', height: '3rem' }}>
                  <option value="1">Sin cuotas</option>
                  <option value="3">3</option>
                  <option value="6">6</option>
                  <option value="9">9</option>
                  <option value="12">12</option>
                  <option value="18">18</option>
                  <option value="24">24</option>
                </select>
              </div>
            )}
            {/* Mostrar cupo/saldo de la tarjeta */}
            <p
              style={{ color: '#666', fontSize: '0.9rem' }}
            >
              {tipoTarjeta === "crédito" ? 'Cupo disponible: $500.000' : 'Saldo disponible: $200.000'}
            </p>
            {/* Botón para pagar */}
            <div className="d-flex justify-content-center">
              <button type="submit" style={{ backgroundColor: selectedBank.color, color: 'white', borderRadius: '30px', width: '75%', height: '3rem' }}>Pagar</button>
            </div>
            {/* Anular transacción */}
            <div className="text-center mt-3">
              <a href="#" style={{ color: selectedBank.color, fontSize: '0.9rem', textDecoration: 'underline' }}>Anular transacción</a>
            </div>
          </div>
        </div>
        <div className="col p-4" style={{ backgroundColor: '#f8f8f8ff', borderTopRightRadius: '30px', borderBottomRightRadius: '30px', borderLeft: '1px solid #ddd', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Información de la transacción */}
          <div className="text-center mt-4" style={{ fontSize: '0.9rem', color: '#666' }}>
            <p>Estás pagando en:</p>
            <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>TU PERMISO</p>
            <p>Monto a pagar:</p>
            <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>$ 1.000</p>
            <p>Fecha:</p>
            <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{formattedDate}</p>
            <p>Hora:</p>
            <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{formattedTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
}