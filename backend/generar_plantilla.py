import pandas as pd
import os
from datetime import date

# Nombre del archivo de salida
FILENAME = "../OIKOS_Datos_Maestros.xlsx"

def generar_plantilla():
    # 1. Definir columnas y datos de ejemplo para Departamentos
    deptos_data = {
        "alias": ["Depto 1A - Centro", "Casa Quinta - Norte"],
        "direccion": ["Av. San Martín 1500, Piso 1, Dpto A", "Los Álamos 400"],
        "propietario_nombre": ["Juan Pérez", "María González"],
        "tipo": ["departamento", "casa"],
        "servicios_incluidos": ["Agua, Municipal", "Jardinero, Piletero"],
        "seguro_poliza": ["Sancor-123456", "Federacion-987654"],
        "seguro_vencimiento": ["2025-12-31", "2025-10-15"],
        "estado": ["ALQUILADO", "VACIO"],
        "notas_inventario": ["Pintura nueva, piso parquet pulido.", "Requiere revisión de techo."]
    }
    df_deptos = pd.DataFrame(deptos_data)

    # 2. Definir columnas y datos de ejemplo para Inquilinos
    inquilinos_data = {
        "nombre_apellido": ["Carlos López", "Ana García"],
        "dni": ["20123456789", "27987654321"],
        "telefono": ["+54 9 11 1234 5678", "+54 9 11 8765 4321"],
        "email": ["carlos@email.com", "ana@email.com"],
        "canal_comunicacion": ["WhatsApp", "Email"],
        "estado": ["ACTIVO", "INACTIVO"]
    }
    df_inquilinos = pd.DataFrame(inquilinos_data)

    # 3. Definir columnas y datos de ejemplo para Contratos
    # Usamos referencias naturales (Alias del depto y DNI del inquilino) para vincular
    contratos_data = {
        "departamento_alias": ["Depto 1A - Centro", ""],
        "inquilino_dni": ["20123456789", ""],
        "fecha_inicio": ["2024-01-01", ""],
        "fecha_fin": ["2026-01-01", ""],
        "monto_inicial": [150000.00, 0],
        "deposito_garantia": [150000.00, 0],
        "contrato_firmado_url": ["http://link.al.pdf", ""],
        "estado": ["ACTIVO", ""]
    }
    df_contratos = pd.DataFrame(contratos_data)
    # Limpiamos filas vacías de ejemplo en contratos
    df_contratos = df_contratos[df_contratos["departamento_alias"] != ""]

    # Guardar en Excel con múltiples hojas
    try:
        with pd.ExcelWriter(FILENAME, engine='openpyxl') as writer:
            df_deptos.to_excel(writer, sheet_name='Departamentos', index=False)
            df_inquilinos.to_excel(writer, sheet_name='Inquilinos', index=False)
            df_contratos.to_excel(writer, sheet_name='Contratos', index=False)
        
        print(f"✅ Plantilla generada con éxito en: {os.path.abspath(FILENAME)}")
        print("📂 Abre este archivo, edita los datos y luego ejecuta el importador.")
    except Exception as e:
        print(f"❌ Error al generar la plantilla: {e}")

if __name__ == "__main__":
    generar_plantilla()
