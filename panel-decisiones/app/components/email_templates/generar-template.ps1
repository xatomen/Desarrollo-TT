# Script para generar emailTemplate.ts desde recordatorio_pago.html
# Doble click para ejecutar

Write-Host "🔄 Generando template de email..." -ForegroundColor Cyan

try {
    # Obtener la ruta del directorio del script
    $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
    Set-Location $scriptPath
    
    # Ejecutar el script de Node.js
    node generateTemplate.js
    
    Write-Host "✅ Template generado exitosamente!" -ForegroundColor Green
    Write-Host "📁 Archivo actualizado: emailTemplate.ts" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Error al generar el template:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Pausar para que el usuario pueda ver el resultado
Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")