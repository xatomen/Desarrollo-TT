# Configuración de Secretos en Kubernetes

## Descripción
Este documento describe cómo crear y configurar los secretos necesarios para desplegar la aplicación en EKS.

## Secretos Requeridos

### 1. Credenciales de Base de Datos (`db-credentials`)
Contiene las credenciales para acceder a RDS MySQL.

```powershell
kubectl create secret generic db-credentials `
  --from-literal=DB_USER=jorge `
  --from-literal=DB_PASSWORD=97494193 `
  -n desarrollo-tt --dry-run=client -o yaml | kubectl apply -f -
```

### 2. Secretos de API (`api-secrets`)
Contiene tokens y keys para servicios externos.

```powershell
kubectl create secret generic api-secrets `
  --from-literal=JWT_SECRET=your-jwt-secret-here `
  --from-literal=GEMINI_API_KEY=your-gemini-key-here `
  --from-literal=SENDGRID_API_KEY=your-sendgrid-key-here `
  --from-literal=API_KEY=your-api-key-here `
  -n desarrollo-tt --dry-run=client -o yaml | kubectl apply -f -
```

### 3. Secreto de Pull de ECR (`ecr-secret`)
Permite que los pods descarguen imágenes de ECR.

```powershell
kubectl create secret docker-registry ecr-secret `
  --docker-server=892797891584.dkr.ecr.us-east-1.amazonaws.com `
  --docker-username=AWS `
  --docker-password=$(aws ecr get-login-password --region us-east-1) `
  -n desarrollo-tt --dry-run=client -o yaml | kubectl apply -f -
```

## Verificar Secretos

```powershell
# Listar todos los secretos
kubectl get secrets -n desarrollo-tt

# Ver detalles de un secreto
kubectl get secret db-credentials -n desarrollo-tt -o yaml
```

## Actualizar un Secreto

```powershell
# Opción 1: Eliminar y recrear
kubectl delete secret db-credentials -n desarrollo-tt
kubectl create secret generic db-credentials `
  --from-literal=DB_USER=jorge `
  --from-literal=DB_PASSWORD=97494193 `
  -n desarrollo-tt

# Opción 2: Patch (requiere PowerShell con escaping correcto)
kubectl patch secret db-credentials -n desarrollo-tt -p '{"data":{"DB_PASSWORD":"OTc0OTQxOTM="}}'
```

## Notas
- Los valores en Kubernetes están codificados en base64, no encriptados
- Usar `kubectl apply -f` con `--dry-run=client` para verificar antes de aplicar
- Después de actualizar secretos, reiniciar los deployments: `kubectl rollout restart deployment/<name> -n desarrollo-tt`
