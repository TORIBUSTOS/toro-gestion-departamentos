# Sistema de Gestión de Departamentos - TORO

## 📋 Descripción del Proyecto

Sistema simple y confiable para gestionar departamentos en alquiler: inventario, contratos, pagos, alertas y análisis patrimonial. Diseñado bajo el principio rector: **"si no ahorra memoria o pensamiento, no va"**.

## 🎯 Objetivos

- **MVP v1 (Operativo) ✅**: CRUD de Departamentos, Inquilinos, Contratos y Pagos con Dashboard básico
- **MVP v2 (Inteligente) ✅**: Sistema de alertas automáticas (vencimientos, mora, ajustes, vacancia)
- **v2.5 (Automatización Financiera) ✅**: Devengamiento automático de cuotas e intereses por mora.
- **v3 (Patrimonial)**: Histórico, rendimiento por departamento y registro de gastos

## 🤖 Automatizaciones Implementadas

### 1. Devengamiento Automático de Cuotas 📅
- El sistema detecta el inicio de cada mes.
- Genera automáticamente los registros de pago pendientes para todos los contratos activos.
- Evita duplicados inteligentemente.

### 2. Motor de Intereses (Mora) 💸
- **Vencimiento**: Día 10 de cada mes.
- **Cálculo**: A partir del día 11, se calcula mora diaria automática.
- **Tasa**: Configurable (Default: 0.5% diario).
- **Actualización**: El sistema revisa diariamente los pagos pendientes y actualiza el monto de mora.

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: Python 3.11+ con FastAPI
- **Base de Datos**: PostgreSQL (desarrollo) / SQLite (MVP inicial)
- **ORM**: SQLAlchemy
- **Autenticación**: JWT (futuro)
- **Validación**: Pydantic

### Frontend
- **Framework**: React 18+ con TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI o Tailwind CSS
- **State Management**: React Query / Zustand
- **Routing**: React Router

### DevOps
- **Control de Versiones**: Git
- **Containerización**: Docker (futuro)
- **CI/CD**: GitHub Actions (futuro)

## 📁 Estructura del Proyecto

```
.
├── backend/          # API REST con FastAPI
├── frontend/         # Aplicación React
├── docs/            # Documentación técnica
├── scripts/         # Scripts de utilidad
└── README.md        # Este archivo
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Python 3.11+
- Node.js 18+
- PostgreSQL (opcional para MVP inicial)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📊 Entidades Principales

- **Departamento**: Gestión de propiedades (estado, dirección, tipo)
- **Inquilino**: Información de inquilinos (contacto, estado)
- **Contrato**: Relación inquilino-departamento (fechas, montos, ajustes)
- **Pago**: Registro de pagos por período (YYYY-MM)
- **Alerta**: Notificaciones automáticas del sistema

## 📝 Reglas de Negocio

- Un departamento puede tener **0 o 1 contrato activo**
- Los pagos se registran por período `YYYY-MM`
- Sistema de alertas automáticas para:
  - Contratos por vencer
  - Pagos faltantes
  - Ajustes pendientes
  - Vacancia prolongada

## 📚 Documentación

- [Modelo de Datos](./docs/MODELO_DATOS.md)
- [Roadmap Completo](./TORO_Departamentos_Roadmap_Diagrama_Estructura_Checklist.md)

## 👥 Equipo

Desarrollado para TORO Holding

## 📄 Licencia

Propietario - Todos los derechos reservados

