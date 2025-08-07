-- Grupo 1: Vencimiento antes de julio 2025
INSERT INTO REVISION_TECNICA (
    ppu, fecha, codigo_planta, planta, nom_certificado, 
    fecha_vencimiento, estado
) VALUES
-- Vencidas o próximas a vencer
('BBCL25', '2024-05-15', 'AB1234', 'PRT Las Condes', 'CERT-2024-001', 
'2025-05-15', 'aprobada'),

('CCMN25', '2024-06-20', 'CD5678', 'PRT Providencia', 'CERT-2024-002', 
'2025-06-20', 'aprobada'),

('DDKJ25', '2024-04-10', 'EF9012', 'PRT Vitacura', 'CERT-2024-003', 
'2025-04-10', 'rechazada'),

('FFGH25', '2024-03-25', 'GH3456', 'PRT Ñuñoa', 'CERT-2024-004', 
'2025-03-25', 'aprobada'),

('GGJK25', '2024-02-05', 'IJ7890', 'PRT Santiago', 'CERT-2024-005', 
'2025-02-05', 'rechazada');

-- Grupo 2: Vencimiento después de julio 2025
INSERT INTO REVISION_TECNICA (
    ppu, fecha, codigo_planta, planta, nom_certificado, 
    fecha_vencimiento, estado
) VALUES
-- Vigentes con vencimiento futuro
('HHRT25', '2025-07-15', 'KL1234', 'PRT La Florida', 'CERT-2025-006', 
'2026-07-15', 'aprobada'),

('JJWQ25', '2025-08-20', 'MN5678', 'PRT Maipú', 'CERT-2025-007', 
'2026-08-20', 'aprobada'),

('KKTY25', '2025-09-30', 'OP9012', 'PRT Puente Alto', 'CERT-2025-008', 
'2026-09-30', 'aprobada'),

('LLOP25', '2025-10-25', 'QR3456', 'PRT Quilicura', 'CERT-2025-009', 
'2026-10-25', 'rechazada'),

('MMNS25', '2025-12-28', 'ST7890', 'PRT San Bernardo', 'CERT-2025-010', 
'2026-12-28', 'aprobada');