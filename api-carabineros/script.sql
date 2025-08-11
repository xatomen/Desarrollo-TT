-- Script para crear la base de datos y las tablas necesarias para la API de Carabineros

CREATE DATABASE IF NOT EXISTS carabineros_db;

USE carabineros_db;

CREATE TABLE IF NOT EXISTS ENCARGO_PATENTE (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    PPU VARCHAR(10) NOT NULL,
    ENCARGO BOOLEAN NOT NULL
);
