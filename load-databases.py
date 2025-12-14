#!/usr/bin/env python3
import mysql.connector
from mysql.connector import Error
import os
import getpass

# Configuración
RDS_ENDPOINT = "terraform-20251213230555521900000001.c4to686sohft.us-east-1.rds.amazonaws.com"
RDS_USER = "jorge"
RDS_PORT = 3306

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

# Pedir contraseña
RDS_PASSWORD = getpass.getpass("Ingresa la contraseña de RDS MySQL: ")

success_count = 0
failure_count = 0

print("=== Iniciando carga de bases de datos ===")
print(f"Conectando a: {RDS_ENDPOINT}")
print()

try:
    # Conectar a RDS
    connection = mysql.connector.connect(
        host=RDS_ENDPOINT,
        user=RDS_USER,
        password=RDS_PASSWORD,
        port=RDS_PORT
    )
    
    cursor = connection.cursor()
    
    for folder, db_name in DATABASE_MAP.items():
        script_path = os.path.join(SCRIPTS_PATH, folder, "complete.sql")
        
        print(f"Procesando: {folder} -> base de datos: {db_name}")
        
        if os.path.exists(script_path):
            try:
                # Crear base de datos si no existe
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}`;")
                cursor.execute(f"USE `{db_name}`;")
                
                # Leer y ejecutar el script SQL
                with open(script_path, 'r', encoding='utf-8') as sql_file:
                    sql_script = sql_file.read()
                    
                    # Dividir por ; y ejecutar cada sentencia
                    statements = sql_script.split(';')
                    for statement in statements:
                        statement = statement.strip()
                        if statement:
                            cursor.execute(statement)
                
                connection.commit()
                print(f"[OK] {folder} cargado exitosamente")
                success_count += 1
                
            except Error as err:
                print(f"[ERROR] Error al cargar {folder}: {err}")
                failure_count += 1
        else:
            print(f"[ERROR] Script no encontrado: {script_path}")
            failure_count += 1
        
        print()
    
    cursor.close()
    connection.close()
    
except Error as err:
    print(f"[ERROR] Error de conexión: {err}")

print("=== Resumen ===")
print(f"Exitosos: {success_count}")
print(f"Fallidos: {failure_count}")

if failure_count == 0:
    print("Todas las bases de datos fueron cargadas exitosamente!")
