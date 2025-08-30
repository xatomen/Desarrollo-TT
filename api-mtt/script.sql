-- Si aún no existe la base de datos
CREATE DATABASE IF NOT EXISTS mtt_db;
USE mtt_db;

-- Crear la tabla MULTAS_RPI
CREATE TABLE IF NOT EXISTS MULTAS_RPI (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(12) NOT NULL,
    rol_causa VARCHAR(20) NOT NULL,
    anio_causa INT NOT NULL,
    nombre_jpl VARCHAR(80) NOT NULL,
    monto_multa INT NOT NULL
);

CREATE TABLE IF NOT EXISTS REG_TRANSPORTE (
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
CREATE INDEX idx_multa_rut ON MULTAS_RPI (rut);
CREATE INDEX idx_transporte_ppu ON REG_TRANSPORTE (ppu);