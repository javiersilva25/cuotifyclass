-- Script de inicialización de roles del sistema v7.0
-- Ejecutar después de crear las tablas

-- Limpiar roles existentes (solo si es necesario)
-- DELETE FROM persona_roles WHERE es_dato_prueba = true;
-- DELETE FROM roles WHERE es_dato_prueba = true;

-- Insertar roles del sistema
INSERT INTO roles (codigo, nombre, descripcion, categoria, es_alumno, requiere_curso, es_unico_por_curso, permisos, activo, es_dato_prueba) VALUES

-- Roles de Alumnos
('ALUMNO', 'Alumno', 'Estudiante matriculado en el colegio', 'ALUMNO', true, true, false, 
 '{"ver_notas": true, "ver_asistencia": true, "ver_deudas": true, "participar_actividades": true}', 
 true, false),

('TESORERO_ALUMNOS', 'Tesorero de Alumnos', 'Representa a los estudiantes del curso en temas financieros', 'ALUMNO', true, true, true,
 '{"gestionar_fondos_curso": true, "ver_gastos_curso": true, "proponer_actividades": true, "generar_reportes_alumnos": true}',
 true, false),

-- Roles de Apoderados
('APODERADO', 'Apoderado', 'Responsable legal de uno o más alumnos', 'APODERADO', false, false, false,
 '{"ver_info_hijos": true, "realizar_pagos": true, "ver_notas_hijos": true, "comunicarse_profesores": true}',
 true, false),

('TESORERO_APODERADOS', 'Tesorero de Apoderados', 'Representa a los apoderados del curso en temas financieros', 'APODERADO', false, true, true,
 '{"gestionar_fondos_apoderados": true, "organizar_actividades": true, "manejar_cuotas_especiales": true, "generar_reportes_apoderados": true}',
 true, false),

-- Roles de Personal Docente
('PROFESOR', 'Profesor', 'Docente del establecimiento', 'PERSONAL', false, false, false,
 '{"gestionar_notas": true, "tomar_asistencia": true, "comunicarse_apoderados": true, "crear_actividades": true}',
 true, false),

('PROFESOR_JEFE', 'Profesor Jefe', 'Profesor a cargo de un curso específico', 'PERSONAL', false, true, true,
 '{"gestionar_curso": true, "supervisar_tesoreros": true, "aprobar_actividades": true, "generar_reportes_curso": true}',
 true, false),

-- Roles Administrativos
('ADMINISTRADOR', 'Administrador del Sistema', 'Acceso completo al sistema', 'ADMINISTRATIVO', false, false, false,
 '{"acceso_total": true, "gestionar_usuarios": true, "configurar_sistema": true, "ver_todos_reportes": true}',
 true, false),

('DIRECTOR', 'Director', 'Director del establecimiento educacional', 'ADMINISTRATIVO', false, false, false,
 '{"supervisar_general": true, "aprobar_gastos_mayores": true, "gestionar_personal": true, "acceso_reportes_ejecutivos": true}',
 true, false),

('SUBDIRECTOR', 'Subdirector', 'Subdirector del establecimiento', 'ADMINISTRATIVO', false, false, false,
 '{"supervisar_academico": true, "gestionar_disciplina": true, "coordinar_actividades": true, "acceso_reportes_academicos": true}',
 true, false),

('INSPECTOR', 'Inspector General', 'Inspector general o de nivel', 'PERSONAL', false, false, false,
 '{"gestionar_disciplina": true, "supervisar_asistencia": true, "coordinar_seguridad": true, "generar_reportes_disciplina": true}',
 true, false),

-- Roles de Apoyo
('SECRETARIA', 'Secretaria', 'Personal de secretaría y administración', 'ADMINISTRATIVO', false, false, false,
 '{"gestionar_matriculas": true, "atender_apoderados": true, "procesar_documentos": true, "acceso_info_basica": true}',
 true, false),

('TESORERO_GENERAL', 'Tesorero General', 'Tesorero general del establecimiento', 'ADMINISTRATIVO', false, false, false,
 '{"gestionar_finanzas": true, "procesar_pagos": true, "generar_reportes_financieros": true, "supervisar_tesoreros_curso": true}',
 true, false);

-- Verificar inserción
SELECT 
    codigo,
    nombre,
    categoria,
    es_alumno,
    requiere_curso,
    es_unico_por_curso,
    activo
FROM roles 
WHERE es_dato_prueba = false
ORDER BY categoria, codigo;

