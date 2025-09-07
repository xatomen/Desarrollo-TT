'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente a ver-vehiculos
    router.replace('/home/ver-vehiculos'); // usar replace en lugar de push para no agregar al historial
  }, [router]);

  return (
    <ProtectedRoute>
      <div className="d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Redirigiendo...</span>
          </div>
          <p className="mt-2">Redirigiendo a vehículos...</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}