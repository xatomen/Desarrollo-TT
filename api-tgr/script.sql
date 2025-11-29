-- Script de creación de base de datos y tablas para la API de AACH

CREATE DATABASE IF NOT EXISTS tgr_db;

USE tgr_db;

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

CREATE TABLE IF NOT EXISTS credenciales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(12) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL
);

--- Tabla para almacenar información de tarjetas de debito y credito de ejemplo
CREATE TABLE IF NOT EXISTS tarjetas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_tarjeta VARCHAR(20) NOT NULL,
    titular VARCHAR(100) NOT NULL,
    rut VARCHAR(12) NOT NULL,
    clave VARCHAR(255) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    tipo_tarjeta VARCHAR(50) NOT NULL,
    banco VARCHAR(100) NOT NULL,
    cvv INT NOT NULL,
    saldo DECIMAL(10, 2) NOT NULL
);