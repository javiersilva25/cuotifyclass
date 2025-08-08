-- Script para limpiar y preparar base de datos v8.0
-- Ejecutar con cuidado - elimina datos existentes

-- Desactivar verificación de foreign keys temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar tablas geográficas si existen (para recrear limpias)
DROP TABLE IF EXISTS `comunas`;
DROP TABLE IF EXISTS `provincias`;
DROP TABLE IF EXISTS `regiones`;

-- Recrear tablas geográficas con estructura correcta
CREATE TABLE `regiones` (
  `codigo` int NOT NULL COMMENT 'Código único de la región según CUT 2018',
  `nombre` varchar(100) NOT NULL COMMENT 'Nombre oficial de la región',
  `abreviatura` varchar(10) NOT NULL COMMENT 'Abreviatura oficial de la región',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Indica si la región está activa',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` varchar(50) DEFAULT NULL COMMENT 'Usuario que creó el registro',
  `updated_by` varchar(50) DEFAULT NULL COMMENT 'Usuario que actualizó el registro',
  `deleted_by` varchar(50) DEFAULT NULL COMMENT 'Usuario que eliminó el registro',
  PRIMARY KEY (`codigo`),
  UNIQUE KEY `regiones_codigo` (`codigo`),
  KEY `regiones_nombre` (`nombre`),
  KEY `regiones_abreviatura` (`abreviatura`),
  KEY `regiones_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `provincias` (
  `codigo` int NOT NULL COMMENT 'Código único de la provincia según CUT 2018',
  `nombre` varchar(100) NOT NULL COMMENT 'Nombre oficial de la provincia',
  `codigo_region` int NOT NULL COMMENT 'Código de la región a la que pertenece',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Indica si la provincia está activa',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` varchar(50) DEFAULT NULL COMMENT 'Usuario que creó el registro',
  `updated_by` varchar(50) DEFAULT NULL COMMENT 'Usuario que actualizó el registro',
  `deleted_by` varchar(50) DEFAULT NULL COMMENT 'Usuario que eliminó el registro',
  PRIMARY KEY (`codigo`),
  UNIQUE KEY `provincias_codigo` (`codigo`),
  KEY `provincias_nombre` (`nombre`),
  KEY `provincias_codigo_region` (`codigo_region`),
  KEY `provincias_activo` (`activo`),
  CONSTRAINT `provincias_ibfk_1` FOREIGN KEY (`codigo_region`) REFERENCES `regiones` (`codigo`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `comunas` (
  `codigo` int NOT NULL COMMENT 'Código único de la comuna según CUT 2018',
  `nombre` varchar(100) NOT NULL COMMENT 'Nombre oficial de la comuna',
  `codigo_provincia` int NOT NULL COMMENT 'Código de la provincia a la que pertenece',
  `codigo_region` int NOT NULL COMMENT 'Código de la región a la que pertenece',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Indica si la comuna está activa',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` varchar(50) DEFAULT NULL COMMENT 'Usuario que creó el registro',
  `updated_by` varchar(50) DEFAULT NULL COMMENT 'Usuario que actualizó el registro',
  `deleted_by` varchar(50) DEFAULT NULL COMMENT 'Usuario que eliminó el registro',
  PRIMARY KEY (`codigo`),
  UNIQUE KEY `comunas_codigo` (`codigo`),
  KEY `comunas_nombre` (`nombre`),
  KEY `comunas_codigo_provincia` (`codigo_provincia`),
  KEY `comunas_codigo_region` (`codigo_region`),
  KEY `comunas_activo` (`activo`),
  KEY `comunas_busqueda` (`nombre`, `codigo_provincia`, `codigo_region`),
  CONSTRAINT `comunas_ibfk_1` FOREIGN KEY (`codigo_provincia`) REFERENCES `provincias` (`codigo`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `comunas_ibfk_2` FOREIGN KEY (`codigo_region`) REFERENCES `regiones` (`codigo`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Limpiar tabla roles si tiene problemas
-- Solo eliminar la columna codigo si existe y causa problemas
-- ALTER TABLE `roles` DROP COLUMN IF EXISTS `codigo`;

-- Reactivar verificación de foreign keys
SET FOREIGN_KEY_CHECKS = 1;

-- Mensaje de confirmación
SELECT 'Base de datos limpiada y preparada para v8.0' as mensaje;

