
import sqlite3

def check_enums():
    conn = sqlite3.connect('toro_gestion.db')
    cursor = conn.cursor()

    checks = [
        ("departamentos", "estado", ['ALQUILADO', 'VACIO', 'REFACCION']),
        ("inquilinos", "estado", ['ACTIVO', 'INACTIVO']),
        ("contratos", "estado", ['ACTIVO', 'VENCIDO', 'RESCINDIDO']),
        ("pagos", "estado", ['COBRADO', 'PENDIENTE', 'PARCIAL'])
    ]

    print("Checking database integrity against Enums...")
    issues_found = False
    
    for table, column, valid_values in checks:
        print(f"\nScanning table '{table}', column '{column}'...")
        cursor.execute(f"SELECT DISTINCT {column} FROM {table}")
        rows = cursor.fetchall()
        for row in rows:
            val = row[0]
            if val not in valid_values:
                print(f"❌ INVALID VALUE FOUND: '{val}' (Expected: {valid_values})")
                issues_found = True
            else:
                print(f"✅ '{val}' is valid.")
    
    conn.close()
    
    if not issues_found:
        print("\n🎉 All data matches Enum definitions.")
    else:
        print("\n⚠️  Issues found. Please fix manually or with a script.")

if __name__ == "__main__":
    check_enums()
