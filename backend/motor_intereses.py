
from sqlalchemy.orm import Session
from models import Pago, EstadoPago
from datetime import date, datetime
from decimal import Decimal

# === CONFIGURACIÓN ===
DIA_VENCIMIENTO = 10
# Tasa diaria de mora (ejemplo: 0.5% por día de retraso)
# Se aplica sobre el monto base (Alquiler + Expensas + Servicios)
TASA_DIARIA_MORA = Decimal('0.005') 

def calcular_mora_pagos(db: Session, dry_run: bool = False):
    """
    Recorre todos los pagos PENDIENTES.
    Si la fecha actual es mayor al día 10 del periodo correspondiente, aplica mora automatica.
    """
    pagos_pendientes = db.query(Pago).filter(Pago.estado == EstadoPago.PENDIENTE).all()
    today = date.today()
    
    count_actualizados = 0
    total_mora_calculada = Decimal('0')
    
    print(f"🔄 [Motor Mora] Analizando {len(pagos_pendientes)} pagos pendientes...")
    
    for pago in pagos_pendientes:
        # 1. Determinar fecha de vencimiento
        # El periodo viene como "YYYY-MM". El vencimiento es el dia 10 de ese mes.
        try:
            year, month = map(int, pago.periodo.split('-'))
            fecha_vencimiento = date(year, month, DIA_VENCIMIENTO)
        except ValueError:
            print(f"  ⚠️ Error parseando periodo '{pago.periodo}' para pago ID {pago.id}")
            continue
            
        # 2. Calcular días de retraso
        if today > fecha_vencimiento:
            dias_retraso = (today - fecha_vencimiento).days
            
            # 3. Calcular monto mora
            monto_base = pago.monto_alquiler + pago.monto_expensas + pago.monto_servicios
            monto_mora_nuevo = monto_base * TASA_DIARIA_MORA * Decimal(dias_retraso)
            
            # Redondear a 2 decimales
            monto_mora_nuevo = monto_mora_nuevo.quantize(Decimal('0.01'))
            
            if monto_mora_nuevo > 0:
                if not dry_run:
                    # Actualizar si cambió
                    if pago.monto_mora != monto_mora_nuevo:
                        pago.monto_mora = monto_mora_nuevo
                        count_actualizados += 1
                        print(f"  💸 Pago ID {pago.id} ({pago.periodo}): {dias_retraso} días de atraso. Mora: ${monto_mora_nuevo}")
                
                total_mora_calculada += monto_mora_nuevo
        else:
            # Aún no vence, asegurar que mora sea 0
            if pago.monto_mora > 0 and not dry_run:
                pago.monto_mora = 0
                count_actualizados += 1
                # print(f"  ℹ️ Pago ID {pago.id}: Aún en fecha. Mora reseteada.")

    if not dry_run:
        db.commit()
        print(f"✅ Se actualizaron {count_actualizados} pagos con recargos.")
    else:
        print(f"ℹ️ (Dry Run) Se hubieran actualizado {count_actualizados} pagos.")
        
    return count_actualizados
