'use client';
export default function ConfirmacionPagoMultasRPIPage() {

  // Recuperar el RUT desde el local storage
  const rut = localStorage.getItem('rut');
  
  // Lógica de uso de endpoint que elimina las multas RPI del RUT



  return (
    <div>
      <h1>Confirmación de Pago - Multas RPI</h1>
      <button
        className="btn btn-primary"
        onClick={() => {
          // Redirigir a /home/validaciones-pago
            window.location.href = '/home/validaciones-pago';
        }}
      >
        Continuar con el pago del permiso
      </button>
    </div>
  );
}
