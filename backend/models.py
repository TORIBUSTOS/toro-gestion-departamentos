"""
Modelos de base de datos para el sistema de gestión de departamentos.
Define las entidades: Departamento, Inquilino, Contrato y Pago.
"""
from sqlalchemy import (
    Column, Integer, String, Date, DateTime, Text, 
    Decimal, ForeignKey, Enum, CheckConstraint, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from database import Base


# Enums para los estados
class EstadoDepartamento(str, enum.Enum):
    ALQUILADO = "ALQUILADO"
    VACIO = "VACIO"
    REFACCION = "REFACCION"


class EstadoInquilino(str, enum.Enum):
    ACTIVO = "ACTIVO"
    INACTIVO = "INACTIVO"


class EstadoContrato(str, enum.Enum):
    ACTIVO = "ACTIVO"
    VENCIDO = "VENCIDO"
    RESCINDIDO = "RESCINDIDO"


class EstadoPago(str, enum.Enum):
    COBRADO = "COBRADO"
    PENDIENTE = "PENDIENTE"
    PARCIAL = "PARCIAL"


class Departamento(Base):
    """
    Representa una unidad de propiedad (departamento, casa, monoambiente, cochera, etc.)
    """
    __tablename__ = "departamentos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    alias = Column(String(100), nullable=False, unique=True, index=True)
    direccion = Column(String(255), nullable=False)
    tipo = Column(String(50), nullable=False)  # dpto/casa/monoambiente/cochera
    estado = Column(
        Enum(EstadoDepartamento),
        nullable=False,
        default=EstadoDepartamento.VACIO,
        index=True
    )
    fecha_estado_desde = Column(Date, nullable=False)
    notas = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relaciones
    contratos = relationship("Contrato", back_populates="departamento", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Departamento(id={self.id}, alias='{self.alias}', estado='{self.estado}')>"


class Inquilino(Base):
    """
    Información de los inquilinos que alquilan departamentos.
    """
    __tablename__ = "inquilinos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_apellido = Column(String(200), nullable=False)
    dni = Column(String(20), nullable=True, unique=True, index=True)
    telefono = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    notas = Column(Text, nullable=True)
    estado = Column(
        Enum(EstadoInquilino),
        nullable=False,
        default=EstadoInquilino.ACTIVO,
        index=True
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relaciones
    contratos = relationship("Contrato", back_populates="inquilino")

    def __repr__(self):
        return f"<Inquilino(id={self.id}, nombre='{self.nombre_apellido}')>"


class Contrato(Base):
    """
    Relación contractual entre un departamento y un inquilino.
    """
    __tablename__ = "contratos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    departamento_id = Column(
        Integer,
        ForeignKey("departamentos.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    inquilino_id = Column(
        Integer,
        ForeignKey("inquilinos.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False, index=True)
    monto_inicial = Column(Decimal(10, 2), nullable=False)
    monto_actual = Column(Decimal(10, 2), nullable=False)
    regla_ajuste = Column(String(255), nullable=True)
    proximo_ajuste_fecha = Column(Date, nullable=True)
    deposito_garantia = Column(Decimal(10, 2), nullable=True)
    estado = Column(
        Enum(EstadoContrato),
        nullable=False,
        default=EstadoContrato.ACTIVO,
        index=True
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relaciones
    departamento = relationship("Departamento", back_populates="contratos")
    inquilino = relationship("Inquilino", back_populates="contratos")
    pagos = relationship("Pago", back_populates="contrato", cascade="all, delete-orphan")

    # Constraints
    __table_args__ = (
        CheckConstraint("fecha_fin > fecha_inicio", name="check_fecha_fin_mayor_inicio"),
    )

    def __repr__(self):
        return f"<Contrato(id={self.id}, depto_id={self.departamento_id}, estado='{self.estado}')>"


class Pago(Base):
    """
    Registro de pagos realizados por período (mes) en formato YYYY-MM.
    """
    __tablename__ = "pagos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    contrato_id = Column(
        Integer,
        ForeignKey("contratos.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    periodo = Column(String(7), nullable=False, index=True)  # Formato YYYY-MM
    fecha_pago = Column(Date, nullable=True)
    monto_pagado = Column(Decimal(10, 2), nullable=False)
    medio_pago = Column(String(50), nullable=True)
    observacion = Column(Text, nullable=True)
    estado = Column(
        Enum(EstadoPago),
        nullable=False,
        default=EstadoPago.PENDIENTE,
        index=True
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relaciones
    contrato = relationship("Contrato", back_populates="pagos")

    # Constraints
    __table_args__ = (
        UniqueConstraint("contrato_id", "periodo", name="uq_contrato_periodo"),
        # Nota: La validación del formato YYYY-MM se hará a nivel de aplicación
    )

    def __repr__(self):
        return f"<Pago(id={self.id}, contrato_id={self.contrato_id}, periodo='{self.periodo}')>"

