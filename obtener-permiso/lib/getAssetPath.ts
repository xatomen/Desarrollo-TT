/**
 * Helper para obtener la ruta completa de assets considerando el basePath
 */
export function getAssetPath(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  // Si la ruta comienza con /, agregar basePath
  if (path.startsWith('/')) {
    return `${basePath}${path}`;
  }
  return path;
}
