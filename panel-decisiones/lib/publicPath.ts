/**
 * Helper para generar rutas públicas con basePath correcto
 * Usa process.env.__NEXT_PUBLIC_BASEPATH__ que Next.js inyecta automáticamente
 */
export function getPublicPath(path: string): string {
  // Next.js inyecta el basePath en __NEXT_PUBLIC_BASEPATH__ en build time
  const basePath = typeof window !== 'undefined' 
    ? (window as any).__NEXT_PUBLIC_BASEPATH__ || ''
    : ''
  
  if (!path.startsWith('/')) {
    path = '/' + path
  }
  
  return basePath ? `${basePath}${path}` : path
}
