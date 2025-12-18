# Guía Rápida: Construir y Destruir EKS

## 📦 CONSTRUIR INFRAESTRUCTURA

### Paso 1: Preparar variables
```powershell
cd terraform
cp env.tfvars.example env.tfvars
# Editar env.tfvars con tus valores (región, contraseña BD, etc)
```

### Paso 2: Inicializar Terraform
```bash
terraform init
```

### Paso 3: Revisar qué se va a crear
```bash
terraform plan -var-file="env.tfvars"
```

### Paso 4: Crear la infraestructura
```bash
terraform apply -var-file="env.tfvars"
# Confirmar escribiendo: yes
# ⏱️ Esperar 10-15 minutos
```

---

## 🔧 CONFIGURAR EL CLUSTER EKS

Después de que `terraform apply` termine, ejecuta esto:

### Paso 5: Conectar kubectl al cluster
```bash
aws eks update-kubeconfig --region us-east-1 --name desarrollo-tt-eks-cluster
kubectl cluster-info
```

### Paso 5.5: Instalar AWS Load Balancer Controller (necesario para Ingress)

#### 5.5.1: Crear IAM Role para el Controller

Primero, obtén el OIDC ID del cluster:
```powershell
$OIDC_ID = aws eks describe-cluster --name desarrollo-tt-eks-cluster --query 'cluster.identity.oidc.issuer' --output text --region us-east-1 | Select-String -Pattern "(?<=id/)[^/]+$" -AllMatches | ForEach-Object { $_.Matches[0].Value }
Write-Output "OIDC ID: $OIDC_ID"
```

Luego, crea la IAM Role en AWS Console:
1. Ve a **IAM → Roles → Create role**
2. Selecciona **Custom trust policy**
3. Pega esta política (reemplaza `OIDC_ID` y `ACCOUNT_ID` con tus valores):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::892797891584:oidc-provider/oidc.eks.us-east-1.amazonaws.com/id/[TU_OIDC_ID]"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.us-east-1.amazonaws.com/id/[TU_OIDC_ID]:aud": "sts.amazonaws.com",
          "oidc.eks.us-east-1.amazonaws.com/id/[TU_OIDC_ID]:sub": "system:serviceaccount:kube-system:aws-load-balancer-controller"
        }
      }
    }
  ]
}
```

4. Nombre: `desarrollo-tt-aws-load-balancer-controller`
5. Adjunta la política: `AmazonEKSLoadBalancerControllerPolicy` (o crea una inline si no existe)

Guarda el ARN de la role creada. Se verá así:
```
arn:aws:iam::892797891584:role/desarrollo-tt-aws-load-balancer-controller
```

#### 5.5.2: Crear Service Account y vincular IAM Role
```powershell
# Crear namespace y service account
kubectl create namespace kube-system --dry-run=client -o yaml | kubectl apply -f -
kubectl create serviceaccount aws-load-balancer-controller -n kube-system --dry-run=client -o yaml | kubectl apply -f -

# Anotar la service account con el ARN de la IAM Role
kubectl annotate serviceaccount aws-load-balancer-controller -n kube-system `
  eks.amazonaws.com/role-arn=arn:aws:iam::892797891584:role/desarrollo-tt-aws-load-balancer-controller `
  --overwrite
```

#### 5.5.3: Instalar el Helm Chart
```powershell
# Instalar Helm si no lo tienes
choco install kubernetes-helm  # En Windows

# Agregar repositorio de AWS
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Instalar el controlador (requiere la IAM Role del Paso 5.5.1)
helm install aws-load-balancer-controller eks/aws-load-balancer-controller `
  -n kube-system `
  --set clusterName=desarrollo-tt-eks-cluster `
  --set serviceAccount.create=false `
  --set serviceAccount.name=aws-load-balancer-controller

# Verificar que se instaló
kubectl get deployment -n kube-system aws-load-balancer-controller
kubectl get pods -n kube-system | Select-String "aws-load-balancer"
```

#### 5.5.4: Esperar a que el Ingress obtenga su ADDRESS
```powershell
# Esperar ~30 segundos y verificar que el Ingress tenga ADDRESS asignado
Start-Sleep -Seconds 30
kubectl get ingress -n desarrollo-tt

# Obtener el hostname del ALB
kubectl get ingress main-ingress -n desarrollo-tt -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### Paso 6: Aplicar configuraciones
```bash
cd ../kubernetes

# ConfigMaps (variables de configuración)
kubectl apply -f configmap.yaml

# Secrets (contraseñas, API keys)
# ⚠️ Ver: kubernetes/SECRETS_SETUP.md para instrucciones detalladas
kubectl apply -f secrets.yaml

# Deployments de las APIs
kubectl apply -f deployments/

# Ingress (enrutamiento con ALB - requiere Helm del Paso 5.5)
kubectl apply -f ingress.yaml
```

### Paso 7: Verificar que todo está corriendo
```bash
kubectl get pods -A
kubectl get svc -A
kubectl get ingress -n desarrollo-tt
```

### Paso 8: Cargar datos en la base de datos
```bash
# Obtener endpoint RDS:
terraform output rds_endpoint

# Conectar y cargar datos (repite para cada API: aach, carabineros, mtt, prt, sgd, sii, srcei, tgr):
mysql -h <RDS_ENDPOINT> -u admin -p
# Ingresar contraseña de env.tfvars

# Dentro de MySQL:
source ../api-aach/script.sql;
source ../api-aach/datos_prueba.sql;
exit
```

---

## 🗑️ DESTRUIR INFRAESTRUCTURA

### Solo destruir EKS (mantiene RDS y ECR)

#### Paso 1: Limpiar recursos de Kubernetes primero
```powershell
# Eliminar Ingress (libera el ALB)
kubectl delete ingress --all -n desarrollo-tt

# Eliminar deployments
kubectl delete deployment --all -n desarrollo-tt

# Eliminar Helm release del ALB Controller
helm uninstall aws-load-balancer-controller -n kube-system

# Esperar a que se limpien los recursos
Start-Sleep -Seconds 30
```

#### Paso 2: Destruir EKS con Terraform
```powershell
cd terraform
terraform destroy -target="module.eks" -var-file="env.tfvars"
# Confirmar escribiendo: yes
```

### Destruir TODO
```bash
cd terraform
terraform destroy -var-file="env.tfvars"
# Confirmar escribiendo: yes
# ⏱️ Esperar 10-15 minutos
```

---

## ⚠️ Notas Importantes

1. **El Helm Controller (Paso 5.5) es OBLIGATORIO:**
   - Sin él, el Ingress no funcionará
   - Se destruye junto con EKS, debes reinstalarlo cada vez

2. **Primero destruye los pods/servicios de Kubernetes antes de destruir EKS:**
   ```bash
   kubectl delete -f kubernetes/deployments/ --all-namespaces
   kubectl delete -f kubernetes/ingress.yaml
   ```

3. **Guarda el endpoint RDS después de apply:**
   ```bash
   terraform output rds_endpoint > rds_endpoint.txt
   ```

4. **Para ver logs de los pods:**
   ```bash
   kubectl logs -n default <nombre-pod>
   ```

5. **Para acceder a un pod:**
   ```bash
   kubectl exec -it <nombre-pod> -- /bin/bash
   ```

---

## 📋 Checklist Rápido

- [ ] Variables en env.tfvars configuradas
- [ ] `terraform init` ejecutado
- [ ] `terraform apply` completado exitosamente
- [ ] `kubectl cluster-info` muestra conexión
- [ ] ConfigMaps y Secrets aplicados
- [ ] Deployments corriendo: `kubectl get pods`
- [ ] Datos cargados en RDS
- [ ] Ingress funcionando (si aplica)
