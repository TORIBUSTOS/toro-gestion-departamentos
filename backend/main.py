"""
Aplicación principal FastAPI para el Sistema de Gestión de Departamentos TORO.
Inicia el servidor y crea las tablas automáticamente al arrancar.
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import init_db, engine, get_db
from models import Base, Departamento, Inquilino, Contrato, EstadoContrato
from schemas import (
    DepartamentoCreate,
    DepartamentoUpdate,
    DepartamentoResponse,
    InquilinoCreate,
    InquilinoUpdate,
    InquilinoResponse,
    ContratoCreate,
    ContratoUpdate,
    ContratoResponse,
    ContratoResponseDetallado
)

# Crear la aplicación FastAPI
app = FastAPI(
    title="Sistema de Gestión de Departamentos - TORO",
    description="API REST para gestionar departamentos, inquilinos, contratos y pagos",
    version="1.0.0"
)

# Configurar CORS para permitir conexiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],  # Puertos comunes de Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """
    Evento que se ejecuta al iniciar la aplicación.
    Crea todas las tablas de la base de datos si no existen.
    """
    print("🚀 Iniciando Sistema de Gestión de Departamentos TORO...")
    print("📊 Creando tablas de base de datos...")
    init_db()
    print("✅ Base de datos inicializada correctamente")
    print("🌐 Servidor listo en http://localhost:8001")
    print("📚 Documentación disponible en http://localhost:8001/docs")


@app.get("/")
async def root():
    """
    Endpoint raíz para verificar que el servidor está funcionando.
    """
    return {
        "message": "Sistema de Gestión de Departamentos TORO - API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """
    Endpoint de health check para verificar el estado del servicio.
    """
    return {
        "status": "healthy",
        "database": "connected"
    }


# ============================================================================
# ENDPOINTS CRUD - DEPARTAMENTOS
# ============================================================================

@app.get("/departamentos", response_model=List[DepartamentoResponse], tags=["Departamentos"])
def listar_departamentos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Lista todos los departamentos con paginación.
    """
    departamentos = db.query(Departamento).offset(skip).limit(limit).all()
    return departamentos


@app.get("/departamentos/{departamento_id}", response_model=DepartamentoResponse, tags=["Departamentos"])
def obtener_departamento(departamento_id: int, db: Session = Depends(get_db)):
    """
    Obtiene un departamento por su ID.
    """
    departamento = db.query(Departamento).filter(Departamento.id == departamento_id).first()
    if not departamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Departamento con ID {departamento_id} no encontrado"
        )
    return departamento


@app.post("/departamentos", response_model=DepartamentoResponse, status_code=status.HTTP_201_CREATED, tags=["Departamentos"])
def crear_departamento(departamento: DepartamentoCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo departamento.
    """
    # Verificar que el alias no exista
    existe = db.query(Departamento).filter(Departamento.alias == departamento.alias).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un departamento con el alias '{departamento.alias}'"
        )
    
    db_departamento = Departamento(**departamento.dict())
    db.add(db_departamento)
    db.commit()
    db.refresh(db_departamento)
    return db_departamento


@app.put("/departamentos/{departamento_id}", response_model=DepartamentoResponse, tags=["Departamentos"])
def actualizar_departamento(
    departamento_id: int,
    departamento: DepartamentoUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualiza un departamento existente.
    """
    db_departamento = db.query(Departamento).filter(Departamento.id == departamento_id).first()
    if not db_departamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Departamento con ID {departamento_id} no encontrado"
        )
    
    # Verificar alias único si se está actualizando
    if departamento.alias and departamento.alias != db_departamento.alias:
        existe = db.query(Departamento).filter(
            Departamento.alias == departamento.alias,
            Departamento.id != departamento_id
        ).first()
        if existe:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe un departamento con el alias '{departamento.alias}'"
            )
    
    # Actualizar solo los campos proporcionados
    update_data = departamento.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_departamento, field, value)
    
    db.commit()
    db.refresh(db_departamento)
    return db_departamento


@app.delete("/departamentos/{departamento_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Departamentos"])
def eliminar_departamento(departamento_id: int, db: Session = Depends(get_db)):
    """
    Elimina un departamento.
    """
    db_departamento = db.query(Departamento).filter(Departamento.id == departamento_id).first()
    if not db_departamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Departamento con ID {departamento_id} no encontrado"
        )
    
    db.delete(db_departamento)
    db.commit()
    return None


# ============================================================================
# ENDPOINTS CRUD - INQUILINOS
# ============================================================================

@app.get("/inquilinos", response_model=List[InquilinoResponse], tags=["Inquilinos"])
def listar_inquilinos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Lista todos los inquilinos con paginación.
    """
    inquilinos = db.query(Inquilino).offset(skip).limit(limit).all()
    return inquilinos


@app.get("/inquilinos/{inquilino_id}", response_model=InquilinoResponse, tags=["Inquilinos"])
def obtener_inquilino(inquilino_id: int, db: Session = Depends(get_db)):
    """
    Obtiene un inquilino por su ID.
    """
    inquilino = db.query(Inquilino).filter(Inquilino.id == inquilino_id).first()
    if not inquilino:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inquilino con ID {inquilino_id} no encontrado"
        )
    return inquilino


@app.post("/inquilinos", response_model=InquilinoResponse, status_code=status.HTTP_201_CREATED, tags=["Inquilinos"])
def crear_inquilino(inquilino: InquilinoCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo inquilino.
    """
    # Verificar que el DNI no exista (si se proporciona)
    if inquilino.dni:
        existe = db.query(Inquilino).filter(Inquilino.dni == inquilino.dni).first()
        if existe:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe un inquilino con el DNI '{inquilino.dni}'"
            )
    
    db_inquilino = Inquilino(**inquilino.dict())
    db.add(db_inquilino)
    db.commit()
    db.refresh(db_inquilino)
    return db_inquilino


@app.put("/inquilinos/{inquilino_id}", response_model=InquilinoResponse, tags=["Inquilinos"])
def actualizar_inquilino(
    inquilino_id: int,
    inquilino: InquilinoUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualiza un inquilino existente.
    """
    db_inquilino = db.query(Inquilino).filter(Inquilino.id == inquilino_id).first()
    if not db_inquilino:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inquilino con ID {inquilino_id} no encontrado"
        )
    
    # Verificar DNI único si se está actualizando
    if inquilino.dni and inquilino.dni != db_inquilino.dni:
        existe = db.query(Inquilino).filter(
            Inquilino.dni == inquilino.dni,
            Inquilino.id != inquilino_id
        ).first()
        if existe:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe un inquilino con el DNI '{inquilino.dni}'"
            )
    
    # Actualizar solo los campos proporcionados
    update_data = inquilino.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_inquilino, field, value)
    
    db.commit()
    db.refresh(db_inquilino)
    return db_inquilino


@app.delete("/inquilinos/{inquilino_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Inquilinos"])
def eliminar_inquilino(inquilino_id: int, db: Session = Depends(get_db)):
    """
    Elimina un inquilino.
    """
    db_inquilino = db.query(Inquilino).filter(Inquilino.id == inquilino_id).first()
    if not db_inquilino:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inquilino con ID {inquilino_id} no encontrado"
        )
    
    db.delete(db_inquilino)
    db.commit()
    return None


# ============================================================================
# ENDPOINTS CRUD - CONTRATOS
# ============================================================================

@app.get("/contratos", response_model=List[ContratoResponse], tags=["Contratos"])
def listar_contratos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Lista todos los contratos con paginación.
    """
    contratos = db.query(Contrato).offset(skip).limit(limit).all()
    return contratos


@app.get("/contratos/{contrato_id}", response_model=ContratoResponseDetallado, tags=["Contratos"])
def obtener_contrato(contrato_id: int, db: Session = Depends(get_db)):
    """
    Obtiene un contrato por su ID con información del departamento e inquilino.
    """
    contrato = db.query(Contrato).filter(Contrato.id == contrato_id).first()
    if not contrato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contrato con ID {contrato_id} no encontrado"
        )
    return contrato


@app.post("/contratos", response_model=ContratoResponse, status_code=status.HTTP_201_CREATED, tags=["Contratos"])
def crear_contrato(contrato: ContratoCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo contrato.
    Valida que el departamento e inquilino existan y que no haya otro contrato activo para el departamento.
    """
    # Verificar que el departamento existe
    departamento = db.query(Departamento).filter(Departamento.id == contrato.departamento_id).first()
    if not departamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Departamento con ID {contrato.departamento_id} no encontrado"
        )
    
    # Verificar que el inquilino existe
    inquilino = db.query(Inquilino).filter(Inquilino.id == contrato.inquilino_id).first()
    if not inquilino:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inquilino con ID {contrato.inquilino_id} no encontrado"
        )
    
    # Validar que no haya otro contrato activo para este departamento
    if contrato.estado == EstadoContrato.ACTIVO:
        contrato_activo = db.query(Contrato).filter(
            Contrato.departamento_id == contrato.departamento_id,
            Contrato.estado == EstadoContrato.ACTIVO
        ).first()
        if contrato_activo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El departamento {contrato.departamento_id} ya tiene un contrato activo"
            )
    
    # Validar que fecha_fin > fecha_inicio
    if contrato.fecha_fin <= contrato.fecha_inicio:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de fin debe ser mayor que la fecha de inicio"
        )
    
    db_contrato = Contrato(**contrato.dict())
    db.add(db_contrato)
    db.commit()
    db.refresh(db_contrato)
    return db_contrato


@app.put("/contratos/{contrato_id}", response_model=ContratoResponse, tags=["Contratos"])
def actualizar_contrato(
    contrato_id: int,
    contrato: ContratoUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualiza un contrato existente.
    """
    db_contrato = db.query(Contrato).filter(Contrato.id == contrato_id).first()
    if not db_contrato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contrato con ID {contrato_id} no encontrado"
        )
    
    # Validar departamento si se está actualizando
    if contrato.departamento_id:
        departamento = db.query(Departamento).filter(Departamento.id == contrato.departamento_id).first()
        if not departamento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Departamento con ID {contrato.departamento_id} no encontrado"
            )
    
    # Validar inquilino si se está actualizando
    if contrato.inquilino_id:
        inquilino = db.query(Inquilino).filter(Inquilino.id == contrato.inquilino_id).first()
        if not inquilino:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inquilino con ID {contrato.inquilino_id} no encontrado"
            )
    
    # Validar fechas si se están actualizando
    fecha_inicio = contrato.fecha_inicio if contrato.fecha_inicio else db_contrato.fecha_inicio
    fecha_fin = contrato.fecha_fin if contrato.fecha_fin else db_contrato.fecha_fin
    if fecha_fin <= fecha_inicio:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de fin debe ser mayor que la fecha de inicio"
        )
    
    # Validar contrato activo único si se está activando
    if contrato.estado == EstadoContrato.ACTIVO:
        depto_id = contrato.departamento_id if contrato.departamento_id else db_contrato.departamento_id
        contrato_activo = db.query(Contrato).filter(
            Contrato.departamento_id == depto_id,
            Contrato.estado == EstadoContrato.ACTIVO,
            Contrato.id != contrato_id
        ).first()
        if contrato_activo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El departamento {depto_id} ya tiene un contrato activo"
            )
    
    # Actualizar solo los campos proporcionados
    update_data = contrato.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_contrato, field, value)
    
    db.commit()
    db.refresh(db_contrato)
    return db_contrato


@app.delete("/contratos/{contrato_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Contratos"])
def eliminar_contrato(contrato_id: int, db: Session = Depends(get_db)):
    """
    Elimina un contrato.
    """
    db_contrato = db.query(Contrato).filter(Contrato.id == contrato_id).first()
    if not db_contrato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contrato con ID {contrato_id} no encontrado"
        )
    
    db.delete(db_contrato)
    db.commit()
    return None


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)

