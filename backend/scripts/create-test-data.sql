-- Script para crear datos de prueba del sistema v5.1.0
-- Incluye usuarios, cursos, tesoreros, apoderados y alumnos

-- Insertar usuarios de prueba
INSERT INTO usuarios (nombre, apellido, email, password, role, activo, created_at, updated_at) VALUES
-- Administradores
('Admin', 'Sistema', 'admin@test.com', '$2b$10$hash_admin_password', 'admin', 1, NOW(), NOW()),

-- Tesoreros (uno por curso)
('María', 'González', 'tesorero1a@test.com', '$2b$10$hash_tesorero_password', 'tesorero', 1, NOW(), NOW()),
('Carlos', 'Rodríguez', 'tesorero1b@test.com', '$2b$10$hash_tesorero_password', 'tesorero', 1, NOW(), NOW()),
('Ana', 'Martínez', 'tesorero2a@test.com', '$2b$10$hash_tesorero_password', 'tesorero', 1, NOW(), NOW()),
('Luis', 'Fernández', 'tesorero2b@test.com', '$2b$10$hash_tesorero_password', 'tesorero', 1, NOW(), NOW()),
('Carmen', 'López', 'tesorero3a@test.com', '$2b$10$hash_tesorero_password', 'tesorero', 1, NOW(), NOW()),
('Roberto', 'Sánchez', 'tesorero3b@test.com', '$2b$10$hash_tesorero_password', 'tesorero', 1, NOW(), NOW()),
('Patricia', 'Morales', 'tesorero4a@test.com', '$2b$10$hash_tesorero_password', 'tesorero', 1, NOW(), NOW()),
('Diego', 'Herrera', 'tesorero4b@test.com', '$2b$10$hash_tesorero_password', 'tesorero', 1, NOW(), NOW()),

-- Apoderados
('Juan', 'Pérez', 'juan.perez@email.com', '$2b$10$hash_apoderado_password', 'apoderado', 1, NOW(), NOW()),
('María', 'Silva', 'maria.silva@email.com', '$2b$10$hash_apoderado_password', 'apoderado', 1, NOW(), NOW()),
('Pedro', 'Ramírez', 'pedro.ramirez@email.com', '$2b$10$hash_apoderado_password', 'apoderado', 1, NOW(), NOW()),
('Laura', 'Torres', 'laura.torres@email.com', '$2b$10$hash_apoderado_password', 'apoderado', 1, NOW(), NOW());

-- Insertar cursos de prueba (8 cursos para demostrar el sistema)
INSERT INTO cursos (nombre_curso, nivel_id, ano_escolar, activo, created_at, updated_at) VALUES
('1° Básico A', 1, 2024, 1, NOW(), NOW()),
('1° Básico B', 1, 2024, 1, NOW(), NOW()),
('2° Básico A', 2, 2024, 1, NOW(), NOW()),
('2° Básico B', 2, 2024, 1, NOW(), NOW()),
('3° Básico A', 3, 2024, 1, NOW(), NOW()),
('3° Básico B', 3, 2024, 1, NOW(), NOW()),
('4° Básico A', 4, 2024, 1, NOW(), NOW()),
('4° Básico B', 4, 2024, 1, NOW(), NOW());

-- Insertar tesoreros asignados a cursos
INSERT INTO tesoreros (usuario_id, curso_id, activo, fecha_asignacion, created_at, updated_at) VALUES
-- Obtener IDs de usuarios tesoreros y cursos
((SELECT id FROM usuarios WHERE email = 'tesorero1a@test.com'), (SELECT id FROM cursos WHERE nombre_curso = '1° Básico A'), 1, NOW(), NOW(), NOW()),
((SELECT id FROM usuarios WHERE email = 'tesorero1b@test.com'), (SELECT id FROM cursos WHERE nombre_curso = '1° Básico B'), 1, NOW(), NOW(), NOW()),
((SELECT id FROM usuarios WHERE email = 'tesorero2a@test.com'), (SELECT id FROM cursos WHERE nombre_curso = '2° Básico A'), 1, NOW(), NOW(), NOW()),
((SELECT id FROM usuarios WHERE email = 'tesorero2b@test.com'), (SELECT id FROM cursos WHERE nombre_curso = '2° Básico B'), 1, NOW(), NOW(), NOW()),
((SELECT id FROM usuarios WHERE email = 'tesorero3a@test.com'), (SELECT id FROM cursos WHERE nombre_curso = '3° Básico A'), 1, NOW(), NOW(), NOW()),
((SELECT id FROM usuarios WHERE email = 'tesorero3b@test.com'), (SELECT id FROM cursos WHERE nombre_curso = '3° Básico B'), 1, NOW(), NOW(), NOW()),
((SELECT id FROM usuarios WHERE email = 'tesorero4a@test.com'), (SELECT id FROM cursos WHERE nombre_curso = '4° Básico A'), 1, NOW(), NOW(), NOW()),
((SELECT id FROM usuarios WHERE email = 'tesorero4b@test.com'), (SELECT id FROM cursos WHERE nombre_curso = '4° Básico B'), 1, NOW(), NOW(), NOW());

-- Insertar apoderados
INSERT INTO apoderados (usuario_id, activo, created_at, updated_at) VALUES
((SELECT id FROM usuarios WHERE email = 'juan.perez@email.com'), 1, NOW(), NOW()),
((SELECT id FROM usuarios WHERE email = 'maria.silva@email.com'), 1, NOW(), NOW()),
((SELECT id FROM usuarios WHERE email = 'pedro.ramirez@email.com'), 1, NOW(), NOW()),
((SELECT id FROM usuarios WHERE email = 'laura.torres@email.com'), 1, NOW(), NOW());

-- Insertar alumnos distribuidos en diferentes cursos
INSERT INTO alumnos (nombre, apellido, rut, fecha_nacimiento, curso_id, activo, created_at, updated_at) VALUES
-- Alumnos en 1° Básico A
('María', 'Pérez', '12345678-9', '2017-03-15', (SELECT id FROM cursos WHERE nombre_curso = '1° Básico A'), 1, NOW(), NOW()),
('Carlos', 'Pérez', '12345679-7', '2017-05-20', (SELECT id FROM cursos WHERE nombre_curso = '1° Básico A'), 1, NOW(), NOW()),
('Sofía', 'Silva', '12345680-K', '2017-02-10', (SELECT id FROM cursos WHERE nombre_curso = '1° Básico A'), 1, NOW(), NOW()),

-- Alumnos en 1° Básico B
('Diego', 'Ramírez', '12345681-8', '2017-04-25', (SELECT id FROM cursos WHERE nombre_curso = '1° Básico B'), 1, NOW(), NOW()),
('Valentina', 'Torres', '12345682-6', '2017-06-30', (SELECT id FROM cursos WHERE nombre_curso = '1° Básico B'), 1, NOW(), NOW()),

-- Alumnos en 2° Básico A
('Mateo', 'Silva', '12345683-4', '2016-01-15', (SELECT id FROM cursos WHERE nombre_curso = '2° Básico A'), 1, NOW(), NOW()),
('Isabella', 'Ramírez', '12345684-2', '2016-03-20', (SELECT id FROM cursos WHERE nombre_curso = '2° Básico A'), 1, NOW(), NOW()),

-- Alumnos en 3° Básico A
('Sebastián', 'Torres', '12345685-0', '2015-02-28', (SELECT id FROM cursos WHERE nombre_curso = '3° Básico A'), 1, NOW(), NOW()),

-- Alumnos en 4° Básico A
('Emilia', 'Pérez', '12345686-9', '2014-07-12', (SELECT id FROM cursos WHERE nombre_curso = '4° Básico A'), 1, NOW(), NOW());

-- Insertar relaciones apoderado-alumno
INSERT INTO apoderado_alumno (apoderado_id, alumno_id, created_at, updated_at) VALUES
-- Juan Pérez es apoderado de María, Carlos y Emilia Pérez
((SELECT id FROM apoderados WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'juan.perez@email.com')), 
 (SELECT id FROM alumnos WHERE nombre = 'María' AND apellido = 'Pérez'), NOW(), NOW()),
((SELECT id FROM apoderados WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'juan.perez@email.com')), 
 (SELECT id FROM alumnos WHERE nombre = 'Carlos' AND apellido = 'Pérez'), NOW(), NOW()),
((SELECT id FROM apoderados WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'juan.perez@email.com')), 
 (SELECT id FROM alumnos WHERE nombre = 'Emilia' AND apellido = 'Pérez'), NOW(), NOW()),

-- María Silva es apoderada de Sofía y Mateo Silva
((SELECT id FROM apoderados WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'maria.silva@email.com')), 
 (SELECT id FROM alumnos WHERE nombre = 'Sofía' AND apellido = 'Silva'), NOW(), NOW()),
((SELECT id FROM apoderados WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'maria.silva@email.com')), 
 (SELECT id FROM alumnos WHERE nombre = 'Mateo' AND apellido = 'Silva'), NOW(), NOW()),

-- Pedro Ramírez es apoderado de Diego e Isabella Ramírez
((SELECT id FROM apoderados WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'pedro.ramirez@email.com')), 
 (SELECT id FROM alumnos WHERE nombre = 'Diego' AND apellido = 'Ramírez'), NOW(), NOW()),
((SELECT id FROM apoderados WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'pedro.ramirez@email.com')), 
 (SELECT id FROM alumnos WHERE nombre = 'Isabella' AND apellido = 'Ramírez'), NOW(), NOW()),

-- Laura Torres es apoderada de Valentina y Sebastián Torres
((SELECT id FROM apoderados WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'laura.torres@email.com')), 
 (SELECT id FROM alumnos WHERE nombre = 'Valentina' AND apellido = 'Torres'), NOW(), NOW()),
((SELECT id FROM apoderados WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'laura.torres@email.com')), 
 (SELECT id FROM alumnos WHERE nombre = 'Sebastián' AND apellido = 'Torres'), NOW(), NOW());

-- Insertar algunos cobros de ejemplo
INSERT INTO cobros (descripcion, monto, fecha_vencimiento, activo, created_at, updated_at) VALUES
('Matrícula 2024', 50000, '2024-03-31', 1, NOW(), NOW()),
('Mensualidad Marzo', 25000, '2024-03-05', 1, NOW(), NOW()),
('Mensualidad Abril', 25000, '2024-04-05', 1, NOW(), NOW()),
('Material Escolar', 15000, '2024-03-15', 1, NOW(), NOW());

-- Insertar deudas de alumnos (distribuidas por curso)
INSERT INTO deudas_alumnos (alumno_id, cobro_id, monto, estado, fecha_vencimiento, created_at, updated_at) VALUES
-- Deudas para alumnos de 1° Básico A (tesorero: María González)
((SELECT id FROM alumnos WHERE nombre = 'María' AND apellido = 'Pérez'), 
 (SELECT id FROM cobros WHERE descripcion = 'Matrícula 2024'), 50000, 'pendiente', '2024-03-31', NOW(), NOW()),
((SELECT id FROM alumnos WHERE nombre = 'Carlos' AND apellido = 'Pérez'), 
 (SELECT id FROM cobros WHERE descripcion = 'Mensualidad Marzo'), 25000, 'pendiente', '2024-03-05', NOW(), NOW()),
((SELECT id FROM alumnos WHERE nombre = 'Sofía' AND apellido = 'Silva'), 
 (SELECT id FROM cobros WHERE descripcion = 'Material Escolar'), 15000, 'pendiente', '2024-03-15', NOW(), NOW()),

-- Deudas para alumnos de 1° Básico B (tesorero: Carlos Rodríguez)
((SELECT id FROM alumnos WHERE nombre = 'Diego' AND apellido = 'Ramírez'), 
 (SELECT id FROM cobros WHERE descripcion = 'Matrícula 2024'), 50000, 'pendiente', '2024-03-31', NOW(), NOW()),
((SELECT id FROM alumnos WHERE nombre = 'Valentina' AND apellido = 'Torres'), 
 (SELECT id FROM cobros WHERE descripcion = 'Mensualidad Marzo'), 25000, 'pagado', '2024-03-05', NOW(), NOW()),

-- Deudas para alumnos de 2° Básico A (tesorero: Ana Martínez)
((SELECT id FROM alumnos WHERE nombre = 'Mateo' AND apellido = 'Silva'), 
 (SELECT id FROM cobros WHERE descripcion = 'Mensualidad Abril'), 25000, 'pendiente', '2024-04-05', NOW(), NOW()),
((SELECT id FROM alumnos WHERE nombre = 'Isabella' AND apellido = 'Ramírez'), 
 (SELECT id FROM cobros WHERE descripcion = 'Material Escolar'), 15000, 'pendiente', '2024-03-15', NOW(), NOW()),

-- Deudas para alumnos de 3° Básico A (tesorero: Carmen López)
((SELECT id FROM alumnos WHERE nombre = 'Sebastián' AND apellido = 'Torres'), 
 (SELECT id FROM cobros WHERE descripcion = 'Matrícula 2024'), 50000, 'pagado', '2024-03-31', NOW(), NOW()),

-- Deudas para alumnos de 4° Básico A (tesorero: Patricia Morales)
((SELECT id FROM alumnos WHERE nombre = 'Emilia' AND apellido = 'Pérez'), 
 (SELECT id FROM cobros WHERE descripcion = 'Mensualidad Marzo'), 25000, 'pendiente', '2024-03-05', NOW(), NOW());

-- Insertar algunos pagos de ejemplo
INSERT INTO pagos (alumno_id, deuda_alumno_id, monto_pagado, fecha_pago, metodo_pago, estado, created_at, updated_at) VALUES
-- Pago de Valentina Torres (1° Básico B)
((SELECT id FROM alumnos WHERE nombre = 'Valentina' AND apellido = 'Torres'),
 (SELECT id FROM deudas_alumnos WHERE alumno_id = (SELECT id FROM alumnos WHERE nombre = 'Valentina' AND apellido = 'Torres') AND estado = 'pagado'),
 25000, '2024-03-03', 'transbank', 'completado', NOW(), NOW()),

-- Pago de Sebastián Torres (3° Básico A)
((SELECT id FROM alumnos WHERE nombre = 'Sebastián' AND apellido = 'Torres'),
 (SELECT id FROM deudas_alumnos WHERE alumno_id = (SELECT id FROM alumnos WHERE nombre = 'Sebastián' AND apellido = 'Torres') AND estado = 'pagado'),
 50000, '2024-03-25', 'stripe', 'completado', NOW(), NOW());

-- Verificar datos insertados
SELECT 'Resumen de datos creados:' as mensaje;
SELECT 'Usuarios:' as tipo, COUNT(*) as cantidad FROM usuarios;
SELECT 'Cursos:' as tipo, COUNT(*) as cantidad FROM cursos;
SELECT 'Tesoreros:' as tipo, COUNT(*) as cantidad FROM tesoreros;
SELECT 'Apoderados:' as tipo, COUNT(*) as cantidad FROM apoderados;
SELECT 'Alumnos:' as tipo, COUNT(*) as cantidad FROM alumnos;
SELECT 'Deudas:' as tipo, COUNT(*) as cantidad FROM deudas_alumnos;
SELECT 'Pagos:' as tipo, COUNT(*) as cantidad FROM pagos;

-- Mostrar asignaciones de tesoreros por curso
SELECT 
    c.nombre_curso,
    CONCAT(u.nombre, ' ', u.apellido) as tesorero,
    u.email,
    t.fecha_asignacion
FROM tesoreros t
JOIN usuarios u ON t.usuario_id = u.id
JOIN cursos c ON t.curso_id = c.id
WHERE t.activo = 1
ORDER BY c.nombre_curso;

