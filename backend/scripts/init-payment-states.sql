-- Script para inicializar los estados de pago básicos
-- Ejecutar después de crear las tablas de la base de datos

-- Insertar estados de pago básicos
INSERT INTO estado_pago (estado) VALUES 
('Pendiente'),
('Pagado'),
('Vencido'),
('Cancelado'),
('Fallido')
ON DUPLICATE KEY UPDATE estado = VALUES(estado);

-- Verificar que se insertaron correctamente
SELECT * FROM estado_pago;

