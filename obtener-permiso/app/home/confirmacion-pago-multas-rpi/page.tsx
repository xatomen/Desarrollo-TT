'use client';
import { useEffect, useState } from 'react';

export default function ConfirmacionPagoMultasRPIPage() {
  const [rut, setRut] = useState<string | null>(null);

  // Recuperar el RUT desde el local storage
  useEffect(() => {
    setRut(localStorage.getItem('rut'));
  }, []);



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
