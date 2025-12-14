-- Si aún no existe la base de datos
CREATE DATABASE IF NOT EXISTS mtt_db;
USE mtt_db;

-- Crear la tabla MULTAS_RPI
CREATE TABLE IF NOT EXISTS multas_rpi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(12) NOT NULL,
    rol_causa VARCHAR(20) NOT NULL,
    anio_causa INT NOT NULL,
    nombre_jpl VARCHAR(80) NOT NULL,
    monto_multa INT NOT NULL
);

CREATE TABLE IF NOT EXISTS reg_transporte (
    ppu VARCHAR(10) PRIMARY KEY,
    fecha_entrada_rnt DATE NOT NULL,
    tipo_servicio VARCHAR(30) NOT NULL,
    capacidad INT NOT NULL,
    estado_vehiculo VARCHAR(30) NOT NULL,
    fecha_vencimiento_certificado DATE NOT NULL,
    region INT NOT NULL,
    anio_fabricacion INT NOT NULL,
    cinturon_obligatorio BOOLEAN NOT NULL,
    antiguedad_vehiculo INT NOT NULL,
    marca VARCHAR(30) NOT NULL,
    modelo VARCHAR(30) NOT NULL
);

-- Índice para búsquedas rápidas por RUT
CREATE INDEX idx_multa_rut ON multas_rpi (rut);
CREATE INDEX idx_transporte_ppu ON reg_transporte (ppu);

INSERT INTO multas_rpi (rut, rol_causa, anio_causa, nombre_jpl, monto_multa) VALUES

-- Ana Morales Torres (2 multas)
('21942260-1', '1234-5-2025', 2025, 'Juzgado de Policía Local de Las Condes', 35000),
('21942260-1', '2468-3-2025', 2025, 'Juzgado de Policía Local de Santiago', 50000),

-- Pedro Sánchez López (1 multa)
('17126452-9', '3579-2-2025', 2025, 'Juzgado de Policía Local de Providencia', 45000),

-- Isabel Herrera Ruiz (3 multas)
('13202473-1', '4680-1-2025', 2025, 'Juzgado de Policía Local de Ñuñoa', 25000),
('13202473-1', '5791-4-2025', 2025, 'Juzgado de Policía Local de La Florida', 30000),
('13202473-1', '6802-7-2025', 2025, 'Juzgado de Policía Local de Vitacura', 40000),

-- Roberto Jiménez Castro (1 multa)
('3260766-7', '7913-9-2025', 2025, 'Juzgado de Policía Local de Maipú', 55000),

-- Claudia Moreno Vega (2 multas)
('6047126-6', '8024-8-2025', 2025, 'Juzgado de Policía Local de La Reina', 28000),
('6047126-6', '9135-6-2025', 2025, 'Juzgado de Policía Local de Lo Barnechea', 42000),

-- Miguel Vargas Díaz (1 multa)
('12711955-4', '1246-5-2025', 2025, 'Juzgado de Policía Local de San Miguel', 38000),

-- Carmen Reyes Fernández (2 multas)
('7978316-1', '2357-3-2025', 2025, 'Juzgado de Policía Local de Quinta Normal', 32000),
('7978316-1', '3468-1-2025', 2025, 'Juzgado de Policía Local de Estación Central', 46000),

-- Francisco Torres Medina (1 multa)
('22640435-K', '4579-9-2025', 2025, 'Juzgado de Policía Local de Puente Alto', 52000),

-- ############################################################
-- Datos para la demostración
-- ############################################################
-- Felipe Vera Andrade (3 multas)
('20857826-K', '5678-2-2025', 2025, 'Juzgado de Policía Local de Ñuñoa', 30000),
('20857826-K', '7890-3-2025', 2025, 'Juzgado de Policía Local de La Florida', 40000),
('20857826-K', '6789-4-2025', 2025, 'Juzgado de Policía Local de La Florida', 45000);

INSERT INTO reg_transporte (ppu, fecha_entrada_rnt, tipo_servicio, capacidad, estado_vehiculo, fecha_vencimiento_certificado, region, anio_fabricacion, cinturon_obligatorio, antiguedad_vehiculo, marca, modelo) VALUES
('AB1234', '2025-01-01', 'Transporte de Pasajeros', 50, 'Activo', '2025-12-31', 13, 2020, TRUE, 5, 'Mercedes-Benz', 'Sprinter'),
('CD5678', '2025-02-01', 'Transporte de Carga', 20, 'Inactivo', '2025-06-30', 5, 2018, FALSE, 7, 'Volvo', 'FH'),
('EF9012', '2025-03-01', 'Transporte Escolar', 30, 'Activo', '2025-12-31', 7, 2021, TRUE, 4, 'Chevrolet', 'Express');