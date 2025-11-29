-- Script para crear la base de datos y las tablas necesarias para la API de Carabineros

CREATE DATABASE IF NOT EXISTS carabineros_db;

USE carabineros_db;

CREATE TABLE IF NOT EXISTS ENCARGO_PATENTE (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    PPU VARCHAR(10) NOT NULL,
    ENCARGO BOOLEAN NOT NULL,
    PATENTE_DELANTERA BOOLEAN NOT NULL,
    PATENTE_TRASERA BOOLEAN NOT NULL,
    VIN BOOLEAN NOT NULL,
    MOTOR BOOLEAN NOT NULL
);
-- Insertar datos en la tabla ENCARGO_PATENTE
-- Se asignan valores variados para simular diferentes situaciones

INSERT INTO ENCARGO_PATENTE (PPU, ENCARGO, PATENTE_DELANTERA, PATENTE_TRASERA, VIN, MOTOR) VALUES
-- Vehículos con todos los campos en TRUE
('BYDD18', TRUE, TRUE, TRUE, TRUE, TRUE),
('ZDBX97', TRUE, TRUE, TRUE, TRUE, TRUE),

-- Vehículos nuevos (formato nuevo)
('DVGF33', TRUE, TRUE, FALSE, FALSE, TRUE),
('JXPJ52', TRUE, TRUE, TRUE, FALSE, TRUE),
('RWTW63', FALSE, FALSE, FALSE, TRUE, TRUE),
('WXLP42', FALSE, TRUE, FALSE, TRUE, FALSE),
('BBZB15', TRUE, FALSE, TRUE, TRUE, FALSE),
('HXPY38', FALSE, TRUE, TRUE, FALSE, TRUE),
('FPHC43', FALSE, FALSE, TRUE, TRUE, TRUE),

-- Vehículos antiguos (formato antiguo)
('DI8521', TRUE, TRUE, FALSE, TRUE, FALSE),
('WA9253', TRUE, TRUE, TRUE, FALSE, FALSE),
('TR3542', TRUE, TRUE, TRUE, TRUE, FALSE),
('GK6762', TRUE, FALSE, TRUE, TRUE, TRUE),

-- Motocicletas nuevas
('SJ598', TRUE, FALSE, TRUE, FALSE, TRUE),
('KV215', TRUE, TRUE, FALSE, TRUE, FALSE),

-- Motocicletas antiguas
('DP676', TRUE, FALSE, TRUE, TRUE, FALSE),
('WZ664', TRUE, TRUE, TRUE, FALSE, FALSE),

-- Camiones y vehículos comerciales
('CYSP27', TRUE, TRUE, FALSE, TRUE, TRUE),
('HLZC93', TRUE, TRUE, TRUE, FALSE, TRUE),
('XKTP17', TRUE, FALSE, TRUE, TRUE, TRUE),

-- #################################################################
-- Datos para la demostración
-- #################################################################
('CBKS56', TRUE, TRUE, TRUE, TRUE, TRUE);