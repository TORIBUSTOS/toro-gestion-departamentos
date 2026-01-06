import pandas as pd
import os
import sys
from datetime import date, datetime, timedelta
from database import SessionLocal, init_db, engine
from models import Base, Departamento, Inquilino, Contrato, Pago, EstadoContrato, EstadoPago
from sqlalchemy import text

FILENAME = "../OIKOS_Datos_Maestros.xlsx"

# Valores por defecto para datos faltantes
DEFAULT_DATE_START = date.today()
DEFAULT_DATE_END = date.today() + timedelta(days=365) # 1 año por defecto

def clean_value(val, default=None):
    if pd.isna(val):
        return default
    s = str(val).strip()
    if s.lower() in ['nan', 'none', 'null', '', 'a completar', 'constatar', 'verificar', 'no', 'ninguno', 'no necesita', 'a digitalizar', '-']:
        return default
    return s

def parse_date_smart(val, default=None):
    cleaned = clean_value(val)
    if cleaned is None:
        return default
    try:
        return pd.to_datetime(cleaned).date()
    except:
        return default

def parse_money(val):
    if pd.isna(val): return 0
    s = str(val).replace('$', '').replace('.', '').replace(',', '.').strip()
    try:
        return float(val)
    except:
        return 0

def run_import():
    print("🚀 Iniciando Importación Inteligente OIKOS (V3 match models.py)...")
    
    if not os.path.exists(FILENAME):
        print(f"❌ Archivo no encontrado: {FILENAME}")
        return

    # 1. Reset DB
    print("🧹 Limpiando base de datos...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    session = SessionLocal()
    
    # Cargar DataFrames
    try:
        xls = pd.ExcelFile(FILENAME)
        df_deptos = pd.read_excel(xls, 'Departamentos')
        df_inquilinos = pd.read_excel(xls, 'Inquilinos')
        df_contratos = pd.read_excel(xls, 'Contratos')
    except Exception as e:
        print(f"❌ Error leyendo Excel: {e}")
        return

    # --- DEPARTAMENTOS ---
    print(f"🏢 Procesando {len(df_deptos)} departamentos...")
    deptos_map = {} # alias -> id
    
    for _, row in df_deptos.iterrows():
        alias = str(row['alias']).strip()
        
        # Mapeo estricto a models.py (Departamento)
        d = Departamento(
            alias=alias,
            direccion=str(row['direccion']),
            propietario_nombre=clean_value(row['propietario_nombre']),
            tipo=clean_value(row['tipo'], 'departamento'),
            servicios_incluidos=clean_value(row['servicios_incluidos']),
            seguro_poliza=clean_value(row['seguro_poliza']),
            seguro_vencimiento=parse_date_smart(row['seguro_vencimiento']),
            estado=clean_value(row['estado'], 'VACIO'),
            notas_inventario=clean_value(row['notas_inventario'])
        )
        session.add(d)
        session.flush()
        deptos_map[alias] = d.id
    
    print("✅ Departamentos cargados.")

    # --- INQUILINOS ---
    print(f"👥 Procesando {len(df_inquilinos)} inquilinos...")
    inquilinos_map = {} # nombre -> id
    
    for _, row in df_inquilinos.iterrows():
        nombre = str(row['nombre_apellido']).strip()
        
        # Mapeo estricto a models.py (Inquilino)
        # dni es Unique, pero si viene None, debería permitirse... 
        # Si 'clean_value' retorna None, SQLAlchemy intentará insertar NULL.
        # SQLite NULL en Unique columna: permite múltiples NULLs? Sí, estándar SQL.
        
        i = Inquilino(
            nombre_apellido=nombre,
            dni=clean_value(row['dni']), 
            telefono=clean_value(row['telefono']),
            email=clean_value(row['email']),
            canal_comunicacion=clean_value(row['canal_comunicacion'], 'WhatsApp'),
            estado=clean_value(row['estado'], 'ACTIVO')
        )
        session.add(i)
        session.flush()
        inquilinos_map[nombre] = i.id
    
    print("✅ Inquilinos cargados.")

    # --- CONTRATOS ---
    print(f"📜 Procesando {len(df_contratos)} contratos...")
    cnt_ok = 0
    cnt_skip = 0
    
    for _, row in df_contratos.iterrows():
        depto_alias = str(row['departamento_alias']).strip()
        inq_name = str(row['inquilino_name']).strip()
        
        if depto_alias not in deptos_map:
            print(f"⚠️ Salto contrato: Depto '{depto_alias}' no existe.")
            cnt_skip += 1
            continue
        
        inq_id = inquilinos_map.get(inq_name)
        if not inq_id:
            # Fallback
            for k, v in inquilinos_map.items():
                if k.lower().startswith(inq_name.lower().split('/')[0]):
                     inq_id = v
                     break
        
        if not inq_id:
            print(f"⚠️ Salto contrato: Inquilino '{inq_name}' no encontrado. (Disponible: {list(inquilinos_map.keys())})")
            cnt_skip += 1
            continue

        f_inicio = parse_date_smart(row['fecha_inicio'], DEFAULT_DATE_START)
        f_fin = parse_date_smart(row['fecha_fin'], DEFAULT_DATE_END)
        
        if f_fin <= f_inicio:
            f_fin = f_inicio + timedelta(days=365)

        monto = parse_money(row['monto_actual'])
        
        # Mapeo estricto a models.py (Contrato)
        c = Contrato(
            departamento_id=deptos_map[depto_alias],
            inquilino_id=inq_id,
            fecha_inicio=f_inicio,
            fecha_fin=f_fin,
            monto_inicial=monto, # models.py usa 'monto_inicial'
            deposito_garantia=parse_money(row['deposito_garantia']),
            contrato_firmado_url=clean_value(row['contrato_firmado_url']),
            estado=EstadoContrato.ACTIVO
        )
        session.add(c)
        cnt_ok += 1

    session.commit()
    print(f"✅ Contratos cargados: {cnt_ok} (Omitidos: {cnt_skip})")
    print(f"✨ Importación finalizada.")

if __name__ == "__main__":
    run_import()
