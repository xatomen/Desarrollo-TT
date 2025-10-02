-- Base de datos Plataforma Digital Integrada para la Gestión Unificada del Permiso de Circulación a nivel Nacional
CREATE DATABASE IF NOT EXISTS back_db;
USE back_db;

-- Log consultas fiscalización
CREATE TABLE IF NOT EXISTS log_fiscalizacion(
    id INT AUTO_INCREMENT PRIMARY KEY,
    ppu VARCHAR(10) NOT NULL,
    rut_fiscalizador VARCHAR(12) NOT NULL,
    fecha DATETIME NOT NULL,
    vigencia_permiso BOOLEAN NOT NULL,
    vigencia_revision BOOLEAN NOT NULL,
    vigencia_soap BOOLEAN NOT NULL,
    encargo_robo BOOLEAN NOT NULL
);

-- Log consultas propietarios
CREATE TABLE IF NOT EXISTS log_consultas_propietarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(12) NOT NULL,
    ppu VARCHAR(10) NOT NULL,
    fecha DATETIME NOT NULL
);

-- Permiso de circulación
CREATE TABLE IF NOT EXISTS permiso_circulacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ppu VARCHAR(10) NOT NULL,
    rut VARCHAR(12) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_expiracion DATE NOT NULL,
    valor_permiso INT NOT NULL,
    motor INT NOT NULL,
    chasis VARCHAR(50) NOT NULL,
    tipo_vehiculo VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    anio INT NOT NULL,
    carga INT NOT NULL,
    tipo_sello VARCHAR(50) NOT NULL,
    combustible VARCHAR(50) NOT NULL,
    cilindrada INT NOT NULL,
    transmision VARCHAR(50) NOT NULL,
    pts INT NOT NULL,
    ast INT NOT NULL,
    equipamiento VARCHAR(100) NOT NULL,
    codigo_sii VARCHAR(20) NOT NULL,
    tasacion INT NOT NULL
);

-- Usuarios administradores
CREATE TABLE IF NOT EXISTS usuarios_admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(12) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Mis Vehículos Guardados
CREATE TABLE IF NOT EXISTS mis_vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(12) NOT NULL,
    ppu VARCHAR(10) NOT NULL,
    nombre_vehiculo VARCHAR(100) NOT NULL,
    fecha_agregado DATETIME NOT NULL
);

-- Mis Permisos Emitidos
CREATE TABLE IF NOT EXISTS mis_permisos_emitidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(12) NOT NULL,
    ppu VARCHAR(10) NOT NULL,
    fecha_pago DATETIME NOT NULL,
    id_permiso INT NOT NULL,
    monto_pago INT NOT NULL,
    tarjeta VARCHAR (16) NOT NULL,
    cuotas INT NOT NULL,
    cuota_pagada INT NOT NULL
);

USE back_db;

INSERT INTO usuarios_admin (rut, nombre, email, password) VALUES
('12345678-9', 'Juan Pérez', 'juan.perez@example.com', 'password123'),
('98765432-1', 'María González', 'maria.gonzalez@example.com', 'password456'),
('11223344-5', 'Carlos Soto', 'carlos.soto@example.com', 'password789'),
('55667788-0', 'Ana Ramírez', 'ana.ramirez@example.com', 'passwordabc'),
('22334455-6', 'Luis Torres', 'luis.torres@example.com', 'passworddef'),

-- ###########################################################################
-- Datos de prueba para los usuarios
-- ###########################################################################

('20961960-1', 'Jorge Gallardo Contreras', 'jorge@mail.com', '123456'),
('20857826-K', 'Felipe Vera Andrade', 'felipe@mail.com', '123456'),
('20595210-1', 'Luis Caro Morales', 'luis@mail.com', '123456');

-- ############################################################
-- Datos de permisos emitidos
-- ############################################################
INSERT INTO mis_permisos_emitidos (rut, ppu, fecha_pago, id_permiso, monto_pago, tarjeta, cuotas, cuota_pagada) VALUES
('20961960-1', 'AH1234', '2023-11-20 00:00:00', 36, 78000, '4345591084215296', 1, 1),
('20961960-1', 'BWFD87', '2022-06-15 00:00:00', 37, 62000, '4345591084215296', 1, 1),
('20961960-1', 'CBKS56', '2023-03-10 00:00:00', 38, 35000, '4345591084215296', 1, 1),
('20857826-K', 'HRWY25', '2021-08-30 00:00:00', 39, 69000, '6011514433546201', 1, 1),
('20595210-1', 'WXY123', '2025-05-15 00:00:00', 40, 18000, '3530111333300000', 1, 1),
('20595210-1', 'HWRY70', '2025-06-20 00:00:00', 41, 260000, '3530111333300000', 1, 1);

INSERT INTO mis_vehiculos (rut, ppu, nombre_vehiculo, fecha_agregado) VALUES
('20961960-1', 'DVGF33', 'Auto del abuelo', '2025-09-23 09:00:00'),
('20961960-1', 'RWTW63', 'Vehículo tío Roberto', '2025-09-23 09:05:00'),
('20961960-1', 'GK6762', 'Sedán familiar', '2025-09-23 09:10:00'),
('20857826-K', 'JXPJ52', 'Camioneta Isabel', '2025-09-23 09:15:00'),
('20595210-1', 'TD124', 'Moto Diego', '2025-09-23 09:20:00'),
('20595210-1', 'CYSP27', 'Camión del abuelo', '2025-09-23 09:25:00');

INSERT INTO permiso_circulacion (
    ppu, rut, nombre, fecha_emision, fecha_expiracion, valor_permiso, motor, chasis, 
    tipo_vehiculo, color, marca, modelo, anio, carga, tipo_sello, combustible, 
    cilindrada, transmision, pts, ast, equipamiento, codigo_sii, tasacion
) VALUES

-- Vehículos nuevos (patentes formato nuevo)
('BYDD18', '15882609-7', 'María González Pérez', '2024-03-15 00:00:00', '2025-03-15 00:00:00', 125000, 123456, 'WBA3A5C58DF123456', 'Automóvil', 'Blanco', 'Toyota', 'Corolla', 2023, 0, 'Verde', 'Gasolina', 1800, 'Automática', 0, 0, 'Aire Acondicionado, ABS', 'SD428391', 12500000),
('DVGF33', '14296139-3', 'Carlos Rodriguez Silva', '2024-02-20 00:00:00', '2025-02-20 00:00:00', 98000, 234567, 'JH4KA8260MC123457', 'Automóvil', 'Negro', 'Honda', 'Civic', 2022, 0, 'Verde', 'Gasolina', 1500, 'Manual', 0, 0, 'Radio, Cierre Centralizado', 'SD756182', 9800000),
('ZDBX97', '21942260-1', 'Ana Morales Torres', '2024-01-10 00:00:00', '2025-01-10 00:00:00', 150000, 345678, 'KMHD84LF5DU123458', 'SUV', 'Rojo', 'Hyundai', 'Tucson', 2024, 0, 'Verde', 'Gasolina', 2000, 'Automática', 0, 0, 'GPS, Cámara Retroceso', 'SV293847', 18500000),
('CVDT73', '17126452-9', 'Pedro Sánchez López', '2024-04-05 00:00:00', '2025-04-05 00:00:00', 85000, 456789, 'WVWZZZ3CZDE123459', 'Hatchback', 'Azul', 'Volkswagen', 'Golf', 2021, 0, 'Verde', 'Gasolina', 1400, 'Manual', 0, 0, 'Bluetooth, Control Crucero', 'HB651473', 8500000),
('JXPJ52', '13202473-1', 'Isabel Herrera Ruiz', '2024-03-25 00:00:00', '2025-03-25 00:00:00', 175000, 567890, '1HGBH41JXMN123460', 'Camioneta', 'Verde', 'Ford', 'Ranger', 2023, 1500, 'Verde', 'Diesel', 3200, 'Manual', 0, 0, 'Barra Antivuelco, Tracción 4x4', 'CT384925', 22000000),
('RWTW63', '3260766-7', 'Roberto Jiménez Castro', '2024-02-14 00:00:00', '2025-02-14 00:00:00', 65000, 678901, 'JTEBU17R870123461', 'Station Wagon', 'Gris', 'Suzuki', 'Swift', 2020, 0, 'Verde', 'Gasolina', 1200, 'Manual', 0, 0, 'Radio AM/FM', 'HB517638', 6500000),
('WXLP42', '6047126-6', 'Claudia Moreno Vega', '2024-01-30 00:00:00', '2025-01-30 00:00:00', 120000, 789012, 'WBAVB13506PT23462', 'Sedán', 'Plata', 'BMW', 'Serie 3', 2022, 0, 'Verde', 'Gasolina', 2000, 'Automática', 0, 0, 'Cuero, Techo Solar', 'SD829164', 25000000),
('BBZB15', '12711955-4', 'Miguel Vargas Díaz', '2024-03-08 00:00:00', '2025-03-08 00:00:00', 95000, 890123, 'KNDJC733385123463', 'Hatchback', 'Amarillo', 'Kia', 'Rio', 2021, 0, 'Verde', 'Gasolina', 1400, 'Manual', 0, 0, 'Aire Acondicionado', 'HB742591', 9500000),
('HXPY38', '7978316-1', 'Carmen Reyes Fernández', '2024-04-12 00:00:00', '2025-04-12 00:00:00', 135000, 901234, 'JF1GD29607G423464', 'SUV', 'Café', 'Subaru', 'Forester', 2023, 0, 'Verde', 'Gasolina', 2500, 'Automática', 0, 0, 'Tracción Integral, Control Estabilidad', 'SV468732', 16500000),
('FPHC43', '22640435-K', 'Francisco Torres Medina', '2024-02-28 00:00:00', '2025-02-28 00:00:00', 78000, 123450, 'WMEEJ31X04K123465', 'Compacto', 'Naranja', 'Smart', 'ForTwo', 2020, 0, 'Verde', 'Gasolina', 1000, 'Automática', 0, 0, 'Radio Digital', 'HB395817', 7800000),

-- Vehículos antiguos (patentes formato antiguo)
('DI8521', '20451369-4', 'Eduardo Silva Herrera', '2024-01-15 00:00:00', '2025-01-15 00:00:00', 45000, 234561, 'WBAFW31080LE23466', 'Automóvil', 'Blanco', 'Nissan', 'Sentra', 2015, 0, 'Verde', 'Gasolina', 1600, 'Manual', 0, 0, 'Radio, Dirección Asistida', 'SD583926', 4500000),
('EA9529', '3171990-9', 'Gloria Martínez Rojas', '2024-03-01 00:00:00', '2025-03-01 00:00:00', 38000, 345672, 'JHMFA36259S123467', 'Automóvil', 'Azul', 'Chevrolet', 'Aveo', 2014, 0, 'Verde', 'Gasolina', 1400, 'Manual', 0, 0, 'Elevavidrios Eléctricos', 'SD647283', 3800000),
('WA9253', '17806473-8', 'Andrés Flores Gutiérrez', '2024-02-10 00:00:00', '2025-02-10 00:00:00', 52000, 456783, 'WAUZZZ8K2DA123468', 'SUV', 'Negro', 'Jeep', 'Cherokee', 2016, 0, 'Verde', 'Gasolina', 2400, 'Automática', 0, 0, 'Tracción 4x4, Aire Acondicionado', 'SV829461', 8500000),
('HS6882', '13280417-6', 'Mónica Castillo Pinto', '2024-04-18 00:00:00', '2025-04-18 00:00:00', 41000, 567894, 'JN1AZ34D45M123469', 'Hatchback', 'Rojo', 'Hyundai', 'Accent', 2013, 0, 'Verde', 'Gasolina', 1400, 'Manual', 0, 0, 'Radio CD', 'HB714592', 4100000),
('LV3154', '11377973-K', 'Raúl Guerrero Soto', '2024-01-25 00:00:00', '2025-01-25 00:00:00', 62000, 678905, 'WBAVB73557PT23470', 'Station Wagon', 'Verde', 'Peugeot', '308', 2017, 0, 'Verde', 'Gasolina', 1600, 'Manual', 0, 0, 'Computadora de Viaje', 'HB385726', 6200000),
('TR3542', '5330999-2', 'Valentina Romero Cruz', '2024-03-12 00:00:00', '2025-03-12 00:00:00', 48000, 789016, 'SAJWA0FS4FP623471', 'Automóvil', 'Gris', 'Mazda', 'Mazda3', 2015, 0, 'Verde', 'Gasolina', 1600, 'Automática', 0, 0, 'Bluetooth, USB', 'SD926584', 4800000),
('ZJ9488', '7330303-6', 'Joaquín Mendoza Luna', '2024-02-08 00:00:00', '2025-02-08 00:00:00', 55000, 890127, 'KMHFG4JG0GA123472', 'SUV', 'Plata', 'Mitsubishi', 'Outlander', 2016, 0, 'Verde', 'Gasolina', 2400, 'CVT', 0, 0, 'Control Estabilidad', 'SV573819', 9200000),
('ZH2985', '19975152-2', 'Patricia Núñez Morales', '2024-04-03 00:00:00', '2025-04-03 00:00:00', 35000, 901238, 'JTDBT4K3XAJ123473', 'Hatchback', 'Café', 'Toyota', 'Yaris', 2012, 0, 'Verde', 'Gasolina', 1300, 'Manual', 0, 0, 'Aire Acondicionado', 'HB461937', 3500000),
('TJ4152', '15021408-4', 'Sebastián Ortega Vargas', '2024-01-08 00:00:00', '2025-01-08 00:00:00', 59000, 123459, 'WVWZZZ1JZ2W123474', 'Automóvil', 'Blanco', 'Volkswagen', 'Polo', 2017, 0, 'Verde', 'Gasolina', 1600, 'Manual', 0, 0, 'ESP, ABS', 'SD729468', 5900000),
('GK6762', '20083916-1', 'Lorena Peña Alvarez', '2024-03-20 00:00:00', '2025-03-20 00:00:00', 47000, 234560, 'JHMGE8H58CC123475', 'Sedán', 'Azul', 'Honda', 'City', 2014, 0, 'Verde', 'Gasolina', 1500, 'CVT', 0, 0, 'Cámara Retroceso', 'SD618375', 4700000),

-- Motocicletas nuevas
('TD124', '13356808-5', 'Diego Herrera Santos', '2024-02-15 00:00:00', '2025-02-15 00:00:00', 25000, 112233, 'JH2RC50A5GM123476', 'Motocicleta', 'Negro', 'Honda', 'CB600F', 2023, 0, 'Verde', 'Gasolina', 600, 'Manual', 0, 0, 'ABS', 'MT492738', 3500000),
('SJ598', '19599582-6', 'Camila Lagos Rivera', '2024-03-10 00:00:00', '2025-03-10 00:00:00', 18000, 223344, 'JYARN23E5GA123477', 'Motocicleta', 'Rojo', 'Yamaha', 'YZF-R3', 2022, 0, 'Verde', 'Gasolina', 320, 'Manual', 0, 0, 'Frenos Disco', 'MT856194', 2800000),
('VR394', '24044863-7', 'Nicolás Campos Torres', '2024-01-22 00:00:00', '2025-01-22 00:00:00', 22000, 334455, 'ZA2EE2400ES123478', 'Motocicleta', 'Azul', 'Kawasaki', 'Ninja 300', 2023, 0, 'Verde', 'Gasolina', 300, 'Manual', 0, 0, 'Sistema de Inyección', 'MT374529', 3200000),
('SP618', '13969750-2', 'Fernanda Ramos Cáceres', '2024-04-07 00:00:00', '2025-04-07 00:00:00', 16000, 445566, 'VBKMA2110CM123479', 'Motocicleta', 'Blanco', 'Suzuki', 'GSX250R', 2022, 0, 'Verde', 'Gasolina', 250, 'Manual', 0, 0, 'Arranque Eléctrico', 'MT628471', 2400000),
('KV215', '21425248-1', 'Matías Espinoza Flores', '2024-02-28 00:00:00', '2025-02-28 00:00:00', 20000, 556677, 'MD2JE2419AS123480', 'Motocicleta', 'Verde', 'Ducati', 'Monster 797', 2023, 0, 'Verde', 'Gasolina', 800, 'Manual', 0, 0, 'Control Tracción', 'MT916835', 4500000),

-- Motocicletas antiguas
('JY580', '16759027-6', 'Gonzalo Miranda Sáez', '2024-01-18 00:00:00', '2025-01-18 00:00:00', 12000, 667788, 'JH2RC30A8BM123481', 'Motocicleta', 'Negro', 'Honda', 'CB125', 2015, 0, 'Verde', 'Gasolina', 125, 'Manual', 0, 0, 'Frenos Tambor', 'MT583746', 800000),
('DP676', '13780657-6', 'Javiera Morales Herrera', '2024-03-05 00:00:00', '2025-03-05 00:00:00', 14000, 778899, 'JYAVP08E7DA123482', 'Motocicleta', 'Rojo', 'Yamaha', 'XTZ125', 2016, 0, 'Verde', 'Gasolina', 125, 'Manual', 0, 0, 'Arranque Patada', 'MT742951', 1200000),
('PT759', '9413435-8', 'Esteban Silva Moreno', '2024-02-12 00:00:00', '2025-02-12 00:00:00', 10000, 889900, 'ZA2UR0A03DS123483', 'Motocicleta', 'Azul', 'Kawasaki', 'KLX110', 2014, 0, 'Verde', 'Gasolina', 110, 'Manual', 0, 0, 'Suspensión Básica', 'MT395827', 600000),
('ZD933', '23229217-2', 'Constanza Rojas Vega', '2024-04-15 00:00:00', '2025-04-15 00:00:00', 13000, 990011, 'VBKUA1810FM123484', 'Motocicleta', 'Blanco', 'Suzuki', 'EN125', 2017, 0, 'Verde', 'Gasolina', 125, 'Manual', 0, 0, 'Luces LED', 'MT684193', 900000),
('WZ664', '12610661-0', 'Ignacio Torres Campos', '2024-01-09 00:00:00', '2025-01-09 00:00:00', 11000, 111222, 'MD2TE0918GS123485', 'Motocicleta', 'Gris', 'Benelli', 'TNT150', 2016, 0, 'Verde', 'Gasolina', 150, 'Manual', 0, 0, 'Disco Adelante', 'MT527468', 1100000),

-- Camiones y vehículos comerciales
('CYSP27', '7035758-5', 'Ricardo Mendoza Castro', '2024-03-18 00:00:00', '2025-03-18 00:00:00', 280000, 445567, 'WDB9635321L123486', 'Camión', 'Blanco', 'Mercedes-Benz', 'Actros', 2023, 15000, 'Verde', 'Diesel', 12800, 'Manual', 0, 0, 'Frenos Aire, ABS', 'CA837496', 45000000),
('HVKC58', '18066062-3', 'Alejandra Fuentes López', '2024-02-05 00:00:00', '2025-02-05 00:00:00', 195000, 556678, 'WJME2NTH508123487', 'Furgón', 'Azul', 'Iveco', 'Daily', 2022, 3500, 'Verde', 'Diesel', 3000, 'Manual', 0, 0, 'Dirección Asistida', 'FG659281', 18500000),
('HLZC93', '23902784-9', 'Cristián Paredes Muñoz', '2024-01-12 00:00:00', '2025-01-12 00:00:00', 165000, 667789, 'JN1TBNT22U0123488', 'Camioneta', 'Gris', 'Nissan', 'NP300', 2021, 1200, 'Verde', 'Diesel', 2500, 'Manual', 0, 0, 'Baranda Metálica', 'CT741583', 14500000),
('DYZS86', '21494931-8', 'Soledad Guerrero Núñez', '2024-04-08 00:00:00', '2025-04-08 00:00:00', 225000, 778890, 'WJMM62FT20C123489', 'Minibús', 'Amarillo', 'Iveco', 'Daily Minibus', 2023, 0, 'Verde', 'Diesel', 3000, 'Manual', 19, 0, 'Aire Acondicionado, 19 Asientos', 'MU426973', 28000000),
('XKTP17', '21092587-2', 'Hernán Vásquez Silva', '2024-03-22 00:00:00', '2025-03-22 00:00:00', 145000, 889901, 'WJME62EU20C123490', 'Furgón', 'Rojo', 'Ford', 'Transit', 2022, 2000, 'Verde', 'Diesel', 2200, 'Manual', 0, 0, 'Sensor Estacionamiento', 'FG584726', 16200000),

-- ###########################################################################
-- Datos de prueba para los permisos de circulación
-- ###########################################################################

-- Jorge Gallardo Contreras
('AH1234', '20961960-1', 'Jorge Gallardo Contreras', '2023-11-20 00:00:00', '2024-11-20 00:00:00', 78000, '5566778', '1G1BE5SM0J7123456', 'Sedán', 'Blanco', 'Chevrolet', 'Cruze', 2020, 0, 'Verde', 'Gasolina', 1600, 'Automática', 4, 2, 'Bluetooth, ABS', 'SD634452', 7800000),
('BWFD87', '20961960-1', 'Jorge Gallardo Contreras', '2022-06-15 00:00:00', '2023-06-15 00:00:00', 62000, '998877', 'VF1BR0B0C12345678', 'Sedán', 'Rojo', 'Renault', 'Clio', 2019, 0, 'Verde', 'Gasolina', 1200, 'Manual', 4, 2, 'Aire Acondicionado, Radio', 'SD635443', 6200000),
('CBKS56', '20961960-1', 'Jorge Gallardo Contreras', '2023-03-10 00:00:00', '2024-03-10 00:00:00', 35000, '334455', 'VBKRD1100M1234567', 'Hatchback', 'Blanco', 'Kia', 'Rio 3', 2021, 0, 'Verde', 'Gasolina', 1200, 'Manual', 5, 2, 'Bluetooth, Airbags', 'SD654233', 3500000),
-- Felipe Vera Andrade
('HRWY25', '20857826-K', 'Felipe Vera Andrade', '2021-08-30 00:00:00', '2022-08-30 00:00:00', 69000, '334455', 'KMHDH4AE0JU123456', 'Sedán', 'Azul', 'Hyundai', 'Elantra', 2018, 0, 'Verde', 'Gasolina', 1600, 'Automática', 4, 2, 'Aire Acondicionado, ABS', 'SD542364', 6900000),
-- Luis Caro Morales
('WXY12', '20595210-1', 'Luis Caro Morales', '2025-05-15 00:00:00', '2026-05-15 00:00:00', 18000, '123456', 'JYARJ23E0KA123456', 'Motocicleta', 'Negro', 'Yamaha', 'YZF-R3', 2020, 0, 'Verde', 'Gasolina', 321, 'Manual', 0, 2, 'Frenos Disco', 'MT953234', 2700000),
('HWRY70', '20595210-1', 'Luis Caro Morales', '2024-06-20 00:00:00', '2025-06-20 00:00:00', 260000, '654321', 'YV2B4B4C5MA123456', 'Camión', 'Blanco', 'Volvo', 'FH16', 2021, 16000, 'Verde', 'Diesel', 16000, 'Automática', 2, 3, 'Frenos Aire, ABS', 'CA623454', 42000000);

INSERT INTO log_fiscalizacion (
    ppu, rut_fiscalizador, fecha, vigencia_permiso, vigencia_revision, vigencia_soap, encargo_robo
) VALUES

-- Enero 2025 - Fiscalizaciones con diferentes estados
('BYDD18', '12345678-9', '2025-01-05 09:15:00', 1, 1, 1, 0),  -- Todo al día
('DVGF33', '12345678-9', '2025-01-05 10:30:00', 1, 0, 1, 0),  -- Revisión vencida
('ZDBX97', '12345678-9', '2025-01-05 11:45:00', 0, 1, 1, 0),  -- Permiso vencido
('CVDT73', '98765432-1', '2025-01-08 08:20:00', 1, 1, 0, 0),  -- SOAP vencido
('JXPJ52', '98765432-1', '2025-01-08 14:10:00', 1, 1, 1, 1),  -- Con encargo por robo
('DI8521', '98765432-1', '2025-01-10 16:00:00', 1, 1, 1, 0),  -- Todo al día
('EA9529', '11111111-1', '2025-01-12 09:30:00', 0, 0, 1, 0),  -- Permiso y revisión vencidos
('WA9253', '11111111-1', '2025-01-15 13:20:00', 1, 1, 1, 0),  -- Todo al día
('HS6882', '11111111-1', '2025-01-18 11:15:00', 1, 0, 0, 0),  -- Revisión y SOAP vencidos
('LV3154', '22222222-2', '2025-01-20 15:45:00', 1, 1, 1, 0),  -- Todo al día

-- Febrero 2025 - Mayor volumen de fiscalizaciones
('TD124', '22222222-2', '2025-02-02 08:00:00', 1, 1, 1, 0),   -- Todo al día
('SJ598', '22222222-2', '2025-02-02 09:15:00', 1, 1, 1, 0),   -- Todo al día
('VR394', '33333333-3', '2025-02-05 10:30:00', 0, 1, 1, 0),   -- Permiso vencido
('CYSP27', '33333333-3', '2025-02-05 11:45:00', 1, 1, 1, 0),  -- Todo al día
('HVKC58', '33333333-3', '2025-02-08 14:20:00', 1, 0, 1, 0),  -- Revisión vencida
('HLZC93', '44444444-4', '2025-02-10 16:10:00', 1, 1, 1, 1),  -- Con encargo por robo
('DYZS86', '44444444-4', '2025-02-12 08:30:00', 1, 1, 0, 0),  -- SOAP vencido
('XKTP17', '44444444-4', '2025-02-15 12:45:00', 1, 1, 1, 0),  -- Todo al día
('ELCT45', '55555555-5', '2025-02-18 10:20:00', 1, 1, 1, 0),  -- Todo al día
('HYBR89', '55555555-5', '2025-02-20 15:30:00', 0, 0, 0, 0),  -- Todo vencido

-- Marzo 2025 - Operativos especiales
('HIST12', '55555555-5', '2025-03-01 07:15:00', 1, 1, 1, 0),  -- Todo al día
('HIST34', '66666666-6', '2025-03-01 08:30:00', 1, 1, 1, 0),  -- Todo al día
('BYDD18', '66666666-6', '2025-03-05 09:45:00', 1, 1, 1, 0),  -- Todo al día (segunda fiscalización)
('DVGF33', '66666666-6', '2025-03-05 11:00:00', 1, 1, 1, 0),  -- Ahora al día
('ZDBX97', '77777777-7', '2025-03-08 14:15:00', 1, 0, 1, 0),  -- Revisión vencida
('CVDT73', '77777777-7', '2025-03-08 15:30:00', 0, 1, 0, 0),  -- Permiso y SOAP vencidos
('JXPJ52', '77777777-7', '2025-03-10 16:45:00', 1, 1, 1, 0),  -- Ya sin encargo por robo
('DI8521', '88888888-8', '2025-03-12 08:20:00', 1, 1, 1, 1),  -- Ahora con encargo por robo
('EA9529', '88888888-8', '2025-03-15 10:10:00', 1, 1, 1, 0),  -- Documentos al día
('WA9253', '88888888-8', '2025-03-18 13:25:00', 0, 1, 1, 0),  -- Permiso vencido

-- Abril 2025 - Tendencia actual
('HS6882', '99999999-9', '2025-04-02 09:00:00', 1, 1, 1, 0),  -- Todo al día
('LV3154', '99999999-9', '2025-04-05 11:30:00', 1, 0, 1, 0),  -- Revisión vencida
('TD124', '99999999-9', '2025-04-08 14:45:00', 1, 1, 0, 0),   -- SOAP vencido
('SJ598', '10101010-K', '2025-04-10 16:20:00', 1, 1, 1, 0),   -- Todo al día
('VR394', '10101010-K', '2025-04-12 08:15:00', 0, 0, 1, 1),   -- Permiso y revisión vencidos + encargo
('CYSP27', '10101010-K', '2025-04-15 12:30:00', 1, 1, 1, 0),  -- Todo al día
('HVKC58', '12121212-1', '2025-04-18 15:10:00', 1, 1, 1, 0),  -- Todo al día
('HLZC93', '12121212-1', '2025-04-20 17:25:00', 1, 0, 0, 0),  -- Revisión y SOAP vencidos
('DYZS86', '12121212-1', '2025-04-22 09:40:00', 1, 1, 1, 0),  -- Todo al día
('XKTP17', '13131313-2', '2025-04-25 13:55:00', 0, 1, 1, 0);  -- Permiso vencido

-- Datos de prueba para log_consultas_propietarios
INSERT INTO log_consultas_propietarios (
    rut, ppu, fecha
) VALUES

-- Enero 2025 - Consultas de propietarios
('15882609-7', 'BYDD18', '2025-01-03 08:30:00'),  -- María González consulta su vehículo
('14296139-3', 'DVGF33', '2025-01-03 14:20:00'),  -- Carlos Rodríguez consulta su vehículo
('21942260-1', 'ZDBX97', '2025-01-05 16:45:00'),  -- Ana Morales consulta su vehículo
('17126452-9', 'CVDT73', '2025-01-08 09:15:00'),  -- Pedro Sánchez consulta su vehículo
('13202473-1', 'JXPJ52', '2025-01-10 11:30:00'),  -- Isabel Herrera consulta su vehículo
('20451369-4', 'DI8521', '2025-01-12 13:45:00'),  -- Eduardo Silva consulta su vehículo
('3171990-9', 'EA9529', '2025-01-15 15:20:00'),   -- Gloria Martínez consulta su vehículo
('17806473-8', 'WA9253', '2025-01-18 17:10:00'),  -- Andrés Flores consulta su vehículo
('13280417-6', 'HS6882', '2025-01-20 19:25:00'),  -- Mónica Castillo consulta su vehículo
('11377973-K', 'LV3154', '2025-01-22 21:40:00'),  -- Raúl Guerrero consulta su vehículo

-- Febrero 2025 - Mayor actividad
('13356808-5', 'TD124', '2025-02-01 08:00:00'),   -- Diego Herrera consulta su motocicleta
('19599582-6', 'SJ598', '2025-02-03 10:15:00'),   -- Camila Lagos consulta su motocicleta
('24044863-7', 'VR394', '2025-02-05 12:30:00'),   -- Nicolás Campos consulta su motocicleta
('7035758-5', 'CYSP27', '2025-02-08 14:45:00'),   -- Ricardo Mendoza consulta su camión
('18066062-3', 'HVKC58', '2025-02-10 16:20:00'),  -- Alejandra Fuentes consulta su furgón
('23902784-9', 'HLZC93', '2025-02-12 18:35:00'),  -- Cristián Paredes consulta su camioneta
('21494931-8', 'DYZS86', '2025-02-15 20:50:00'),  -- Soledad Guerrero consulta su minibús
('21092587-2', 'XKTP17', '2025-02-18 07:25:00'),  -- Hernán Vásquez consulta su furgón
('22640435-K', 'ELCT45', '2025-02-20 09:40:00'),  -- Francisco Torres consulta su Tesla
('6047126-6', 'HYBR89', '2025-02-22 11:55:00'),   -- Claudia Moreno consulta su Prius

-- Marzo 2025 - Consultas frecuentes
('12711955-4', 'HIST12', '2025-03-02 13:10:00'),  -- Miguel Vargas consulta su vehículo
('7978316-1', 'HIST34', '2025-03-05 15:25:00'),   -- Carmen Reyes consulta su vehículo
('15882609-7', 'BYDD18', '2025-03-08 17:40:00'),  -- María González (segunda consulta)
('14296139-3', 'DVGF33', '2025-03-10 19:55:00'),  -- Carlos Rodríguez (segunda consulta)
('21942260-1', 'ZDBX97', '2025-03-12 08:20:00'),  -- Ana Morales (segunda consulta)
('17126452-9', 'CVDT73', '2025-03-15 10:35:00'),  -- Pedro Sánchez (segunda consulta)
('13202473-1', 'JXPJ52', '2025-03-18 12:50:00'),  -- Isabel Herrera (segunda consulta)
('20451369-4', 'DI8521', '2025-03-20 14:15:00'),  -- Eduardo Silva (segunda consulta)
('3171990-9', 'EA9529', '2025-03-22 16:30:00'),   -- Gloria Martínez (segunda consulta)
('17806473-8', 'WA9253', '2025-03-25 18:45:00'),  -- Andrés Flores (segunda consulta)

-- Abril 2025 - Actividad reciente
('13280417-6', 'HS6882', '2025-04-01 07:00:00'),  -- Mónica Castillo consulta nuevamente
('11377973-K', 'LV3154', '2025-04-03 09:15:00'),  -- Raúl Guerrero consulta nuevamente
('13356808-5', 'TD124', '2025-04-05 11:30:00'),   -- Diego Herrera consulta nuevamente
('19599582-6', 'SJ598', '2025-04-08 13:45:00'),   -- Camila Lagos consulta nuevamente
('24044863-7', 'VR394', '2025-04-10 15:20:00'),   -- Nicolás Campos consulta nuevamente
('7035758-5', 'CYSP27', '2025-04-12 17:35:00'),   -- Ricardo Mendoza consulta nuevamente
('18066062-3', 'HVKC58', '2025-04-15 19:50:00'),  -- Alejandra Fuentes consulta nuevamente
('23902784-9', 'HLZC93', '2025-04-18 08:25:00'),  -- Cristián Paredes consulta nuevamente
('21494931-8', 'DYZS86', '2025-04-20 10:40:00'),  -- Soledad Guerrero consulta nuevamente
('21092587-2', 'XKTP17', '2025-04-22 12:55:00'),  -- Hernán Vásquez consulta nuevamente
('22640435-K', 'ELCT45', '2025-04-25 14:30:00'),  -- Francisco Torres consulta nuevamente
('6047126-6', 'HYBR89', '2025-04-26 16:45:00'),   -- Claudia Moreno consulta nuevamente

-- Consultas adicionales para mayor volumen
('15882609-7', 'BYDD18', '2025-04-27 18:20:00'),  -- María González (tercera consulta)
('14296139-3', 'DVGF33', '2025-04-28 20:35:00'),  -- Carlos Rodríguez (tercera consulta)
('21942260-1', 'ZDBX97', '2025-04-29 22:10:00');  -- Ana Morales (tercera consulta)