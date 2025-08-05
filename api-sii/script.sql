CREATE DATABASE IF NOT EXISTS sii_db;
USE sii_db;

CREATE TABLE TASACION_FISCAL (
    codigo_sii VARCHAR(20) PRIMARY KEY,
    tipo VARCHAR(50),
    anio INT,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    version VARCHAR(50),
    combustible VARCHAR(30),
    cilindrada INT,
    potencia INT,
    marchas INT,
    transmision VARCHAR(30),
    traccion VARCHAR(30),
    puertas INT,
    pais VARCHAR(50),
    equipamiento VARCHAR(100),
    tasacion INT,
    num_ejes INT,
    valor_permiso INT
);

CREATE TABLE FACTURA_COMPRA (
    num_factura INT PRIMARY KEY,
    precio_neto INT,
    puertas INT,
    asientos INT,
    combustible VARCHAR(30),
    peso VARCHAR(20),
    transmision VARCHAR(30),
    traccion VARCHAR(30),
    cilindrada INT,
    carga INT,
    tipo_sello VARCHAR(30)
);
