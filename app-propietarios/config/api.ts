// Obtener URL base según el ambiente
// En Kubernetes (AWS ALB): Usar api.jorgegallardo.studio
// En desarrollo: http://localhost:3000
const getApiBase = (): string => {
  // Si hay variable de entorno NEXT_PUBLIC_API_BASE_URL, usar esa
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  // En browser, usar api.jorgegallardo.studio
  if (typeof window !== 'undefined') {
    return 'http://api.jorgegallardo.studio';
  }
  
  // Fallback
  return 'http://localhost:3000';
};

const API_BASE = getApiBase();

const API_CONFIG = {
  // Desarrollo local (comentado)
  // SRCEI: `http://localhost:5001/`,
  // PRT: `http://localhost:5002/`,
  // AACH: `http://localhost:5003/`,
  // SGD: `http://localhost:5004/`,
  // SII: `http://localhost:5005/`,
  // CARABINEROS: `http://localhost:5006/`,
  // TGR: `http://localhost:5007/`,
  // MTT: `http://localhost:5008/`,
  // BACKEND: `http://localhost:8000/`,

  // AWS ALB (Kubernetes) - Rutas por PATH
  // El ALB hostname es automático (ej: desarrollo-tt-alb-123456789.us-east-1.elb.amazonaws.com)
  SRCEI: `${API_BASE}/srcei/`,
  PRT: `${API_BASE}/prt/`,
  AACH: `${API_BASE}/aach/`,
  SGD: `${API_BASE}/sgd/`,
  SII: `${API_BASE}/sii/`,
  CARABINEROS: `${API_BASE}/carabineros/`,
  TGR: `${API_BASE}/tgr/`,
  MTT: `${API_BASE}/mtt/`,
  BACKEND: `${API_BASE}/back/`,
};

export default API_CONFIG;
