param(
    [switch]$Clean = $false,
    [switch]$BuildImages = $false
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Plan B - Demo Local Docker Compose" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Docker esta instalado
docker --version > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "X Docker no esta instalado o no esta en PATH" -ForegroundColor Red
    Exit 1
}
Write-Host "OK Docker encontrado" -ForegroundColor Green

# Verificar si Docker Compose esta disponible
docker compose version > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "X Docker Compose no esta disponible" -ForegroundColor Red
    Exit 1
}
Write-Host "OK Docker Compose encontrado" -ForegroundColor Green
Write-Host ""

# Limpiar si se solicita
if ($Clean) {
    Write-Host "Limpiando contenedores y volumenes anteriores..." -ForegroundColor Yellow
    docker compose -f docker-compose.local.yml down -v
    Write-Host "OK Limpieza completada" -ForegroundColor Green
    Write-Host ""
}

# Construccion de imagenes
if ($BuildImages) {
    Write-Host "Construyendo imagenes de Docker..." -ForegroundColor Yellow
    docker compose -f docker-compose.local.yml build --no-cache
    Write-Host "OK Imagenes construidas" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "Nota: No se estan reconstruyendo las imagenes (usa -BuildImages para hacerlo)" -ForegroundColor Cyan
    Write-Host ""
}

# Iniciar todos los servicios
Write-Host "Iniciando todos los servicios..." -ForegroundColor Yellow
docker compose -f docker-compose.local.yml up -d

# Mostrar estado
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Esperando a que todos los servicios esten listos..." -ForegroundColor Cyan
Write-Host "Esto puede tomar 1-2 minutos en la primera ejecucion..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Esperar hasta 3 minutos a que todos los servicios estén listos
$maxWait = 180
$elapsed = 0
while ($elapsed -lt $maxWait) {
    $running = docker compose -f docker-compose.local.yml ps --quiet | Measure-Object | Select-Object -ExpandProperty Count
    $expected = 15  # mysql, 8 apis, backend, 2 frontends, nginx
    
    if ($running -eq $expected) {
        Write-Host "OK Todos los servicios estan corriendo" -ForegroundColor Green
        break
    }
    
    Start-Sleep -Seconds 5
    $elapsed = $elapsed + 5
    $percentage = [math]::Min(($elapsed / $maxWait) * 100, 99)
    $msg = "  Esperando... ({0}% - {1} servicios / {2})" -f $percentage, $running, $expected
    Write-Host $msg -ForegroundColor Yellow
}

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Estado de Servicios" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
docker compose -f docker-compose.local.yml ps

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "OK Servicios iniciados correctamente" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Acceso a la Demo Local:" -ForegroundColor Cyan
Write-Host "  - Frontend Obtener Permiso: http://localhost:3001" -ForegroundColor White
Write-Host "  - Frontend Panel Decisiones: http://localhost:3002" -ForegroundColor White
Write-Host "  - Nginx (APIs y Backend):   http://localhost:8080" -ForegroundColor White
Write-Host ""

Write-Host "Backend y APIs (via Nginx):" -ForegroundColor Cyan
Write-Host "  - Backend:       http://localhost:8080/back" -ForegroundColor White
Write-Host "  - API TGR:       http://localhost:8080/tgr" -ForegroundColor White
Write-Host "  - API AACH:      http://localhost:8080/aach" -ForegroundColor White
Write-Host "  - API Carabineros: http://localhost:8080/carabineros" -ForegroundColor White
Write-Host "  - API MTT:       http://localhost:8080/mtt" -ForegroundColor White
Write-Host "  - API PRT:       http://localhost:8080/prt" -ForegroundColor White
Write-Host "  - API SGD:       http://localhost:8080/sgd" -ForegroundColor White
Write-Host "  - API SII:       http://localhost:8080/sii" -ForegroundColor White
Write-Host "  - API SRCEI:     http://localhost:8080/srcei" -ForegroundColor White
Write-Host ""

Write-Host "APIs Individuales (puerto directo):" -ForegroundColor Cyan
Write-Host "  - API TGR:        http://localhost:8001" -ForegroundColor White
Write-Host "  - API AACH:       http://localhost:8002" -ForegroundColor White
Write-Host "  - API Carabineros: http://localhost:8003" -ForegroundColor White
Write-Host "  - API MTT:        http://localhost:8004" -ForegroundColor White
Write-Host "  - API PRT:        http://localhost:8005" -ForegroundColor White
Write-Host "  - API SGD:        http://localhost:8006" -ForegroundColor White
Write-Host "  - API SII:        http://localhost:8007" -ForegroundColor White
Write-Host "  - API SRCEI:      http://localhost:8008" -ForegroundColor White
Write-Host "  - Backend:        http://localhost:8009" -ForegroundColor White
Write-Host ""

Write-Host "Base de Datos:" -ForegroundColor Cyan
Write-Host "  - Host:     localhost:3307" -ForegroundColor White
Write-Host "  - Usuario:  app_user" -ForegroundColor White
Write-Host "  - Password: app_password" -ForegroundColor White
Write-Host "  - Database: desarrollo_tt" -ForegroundColor White
Write-Host ""

Write-Host "Datos de Prueba Cargados:" -ForegroundColor Cyan
Write-Host "  - 5 Usuarios (propietarios, fiscalizadores, admin)" -ForegroundColor White
Write-Host "  - 5 Vehiculos" -ForegroundColor White
Write-Host "  - 5 Permisos de Circulacion" -ForegroundColor White
Write-Host "  - 3 Infracciones" -ForegroundColor White
Write-Host ""

Write-Host "Comandos utiles:" -ForegroundColor Cyan
Write-Host "  Ver logs:       docker compose -f docker-compose.local.yml logs -f" -ForegroundColor White
Write-Host "  Detener:        docker compose -f docker-compose.local.yml down" -ForegroundColor White
Write-Host "  Limpiar todo:   docker compose -f docker-compose.local.yml down -v" -ForegroundColor White
Write-Host "  Ver logs API:   docker compose -f docker-compose.local.yml logs -f api-tgr" -ForegroundColor White
Write-Host ""
