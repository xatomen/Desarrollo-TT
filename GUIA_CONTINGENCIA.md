# 🚨 GUÍA DE CONTINGENCIA - Presentación de Tesis

## Escenarios de Crisis y Soluciones

Este documento contiene respuestas rápidas para problemas durante la presentación en vivo.

---

## 🎯 PLAN A: Producción en AWS (Principal)

**Estado:** Intenta esto primero

```powershell
# Verificar conectividad a AWS
ping google.com

# Si funciona:
# Accede a: https://jorgegallardo.studio (o endpoint del ALB)
```

**Señales de que funciona:**
- ✅ Página carga en < 3 segundos
- ✅ Las APIs responden (abre DevTools → Network)
- ✅ Base de datos está accesible

---

## 🔄 PLAN B: Demo Local con Docker (Respaldo)

**Tiempo para activar:** ~2 minutos

### Activación Rápida

```powershell
cd C:\Users\jorge\OneDrive\Escritorio\UTEM\ 11S\Trabajo\ de\ Título\ 1\desarrollo\Desarrollo-TT

# Verificar si está corriendo
docker compose -f docker-compose.local.yml ps

# Si no está corriendo:
.\start-local-demo.ps1

# Si hay error, limpiar todo:
.\start-local-demo.ps1 -Clean -BuildImages
```

**Esperar:** 60-120 segundos hasta que todo inicie

### Validación

```powershell
.\validate-local-demo.ps1
```

Si todo muestra ✓, estás listo.

### Acceso

- **URL:** http://localhost (o http://127.0.0.1)
- **Todo funciona igual que en AWS**
- **Los datos de prueba ya están cargados**

---

## 📱 ESCENARIO 1: "La página no carga"

### Síntoma
Navegador muestra "Conexión rechazada" o "No se puede acceder"

### Solución Rápida (30 segundos)

```powershell
# 1. ¿Está corriendo Docker?
docker ps

# 2. ¿Está corriendo Plan B?
docker compose -f docker-compose.local.yml ps

# 3. Si no hay contenedores corriendo:
.\start-local-demo.ps1

# 4. Mientras esperas, prueba:
curl http://localhost/health
```

### Si sigue sin funcionar

```powershell
# Limpiar y reiniciar completamente
.\stop-local-demo.ps1 -Clean
.\start-local-demo.ps1 -BuildImages

# Esperar 2 minutos
# Probar: http://localhost
```

---

## 🗄️ ESCENARIO 2: "Error de base de datos / No puedo insertar datos"

### Síntoma
```
Error: Unknown MySQL server host...
Error: ECONNREFUSED at 3306
```

### Solución Rápida (1 minuto)

```powershell
# 1. Verificar que MySQL está corriendo
docker compose -f docker-compose.local.yml ps mysql

# 2. Ver logs de MySQL
docker compose -f docker-compose.local.yml logs mysql

# 3. Si MySQL no está healthy:
docker compose -f docker-compose.local.yml restart mysql

# 4. Esperar 10 segundos y reintentar
```

### Si sigue fallando

```powershell
# Opción nuclear: resetear BD
docker compose -f docker-compose.local.yml down -v mysql
docker compose -f docker-compose.local.yml up -d mysql

# Esperar 30 segundos
# Reiniciar APIs:
docker compose -f docker-compose.local.yml restart api-tgr api-aach # etc
```

---

## 🔌 ESCENARIO 3: "Se cayó internet - Sin conexión a AWS"

### Síntoma
AWS/EKS no accesible, timeout en todas las conexiones

### Solución (Inmediata)

```powershell
# Plan B ya está local, no depende de internet
.\start-local-demo.ps1

# Acceder a: http://localhost
# TODO funciona como si fuera Azure, pero en local
```

**NOTA:** Todo sigue siendo accesible sin internet. Puedes hacer la presentación completa sin WiFi.

---

## ⚠️ ESCENARIO 4: "Una API individual está caída"

### Síntoma
```
API X responde con 500 error
Error en consola del navegador
```

### Solución (2 minutos)

```powershell
# Identificar cuál API falla
docker compose -f docker-compose.local.yml logs api-tgr | tail -50

# Reiniciar esa API
docker compose -f docker-compose.local.yml restart api-tgr

# O todos los APIs:
docker compose -f docker-compose.local.yml restart api-*

# Esperar 5 segundos
# Reintentar
```

---

## 🖥️ ESCENARIO 5: "Navegador muestra datos en caché / Versión vieja"

### Síntoma
```
Cambié datos en BD pero el navegador muestra lo anterior
La UI está desfasada
```

### Solución (10 segundos)

```powershell
# En el navegador:
# Windows/Linux: Ctrl + Shift + Delete
# Mac: Cmd + Shift + Delete

# O fuerza recarga:
# Windows/Linux: Ctrl + F5
# Mac: Cmd + Shift + R

# Si sigue fallando:
# Abre DevTools (F12) → Application → Clear All
```

---

## 🎮 ESCENARIO 6: "Quiero cambiar datos de demostración rápidamente"

### Opción A: Editores GUI

```powershell
# Acceder a MySQL desde terminal
docker compose -f docker-compose.local.yml exec mysql bash

# Dentro del contenedor:
mysql -uapp_user -papp_password desarrollo_tt

# Ejecutar:
UPDATE usuarios SET nombre_completo = 'Nuevo Nombre' WHERE id = 1;
SELECT * FROM usuarios;
```

### Opción B: Desde el navegador

Si tienes un admin panel:
1. Abre http://localhost/panel
2. Login con usuario admin (22222222-2 / password)
3. Edita datos desde ahí

### Opción C: Recargar datos de ejemplo

```powershell
# Si borraste datos sin querer:
docker compose -f docker-compose.local.yml down -v
.\start-local-demo.ps1

# Los datos se recargarán desde init-db.sql
```

---

## 📊 ESCENARIO 7: "Rendimiento lento / Todo va lento"

### Síntoma
```
Las páginas tardan mucho
Los APIs tardan > 5 segundos
```

### Verificación Rápida

```powershell
# Ver uso de recursos
docker stats

# Problema: Docker usa mucha RAM/CPU
# Solución 1: Aumentar recursos en Docker Desktop
# Solución 2: Detener otros programas pesados
# Solución 3: Reiniciar Docker
```

### Reinicio Limpio

```powershell
# Opción A: Restart servicios
docker compose -f docker-compose.local.yml restart

# Opción B: Rebuild sin caché (más lento pero limpio)
docker compose -f docker-compose.local.yml build --no-cache
docker compose -f docker-compose.local.yml up -d
```

---

## ❌ ESCENARIO 8: "Docker se cerró / Necesito reiniciar"

### Solución

```powershell
# Verificar que Docker está corriendo
docker info

# Si no responde:
# → Abre Docker Desktop manualmente
# → Espera a que diga "Docker Engine running"
# → En PowerShell:

docker compose -f docker-compose.local.yml up -d

# Esperar 60 segundos
# Validar: .\validate-local-demo.ps1
```

---

## 🆘 ÚLTIMO RECURSO - Recuperación Total (3 minutos)

Si absolutamente nada funciona:

```powershell
# Paso 1: Parar todo
docker compose -f docker-compose.local.yml down -v 2>&1 | Out-Null

# Paso 2: Limpiar volúmenes huérfanos
docker system prune -f --volumes 2>&1 | Out-Null

# Paso 3: Esperar
Start-Sleep -Seconds 10

# Paso 4: Reconstruir desde cero
docker compose -f docker-compose.local.yml build --no-cache

# Paso 5: Iniciar
docker compose -f docker-compose.local.yml up -d

# Paso 6: Esperar (2 minutos)
Start-Sleep -Seconds 120

# Paso 7: Validar
.\validate-local-demo.ps1

# Acceder: http://localhost
```

---

## 📋 CHECKLIST PRE-PRESENTACIÓN

**Hacer esto 30 minutos ANTES de comenzar:**

- [ ] Ejecutar: `.\validate-local-demo.ps1` (debe mostrar ✓ en todo)
- [ ] Abrir http://localhost en navegador (debe funcionar)
- [ ] Probar login con usuario de demo
- [ ] Probar crear un permiso / infracción
- [ ] Verificar APIs: http://localhost:8001/docs
- [ ] Abrir MySQL y hacer query: `SELECT COUNT(*) FROM usuarios;`
- [ ] Limpiar caché del navegador (Ctrl+Shift+Delete)
- [ ] Cerrar otros programas pesados (especialmente Chrome con muchas pestañas)
- [ ] Si todo funciona: ✅ Listo para presentar

**Si hay algún problema:**
- [ ] Ejecutar: `.\stop-local-demo.ps1 -Clean`
- [ ] Ejecutar: `.\start-local-demo.ps1 -BuildImages`
- [ ] Esperar 2 minutos
- [ ] Repetir checklist

---

## 🎙️ DURANTE LA PRESENTACIÓN

### Plan de Presentación

1. **Intro (5 min):** Mostrar arquitectura
   - Mostrar diagrama: EKS, RDS, ALB, APIs
   - Explicar: Microservicios, Kubernetes, CloudNative

2. **Demo en Vivo (10 min):**
   - Abrir http://localhost (o producción)
   - Crear un usuario/permiso
   - Ver datos en tiempo real
   - Mostrar APIs (http://localhost:8001/docs)

3. **Backend (5 min):**
   - Mostrar logs en tiempo real
   - Explicar flujo de datos
   - Mostrar BD

4. **Q&A (5 min):**
   - Estar preparado para responder
   - Tener "scripts de demo" listos si piden cambios

### Si algo falla DURANTE presentación

**Mantra:** "Eso es un glitch de conexión, déjame cambiar al respaldo local"

```powershell
# Secretamente abre otra terminal PowerShell
# Corre esto rápidamente:
.\start-local-demo.ps1

# Mientras espera, sigue hablando
# Cuando esté listo (60-120 seg):
# Abre http://localhost
```

El jurado verá exactamente lo mismo, pero local. **Nadie se da cuenta.**

---

## 📞 CONTACTOS DE EMERGENCIA

Si necesitas ayuda durante la presentación:

**Recurso en línea:**
- Tutorial PowerShell: Presiona F1 en PowerShell para ayuda
- Docker docs: https://docs.docker.com/compose/ (si tienes internet)
- MySQL docs: https://dev.mysql.com/doc/

**En máquina local:**
- `docker compose -f docker-compose.local.yml logs` - Ver todos los logs
- `docker stats` - Ver recursos
- `docker ps` - Ver contenedores activos

---

## ✅ CONCLUSIÓN

**TL;DR:**

| Problema | Solución | Tiempo |
|----------|----------|--------|
| AWS caído | `.\start-local-demo.ps1` | 2 min |
| MySQL error | `docker compose restart mysql` | 30 seg |
| Todo roto | `.\start-local-demo.ps1 -Clean -BuildImages` | 3 min |
| Presentación bombeada | Último recurso (arriba) | 3 min |

**Recuerda:** Tienes Plan B. No habrá drama. ✅

---

**Última actualización:** Enero 2026
**Versión:** 1.0
**Estado:** ✅ Lista para cualquier emergencia
