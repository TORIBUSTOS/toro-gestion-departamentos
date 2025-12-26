# Modelo de Datos - Sistema de Gestión de Departamentos

## 📊 Diagrama de Entidades y Relaciones

```
Departamento (1) ──< (0..1) Contrato (1) ──< (1) Inquilino
                           │
                           └──< (N) Pago
```

## 🗄️ Esquema de Base de Datos

### 1. Departamento

**Descripción**: Representa una unidad de propiedad (departamento, casa, monoambiente, cochera, etc.)

**Tabla**: `departamentos`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| `alias` | VARCHAR(100) | NOT NULL, UNIQUE | Nombre identificatorio (ej: "Dpto 3B") |
| `direccion` | VARCHAR(255) | NOT NULL | Dirección completa |
| `tipo` | VARCHAR(50) | NOT NULL | Tipo de propiedad (dpto/casa/monoambiente/cochera) |
| `estado` | ENUM | NOT NULL, DEFAULT 'VACIO' | Estado actual: `ALQUILADO`, `VACIO`, `REFACCION` |
| `fecha_estado_desde` | DATE | NOT NULL | Fecha desde que está en el estado actual |
| `notas` | TEXT | NULL | Notas adicionales |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de última actualización |

**Índices**:
- `idx_departamento_estado` en `estado`
- `idx_departamento_alias` en `alias`

---

### 2. Inquilino

**Descripción**: Información de los inquilinos que alquilan departamentos

**Tabla**: `inquilinos`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| `nombre_apellido` | VARCHAR(200) | NOT NULL | Nombre completo |
| `dni` | VARCHAR(20) | NULL, UNIQUE | Documento Nacional de Identidad |
| `telefono` | VARCHAR(50) | NULL | Teléfono de contacto |
| `email` | VARCHAR(255) | NULL | Correo electrónico |
| `notas` | TEXT | NULL | Notas adicionales |
| `estado` | ENUM | NOT NULL, DEFAULT 'ACTIVO' | Estado: `ACTIVO`, `INACTIVO` |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de última actualización |

**Índices**:
- `idx_inquilino_estado` en `estado`
- `idx_inquilino_dni` en `dni` (si no es NULL)

---

### 3. Contrato

**Descripción**: Relación contractual entre un departamento y un inquilino

**Tabla**: `contratos`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| `departamento_id` | INTEGER | NOT NULL, FOREIGN KEY | Referencia a `departamentos.id` |
| `inquilino_id` | INTEGER | NOT NULL, FOREIGN KEY | Referencia a `inquilinos.id` |
| `fecha_inicio` | DATE | NOT NULL | Fecha de inicio del contrato |
| `fecha_fin` | DATE | NOT NULL | Fecha de finalización del contrato |
| `monto_inicial` | DECIMAL(10,2) | NOT NULL | Monto inicial del alquiler |
| `monto_actual` | DECIMAL(10,2) | NOT NULL | Monto actual del alquiler (puede variar por ajustes) |
| `regla_ajuste` | VARCHAR(255) | NULL | Regla de ajuste (ej: "IPC cada 12 meses", "Aumento fijo 10% anual") |
| `proximo_ajuste_fecha` | DATE | NULL | Fecha calculada del próximo ajuste |
| `deposito_garantia` | DECIMAL(10,2) | NULL | Monto del depósito de garantía |
| `estado` | ENUM | NOT NULL, DEFAULT 'ACTIVO' | Estado: `ACTIVO`, `VENCIDO`, `RESCINDIDO` |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de última actualización |

**Restricciones**:
- `CHECK (fecha_fin > fecha_inicio)`
- Un departamento solo puede tener un contrato `ACTIVO` a la vez (constraint a nivel de aplicación)

**Índices**:
- `idx_contrato_departamento` en `departamento_id`
- `idx_contrato_inquilino` en `inquilino_id`
- `idx_contrato_estado` en `estado`
- `idx_contrato_fecha_fin` en `fecha_fin`

**Foreign Keys**:
- `fk_contrato_departamento` → `departamentos(id)` ON DELETE CASCADE
- `fk_contrato_inquilino` → `inquilinos(id)` ON DELETE RESTRICT

---

### 4. Pago

**Descripción**: Registro de pagos realizados por período (mes)

**Tabla**: `pagos`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| `contrato_id` | INTEGER | NOT NULL, FOREIGN KEY | Referencia a `contratos.id` |
| `periodo` | VARCHAR(7) | NOT NULL | Período en formato `YYYY-MM` |
| `fecha_pago` | DATE | NULL | Fecha en que se realizó el pago |
| `monto_pagado` | DECIMAL(10,2) | NOT NULL | Monto pagado |
| `medio_pago` | VARCHAR(50) | NULL | Medio de pago (transferencia/efectivo/cheque/etc.) |
| `observacion` | TEXT | NULL | Observaciones adicionales |
| `estado` | ENUM | NOT NULL, DEFAULT 'PENDIENTE' | Estado: `COBRADO`, `PENDIENTE`, `PARCIAL` |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Fecha de última actualización |

**Restricciones**:
- `CHECK (periodo REGEXP '^[0-9]{4}-(0[1-9]|1[0-2])$')` - Validación de formato YYYY-MM
- Un contrato solo puede tener un pago por período (constraint único: `contrato_id + periodo`)

**Índices**:
- `idx_pago_contrato` en `contrato_id`
- `idx_pago_periodo` en `periodo`
- `idx_pago_estado` en `estado`
- `UNIQUE idx_pago_contrato_periodo` en `(contrato_id, periodo)`

**Foreign Keys**:
- `fk_pago_contrato` → `contratos(id)` ON DELETE CASCADE

---

### 5. Alerta (MVP v2)

**Descripción**: Alertas generadas automáticamente por el sistema

**Tabla**: `alertas`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| `tipo` | ENUM | NOT NULL | Tipo: `VENCIMIENTO`, `MORA`, `AJUSTE`, `VACANCIA` |
| `severidad` | ENUM | NOT NULL, DEFAULT 'MEDIA' | Severidad: `ALTA`, `MEDIA`, `BAJA` |
| `ref_tipo` | ENUM | NOT NULL | Tipo de referencia: `CONTRATO`, `DEPTO` |
| `ref_id` | INTEGER | NOT NULL | ID de la entidad referenciada |
| `mensaje` | VARCHAR(500) | NOT NULL | Mensaje descriptivo de la alerta |
| `fecha_generacion` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de generación |
| `estado` | ENUM | NOT NULL, DEFAULT 'ABIERTA' | Estado: `ABIERTA`, `RESUELTA` |
| `fecha_resolucion` | TIMESTAMP | NULL | Fecha de resolución |

**Índices**:
- `idx_alerta_tipo` en `tipo`
- `idx_alerta_estado` en `estado`
- `idx_alerta_ref` en `(ref_tipo, ref_id)`
- `idx_alerta_severidad` en `severidad`

---

### 6. Gasto (MVP v3)

**Descripción**: Gastos asociados a departamentos

**Tabla**: `gastos`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| `departamento_id` | INTEGER | NOT NULL, FOREIGN KEY | Referencia a `departamentos.id` |
| `fecha` | DATE | NOT NULL | Fecha del gasto |
| `categoria` | VARCHAR(50) | NOT NULL | Categoría (expensas/arreglo/impuesto/servicio) |
| `monto` | DECIMAL(10,2) | NOT NULL | Monto del gasto |
| `nota` | TEXT | NULL | Notas adicionales |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

**Índices**:
- `idx_gasto_departamento` en `departamento_id`
- `idx_gasto_categoria` en `categoria`
- `idx_gasto_fecha` en `fecha`

**Foreign Keys**:
- `fk_gasto_departamento` → `departamentos(id)` ON DELETE CASCADE

---

## 🔄 Relaciones

1. **Departamento ↔ Contrato**: Uno a Muchos (1:N)
   - Un departamento puede tener múltiples contratos históricos
   - Solo un contrato puede estar `ACTIVO` a la vez

2. **Inquilino ↔ Contrato**: Uno a Muchos (1:N)
   - Un inquilino puede tener múltiples contratos (en diferentes departamentos o períodos)

3. **Contrato ↔ Pago**: Uno a Muchos (1:N)
   - Un contrato tiene múltiples pagos (uno por período)
   - Un pago pertenece a un único contrato

4. **Departamento ↔ Gasto**: Uno a Muchos (1:N)
   - Un departamento puede tener múltiples gastos

## 📝 Notas de Implementación

### Validaciones a Nivel de Aplicación

1. **Un contrato activo por departamento**: Validar antes de crear/activar un contrato que no exista otro `ACTIVO` para el mismo departamento.

2. **Un pago por período**: El constraint único `(contrato_id, periodo)` garantiza que no haya duplicados.

3. **Cálculo de alertas**: Las alertas se generan mediante jobs/cron o al consultar el dashboard:
   - **VENCIMIENTO**: `fecha_fin - X_dias <= hoy`
   - **MORA**: `periodo_actual` sin pago y `dia_del_mes > X`
   - **AJUSTE**: `proximo_ajuste_fecha <= hoy` y no confirmado
   - **VACANCIA**: `estado = 'VACIO'` y `dias_vacio > X`

### Consideraciones de Rendimiento

- Índices en campos de búsqueda frecuente (`estado`, `fecha_fin`, `periodo`)
- Índices compuestos para consultas comunes
- Considerar particionamiento de la tabla `pagos` por año si crece mucho

### Migraciones

Se recomienda usar un sistema de migraciones (Alembic para SQLAlchemy) para gestionar cambios en el esquema.

