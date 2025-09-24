CREATE DATABASE IF NOT EXISTS sii_db;
USE sii_db;

CREATE TABLE TASACION_FISCAL (
    codigo_sii VARCHAR(20) PRIMARY KEY,
    tipo VARCHAR(50),
    anio INT,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    version VARCHAR(50),
    combustible VARCHAR(30),
    cilindrada INT,
    potencia INT,
    marchas INT,
    transmision VARCHAR(30),
    traccion VARCHAR(30),
    puertas INT,
    pais VARCHAR(50),
    equipamiento VARCHAR(100),
    tasacion INT,
    num_ejes INT,
    valor_permiso INT
);

CREATE TABLE FACTURA_COMPRA (
    num_factura INT PRIMARY KEY,
    precio_neto INT,
    puertas INT,
    asientos INT,
    combustible VARCHAR(30),
    peso INT,
    transmision VARCHAR(30),
    traccion VARCHAR(30),
    cilindrada INT,
    carga INT,
    tipo_sello VARCHAR(30),
    tipo_vehiculo VARCHAR(50),
    marca VARCHAR(50),
    modelo VARCHAR(50),
    num_chasis VARCHAR(50),
    num_motor VARCHAR(50),
    color VARCHAR(30),
    anio INT
);

INSERT INTO TASACION_FISCAL (codigo_sii, tipo, anio, marca, modelo, version, combustible, cilindrada, potencia, marchas, transmision, traccion, puertas, pais, equipamiento, tasacion, num_ejes, valor_permiso) VALUES

-- Sedanes y Hatchbacks
('SD428391', 'Sedán', 2023, 'Toyota', 'Corolla', 'XEI', 'Gasolina', 1800, 140, 6, 'Automática', '4x2', 4, 'Japón', 'Aire Acondicionado, ABS', 12500000, 2, 125000),
('SD756182', 'Sedán', 2022, 'Honda', 'Civic', 'EX', 'Gasolina', 1500, 130, 5, 'Manual', '4x2', 4, 'Japón', 'Radio, Cierre Centralizado', 9800000, 2, 98000),
('HB651473', 'Hatchback', 2021, 'Volkswagen', 'Golf', 'Trendline', 'Gasolina', 1400, 125, 6, 'Manual', '4x2', 5, 'Alemania', 'Bluetooth, Control Crucero', 8500000, 2, 85000),

-- SUVs
('SV293847', 'SUV', 2024, 'Hyundai', 'Tucson', 'Limited', 'Gasolina', 2000, 155, 6, 'Automática', '4x4', 5, 'Corea', 'GPS, Cámara Retroceso', 18500000, 2, 150000),
('SV468732', 'SUV', 2023, 'Subaru', 'Forester', 'Premium', 'Gasolina', 2500, 182, 8, 'Automática', 'AWD', 5, 'Japón', 'Tracción Integral, Control Estabilidad', 16500000, 2, 135000),

-- Camionetas
('CT384925', 'Camioneta', 2023, 'Ford', 'Ranger', 'XLT', 'Diesel', 3200, 200, 6, 'Manual', '4x4', 4, 'Estados Unidos', 'Barra Antivuelco, Tracción 4x4', 22000000, 2, 175000),
('CT741583', 'Camioneta', 2021, 'Nissan', 'NP300', 'LE', 'Diesel', 2500, 160, 6, 'Manual', '4x4', 4, 'México', 'Baranda Metálica', 14500000, 2, 165000),

-- Motocicletas
('MT492738', 'Motocicleta', 2023, 'Honda', 'CB600F', 'Hornet', 'Gasolina', 600, 102, 6, 'Manual', 'Trasera', 0, 'Japón', 'ABS', 3500000, 2, 25000),
('MT856194', 'Motocicleta', 2022, 'Yamaha', 'YZF-R3', 'Standard', 'Gasolina', 320, 42, 6, 'Manual', 'Trasera', 0, 'Japón', 'Frenos Disco', 2800000, 2, 18000),

-- Vehículos comerciales
('CA837496', 'Camión', 2023, 'Mercedes-Benz', 'Actros', '2645', 'Diesel', 12800, 450, 12, 'Manual', '6x4', 2, 'Alemania', 'Frenos Aire, ABS', 45000000, 3, 280000),
('FG659281', 'Furgón', 2022, 'Iveco', 'Daily', '35S14', 'Diesel', 3000, 140, 6, 'Manual', '4x2', 2, 'Italia', 'Dirección Asistida', 18500000, 2, 195000),

-- ############################################################
-- Datos para la demostración
-- ############################################################

-- Vehículos Jorge Gallardo Contreras (RUT 20961960-1)
-- ('CA521344', 'Camioneta', 2017, 'Foton', 'Midi', 'Standard', 'Gasolina', 1300, 85, 5, 'Manual', '4x2', 2, 'China', 'Radio, Aire Acondicionado', 4500000, 2, 45000),
('SD634452', 'Sedán', 2020, 'Chevrolet', 'Cruze', 'LT', 'Gasolina', 1600, 113, 6, 'Automática', '4x2', 4, 'Estados Unidos', 'Bluetooth, ABS', 7800000, 2, 78000),
('SD635443', 'Sedán', 2019, 'Renault', 'Clio', 'Intens', 'Gasolina', 1200, 75, 5, 'Manual', '4x2', 4, 'Francia', 'Aire Acondicionado, Radio', 6200000, 2, 62000),
('SD654233', 'Hatchback', 2021, 'Kia', 'Rio 3', 'LX', 'Gasolina', 1200, 83, 5, 'Manual', '4x2', 5, 'Corea', 'Bluetooth, Airbags', 3500000, 2, 35000),
-- Vehículo Felipe Vera Andrade (RUT 20857826-K)
('SD542364', 'Sedán', 2018, 'Hyundai', 'Elantra', 'GLS', 'Gasolina', 1600, 126, 6, 'Automática', '4x2', 4, 'Corea', 'Aire Acondicionado, ABS', 6900000, 2, 69000),
-- Vehículos Luis Caro Morales (RUT 20595210-1)
('MT953234', 'Motocicleta', 2020, 'Yamaha', 'YZF-R3', 'Standard', 'Gasolina', 321, 42, 6, 'Manual', 'Trasera', 0, 'Japón', 'Frenos Disco', 2700000, 2, 18000),
('CA623454', 'Camión', 2021, 'Volvo', 'FH16', 'Globetrotter', 'Diesel', 16000, 750, 12, 'Automática', '6x4', 2, 'Suecia', 'Frenos Aire, ABS', 42000000, 3, 260000)

INSERT INTO FACTURA_COMPRA (
    num_factura, precio_neto, puertas, asientos, combustible, 
    peso, transmision, traccion, cilindrada, carga, tipo_sello, 
    tipo_vehiculo, marca, modelo, num_chasis, num_motor, color, anio
) VALUES

-- Vehículos Eléctricos
(1001, 45000000, 5, 5, 'Eléctrico', 1950, 'Automática', '4x2', 0, 0, 'Verde', 
'Sedán', 'Tesla', 'Model 3', 'XP7H2025TE001', 'EL2025001', 'Blanco', 2025),

(1002, 52000000, 5, 7, 'Eléctrico', 2250, 'Automática', 'AWD', 0, 0, 'Verde', 
'SUV', 'Hyundai', 'IONIQ 7', 'KM8H2025HY002', 'EL2025002', 'Plata', 2025),

-- Vehículos Híbridos
(1003, 38500000, 5, 5, 'Híbrido', 1680, 'eCVT', '4x2', 1800, 0, 'Verde', 
'Hatchback', 'Toyota', 'Prius', 'JT3H2025TY003', 'HB2025003', 'Azul', 2025),

(1004, 42000000, 5, 5, 'Híbrido', 1850, 'Automática', 'AWD', 2000, 0, 'Verde', 
'SUV', 'Lexus', 'NX', 'LX4H2025LX004', 'HB2025004', 'Negro', 2025),

-- Vehículos Gasolina
(1005, 28000000, 4, 5, 'Gasolina', 1450, 'Automática', '4x2', 2000, 0, 'Verde', 
'Sedán', 'Honda', 'Civic', 'CIV2025HN005', 'GA2025005', 'Rojo', 2025),

(1006, 35000000, 5, 5, 'Gasolina', 1680, 'Automática', '4x4', 2500, 0, 'Verde', 
'SUV', 'Mazda', 'CX-5', 'MZ5H2025MZ006', 'GA2025006', 'Gris', 2025),

-- Vehículos Diesel
(1007, 48000000, 4, 5, 'Diesel', 2200, 'Automática', '4x4', 3000, 1000, 'Verde', 
'Camioneta', 'Ford', 'Ranger', 'RNG2025FR007', 'DI2025007', 'Azul Marino', 2025),

(1008, 55000000, 4, 5, 'Diesel', 2300, 'Automática', '4x4', 2800, 1200, 'Verde', 
'Camioneta', 'Toyota', 'Hilux', 'HIL2025TY008', 'DI2025008', 'Plateado', 2025),

-- Vehículos Comerciales
(1009, 32000000, 5, 3, 'Diesel', 2500, 'Manual', '4x2', 2200, 2000, 'Verde', 
'Furgón', 'Mercedes-Benz', 'Sprinter', 'SPR2025MB009', 'DI2025009', 'Blanco', 2025),

(1010, 25000000, 2, 3, 'Diesel', 2800, 'Manual', '4x2', 2500, 3500, 'Verde', 
'Furgón', 'Peugeot', 'Boxer', 'BOX2025PG010', 'DI2025010', 'Blanco', 2025),

-- ############################################################
-- Datos para la demostración
-- ############################################################
(1011, 4500000, 2, 2, 'Gasolina', 1300, 'Manual', '4x2', 1300, 0, 'Verde', 'Camioneta', 'Foton', 'Midi', 'CH1249123412d23', '4123523', 'Plateado', 2025);