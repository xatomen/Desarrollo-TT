// Configuration for backend APIs
// Supports both local (Docker Compose) and Kubernetes environments

const getApiUrls = () => {
  const isK8sMode = process.env.K8S_MODE === 'true';
  const isDockerMode = process.env.DOCKER_MODE === 'true';

  // Kubernetes mode - use internal service DNS
  if (isK8sMode) {
    return {
      BACKEND: process.env.BACKEND_URL || 'http://back-api:8000',
    };
  }

  // Docker Compose mode - use service names from docker-compose.yml
  if (isDockerMode) {
    return {
      BACKEND: process.env.BACKEND_URL || 'http://back:8000',
    };
  }

  // Local/development mode - use localhost
  return {
    BACKEND: process.env.BACKEND_URL || 'http://localhost:5007',
  };
};

const API_CONFIG = getApiUrls();

export default API_CONFIG;
