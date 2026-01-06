
import sqlite3

def dump_schema():
    conn = sqlite3.connect('toro_gestion.db')
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(pagos)")
    columns = cursor.fetchall()
    print("Pagos Columns:")
    for col in columns:
        print(col)
        
    print("\nSample Data:")
    cursor.execute("SELECT * FROM pagos LIMIT 1")
    row = cursor.fetchone()
    print(row)
    conn.close()

if __name__ == "__main__":
    dump_schema()
