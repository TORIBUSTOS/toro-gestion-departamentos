
import sqlite3

def fix_payment_status():
    try:
        conn = sqlite3.connect('toro_gestion.db')
        cursor = conn.cursor()
        
        # Check current status
        print("Checking current statuses...")
        cursor.execute("SELECT estado, COUNT(*) FROM pagos GROUP BY estado")
        results = cursor.fetchall()
        print(f"Current distribution: {results}")
        
        # Update
        print("Updating 'PAGADO' to 'COBRADO'...")
        cursor.execute("UPDATE pagos SET estado = 'COBRADO' WHERE estado = 'PAGADO'")
        updated_rows = cursor.rowcount
        print(f"Updated {updated_rows} rows.")
        
        conn.commit()
        
        # Verify
        cursor.execute("SELECT estado, COUNT(*) FROM pagos GROUP BY estado")
        results_after = cursor.fetchall()
        print(f"New distribution: {results_after}")
        
        conn.close()
        print("Database update completed successfully.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_payment_status()
