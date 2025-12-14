# Script para aplicar los cambios de Kubernetes (Windows PowerShell)
# Uso: .\kubernetes\deploy-updates.ps1

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Aplicando actualizaciones Kubernetes" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

$NAMESPACE = "desarrollo-tt"

# Verificar que kubectl está disponible
Write-Host "`n🔍 Verificando que kubectl está instalado..." -ForegroundColor Yellow
try {
    kubectl version --client=true | Out-Null
} catch {
    Write-Host "❌ Error: kubectl no está instalado" -ForegroundColor Red
    exit 1
}

# Verificar conexión a cluster
Write-Host "🔍 Verificando conexión a cluster..." -ForegroundColor Yellow
try {
    kubectl cluster-info | Out-Null
} catch {
    Write-Host "❌ Error: No hay conexión a un cluster Kubernetes" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Conexión establecida" -ForegroundColor Green

# Crear namespace si no existe
Write-Host "`n📦 Verificando namespace '$NAMESPACE'..." -ForegroundColor Yellow
$namespaceExists = kubectl get namespace $NAMESPACE -ErrorAction SilentlyContinue
if ($null -eq $namespaceExists) {
    Write-Host "   Creando namespace '$NAMESPACE'..." -ForegroundColor Yellow
    kubectl create namespace $NAMESPACE
}
Write-Host "✅ Namespace '$NAMESPACE' listo" -ForegroundColor Green

# Aplicar ConfigMaps
Write-Host "`n🔧 Aplicando ConfigMaps..." -ForegroundColor Yellow
kubectl apply -f kubernetes/configmap.yaml
Write-Host "✅ ConfigMaps aplicados" -ForegroundColor Green

# Aplicar Back API Deployment
Write-Host "`n🚀 Aplicando Back API Deployment..." -ForegroundColor Yellow
kubectl apply -f kubernetes/deployments/back-api.yaml
Write-Host "✅ Back API Deployment aplicado" -ForegroundColor Green

# Esperar a que el deployment esté listo
Write-Host "`n⏳ Esperando a que Back API esté listo (esto puede tomar 1-2 minutos)..." -ForegroundColor Yellow
kubectl rollout status deployment/back-api -n $NAMESPACE --timeout=300s

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Back API está listo" -ForegroundColor Green
} else {
    Write-Host "⚠️  Timeout esperando Back API" -ForegroundColor Yellow
}

# Verificar pod está corriendo
Write-Host "`n📋 Estado de los pods:" -ForegroundColor Yellow
kubectl get pods -n $NAMESPACE -l app=back-api

# Mostrar variables de entorno
Write-Host "`n📝 Variables de ConfigMap aplicadas:" -ForegroundColor Yellow
$configMap = kubectl get configmap app-config -n $NAMESPACE -o yaml
$lines = $configMap | Select-String "(K8S_MODE|DOCKER_MODE|LOG_LEVEL|API_URL)"
if ($lines) {
    Write-Host $lines
} else {
    Write-Host "No encontradas" -ForegroundColor Yellow
}

# Obtener logs
Write-Host "`n📊 Últimos logs de Back API:" -ForegroundColor Yellow
kubectl logs -n $NAMESPACE -l app=back-api --tail=20

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "✅ Actualización completada" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Verificar logs: kubectl logs -f deployment/back-api -n $NAMESPACE"
Write-Host "2. Acceder a un pod: kubectl exec -it <pod-name> -n $NAMESPACE -- cmd"
Write-Host "3. Probar endpoints: curl http://back-api/docs"
