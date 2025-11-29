# Script para detener el proyecto

# Establecer la codificación UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'

# Obtener el directorio actual
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Directorio del proyecto: $projectRoot" -ForegroundColor Cyan

# Detener los contenedores de Docker
Write-Host "Deteniendo contenedores de Docker..." -ForegroundColor Cyan

# Detener API AACh
try {
    docker compose -f "$projectRoot\api-aach\docker-compose.yml" down
    Write-Host "Contenedor API AACh detenido." -ForegroundColor Green
} catch {
    Write-Host "Error al detener el contenedor API AACh (ruta: $projectRoot\api-aach\docker-compose.yml):" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Detener API Carabineros
try {
    docker compose -f "$projectRoot\api-carabineros\docker-compose.yml" down
    Write-Host "Contenedor API Carabineros detenido." -ForegroundColor Green
} catch {
    Write-Host "Error al detener el contenedor API Carabineros (ruta: $projectRoot\api-carabineros\docker-compose.yml):" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Detener API MTT
try {
    docker compose -f "$projectRoot\api-mtt\docker-compose.yml" down
    Write-Host "Contenedor API MTT detenido." -ForegroundColor Green
} catch {
    Write-Host "Error al detener el contenedor API MTT (ruta: $projectRoot\api-mtt\docker-compose.yml):" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Detener API PRT
try {
    docker compose -f "$projectRoot\api-prt\docker-compose.yml" down
    Write-Host "Contenedor API PRT detenido." -ForegroundColor Green
} catch {
    Write-Host "Error al detener el contenedor API PRT (ruta: $projectRoot\api-prt\docker-compose.yml):" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Detener API SGD
try {
    docker compose -f "$projectRoot\api-sgd\docker-compose.yml" down
    Write-Host "Contenedor API SGD detenido." -ForegroundColor Green
} catch {
    Write-Host "Error al detener el contenedor API SGD (ruta: $projectRoot\api-sgd\docker-compose.yml):" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Detener API SII
try {
    docker compose -f "$projectRoot\api-sii\docker-compose.yml" down
    Write-Host "Contenedor API SII detenido." -ForegroundColor Green
} catch {
    Write-Host "Error al detener el contenedor API SII (ruta: $projectRoot\api-sii\docker-compose.yml):" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Detener API SRCEI
try {
    docker compose -f "$projectRoot\api-srcei\docker-compose.yml" down
    Write-Host "Contenedor API SRCEI detenido." -ForegroundColor Green
} catch {
    Write-Host "Error al detener el contenedor API SRCEI (ruta: $projectRoot\api-srcei\docker-compose.yml):" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Detener API TGR
try {
    docker compose -f "$projectRoot\api-tgr\docker-compose.yml" down
    Write-Host "Contenedor API TGR detenido." -ForegroundColor Green
} catch {
    Write-Host "Error al detener el contenedor API TGR (ruta: $projectRoot\api-tgr\docker-compose.yml):" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Detener API Back
try {
    docker compose -f "$projectRoot\back\docker-compose.yml" down
    Write-Host "Contenedor API Back detenido." -ForegroundColor Green
} catch {
    Write-Host "Error al detener el contenedor API Back (ruta: $projectRoot\back\docker-compose.yml):" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "Todos los contenedores han sido detenidos." -ForegroundColor Green
Write-Host "Para iniciar nuevamente, ejecuta: .\run-project.ps1" -ForegroundColor Yellow