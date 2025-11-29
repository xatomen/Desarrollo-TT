-- Script de creación de base de datos y tablas para la API de AACH

CREATE DATABASE IF NOT EXISTS aach_db;

USE aach_db;

CREATE TABLE IF NOT EXISTS soap (
    NUM_POLIZA INT AUTO_INCREMENT PRIMARY KEY NOT NULL UNIQUE,
    PPU VARCHAR(10) NOT NULL,
    COMPANIA VARCHAR(50) NOT NULL,
    RIGE_DESDE DATETIME NOT NULL,
    RIGE_HASTA DATETIME NOT NULL,
    PRIMA INT NOT NULL
);

-- Script SQL para cargar datos de prueba en la tabla soap
-- 30 registros organizados por vigencia y tipo de vehículo/formato
-- Primas ajustadas entre 4.000 y 15.000 - Sin horas en las fechas

USE aach_db; -- Reemplaza con el nombre real de tu base de datos

INSERT INTO soap (ppu, compania, rige_desde, rige_hasta, prima) VALUES

-- ====================================================================
-- REGISTROS VIGENTES (24 registros - 80%)
-- ====================================================================

-- AUTOS - FORMATO ANTIGUO (AA1234) - 6 registros
('AB1234', 'Consorcio', '2025-01-15', '2026-01-15', 12500), -- Auto - Formato Antiguo
('CD5678', 'BCI Seguros', '2025-02-20', '2026-02-20', 9800), -- Auto - Formato Antiguo
('EF9012', 'HDI Seguros', '2025-05-12', '2026-05-12', 11200), -- Auto - Formato Antiguo
('GH3456', 'Sura', '2025-07-14', '2026-07-14', 8900), -- Auto - Formato Antiguo
('BK7890', 'Mapfre', '2025-09-01', '2026-09-01', 10500), -- Auto - Formato Antiguo
('LN4567', 'Liberty Seguros', '2025-12-01', '2026-12-01', 9300), -- Auto - Formato Antiguo

-- AUTOS - FORMATO NUEVO (BBBB12) - 12 registros
('BCDF12', 'Consorcio', '2025-03-10', '2026-03-10', 13200), -- Auto - Formato Nuevo
('GHJK34', 'BCI Seguros', '2025-04-05', '2026-04-05', 14800), -- Auto - Formato Nuevo
('LPRS56', 'HDI Seguros', '2025-06-08', '2026-06-08', 12800), -- Auto - Formato Nuevo
('TVWX78', 'Sura', '2025-08-22', '2026-08-22', 13900), -- Auto - Formato Nuevo
('ZBCD90', 'Mapfre', '2025-10-15', '2026-10-15', 12100), -- Auto - Formato Nuevo
('FGHJ12', 'Liberty Seguros', '2025-11-03', '2026-11-03', 13500), -- Auto - Formato Nuevo
('KLPR89', 'Consorcio', '2025-01-30', '2026-01-30', 15000), -- Auto - Formato Nuevo
('STVW45', 'BCI Seguros', '2025-03-25', '2026-03-25', 13100), -- Auto - Formato Nuevo
('XYZB11', 'HDI Seguros', '2025-05-28', '2026-05-28', 14200), -- Auto - Formato Nuevo
('CDFG89', 'Sura', '2025-08-14', '2026-08-14', 14500), -- Auto - Formato Nuevo
('HJKL34', 'Mapfre', '2025-10-05', '2026-10-05', 12700), -- Auto - Formato Nuevo
('PRTV56', 'Liberty Seguros', '2025-11-18', '2026-11-18', 11800), -- Auto - Formato Nuevo

-- MOTOS - FORMATO ANTIGUO (AA123) - 3 registros
('BC123', 'Consorcio', '2025-01-20', '2026-01-20', 6500), -- Moto - Formato Antiguo
('DF234', 'BCI Seguros', '2025-02-15', '2026-02-15', 7200), -- Moto - Formato Antiguo
('GH567', 'HDI Seguros', '2025-07-07', '2026-07-07', 5800), -- Moto - Formato Antiguo

-- MOTOS - FORMATO NUEVO (AAA12) - 3 registros
('KLM12', 'Sura', '2025-09-20', '2026-09-20', 6800), -- Moto - Formato Nuevo
('GHJ34', 'Mapfre', '2025-04-18', '2026-04-18', 5500), -- Moto - Formato Nuevo
('PRT56', 'Liberty Seguros', '2025-06-12', '2026-06-12', 6200), -- Moto - Formato Nuevo

-- ====================================================================
-- REGISTROS NO VIGENTES (6 registros - 20%)
-- ====================================================================

-- AUTOS - FORMATO ANTIGUO (AA1234) - 2 registros
('PR4567', 'Consorcio', '2023-01-20', '2024-01-20', 9600), -- Auto - Formato Antiguo
('RS6789', 'BCI Seguros', '2022-04-18', '2023-04-18', 8700), -- Auto - Formato Antiguo

-- AUTOS - FORMATO NUEVO (BBBB12) - 2 registros
('WXYZ23', 'HDI Seguros', '2022-06-10', '2023-06-10', 10800), -- Auto - Formato Nuevo
('BCFG89', 'Sura', '2023-03-15', '2024-03-15', 11500), -- Auto - Formato Nuevo

-- MOTOS - FORMATO ANTIGUO (AA123) - 1 registro
('TV901', 'Mapfre', '2022-01-15', '2023-01-15', 4800), -- Moto - Formato Antiguo

-- MOTOS - FORMATO NUEVO (AAA12) - 1 registro
('XYZ12', 'Liberty Seguros', '2023-05-08', '2024-05-08', 4000), -- Moto - Formato Nuevo (mínimo)

-- #################################################################
-- Script SQL para limpiar datos de prueba en la tabla soap
-- ##################################################################

-- SOAP Vehículos Jorge Gallardo Contreras
('HFXX27', 'Consorcio', '2025-02-07', '2026-02-07', 11000),
('AH1234', 'Consorcio', '2025-11-20', '2026-11-20', 9500),
('BWFD87', 'Consorcio', '2025-06-15', '2026-06-15', 8700),
('CBKS56', 'Consorcio', '2025-03-10', '2026-03-10', 9900),
('BRK90', 'Consorcio', '2025-01-05', '2026-01-05', 11200),
('RSDY20', 'Consorcio', '2023-05-15', '2024-05-15', 9700),

-- SOAP Vehículo Felipe Vera Andrade
('HRWY25', 'BCI Seguros', '2025-08-30', '2026-08-30', 9200),

-- SOAP Vehículos Luis Caro Morales
('WXY12', 'HDI Seguros', '2025-02-15', '2026-02-15', 6200),
('HWRY70', 'Mapfre', '2025-02-20', '2026-02-20', 14500);
