from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from models import EstadoDepartamento, EstadoInquilino, EstadoContrato, EstadoPago

#Nota: Mantenemos el sufijo "Response" para evitar conflictos de nombres con los modelos SQLAlchemy en main.py

# ============================================================================
# SCHEMAS DEPARTAMENTOS
# ============================================================================
class DepartamentoBase(BaseModel):
    alias: str = Field(..., max_length=100)
    direccion: str = Field(..., max_length=255)
    propietario_nombre: Optional[str] = Field(None, max_length=100)
    servicios_incluidos: Optional[str] = None
    seguro_poliza: Optional[str] = Field(None, max_length=100)
    seguro_vencimiento: Optional[date] = None
    estado: EstadoDepartamento = EstadoDepartamento.VACIO
    notas_estado_inicial: Optional[str] = None

class DepartamentoCreate(DepartamentoBase):
    pass

class DepartamentoUpdate(BaseModel):
    alias: Optional[str] = None
    direccion: Optional[str] = None
    propietario_nombre: Optional[str] = None
    servicios_incluidos: Optional[str] = None
    seguro_poliza: Optional[str] = None
    seguro_vencimiento: Optional[date] = None
    estado: Optional[EstadoDepartamento] = None
    notas_estado_inicial: Optional[str] = None

class DepartamentoResponse(DepartamentoBase):
    id: int
    
    class Config:
        from_attributes = True

# ============================================================================
# SCHEMAS PAGOS
# ============================================================================
class PagoBase(BaseModel):
    contrato_id: int
    periodo: str = Field(..., description="Periodo en formato YYYY-MM")
    monto_alquiler: Decimal
    monto_expensas: Decimal = Decimal(0)
    monto_servicios: Decimal = Decimal(0)
    monto_mora: Decimal = Decimal(0)
    estado: EstadoPago = EstadoPago.PENDIENTE
    fecha_pago: Optional[date] = None

class PagoCreate(PagoBase):
    pass

class PagoUpdate(BaseModel):
    contrato_id: Optional[int] = None
    periodo: Optional[str] = None
    monto_alquiler: Optional[Decimal] = None
    monto_expensas: Optional[Decimal] = None
    monto_servicios: Optional[Decimal] = None
    monto_mora: Optional[Decimal] = None
    estado: Optional[EstadoPago] = None
    fecha_pago: Optional[date] = None

class PagoResponse(PagoBase):
    id: int

    class Config:
        from_attributes = True

# ============================================================================
# SCHEMAS INQUILINOS
# ============================================================================
class InquilinoBase(BaseModel):
    nombre_apellido: str = Field(..., max_length=100)
    dni_cuit: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=100)
    telefono: Optional[str] = Field(None, max_length=50)
    canal_comunicacion: str = Field("WhatsApp", max_length=50)
    estado: EstadoInquilino = EstadoInquilino.ACTIVO

class InquilinoCreate(InquilinoBase):
    pass

class InquilinoUpdate(BaseModel):
    nombre_apellido: Optional[str] = None
    dni_cuit: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    canal_comunicacion: Optional[str] = None
    estado: Optional[EstadoInquilino] = None

class InquilinoResponse(InquilinoBase):
    id: int

    class Config:
        from_attributes = True

# ============================================================================
# SCHEMAS CONTRATOS
# ============================================================================
class ContratoBase(BaseModel):
    departamento_id: int
    inquilino_id: int
    fecha_inicio: date
    fecha_fin: date
    monto_inicial: Decimal
    deposito_garantia: Optional[Decimal] = None
    deposito_devuelto: bool = False
    contrato_firmado_url: Optional[str] = None
    proxima_actualizacion: Optional[date] = None
    porcentaje_actualizacion: Optional[Decimal] = None
    estado: EstadoContrato = EstadoContrato.ACTIVO

class ContratoCreate(ContratoBase):
    pass

class ContratoUpdate(BaseModel):
    departamento_id: Optional[int] = None
    inquilino_id: Optional[int] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    monto_inicial: Optional[Decimal] = None
    deposito_garantia: Optional[Decimal] = None
    deposito_devuelto: Optional[bool] = None
    contrato_firmado_url: Optional[str] = None
    proxima_actualizacion: Optional[date] = None
    porcentaje_actualizacion: Optional[Decimal] = None
    estado: Optional[EstadoContrato] = None

class ContratoResponse(ContratoBase):
    id: int
    pagos: List[PagoResponse] = []

    class Config:
        from_attributes = True

class ContratoResponseDetallado(ContratoResponse):
    departamento: Optional[DepartamentoResponse] = None
    inquilino: Optional[InquilinoResponse] = None

    class Config:
        from_attributes = True
