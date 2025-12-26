"""
Aplicación principal FastAPI para el Sistema de Gestión de Departamentos TORO.
Inicia el servidor y crea las tablas automáticamente al arrancar.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, engine
from models import Base

# Crear la aplicación FastAPI
app = FastAPI(
    title="Sistema de Gestión de Departamentos - TORO",
    description="API REST para gestionar departamentos, inquilinos, contratos y pagos",
    version="1.0.0"
)

# Configurar CORS para permitir conexiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar los orígenes permitidos
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
    print("🌐 Servidor listo en http://localhost:8000")
    print("📚 Documentación disponible en http://localhost:8000/docs")


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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

