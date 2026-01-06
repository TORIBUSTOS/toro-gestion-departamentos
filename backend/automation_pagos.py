
from sqlalchemy.orm import Session
from models import Contrato, Pago, EstadoContrato, EstadoPago
from datetime import date, datetime
import calendar

def generar_cuotas_mensuales(db: Session, periodo: str = None):
    """
    Genera automáticamente las cuotas de pago para todos los contratos activos del periodo dado.
    Si no se especifica periodo, usa el mes actual (YYYY-MM).
    """
    if not periodo:
        today = date.today()
        periodo = f"{today.year}-{today.month:02d}"
    
    print(f"🔄 Iniciando generación de cuotas para el periodo: {periodo}")
    
    # 1. Obtener contratos activos
    contratos_activos = db.query(Contrato).filter(Contrato.estado == EstadoContrato.ACTIVO).all()
    count_generados = 0
    count_existentes = 0
    
    for contrato in contratos_activos:
        # Verificar vigencia del contrato para este periodo
        # Omitimos lógica compleja de dias por ahora, asumimos que si está activo, paga el mes.
        
        # 2. Verificar si ya existe pago para este periodo
        pago_existente = db.query(Pago).filter(
            Pago.contrato_id == contrato.id,
            Pago.periodo == periodo
        ).first()
        
        if pago_existente:
            count_existentes += 1
            print(f"  ℹ️ Contrato {contrato.id}: Cuota {periodo} ya existe (ID Pago: {pago_existente.id})")
            continue
            
        # 3. Crear nuevo pago
        # NOTA: Aquí podríamos usar lógica de indexación si tuvieramos historial de actualizaciones
        # Por ahora usamos monto_inicial como monto vigente.
        nuevo_pago = Pago(
            contrato_id=contrato.id,
            periodo=periodo,
            monto_alquiler=contrato.monto_inicial, # Debería ser monto_actual si existiera esa columna
            monto_expensas=0,
            monto_servicios=0,
            estado=EstadoPago.PENDIENTE,
            # fecha_pago se deja en None hasta que paguen
        )
        
        db.add(nuevo_pago)
        count_generados += 1
        print(f"  ✅ Contrato {contrato.id}: Generada cuota {periodo} por ${contrato.monto_inicial}")
        
    db.commit()
    return count_generados, count_existentes
