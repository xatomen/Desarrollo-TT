-- Script para crear la base de datos y las tablas necesarias para la API de la secretaría de gobierno digital

CREATE DATABASE IF NOT EXISTS sgd_db;

USE sgd_db;

CREATE TABLE IF NOT EXISTS sgd (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(12) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);
