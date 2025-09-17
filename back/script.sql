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