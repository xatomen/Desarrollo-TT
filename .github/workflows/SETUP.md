GitHub Secrets y Variables Requeridas

Para que el workflow funcione, debes configurar lo siguiente en tu repositorio:

SECRETOS (Settings > Secrets and variables > Actions > Secrets):
=================================================================

AWS_ROLE_ARN
  - Descripcion: ARN del role de IAM para OIDC
  - Formato: arn:aws:iam::ACCOUNT_ID:role/github-oidc-role
  - Obtener: 
    aws iam list-roles | grep github
    O en AWS Console > IAM > Roles

AWS_ACCOUNT_ID
  - Descripcion: ID de tu cuenta AWS
  - Formato: 123456789012
  - Obtener:
    aws sts get-caller-identity --query Account

EKS_CLUSTER_NAME
  - Descripcion: Nombre del cluster EKS
  - Formato: desarrollo-tt-eks-cluster (o el que uses en terraform)
  - Obtener:
    aws eks list-clusters --region us-east-1

DB_USERNAME
  - Descripcion: Usuario RDS (debe coincidir con Terraform)
  - Valor: admin (o el usuario configurado)

DB_PASSWORD
  - Descripcion: Contraseña RDS (debe coincidir con Terraform)
  - Valor: Tu contraseña configurada en Terraform
  - Sensible: YES

JWT_SECRET
  - Descripcion: Secret para firmar JWT tokens
  - Valor: Genera uno: openssl rand -hex 32
  - Sensible: YES

API_KEY
  - Descripcion: API key general para autenticacion
  - Valor: Genera uno: openssl rand -base64 32
  - Sensible: YES

VARIABLES (Settings > Secrets and variables > Actions > Variables):
====================================================================

AWS_REGION
  - Descripcion: Region de AWS
  - Valor: us-east-1 (o tu region)

NOTAS IMPORTANTES:
==================

1. OIDC Token (Recomendado, sin credenciales expuestas):
   - El workflow usa OIDC para autenticarse sin guardar credenciales en secretos
   - Necesitas configurar OIDC en AWS:
   
   aws iam create-openid-connect-provider \
     --url https://token.actions.githubusercontent.com \
     --client-id-list sts.amazonaws.com \
     --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1

2. Role de IAM para GitHub:
   - Permisos necesarios para ECR:
     * ecr:GetAuthorizationToken
     * ecr:BatchGetImage
     * ecr:GetDownloadUrlForLayer
     * ecr:PutImage
     * ecr:InitiateLayerUpload
     * ecr:UploadLayerPart
     * ecr:CompleteLayerUpload
   
   - Permisos necesarios para EKS:
     * eks:DescribeCluster
     * eks:ListClusters

3. Si prefieres usar AWS Access Keys (menos seguro):
   Reemplaza configure-aws-credentials con:
   
   - name: Configure AWS credentials
     with:
      aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
      aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      aws-region: ${{ env.AWS_REGION }}

FLUJO DEL WORKFLOW:
===================

1. build-images (PARALELO):
   - Build 4 imagenes Docker en paralelo (matriz)
   - Push a ECR con tags: commit-sha + latest
   - Usa caché de GitHub Actions para acelerar

2. push-to-ecr:
   - Verifica que las imagenes esten en ECR
   - Solo se ejecuta en push (no en PR)

3. deploy-to-eks:
   - Descarga kubeconfig del cluster EKS
   - Crea secret para pull images desde ECR
   - Actualiza deployments con nuevas imagenes
   - Espera rollout y verifica estado

4. notify:
   - Resumen final del despliegue

TRIGGERS:
=========

El workflow se ejecuta en:
- Push a main o develop
- Pull requests a main o develop

Solo deploy en:
- Push a main o develop (no en PR)

VARIABLES DISPONIBLES EN EL WORKFLOW:
=====================================

${{ github.sha }}          - Commit SHA (usado como image tag)
${{ github.ref }}          - Branch (main, develop, etc)
${{ github.event_name }}   - Tipo de evento (push, pull_request)
${{ secrets.* }}           - Tus secretos configurados
${{ vars.* }}              - Variables públicas configuradas

PARA AGREGAR MAS APPS:
======================

1. Agrega una entrada en la matriz de build-images:
   
   - app-name: tu-app
     context: ./tu-app (o ./tu-app/api para APIs)
     dockerfile: ./tu-app/Dockerfile (o ./tu-app/api/Dockerfile)
     image-name: tu-app-name

2. Agrega en el deploy-to-eks en los dos jobs (Update deployments y Wait for rollout):
   
   APPS=("obtener-permiso-app" "panel-decisiones-app" "fiscalizadores-app" "propietarios-app" "aach-api" "carabineros-api" "mtt-api" "prt-api" "sgd-api" "sii-api" "srcei-api" "tgr-api" "back-api" "tu-app-name")
