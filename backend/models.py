from sqlalchemy import Column, Integer, String, Date, DateTime, Text, Numeric, ForeignKey, Enum, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base

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
    __tablename__ = "departamentos"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    alias = Column(String(100), nullable=False, unique=True, index=True)
    direccion = Column(String(255), nullable=False)
    propietario_nombre = Column(String(100), nullable=True)
    tipo = Column(String(50), nullable=False)
    servicios_incluidos = Column(Text, nullable=True)
    seguro_poliza = Column(String(100), nullable=True)
    seguro_vencimiento = Column(Date, nullable=True)
    estado = Column(Enum(EstadoDepartamento), default=EstadoDepartamento.VACIO)
    notas_inventario = Column(Text, nullable=True)
    contratos = relationship("Contrato", back_populates="departamento", cascade="all, delete-orphan")

class Inquilino(Base):
    __tablename__ = "inquilinos"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_apellido = Column(String(200), nullable=False)
    dni = Column(String(20), unique=True, index=True)
    telefono = Column(String(50))
    email = Column(String(255))
    canal_comunicacion = Column(String(50), default="WhatsApp")
    estado = Column(Enum(EstadoInquilino), default=EstadoInquilino.ACTIVO)
    contratos = relationship("Contrato", back_populates="inquilino")

class Contrato(Base):
    __tablename__ = "contratos"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    departamento_id = Column(Integer, ForeignKey("departamentos.id", ondelete="CASCADE"))
    inquilino_id = Column(Integer, ForeignKey("inquilinos.id", ondelete="RESTRICT"))
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    monto_inicial = Column(Numeric(10, 2), nullable=False)
    deposito_garantia = Column(Numeric(10, 2), nullable=True)
    contrato_firmado_url = Column(String(255), nullable=True)
    proxima_actualizacion = Column(Date, nullable=True)
    porcentaje_actualizacion = Column(Numeric(5, 2), nullable=True)
    estado = Column(Enum(EstadoContrato), default=EstadoContrato.ACTIVO)
    departamento = relationship("Departamento", back_populates="contratos")
    inquilino = relationship("Inquilino", back_populates="contratos")
    pagos = relationship("Pago", back_populates="contrato", cascade="all, delete-orphan")

class Pago(Base):
    __tablename__ = "pagos"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    contrato_id = Column(Integer, ForeignKey("contratos.id", ondelete="CASCADE"))
    periodo = Column(String(7), nullable=False)
    monto_alquiler = Column(Numeric(10, 2), nullable=False)
    monto_expensas = Column(Numeric(10, 2), default=0)
    monto_servicios = Column(Numeric(10, 2), default=0)
    fecha_pago = Column(Date, nullable=True)
    estado = Column(Enum(EstadoPago), default=EstadoPago.PENDIENTE)
    monto_mora = Column(Numeric(10, 2), default=0)
    contrato = relationship("Contrato", back_populates="pagos")
