# Plan B - Demo Local con Docker Compose

## Descripción

Este Plan B permite ejecutar toda la infraestructura del sistema **de forma completamente local sin dependencias de internet ni AWS**. Es el respaldo perfecto para la presentación de tesis.

## 📋 Requisitos

- **Docker Desktop** (versión 20.10+)
- **4GB de RAM** mínimo disponible
- **10GB de espacio en disco**
- **Conexión de red local** (no requiere internet)

## 🚀 Inicio Rápido

### Opción 1: Arranque Automático (Recomendado)

```powershell
.\start-local-demo.ps1
```

Esto iniciará todos los servicios automáticamente.

### Opción 2: Arranque con Construcción de Imágenes

Si es la primera vez o necesitas reconstruir:

```powershell
.\start-local-demo.ps1 -BuildImages
```

### Opción 3: Arranque Limpio (Elimina todo anterior)

```powershell
.\start-local-demo.ps1 -Clean -BuildImages
```

## 📍 Acceso a Servicios

Una vez iniciados, accede a:

| Servicio | URL | Puerto |
|----------|-----|--------|
| **Frontend Principal** | http://localhost | 80 |
| **Panel de Decisiones** | http://localhost/panel | 80 |
| **API Gateway** | http://localhost:9000 | 9000 |
| **API TGR** | http://localhost:8001 | 8001 |
| **API AACH** | http://localhost:8002 | 8002 |
| **API Carabineros** | http://localhost:8003 | 8003 |
| **API MTT** | http://localhost:8004 | 8004 |
| **API PRT** | http://localhost:8005 | 8005 |
| **API SGD** | http://localhost:8006 | 8006 |
| **API SII** | http://localhost:8007 | 8007 |
| **API SRCEI** | http://localhost:8008 | 8008 |
| **MySQL** | localhost:3306 | 3306 |

## 🗄️ Base de Datos

**Credenciales de MySQL:**
- **Host:** localhost
- **Puerto:** 3306
- **Usuario:** app_user
- **Contraseña:** app_password
- **Base de Datos:** desarrollo_tt

### Conectar con Cliente MySQL

```bash
mysql -h localhost -u app_user -papp_password desarrollo_tt
```

### Conectar con MySQL Workbench o DBeaver

```
Hostname: localhost
Port: 3306
User: app_user
Password: app_password
Database: desarrollo_tt
```

## 📊 Datos de Prueba Precargados

El sistema incluye datos de demostración:

### Usuarios de Prueba

| RUT | Nombre | Email | Tipo | Contraseña |
|-----|--------|-------|------|-----------|
| 12345678-9 | Juan Pérez López | juan@example.com | Propietario | 123456 |
| 98765432-1 | María García Rodríguez | maria@example.com | Propietario | 123456 |
| 11111111-1 | Carlos Fiscalizador | carlos.fis@example.com | Fiscalizador | 123456 |
| 22222222-2 | Ana Administradora | ana.admin@example.com | Admin | 123456 |
| 33333333-3 | Demostrateur Test | demo@example.com | Propietario | 123456 |

### Vehículos de Prueba

- Toyota Corolla 2020 (Patente: SGFH34)
- Honda Civic 2021 (Patente: XBCD12)
- Volkswagen Golf 2019 (Patente: ZQWE89)
- Yamaha MT-09 2022 (Patente: MXKL45)
- Hyundai i10 2023 (Patente: DEMO01)

### Permisos y Infracciones

El sistema incluye 5 permisos de circulación y 3 infracciones de prueba.

## 🛑 Detención de Servicios

### Detener sin eliminar datos

```powershell
.\stop-local-demo.ps1
```

Los datos se preservarán para la próxima ejecución.

### Limpiar Todo

```powershell
.\stop-local-demo.ps1 -Clean
```

Esto elimina contenedores, volúmenes y datos.

## 📝 Comandos Útiles

### Ver Estado de Servicios

```bash
docker compose -f docker-compose.local.yml ps
```

### Ver Logs de Todos los Servicios

```bash
docker compose -f docker-compose.local.yml logs -f
```

### Ver Logs de un Servicio Específico

```bash
docker compose -f docker-compose.local.yml logs -f api-tgr
docker compose -f docker-compose.local.yml logs -f mysql
docker compose -f docker-compose.local.yml logs -f obtener-permiso
```

### Acceder a la Terminal de un Contenedor

```bash
docker compose -f docker-compose.local.yml exec mysql bash
docker compose -f docker-compose.local.yml exec api-tgr bash
```

### Ejecutar Query en MySQL

```bash
docker compose -f docker-compose.local.yml exec mysql mysql -uapp_user -papp_password desarrollo_tt -e "SELECT * FROM usuarios;"
```

### Reiniciar un Servicio Específico

```bash
docker compose -f docker-compose.local.yml restart api-tgr
```

### Reconstruir una Imagen Específica

```bash
docker compose -f docker-compose.local.yml build --no-cache api-tgr
```

## 🔧 Configuración

### Variables de Entorno

Edita `.env.local` para cambiar:

```env
# Base de Datos
DB_HOST=mysql
DB_NAME=desarrollo_tt
DB_USER=app_user
DB_PASSWORD=app_password

# URLs de APIs
NEXT_PUBLIC_API_BASE_URL=http://localhost:9000

# Otros
ENVIRONMENT=local
NODE_ENV=development
```

### Puertos

Si necesitas cambiar puertos, edita `docker-compose.local.yml`:

```yaml
ports:
  - "8001:8000"  # Cambiar primer número para puerto local
```

## 🐛 Troubleshooting

### Problema: "Port already in use"

**Solución:**
```powershell
# Encontrar qué proceso usa el puerto
netstat -ano | findstr ":8001"

# O cambiar puerto en docker-compose.local.yml
# Cambiar: "8001:8000" a "8011:8000"
```

### Problema: MySQL no inicia

**Solución:**
```bash
# Ver logs
docker compose -f docker-compose.local.yml logs mysql

# Limpiar e reintentar
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up -d
```

### Problema: APIs no pueden conectar a MySQL

**Solución:**
1. Verifica que MySQL esté en estado "healthy"
2. Comprueba credenciales en `.env.local`
3. Revisa logs: `docker compose -f docker-compose.local.yml logs api-tgr`

### Problema: Frontends dan error de conexión

**Solución:**
1. Asegúrate que `NEXT_PUBLIC_API_BASE_URL` sea correcto
2. Verifica que las APIs estén levantadas
3. Limpiar caché del navegador (Ctrl+Shift+Delete)

## 📈 Monitoreo en Tiempo Real

### Dashboard de Docker Desktop

Abre Docker Desktop → Containers para ver estado en vivo.

### Monitorear Recursos

```bash
docker stats
```

### Health Check de APIs

```bash
curl http://localhost:8001/health
curl http://localhost/api/health
```

## 💾 Backup de Datos

### Exportar Base de Datos

```bash
docker compose -f docker-compose.local.yml exec mysql mysqldump -uapp_user -papp_password desarrollo_tt > backup.sql
```

### Restaurar Base de Datos

```bash
docker compose -f docker-compose.local.yml exec -T mysql mysql -uapp_user -papp_password desarrollo_tt < backup.sql
```

## 🎯 Flujo de Uso para Presentación

1. **Antes de la presentación:**
   ```powershell
   .\start-local-demo.ps1 -Clean -BuildImages
   # Espera a que todo inicie
   # Prueba accediendo a http://localhost
   # Verifica que todo funciona
   .\stop-local-demo.ps1
   ```

2. **Día de la presentación (Plan A - AWS):**
   - Intenta conectar a AWS/EKS
   - Si funciona, usa eso

3. **Si falla (Plan B - Local):**
   ```powershell
   .\start-local-demo.ps1
   # Espera ~2 minutos
   # Accede a http://localhost
   ```

## 📞 Soporte

Para problemas:

1. Revisa los logs: `docker compose -f docker-compose.local.yml logs`
2. Limpia e reinicia: `.\stop-local-demo.ps1 -Clean` y luego `.\start-local-demo.ps1`
3. Verifica recursos: `docker system df` y libera espacio si es necesario

## 📚 Documentación Adicional

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Última actualización:** Enero 2026
**Estado:** ✅ Listo para Producción de Presentación
