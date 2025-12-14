# Uso de TERRAFORM_TFVARS en GitHub Actions

Guía para usar el secreto `TERRAFORM_TFVARS` en el workflow de infraestructura.

---

## 📋 Resumen

En lugar de tener `terraform/env.tfvars` en el repositorio, ahora:

1. **Localmente:** Tienes `terraform/env.tfvars` en tu máquina (NO en git)
2. **En GitHub:** Guardas el contenido en un secreto llamado `TERRAFORM_TFVARS`
3. **En el Workflow:** El workflow crea automáticamente el archivo desde el secreto

**Ventajas:**
- ✅ Nunca se pushea credenciales a git
- ✅ El workflow es completamente automatizado
- ✅ Seguro - el archivo se elimina después del workflow
- ✅ Flexible - cambias valores solo actualizando el secreto

---

## 🚀 Flujo Completo

```
┌─────────────────────────────────────────┐
│ 1. Localmente (Tu Máquina)              │
│                                          │
│ $ cp terraform/env.tfvars.example \    │
│      terraform/env.tfvars              │
│ $ nano terraform/env.tfvars            │
│ (Editar valores)                        │
│                                          │
│ ✓ terraform/env.tfvars existe localmente│
│ ✗ NO se commitea a git (.gitignore)    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 2. Guardar en GitHub Secret             │
│                                          │
│ $ gh secret set TERRAFORM_TFVARS \     │
│      < terraform/env.tfvars            │
│                                          │
│ ✓ Contenido guardado en GitHub          │
│ ✓ Encriptado y seguro                   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 3. GitHub Actions Workflow              │
│                                          │
│ $ echo "$TERRAFORM_TFVARS" \            │
│   > terraform/env.tfvars                │
│ $ terraform plan/apply/destroy          │
│ $ rm terraform/env.tfvars               │
│                                          │
│ ✓ Archivo creado temporalmente          │
│ ✓ Terraform ejecuta con el archivo      │
│ ✓ Archivo eliminado (por seguridad)    │
└─────────────────────────────────────────┘
```

---

## 🛠️ Paso 1: Configurar Localmente

### Crear el archivo env.tfvars

```bash
cd terraform/

# Copiar la plantilla
cp env.tfvars.example env.tfvars

# Editar los valores
nano env.tfvars  # o code env.tfvars
```

### Contenido esperado

```hcl
aws_region              = "us-east-1"
project_name            = "desarrollo-tt"
environment             = "dev"
instance_type           = "t3.medium"
rds_instance_class      = "db.t3.small"
db_username             = "admin"
db_password             = "TuContraseña123!@"
skip_final_snapshot     = true
create_dns_records      = false
domain_name             = "tudominio.com"
```

### Verificar que está en .gitignore

```bash
# Ver si está en .gitignore
grep "env.tfvars" ../.gitignore

# Si no está, agregarlo
echo "terraform/env.tfvars" >> ../.gitignore
echo "terraform/*.tfvars" >> ../.gitignore
echo "terraform/tfplan" >> ../.gitignore
```

---

## 🔐 Paso 2: Guardar en GitHub Secret

### Opción A: Desde archivo (Recomendado)

```bash
# Desde la raíz del proyecto
gh secret set TERRAFORM_TFVARS < terraform/env.tfvars

# Verificar
gh secret view TERRAFORM_TFVARS

# Output esperado:
# TERRAFORM_TFVARS
# aws_region = "us-east-1"
# project_name = "desarrollo-tt"
# ... (mostrará el contenido)
```

### Opción B: Copiar/Pegar manualmente

```bash
# Ver contenido del archivo
cat terraform/env.tfvars

# Copiar todo el output
# Ir a: https://github.com/tu-usuario/tu-repo/settings/secrets-and-variables/actions
# New repository secret
# Name: TERRAFORM_TFVARS
# Body: Pegar contenido
```

### Opción C: PowerShell (Windows)

```powershell
# Leer archivo y crear secreto
$content = Get-Content -Path "terraform/env.tfvars" -Raw
gh secret set TERRAFORM_TFVARS --body $content

# Verificar
gh secret view TERRAFORM_TFVARS
```

---

## ⚙️ Paso 3: El Workflow Hace Todo Automáticamente

El workflow `infrastructure-management.yml` ahora:

1. **Checkout** del código
2. **Crea** `terraform/env.tfvars` desde el secreto
   ```bash
   echo "${{ secrets.TERRAFORM_TFVARS }}" > terraform/env.tfvars
   ```
3. **Valida** que el archivo se creó correctamente
4. Ejecuta `terraform init/validate/plan/apply/destroy`
5. **Elimina** el archivo (por seguridad)

No hay más errores "file not found" 🎉

---

## 📝 Actualizar el Secreto

Si cambias valores en `terraform/env.tfvars` localmente:

### Opción 1: Desde archivo (Más fácil)
```bash
# Actualizar el secreto con el contenido local
gh secret set TERRAFORM_TFVARS < terraform/env.tfvars

# Verificar
gh secret view TERRAFORM_TFVARS
```

### Opción 2: Manualmente
1. Ir a Settings > Secrets and variables > Actions > TERRAFORM_TFVARS
2. Click "Update secret"
3. Pegar el contenido nuevo

---

## ✅ Verificar que Todo Funciona

### Verificar que el secreto está configurado
```bash
gh secret list | grep TERRAFORM_TFVARS
# Output: TERRAFORM_TFVARS    Updated X hours ago
```

### Ejecutar el workflow manualmente
1. Ir a: https://github.com/tu-usuario/tu-repo/actions
2. Buscar: "Infrastructure Management"
3. Click "Run workflow"
4. Seleccionar acción: "plan"
5. Click "Run workflow"

### Ver que el workflow funciona
1. En la pestaña "Jobs", ver:
   - ✓ Create env.tfvars from secret
   - ✓ Verify env.tfvars was created
   - ✓ Terraform Init
   - ✓ Terraform Validate
   - ✓ Terraform Plan
   - ✓ Clean up sensitive files

---

## 🔍 Ejemplo de Paso "Create env.tfvars from secret"

En el log del workflow verás:

```
Run echo "${{ secrets.TERRAFORM_TFVARS }}" > terraform/env.tfvars
  with:
    shell: bash
    env:
      AWS_REGION: us-east-1

✓ terraform/env.tfvars created successfully
12 lines
```

Esto significa que el archivo se creó correctamente con 12 líneas (tus 11-13 variables).

---

## 🚀 Paso 4: Usar el Workflow

### Plan (Ver qué cambiaría)
1. Actions > Infrastructure Management > Run workflow
2. Action: "plan"
3. Ver el output en los logs

### Apply (Crear infraestructura)
1. Actions > Infrastructure Management > Run workflow
2. Action: "apply"
3. El workflow:
   - Valida la configuración
   - Crea `env.tfvars`
   - Ejecuta `terraform plan`
   - Ejecuta `terraform apply`
   - Limpia archivos sensibles

### Destroy (Eliminar infraestructura)
1. Actions > Infrastructure Management > Run workflow
2. Action: "destroy"
3. ⚠️ Confirma en el log que quieres proceder
4. El workflow:
   - Valida la configuración
   - Ejecuta `terraform plan -destroy`
   - Ejecuta `terraform destroy`
   - Preserva RDS (backup final)

---

## 🔐 Seguridad

### ✅ Lo que está protegido

El archivo `env.tfvars` contiene:
- `db_password` ← Secreto
- Credenciales AWS (a través de OIDC, no en el archivo)
- Configuración sensible

**El workflow:**
1. Crea el archivo desde el secreto encriptado
2. Lo usa para terraform
3. **Lo elimina inmediatamente después**

No se queda en el repositorio nunca.

### ✅ Lo que puedes hacer

- Cambiar valores actualizando el secreto
- Usar diferentes secretos para dev/prod (crear `TERRAFORM_TFVARS_PROD`)
- Auditar cambios en Settings > Logs > Authentication

### ❌ Lo que NO debes hacer

- Guardar `env.tfvars` en git
- Copiar el contenido del secreto en chats/emails
- Exponer el GitHub Secret (si lo haces, regeneralo)

---

## 📊 Comparación: Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| Archivo local | ✓ `env.tfvars` local | ✓ `env.tfvars` local |
| En git | ✗ Riesgo si se pushea | ✓ Protegido por .gitignore |
| En GitHub | ✗ Debe existir para CI/CD | ✓ En secreto encriptado |
| En el workflow | ✗ Error "file not found" | ✓ Creado automáticamente |
| Seguridad | ⚠️ Manual | ✓ Automática |
| Actualizar | ❌ Commit necesario | ✓ Solo actualizar secreto |

---

## 🎯 Flujo Recomendado para Equipo

### Configuración Inicial (Una sola vez)

```bash
# 1. Desarrollador crea env.tfvars local
cp terraform/env.tfvars.example terraform/env.tfvars
nano terraform/env.tfvars

# 2. Alguien con acceso a GitHub configura el secreto
gh secret set TERRAFORM_TFVARS < terraform/env.tfvars

# 3. Verificar en GitHub Web
# Settings > Secrets and variables > Actions > TERRAFORM_TFVARS (debe existir)
```

### Cambios Posteriores

```bash
# Si necesitas cambiar algo:

# 1. Edit local
nano terraform/env.tfvars

# 2. Update secret
gh secret set TERRAFORM_TFVARS < terraform/env.tfvars

# 3. El siguiente workflow usará los valores nuevos
```

### NO hacer

```bash
# ❌ Nunca
git add terraform/env.tfvars
git commit -m "Add env.tfvars"
git push

# ✓ Debería fallar porque .gitignore lo excluye
```

---

## 🆘 Troubleshooting

### Error: "terraform/env.tfvars: No such file or directory"

**Solución:**
```bash
# Verificar que el secreto existe
gh secret list | grep TERRAFORM_TFVARS

# Si no existe:
gh secret set TERRAFORM_TFVARS < terraform/env.tfvars

# Si existe pero está vacío:
cat terraform/env.tfvars
gh secret set TERRAFORM_TFVARS < terraform/env.tfvars
```

### Error: "Terraform init failed"

**Probables causas:**
1. Variables inválidas en `env.tfvars`
2. Caracteres especiales mal escapados

**Solución:**
```bash
# Validar localmente
terraform -chdir=terraform validate

# Si hay error, copiar el contenido nuevamente
gh secret set TERRAFORM_TFVARS < terraform/env.tfvars
```

### El workflow no ve el secreto

**Solución:**
```bash
# Verificar permisos del workflow
# Settings > Actions > General > Workflow permissions
# Debe tener: "Read and write permissions"

# Verificar que el secret existe
gh secret list

# Recrear si es necesario
gh secret set TERRAFORM_TFVARS < terraform/env.tfvars
```

---

## 📚 Documentación Relacionada

- [SECRETS_AND_VARIABLES.md](.github/workflows/SECRETS_AND_VARIABLES.md) - Todos los secretos necesarios
- [infrastructure-management.yml](.github/workflows/infrastructure-management.yml) - Workflow que usa TERRAFORM_TFVARS
- [terraform/env.tfvars.example](../terraform/env.tfvars.example) - Plantilla de configuración
- [terraform/README.md](../terraform/README.md) - Documentación de Terraform

---

**Status:** Completamente automatizado ✅
