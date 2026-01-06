from sqlalchemy.orm import Session
from database import SessionLocal, init_db
from models import Departamento, Inquilino, Contrato, Pago, EstadoDepartamento, EstadoInquilino, EstadoContrato, EstadoPago
from datetime import date
from decimal import Decimal

def seed_data():
    db: Session = SessionLocal()
    
    # Verificar si ya hay datos
    if db.query(Departamento).count() > 0:
        print("La base de datos ya contiene datos. No se insertarán datos de prueba.")
        return

    print("Insertando datos de prueba...")

    # 1. Departamentos
    d1 = Departamento(
        alias="Depto 1A - Centro",
        direccion="Av. San Martín 1500, Piso 1, Dpto A",
        propietario_nombre="Juan Pérez",
        tipo="departamento",
        servicios_incluidos="Agua, Municipal",
        seguro_poliza="Sancor-123456",
        seguro_vencimiento=date(2025, 12, 31),
        estado=EstadoDepartamento.ALQUILADO,
        notas_inventario="Pintura nueva, piso parquet pulido."
    )
    
    d2 = Departamento(
        alias="Casa Quinta - Norte",
        direccion="Los Álamos 400",
        propietario_nombre="María González",
        tipo="casa",
        servicios_incluidos="Jardinero, Piletero",
        seguro_poliza="Federacion-987654",
        seguro_vencimiento=date(2025, 10, 15),
        estado=EstadoDepartamento.VACIO,
        notas_inventario="Requiere revisión de techo."
    )

    db.add(d1)
    db.add(d2)
    db.commit()
    db.refresh(d1)
    db.refresh(d2)

    # 2. Inquilinos
    i1 = Inquilino(
        nombre_apellido="Carlos López",
        dni="20-12345678-9",
        email="carlos.lopez@email.com",
        telefono="+54 9 11 1234 5678",
        canal_comunicacion="WhatsApp",
        estado=EstadoInquilino.ACTIVO
    )

    db.add(i1)
    db.commit()
    db.refresh(i1)

    # 3. Contratos
    c1 = Contrato(
        departamento_id=d1.id,
        inquilino_id=i1.id,
        fecha_inicio=date(2024, 1, 1),
        fecha_fin=date(2026, 1, 1),
        monto_inicial=Decimal("150000.00"),
        deposito_garantia=Decimal("150000.00"),
        contrato_firmado_url=None,
        estado=EstadoContrato.ACTIVO
    )

    db.add(c1)
    db.commit()
    db.refresh(c1)

    # 4. Pagos
    # Pago 1: Mes anterior (Cobrado)
    p1 = Pago(
        contrato_id=c1.id,
        periodo="2024-03",
        monto_alquiler=Decimal("150000.00"),
        monto_expensas=Decimal("25000.00"),
        monto_servicios=Decimal("5000.00"),
        fecha_pago=date(2024, 3, 10),
        estado=EstadoPago.COBRADO
    )

    # Pago 2: Mes actual (Pendiente)
    p2 = Pago(
        contrato_id=c1.id,
        periodo="2024-04",
        monto_alquiler=Decimal("150000.00"),
        monto_expensas=Decimal("28000.00"),
        monto_servicios=Decimal("5000.00"),
        estado=EstadoPago.PENDIENTE
    )

    db.add(p1)
    db.add(p2)
    db.commit()

    print("✅ Datos de prueba insertados correctamente (OIKOS Structure).")
    db.close()

if __name__ == "__main__":
    init_db() # Asegura que las tablas existan
    seed_data()
