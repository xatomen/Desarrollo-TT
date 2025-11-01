# Script para iniciar el proyecto

# Establecer la codificación UTF-8
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Obtener el directorio actual
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Directorio del proyecto: $projectRoot" -ForegroundColor Cyan

# Ejecutar los contenedores de Docker
Write-Host "Iniciando contenedores de Docker..." -ForegroundColor Cyan

# Iniciar API AACh
try {
    docker compose -f $projectRoot\api-aach\docker-compose.yml up -d
    Write-Host "Contenedor API AACh iniciado." -ForegroundColor Green
} catch {
    Write-Host "Error al iniciar el contenedor API AACh (ruta: $projectRoot\api-aach\docker-compose.yml):" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Iniciar API Carabineros
try {
    docker compose -f $projectRoot\api-carabineros\docker-compose.yml up -d
    Write-Host "Contenedor API Carabineros iniciado." -ForegroundColor Green
} catch {
    Write-Host "Error al iniciar el contenedor API Carabineros (ruta: $projectRoot\api-carabineros\docker-compose.yml):" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Iniciar API MTT
try {
    docker compose -f $projectRoot\api-mtt\docker-compose.yml up -d
    Write-Host "Contenedor API MTT iniciado." -ForegroundColor Green
} catch {
    Write-Host "Error al iniciar el contenedor API MTT (ruta: $projectRoot\api-mtt\docker-compose.yml):" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Iniciar API PRT
try {
    docker compose -f $projectRoot\api-prt\docker-compose.yml up -d
    Write-Host "Contenedor API PRT iniciado." -ForegroundColor Green
} catch {
    Write-Host "Error al iniciar el contenedor API PRT (ruta: $projectRoot\api-prt\docker-compose.yml):" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Iniciar API SGD
try {
    docker compose -f $projectRoot\api-sgd\docker-compose.yml up -d
    Write-Host "Contenedor API SGD iniciado." -ForegroundColor Green
} catch {
    Write-Host "Error al iniciar el contenedor API SGD (ruta: $projectRoot\api-sgd\docker-compose.yml):" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Iniciar API SII
try {
    docker compose -f $projectRoot\api-sii\docker-compose.yml up -d
    Write-Host "Contenedor API SII iniciado." -ForegroundColor Green
} catch {
    Write-Host "Error al iniciar el contenedor API SII (ruta: $projectRoot\api-sii\docker-compose.yml):" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Iniciar API SRCEI
try {
    docker compose -f $projectRoot\api-srcei\docker-compose.yml up -d
    Write-Host "Contenedor API SRCEI iniciado." -ForegroundColor Green
} catch {
    Write-Host "Error al iniciar el contenedor API SRCEI (ruta: $projectRoot\api-srcei\docker-compose.yml):" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Iniciar API TGR
try {
    docker compose -f $projectRoot\api-tgr\docker-compose.yml up -d
    Write-Host "Contenedor API TGR iniciado." -ForegroundColor Green
} catch {
    Write-Host "Error al iniciar el contenedor API TGR (ruta: $projectRoot\api-tgr\docker-compose.yml):" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Iniciar API Back
try {
    docker compose -f $projectRoot\back\docker-compose.yml up -d
    Write-Host "Contenedor API Back iniciado." -ForegroundColor Green
} catch {
    Write-Host "Error al iniciar el contenedor API Back (ruta: $projectRoot\back\docker-compose.yml):" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "Todos los contenedores han sido iniciados." -ForegroundColor Green
Write-Host "Para detener los contenedores, ejecuta: .\stop-containers.ps1" -ForegroundColor Yellow