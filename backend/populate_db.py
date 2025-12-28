import requests
import datetime

API_URL = "http://localhost:8001/departamentos"

departamentos = [
    {
        "alias": "Dpto 3B - Edificio Toro",
        "direccion": "Av. Toro 123, Piso 3, Depto B",
        "tipo": "dpto",
        "estado": "ALQUILADO",
        "fecha_estado_desde": datetime.date.today().isoformat(),
        "notas": "Excelente vista"
    },
    {
        "alias": "Dpto 5A - Torre Central",
        "direccion": "Calle Central 456, Piso 5, Depto A",
        "tipo": "dpto",
        "estado": "VACIO",
        "fecha_estado_desde": datetime.date.today().isoformat(),
        "notas": "Necesita pintura"
    },
    {
        "alias": "Casa 2 - Barrio Norte",
        "direccion": "Calle Norte 789, Casa 2",
        "tipo": "casa",
        "estado": "ALQUILADO",
        "fecha_estado_desde": datetime.date.today().isoformat(),
        "notas": "Jardín amplio"
    },
    {
        "alias": "Dpto 1C - Planta Baja",
        "direccion": "Av. Sur 101, PB, Depto C",
        "tipo": "dpto",
        "estado": "REFACCION",
        "fecha_estado_desde": datetime.date.today().isoformat(),
        "notas": "En refacción de cocina"
    }
]

def populate():
    print(f"Connecting to {API_URL}...")
    try:
        # Check if server is up
        response = requests.get("http://localhost:8001/health")
        if response.status_code != 200:
            print("Server is not healthy or reachable.")
            return
        
        for depto in departamentos:
            print(f"Creating {depto['alias']}...")
            try:
                resp = requests.post(API_URL, json=depto)
                if resp.status_code == 201:
                    print(f"✅ Success: {depto['alias']}")
                else:
                    print(f"❌ Failed ({resp.status_code}): {resp.text}")
            except Exception as e:
                print(f"❌ Error creating {depto['alias']}: {e}")

    except Exception as e:
        print(f"Could not connect to server: {e}")

if __name__ == "__main__":
    populate()
