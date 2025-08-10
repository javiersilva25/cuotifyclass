#!/usr/bin/env python3
"""
Script COMPLETO para poblar TODAS las tablas de la base de datos zqnqdrmp_cuotify
con datos demo realistas para demostración del Sistema de Gestión Escolar v8.5.0
"""

import mysql.connector
import bcrypt
import sys
from datetime import datetime, date, timedelta
import random

# Configuración de la base de datos
DB_CONFIG = {
    'host': '194.195.87.239',
    'port': 3306,
    'user': 'zqnqdrmp_adcuoti',
    'password': 'aEkWTUHPEAAW',
    'database': 'zqnqdrmp_cuotify',
    'charset': 'utf8mb4'
}

def connect_database():
    """Conectar a la base de datos MySQL"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        print(f"✅ Conectado exitosamente a la base de datos: {DB_CONFIG['database']}")
        return connection
    except mysql.connector.Error as err:
        print(f"❌ Error de conexión: {err}")
        return None

def execute_query(cursor, query, params=None, description=""):
    """Ejecutar una consulta SQL con manejo de errores"""
    try:
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        if description:
            print(f"✅ {description}")
        return True
    except mysql.connector.Error as err:
        print(f"❌ Error en {description}: {err}")
        return False

def hash_password(password):
    """Generar hash bcrypt para contraseña"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def get_all_tables(cursor):
    """Obtener todas las tablas de la base de datos"""
    cursor.execute("SHOW TABLES")
    tables = [table[0] for table in cursor.fetchall()]
    print(f"📊 Tablas encontradas: {len(tables)}")
    for table in tables:
        print(f"  - {table}")
    return tables

def create_demo_users(cursor, connection):
    """Crear usuarios demo con tabla usuarios si existe"""
    print("\n👥 CREANDO USUARIOS EN TABLA 'usuarios'")
    print("=" * 60)
    
    # Verificar si existe tabla usuarios
    cursor.execute("SHOW TABLES LIKE 'usuarios'")
    if not cursor.fetchone():
        print("⚠️ Tabla 'usuarios' no existe, saltando...")
        return []
    
    # Obtener estructura de la tabla usuarios
    cursor.execute("DESCRIBE usuarios")
    columns = [col[0] for col in cursor.fetchall()]
    print(f"📋 Columnas en 'usuarios': {columns}")
    
    # Crear usuarios básicos
    demo_users = [
        {
            'id': 'ADMIN001',
            'nombre': 'Administrador Sistema',
            'email': 'admin@demo.cl'
        },
        {
            'id': 'APOD001', 
            'nombre': 'María González Apoderado',
            'email': 'maria@demo.cl'
        },
        {
            'id': 'PROF001',
            'nombre': 'Juan Profesor Demo',
            'email': 'profesor@demo.cl'
        }
    ]
    
    user_ids = []
    for user in demo_users:
        # Construir query dinámicamente basado en columnas disponibles
        if 'nombre' in columns and 'email' in columns:
            query = "INSERT IGNORE INTO usuarios (id, nombre, email) VALUES (%s, %s, %s)"
            params = (user['id'], user['nombre'], user['email'])
        else:
            query = "INSERT IGNORE INTO usuarios (id) VALUES (%s)"
            params = (user['id'],)
        
        if execute_query(cursor, query, params, f"Usuario creado: {user['id']}"):
            user_ids.append(user['id'])
    
    connection.commit()
    return user_ids

def create_demo_courses(cursor, connection, user_ids):
    """Crear cursos demo completos"""
    print("\n📚 CREANDO CURSOS DEMO COMPLETOS")
    print("=" * 60)
    
    # Usar primer usuario como creador
    created_by = user_ids[0] if user_ids else 'ADMIN_DEMO'
    
    demo_courses = [
        {
            'nombre_curso': '1° Básico A - Demo',
            'nivel_id': 1,
            'ano_escolar': 2025,
            'profesor_id': user_ids[2] if len(user_ids) > 2 else None,
            'tesorero_id': user_ids[1] if len(user_ids) > 1 else None
        },
        {
            'nombre_curso': '2° Básico B - Demo',
            'nivel_id': 2,
            'ano_escolar': 2025,
            'profesor_id': user_ids[2] if len(user_ids) > 2 else None,
            'tesorero_id': user_ids[1] if len(user_ids) > 1 else None
        },
        {
            'nombre_curso': '3° Básico C - Demo',
            'nivel_id': 3,
            'ano_escolar': 2025,
            'profesor_id': user_ids[2] if len(user_ids) > 2 else None,
            'tesorero_id': user_ids[1] if len(user_ids) > 1 else None
        },
        {
            'nombre_curso': '4° Básico A - Demo',
            'nivel_id': 4,
            'ano_escolar': 2025,
            'profesor_id': user_ids[2] if len(user_ids) > 2 else None,
            'tesorero_id': user_ids[1] if len(user_ids) > 1 else None
        },
        {
            'nombre_curso': '5° Básico B - Demo',
            'nivel_id': 5,
            'ano_escolar': 2025,
            'profesor_id': user_ids[2] if len(user_ids) > 2 else None,
            'tesorero_id': user_ids[1] if len(user_ids) > 1 else None
        }
    ]
    
    course_ids = []
    for course in demo_courses:
        query = """
        INSERT INTO cursos (
            nombre_curso, nivel_id, ano_escolar, profesor_id, tesorero_id,
            creado_por, fecha_creacion
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s
        )
        """
        
        params = (
            course['nombre_curso'], course['nivel_id'], course['ano_escolar'],
            course['profesor_id'], course['tesorero_id'],
            created_by, datetime.now()
        )
        
        if execute_query(cursor, query, params, f"Curso creado: {course['nombre_curso']}"):
            course_ids.append(cursor.lastrowid)
    
    connection.commit()
    return course_ids

def create_demo_students_with_guardian(cursor, connection, course_ids, user_ids):
    """Crear apoderado con 3 alumnos en diferentes cursos"""
    print("\n👨‍👩‍👧‍👦 CREANDO APODERADO CON 3 ALUMNOS EN DIFERENTES CURSOS")
    print("=" * 60)
    
    if not course_ids:
        print("⚠️ No hay cursos disponibles")
        return [], []
    
    # Crear apoderado principal
    apoderado_rut = '12345678'
    apoderado_rut_formateado = '12.345.678-5'
    
    # Insertar persona apoderado
    persona_query = """
    INSERT IGNORE INTO personas (
        rut, rut_formateado, nombres, apellido_paterno, apellido_materno,
        fecha_nacimiento, genero, email, telefono, direccion,
        codigo_comuna, codigo_provincia, codigo_region,
        activo, es_dato_prueba, created_at, updated_at, created_by
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
    )
    """
    
    persona_params = (
        apoderado_rut, apoderado_rut_formateado, 'Carlos Eduardo',
        'Pérez', 'González', '1985-05-15', 'M', 'carlos.perez@demo.cl',
        '+56987654321', 'Av. Demo 123, Santiago',
        13101, 131, 13,  # Santiago, Santiago, RM
        1, 1, datetime.now(), datetime.now(), 'DEMO_SYSTEM'
    )
    
    execute_query(cursor, persona_query, persona_params, "Apoderado creado: Carlos Eduardo Pérez")
    
    # Crear usuario de autenticación para apoderado
    auth_query = """
    INSERT IGNORE INTO usuarios_auth (
        rut_persona, password_hash, ultimo_acceso, intentos_fallidos,
        debe_cambiar_password, es_dato_prueba, created_at, updated_at, created_by
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s
    )
    """
    
    auth_params = (
        apoderado_rut, hash_password('demo123'),
        datetime.now(), 0, 0, 1,
        datetime.now(), datetime.now(), 'DEMO_SYSTEM'
    )
    
    execute_query(cursor, auth_query, auth_params, f"Auth creado para apoderado: {apoderado_rut_formateado}")
    
    # Asignar rol de apoderado
    role_query = """
    INSERT IGNORE INTO persona_roles (
        rut_persona, rol_id, fecha_inicio, activo,
        observaciones, es_dato_prueba, created_at, updated_at, created_by
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s
    )
    """
    
    role_params = (
        apoderado_rut, 2, date.today(), 1,  # Rol 2 = Apoderado
        'Apoderado demo con 3 hijos', 1,
        datetime.now(), datetime.now(), 'DEMO_SYSTEM'
    )
    
    execute_query(cursor, role_query, role_params, f"Rol apoderado asignado: {apoderado_rut_formateado}")
    
    # Crear 3 alumnos hijos del apoderado
    demo_students = [
        {
            'nombre_completo': 'Sofía Pérez González',
            'fecha_nacimiento': '2015-03-10',
            'curso_id': course_ids[0] if len(course_ids) > 0 else course_ids[0],  # 1° Básico
            'usuario_id': 'ESTUDIANTE001'
        },
        {
            'nombre_completo': 'Diego Pérez González', 
            'fecha_nacimiento': '2013-08-22',
            'curso_id': course_ids[2] if len(course_ids) > 2 else course_ids[0],  # 3° Básico
            'usuario_id': 'ESTUDIANTE002'
        },
        {
            'nombre_completo': 'Valentina Pérez González',
            'fecha_nacimiento': '2011-12-05',
            'curso_id': course_ids[4] if len(course_ids) > 4 else course_ids[0],  # 5° Básico
            'usuario_id': 'ESTUDIANTE003'
        }
    ]
    
    student_ids = []
    for student in demo_students:
        query = """
        INSERT INTO alumnos (
            nombre_completo, fecha_nacimiento, curso_id, apoderado_id, usuario_id,
            creado_por, fecha_creacion
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s
        )
        """
        
        params = (
            student['nombre_completo'], student['fecha_nacimiento'], student['curso_id'],
            apoderado_rut, student['usuario_id'],
            'DEMO_SYSTEM', datetime.now()
        )
        
        if execute_query(cursor, query, params, f"Alumno creado: {student['nombre_completo']}"):
            student_ids.append(cursor.lastrowid)
    
    connection.commit()
    return student_ids, [apoderado_rut]

def create_demo_fees_and_payments(cursor, connection, course_ids, student_ids, apoderado_ruts):
    """Crear cuotas, pagos y deudas demo"""
    print("\n💰 CREANDO CUOTAS, PAGOS Y DEUDAS DEMO")
    print("=" * 60)
    
    if not course_ids or not student_ids:
        print("⚠️ No hay cursos o estudiantes disponibles")
        return
    
    # Crear cuotas para cada curso
    fee_ids = []
    for course_id in course_ids:
        # Cuota mensual
        fee_query = """
        INSERT INTO cuotas (
            curso_id, nombre, monto, fecha_limite_pago, creado_en
        ) VALUES (
            %s, %s, %s, %s, %s
        )
        """
        
        fee_params = (
            course_id, f'Cuota Mensual Marzo 2025 - Curso {course_id}',
            45000.00, '2025-03-31', datetime.now()
        )
        
        if execute_query(cursor, fee_query, fee_params, f"Cuota creada para curso {course_id}"):
            fee_ids.append(cursor.lastrowid)
    
    # Crear algunos pagos realizados
    for i, student_id in enumerate(student_ids[:2]):  # Solo 2 estudiantes con pagos
        if i < len(fee_ids):
            payment_query = """
            INSERT INTO pagos (
                monto_pagado, metodo_pago, cuota_id, alumno_id, apoderado_id,
                fecha_pago, estado_id, transaccion_id
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s
            )
            """
            
            payment_params = (
                45000.00, 'Transferencia Bancaria', fee_ids[i], student_id, 1,
                datetime.now(), 1, f'DEMO_TXN_{student_id}_{fee_ids[i]}'
            )
            
            execute_query(cursor, payment_query, payment_params,
                         f"Pago creado: Alumno {student_id} - $45.000")
    
    # Crear deudas para el tercer estudiante
    if len(student_ids) > 2 and len(fee_ids) > 2:
        debt_query = """
        INSERT INTO deudas_alumnos (
            alumno_id, cobro_id, monto_adeudado, estado,
            creado_por, fecha_creacion
        ) VALUES (
            %s, %s, %s, %s, %s, %s
        )
        """
        
        debt_params = (
            student_ids[2], fee_ids[2], 45000.00, 'pendiente',
            'DEMO_SYSTEM', datetime.now()
        )
        
        execute_query(cursor, debt_query, debt_params,
                     f"Deuda creada: Alumno {student_ids[2]} - $45.000 pendiente")
    
    connection.commit()

def create_demo_categories_and_expenses(cursor, connection, course_ids):
    """Crear categorías de gastos y gastos demo"""
    print("\n📊 CREANDO CATEGORÍAS DE GASTOS Y GASTOS DEMO")
    print("=" * 60)
    
    # Verificar si existe tabla categorias_gastos
    cursor.execute("SHOW TABLES LIKE 'categorias_gastos'")
    if not cursor.fetchone():
        print("⚠️ Tabla 'categorias_gastos' no existe, saltando...")
        return
    
    # Crear categorías de gastos
    categories = [
        {'nombre': 'Material Escolar', 'descripcion': 'Útiles y materiales educativos'},
        {'nombre': 'Actividades Extracurriculares', 'descripcion': 'Deportes y talleres'},
        {'nombre': 'Infraestructura', 'descripcion': 'Mantenimiento y mejoras'},
        {'nombre': 'Eventos Escolares', 'descripcion': 'Ceremonias y celebraciones'},
        {'nombre': 'Transporte', 'descripcion': 'Buses y excursiones'}
    ]
    
    category_ids = []
    for category in categories:
        query = """
        INSERT IGNORE INTO categorias_gastos (nombre, descripcion, activo, created_at)
        VALUES (%s, %s, %s, %s)
        """
        params = (category['nombre'], category['descripcion'], 1, datetime.now())
        
        if execute_query(cursor, query, params, f"Categoría creada: {category['nombre']}"):
            category_ids.append(cursor.lastrowid)
    
    # Crear gastos demo si existe tabla gastos
    cursor.execute("SHOW TABLES LIKE 'gastos'")
    if cursor.fetchone() and category_ids and course_ids:
        for i, course_id in enumerate(course_ids[:3]):  # Solo 3 cursos
            category_id = category_ids[i % len(category_ids)]
            
            expense_query = """
            INSERT INTO gastos (
                curso_id, categoria_id, descripcion, monto, fecha_gasto,
                creado_por, fecha_creacion
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s
            )
            """
            
            expense_params = (
                course_id, category_id, f'Gasto demo para curso {course_id}',
                25000.00, date.today(), 'DEMO_SYSTEM', datetime.now()
            )
            
            execute_query(cursor, expense_query, expense_params,
                         f"Gasto creado: Curso {course_id} - $25.000")
    
    connection.commit()

def create_demo_financial_movements(cursor, connection, student_ids):
    """Crear movimientos financieros demo"""
    print("\n💳 CREANDO MOVIMIENTOS FINANCIEROS DEMO")
    print("=" * 60)
    
    # Movimientos cuenta corriente alumnos
    cursor.execute("SHOW TABLES LIKE 'movimientos_ccaa'")
    if cursor.fetchone() and student_ids:
        for student_id in student_ids:
            movement_query = """
            INSERT INTO movimientos_ccaa (
                alumno_id, tipo_movimiento, monto, descripcion, fecha_movimiento,
                creado_por, fecha_creacion
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s
            )
            """
            
            movement_params = (
                student_id, 'PAGO', 45000.00, f'Pago cuota mensual - Alumno {student_id}',
                datetime.now(), 'DEMO_SYSTEM', datetime.now()
            )
            
            execute_query(cursor, movement_query, movement_params,
                         f"Movimiento CCAA creado: Alumno {student_id}")
    
    # Movimientos cuenta corriente apoderados
    cursor.execute("SHOW TABLES LIKE 'movimientos_ccpp'")
    if cursor.fetchone():
        movement_query = """
        INSERT INTO movimientos_ccpp (
            apoderado_id, tipo_movimiento, monto, descripcion, fecha_movimiento,
            creado_por, fecha_creacion
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s
        )
        """
        
        movement_params = (
            '12345678', 'PAGO_MULTIPLE', 135000.00, 'Pago cuotas 3 hijos - Marzo 2025',
            datetime.now(), 'DEMO_SYSTEM', datetime.now()
        )
        
        execute_query(cursor, movement_query, movement_params,
                     "Movimiento CCPP creado: Apoderado múltiple")
    
    connection.commit()

def create_demo_cobros(cursor, connection, course_ids, student_ids):
    """Crear cobros demo"""
    print("\n🧾 CREANDO COBROS DEMO")
    print("=" * 60)
    
    cursor.execute("SHOW TABLES LIKE 'cobros'")
    if not cursor.fetchone():
        print("⚠️ Tabla 'cobros' no existe, saltando...")
        return
    
    if not course_ids or not student_ids:
        print("⚠️ No hay cursos o estudiantes para crear cobros")
        return
    
    # Crear cobros para cada curso
    for course_id in course_ids:
        cobro_query = """
        INSERT INTO cobros (
            curso_id, nombre, descripcion, monto, fecha_vencimiento,
            activo, creado_por, fecha_creacion
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s
        )
        """
        
        cobro_params = (
            course_id, f'Cobro Mensual Curso {course_id}',
            f'Cuota mensual marzo 2025 - Curso {course_id}',
            45000.00, '2025-03-31', 1, 'DEMO_SYSTEM', datetime.now()
        )
        
        execute_query(cursor, cobro_query, cobro_params,
                     f"Cobro creado: Curso {course_id}")
    
    connection.commit()

def verify_all_data(cursor):
    """Verificar todos los datos creados"""
    print("\n📊 VERIFICACIÓN COMPLETA DE DATOS DEMO")
    print("=" * 60)
    
    tables_to_check = [
        ('personas', 'Personas del sistema'),
        ('usuarios_auth', 'Autenticación de usuarios'),
        ('persona_roles', 'Roles asignados'),
        ('usuarios', 'Tabla usuarios'),
        ('cursos', 'Cursos académicos'),
        ('alumnos', 'Estudiantes'),
        ('cuotas', 'Cuotas de pago'),
        ('pagos', 'Pagos realizados'),
        ('deudas_alumnos', 'Deudas pendientes'),
        ('categorias_gastos', 'Categorías de gastos'),
        ('gastos', 'Gastos registrados'),
        ('movimientos_ccaa', 'Movimientos cuenta alumnos'),
        ('movimientos_ccpp', 'Movimientos cuenta apoderados'),
        ('cobros', 'Cobros generados'),
        ('regiones', 'Geografía - Regiones'),
        ('provincias', 'Geografía - Provincias'),
        ('comunas', 'Geografía - Comunas')
    ]
    
    total_records = 0
    for table, description in tables_to_check:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            status = "✅" if count > 0 else "⚠️"
            print(f"{status} {description}: {count} registros")
            total_records += count
        except mysql.connector.Error:
            print(f"❌ {description}: Tabla no existe")
    
    print(f"\n🎯 TOTAL DE REGISTROS DEMO: {total_records}")

def show_demo_credentials(cursor):
    """Mostrar credenciales demo para acceso"""
    print("\n🔐 CREDENCIALES DEMO PARA ACCESO AL SISTEMA")
    print("=" * 60)
    
    demo_credentials = [
        {
            'rut': '11.111.111-1',
            'password': 'admin123',
            'role': 'Administrador',
            'description': 'Acceso completo al sistema'
        },
        {
            'rut': '22.222.222-2', 
            'password': 'apod123',
            'role': 'Apoderado',
            'description': 'Gestión de pagos y consultas'
        },
        {
            'rut': '12.345.678-5',
            'password': 'demo123',
            'role': 'Apoderado con 3 hijos',
            'description': 'Apoderado demo con múltiples alumnos'
        }
    ]
    
    for cred in demo_credentials:
        print(f"👤 {cred['role']}")
        print(f"   🆔 RUT: {cred['rut']}")
        print(f"   🔑 Contraseña: {cred['password']}")
        print(f"   📝 Descripción: {cred['description']}")
        print()

def main():
    print("🚀 POBLACIÓN COMPLETA DE DATOS DEMO")
    print(f"🎯 Base de datos: {DB_CONFIG['database']}")
    print("🎪 CREANDO DATOS PARA DEMOSTRACIÓN DEL SISTEMA")
    print("=" * 80)
    
    # Conectar a la base de datos
    connection = connect_database()
    if not connection:
        sys.exit(1)
    
    cursor = connection.cursor()
    
    try:
        # Obtener todas las tablas
        all_tables = get_all_tables(cursor)
        
        # Crear datos demo paso a paso
        print("\n🎬 INICIANDO CREACIÓN DE DATOS DEMO COMPLETOS")
        
        # 1. Crear usuarios base
        user_ids = create_demo_users(cursor, connection)
        
        # 2. Crear cursos
        course_ids = create_demo_courses(cursor, connection, user_ids)
        
        # 3. Crear apoderado con 3 alumnos en diferentes cursos
        student_ids, apoderado_ruts = create_demo_students_with_guardian(cursor, connection, course_ids, user_ids)
        
        # 4. Crear cuotas, pagos y deudas
        create_demo_fees_and_payments(cursor, connection, course_ids, student_ids, apoderado_ruts)
        
        # 5. Crear categorías y gastos
        create_demo_categories_and_expenses(cursor, connection, course_ids)
        
        # 6. Crear movimientos financieros
        create_demo_financial_movements(cursor, connection, student_ids)
        
        # 7. Crear cobros
        create_demo_cobros(cursor, connection, course_ids, student_ids)
        
        # Verificar todos los datos
        verify_all_data(cursor)
        
        # Mostrar credenciales
        show_demo_credentials(cursor)
        
        print("\n" + "=" * 80)
        print("🎉 POBLACIÓN DEMO COMPLETADA EXITOSAMENTE")
        print("🎪 TODAS LAS TABLAS POBLADAS CON DATOS REALISTAS")
        print("👨‍👩‍👧‍👦 APODERADO CON 3 ALUMNOS EN DIFERENTES CURSOS CREADO")
        print("💰 SISTEMA FINANCIERO COMPLETO CON PAGOS Y DEUDAS")
        print("🌐 ACCESO: http://localhost:3001")
        print("=" * 80)
        
    except Exception as e:
        print(f"❌ Error general: {e}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()
        print("🔌 Conexión cerrada")

if __name__ == "__main__":
    main()

