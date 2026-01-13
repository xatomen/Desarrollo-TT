-- =========================================
-- Script de Inicialización - Plan B Local
-- =========================================
-- Este script crea las tablas y datos de prueba
-- Ejecutado automáticamente por Docker Compose

USE desarrollo_tt;

-- =========================================
-- Tablas Base
-- =========================================

-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rut VARCHAR(12) NOT NULL UNIQUE,
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('fiscalizador', 'propietario', 'admin') NOT NULL,
    estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rut (rut),
    INDEX idx_email (email)
);

-- Vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    patente VARCHAR(12) NOT NULL UNIQUE,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    año INT NOT NULL,
    tipo_vehiculo ENUM('auto', 'moto', 'camión', 'bus', 'otro') NOT NULL,
    estado ENUM('activo', 'inactivo', 'decomisado') DEFAULT 'activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_patente (patente),
    INDEX idx_usuario (usuario_id)
);

-- Permisos de Circulación
CREATE TABLE IF NOT EXISTS permisos_circulacion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehiculo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo_permiso ENUM('diario', 'semanal', 'mensual', 'anual') NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado ENUM('vigente', 'vencido', 'revocado', 'pendiente') DEFAULT 'pendiente',
    motivo VARCHAR(500),
    fiscalizador_aprobacion_id INT,
    fecha_aprobacion TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (fiscalizador_aprobacion_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_vehiculo (vehiculo_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_estado (estado)
);

-- Infracciones
CREATE TABLE IF NOT EXISTS infracciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehiculo_id INT NOT NULL,
    fiscalizador_id INT NOT NULL,
    tipo_infraccion VARCHAR(100) NOT NULL,
    descripcion TEXT,
    monto_multa DECIMAL(10, 2),
    fecha_infraccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pagada', 'pendiente', 'disputada', 'anulada') DEFAULT 'pendiente',
    fecha_pago TIMESTAMP,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
    FOREIGN KEY (fiscalizador_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_vehiculo (vehiculo_id),
    INDEX idx_estado (estado)
);

-- =========================================
-- Datos de Prueba
-- =========================================

-- Usuarios de prueba
INSERT INTO usuarios (rut, nombre_completo, email, contraseña, tipo_usuario, estado) VALUES
('12345678-9', 'Juan Pérez López', 'juan@example.com', '$2b$12$N9qo8uLOickgx2ZMRZoMye', 'propietario', 'activo'),
('98765432-1', 'María García Rodríguez', 'maria@example.com', '$2b$12$N9qo8uLOickgx2ZMRZoMye', 'propietario', 'activo'),
('11111111-1', 'Carlos Fiscalizador', 'carlos.fis@example.com', '$2b$12$N9qo8uLOickgx2ZMRZoMye', 'fiscalizador', 'activo'),
('22222222-2', 'Ana Administradora', 'ana.admin@example.com', '$2b$12$N9qo8uLOickgx2ZMRZoMye', 'admin', 'activo'),
('33333333-3', 'Demostrateur Test', 'demo@example.com', '$2b$12$N9qo8uLOickgx2ZMRZoMye', 'propietario', 'activo');

-- Vehículos de prueba
INSERT INTO vehiculos (usuario_id, patente, marca, modelo, año, tipo_vehiculo, estado) VALUES
(1, 'SGFH34', 'Toyota', 'Corolla', 2020, 'auto', 'activo'),
(1, 'XBCD12', 'Honda', 'Civic', 2021, 'auto', 'activo'),
(2, 'ZQWE89', 'Volkswagen', 'Golf', 2019, 'auto', 'activo'),
(2, 'MXKL45', 'Yamaha', 'MT-09', 2022, 'moto', 'activo'),
(5, 'DEMO01', 'Hyundai', 'i10', 2023, 'auto', 'activo');

-- Permisos de Circulación
INSERT INTO permisos_circulacion (vehiculo_id, usuario_id, tipo_permiso, fecha_inicio, fecha_fin, estado, motivo, fiscalizador_aprobacion_id) VALUES
(1, 1, 'mensual', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 25 DAY), 'vigente', 'Permiso de prueba', 3),
(2, 1, 'semanal', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'vigente', 'Permiso semanal', 3),
(3, 2, 'diario', CURDATE(), CURDATE(), 'vencido', 'Permiso de un día', 3),
(4, 2, 'mensual', DATE_SUB(CURDATE(), INTERVAL 60 DAY), DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'vencido', 'Permiso expirado', 3),
(5, 5, 'anual', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 365 DAY), 'vigente', 'Permiso anual para demostración', 3);

-- Infracciones
INSERT INTO infracciones (vehiculo_id, fiscalizador_id, tipo_infraccion, descripcion, monto_multa, estado) VALUES
(1, 3, 'Exceso de velocidad', 'Excedió límite en 15 km/h', 500000.00, 'pendiente'),
(3, 3, 'Estacionamiento prohibido', 'Estacionado en zona de prohibición', 250000.00, 'pagada'),
(2, 3, 'Falta de permiso', 'Circulando sin permiso vigente', 1000000.00, 'pendiente');

-- =========================================
-- Índices adicionales para optimización
-- =========================================

ALTER TABLE usuarios ADD INDEX idx_tipo_usuario (tipo_usuario);
ALTER TABLE usuarios ADD INDEX idx_estado_usuario (estado);
ALTER TABLE vehiculos ADD INDEX idx_tipo_vehiculo (tipo_vehiculo);
ALTER TABLE permisos_circulacion ADD INDEX idx_fecha_vigencia (fecha_inicio, fecha_fin);
ALTER TABLE infracciones ADD INDEX idx_fiscalizador (fiscalizador_id);

-- =========================================
-- Confirmación
-- =========================================

SELECT 'Base de datos inicializada correctamente' AS Mensaje;
SELECT COUNT(*) AS Total_Usuarios FROM usuarios;
SELECT COUNT(*) AS Total_Vehiculos FROM vehiculos;
SELECT COUNT(*) AS Total_Permisos FROM permisos_circulacion;
SELECT COUNT(*) AS Total_Infracciones FROM infracciones;
