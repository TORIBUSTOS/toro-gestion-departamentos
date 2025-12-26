# Roadmap y Diseño — Sistema de Gestión de Departamentos (MVP)

**Fecha:** 26/12/2025  
**Autor:** Rosario (para Tori)

---

## Objetivo del sistema

Construir un sistema simple y confiable para **gestionar departamentos en alquiler**: inventario, contratos, pagos, alertas y (luego) análisis patrimonial.  
Principio rector: **si no ahorra memoria o pensamiento, no va**.

---

## 1) ROADMAP

### Etapa 0 — Definición (1 sesión)
- Propósito: *no olvidar / no perseguir / ver estado y próximos vencimientos*.
- Definir alcance de **MVP v1** y qué queda fuera.
- Definir reglas: vencimientos, mora, ajustes, vacancia.

**Salida:** alcance cerrado + entidades definidas.

### Etapa 1 — Núcleo (MVP Operativo)
- CRUD Departamentos
- CRUD Inquilinos
- Contratos (1 contrato activo por depto)
- Pagos por período (YYYY-MM)
- Dashboard con estado general

**Salida:** se usa para operar.

### Etapa 2 — Tiempo y Alertas (MVP Inteligente)
- Alertas por:
  - Contrato por vencer
  - Pago faltante (mes actual)
  - Ajuste pendiente (según regla)
  - Vacancia prolongada
- Tablero de pendientes priorizado

**Salida:** el sistema “te cuida”.

### Etapa 3 — Histórico y Rendimiento
- Histórico de cambios (contrato/estado/montos)
- Resumen por depto: ingresos (YTD / 12m), meses vacíos, gastos (si aplica)
- Exportables (Excel/PDF) (opcional)

### Etapa 4 — Automatizaciones (Post-MVP)
- Import desde Excel / CSV
- Recordatorios por email/Telegram/WhatsApp (según herramientas)
- Plantillas de mensajes al inquilino
- Integración bancaria (si se desea más adelante)

---

## 2) DIAGRAMA (DE FLUJO / ILUSTRADO)

### 2.1 Diagrama narrado (alto nivel)

INICIO  
→ **Dashboard (Estado general + Alertas)**  
→ (¿Crear Departamento o Ver Departamento?)

**Si CREAR**  
→ Alta de Departamento → Guardar → Dashboard

**Si VER**  
→ Ficha de Departamento → (¿Estado?)  
- VACÍO → Marcar vacío + fecha → Dashboard  
- REFACCIÓN → Marcar refacción + gastos opcionales → Dashboard  
- ALQUILADO → Inquilino → Contrato → Pagos → Ajustes → Dashboard

---

### 2.2 Diagrama en Mermaid (para pegar en GitHub/Notion compatible)

```mermaid
flowchart TD
  A([Inicio]) --> B[Dashboard: Estado + Alertas]
  B --> C{Crear o Ver Departamento?}
  C -->|Crear| D[Alta Departamento]
  D --> B

  C -->|Ver| E[Ficha Departamento]
  E --> F{Estado del Depto?}

  F -->|Vacío| G[Marcar VACÍO + fecha desde]
  G --> B

  F -->|Refacción| H[Marcar REFACCIÓN + inicio]
  H --> H2[Gastos refacción (opcional)]
  H2 --> B

  F -->|Alquilado| I{Existe inquilino asociado?}
  I -->|No| J[Crear Inquilino]
  J --> K[Asociar Inquilino]
  I -->|Sí| K
  K --> L{Existe contrato activo?}

  L -->|No| M[Crear Contrato: fechas, monto, regla ajuste]
  M --> N[Activar Contrato]
  L -->|Sí| O[Ver Contrato + Calendario]
  N --> O

  O --> P{Pago del mes registrado?}
  P -->|No| Q[Registrar Pago / Marcar Pendiente]
  P -->|Sí| R[Ver historial de pagos]
  Q --> S{Corresponde ajuste?}
  R --> S

  S -->|Sí| T[Sugerir nuevo monto]
  T --> U[Confirmar + Actualizar contrato]
  S -->|No| B
  U --> B
```

---

## 3) DOCUMENTO DE ESTRUCTURA

### 3.1 Entidades (modelo conceptual)

#### Departamento
- `id`
- `alias` (ej: “Dpto 3B”)
- `direccion`
- `tipo` (dpto/casa/monoambiente/cochera…)
- `estado` (ALQUILADO / VACIO / REFACCION)
- `fecha_estado_desde`
- `notas`

#### Inquilino
- `id`
- `nombre_apellido`
- `dni` (opcional)
- `telefono`
- `email`
- `notas`
- `estado` (ACTIVO/INACTIVO)

#### Contrato
- `id`
- `departamento_id`
- `inquilino_id`
- `fecha_inicio`
- `fecha_fin`
- `monto_inicial`
- `monto_actual`
- `regla_ajuste` (texto o estructura)
- `proximo_ajuste_fecha` (guardada o calculada)
- `deposito_garantia` (opcional)
- `estado` (ACTIVO / VENCIDO / RESCINDIDO)

#### Pago
- `id`
- `contrato_id`
- `periodo` (YYYY-MM)
- `fecha_pago`
- `monto_pagado`
- `medio_pago` (transferencia/efectivo/etc.)
- `observacion`
- `estado` (COBRADO / PENDIENTE / PARCIAL)

#### Gasto (MVP+)
- `id`
- `departamento_id`
- `fecha`
- `categoria` (expensas/arreglo/impuesto/servicio)
- `monto`
- `nota`

#### Alerta (generada)
- `id`
- `tipo` (VENCIMIENTO / MORA / AJUSTE / VACANCIA)
- `severidad` (ALTA/MEDIA/BAJA)
- `ref_tipo` (CONTRATO/DEPTO)
- `ref_id`
- `mensaje`
- `fecha_generacion`
- `estado` (ABIERTA / RESUELTA)

---

### 3.2 Pantallas mínimas (MVP)

1) **Dashboard**
- KPIs: alquilados, vacíos, pagos pendientes, contratos por vencer  
- Lista de alertas  
- Tabla de departamentos con “próxima acción”

2) **Departamentos** (listado + alta/edición)

3) **Ficha Departamento**
- estado, notas  
- inquilino activo (si aplica)  
- contrato activo (si aplica)  
- pagos recientes  

4) **Inquilinos** (listado + alta)

5) **Contratos** (crear/ver/terminar)

6) **Pagos** (registrar + historial)

---

### 3.3 Reglas de negocio (las “leyes”)

- Un departamento puede tener **0 o 1 contrato activo**.
- Un contrato activo tiene pagos por período `YYYY-MM`.
- Si `hoy > fecha_fin - X_dias` → alerta **“Contrato por vencer”**.
- Si `periodo_actual` sin pago y `dia_del_mes > X` → alerta **“Pago faltante”**.
- Si se cumple `regla_ajuste` → alerta **“Ajuste pendiente”** hasta confirmar.
- Si estado `VACIO` y `dias_vacio > X` → alerta **“Vacancia prolongada”**.

> Nota: los umbrales `X` se ajustan a tu estilo (ej: 5/10/30 días).

---

## 4) CHECKLIST DE FUNCIONES

### MVP v1 (indispensable)
- [ ] CRUD Departamentos (crear/editar/ver/listar)
- [ ] CRUD Inquilinos
- [ ] Crear Contrato activo por departamento
- [ ] Registrar Pagos por período (YYYY-MM)
- [ ] Dashboard:
  - [ ] lista de departamentos
  - [ ] estado (ALQUILADO/VACIO/REFACCION)
  - [ ] estado pago mes (COBRADO/PENDIENTE)
- [ ] Historial básico de pagos por contrato

### MVP v2 (inteligencia operativa)
- [ ] Generador de alertas:
  - [ ] contrato por vencer
  - [ ] pago faltante
  - [ ] ajuste pendiente
  - [ ] vacancia prolongada
- [ ] Panel de alertas (resolver/archivar)
- [ ] Filtros y búsqueda

### v3 (patrimonial)
- [ ] Histórico de cambios (auditoría simple)
- [ ] Rendimiento por depto (ingresos por período)
- [ ] Registro de gastos por depto
- [ ] Balance simple: ingresos – gastos

### v4 (automatizaciones)
- [ ] Export a Excel/PDF
- [ ] Import desde Excel/CSV
- [ ] Recordatorios automáticos (email/Telegram/WhatsApp)
- [ ] Plantillas de mensajes al inquilino

---

## Siguiente paso recomendado

Convertir el MVP v1 en un **plan semanal** con entregables chiquitos (sin quemarte), y definir los umbrales `X` (mora/vencimiento/vacancia) y la `regla_ajuste` que usás en la vida real (IPC u otra).
