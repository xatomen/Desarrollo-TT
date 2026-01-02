###################################################################################################################################
# 1. Cargar variables de entorno desde .env
###################################################################################################################################

# Verificar que existe el archivo .env
if (!(Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found in current directory" -ForegroundColor Red
    Write-Host "Please create .env file with the following variables:" -ForegroundColor Yellow
    Write-Host "AWS_ACCOUNT_ID=your_aws_account_id"
    Write-Host "AWS_REGION=us-east-1"
    Write-Host "ACM_CERTIFICATE_ARN=arn:aws:acm:region:account:certificate/id"
    Write-Host "JWT_SECRET=your_jwt_secret"
    Write-Host "GEMINI_API_KEY=your_gemini_api_key"
    Write-Host "SENDGRID_API_KEY=your_sendgrid_api_key"
    Write-Host "API_KEY=your_api_key"
    Write-Host "DB_USERNAME=your_db_username"
    Write-Host "DB_PASSWORD=your_db_password"
    exit 1
}

Write-Host "Loading variables from .env file..." -ForegroundColor Cyan

# Leer el archivo .env y crear un objeto con las variables
$env_content = Get-Content ".env" -Raw
$env_vars = @{}

# Parsear el archivo .env (formato: KEY=VALUE)
$env_content -split "`n" | ForEach-Object {
    $line = $_.Trim()
    # Ignorar líneas vacías y comentarios
    if ($line -and -not $line.StartsWith("#")) {
        $key, $value = $line -split "=", 2
        if ($key -and $value) {
            $env_vars[$key.Trim()] = $value.Trim()
        }
    }
}

# Verificar que todas las variables necesarias existan
$required_vars = @('AWS_ACCOUNT_ID', 'AWS_REGION', 'ACM_CERTIFICATE_ARN', 'JWT_SECRET', 'GEMINI_API_KEY', 'SENDGRID_API_KEY', 'API_KEY', 'DB_USERNAME', 'DB_PASSWORD')
$missing_vars = @()

foreach ($var in $required_vars) {
    if (-not $env_vars.ContainsKey($var)) {
        $missing_vars += $var
    }
}

if ($missing_vars.Count -gt 0) {
    Write-Host "❌ Error: Missing required variables in .env file:" -ForegroundColor Red
    $missing_vars | ForEach-Object { Write-Host "  - $_" }
    exit 1
}

Write-Host "✅ All required variables found in .env" -ForegroundColor Green
Write-Host ""

###################################################################################################################################
# 2. Procesar y aplicar ingress.yaml con variables dinámicas
###################################################################################################################################
Write-Host "Processing ingress.yaml with dynamic variables..." -ForegroundColor Cyan

# Leer ingress.yaml
$ingress_content = Get-Content "ingress.yaml" -Raw

# Reemplazar variables
$ingress_content = $ingress_content -replace [regex]::Escape("{{ACM_CERTIFICATE_ARN}}"), $env_vars['ACM_CERTIFICATE_ARN']

# Crear temporal con el contenido procesado
$temp_ingress = ".\temp-ingress.yaml"
Set-Content -Path $temp_ingress -Value $ingress_content -Encoding UTF8

# Asegurarse que el namespace existe
Write-Host "Ensuring namespace desarrollo-tt exists..." -ForegroundColor Gray
kubectl create namespace desarrollo-tt --dry-run=client -o yaml | kubectl apply -f - | Out-Null

# Aplicar ingress procesado
Write-Host "Applying ingress.yaml..." -ForegroundColor Gray
kubectl apply -f $temp_ingress -n desarrollo-tt

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Ingress applied successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to apply ingress" -ForegroundColor Red
    Remove-Item $temp_ingress -Force
    exit 1
}

Remove-Item $temp_ingress -Force
Write-Host ""

###################################################################################################################################
# 3. Crear secretos desde archivo .env
###################################################################################################################################
kubectl create secret generic api-secrets `
    --from-literal=JWT_SECRET=$($env_vars['JWT_SECRET']) `
    --from-literal=GEMINI_API_KEY=$($env_vars['GEMINI_API_KEY']) `
    --from-literal=SENDGRID_API_KEY=$($env_vars['SENDGRID_API_KEY']) `
    --from-literal=API_KEY=$($env_vars['API_KEY']) `
    -n desarrollo-tt --dry-run=client -o yaml | kubectl apply -f -

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ api-secrets created successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create api-secrets" -ForegroundColor Red
    exit 1
}

# Crear secret db-credentials
Write-Host ""
Write-Host "Creating db-credentials..." -ForegroundColor Cyan
kubectl create secret generic db-credentials `
    --from-literal=DB_USER=$($env_vars['DB_USERNAME']) `
    --from-literal=DB_PASSWORD=$($env_vars['DB_PASSWORD']) `
    -n desarrollo-tt --dry-run=client -o yaml | kubectl apply -f -

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ db-credentials created successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create db-credentials" -ForegroundColor Red
    exit 1
}

# Verificar que los secretos fueron creados
Write-Host ""
Write-Host "Verifying secrets..." -ForegroundColor Cyan
kubectl get secrets -n desarrollo-tt | grep -E "api-secrets|db-credentials"

Write-Host ""
Write-Host "✅ All secrets created successfully!" -ForegroundColor Green

###################################################################################################################################
# 4. Aplicar configmap
###################################################################################################################################
Write-Host "Applying ConfigMap..." -ForegroundColor Gray
kubectl apply -f configmap.yaml -n desarrollo-tt

###################################################################################################################################
# 5. Aplicar deployments
###################################################################################################################################
Write-Host ""
Write-Host "Applying deployments and services..." -ForegroundColor Cyan
$deployments_dir = ".\deployments"

Write-Host "✅ API config ConfigMap created" -ForegroundColor Green

# Aplicar deployments con reemplazo de variables
Write-Host "Applying deployments..." -ForegroundColor Gray

# Procesar cada deployment file
Get-ChildItem -Path $deployments_dir -Filter "*.yaml" | ForEach-Object {
    $deployment_file = $_.FullName
    $deployment_content = Get-Content $deployment_file -Raw
    
    # Reemplazar placeholders
    $deployment_content = $deployment_content -replace [regex]::Escape("{{AWS_ACCOUNT_ID}}"), $env_vars['AWS_ACCOUNT_ID']
    $deployment_content = $deployment_content -replace [regex]::Escape("{{AWS_REGION}}"), $env_vars['AWS_REGION']
    $deployment_content = $deployment_content -replace [regex]::Escape("{{ACM_CERTIFICATE_ARN}}"), $env_vars['ACM_CERTIFICATE_ARN']
    
    # Crear archivo temporal
    $temp_file = "$($_.BaseName)-temp.yaml"
    Set-Content -Path $temp_file -Value $deployment_content -Encoding UTF8
    
    # Aplicar deployment temporal
    kubectl apply -f $temp_file -n desarrollo-tt
    
    # Limpiar archivo temporal
    Remove-Item $temp_file -Force
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All deployments applied successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Error applying deployments" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Verifying deployment status..." -ForegroundColor Cyan
kubectl get deployments -n desarrollo-tt
Write-Host ""
Write-Host "Pod status:" -ForegroundColor Cyan
kubectl get pods -n desarrollo-tt
Write-Host ""
Write-Host "✅ All deployments processed" -ForegroundColor Green