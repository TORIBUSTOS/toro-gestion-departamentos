# Contexto del Proyecto TORO - Gestión de Departamentos

Este archivo describe el estado actual del sistema y la estructura de archivos para facilitar la comprensión por parte de desarrolladores o asistentes de IA.

## 📌 Descripción General
El sistema es una aplicación web para la gestión de departamentos, inquilinos, contratos y pagos.
- **Objetivo**: Administrar el alquiler de propiedades de forma simple y eficiente.
- **Estado Actual**: MVP v1 en desarrollo. Funcionalidades Core (CRUDs) implementadas con integración Frontend-Backend.

## 🛠 Tech Stack
- **Frontend**: React (Vite), JavaScript, Vanilla CSS / Tailwind (según configuración).
- **Backend**: Python (FastAPI), SQLAlchemy, SQLite (archivo `toro_gestion.db`).

## 📂 Estructura de Archivos y Rutas Clave

### Raíz
- `README.md`: Descripción general del proyecto.
- `TORO_Departamentos_Roadmap_Diagrama_Estructura_Checklist.md`: Hoja de ruta, diagramas de flujo y checklist de progreso.
- `iniciar_sistema.bat`: Script para iniciar backend y frontend en Windows.

### Backend (`/backend`)
La lógica del servidor y la base de datos.
- `main.py`: **Punto de entrada**. Define endpoints de la API (Departamentos, Inquilinos, Contratos, Pagos, Configuración).
- `models.py`: Definición de tablas de base de datos (SQLAlchemy).
- `schemas.py`: Esquemas de validación de datos (Pydantic) para entrada/salida de API.
- `database.py`: Configuración de conexión a SQLite.
- `populate_db.py`: Script para cargar datos iniciales de prueba.
- `toro_gestion.db`: Archivo de base de datos SQLite.

### Frontend (`/frontend`)
Interfaz de usuario React.
- `src/App.jsx`: **Router principal** y Layout. Contiene también el componente **Dashboard** (Vista principal).
- `src/views/`: Componentes de página (Vistas).
  - `Departamentos.jsx`: Gestión de departamentos.
  - `Inquilinos.jsx`: Gestión de inquilinos.
  - `Contratos.jsx`: Gestión de contratos.
  - `Pagos.jsx`: Registro e historial de pagos.
  - `Configuracion.jsx`: Configuración del sistema.
- `src/services/`: Comunicación con la API.
  - `api.js`: Instancia de Axios para llamadas al backend.

## ✅ Estado de Funcionalidades (Snapshot)
- **Navegación**: Configurada en `App.jsx` para todas las vistas principales.
- **Backend API**: Endpoints CRUD activos en `main.py`.
- **Integración**: El frontend consume la API del backend.
- **Pendientes Recientes**: Verificación de tipos de datos en la creación (enum mismatches), ajustes finales en "Configuración".

## 🚀 Cómo correr el proyecto
1. Ejecutar `iniciar_sistema.bat` en Windows.
   - O manualmente:
     - Term 1 (Backend): `cd backend` -> `venv\Scripts\activate` -> `uvicorn main:app --reload`
     - Term 2 (Frontend): `cd frontend` -> `npm run dev`
