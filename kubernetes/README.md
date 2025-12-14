Manifiestos Kubernetes

Estructura de archivos:

kubernetes/
├── configmap.yaml          - Variables de entorno no-sensibles
├── secrets.yaml            - Credenciales y secretos
├── ingress.yaml            - Enrutamiento de tráfico
├── deployments/
│   ├── obtener-permiso.yaml
│   ├── panel-decisiones.yaml
│   ├── fiscalizadores.yaml
│   ├── propietarios.yaml
│   ├── aach-api.yaml
│   ├── carabineros-api.yaml
│   ├── mtt-api.yaml
│   ├── prt-api.yaml
│   ├── sgd-api.yaml
│   ├── sii-api.yaml
│   ├── srcei-api.yaml
│   ├── tgr-api.yaml
│   └── back-api.yaml
└── README.md (este archivo)

DEPLOYMENT INICIAL:
==================

1. Preparar variables:
   - Editar configmap.yaml: Cambiar DB_HOST por endpoint real de RDS
   - Editar secrets.yaml: Cambiar credenciales
   - Editar ingress.yaml: Cambiar tudominio.com y ACM certificate ARN

2. Conectar a EKS:
   aws eks update-kubeconfig --name desarrollo-tt-eks-cluster --region us-east-1
   kubectl config current-context

3. Crear namespace:
   kubectl apply -f configmap.yaml

4. Crear ConfigMap y Secrets:
   kubectl apply -f configmap.yaml
   kubectl apply -f secrets.yaml

5. Crear ECR pull secret:
   kubectl create secret docker-registry ecr-secret \
     --docker-server=123456789.dkr.ecr.us-east-1.amazonaws.com \
     --docker-username=AWS \
     --docker-password=$(aws ecr get-login-password --region us-east-1) \
     -n desarrollo-tt

6. Desplegar todas las apps:
   kubectl apply -f deployments/

7. Crear Ingress:
   kubectl apply -f ingress.yaml

8. Verificar estado:
   kubectl get pods -n desarrollo-tt
   kubectl get svc -n desarrollo-tt
   kubectl get ingress -n desarrollo-tt

VALIDAR DEPLOYMENT:
===================

Verificar pods corriendo:
kubectl get pods -n desarrollo-tt -w

Ver logs de una app:
kubectl logs -n desarrollo-tt -l app=obtener-permiso-app

Describir pod para debug:
kubectl describe pod <pod-name> -n desarrollo-tt

Port-forward local (debug):
kubectl port-forward -n desarrollo-tt svc/aach-api 8000:80

ACTUALIZAR IMAGEN:
==================

El workflow de GitHub Actions actualiza las imágenes automáticamente.

Manual (si es necesario):
kubectl set image deployment/aach-api \
  aach-api=123456789.dkr.ecr.us-east-1.amazonaws.com/desarrollo-tt/aach-api:nuevo-tag \
  -n desarrollo-tt

VARIABLES CLAVE:
================

configmap.yaml:
  DB_HOST: RDS endpoint (obtén de: terraform output rds_cluster_endpoint)
  DB_PORT: 3306
  NEXT_PUBLIC_API_URL: https://api.tudominio.com

secrets.yaml:
  DB_USER: admin (o el usuario configurado en Terraform)
  DB_PASSWORD: (debe coincidir con Terraform)
  JWT_SECRET: Tu JWT secret personal

ingress.yaml:
  certificate-arn: ACM certificate ARN (obtén de: terraform output acm_certificate_arn)
  tudominio.com: Tu dominio configurado en Terraform

SALUD DE PODS:
==============

Cada deployment tiene:
- livenessProbe: Reinicia pod si no responde (cada 10 segundos)
- readinessProbe: Quita pod del tráfico si no está listo (cada 5 segundos)

Si un pod no levanta:
kubectl logs pod-name -n desarrollo-tt

Problemas comunes:
- CrashLoopBackOff: Ver logs (error en app)
- Pending: Espera a nodos disponibles
- ImagePullBackOff: Error al descargar imagen ECR

ESCALADO:
=========

Aumentar replicas:
kubectl scale deployment aach-api --replicas=3 -n desarrollo-tt

O editar YAML:
kubectl edit deployment aach-api -n desarrollo-tt

ELIMINAR DEPLOYMENT:
====================

Single app:
kubectl delete deployment aach-api -n desarrollo-tt

Todas las apps:
kubectl delete -f deployments/ -n desarrollo-tt

Todo (cuidado):
kubectl delete namespace desarrollo-tt

COMANDOS ÚTILES:
================

Ver todos los recursos:
kubectl get all -n desarrollo-tt

Ver eventos recientes:
kubectl get events -n desarrollo-tt --sort-by='.lastTimestamp'

Ejecutar comando en pod:
kubectl exec -it <pod-name> -n desarrollo-tt -- bash

Copiar archivo desde pod:
kubectl cp desarrollo-tt/<pod-name>:/ruta/archivo ./archivo -c container-name

Ver métricas (requiere metrics-server):
kubectl top pods -n desarrollo-tt
kubectl top nodes

VARIABLES DE ENTORNO POR API:
=============================

Todas las APIs esperan:
- DB_HOST
- DB_PORT
- DB_NAME (específica por API)
- DB_USER
- DB_PASSWORD
- ENVIRONMENT

Frontend apps esperan:
- NEXT_PUBLIC_API_URL (para llamar APIs)
- NEXT_PUBLIC_APP_NAME

Ver cada deployment.yaml para details específicos.
