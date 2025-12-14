Workflow: Infrastructure Management

Permite levantar y destruir la infraestructura de AWS (EKS, VPC, etc) sin afectar RDS.

USO:
====

1. Ve a: GitHub > tu repo > Actions > Infrastructure Management
2. Click en "Run workflow"
3. Selecciona la accion:
   - plan: Visualiza cambios (sin aplicar)
   - apply: Crea la infraestructura
   - destroy: Destruye la infraestructura (excepto RDS)

ACCIONES:

PLAN
----
- Analiza cambios sin aplicarlos
- Util para revisar antes de apply
- No requiere confirmacion

  Comando local equivalente:
  terraform -chdir=terraform plan -var-file="env.tfvars"

APPLY
-----
- Levanta la infraestructura (EKS, VPC, etc)
- Crea ECR repositories
- Mantiene RDS intacto
- Duracion: ~15-20 minutos

  Comando local equivalente:
  terraform -chdir=terraform apply -var-file="env.tfvars"

DESTROY
-------
- Destruye EKS, VPC, networking, ECR
- PRESERVA la base de datos RDS
- Duracion: ~10-15 minutos
- Requiere confirmacion manual

  Comando local equivalente:
  terraform -chdir=terraform destroy -var-file="env.tfvars"

FLUJO DEL WORKFLOW:
===================

1. Checkout del codigo
2. Setup Terraform
3. Autenticacion AWS (via OIDC)
4. Validacion:
   - Format check
   - terraform init
   - terraform validate
5. Plan:
   - Para apply: plan sin destroy
   - Para destroy: plan con -destroy
   - Para plan: solo muestra cambios
6. Confirmacion:
   - Apply: muestra advertencia
   - Destroy: requiere confirmacion manual
7. Accion (apply o destroy)
8. Salida de outputs (solo en apply exitoso)

VARIABLES AUTOMATICAS:
======================

Skip Final Snapshot (RDS):
- apply: skip_final_snapshot=true (no crea snapshot al destruir)
- destroy: skip_final_snapshot=false (crea snapshot final como respaldo)

Esto asegura que si ejecutas destroy accidentalmente, tienes un backup.

RESULTADOS:
===========

Despues de APPLY:
- EKS cluster listo
- VPC con subnets en multiples AZs
- ECR repositories creados
- Outputs mostrando:
  * EKS cluster endpoint
  * RDS cluster endpoint
  * ECR repository URLs

Despues de DESTROY:
- EKS cluster eliminado
- VPC y networking eliminado
- ECR repositories eliminados
- RDS database PRESERVADO (con snapshot final)
- Security groups limpios

RECUPERACION DE OUTPUTS:
========================

Despues de un APPLY exitoso, ve a:
Actions > Infrastructure Management > click en run > Outputs

O obtén localmente:
terraform -chdir=terraform output

Comandos útiles:
- terraform output eks_cluster_name
- terraform output rds_cluster_endpoint
- terraform output ecr_repository_urls

MANEJO DE ERRORES:
==================

Si terraform init falla:
- Verifica que AWS_ROLE_ARN y AWS_ACCOUNT_ID esten configurados

Si apply falla por quota:
- Usa appmod-check-quota antes de apply
- Cambia instance types en env.tfvars

Si destroy falla:
- Revisa AWS console por recursos pendientes
- Intenta manual destroy de un recurso especifico

VARIABLES HEREDADAS:
====================

El workflow hereda de .github/workflows/SETUP.md:
- AWS_ROLE_ARN (secret)
- AWS_ACCOUNT_ID (secret)
- AWS_REGION (variable)

Asegúrate de tenerlas configuradas.

EJECUCION LOCAL (opcional):
===========================

Si prefieres ejecutar localmente:

1. Instala Terraform >= 1.0
2. Ve a carpeta terraform
3. Copia env.tfvars.example a env.tfvars
4. Edita credenciales en env.tfvars

Para plan:
terraform init
terraform plan -var-file="env.tfvars"

Para apply:
terraform apply -var-file="env.tfvars"

Para destroy (preservando RDS):
terraform destroy -var-file="env.tfvars"

COSTO APROXIMADO:
=================

Mientras esta levantada: ~$0.43/hora (~$10/dia)
Destruida: ~$0.16/hora (solo RDS)

Ver terraform/README.md para desglose completo.
