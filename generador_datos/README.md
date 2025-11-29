# Generador de Datos de Prueba

Este script genera automáticamente datos de prueba aleatorios para las tablas de la base de datos del proyecto.

## Características

- Genera **1000 filas aleatorias** para cada tabla
- Formato PPU: **AAAA00** (4 letras + 2 números)
- Fechas válidas en **2025** (antes del 7 de octubre)
- Datos realistas y consistentes
- RUTs válidos con dígito verificador correcto

## Tablas soportadas

1. **permiso_circulacion** - 1000 filas con datos de vehículos
2. **log_fiscalizacion** - 1000 filas con registros de fiscalización
3. **log_consultas_propietarios** - 1000 filas con consultas de propietarios

## Uso

### Opción 1: Ejecutar directamente
```bash
cd generador_datos
python generar_datos_prueba.py
```

### Opción 2: Cambiar cantidad de filas
Edita el archivo `generar_datos_prueba.py` y modifica la línea:
```python
generador.generar_archivo_sql(archivo_salida, 1000)  # Cambia 1000 por la cantidad deseada
```

### Opción 3: Cambiar nombre del archivo de salida
Modifica la variable `archivo_salida`:
```python
archivo_salida = "mi_archivo_personalizado.sql"
```

## Archivo de salida

El script genera un archivo llamado `datos_prueba_1000_filas.sql` con:
- Encabezado informativo
- `USE back_db;` para seleccionar la base de datos
- 3000 filas INSERT organizadas por tabla
- Sintaxis SQL válida y lista para ejecutar

## Estructura de datos generados

### permiso_circulacion
- PPU en formato AAAA00
- RUTs válidos con dígito verificador
- Nombres completos realistas
- Fechas de emisión/expiración coherentes
- Marcas y modelos de vehículos reales
- Datos técnicos apropiados por tipo de vehículo

### log_fiscalizacion
- PPUs coincidentes con permiso_circulacion
- RUTs de fiscalizadores diferentes
- Fechas con hora aleatoria
- Estados de vigencia aleatorios
- 10% probabilidad de encargo por robo

### log_consultas_propietarios
- RUTs y PPUs coincidentes con permiso_circulacion
- Fechas de consulta aleatorias
- Distribución temporal realista

## Requisitos

- Python 3.6 o superior
- Módulos estándar de Python (no requiere instalaciones adicionales)

## Ejemplo de ejecución

```bash
$ python generar_datos_prueba.py
Generando 1000 filas para cada tabla...
Archivo generado exitosamente: datos_prueba_1000_filas.sql
Total de filas generadas: 3000

¡Generación completada!
Archivo creado: datos_prueba_1000_filas.sql
Contiene 1000 filas para cada una de las 3 tablas:
- permiso_circulacion
- log_fiscalizacion
- log_consultas_propietarios
```

## Personalización

El script permite fácil personalización de:
- Nombres y apellidos
- Marcas y modelos de vehículos
- Tipos de vehículos
- Colores
- Tipos de combustible
- Equipamientos
- Rangos de fechas
- Rangos de valores numéricos