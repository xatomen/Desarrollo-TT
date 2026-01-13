# =========================================
# Script de Parada - Plan B Local
# =========================================
# Detiene todos los servicios

param(
    [switch]$Clean = $false
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Deteniendo servicios..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

if ($Clean) {
    Write-Host "Modo: Limpiar Todo (down -v)" -ForegroundColor Red
    docker compose -f docker-compose.local.yml down -v
    Write-Host "✓ Todos los contenedores y volúmenes han sido eliminados" -ForegroundColor Green
} else {
    Write-Host "Modo: Detener sin eliminar (down)" -ForegroundColor Yellow
    docker compose -f docker-compose.local.yml down
    Write-Host "✓ Servicios detenidos (datos preservados)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Estado actual:" -ForegroundColor Cyan
docker compose -f docker-compose.local.yml ps

Write-Host ""
Write-Host "Para reiniciar, ejecuta: .\start-local-demo.ps1" -ForegroundColor Cyan
