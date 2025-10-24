'use client';

import { useRouter } from 'next/navigation';
import { useState } from "react";
import { useEffect } from "react";

const aseguradoras = [
  { id: 1, nombre: 'BCI Seguros', logo: '/img/aseguradoras/bciseguros.png', precio: 4500 },
  { id: 2, nombre: 'Consorcio', logo: '/img/aseguradoras/consorcio.png', precio: 6000 },
  { id: 3, nombre: 'HDI Seguros', logo: '/img/aseguradoras/hdi.png', precio: 5000 },
  { id: 4, nombre: 'Liberty Seguros', logo: '/img/aseguradoras/libertyseguros.png', precio: 9500 },
  { id: 5, nombre: 'Mapfre', logo: '/img/aseguradoras/mapfre.png', precio: 7000 },
  { id: 6, nombre: 'Sura', logo: '/img/aseguradoras/sura.png', precio: 8000 },
];

export default function ConfirmacionPagoSoapPage() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [aseguradoraSeleccionada, setAseguradoraSeleccionada] = useState<{nombre: string, precio: number} | null>(null);

  const router = useRouter();

  const abrirModal = (nombre: string, precio: number) => {
    setAseguradoraSeleccionada({ nombre, precio });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setAseguradoraSeleccionada(null);
  };

  const [nombrePropietario, setNombrePropietario] = useState<string>('-');
  const [rutPropietario, setRutPropietario] = useState<string>('-');
  const [ppu, setPpu] = useState<string>('-');

  // Recuperar datos del propietario desde sessionStorage al cargar el componente
  // Espera que los datos estén en sessionStorage bajo la clave 'formato_pago'
  // con el formato: { nombre, rut, ppu, ... }
  useEffect(() => {
    const datosPago = sessionStorage.getItem('formato_pago');
    if (datosPago) {
      try {
        const { nombre, rut, ppu } = JSON.parse(datosPago);
        setNombrePropietario(nombre || '-');
        setRutPropietario(rut || '-');
        setPpu(ppu || '-');
      } catch (e) {
        // Si hay error en el parseo, dejar valores por defecto
        setNombrePropietario('-');
        setRutPropietario('-');
        setPpu('-');
      }
    }
  }, []);

  return (
    <div className="card-like p-4">
      <h2>Pagar SOAP</h2>
      {/* Card con degradado y procedimiento visual */}
      <div
        className="card-like p-4 m-2 mb-4"
        style={{
          background: 'linear-gradient(90deg, #e0e7ff 60%, #fbeaf6 100%)',
          // border: '1px solid #c7d2fe',
          borderRadius: '16px',
          boxShadow: '0 2px 12px #0001'
        }}
      >
        <h4 style={{ fontWeight: 700, color: '#1a2a41', fontFamily: 'Roboto, Arial, sans-serif' }}>
          ¿Cómo funciona este sitio?
        </h4>
        <ol
          style={{
            fontSize: '1.05rem',
            fontFamily: 'Roboto, Arial, sans-serif',
            color: '#3b3b3b',
            marginTop: '1rem',
            marginBottom: 0,
            paddingLeft: '1.5rem', // <-- Agrega sangría para mostrar los puntos
            listStyleType: 'decimal', // <-- Asegura que se muestren los puntos
          }}
        >
          <li><b>Selecciona tu aseguradora</b> desde el listado inferior.</li>
          <li><b>Confirma tus datos</b> personales y del vehículo.</li>
          <li><b>Paga tu SOAP</b> de manera segura usando Webpay.</li>
          <li><b>¡Listo!</b> Recibirás tu póliza digital en tu correo y podrás continuar con el proceso del permiso de circulación.</li>
        </ol>
      </div>
      {/* Listado de aseguradoras */}
      <div className="row p-2">
        {aseguradoras.map((aseguradora) => (
          <div key={aseguradora.id} className="col card-like p-4 m-2 shadow">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'Roboto, sans-serif', textAlign: 'center' }}>{aseguradora.nombre}</h3>
            <div style={{
              height: '100px',
              border: '1px solid #e7e7e7ff',
              borderRadius: '10px',
              padding: '10px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '10px'}}>
              <img src={aseguradora.logo} alt={aseguradora.nombre} style={{ maxHeight: '100px' }} />
            </div>
            <p className="p-2 text-center">Precio</p>
            <p className="p-2 text-center" style={{ fontSize: '1.4rem', fontWeight: 'bold', fontFamily: 'Roboto, sans-serif' }}>${aseguradora.precio.toLocaleString()}</p>
            <div className="text-center">
              <button className="btn btn-primary" onClick={() => abrirModal(aseguradora.nombre, aseguradora.precio)}>
                Seleccionar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalAbierto && aseguradoraSeleccionada && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '18px',
              boxShadow: '0 4px 24px #0002',
              minWidth: 320,
              maxWidth: 500,
              padding: '2rem 1.5rem',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <button
              onClick={cerrarModal}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                color: '#888',
                cursor: 'pointer'
              }}
              aria-label="Cerrar"
            >
              x
            </button>
            <h3 style={{ fontWeight: 700, color: '#1a2a41', fontFamily: 'Roboto, Arial, sans-serif', marginBottom: '1.5rem' }}>
              Confirmar compra SOAP
            </h3>
            <hr />
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
              <tbody className="text-start">
                <tr>
                  <td style={{ padding: '8px', fontWeight: 700, background: '#f5f7ff', border: '1px solid #e6e9f9' }}>Aseguradora</td>
                  <td style={{ padding: '8px', border: '1px solid #e6e9f9' }}>{aseguradoraSeleccionada.nombre}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 700, background: '#f5f7ff', border: '1px solid #e6e9f9' }}>Precio</td>
                  <td style={{ padding: '8px', border: '1px solid #e6e9f9' }}>${aseguradoraSeleccionada.precio.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 700, background: '#f5f7ff', border: '1px solid #e6e9f9' }}>Nombre titular</td>
                  <td style={{ padding: '8px', border: '1px solid #e6e9f9' }}>{nombrePropietario}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 700, background: '#f5f7ff', border: '1px solid #e6e9f9' }}>RUT titular</td>
                  <td style={{ padding: '8px', border: '1px solid #e6e9f9' }}>{rutPropietario}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', fontWeight: 700, background: '#f5f7ff', border: '1px solid #e6e9f9' }}>Patente vehículo</td>
                  <td style={{ padding: '8px', border: '1px solid #e6e9f9' }}>{ppu}</td>
                </tr>
              </tbody>
            </table>
            <button
              className="btn btn-success btn-lg w-100"
              style={{
                fontWeight: 600,
                fontSize: '1.1rem',
                borderRadius: '8px'
              }}
              onClick={() => {
                // Guardar datos de SOAP seleccionado en sessionStorage
                const soap = {
                  num_poliza: 0, // Por defecto es 0, ya que se genera automaticamente con el API
                  ppu: ppu,
                  compania: aseguradoraSeleccionada.nombre,
                  prima: aseguradoraSeleccionada.precio,
                  rige_desde: new Date().toISOString().split('T')[0], // Fecha actual con formato YYYY-MM-DD y horas en 00:00:00
                  rige_hasta: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0] // Fecha un año después con formato YYYY-MM-DD y horas en 00:00:00
                };
                const formatoPago = {
                  ppu: ppu,
                  rut: rutPropietario,
                  nombre: nombrePropietario,
                  tipo: 'soap',
                  monto_pago: aseguradoraSeleccionada.precio // El monto se seleccionará en la siguiente página
                };
                sessionStorage.setItem('soap', JSON.stringify(soap));
                sessionStorage.setItem('formato_pago', JSON.stringify(formatoPago));
                // Aquí iría la lógica para pagar con Webpay
                router.push(`/webpay`);
              }}
            >
              Pagar con Webpay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}