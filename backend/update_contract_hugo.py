import sqlite3
from datetime import date

db_path = "toro_gestion.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # 1. Buscar Depto PB_A
    cursor.execute("SELECT id FROM departamentos WHERE alias = ?", ('PB_A',))
    depto = cursor.fetchone()
    if not depto:
        print("Error: No se encontró el depto PB_A")
        exit()
    depto_id = depto[0]

    # 2. Buscar/Actualizar Inquilino 'Hugo'
    # Buscamos por nombre aproximado o creamos
    cursor.execute("SELECT id FROM inquilinos WHERE nombre_apellido LIKE '%Hugo%'")
    inquilino = cursor.fetchone()
    
    if inquilino:
        inquilino_id = inquilino[0]
        print(f"Actualizando Inquilino ID {inquilino_id}...")
        cursor.execute("""
            UPDATE inquilinos 
            SET nombre_apellido = 'NIEVA, HUGO ALBERTO', 
                dni = '17385787'
            WHERE id = ?
        """, (inquilino_id,))
    else:
        print("Creando nuevo inquilino...")
        cursor.execute("""
            INSERT INTO inquilinos (nombre_apellido, dni, estado)
            VALUES ('NIEVA, HUGO ALBERTO', '17385787', 'ACTIVO')
        """)
        inquilino_id = cursor.lastrowid

    # 3. Crear/Actualizar Contrato
    # Verificar si ya existe contrato para este depto/inquilino
    cursor.execute("SELECT id FROM contratos WHERE departamento_id = ? AND inquilino_id = ?", (depto_id, inquilino_id))
    contrato = cursor.fetchone()

    if contrato:
        print(f"Actualizando contrato existente ID {contrato[0]}...")
        cursor.execute("""
            UPDATE contratos
            SET fecha_inicio = '2023-12-01',
                fecha_fin = '2026-11-30',
                monto_inicial = 130000,
                contrato_firmado_url = 'Asuncion 1415 - PB A.pdf',
                estado = 'ACTIVO'
            WHERE id = ?
        """, (contrato[0],))
    else:
        print("Creando nuevo contrato...")
        cursor.execute("""
            INSERT INTO contratos (departamento_id, inquilino_id, fecha_inicio, fecha_fin, monto_inicial, contrato_firmado_url, estado)
            VALUES (?, ?, '2023-12-01', '2026-11-30', 130000, 'Asuncion 1415 - PB A.pdf', 'ACTIVO')
        """, (depto_id, inquilino_id))

    conn.commit()
    print("✅ Datos actualizados correctamente en base de datos.")

except Exception as e:
    print(f"Error: {e}")
    conn.rollback()
finally:
    conn.close()
