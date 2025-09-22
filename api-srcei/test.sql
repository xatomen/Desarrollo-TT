-- Poblar tabla PADRON con datos de vehículos
INSERT INTO PADRON (PPU, RUT, NOMBRE, TIPO_VEHICULO, MARCA, MODELO, ANIO, COLOR, CILINDRADA, NUM_MOTOR, NUM_CHASIS, FECHA_INSCRIPCION) VALUES
-- Vehículos nuevos (patentes formato nuevo)
('BYDD18', '15882609-7', 'Francisco Torres Medina', 'Automóvil', 'Toyota', 'Corolla', 2023, 'Blanco', 1800, '123456', 'WBA3A5C58DF123456', '2024-03-15'),
('DVGF33', '14296139-3', 'Carolina Rivas Soto', 'Automóvil', 'Honda', 'Civic', 2022, 'Negro', 1500, '234567', 'JH4KA8260MC123457', '2024-02-20'),
('ZDBX97', '21942260-1', 'Luis Martínez Paredes', 'SUV', 'Hyundai', 'Tucson', 2024, 'Rojo', 2000, '345678', 'KMHD84LF5DU123458', '2024-01-10'),
('CVDT73', '17126452-9', 'María Fernanda López', 'Hatchback', 'Volkswagen', 'Golf', 2021, 'Azul', 1400, '456789', 'WVWZZZ3CZDE123459', '2024-04-05'),
('JXPJ52', '13202473-1', 'Jorge Pérez Salinas', 'Camioneta', 'Ford', 'Ranger', 2023, 'Verde', 3200, '567890', '1HGBH41JXMN123460', '2024-03-25'),
('RWTW63', '3260766-7', 'Valentina Díaz Rojas', 'Station Wagon', 'Suzuki', 'Swift', 2020, 'Gris', 1200, '678901', 'JTEBU17R870123461', '2024-02-14'),
('WXLP42', '6047126-6', 'Pedro González Mena', 'Sedán', 'BMW', 'Serie 3', 2022, 'Plata', 2000, '789012', 'WBAVB13506PT23462', '2024-01-30'),
('BBZB15', '12711955-4', 'Camila Herrera Soto', 'Hatchback', 'Kia', 'Rio', 2021, 'Amarillo', 1400, '890123', 'KNDJC733385123463', '2024-03-08'),
('HXPY38', '7978316-1', 'Felipe Morales Ruiz', 'SUV', 'Subaru', 'Forester', 2023, 'Café', 2500, '901234', 'JF1GD29607G423464', '2024-04-12'),
('FPHC43', '22640435-K', 'Daniela Castro Peña', 'Compacto', 'Smart', 'ForTwo', 2020, 'Naranja', 1000, '123450', 'WMEEJ31X04K123465', '2024-02-28'),

-- Vehículos antiguos (patentes formato antiguo)
('DI8521', '20451369-4', 'Ignacio Silva Torres', 'Automóvil', 'Nissan', 'Sentra', 2015, 'Blanco', 1600, '234561', 'WBAFW31080LE23466', '2024-01-15'),
('EA9529', '3171990-9', 'Andrea Muñoz Reyes', 'Automóvil', 'Chevrolet', 'Aveo', 2014, 'Azul', 1400, '345672', 'JHMFA36259S123467', '2024-03-01'),
('WA9253', '17806473-8', 'Rodrigo Fuentes Díaz', 'SUV', 'Jeep', 'Cherokee', 2016, 'Negro', 2400, '456783', 'WAUZZZ8K2DA123468', '2024-02-10'),
('HS6882', '13280417-6', 'Sofía Vargas Pino', 'Hatchback', 'Hyundai', 'Accent', 2013, 'Rojo', 1400, '567894', 'JN1AZ34D45M123469', '2024-04-18'),
('LV3154', '11377973-K', 'Tomás Castillo León', 'Station Wagon', 'Peugeot', '308', 2017, 'Verde', 1600, '678905', 'WBAVB73557PT23470', '2024-01-25'),
('TR3542', '5330999-2', 'Martina Rojas Silva', 'Automóvil', 'Mazda', 'Mazda3', 2015, 'Gris', 1600, '789016', 'SAJWA0FS4FP623471', '2024-03-12'),
('ZJ9488', '7330303-6', 'Gabriel Soto Araya', 'SUV', 'Mitsubishi', 'Outlander', 2016, 'Plata', 2400, '890127', 'KMHFG4JG0GA123472', '2024-02-08'),
('ZH2985', '19975152-2', 'Josefa Peña Carrasco', 'Hatchback', 'Toyota', 'Yaris', 2012, 'Café', 1300, '901238', 'JTDBT4K3XAJ123473', '2024-04-03'),
('TJ4152', '15021408-4', 'Vicente Herrera Díaz', 'Automóvil', 'Volkswagen', 'Polo', 2017, 'Blanco', 1600, '123459', 'WVWZZZ1JZ2W123474', '2024-01-08'),
('GK6762', '20083916-1', 'Antonia Ramírez Soto', 'Sedán', 'Honda', 'City', 2014, 'Azul', 1500, '234560', 'JHMGE8H58CC123475', '2024-03-20'),

-- Motocicletas nuevas
('TD124', '13356808-5', 'Cristóbal Paredes Vera', 'Motocicleta', 'Honda', 'CB600F', 2023, 'Negro', 600, '112233', 'JH2RC50A5GM123476', '2024-02-15'),
('SJ598', '19599582-6', 'Valeria Contreras Ruiz', 'Motocicleta', 'Yamaha', 'YZF-R3', 2022, 'Rojo', 320, '223344', 'JYARN23E5GA123477', '2024-03-10'),
('VR394', '24044863-7', 'Matías Espinoza Díaz', 'Motocicleta', 'Kawasaki', 'Ninja 300', 2023, 'Azul', 300, '334455', 'ZA2EE2400ES123478', '2024-01-22'),
('SP618', '13969750-2', 'Javiera Morales Peña', 'Motocicleta', 'Suzuki', 'GSX250R', 2022, 'Blanco', 250, '445566', 'VBKMA2110CM123479', '2024-04-07'),
('KV215', '21425248-1', 'Sebastián Reyes Soto', 'Motocicleta', 'Ducati', 'Monster 797', 2023, 'Verde', 800, '556677', 'MD2JE2419AS123480', '2024-02-28'),

-- Motocicletas antiguas
('JY580', '16759027-6', 'Camilo Salinas Rivas', 'Motocicleta', 'Honda', 'CB125', 2015, 'Negro', 125, '667788', 'JH2RC30A8BM123481', '2024-01-18'),
('DP676', '13780657-6', 'Paula Fuenzalida Díaz', 'Motocicleta', 'Yamaha', 'XTZ125', 2016, 'Rojo', 125, '778899', 'JYAVP08E7DA123482', '2024-03-05'),
('PT759', '9413435-8', 'Felipe Navarro Pino', 'Motocicleta', 'Kawasaki', 'KLX110', 2014, 'Azul', 110, '889900', 'ZA2UR0A03DS123483', '2024-02-12'),
('ZD933', '23229217-2', 'María José Ríos', 'Motocicleta', 'Suzuki', 'EN125', 2017, 'Blanco', 125, '990011', 'VBKUA1810FM123484', '2024-04-15'),
('WZ664', '12610661-0', 'Ignacio Bravo Soto', 'Motocicleta', 'Benelli', 'TNT150', 2016, 'Gris', 150, '111222', 'MD2TE0918GS123485', '2024-01-09'),

-- Camiones y vehículos comerciales
('CYSP27', '7035758-5', 'Patricio Gutiérrez León', 'Camión', 'Mercedes-Benz', 'Actros', 2023, 'Blanco', 12800, '445567', 'WDB9635321L123486', '2024-03-18'),
('HVKC58', '18066062-3', 'Gabriela Soto Rivas', 'Furgón', 'Iveco', 'Daily', 2022, 'Azul', 3000, '556678', 'WJME2NTH508123487', '2024-02-05'),
('HLZC93', '23902784-9', 'Rodrigo Pino Herrera', 'Camioneta', 'Nissan', 'NP300', 2021, 'Gris', 2500, '667789', 'JN1TBNT22U0123488', '2024-01-12'),
('DYZS86', '21494931-8', 'María Paz Salinas', 'Minibús', 'Iveco', 'Daily Minibus', 2023, 'Amarillo', 3000, '778890', 'WJMM62FT20C123489', '2024-04-08'),
('XKTP17', '21092587-2', 'Joaquín Morales Díaz', 'Furgón', 'Ford', 'Transit', 2022, 'Rojo', 2200, '889901', 'WJME62EU20C123490', '2024-03-22'),
('HFXX27', '20961960-1', 'Jorge Gallardo Contreras', 'Camioneta', 'Foton', 'Midi', 2017, 'Plateado', 1300, '4123523', 'CH1249123412d23', '2025-09-07');

-- Poblar tabla MULTAS_TRANSITO con multas asociadas a las patentes
-- Algunas patentes tendrán múltiples multas para demostrar el conteo
INSERT INTO MULTAS_TRANSITO (PPU, ROL_CAUSA, JPL) VALUES
-- Multas para vehículos nuevos
('BYDD18', 2024001, 'JPL Santiago'), -- Toyota Corolla - 1 multa
('BYDD18', 2024052, 'JPL Providencia'), -- Toyota Corolla - 2da multa
('DVGF33', 2024003, 'JPL Santiago'), -- Honda Civic - 1 multa
('ZDBX97', 2024004, 'JPL Maipú'), -- Hyundai Tucson - 1 multa
('ZDBX97', 2024035, 'JPL Santiago'), -- Hyundai Tucson - 2da multa
('ZDBX97', 2024067, 'JPL Providencia'), -- Hyundai Tucson - 3ra multa
('CVDT73', 2024005, 'JPL Providencia'), -- Volkswagen Golf - 1 multa
('JXPJ52', 2024006, 'JPL Santiago'), -- Ford Ranger - 1 multa
('JXPJ52', 2024028, 'JPL Maipú'), -- Ford Ranger - 2da multa
('WXLP42', 2024007, 'JPL Providencia'), -- BMW Serie 3 - 1 multa
('BBZB15', 2024008, 'JPL Santiago'), -- Kia Rio - 1 multa
('BBZB15', 2024041, 'JPL Providencia'), -- Kia Rio - 2da multa
('BBZB15', 2024073, 'JPL Maipú'), -- Kia Rio - 3ra multa
('BBZB15', 2024089, 'JPL Santiago'), -- Kia Rio - 4ta multa
('HXPY38', 2024009, 'JPL Maipú'), -- Subaru Forester - 1 multa

-- Multas para vehículos antiguos
('DI8521', 2024010, 'JPL Santiago'), -- Nissan Sentra - 1 multa
('EA9529', 2024011, 'JPL Providencia'), -- Chevrolet Aveo - 1 multa
('EA9529', 2024046, 'JPL Maipú'), -- Chevrolet Aveo - 2da multa
('WA9253', 2024012, 'JPL Santiago'), -- Jeep Cherokee - 1 multa
('WA9253', 2024033, 'JPL Providencia'), -- Jeep Cherokee - 2da multa
('HS6882', 2024013, 'JPL Maipú'), -- Hyundai Accent - 1 multa
('HS6882', 2024059, 'JPL Santiago'), -- Hyundai Accent - 2da multa
('HS6882', 2024084, 'JPL Providencia'), -- Hyundai Accent - 3ra multa
('LV3154', 2024014, 'JPL Providencia'), -- Peugeot 308 - 1 multa
('TR3542', 2024015, 'JPL Santiago'), -- Mazda Mazda3 - 1 multa
('ZJ9488', 2024016, 'JPL Maipú'), -- Mitsubishi Outlander - 1 multa
('ZJ9488', 2024055, 'JPL Santiago'), -- Mitsubishi Outlander - 2da multa
('ZH2985', 2024017, 'JPL Providencia'), -- Toyota Yaris - 1 multa
('TJ4152', 2024018, 'JPL Santiago'), -- Volkswagen Polo - 1 multa
('TJ4152', 2024062, 'JPL Maipú'), -- Volkswagen Polo - 2da multa
('GK6762', 2024019, 'JPL Providencia'), -- Honda City - 1 multa

-- Multas para motocicletas
('TD124', 2024020, 'JPL Santiago'), -- Honda CB600F - 1 multa
('SJ598', 2024021, 'JPL Providencia'), -- Yamaha YZF-R3 - 1 multa
('SJ598', 2024049, 'JPL Maipú'), -- Yamaha YZF-R3 - 2da multa
('VR394', 2024022, 'JPL Santiago'), -- Kawasaki Ninja 300 - 1 multa
('KV215', 2024023, 'JPL Providencia'), -- Ducati Monster 797 - 1 multa
('KV215', 2024071, 'JPL Santiago'), -- Ducati Monster 797 - 2da multa
('JY580', 2024024, 'JPL Maipú'), -- Honda CB125 - 1 multa
('DP676', 2024025, 'JPL Santiago'), -- Yamaha XTZ125 - 1 multa
('DP676', 2024058, 'JPL Providencia'), -- Yamaha XTZ125 - 2da multa
('DP676', 2024077, 'JPL Maipú'), -- Yamaha XTZ125 - 3ra multa
('PT759', 2024026, 'JPL Providencia'), -- Kawasaki KLX110 - 1 multa
('ZD933', 2024027, 'JPL Santiago'), -- Suzuki EN125 - 1 multa

-- Multas para vehículos comerciales
('CYSP27', 2024029, 'JPL Maipú'), -- Mercedes-Benz Actros - 1 multa
('CYSP27', 2024064, 'JPL Santiago'), -- Mercedes-Benz Actros - 2da multa
('CYSP27', 2024081, 'JPL Providencia'), -- Mercedes-Benz Actros - 3ra multa
('HVKC58', 2024030, 'JPL Providencia'), -- Iveco Daily - 1 multa
('HLZC93', 2024031, 'JPL Santiago'), -- Nissan NP300 - 1 multa
('HLZC93', 2024053, 'JPL Maipú'), -- Nissan NP300 - 2da multa
('DYZS86', 2024032, 'JPL Providencia'), -- Iveco Daily Minibus - 1 multa
('DYZS86', 2024069, 'JPL Santiago'), -- Iveco Daily Minibus - 2da multa
('DYZS86', 2024086, 'JPL Maipú'), -- Iveco Daily Minibus - 3ra multa
('DYZS86', 2024092, 'JPL Providencia'), -- Iveco Daily Minibus - 4ta multa
('XKTP17', 2024034, 'JPL Santiago'); -- Ford Transit - 1 multa
