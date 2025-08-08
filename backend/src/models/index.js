const { sequelize } = require('../config/database');

// Importar todos los modelos
const Alumno = require('./alumno');
const CategoriaGasto = require('./categoriaGasto');
const Cobro = require('./cobro');
const CobroAlumno = require('./cobroAlumno');
const Curso = require('./curso');
const DeudaAlumno = require('./deudaAlumno');
const DeudaCompanero = require('./deudaCompanero');
const Gasto = require('./gasto');
const MovimientoCcaa = require('./movimientoCcaa');
const MovimientoCcpp = require('./movimientoCcpp');

// Modelos geográficos basados en CUT 2018
const Region = require('./region');
const Provincia = require('./provincia');
const Comuna = require('./comuna');

// Modelos de usuarios con RUT
const Persona = require('./persona');
const Rol = require('./rol');
const PersonaRol = require('./personaRol');
const UsuarioAuth = require('./usuarioAuth');

// Definir relaciones entre modelos

// Relaciones geográficas
Region.hasMany(Provincia, {
  foreignKey: 'codigoRegion',
  as: 'provincias'
});

Provincia.belongsTo(Region, {
  foreignKey: 'codigoRegion',
  as: 'region'
});

Provincia.hasMany(Comuna, {
  foreignKey: 'codigoProvincia',
  as: 'comunas'
});

Comuna.belongsTo(Provincia, {
  foreignKey: 'codigoProvincia',
  as: 'provincia'
});

Comuna.belongsTo(Region, {
  foreignKey: 'codigoRegion',
  as: 'region'
});

// Relaciones de Persona con geografía
Persona.belongsTo(Region, {
  foreignKey: 'codigoRegion',
  as: 'region'
});

Persona.belongsTo(Provincia, {
  foreignKey: 'codigoProvincia',
  as: 'provincia'
});

Persona.belongsTo(Comuna, {
  foreignKey: 'codigoComuna',
  as: 'comuna'
});

// Relaciones de roles
Persona.belongsToMany(Rol, {
  through: PersonaRol,
  foreignKey: 'rut',
  otherKey: 'rolId',
  as: 'roles'
});

Rol.belongsToMany(Persona, {
  through: PersonaRol,
  foreignKey: 'rolId',
  otherKey: 'rut',
  as: 'personas'
});

// Relaciones de autenticación
UsuarioAuth.belongsTo(Persona, {
  foreignKey: 'rut',
  as: 'persona'
});

Persona.hasOne(UsuarioAuth, {
  foreignKey: 'rut',
  as: 'auth'
});

// Relaciones de Alumno
Alumno.belongsTo(Curso, {
  foreignKey: 'curso_id',
  as: 'curso'
});

Curso.hasMany(Alumno, {
  foreignKey: 'curso_id',
  as: 'alumnos'
});

// Relaciones de Cobro
Cobro.belongsTo(Curso, {
  foreignKey: 'curso_id',
  as: 'curso'
});

Curso.hasMany(Cobro, {
  foreignKey: 'curso_id',
  as: 'cobros'
});

// Relaciones de CobroAlumno
CobroAlumno.belongsTo(Curso, {
  foreignKey: 'curso_id',
  as: 'curso'
});

Curso.hasMany(CobroAlumno, {
  foreignKey: 'curso_id',
  as: 'cobrosAlumnos'
});

// Relaciones de DeudaAlumno
DeudaAlumno.belongsTo(Alumno, {
  foreignKey: 'alumno_id',
  as: 'alumno'
});

DeudaAlumno.belongsTo(Cobro, {
  foreignKey: 'cobro_id',
  as: 'cobro'
});

Alumno.hasMany(DeudaAlumno, {
  foreignKey: 'alumno_id',
  as: 'deudas'
});

Cobro.hasMany(DeudaAlumno, {
  foreignKey: 'cobro_id',
  as: 'deudasAlumnos'
});

// Relaciones de DeudaCompanero
DeudaCompanero.belongsTo(Alumno, {
  foreignKey: 'alumno_id',
  as: 'alumno'
});

DeudaCompanero.belongsTo(CobroAlumno, {
  foreignKey: 'cobro_alumnos_id',
  as: 'cobroAlumno'
});

Alumno.hasMany(DeudaCompanero, {
  foreignKey: 'alumno_id',
  as: 'deudasCompaneros'
});

CobroAlumno.hasMany(DeudaCompanero, {
  foreignKey: 'cobro_alumnos_id',
  as: 'deudasCompaneros'
});

// Relaciones de Gasto
Gasto.belongsTo(Curso, {
  foreignKey: 'curso_id',
  as: 'curso'
});

Gasto.belongsTo(CategoriaGasto, {
  foreignKey: 'categoria_id',
  as: 'categoria'
});

Curso.hasMany(Gasto, {
  foreignKey: 'curso_id',
  as: 'gastos'
});

CategoriaGasto.hasMany(Gasto, {
  foreignKey: 'categoria_id',
  as: 'gastos'
});

// Relaciones de MovimientoCcaa
MovimientoCcaa.belongsTo(Curso, {
  foreignKey: 'curso_id',
  as: 'curso'
});

Curso.hasMany(MovimientoCcaa, {
  foreignKey: 'curso_id',
  as: 'movimientosCcaa'
});

// Relaciones de MovimientoCcpp
MovimientoCcpp.belongsTo(Curso, {
  foreignKey: 'curso_id',
  as: 'curso'
});

MovimientoCcpp.belongsTo(Alumno, {
  foreignKey: 'alumno_id',
  as: 'alumno'
});

Curso.hasMany(MovimientoCcpp, {
  foreignKey: 'curso_id',
  as: 'movimientosCcpp'
});

Alumno.hasMany(MovimientoCcpp, {
  foreignKey: 'alumno_id',
  as: 'movimientosCcpp'
});

// Exportar todos los modelos y la instancia de sequelize
const models = {
  Alumno,
  CategoriaGasto,
  Cobro,
  CobroAlumno,
  Curso,
  DeudaAlumno,
  DeudaCompanero,
  Gasto,
  MovimientoCcaa,
  MovimientoCcpp,
  // Modelos geográficos
  Region,
  Provincia,
  Comuna,
  // Modelos de usuarios
  Persona,
  Rol,
  PersonaRol,
  UsuarioAuth,
  sequelize
};

module.exports = models;

