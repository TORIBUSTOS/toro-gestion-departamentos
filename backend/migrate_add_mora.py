
import sqlite3

def add_mora_column():
    try:
        conn = sqlite3.connect('toro_gestion.db')
        cursor = conn.cursor()
        
        # Check if column exists
        cursor.execute("PRAGMA table_info(pagos)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if "monto_mora" not in columns:
            print("Adding 'monto_mora' column to 'pagos' table...")
            cursor.execute("ALTER TABLE pagos ADD COLUMN monto_mora NUMERIC(10, 2) DEFAULT 0")
            conn.commit()
            print("✅ Column added successfully.")
        else:
            print("ℹ️ Column 'monto_mora' already exists.")
            
        conn.close()
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    add_mora_column()
