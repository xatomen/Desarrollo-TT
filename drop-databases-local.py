#!/usr/bin/env python3
import mysql.connector
from mysql.connector import Error

# Configuracion Local
DB_HOST = "localhost"
DB_PORT = 3307
DB_USER = "app_user"
DB_PASSWORD = "app_password"

# Bases de datos de sistema que NO deben ser eliminadas
SYSTEM_DATABASES = {
    "information_schema",
    "mysql",
    "performance_schema",
    "sys",
    "desarrollo_tt"  # La base de datos principal local
}

# Confirmar eliminacion
print("=== Eliminacion de Bases de Datos LOCAL ===")
confirm = input("Advertencia: Se eliminaran TODAS las bases de datos que no sean de sistema. Continuar? (s/n): ")
if confirm.lower() != 's':
    print("Operacion cancelada.")
    exit()

try:
    # Conectar a MySQL Local
    connection = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT
    )
    
    cursor = connection.cursor()
    
    # Obtener lista de bases de datos
    cursor.execute("SHOW DATABASES;")
    databases = cursor.fetchall()
    
    print()
    print("=== Eliminando bases de datos ===")
    print()
    
    deleted_count = 0
    
    for (db_name,) in databases:
        if db_name not in SYSTEM_DATABASES:
            try:
                cursor.execute("DROP DATABASE `{}`;".format(db_name))
                connection.commit()
                print("  OK - Eliminada: {}".format(db_name))
                deleted_count += 1
            except Error as e:
                print("  ERROR al eliminar {}: {}".format(db_name, e))
    
    cursor.close()
    connection.close()
    
    print()
    print("=== Resumen ===")
    print("Bases de datos eliminadas: {}".format(deleted_count))

except Error as e:
    print("Error de conexion: {}".format(e))
    exit(1)
