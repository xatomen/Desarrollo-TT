-- Datos de prueba para la tabla permiso_circulacion
USE back_db;

INSERT INTO permiso_circulacion (
    ppu, rut, nombre, fecha_emision, fecha_expiracion, valor_permiso, motor, chasis, 
    tipo_vehiculo, color, marca, modelo, anio, carga, tipo_sello, combustible, 
    cilindrada, transmision, pts, ast, equipamiento, codigo_sii, tasacion
) VALUES

-- Vehículos particulares formato nuevo (2025)
('BYDD18', '15882609-7', 'María González Pérez', '2025-03-15', '2026-03-15', 125000, 123456, 'WBA3A5C58DF123456', 'Automóvil', 'Blanco', 'Toyota', 'Corolla', 2025, 0, 'Verde', 'Gasolina', 1800, 'Automática', 5, 5, 'Aire Acondicionado, ABS', 'SD428391', 12500000),

('DVGF33', '14296139-3', 'Carlos Rodríguez Silva', '2025-02-20', '2026-02-20', 98000, 234567, 'JH4KA8260MC123457', 'Automóvil', 'Negro', 'Honda', 'Civic', 2024, 0, 'Verde', 'Gasolina', 1500, 'Manual', 4, 5, 'Radio, Cierre Centralizado', 'SD756182', 9800000),

('ZDBX97', '21942260-1', 'Ana Morales Torres', '2025-01-10', '2026-01-10', 150000, 345678, 'KMHD84LF5DU123458', 'SUV', 'Rojo', 'Hyundai', 'Tucson', 2025, 0, 'Verde', 'Gasolina', 2000, 'Automática', 5, 7, 'GPS, Cámara Retroceso', 'SV293847', 18500000),

('CVDT73', '17126452-9', 'Pedro Sánchez López', '2025-04-05', '2026-04-05', 85000, 456789, 'WVWZZZ3CZDE123459', 'Hatchback', 'Azul', 'Volkswagen', 'Golf', 2024, 0, 'Verde', 'Gasolina', 1400, 'Manual', 5, 5, 'Bluetooth, Control Crucero', 'HB651473', 8500000),

('JXPJ52', '13202473-1', 'Isabel Herrera Ruiz', '2025-03-25', '2026-03-25', 175000, 567890, '1HGBH41JXMN123460', 'Camioneta', 'Verde', 'Ford', 'Ranger', 2025, 1500, 'Verde', 'Diesel', 3200, 'Manual', 4, 5, 'Barra Antivuelco, Tracción 4x4', 'CT384925', 22000000),

-- Vehículos formato antiguo
('DI8521', '20451369-4', 'Eduardo Silva Herrera', '2025-01-15', '2026-01-15', 45000, 234561, 'WBAFW31080LE23466', 'Automóvil', 'Blanco', 'Nissan', 'Sentra', 2020, 0, 'Verde', 'Gasolina', 1600, 'Manual', 4, 5, 'Radio, Dirección Asistida', 'SD583926', 4500000),

('EA9529', '3171990-9', 'Gloria Martínez Rojas', '2025-03-01', '2026-03-01', 38000, 345672, 'JHMFA36259S123467', 'Automóvil', 'Azul', 'Chevrolet', 'Aveo', 2019, 0, 'Verde', 'Gasolina', 1400, 'Manual', 4, 5, 'Elevavidrios Eléctricos', 'SD647283', 3800000),

('WA9253', '17806473-8', 'Andrés Flores Gutiérrez', '2025-02-10', '2026-02-10', 52000, 456783, 'WAUZZZ8K2DA123468', 'SUV', 'Negro', 'Jeep', 'Cherokee', 2021, 0, 'Verde', 'Gasolina', 2400, 'Automática', 5, 5, 'Tracción 4x4, Aire Acondicionado', 'SV829461', 8500000),

('HS6882', '13280417-6', 'Mónica Castillo Pinto', '2025-04-18', '2026-04-18', 41000, 567894, 'JN1AZ34D45M123469', 'Hatchback', 'Rojo', 'Hyundai', 'Accent', 2018, 0, 'Verde', 'Gasolina', 1400, 'Manual', 5, 5, 'Radio CD', 'HB714592', 4100000),

('LV3154', '11377973-K', 'Raúl Guerrero Soto', '2025-01-25', '2026-01-25', 62000, 678905, 'WBAVB73557PT23470', 'Station Wagon', 'Verde', 'Peugeot', '308', 2022, 0, 'Verde', 'Gasolina', 1600, 'Manual', 5, 5, 'Computadora de Viaje', 'HB385726', 6200000),

-- Motocicletas
('TD124', '13356808-5', 'Diego Herrera Santos', '2025-02-15', '2026-02-15', 25000, 112233, 'JH2RC50A5GM123476', 'Motocicleta', 'Negro', 'Honda', 'CB600F', 2024, 0, 'Verde', 'Gasolina', 600, 'Manual', 0, 2, 'ABS', 'MT492738', 3500000),

('SJ598', '19599582-6', 'Camila Lagos Rivera', '2025-03-10', '2026-03-10', 18000, 223344, 'JYARN23E5GA123477', 'Motocicleta', 'Rojo', 'Yamaha', 'YZF-R3', 2023, 0, 'Verde', 'Gasolina', 320, 'Manual', 0, 2, 'Frenos Disco', 'MT856194', 2800000),

('VR394', '24044863-7', 'Nicolás Campos Torres', '2025-01-22', '2026-01-22', 22000, 334455, 'ZA2EE2400ES123478', 'Motocicleta', 'Azul', 'Kawasaki', 'Ninja 300', 2024, 0, 'Verde', 'Gasolina', 300, 'Manual', 0, 2, 'Sistema de Inyección', 'MT374529', 3200000),

-- Vehículos comerciales
('CYSP27', '7035758-5', 'Ricardo Mendoza Castro', '2025-03-18', '2026-03-18', 280000, 445567, 'WDB9635321L123486', 'Camión', 'Blanco', 'Mercedes-Benz', 'Actros', 2024, 15000, 'Verde', 'Diesel', 12800, 'Manual', 2, 3, 'Frenos Aire, ABS', 'CA837496', 45000000),

('HVKC58', '18066062-3', 'Alejandra Fuentes López', '2025-02-05', '2026-02-05', 195000, 556678, 'WJME2NTH508123487', 'Furgón', 'Azul', 'Iveco', 'Daily', 2023, 3500, 'Verde', 'Diesel', 3000, 'Manual', 2, 3, 'Dirección Asistida', 'FG659281', 18500000),

('HLZC93', '23902784-9', 'Cristián Paredes Muñoz', '2025-01-12', '2026-01-12', 165000, 667789, 'JN1TBNT22U0123488', 'Camioneta', 'Gris', 'Nissan', 'NP300', 2024, 1200, 'Verde', 'Diesel', 2500, 'Manual', 4, 5, 'Baranda Metálica', 'CT741583', 14500000),

('DYZS86', '21494931-8', 'Soledad Guerrero Núñez', '2025-04-08', '2026-04-08', 225000, 778890, 'WJMM62FT20C123489', 'Minibús', 'Amarillo', 'Iveco', 'Daily Minibus', 2024, 0, 'Verde', 'Diesel', 3000, 'Manual', 2, 19, 'Aire Acondicionado, 19 Asientos', 'MU426973', 28000000),

('XKTP17', '21092587-2', 'Hernán Vásquez Silva', '2025-03-22', '2026-03-22', 145000, 889901, 'WJME62EU20C123489', 'Furgón', 'Rojo', 'Ford', 'Transit', 2023, 2000, 'Verde', 'Diesel', 2200, 'Manual', 2, 3, 'Sensor Estacionamiento', 'FG584726', 16200000),

-- Vehículos eléctricos e híbridos
('ELCT45', '22640435-K', 'Francisco Torres Medina', '2025-02-28', '2026-02-28', 185000, 234567, 'WMEEJ31X04K123465', 'Automóvil', 'Blanco', 'Tesla', 'Model 3', 2025, 0, 'Verde', 'Eléctrico', 0, 'Automática', 4, 5, 'Piloto Automático, Pantalla Touch', 'EL582739', 35000000),

('HYBR89', '6047126-6', 'Claudia Moreno Vega', '2025-01-30', '2026-01-30', 160000, 345678, 'JTDKN3DU7A0123466', 'Hatchback', 'Azul', 'Toyota', 'Prius', 2025, 0, 'Verde', 'Híbrido', 1800, 'eCVT', 5, 5, 'Sistema Híbrido, Pantalla', 'HY471826', 25000000),

-- Datos históricos (2024)
('HIST12', '12711955-4', 'Miguel Vargas Díaz', '2024-03-08', '2025-03-08', 95000, 890123, 'KNDJC733385123463', 'Hatchback', 'Amarillo', 'Kia', 'Rio', 2023, 0, 'Verde', 'Gasolina', 1400, 'Manual', 5, 5, 'Aire Acondicionado', 'HB742591', 9500000),

('HIST34', '7978316-1', 'Carmen Reyes Fernández', '2024-04-12', '2025-04-12', 135000, 901234, 'JF1GD29607G423464', 'SUV', 'Café', 'Subaru', 'Forester', 2024, 0, 'Verde', 'Gasolina', 2500, 'Automática', 5, 5, 'Tracción Integral, Control Estabilidad', 'SV468732', 16500000);

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