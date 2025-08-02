-- Si aún no existe la base de datos
CREATE DATABASE IF NOT EXISTS MTT;
USE MTT;

-- Crear la tabla MULTAS_RPI
CREATE TABLE IF NOT EXISTS MULTAS_RPI (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(12) NOT NULL,
    rol_causa VARCHAR(20) NOT NULL,
    anio_causa INT NOT NULL,
    nombre_jpl VARCHAR(80) NOT NULL,
    monto_multa INT NOT NULL
);

-- Índice para búsquedas rápidas por RUT
CREATE INDEX idx_multa_rut ON MULTAS_RPI (rut);
