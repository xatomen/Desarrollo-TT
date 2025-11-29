// Página de pago banco
'use client';
import API_CONFIG from "@/config/api";
import { useState, useEffect } from "react";

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

interface PagoInfo {
  ppu: string;
  rut: string;
  valorPermiso: number;
  marca: string;
  modelo: string;
  anio: string;
  color: string;
  tipoVehiculo: string;
  numeroTarjeta: string;
  titular: string;
  correo: string;
  fechaPago: string;
  transactionId?: string;
  resultadoPago?: 'exitoso' | 'fallido';
}

export default function PagoBancoPage() {
  // Estado para el banco seleccionado, por ahora está definido estáticamente
  const [selectedBank, setSelectedBank] = useState(bancoEstado);
  const [numTarjeta, setNumTarjeta] = useState('');
  const [tipoTarjeta, setTipoTarjeta] = useState<"crédito" | "débito">("crédito");
  const [montoPago, setMontoPago] = useState(15000);
  const [saldoDisponible, setSaldoDisponible] = useState('');
  const [rutTarjeta, setRutTarjeta] = useState('');
  const [titularTarjeta, setTitularTarjeta] = useState('');
  const [mesVencimiento, setMesVencimiento] = useState('');
  const [anioVencimiento, setAnioVencimiento] = useState('');
  const [diaVencimiento, setDiaVencimiento] = useState('');
  const [cvv, setCvv] = useState('');
  const [loadingBank, setLoadingBank] = useState(true); // Estado para loading

  // Recuperar datos desde el sessión storage
  useEffect(() => {
    const userInfo = sessionStorage.getItem('user_info');
    if (userInfo) {
      const datos = JSON.parse(userInfo);
      setNumTarjeta(datos.numero_tarjeta.toString());
      setTipoTarjeta(datos.tipo_tarjeta);
      setSaldoDisponible(Number(datos.saldo).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }));
      setRutTarjeta(datos.rut);
      setTitularTarjeta(datos.nombre);
      // Formatear fecha de vencimiento yyyy-mm-dd
      const fechaVenc = datos.fecha_vencimiento; // "yyyy-mm-dd"
      console.log('fechaVenc:', fechaVenc);
      const [year, month, day] = fechaVenc.split('-');
      setMesVencimiento(month);
      setAnioVencimiento(year.slice(-2)); // últimos 2 dígitos
      setDiaVencimiento(day);
      setCvv(datos.cvv);
      // Debug
      console.log(datos);
      console.log('numTarjeta:', datos.numero_tarjeta);
      console.log('tipoTarjeta:', datos.tipo_tarjeta);
      // console.log('montoPago:', datos.monto_pago);
      console.log('saldoDisponible:', datos.saldo);
      console.log('rutTarjeta:', datos.rut);
      console.log('titularTarjeta:', datos.nombre);
      console.log('fechaVencimiento:', datos.fecha_vencimiento);
      console.log('mesVencimiento:', mesVencimiento);
      console.log('anioVencimiento:', anioVencimiento);
      console.log('diaVencimiento:', diaVencimiento);
      console.log('cvv:', datos.cvv);

      // Formato de datos cuando hacemos post para pagar
      console.log('Datos para pagar:');
      console.log({
        numero_tarjeta: numTarjeta,
        rut: rutTarjeta,
        monto: montoPago,
        titular: titularTarjeta,
        mes_vencimiento: mesVencimiento,
        anio_vencimiento: anioVencimiento,
        cvv: cvv
      });
    }
    const monto = sessionStorage.getItem('formato_pago') ? JSON.parse(sessionStorage.getItem('formato_pago') || '{}').monto_pago : null;
    if (monto) {
      setMontoPago(Number(monto));
    }
  }, []);

  // Pago
  const handlePago = async () => {
    // POST a /procesar_pago/
    try {
      const res = await fetch(`${API_CONFIG.TGR}procesar_pago/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero_tarjeta: numTarjeta.toString(),
          // rut: rutTarjeta,
          titular: titularTarjeta,
          mes_vencimiento: Number(mesVencimiento),
          anio_vencimiento: Number(anioVencimiento),
          tipo_tarjeta: tipoTarjeta,
          cvv: Number(cvv),
          monto_pago: Number(montoPago)
        }),
      });
      console.log(res);
      if (!res.ok) throw new Error('Error en el pago');
      const data = await res.json();
      console.log(data);
      if (data && data.estado === 'exitoso') {
        // Redirigir a confirmación de pago exitoso
        sessionStorage.setItem('resultado_pago', 'exitoso');
        // Guardar info del pago
        const pagoInfo: PagoInfo = {
          ppu: sessionStorage.getItem('datos_vehiculo_permiso.') || '',
          rut: sessionStorage.getItem('rut') || '',
          valorPermiso: Number(sessionStorage.getItem('monto_pago')) || 0,
          marca: sessionStorage.getItem('marca') || '',
          modelo: sessionStorage.getItem('modelo') || '',
          anio: sessionStorage.getItem('anio') || '',
          color: sessionStorage.getItem('color') || '',
          tipoVehiculo: sessionStorage.getItem('tipo_vehiculo') || '',
          numeroTarjeta: numTarjeta.toString(),
          titular: titularTarjeta,
          correo: sessionStorage.getItem('correo') || '',
          fechaPago: new Date().toISOString(),
          transactionId: data.transaction_id,
          resultadoPago: 'exitoso'
        };
        sessionStorage.setItem('pago_info', JSON.stringify(pagoInfo));
        window.location.href = '/webpay/confirmacion-pago';
      } else {
        // Redirigir a confirmación de pago fallido
        sessionStorage.setItem('resultado_pago', 'fallido');
        window.location.href = '/webpay/confirmacion-pago';
      }
    } catch (err) {
      console.error(err);
      sessionStorage.setItem('resultado_pago', 'fallido');
      window.location.href = '/webpay/confirmacion-pago';
    }
  };

  // Obtener banco seleccionado usando endpoint get /banco/{numero_tarjeta}/{rut}
  useEffect(() => {
    const fetchBankData = async () => {
      setLoadingBank(true);
      try {
        const response = await fetch(`${API_CONFIG.TGR}banco/${numTarjeta}/${rutTarjeta}`);
        const data = await response.json();
        // data.banco debe ser un string como "bancoChile"
        if (data.banco && bancosMap[data.banco]) {
          setSelectedBank(bancosMap[data.banco]);
        } else {
          setSelectedBank(bancoEstado); // fallback
        }
        console.log(data.banco);
      } catch (error) {
        console.error('Error fetching bank data:', error);
      } finally {
        setLoadingBank(false);
      }
    };

    if (numTarjeta && rutTarjeta) {
      fetchBankData();
    }
  }, [numTarjeta, rutTarjeta]);

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
      // Payment Card
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
              {tipoTarjeta === "crédito" ? `Cupo disponible: ${saldoDisponible}` : `Saldo disponible: ${saldoDisponible}`}
            </p>
            {/* Botón para pagar */}
            <div className="d-flex justify-content-center">
              <button
                type="submit"
                style={{ backgroundColor: selectedBank.color, color: 'white', borderRadius: '30px', width: '75%', height: '3rem' }}
                onClick={handlePago}
              >
                  Pagar
              </button>
            </div>
            {/* Anular transacción */}
            <div className="text-center mt-3">
              <a href="#" style={{ color: selectedBank.color, fontSize: '0.9rem', textDecoration: 'underline' }}>Anular transacción</a>
            </div>
          </div>
        </div>
        <div className="col p-4" style={{
          backgroundColor: '#f8f8f8ff',
          borderTopRightRadius: '30px',
          borderBottomRightRadius: '30px',
          borderLeft: '1px solid #ddd',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minWidth: 260
        }}>
          {/* Información de la transacción */}
          <div
            className="mx-auto"
            style={{
              background: 'linear-gradient(135deg, #f3f6ffff 60%, #fff6fcff 100%)',
              borderRadius: '18px',
              boxShadow: '0 2px 8px #0001',
              padding: '28px 18px',
              maxWidth: 320,
              width: '100%',
              textAlign: 'center'
            }}
          >
            <div style={{ marginBottom: 18 }}>
              <span style={{
                display: 'inline-block',
                background: selectedBank.color,
                color: '#fff',
                borderRadius: '12px',
                padding: '6px 18px',
                fontWeight: 700,
                fontSize: '1.1rem',
                letterSpacing: '1px',
                marginBottom: 8
              }}>
                TU PERMISO
              </span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: selectedBank.color, fontWeight: 700, fontSize: '1.1rem' }}>Monto a pagar</span>
              <div style={{
                fontWeight: 800,
                fontSize: '2rem',
                color: '#222',
                margin: '4px 0 0 0'
              }}>
                $ {montoPago.toLocaleString()}
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <span style={{ color: selectedBank.color, fontWeight: 700, fontSize: '1.1rem' }}>Fecha</span>
              <div style={{
                fontWeight: 600,
                fontSize: '1.1rem',
                color: '#333'
              }}>
                {formattedDate}
              </div>
            </div>
            <div>
              <span style={{ color: selectedBank.color, fontWeight: 700, fontSize: '1.1rem' }}>Hora</span>
              <div style={{
                fontWeight: 600,
                fontSize: '1.1rem',
                color: '#333'
              }}>
                {formattedTime}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}