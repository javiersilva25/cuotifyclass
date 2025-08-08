-- Datos de prueba para sistema de usuarios con RUT v7.0
-- IMPORTANTE: Todos estos datos están marcados como es_dato_prueba = true
-- para facilitar su identificación y eliminación posterior

-- =====================================================
-- PERSONAS DE PRUEBA
-- =====================================================

INSERT INTO personas (
    rut, rut_formateado, nombres, apellido_paterno, apellido_materno, 
    fecha_nacimiento, genero, email, telefono, 
    direccion, comuna, provincia, region, 
    activo, es_dato_prueba, created_by
) VALUES

-- Administradores de prueba
('11111111-1', '11.111.111-1', 'Juan Carlos', 'Administrador', 'Sistema', 
 '1980-01-15', 'M', 'admin.prueba@colegio.cl', '+56912345001',
 'Av. Administración 100', 'Santiago', 'Santiago', 'Región Metropolitana',
 true, true, 'SISTEMA'),

-- Directivos de prueba
('22222222-2', '22.222.222-2', 'María Elena', 'Directora', 'Principal', 
 '1975-03-20', 'F', 'directora.prueba@colegio.cl', '+56912345002',
 'Calle Dirección 200', 'Las Condes', 'Santiago', 'Región Metropolitana',
 true, true, 'SISTEMA'),

-- Profesores de prueba
('33333333-3', '33.333.333-3', 'Pedro Pablo', 'Profesor', 'Matemáticas', 
 '1985-07-10', 'M', 'profesor.matematicas.prueba@colegio.cl', '+56912345003',
 'Pasaje Educación 300', 'Providencia', 'Santiago', 'Región Metropolitana',
 true, true, 'SISTEMA'),

('44444444-4', '44.444.444-4', 'Ana Sofía', 'Profesora', 'Lenguaje', 
 '1982-11-25', 'F', 'profesora.lenguaje.prueba@colegio.cl', '+56912345004',
 'Av. Literatura 400', 'Ñuñoa', 'Santiago', 'Región Metropolitana',
 true, true, 'SISTEMA'),

-- Apoderados de prueba
('55555555-5', '55.555.555-5', 'Carlos Eduardo', 'Apoderado', 'González', 
 '1978-05-12', 'M', 'apoderado1.prueba@email.com', '+56912345005',
 'Calle Familia 500', 'Maipú', 'Santiago', 'Región Metropolitana',
 true, true, 'SISTEMA'),

('66666666-6', '66.666.666-6', 'Patricia Isabel', 'Apoderada', 'Rodríguez', 
 '1980-09-08', 'F', 'apoderada2.prueba@email.com', '+56912345006',
 'Av. Hogar 600', 'La Florida', 'Santiago', 'Región Metropolitana',
 true, true, 'SISTEMA'),

('77777777-7', '77.777.777-7', 'Roberto Miguel', 'Apoderado', 'Silva', 
 '1976-12-03', 'M', 'apoderado3.prueba@email.com', '+56912345007',
 'Pasaje Responsabilidad 700', 'Puente Alto', 'Santiago', 'Región Metropolitana',
 true, true, 'SISTEMA'),

-- Alumnos de prueba (menores de edad)
('88888888-8', '88.888.888-8', 'Sofía Valentina', 'González', 'Pérez', 
 '2010-03-15', 'F', 'sofia.gonzalez.prueba@estudiante.cl', '+56912345008',
 'Calle Familia 500', 'Maipú', 'Santiago', 'Región Metropolitana',
 true, true, 'SISTEMA'),

('99999999-9', '99.999.999-9', 'Diego Alejandro', 'Rodríguez', 'López', 
 '2009-07-22', 'M', 'diego.rodriguez.prueba@estudiante.cl', '+56912345009',
 'Av. Hogar 600', 'La Florida', 'Santiago', 'Región Metropolitana',
 true, true, 'SISTEMA'),

('10101010-1', '10.101.010-1', 'Martina Esperanza', 'Silva', 'Torres', 
 '2011-11-08', 'F', 'martina.silva.prueba@estudiante.cl', '+56912345010',
 'Pasaje Responsabilidad 700', 'Puente Alto', 'Santiago', 'Región Metropolitana',
 true, true, 'SISTEMA'),

('12121212-1', '12.121.212-1', 'Benjamín Ignacio', 'Morales', 'Castro', 
 '2010-01-30', 'M', 'benjamin.morales.prueba@estudiante.cl', '+56912345011',
 'Calle Estudiantes 800', 'San Miguel', 'Santiago', 'Región Metropolitana',
 true, true, 'SISTEMA'),

-- Alumno que será tesorero de alumnos
('13131313-1', '13.131.313-1', 'Camila Andrea', 'Tesorera', 'Estudiantil', 
 '2009-06-18', 'F', 'camila.tesorera.prueba@estudiante.cl', '+56912345012',
 'Av. Liderazgo 900', 'Las Condes', 'Santiago', 'Región Metropolitana',
 true, true, 'SISTEMA');

-- =====================================================
-- USUARIOS DE AUTENTICACIÓN DE PRUEBA
-- =====================================================

INSERT INTO usuarios_auth (
    rut_persona, password_hash, debe_cambiar_password, es_dato_prueba, created_by
) VALUES

-- Contraseñas temporales (todas son "prueba123")
-- Hash generado con bcrypt, salt rounds = 12
('11111111-1', '$2b$12$LQv3c1yqBwLFaAEKcND2xuWisQXRK1Q/ZH4Vbc36jLbmhQjmhQjmhQ', false, true, 'SISTEMA'),
('22222222-2', '$2b$12$LQv3c1yqBwLFaAEKcND2xuWisQXRK1Q/ZH4Vbc36jLbmhQjmhQjmhQ', false, true, 'SISTEMA'),
('33333333-3', '$2b$12$LQv3c1yqBwLFaAEKcND2xuWisQXRK1Q/ZH4Vbc36jLbmhQjmhQjmhQ', true, true, 'SISTEMA'),
('44444444-4', '$2b$12$LQv3c1yqBwLFaAEKcND2xuWisQXRK1Q/ZH4Vbc36jLbmhQjmhQjmhQ', true, true, 'SISTEMA'),
('55555555-5', '$2b$12$LQv3c1yqBwLFaAEKcND2xuWisQXRK1Q/ZH4Vbc36jLbmhQjmhQjmhQ', true, true, 'SISTEMA'),
('66666666-6', '$2b$12$LQv3c1yqBwLFaAEKcND2xuWisQXRK1Q/ZH4Vbc36jLbmhQjmhQjmhQ', true, true, 'SISTEMA'),
('77777777-7', '$2b$12$LQv3c1yqBwLFaAEKcND2xuWisQXRK1Q/ZH4Vbc36jLbmhQjmhQjmhQ', true, true, 'SISTEMA'),
('88888888-8', '$2b$12$LQv3c1yqBwLFaAEKcND2xuWisQXRK1Q/ZH4Vbc36jLbmhQjmhQjmhQ', true, true, 'SISTEMA'),
('99999999-9', '$2b$12$LQv3c1yqBwLFaAEKcND2xuWisQXRK1Q/ZH4Vbc36jLbmhQjmhQjmhQ', true, true, 'SISTEMA'),
('10101010-1', '$2b$12$LQv3c1yqBwLFaAEKcND2xuWisQXRK1Q/ZH4Vbc36jLbmhQjmhQjmhQ', true, true, 'SISTEMA'),
('12121212-1', '$2b$12$LQv3c1yqBwLFaAEKcND2xuWisQXRK1Q/ZH4Vbc36jLbmhQjmhQjmhQ', true, true, 'SISTEMA'),
('13131313-1', '$2b$12$LQv3c1yqBwLFaAEKcND2xuWisQXRK1Q/ZH4Vbc36jLbmhQjmhQjmhQ', true, true, 'SISTEMA');

-- =====================================================
-- ASIGNACIÓN DE ROLES DE PRUEBA
-- =====================================================

-- Obtener IDs de roles (asumiendo que ya están creados)
SET @rol_admin = (SELECT id FROM roles WHERE codigo = 'ADMINISTRADOR');
SET @rol_director = (SELECT id FROM roles WHERE codigo = 'DIRECTOR');
SET @rol_profesor = (SELECT id FROM roles WHERE codigo = 'PROFESOR');
SET @rol_profesor_jefe = (SELECT id FROM roles WHERE codigo = 'PROFESOR_JEFE');
SET @rol_apoderado = (SELECT id FROM roles WHERE codigo = 'APODERADO');
SET @rol_alumno = (SELECT id FROM roles WHERE codigo = 'ALUMNO');
SET @rol_tesorero_alumnos = (SELECT id FROM roles WHERE codigo = 'TESORERO_ALUMNOS');
SET @rol_tesorero_apoderados = (SELECT id FROM roles WHERE codigo = 'TESORERO_APODERADOS');

-- Obtener ID de curso de prueba (asumiendo curso "1° Básico A" existe)
SET @curso_1a = (SELECT id FROM cursos WHERE nombre LIKE '%1%A%' OR nombre LIKE '%Básico A%' LIMIT 1);

INSERT INTO persona_roles (
    rut_persona, rol_id, curso_id, fecha_inicio, activo, 
    observaciones, es_dato_prueba, created_by
) VALUES

-- Administrador
('11111111-1', @rol_admin, NULL, '2024-01-01', true, 
 'Administrador de prueba del sistema', true, 'SISTEMA'),

-- Director
('22222222-2', @rol_director, NULL, '2024-01-01', true, 
 'Director de prueba del establecimiento', true, 'SISTEMA'),

-- Profesores
('33333333-3', @rol_profesor, NULL, '2024-03-01', true, 
 'Profesor de matemáticas de prueba', true, 'SISTEMA'),

('44444444-4', @rol_profesor, NULL, '2024-03-01', true, 
 'Profesora de lenguaje de prueba', true, 'SISTEMA'),

-- Profesor jefe (si hay curso disponible)
('33333333-3', @rol_profesor_jefe, @curso_1a, '2024-03-01', true, 
 'Profesor jefe de prueba del curso 1°A', true, 'SISTEMA'),

-- Apoderados
('55555555-5', @rol_apoderado, NULL, '2024-01-15', true, 
 'Apoderado de prueba', true, 'SISTEMA'),

('66666666-6', @rol_apoderado, NULL, '2024-01-15', true, 
 'Apoderada de prueba', true, 'SISTEMA'),

('77777777-7', @rol_apoderado, NULL, '2024-01-15', true, 
 'Apoderado de prueba', true, 'SISTEMA'),

-- Tesorero de apoderados (si hay curso disponible)
('55555555-5', @rol_tesorero_apoderados, @curso_1a, '2024-03-15', true, 
 'Tesorero de apoderados de prueba del curso 1°A', true, 'SISTEMA'),

-- Alumnos
('88888888-8', @rol_alumno, @curso_1a, '2024-03-01', true, 
 'Alumna de prueba', true, 'SISTEMA'),

('99999999-9', @rol_alumno, @curso_1a, '2024-03-01', true, 
 'Alumno de prueba', true, 'SISTEMA'),

('10101010-1', @rol_alumno, @curso_1a, '2024-03-01', true, 
 'Alumna de prueba', true, 'SISTEMA'),

('12121212-1', @rol_alumno, @curso_1a, '2024-03-01', true, 
 'Alumno de prueba', true, 'SISTEMA'),

('13131313-1', @rol_alumno, @curso_1a, '2024-03-01', true, 
 'Alumna de prueba', true, 'SISTEMA'),

-- Tesorero de alumnos (si hay curso disponible)
('13131313-1', @rol_tesorero_alumnos, @curso_1a, '2024-04-01', true, 
 'Tesorera de alumnos de prueba del curso 1°A', true, 'SISTEMA');

-- =====================================================
-- RELACIONES APODERADO-ALUMNO DE PRUEBA
-- =====================================================

INSERT INTO apoderado_alumno (
    rut_apoderado, rut_alumno, tipo_relacion, es_principal, 
    puede_retirar, recibe_notificaciones, activo, 
    created_by
) VALUES

-- Carlos Eduardo es apoderado de Sofía Valentina
('55555555-5', '88888888-8', 'PADRE', true, true, true, true, 'SISTEMA'),

-- Patricia Isabel es apoderada de Diego Alejandro  
('66666666-6', '99999999-9', 'MADRE', true, true, true, true, 'SISTEMA'),

-- Roberto Miguel es apoderado de Martina Esperanza
('77777777-7', '10101010-1', 'PADRE', true, true, true, true, 'SISTEMA'),

-- Carlos Eduardo también es apoderado de Benjamín (familia con 2 hijos)
('55555555-5', '12121212-1', 'PADRE', true, true, true, true, 'SISTEMA');

-- =====================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =====================================================

-- Mostrar resumen de personas de prueba
SELECT 
    'PERSONAS DE PRUEBA' as tipo,
    COUNT(*) as cantidad
FROM personas 
WHERE es_dato_prueba = true

UNION ALL

-- Mostrar resumen de usuarios de autenticación de prueba
SELECT 
    'USUARIOS AUTH DE PRUEBA' as tipo,
    COUNT(*) as cantidad
FROM usuarios_auth 
WHERE es_dato_prueba = true

UNION ALL

-- Mostrar resumen de roles asignados de prueba
SELECT 
    'ROLES ASIGNADOS DE PRUEBA' as tipo,
    COUNT(*) as cantidad
FROM persona_roles 
WHERE es_dato_prueba = true

UNION ALL

-- Mostrar resumen de relaciones de prueba
SELECT 
    'RELACIONES APODERADO-ALUMNO DE PRUEBA' as tipo,
    COUNT(*) as cantidad
FROM apoderado_alumno;

-- Mostrar detalle de personas con sus roles
SELECT 
    p.rut_formateado,
    p.nombres,
    p.apellido_paterno,
    p.apellido_materno,
    p.email,
    GROUP_CONCAT(r.nombre SEPARATOR ', ') as roles
FROM personas p
LEFT JOIN persona_roles pr ON p.rut = pr.rut_persona AND pr.activo = true
LEFT JOIN roles r ON pr.rol_id = r.id
WHERE p.es_dato_prueba = true
GROUP BY p.rut, p.nombres, p.apellido_paterno, p.apellido_materno, p.email
ORDER BY p.apellido_paterno, p.nombres;

-- =====================================================
-- CREDENCIALES DE PRUEBA
-- =====================================================

/*
CREDENCIALES PARA TESTING:

Administrador:
- Email: admin.prueba@colegio.cl
- Password: prueba123

Director:
- Email: directora.prueba@colegio.cl  
- Password: prueba123

Profesores:
- Email: profesor.matematicas.prueba@colegio.cl
- Password: prueba123
- Email: profesora.lenguaje.prueba@colegio.cl
- Password: prueba123

Apoderados:
- Email: apoderado1.prueba@email.com
- Password: prueba123
- Email: apoderada2.prueba@email.com
- Password: prueba123
- Email: apoderado3.prueba@email.com
- Password: prueba123

Alumnos:
- Email: sofia.gonzalez.prueba@estudiante.cl
- Password: prueba123
- Email: diego.rodriguez.prueba@estudiante.cl
- Password: prueba123
- Email: martina.silva.prueba@estudiante.cl
- Password: prueba123
- Email: benjamin.morales.prueba@estudiante.cl
- Password: prueba123
- Email: camila.tesorera.prueba@estudiante.cl
- Password: prueba123

NOTA: Todos los datos están marcados con es_dato_prueba = true
para facilitar su identificación y eliminación posterior.
*/

