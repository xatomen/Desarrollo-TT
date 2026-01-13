# =========================================
# Script de Validación - Plan B Local
# =========================================
# Verifica que todos los servicios estén funcionando

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Validación de Servicios - Plan B Local" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allHealthy = $true

# Función para probar conectividad
function Test-Service {
    param(
        [string]$Name,
        [string]$Url,
        [int]$Port
    )
    
    Write-Host "Verificando $Name..." -ForegroundColor Yellow
    
    try {
        # Intenta conectar al puerto
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $asyncResult = $tcpClient.BeginConnect("localhost", $Port, $null, $null)
        $wait = $asyncResult.AsyncWaitHandle.WaitOne(3000)
        
        if ($wait -and $tcpClient.Connected) {
            Write-Host "  ✓ $Name está respondiendo en puerto $Port" -ForegroundColor Green
            $tcpClient.Close()
            return $true
        } else {
            Write-Host "  ✗ $Name NO está respondiendo en puerto $Port" -ForegroundColor Red
            if ($tcpClient.Connected) { $tcpClient.Close() }
            return $false
        }
    } catch {
        Write-Host "  ✗ Error al conectar a $Name : $_" -ForegroundColor Red
        return $false
    }
}

# Test de Docker Compose
Write-Host "Verificando Docker Compose..." -ForegroundColor Yellow
try {
    $output = docker compose -f docker-compose.local.yml ps 2>&1
    if ($output -match "error" -or $output -match "Error") {
        Write-Host "  ✗ Docker Compose no está disponible" -ForegroundColor Red
        $allHealthy = $false
    } else {
        Write-Host "  ✓ Docker Compose funcionando" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Error al ejecutar Docker Compose: $_" -ForegroundColor Red
    $allHealthy = $false
}

Write-Host ""

# Tests de servicios
$services = @(
    @{ Name = "MySQL"; Port = 3306 },
    @{ Name = "Nginx"; Port = 80 },
    @{ Name = "Backend"; Port = 8009 },
    @{ Name = "API TGR"; Port = 8001 },
    @{ Name = "Frontend (obtener-permiso)"; Port = 3001 }
)

foreach ($service in $services) {
    if (-not (Test-Service -Name $service.Name -Port $service.Port)) {
        $allHealthy = $false
    }
    Write-Host ""
}

# Test de Base de Datos
Write-Host "Verificando Base de Datos..." -ForegroundColor Yellow
try {
    $dbTest = docker compose -f docker-compose.local.yml exec -T mysql mysqladmin ping -h localhost 2>&1
    if ($dbTest -match "mysqld is alive") {
        Write-Host "  ✓ MySQL respondiendo correctamente" -ForegroundColor Green
    } else {
        Write-Host "  ✗ MySQL no está respondiendo" -ForegroundColor Red
        $allHealthy = $false
    }
} catch {
    Write-Host "  ✗ Error al probar MySQL: $_" -ForegroundColor Red
    $allHealthy = $false
}

Write-Host ""

# Resumen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Estado de Servicios:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
docker compose -f docker-compose.local.yml ps

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allHealthy) {
    Write-Host "✓ TODOS LOS SERVICIOS FUNCIONAN CORRECTAMENTE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Accede a:" -ForegroundColor Green
    Write-Host "  Frontend: http://localhost" -ForegroundColor White
    Write-Host "  APIs:     http://localhost:8001 a 8008" -ForegroundColor White
} else {
    Write-Host "✗ ALGUNOS SERVICIOS NO ESTÁN DISPONIBLES" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Revisa los logs:" -ForegroundColor Yellow
    Write-Host "  docker compose -f docker-compose.local.yml logs" -ForegroundColor White
}

Write-Host ""
