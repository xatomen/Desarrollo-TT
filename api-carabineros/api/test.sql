-- ...existing code...

-- Insertar datos en la tabla ENCARGO_PATENTE
-- Se asigna de forma aleatoria el estado de encargo para simular datos reales

INSERT INTO ENCARGO_PATENTE (PPU, ENCARGO) VALUES
-- Vehículos nuevos (formato nuevo)
('BYDD18', FALSE),
('DVGF33', TRUE),
('ZDBX97', FALSE),
('CVDT73', FALSE),
('JXPJ52', TRUE),
('RWTW63', FALSE),
('WXLP42', FALSE),
('BBZB15', TRUE),
('HXPY38', FALSE),
('FPHC43', FALSE),

-- Vehículos antiguos (formato antiguo)
('DI8521', TRUE),
('EA9529', FALSE),
('WA9253', TRUE),
('HS6882', FALSE),
('LV3154', FALSE),
('TR3542', TRUE),
('ZJ9488', FALSE),
('ZH2985', FALSE),
('TJ4152', FALSE),
('GK6762', TRUE),

-- Motocicletas nuevas
('TD124', FALSE),
('SJ598', TRUE),
('VR394', FALSE),
('SP618', FALSE),
('KV215', TRUE),

-- Motocicletas antiguas
('JY580', FALSE),
('DP676', TRUE),
('PT759', FALSE),
('ZD933', FALSE),
('WZ664', TRUE),

-- Camiones y vehículos comerciales
('CYSP27', TRUE),
('HVKC58', FALSE),
('HLZC93', TRUE),
('DYZS86', FALSE),
('XKTP17', TRUE);