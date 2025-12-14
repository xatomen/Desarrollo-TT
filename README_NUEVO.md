# Desarrollo-TT - Plataforma de Fiscalizacion Multiagencia

Sistema integral de fiscalizacion para multiples agencias chilenas con arquitectura cloud-native en AWS EKS.

## 📋 Descripcion General

**Proyecto:** Trabajo de Titulo 1  
**Arquitectura:** Microservicios en Kubernetes (EKS)  
**Cloud:** AWS  
**Bases de Datos:** Aurora MySQL RDS  
**Contenedores:** Docker en Amazon ECR  
**CI/CD:** GitHub Actions  
**IaC:** Terraform  

### Servicios Incluidos (13 Total)

**Frontends (4):**
- `obtener-permiso` - Next.js 15.5.0 (Port 8002)
- `panel-decisiones` - Next.js 15.4.7 (Port 8001)
- `app-fiscalizadores` - Expo (Port 8081)
- `app-propietarios` - Expo (Port 8082)

**APIs (8) - Python 3.12 + FastAPI:**
- `api-aach` - AACH API
- `api-carabineros` - Carabineros API
- `api-mtt` - MTT API
- `api-prt` - PRT API
- `api-sgd` - SGD API
- `api-sii` - SII API
- `api-srcei` - SRCEI API
- `api-tgr` - TGR API

**Backend (1):**
- `back` - Backend principal (Python 3.12 + FastAPI)

---

## 🚀 Quick Start

**Tiempo estimado: 90 minutos** (incluyendo esperas)

### Opcion 1: Quick Start Rapid (Recomendado)
Ver documento: [QUICK_START.md](QUICK_START.md) - Checklist en 30 pasos

### Opcion 2: Guia Completa Paso a Paso
Ver documento: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guia detallada con explicaciones

### Requisitos Previos
```bash
# Instalar herramientas (Windows PowerShell)
choco install awscli
choco install kubernetes-cli
choco install terraform
choco install github-cli

# O en Linux
sudo apt-get install awscli2 kubectl terraform github-cli
```

### Pasos Principales (Resumen)
1. **Generar secretos** - JWT_SECRET, API_KEY, etc (5 min)
2. **Configurar GitHub Secrets** - 7 secretos requeridos (5 min)
3. **Configurar Terraform** - Variables de AWS (5 min)
4. **Desplegar infraestructura** - `terraform apply` (25-30 min)
5. **Actualizar Kubernetes** - Manifests con datos reales (5 min)
6. **Push a GitHub** - Trigger CI/CD (5 min)
7. **Monitorear workflow** - GitHub Actions build & deploy (10 min)
8. **Validar deployment** - Verificar pods y servicios (5 min)

---

## 📁 Estructura del Proyecto

```
Desarrollo-TT/
├── README.md                           # Documentacion principal
├── QUICK_START.md                      # Quick start en 30 pasos
├── DEPLOYMENT_GUIDE.md                 # Guia completa paso a paso
├── run-containers.ps1                  # Script para correr localmente
├── stop-containers.ps1                 # Script para detener

├── .github/
│   └── workflows/
│       ├── build-and-deploy.yml        # CI/CD: Build, push, deploy
│       ├── infrastructure-management.yml # Terraform apply/destroy
│       ├── SETUP.md                    # Setup de workflows
│       ├── GENERATE_SECRETS.md         # Guia para generar secretos
│       └── VALIDATION.md               # Validacion pre-deployment

├── terraform/
│   ├── main.tf                         # VPC, EKS, RDS, ECR
│   ├── variables.tf                    # Variables de entrada
│   ├── provider.tf                     # AWS y Kubernetes providers
│   ├── outputs.tf                      # Outputs de Terraform
│   ├── dns.tf                          # Route 53, ALB, ACM
│   ├── dns-variables.tf                # Variables DNS
│   ├── dns-outputs.tf                  # Outputs DNS
│   ├── env.tfvars.example              # Plantilla de configuracion
│   ├── README.md                       # Documentacion Terraform
│   └── DNS_CONFIGURATION.md            # Configuracion de dominio

├── kubernetes/
│   ├── README.md                       # Documentacion Kubernetes
│   ├── configmap.yaml                  # Configuracion aplicaciones
│   ├── secrets.yaml                    # Secrets (DB, API keys)
│   ├── ingress.yaml                    # Ingress ALB routing
│   └── deployments/
│       ├── obtener-permiso.yaml
│       ├── panel-decisiones.yaml
│       ├── fiscalizadores.yaml
│       ├── propietarios.yaml
│       ├── aach-api.yaml through back-api.yaml

├── api-aach/ through api-tgr/
│   ├── docker-compose.yml
│   ├── script.sql
│   ├── datos_prueba.sql
│   ├── api/
│   │   ├── app.py
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── .env.example
│   └── db_data/

├── obtener-permiso/, panel-decisiones/
├── app-fiscalizadores/, app-propietarios/
│   ├── app.json, package.json
│   ├── Dockerfile, .env.example

├── back/
│   ├── docker-compose.yml, script.sql
│   ├── api-back/
│   │   ├── app.py, Dockerfile
│   │   ├── requirements.txt, .env.example
│   └── db_data/

├── generador_datos/
│   ├── generar_datos_prueba.py
│   └── README.md

└── scripts/
    └── (Scripts por API)
```

---

## 🏗️ Arquitectura AWS

```
┌─────────────────────────────────────────────────────┐
│                   AWS EKS Cluster                    │
│              (desarrollo-tt-eks-cluster)             │
├─────────────────────────────────────────────────────┤
│  Kubernetes Namespace: desarrollo-tt                 │
│  ├─ 13 Deployments (4 frontends + 8 APIs + 1 back) │
│  ├─ 26+ Pods (2 replicas each)                     │
│  ├─ 13 Services (ClusterIP)                        │
│  └─ 1 Ingress (ALB)                                │
├─────────────────────────────────────────────────────┤
│  Nodos: 2-4 EC2 t3.medium (Auto-scaling)           │
│  VPC: 10.0.0.0/16 with Public/Private Subnets     │
├─────────────────────────────────────────────────────┤
│              Aurora MySQL RDS Cluster                │
│  ├─ 2x db.t3.small instances (Primary + Replica)   │
│  ├─ 9 Databases (aach_db through back_db)         │
│  └─ 7-day backup retention                        │
├─────────────────────────────────────────────────────┤
│           Amazon ECR (13 repositories)              │
│  ├─ One per service with image scanning            │
│  └─ Automatic cleanup policies                     │
├─────────────────────────────────────────────────────┤
│    Application Load Balancer + ACM Certificates     │
│  └─ HTTPS/TLS with Route 53 DNS integration       │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Tecnologias

### Frontend
- **Next.js** 15.5.0 & 15.4.7 (TypeScript)
- **Expo** (Mobile Web)

### Backend APIs
- **FastAPI** (Python 3.12)
- **SQLAlchemy** ORM

### Database
- **MySQL 8.0** (Aurora compatible)
- 9 independent databases

### Infrastructure
- **AWS EKS** - Kubernetes managed service
- **Terraform** - Infrastructure as Code
- **Docker** - Containerization
- **GitHub Actions** - CI/CD automation

---

## 📊 Estimacion de Costos

**Monthly:** ~$310-350
- EKS Control Plane: $73
- EC2 t3.medium (2): $60
- RDS Aurora t3.small (2): $150
- ALB: $16
- Data Transfer: $10-20

---

## 🔐 Seguridad

- **OIDC** authentication (GitHub to AWS)
- **VPC** with private subnets for EKS
- **Security Groups** isolating EKS and RDS
- **ACM Certificates** for HTTPS/TLS
- **Encrypted RDS backups** with 7-day retention
- **Kubernetes Secrets** for sensitive data

---

## 📖 Documentacion Completa

**Getting Started:**
- [QUICK_START.md](QUICK_START.md) - 30-step checklist
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Detailed step-by-step guide

**Infrastructure:**
- [terraform/README.md](terraform/README.md)
- [terraform/DNS_CONFIGURATION.md](terraform/DNS_CONFIGURATION.md)

**Deployment:**
- [.github/workflows/SETUP.md](.github/workflows/SETUP.md)
- [.github/workflows/GENERATE_SECRETS.md](.github/workflows/GENERATE_SECRETS.md)
- [.github/workflows/VALIDATION.md](.github/workflows/VALIDATION.md)

**Kubernetes:**
- [kubernetes/README.md](kubernetes/README.md)

---

## 🚀 CI/CD Pipeline

**GitHub Actions Workflows:**

1. **build-and-deploy.yml** (Automatic on push)
   - Builds 13 Docker images in parallel (~2-3 min)
   - Pushes to Amazon ECR (~1 min)
   - Applies Kubernetes manifests (~5 min)
   - Total: ~8-9 minutes per deployment

2. **infrastructure-management.yml** (Manual)
   - Terraform plan/apply/destroy
   - RDS snapshot handling
   - Output display

---

## 🐛 Troubleshooting

**Pod Issues:**
```bash
kubectl describe pod <pod-name> -n desarrollo-tt
kubectl logs <pod-name> -n desarrollo-tt
```

**Service/Network Issues:**
```bash
kubectl get endpoints -n desarrollo-tt
kubectl get svc -n desarrollo-tt
```

**AWS Issues:**
```bash
aws ec2 describe-security-groups --region us-east-1
aws eks describe-cluster --name desarrollo-tt-eks-cluster --region us-east-1
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for more solutions.

---

## 📝 Project Status

- ✅ Infrastructure design & Terraform
- ✅ Docker containerization (13 images)
- ✅ GitHub Actions CI/CD
- ✅ Kubernetes manifests
- 🟡 Initial deployment (Ready)
- ⏳ Database initialization (Pending)
- ⏳ Monitoring & logging (Pending)

---

**Status:** Ready for deployment ✅  
**Last Updated:** January 2025
