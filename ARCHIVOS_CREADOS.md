# 📦 Plan B - Archivos Creados

Este documento lista todos los archivos que se han creado para tu Plan B local.

## 📂 Estructura de Archivos

```
Desarrollo-TT/
├── docker-compose.local.yml        ⭐ Configuración principal
├── nginx.local.conf                Configuración del reverse proxy
├── .env.local                       Variables de entorno
├── init-db.sql                      Script de inicialización de BD
├── start-local-demo.ps1             Script para iniciar (USAR ESTO)
├── stop-local-demo.ps1              Script para detener
├── validate-local-demo.ps1          Script para validar estado
├── PLAN_B_README.md                 Documentación completa
├── GUIA_CONTINGENCIA.md             Soluciones de problemas
└── ARCHIVOS_CREADOS.md              Este archivo
```

## 📋 Descripción de Archivos

### 1. **docker-compose.local.yml** (Principal)
   - Define todos los 13 servicios (APIs, frontends, BD, proxy)
   - Configura volúmenes, redes, variables de entorno
   - Incluye health checks
   - **USAR:** `docker compose -f docker-compose.local.yml up -d`

### 2. **nginx.local.conf**
   - Reverse proxy Nginx
   - Enruta tráfico a todos los servicios
   - Configurado para localhost
   - Puerto: 80 (HTTP)

### 3. **.env.local**
   - Credenciales de BD
   - URLs de APIs
   - Configuración de ambiente
   - **EDITABLE** si necesitas cambiar credenciales

### 4. **init-db.sql**
   - Script SQL que crea todas las tablas
   - Carga datos de prueba
   - Ejecutado automáticamente al iniciar MySQL
   - **Modificable** si quieres cambiar datos de demo

### 5. **start-local-demo.ps1** ⭐ USAR ESTO
   - Script PowerShell para iniciar todo
   - Valida Docker
   - Inicia servicios
   - Espera a que estén listos
   - Muestra URLs de acceso

   **Uso:**
   ```powershell
   .\start-local-demo.ps1
   .\start-local-demo.ps1 -BuildImages        # Primera vez
   .\start-local-demo.ps1 -Clean -BuildImages # Limpiar todo
   ```

### 6. **stop-local-demo.ps1**
   - Detiene servicios
   - Opción para limpiar todo (eliminar datos)

   **Uso:**
   ```powershell
   .\stop-local-demo.ps1
   .\stop-local-demo.ps1 -Clean  # Eliminar todo
   ```

### 7. **validate-local-demo.ps1** ⭐ USAR PARA VERIFICAR
   - Valida que todos los servicios funcionan
   - Prueba conectividad a puertos
   - Muestra estado en colores
   - **USAR ESTO ANTES DE LA PRESENTACIÓN**

   **Uso:**
   ```powershell
   .\validate-local-demo.ps1
   ```

### 8. **PLAN_B_README.md** 📖 DOCUMENTACIÓN COMPLETA
   - Guía de uso completa
   - Credenciales de usuarios de prueba
   - Comandos útiles
   - Troubleshooting
   - **LEE ESTO si tienes dudas**

### 9. **GUIA_CONTINGENCIA.md** 🆘 PLANES DE EMERGENCIA
   - Soluciones para 8 problemas comunes
   - Procedimientos paso a paso
   - Último recurso (recuperación total)
   - Checklist pre-presentación
   - **LEE ESTO antes de presentar**

### 10. **ARCHIVOS_CREADOS.md** (Este archivo)
   - Resumen de todo lo creado

---

## 🚀 INICIO RÁPIDO (Copy-Paste)

```powershell
# 1. Navega a la carpeta principal
cd "C:\Users\jorge\OneDrive\Escritorio\UTEM 11S\Trabajo de Título 1\desarrollo\Desarrollo-TT"

# 2. Primera vez (construye imágenes)
.\start-local-demo.ps1 -BuildImages

# 3. Espera ~2 minutos hasta que diga "✓ Servicios iniciados correctamente"

# 4. Abre en navegador:
# http://localhost

# 5. Para validar que funciona:
.\validate-local-demo.ps1

# 6. Para detener:
.\stop-local-demo.ps1
```

---

## 📍 URLs de Acceso

Cuando esté corriendo:

| Servicio | URL |
|----------|-----|
| Frontend Principal | http://localhost |
| Panel de Decisiones | http://localhost/panel |
| API Base | http://localhost:9000 |
| API TGR | http://localhost:8001 |
| API AACH | http://localhost:8002 |
| Documentación APIs | http://localhost:8001/docs |
| MySQL | localhost:3306 |

---

## 🗄️ Base de Datos

```
Host:     localhost
Port:     3306
Usuario:  app_user
Password: app_password
Base:     desarrollo_tt
```

**Usuarios de prueba cargados:**
- Juan Pérez (RUT: 12345678-9)
- María García (RUT: 98765432-1)
- Carlos Fiscalizador (RUT: 11111111-1)
- Ana Admin (RUT: 22222222-2)
- Demo User (RUT: 33333333-3)

---

## ✅ CHECKLIST PRE-PRESENTACIÓN

**Hacer esto 30 minutos antes:**

```powershell
# 1. Limpiar y reconstruir
.\stop-local-demo.ps1 -Clean
.\start-local-demo.ps1 -BuildImages

# 2. Esperar 2 minutos

# 3. Validar
.\validate-local-demo.ps1

# 4. Pruebas manuales
# Abre: http://localhost
# Prueba login
# Prueba crear un permiso
# Prueba las APIs

# 5. Si todo OK:
.\stop-local-demo.ps1
# Listo para presentar, solo ejecuta cuando sea necesario
```

---

## 📊 Servicios que se Inician

1. **MySQL** - Base de datos
2. **13 APIs FastAPI** - Agencias gubernamentales
3. **2 Apps Next.js** - Frontends
4. **1 Nginx** - Reverse proxy

**Total:** 17 contenedores Docker

---

## 🔧 Comandos Útiles

```powershell
# Ver estado
docker compose -f docker-compose.local.yml ps

# Ver logs
docker compose -f docker-compose.local.yml logs -f

# Ver logs de un servicio
docker compose -f docker-compose.local.yml logs -f api-tgr

# Reiniciar un servicio
docker compose -f docker-compose.local.yml restart api-tgr

# Entrar a una terminal
docker compose -f docker-compose.local.yml exec mysql bash

# Ejecutar query SQL
docker compose -f docker-compose.local.yml exec mysql mysql -uapp_user -papp_password desarrollo_tt -e "SELECT * FROM usuarios;"
```

---

## 💾 Respaldo de Datos

```powershell
# Exportar BD completa
docker compose -f docker-compose.local.yml exec mysql mysqldump -uapp_user -papp_password desarrollo_tt > backup_$(Get-Date -Format 'yyyy-MM-dd-HHmm').sql

# Restaurar BD
docker compose -f docker-compose.local.yml exec -T mysql mysql -uapp_user -papp_password desarrollo_tt < backup.sql
```

---

## 🎯 Para la Presentación

**Opción 1: Plan A (Preferido)**
- Intenta conectar a AWS/producción
- Si funciona, úsalo

**Opción 2: Plan B (Respaldo)**
```powershell
.\start-local-demo.ps1
# Esperar 2 minutos
# Acceder a http://localhost
# Todo funciona igual
```

**Opción 3: Plan C (Emergencia)**
- Si nada funciona, mostrar video pre-grabado (grabaciones de pantalla)
- O mostrar diagramas y explicar

---

## 📝 Notas Importantes

- ✅ Todo funciona SIN internet (excepto Plan A)
- ✅ Los datos de prueba están pre-cargados
- ✅ Las APIs tienen documentación en `/docs`
- ✅ Puedes editar datos fácilmente desde MySQL
- ✅ Los scripts son reutilizables y seguros
- ⚠️ Los scripts requieren PowerShell 5.0+
- ⚠️ Necesitas Docker Desktop instalado

---

## 🐛 Si Algo Falla

1. Consulta **GUIA_CONTINGENCIA.md** - tiene soluciones para todo
2. Ejecuta `docker compose -f docker-compose.local.yml logs`
3. Valida con `.\validate-local-demo.ps1`
4. Última opción: `.\start-local-demo.ps1 -Clean -BuildImages`

---

## 📞 Información Rápida

**Archivos CRÍTICOS para presentación:**
1. `start-local-demo.ps1` - Inicia todo
2. `GUIA_CONTINGENCIA.md` - Soluciones de emergencia
3. `validate-local-demo.ps1` - Verifica que funciona

**Archivos de REFERENCIA:**
1. `PLAN_B_README.md` - Documentación completa
2. `docker-compose.local.yml` - Configuración
3. `.env.local` - Variables de entorno

---

## ✨ Resumen

**Tienes ahora:**
- ✅ Sistema completo en contenedores Docker
- ✅ 100% portátil (funciona en cualquier máquina con Docker)
- ✅ 100% local (no depende de internet)
- ✅ Scripts de inicio/parada/validación
- ✅ Datos de prueba precargados
- ✅ Documentación completa
- ✅ Guía de contingencia para emergencias

**Estás 100% preparado para la presentación.** 🎓

---

**Creado:** Enero 11, 2026
**Versión:** 1.0
**Status:** ✅ Listo para Producción
