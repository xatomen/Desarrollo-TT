'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir inmediatamente a /login
    router.push('/login');
  }, [router]);

  // Opcional: mostrar un spinner mientras redirige
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Redirigiendo...</span>
      </div>
    </div>
  );
}
