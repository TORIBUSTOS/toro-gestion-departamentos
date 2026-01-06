import urllib.request
import json
import socket

BASE_URL = "http://127.0.0.1:8001"

def check_endpoint(endpoint):
    url = f"{BASE_URL}{endpoint}"
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            data = json.loads(response.read().decode())
            print(f"✅ {endpoint}: OK (Items: {len(data)})")
            if len(data) > 0:
                print(f"   Sample: {data[0]}")
            return True
    except Exception as e:
        print(f"❌ {endpoint}: Error - {e}")
        return False

def check_port_open(port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1', port))
    sock.close()
    return result == 0

print(f"Checking API at {BASE_URL}...")
if not check_port_open(8001):
    print("❌ Port 8001 is CLOSED. Backend is NOT running.")
else:
    print("✅ Port 8001 is OPEN.")
    
    check_endpoint("/departamentos")
    check_endpoint("/pagos")
    check_endpoint("/contratos")
    check_endpoint("/inquilinos")
