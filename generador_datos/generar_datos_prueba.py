#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador automático de datos de prueba para las tablas de la base de datos
Genera 1000 filas aleatorias para cada tabla con formato PPU AAAA00 y fechas válidas
Crea archivos SQL separados por tabla
"""

import random
import string
from datetime import datetime, timedelta
from typing import List, Tuple
import os

class GeneradorDatosPrueba:
    def __init__(self):
        # Listas de datos para generar contenido realista
        self.nombres = [
            "Juan", "María", "Carlos", "Ana", "Pedro", "Sofía", "Diego", "Valentina",
            "Jorge", "Camila", "Felipe", "Isidora", "Sebastián", "Laura", "Nicolás",
            "Daniela", "Tomás", "Ignacio", "Martina", "Constanza", "Roberto", "Fernanda",
            "Andrés", "Javiera", "Matías", "Antonia", "Francisco", "Emilia", "Benjamín",
            "Amanda", "Lucas", "Catalina", "Gabriel", "Esperanza", "Maximiliano", "Trinidad"
        ]
        
        self.apellidos = [
            "Pérez", "González", "Silva", "Torres", "López", "Ramírez", "Castro", "Martínez",
            "Espinoza", "Rojas", "Herrera", "Muñoz", "Fuentes", "Lagos", "Campos", "Ruiz",
            "Mendoza", "Salinas", "Paredes", "Moreno", "Vargas", "Díaz", "García", "Rivera",
            "Soto", "Núñez", "Guerrero", "Vásquez", "Flores", "Gutiérrez", "Jiménez", "Morales"
        ]
        
        self.marcas_modelos = {
            "Toyota": ["Corolla", "Camry", "RAV4", "Highlander", "Yaris", "Prius"],
            "Ford": ["Ranger", "Focus", "Fiesta", "Escape", "Explorer", "Transit"],
            "Chevrolet": ["Cruze", "Aveo", "Captiva", "Colorado", "D-Max", "Sail"],
            "Hyundai": ["Tucson", "Elantra", "Accent", "Santa Fe", "i20", "Creta"],
            "Nissan": ["Sentra", "X-Trail", "Versa", "Kicks", "Pathfinder", "NP300"],
            "Volkswagen": ["Golf", "Polo", "Tiguan", "Jetta", "Amarok", "Saveiro"],
            "Kia": ["Sportage", "Rio", "Picanto", "Sorento", "Cerato", "Soul"],
            "Mazda": ["3", "CX-5", "2", "6", "CX-3", "BT-50"],
            "Honda": ["Civic", "CR-V", "Fit", "Pilot", "Accord", "HR-V"],
            "Subaru": ["Forester", "Outback", "XV", "Impreza", "Legacy", "WRX"],
            "Jeep": ["Cherokee", "Grand Cherokee", "Compass", "Wrangler", "Renegade"],
            "Renault": ["Clio", "Sandero", "Duster", "Logan", "Captur", "Koleos"],
            "Peugeot": ["208", "308", "3008", "2008", "5008", "Partner"],
            "Mercedes-Benz": ["Sprinter", "Actros", "Vito", "C-Class", "E-Class"],
            "Iveco": ["Daily", "Trakker", "Stralis", "Eurocargo"],
            "Tesla": ["Model 3", "Model Y", "Model S", "Model X"],
            "BYD": ["Tang", "Song", "Qin", "Han"],
            "Yamaha": ["YZF-R3", "MT-03", "XTZ250", "Crypton"],
            "Kawasaki": ["Ninja 300", "Z300", "KLR650", "Versys-X"],
            "Suzuki": ["Gixxer", "V-Strom", "DR200", "Address"]
        }
        
        self.tipos_vehiculo = [
            "Automóvil", "SUV", "Hatchback", "Station Wagon", "Camioneta", 
            "Furgón", "Camión", "Minibús", "Motocicleta"
        ]
        
        self.colores = [
            "Blanco", "Negro", "Gris", "Plateado", "Rojo", "Azul", "Verde", 
            "Amarillo", "Café", "Dorado", "Naranja", "Violeta"
        ]
        
        self.combustibles = ["Gasolina", "Diesel", "Eléctrico", "Híbrido", "GLP", "GNC"]
        
        self.transmisiones = ["Manual", "Automática", "eCVT", "CVT"]
        
        self.equipamientos = [
            "Aire Acondicionado", "ABS", "GPS", "Bluetooth", "Cámara Retroceso",
            "Control Crucero", "Sensores Estacionamiento", "Tracción 4x4",
            "Frenos Disco", "Dirección Asistida", "Elevavidrios Eléctricos",
            "Radio CD", "Pantalla Touch", "Sistema de Inyección", "Frenos Aire",
            "Barra Antivuelco", "Baranda Metálica", "Diferencial Blocante",
            "Control Estabilidad", "Tracción Integral", "Computadora Viaje",
            "Sensor Lluvia", "Piloto Automático", "Sistema Híbrido"
        ]
        
        # Fechas válidas: 2025 antes del 7 de octubre
        self.fecha_inicio = datetime(2025, 1, 1)
        self.fecha_limite = datetime(2025, 10, 6)
        
    def generar_ppu(self, numero: int) -> str:
        """Genera una PPU en formato AAAA00"""
        # Convertir número a base 26 para las letras y base 100 para los números
        letras_disponibles = string.ascii_uppercase
        
        # Generar 4 letras basadas en el número
        letra1 = letras_disponibles[numero % 26]
        letra2 = letras_disponibles[(numero // 26) % 26]
        letra3 = letras_disponibles[(numero // (26*26)) % 26]
        letra4 = letras_disponibles[(numero // (26*26*26)) % 26]
        
        # Generar 2 números
        numeros = f"{numero % 100:02d}"
        
        return f"{letra1}{letra2}{letra3}{letra4}{numeros}"
    
    def generar_rut(self, numero: int) -> str:
        """Genera un RUT válido basado en el número"""
        base_rut = 10000000 + numero
        
        # Calcular dígito verificador
        def calcular_dv(rut_sin_dv):
            suma = 0
            multiplicador = 2
            for digito in reversed(str(rut_sin_dv)):
                suma += int(digito) * multiplicador
                multiplicador = multiplicador + 1 if multiplicador < 7 else 2
            
            resto = suma % 11
            if resto < 2:
                return str(resto)
            else:
                return str(11 - resto) if 11 - resto < 10 else "K"
        
        dv = calcular_dv(base_rut)
        return f"{base_rut}-{dv}"
    
    def generar_nombre_completo(self) -> str:
        """Genera un nombre completo aleatorio"""
        nombre = random.choice(self.nombres)
        apellido1 = random.choice(self.apellidos)
        apellido2 = random.choice(self.apellidos)
        return f"{nombre} {apellido1} {apellido2}"
    
    def generar_fecha_aleatoria(self) -> datetime:
        """Genera una fecha aleatoria entre inicio de 2025 y el 6 de octubre 2025"""
        tiempo_total = (self.fecha_limite - self.fecha_inicio).total_seconds()
        tiempo_aleatorio = random.uniform(0, tiempo_total)
        return self.fecha_inicio + timedelta(seconds=tiempo_aleatorio)
    
    def generar_marca_modelo(self) -> Tuple[str, str]:
        """Genera una marca y modelo aleatorio"""
        marca = random.choice(list(self.marcas_modelos.keys()))
        modelo = random.choice(self.marcas_modelos[marca])
        return marca, modelo
    
    def generar_datos_permiso_circulacion(self, cantidad: int) -> List[str]:
        """Genera datos para la tabla permiso_circulacion"""
        datos = []
        
        for i in range(1, cantidad + 1):
            ppu = self.generar_ppu(i)
            rut = self.generar_rut(i)
            nombre = self.generar_nombre_completo()
            fecha_emision = self.generar_fecha_aleatoria()
            fecha_expiracion = fecha_emision + timedelta(days=365)
            valor_permiso = random.randint(50000, 300000)
            motor = 100000 + i
            chasis = f"CHS{motor}{random.randint(1000, 9999)}"
            tipo_vehiculo = random.choice(self.tipos_vehiculo)
            color = random.choice(self.colores)
            marca, modelo = self.generar_marca_modelo()
            anio = 2025
            carga = random.randint(0, 15000) if tipo_vehiculo in ["Camioneta", "Furgón", "Camión"] else 0
            tipo_sello = "Verde"
            combustible = random.choice(self.combustibles)
            
            # Cilindrada según tipo de vehículo
            if tipo_vehiculo == "Motocicleta":
                cilindrada = random.choice([150, 200, 250, 300, 400, 600, 800])
            elif combustible == "Eléctrico":
                cilindrada = 0
            else:
                cilindrada = random.choice([1000, 1200, 1400, 1600, 1800, 2000, 2400, 2500, 3200, 3500])
            
            transmision = random.choice(self.transmisiones)
            pts = random.randint(2, 5) if tipo_vehiculo in ["Camión", "Furgón"] else random.randint(4, 5)
            ast = random.randint(2, 19)
            
            # Equipamiento aleatorio
            num_equipos = random.randint(1, 3)
            equipamiento = ", ".join(random.sample(self.equipamientos, num_equipos))
            
            codigo_sii = f"{'MT' if tipo_vehiculo == 'Motocicleta' else 'SD' if tipo_vehiculo == 'Automóvil' else 'SV' if tipo_vehiculo == 'SUV' else 'HB' if tipo_vehiculo == 'Hatchback' else 'SW' if tipo_vehiculo == 'Station Wagon' else 'CT' if tipo_vehiculo == 'Camioneta' else 'FG' if tipo_vehiculo == 'Furgón' else 'CA' if tipo_vehiculo == 'Camión' else 'MU' if tipo_vehiculo == 'Minibús' else 'EL' if combustible == 'Eléctrico' else 'HY'}{100000 + i}"
            
            tasacion = random.randint(2000000, 50000000)
            
            linea_sql = f"('{ppu}', '{rut}', '{nombre}', '{fecha_emision.strftime('%Y-%m-%d')}', '{fecha_expiracion.strftime('%Y-%m-%d')}', {valor_permiso}, {motor}, '{chasis}', '{tipo_vehiculo}', '{color}', '{marca}', '{modelo}', {anio}, {carga}, '{tipo_sello}', '{combustible}', {cilindrada}, '{transmision}', {pts}, {ast}, '{equipamiento}', '{codigo_sii}', {tasacion})"
            
            datos.append(linea_sql)
        
        return datos
    
    def generar_datos_log_fiscalizacion(self, cantidad: int) -> List[str]:
        """Genera datos para la tabla log_fiscalizacion"""
        datos = []
        
        for i in range(1, cantidad + 1):
            ppu = self.generar_ppu(i)
            rut_fiscalizador = self.generar_rut(i + 50000)  # RUT diferente para fiscalizadores
            fecha = self.generar_fecha_aleatoria()
            fecha_con_hora = fecha.replace(
                hour=random.randint(6, 22),
                minute=random.randint(0, 59),
                second=random.randint(0, 59)
            )
            vigencia_permiso = random.choice([0, 1])
            vigencia_revision = random.choice([0, 1])
            vigencia_soap = random.choice([0, 1])
            encargo_robo = random.choice([0, 1]) if random.random() < 0.1 else 0  # 10% probabilidad
            
            linea_sql = f"('{ppu}', '{rut_fiscalizador}', '{fecha_con_hora.strftime('%Y-%m-%d %H:%M:%S')}', {vigencia_permiso}, {vigencia_revision}, {vigencia_soap}, {encargo_robo})"
            
            datos.append(linea_sql)
        
        return datos
    
    def generar_datos_log_consultas_propietarios(self, cantidad: int) -> List[str]:
        """Genera datos para la tabla log_consultas_propietarios"""
        datos = []
        
        for i in range(1, cantidad + 1):
            # Usar los mismos RUTs que en permiso_circulacion para consistencia
            rut = self.generar_rut(i)
            ppu = self.generar_ppu(i)
            fecha = self.generar_fecha_aleatoria()
            fecha_con_hora = fecha.replace(
                hour=random.randint(0, 23),
                minute=random.randint(0, 59),
                second=random.randint(0, 59)
            )
            
            linea_sql = f"('{rut}', '{ppu}', '{fecha_con_hora.strftime('%Y-%m-%d %H:%M:%S')}')"
            
            datos.append(linea_sql)
        
        return datos
    
    def generar_archivo_permiso_circulacion(self, archivo_salida: str, cantidad_filas: int = 10000):
        """Genera archivo SQL solo para permiso_circulacion"""
        print(f"Generando {cantidad_filas} filas para permiso_circulacion...")
        
        datos = self.generar_datos_permiso_circulacion(cantidad_filas)
        
        with open(archivo_salida, 'w', encoding='utf-8') as f:
            f.write("-- DATOS DE PRUEBA - TABLA: permiso_circulacion\n")
            f.write(f"-- {cantidad_filas} filas aleatorias\n")
            f.write(f"-- Generado el {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write("USE back_db;\n\n")
            
            f.write(f"-- Insertando {cantidad_filas} registros en permiso_circulacion\n")
            f.write("INSERT INTO permiso_circulacion (\n")
            f.write("    ppu, rut, nombre, fecha_emision, fecha_expiracion, valor_permiso, motor, chasis,\n")
            f.write("    tipo_vehiculo, color, marca, modelo, anio, carga, tipo_sello, combustible,\n")
            f.write("    cilindrada, transmision, pts, ast, equipamiento, codigo_sii, tasacion\n")
            f.write(") VALUES\n")
            
            for i, linea in enumerate(datos):
                if i < len(datos) - 1:
                    f.write(f"{linea},\n")
                else:
                    f.write(f"{linea};\n")
        
        print(f"✓ Archivo generado: {archivo_salida}")
    
    def generar_archivo_log_fiscalizacion(self, archivo_salida: str, cantidad_filas: int = 10000):
        """Genera archivo SQL solo para log_fiscalizacion"""
        print(f"Generando {cantidad_filas} filas para log_fiscalizacion...")
        
        datos = self.generar_datos_log_fiscalizacion(cantidad_filas)
        
        with open(archivo_salida, 'w', encoding='utf-8') as f:
            f.write("-- DATOS DE PRUEBA - TABLA: log_fiscalizacion\n")
            f.write(f"-- {cantidad_filas} filas aleatorias\n")
            f.write(f"-- Generado el {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write("USE back_db;\n\n")
            
            f.write(f"-- Insertando {cantidad_filas} registros en log_fiscalizacion\n")
            f.write("INSERT INTO log_fiscalizacion (\n")
            f.write("    ppu, rut_fiscalizador, fecha, vigencia_permiso, vigencia_revision, vigencia_soap, encargo_robo\n")
            f.write(") VALUES\n")
            
            for i, linea in enumerate(datos):
                if i < len(datos) - 1:
                    f.write(f"{linea},\n")
                else:
                    f.write(f"{linea};\n")
        
        print(f"✓ Archivo generado: {archivo_salida}")
    
    def generar_archivo_log_consultas_propietarios(self, archivo_salida: str, cantidad_filas: int = 10000):
        """Genera archivo SQL solo para log_consultas_propietarios"""
        print(f"Generando {cantidad_filas} filas para log_consultas_propietarios...")
        
        datos = self.generar_datos_log_consultas_propietarios(cantidad_filas)
        
        with open(archivo_salida, 'w', encoding='utf-8') as f:
            f.write("-- DATOS DE PRUEBA - TABLA: log_consultas_propietarios\n")
            f.write(f"-- {cantidad_filas} filas aleatorias\n")
            f.write(f"-- Generado el {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write("USE back_db;\n\n")
            
            f.write(f"-- Insertando {cantidad_filas} registros en log_consultas_propietarios\n")
            f.write("INSERT INTO log_consultas_propietarios (\n")
            f.write("    rut, ppu, fecha\n")
            f.write(") VALUES\n")
            
            for i, linea in enumerate(datos):
                if i < len(datos) - 1:
                    f.write(f"{linea},\n")
                else:
                    f.write(f"{linea};\n")
        
        print(f"✓ Archivo generado: {archivo_salida}")
    
    def generar_archivo_completo(self, directorio_salida: str = ".", cantidad_filas: int = 10000):
        """Genera todos los archivos SQL separados"""
        print(f"\n📊 Iniciando generación de {cantidad_filas} filas por tabla...\n")
        
        # Crear directorio si no existe
        if not os.path.exists(directorio_salida):
            os.makedirs(directorio_salida)
            print(f"📁 Directorio creado: {directorio_salida}\n")
        
        # Generar archivos separados
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        archivo_permiso = os.path.join(directorio_salida, f"01_permiso_circulacion_{cantidad_filas}_{timestamp}.sql")
        archivo_fiscalizacion = os.path.join(directorio_salida, f"02_log_fiscalizacion_{cantidad_filas}_{timestamp}.sql")
        archivo_consultas = os.path.join(directorio_salida, f"03_log_consultas_propietarios_{cantidad_filas}_{timestamp}.sql")
        
        # Generar cada archivo
        self.generar_archivo_permiso_circulacion(archivo_permiso, cantidad_filas)
        self.generar_archivo_log_fiscalizacion(archivo_fiscalizacion, cantidad_filas)
        self.generar_archivo_log_consultas_propietarios(archivo_consultas, cantidad_filas)
        
        # Información final
        print(f"\n{'='*60}")
        print(f"✅ GENERACIÓN COMPLETADA CON ÉXITO")
        print(f"{'='*60}")
        print(f"\n📁 Ubicación: {os.path.abspath(directorio_salida)}\n")
        print(f"Archivos generados ({cantidad_filas} filas cada uno):\n")
        print(f"  1️⃣  {os.path.basename(archivo_permiso)}")
        print(f"  2️⃣  {os.path.basename(archivo_fiscalizacion)}")
        print(f"  3️⃣  {os.path.basename(archivo_consultas)}\n")
        print(f"⏱️  Total de registros: {cantidad_filas * 3:,}")
        print(f"📅 Timestamp: {timestamp}\n")
        
        # Instrucciones de uso
        print(f"{'='*60}")
        print(f"📋 INSTRUCCIONES DE USO:")
        print(f"{'='*60}\n")
        print(f"En MySQL Workbench o línea de comandos:\n")
        print(f"  mysql -u root -p back_db < {os.path.basename(archivo_permiso)}")
        print(f"  mysql -u root -p back_db < {os.path.basename(archivo_fiscalizacion)}")
        print(f"  mysql -u root -p back_db < {os.path.basename(archivo_consultas)}\n")
        print(f"O ejecutarlos en orden dentro de MySQL:\n")
        print(f"  source {archivo_permiso};")
        print(f"  source {archivo_fiscalizacion};")
        print(f"  source {archivo_consultas};\n")

def main():
    """Función principal"""
    generador = GeneradorDatosPrueba()
    
    # Directorio de salida
    directorio_salida = "datos_generados"
    
    # Cantidad de filas por tabla
    cantidad_filas = 10000
    
    # Generar todos los archivos
    generador.generar_archivo_completo(directorio_salida, cantidad_filas)

if __name__ == "__main__":
    main()