# Script para aplicar todos los deployments con variables dinamicas desde .env

param(
    [switch]$DryRun
)

# Cargar variables de entorno desde .env
if (!(Test-Path ".env")) {
    Write-Host "Error: .env file not found" -ForegroundColor Red
    exit 1
}

Write-Host "Loading variables from .env..." -ForegroundColor Cyan

$env_content = Get-Content ".env" -Raw
$env_vars = @{}

$env_content -split "`n" | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        $key, $value = $line -split "=", 2
        if ($key -and $value) {
            $env_vars[$key.Trim()] = $value.Trim()
        }
    }
}

# Validar variables necesarias para deployments
$required_vars = @('AWS_ACCOUNT_ID', 'AWS_REGION', 'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD')
$missing_vars = @()

foreach ($var in $required_vars) {
    if (-not $env_vars.ContainsKey($var)) {
        $missing_vars += $var
    }
}

if ($missing_vars.Count -gt 0) {
    Write-Host "Missing required variables:" -ForegroundColor Red
    $missing_vars | ForEach-Object { Write-Host "  - $_" }
    exit 1
}

Write-Host "Variables loaded successfully" -ForegroundColor Green
Write-Host ""

# Crear directorio temporal
$temp_dir = ".\temp-deployments"
if (!(Test-Path $temp_dir)) {
    New-Item -ItemType Directory -Path $temp_dir | Out-Null
}

Write-Host "Processing deployment files..." -ForegroundColor Cyan

# Procesar todos los archivos yaml en deployments/
Get-ChildItem ".\deployments\" -Filter "*.yaml" | ForEach-Object {
    $file = $_
    $content = Get-Content $file.FullName -Raw
    
    # Reemplazar variables
    $content = $content -replace [regex]::Escape("{{AWS_ACCOUNT_ID}}"), $env_vars['AWS_ACCOUNT_ID']
    $content = $content -replace [regex]::Escape("{{AWS_REGION}}"), $env_vars['AWS_REGION']
    $content = $content -replace [regex]::Escape("{{DB_HOST}}"), $env_vars['DB_HOST']
    $content = $content -replace [regex]::Escape("{{DB_PORT}}"), $env_vars['DB_PORT']
    $content = $content -replace [regex]::Escape("{{DB_USERNAME}}"), $env_vars['DB_USERNAME']
    $content = $content -replace [regex]::Escape("{{DB_PASSWORD}}"), $env_vars['DB_PASSWORD']
    
    # Guardar archivo procesado
    Set-Content -Path "$temp_dir\$($file.Name)" -Value $content -Encoding UTF8
    Write-Host "  Processed $($file.Name)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Applying deployments..." -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "(DRY RUN MODE)" -ForegroundColor Yellow
    kubectl apply -f $temp_dir -n desarrollo-tt --dry-run=client
} else {
    kubectl apply -f $temp_dir -n desarrollo-tt
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployments applied successfully" -ForegroundColor Green
} else {
    Write-Host "Failed to apply deployments" -ForegroundColor Red
}

# Limpiar temporal
Remove-Item $temp_dir -Recurse -Force

Write-Host ""
Write-Host "Done." -ForegroundColor Cyan
