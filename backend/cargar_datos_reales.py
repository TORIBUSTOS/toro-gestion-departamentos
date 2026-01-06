import sqlite3
from datetime import date

db_path = "toro_gestion.db"

# Datos extraídos de la imagen
datos_reales = [
    {"alias": "PB_A", "inquilino": "HUGO", "monto": 315303},
    {"alias": "PB_B", "inquilino": "DAVID", "monto": 316303},
    {"alias": "1°_A", "inquilino": "CARLA", "monto": 346000},
    {"alias": "1°_B", "inquilino": "ABIGAIL", "monto": 283942},
    {"alias": "2°_A", "inquilino": "EZE", "monto": 200000},
    {"alias": "2°_B", "inquilino": "FRANCO", "monto": 200000},
]

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    print("--- INICIANDO CARGA DE DATOS REALES (Diciembre 2025) ---")

    for item in datos_reales:
        alias = item["alias"]
        monto = item["monto"]
        nombre_inquilino = item["inquilino"]

        # 1. Buscar Depto
        # Intentamos alias exacto o variantes
        cursor.execute("SELECT id FROM departamentos WHERE alias = ? OR alias = ?", (alias, alias.replace("_", " ")))
        depto = cursor.fetchone()
        
        if not depto:
            print(f"⚠️ No encontrado depto: {alias}. Saltando...")
            continue
        depto_id = depto[0]

        # 2. Buscar/Actualizar Inquilino
        # Buscamos por nombre parcial (ej: %DAVID%) o creamos uno nuevo
        cursor.execute("SELECT id FROM inquilinos WHERE nombre_apellido LIKE ?", (f"%{nombre_inquilino}%",))
        inq = cursor.fetchone()
        
        if inq:
            inquilino_id = inq[0]
            # Actualizamos nombre completo si es muy corto? No, mantenemos lo que hay mejor.
        else:
            print(f"➕ Creando inquilino: {nombre_inquilino}")
            cursor.execute("INSERT INTO inquilinos (nombre_apellido, estado) VALUES (?, 'ACTIVO')", (nombre_inquilino,))
            inquilino_id = cursor.lastrowid
            
        # 3. Actualizar CONTRATO Vigente
        # Buscamos si ya tiene contrato activo
        cursor.execute("SELECT id FROM contratos WHERE departamento_id = ? AND estado = 'ACTIVO'", (depto_id,))
        contrato = cursor.fetchone()

        if contrato:
            contrato_id = contrato[0]
            # Actualizamos monto inicial al valor de Dic'25 para que sea la base de Ene'26
            cursor.execute("UPDATE contratos SET monto_inicial = ?, inquilino_id = ? WHERE id = ?", (monto, inquilino_id, contrato_id))
            print(f"✅ Contrato actualizado: {alias} -> $ {monto}")
        else:
            # Creamos contrato nuevo si no existe
            print(f"🆕 Creando contrato nuevo para {alias}...")
            cursor.execute("""
                INSERT INTO contratos (departamento_id, inquilino_id, fecha_inicio, fecha_fin, monto_inicial, estado)
                VALUES (?, ?, '2024-06-01', '2026-11-30', ?, 'ACTIVO')
            """, (depto_id, inquilino_id, monto))
            contrato_id = cursor.lastrowid

        # 4. Registrar PAGO de Diciembre 2025 (Historial cerrado)
        cursor.execute("SELECT id FROM pagos WHERE contrato_id = ? AND periodo = '2025-12'", (contrato_id,))
        pago = cursor.fetchone()
        
        if not pago:
            cursor.execute("""
                INSERT INTO pagos (contrato_id, periodo, monto_alquiler, estado, fecha_pago)
                VALUES (?, '2025-12', ?, 'PAGADO', '2025-12-10')
            """, (contrato_id, monto))
            print(f"💰 Pago registrado Dic'25: {alias}")

    conn.commit()
    print("--- PROCESO FINALIZADO ---")

except Exception as e:
    print(f"❌ Error crítico: {e}")
    conn.rollback()
finally:
    conn.close()
