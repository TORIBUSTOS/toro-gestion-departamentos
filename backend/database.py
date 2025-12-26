"""
Configuración de la base de datos SQLite para el sistema de gestión de departamentos.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL de la base de datos SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./toro_gestion.db"

# Crear el motor de la base de datos
# connect_args={"check_same_thread": False} es necesario para SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False  # Cambiar a True para ver las queries SQL en consola
)

# Crear la clase base para los modelos
Base = declarative_base()

# Crear la fábrica de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """
    Dependency para obtener una sesión de base de datos.
    Usar con FastAPI: @app.get("/items") def read_items(db: Session = Depends(get_db))
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Inicializa la base de datos creando todas las tablas.
    """
    Base.metadata.create_all(bind=engine)

