#!/usr/bin/env python3
import mysql.connector
from mysql.connector import Error
import getpass

# Configuración
RDS_ENDPOINT = "terraform-20251218195825648400000001.c4to686sohft.us-east-1.rds.amazonaws.com"
RDS_USER = "jorge"
RDS_PORT = 3306

# Bases de datos de sistema que NO deben ser eliminadas
SYSTEM_DATABASES = {
    "information_schema",
    "mysql",
    "performance_schema",
    "sys",
    "appdb"  # La base de datos por defecto
}

# Pedir contraseña
RDS_PASSWORD = getpass.getpass("Ingresa la contraseña de RDS MySQL: ")

# Confirmar eliminación
confirm = input("Advertencia: Se eliminarán TODAS las bases de datos que no sean de sistema. Continuar? (s/n): ")
if confirm.lower() != 's':
    print("Operación cancelada.")
    exit()

try:
    # Conectar a RDS
    connection = mysql.connector.connect(
        host=RDS_ENDPOINT,
        user=RDS_USER,
        password=RDS_PASSWORD,
        port=RDS_PORT
    )
    
    cursor = connection.cursor()
    
    # Obtener lista de bases de datos
    cursor.execute("SHOW DATABASES;")
    databases = cursor.fetchall()
    
    print("=== Eliminando bases de datos ===")
    print()
    
    deleted_count = 0
    
    for (db_name,) in databases:
        if db_name not in SYSTEM_DATABASES:
            try:
                print(f"Eliminando base de datos: {db_name}")
                cursor.execute(f"DROP DATABASE IF EXISTS `{db_name}`;")
                connection.commit()
                deleted_count += 1
                print(f"[OK] {db_name} eliminado")
            except Error as err:
                print(f"[ERROR] No se pudo eliminar {db_name}: {err}")
        else:
            print(f"[SKIP] {db_name} (base de datos de sistema)")
        
        print()
    
    cursor.close()
    connection.close()
    
    print("=== Resumen ===")
    print(f"Bases de datos eliminadas: {deleted_count}")
    print("Operación completada.")
    
except Error as err:
    print(f"[ERROR] Error de conexión: {err}")
