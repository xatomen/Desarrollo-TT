#!/usr/bin/env python3
import mysql.connector
from mysql.connector import Error
import os

# Configuracion Local
DB_HOST = "localhost"
DB_PORT = 3307
DB_USER = "app_user"
DB_PASSWORD = "app_password"

# Mapeo de directorios a nombres de bases de datos
DATABASE_MAP = {
    "api-aach": "aach_db",
    "api-carabineros": "carabineros_db",
    "api-mtt": "mtt_db",
    "api-prt": "prt_db",
    "api-sgd": "sgd_db",
    "api-sii": "sii_db",
    "api-srcei": "srcei_db",
    "api-tgr": "tgr_db",
    "back": "back_db"
}

SCRIPTS_PATH = "./scripts"

success_count = 0
failure_count = 0

print("=== Iniciando carga de bases de datos LOCAL ===")
print("Conectando a: {}:{}".format(DB_HOST, DB_PORT))
print()

try:
    # Conectar a MySQL Local
    connection = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT
    )
    
    cursor = connection.cursor()
    
    for folder, db_name in DATABASE_MAP.items():
        script_path = os.path.join(SCRIPTS_PATH, folder, "complete.sql")
        
        if not os.path.exists(script_path):
            print("X {} - Archivo no encontrado: {}".format(folder, script_path))
            failure_count += 1
            continue
        
        try:
            print("Procesando {}...".format(folder))
            
            # Crear base de datos si no existe
            create_db_sql = "CREATE DATABASE IF NOT EXISTS {} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;".format(db_name)
            cursor.execute(create_db_sql)
            connection.commit()
            
            # Usar la base de datos
            cursor.execute("USE {};".format(db_name))
            
            # Leer y ejecutar el script SQL
            with open(script_path, 'r', encoding='utf-8') as f:
                sql_content = f.read()
            
            # Ejecutar el script (dividir por ;)
            statements = sql_content.split(';')
            for statement in statements:
                statement = statement.strip()
                if statement:
                    cursor.execute(statement)
            
            connection.commit()
            print("  OK - {} cargada exitosamente".format(db_name))
            success_count += 1
            
        except Error as e:
            print("  ERROR en {}: {}".format(folder, e))
            failure_count += 1
    
    cursor.close()
    connection.close()
    
    print()
    print("=== Resumen ===")
    print("Exito: {}".format(success_count))
    print("Errores: {}".format(failure_count))

except Error as e:
    print("Error de conexion: {}".format(e))
    exit(1)
