# Script para eliminar todos los deployments

param(
    [switch]$Force
)

Write-Host "Deleting deployments from namespace desarrollo-tt..." -ForegroundColor Yellow

if (!$Force) {
    Write-Host "This will delete all deployments. Are you sure? (y/n)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne 'y') {
        Write-Host "Cancelled." -ForegroundColor Gray
        exit 0
    }
}

kubectl delete deployments --all -n desarrollo-tt

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployments deleted successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to delete deployments" -ForegroundColor Red
}

Write-Host ""
Write-Host "Done." -ForegroundColor Cyan
