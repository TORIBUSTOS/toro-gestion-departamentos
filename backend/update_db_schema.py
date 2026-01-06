import sqlite3
import os

# Ruta DB
db_path = "toro_gestion.db"

if not os.path.exists(db_path):
    print("Database not found. No migration needed.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Migrating database schema...")
        # Add proxima_actualizacion
        try:
            cursor.execute("ALTER TABLE contratos ADD COLUMN proxima_actualizacion DATE")
            print("Added column: proxima_actualizacion")
        except sqlite3.OperationalError:
            print("Column proxima_actualizacion already exists.")
            
        # Add porcentaje_actualizacion
        try:
            cursor.execute("ALTER TABLE contratos ADD COLUMN porcentaje_actualizacion NUMERIC(5, 2)")
            print("Added column: porcentaje_actualizacion")
        except sqlite3.OperationalError:
            print("Column porcentaje_actualizacion already exists.")
            
        conn.commit()
        print("Migration complete.")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()
