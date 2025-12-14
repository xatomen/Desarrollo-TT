#!/bin/bash

# Script para aplicar los cambios de Kubernetes
# Uso: bash kubernetes/deploy-updates.sh

echo "======================================"
echo "Aplicando actualizaciones Kubernetes"
echo "======================================"

NAMESPACE="desarrollo-tt"

# Verificar que kubectl está disponible
if ! command -v kubectl &> /dev/null; then
    echo "❌ Error: kubectl no está instalado"
    exit 1
fi

# Verificar conexión a cluster
echo "🔍 Verificando conexión a cluster..."
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Error: No hay conexión a un cluster Kubernetes"
    exit 1
fi

echo "✅ Conexión establecida"

# Crear namespace si no existe
echo ""
echo "📦 Verificando namespace '$NAMESPACE'..."
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo "   Creando namespace '$NAMESPACE'..."
    kubectl create namespace "$NAMESPACE"
fi
echo "✅ Namespace '$NAMESPACE' listo"

# Aplicar ConfigMaps
echo ""
echo "🔧 Aplicando ConfigMaps..."
kubectl apply -f kubernetes/configmap.yaml
echo "✅ ConfigMaps aplicados"

# Aplicar Back API Deployment
echo ""
echo "🚀 Aplicando Back API Deployment..."
kubectl apply -f kubernetes/deployments/back-api.yaml
echo "✅ Back API Deployment aplicado"

# Esperar a que el deployment esté listo
echo ""
echo "⏳ Esperando a que Back API esté listo (esto puede tomar 1-2 minutos)..."
kubectl rollout status deployment/back-api -n "$NAMESPACE" --timeout=300s

if [ $? -eq 0 ]; then
    echo "✅ Back API está listo"
else
    echo "⚠️  Timeout esperando Back API"
fi

# Verificar pod está corriendo
echo ""
echo "📋 Estado de los pods:"
kubectl get pods -n "$NAMESPACE" -l app=back-api

# Mostrar variables de entorno
echo ""
echo "📝 Variables de ConfigMap aplicadas:"
kubectl get configmap app-config -n "$NAMESPACE" -o yaml | grep -E "(K8S_MODE|DOCKER_MODE|LOG_LEVEL|API_URL)" || echo "No encontradas"

# Obtener logs
echo ""
echo "📊 Últimos logs de Back API:"
kubectl logs -n "$NAMESPACE" -l app=back-api --tail=20

echo ""
echo "======================================"
echo "✅ Actualización completada"
echo "======================================"
echo ""
echo "Próximos pasos:"
echo "1. Verificar logs: kubectl logs -f deployment/back-api -n $NAMESPACE"
echo "2. Acceder a un pod: kubectl exec -it <pod-name> -n $NAMESPACE -- /bin/bash"
echo "3. Probar endpoints: curl http://back-api/docs"
