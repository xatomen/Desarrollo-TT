import { useRouter as useNextRouter } from 'next/navigation';
import { useCallback } from 'react';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/**
 * Custom hook que envuelve useRouter de Next.js
 * Automáticamente prepende el basePath a todas las rutas
 */
export function useRouter() {
  const router = useNextRouter();

  return {
    ...router,
    push: useCallback((href: string, options?: any) => {
      // Next.js 13+ maneja automáticamente el basePath en router.push()
      // pero lo explicitamos para mayor control
      router.push(href, options);
    }, [router]),
  };
}
