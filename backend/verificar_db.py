from database import SessionLocal
from models import Departamento, Inquilino, Contrato

db = SessionLocal()
print(f"Departamentos: {db.query(Departamento).count()}")
print(f"Inquilinos: {db.query(Inquilino).count()}")
print(f"Contratos: {db.query(Contrato).count()}")

for d in db.query(Departamento).all():
    print(f" - {d.alias} ({d.estado})")

db.close()
