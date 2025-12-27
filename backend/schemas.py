"""
Esquemas Pydantic para validación y serialización de datos.
Define los modelos de entrada y salida para la API.
"""
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal

from .models import (
    EstadoDepartamento,
    EstadoInquilino,
    EstadoContrato
)


# ============================================================================
# ESQUEMAS DE DEPARTAMENTO
# ============================================================================

class DepartamentoBase(BaseModel):
    """Esquema base para Departamento"""
    alias: str = Field(..., max_length=100, description="Nombre identificatorio del departamento")
    direccion: str = Field(..., max_length=255, description="Dirección completa")
    tipo: str = Field(..., max_length=50, description="Tipo de propiedad (dpto/casa/monoambiente/cochera)")
    estado: EstadoDepartamento = Field(default=EstadoDepartamento.VACIO, description="Estado actual")
    fecha_estado_desde: date = Field(..., description="Fecha desde que está en el estado actual")
    notas: Optional[str] = Field(None, description="Notas adicionales")


class DepartamentoCreate(DepartamentoBase):
    """Esquema para crear un nuevo departamento"""
    pass


class DepartamentoUpdate(BaseModel):
    """Esquema para actualizar un departamento (todos los campos opcionales)"""
    alias: Optional[str] = Field(None, max_length=100)
    direccion: Optional[str] = Field(None, max_length=255)
    tipo: Optional[str] = Field(None, max_length=50)
    estado: Optional[EstadoDepartamento] = None
    fecha_estado_desde: Optional[date] = None
    notas: Optional[str] = None


class DepartamentoResponse(DepartamentoBase):
    """Esquema de respuesta para Departamento"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Permite crear desde ORM (antes orm_mode)


# ============================================================================
# ESQUEMAS DE INQUILINO
# ============================================================================

class InquilinoBase(BaseModel):
    """Esquema base para Inquilino"""
    nombre_apellido: str = Field(..., max_length=200, description="Nombre completo")
    dni: Optional[str] = Field(None, max_length=20, description="Documento Nacional de Identidad")
    telefono: Optional[str] = Field(None, max_length=50, description="Teléfono de contacto")
    email: Optional[EmailStr] = Field(None, description="Correo electrónico")
    notas: Optional[str] = Field(None, description="Notas adicionales")
    estado: EstadoInquilino = Field(default=EstadoInquilino.ACTIVO, description="Estado del inquilino")


class InquilinoCreate(InquilinoBase):
    """Esquema para crear un nuevo inquilino"""
    pass


class InquilinoUpdate(BaseModel):
    """Esquema para actualizar un inquilino (todos los campos opcionales)"""
    nombre_apellido: Optional[str] = Field(None, max_length=200)
    dni: Optional[str] = Field(None, max_length=20)
    telefono: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = None
    notas: Optional[str] = None
    estado: Optional[EstadoInquilino] = None


class InquilinoResponse(InquilinoBase):
    """Esquema de respuesta para Inquilino"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# ESQUEMAS DE CONTRATO
# ============================================================================

class ContratoBase(BaseModel):
    """Esquema base para Contrato"""
    departamento_id: int = Field(..., description="ID del departamento")
    inquilino_id: int = Field(..., description="ID del inquilino")
    fecha_inicio: date = Field(..., description="Fecha de inicio del contrato")
    fecha_fin: date = Field(..., description="Fecha de finalización del contrato")
    monto_inicial: Decimal = Field(..., decimal_places=2, description="Monto inicial del alquiler")
    monto_actual: Decimal = Field(..., decimal_places=2, description="Monto actual del alquiler")
    regla_ajuste: Optional[str] = Field(None, max_length=255, description="Regla de ajuste")
    proximo_ajuste_fecha: Optional[date] = Field(None, description="Fecha del próximo ajuste")
    deposito_garantia: Optional[Decimal] = Field(None, decimal_places=2, description="Depósito de garantía")
    estado: EstadoContrato = Field(default=EstadoContrato.ACTIVO, description="Estado del contrato")

    @model_validator(mode='after')
    def fecha_fin_mayor_que_inicio(self):
        """Valida que fecha_fin sea mayor que fecha_inicio"""
        if self.fecha_fin <= self.fecha_inicio:
            raise ValueError('fecha_fin debe ser mayor que fecha_inicio')
        return self


class ContratoCreate(ContratoBase):
    """Esquema para crear un nuevo contrato"""
    pass


class ContratoUpdate(BaseModel):
    """Esquema para actualizar un contrato (todos los campos opcionales)"""
    departamento_id: Optional[int] = None
    inquilino_id: Optional[int] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    monto_inicial: Optional[Decimal] = Field(None, decimal_places=2)
    monto_actual: Optional[Decimal] = Field(None, decimal_places=2)
    regla_ajuste: Optional[str] = Field(None, max_length=255)
    proximo_ajuste_fecha: Optional[date] = None
    deposito_garantia: Optional[Decimal] = Field(None, decimal_places=2)
    estado: Optional[EstadoContrato] = None


class ContratoResponse(ContratoBase):
    """Esquema de respuesta para Contrato"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ContratoResponseDetallado(ContratoResponse):
    """Esquema de respuesta para Contrato con información relacionada"""
    departamento: Optional[DepartamentoResponse] = None
    inquilino: Optional[InquilinoResponse] = None

    class Config:
        from_attributes = True

