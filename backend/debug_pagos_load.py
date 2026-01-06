
from database import SessionLocal
from models import Pago
from schemas import PagoResponse
import traceback

def debug_pagos():
    db = SessionLocal()
    try:
        pagos = db.query(Pago).all()
        for p in pagos:
            try:
                PagoResponse.model_validate(p)
            except Exception:
                print(f"FAILED Payment ID {p.id}:")
                traceback.print_exc()
                break # Just show one error
                
    finally:
        db.close()

if __name__ == "__main__":
    debug_pagos()
