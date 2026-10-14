---
name: base-de-datos
description: Reglas para diseñar tablas, escribir migraciones y revisar cambios en la base Neon Postgres con Drizzle. Usar en cualquier cambio que cree o modifique tablas, columnas, índices, datos semilla o consultas que escriben.
---

# Base de datos (Neon + Drizzle)

Modelo elegido (ver `NS_platform/Documentation/backend/02 - Modelo de datos (propuestas).md` y el ADR correspondiente): **híbrido**. Tablas con columnas reales para lo que se relaciona, se filtra o se aprueba; `jsonb` para contenido que cambia de forma seguido; **libros de solo agregar** para lo que tiene valor o peso legal.

## Diseño de tablas
- `uuid` como clave en todas las tablas. Los ids de texto del código que ya existen (`valle`, `lighthouse`) se conservan como referencia.
- **Garantías en la base, no en un `if`:** `unique` (email, un voto por persona y decisión, una membresía por persona y tribu), claves foráneas, `not null`, enums para estados, `check` para rangos.
- Aprobaciones y cualquier escritura en varias tablas: **dentro de una transacción**.
- **Libros de solo agregar** (`semillas_movimientos`, `votos`, `bitacora`, `cambios_de_rol`, `eventos`, `checkins`): nunca `update` ni `delete`. Un error se corrige con un movimiento que compensa.
- **Sensible aparte:** `kyc_resultados` y `evaluaciones` en tablas propias, leídas solo desde rutas del servidor que verifican el rol. **Nada sensible en `jsonb`.**
- Datos copiados de un servicio externo: `proveedor`, `id_externo`, `sincronizado_at` y único (`proveedor`, `id_externo`). Ver skill `integracion-externa`.
- Fechas en `timestamptz`, siempre en UTC. Plata en enteros (centavos) con la moneda en otra columna, nunca `float`.

## Migraciones
- Una migración por cambio OpenSpec, generada con Drizzle (`pnpm exec drizzle-kit generate`) y revisada a mano.
- **Solo hacia adelante.** Para "deshacer" se escribe otra migración.
- Cambios que podrían romper datos existentes se hacen en pasos: agregar la columna nueva (opcional), copiar los datos, cambiar el código, y recién en otro cambio quitar lo viejo.
- Nunca renombrar ni borrar una columna en el mismo cambio que cambia el código que la usa.

## Checklist de revisión (para el revisor y el arquitecto)
- [ ] ¿Se puede aplicar sin cortar el servicio?
- [ ] ¿Qué pasa con las filas que ya existen?
- [ ] ¿Cómo se vuelve atrás si sale mal?
- [ ] ¿Las garantías de la spec están en la base (únicos, foráneas, enums) y no solo en el código?
- [ ] ¿Algún libro de solo agregar recibe un `update` o `delete`?
- [ ] ¿Entra algún dato sensible en `jsonb` o en una tabla sin control de acceso?

## Ambientes
- Cada preview de Vercel usa su rama de Neon con **datos de ejemplo** (script de semillas en `scripts/`), **nunca una copia de producción**.
- Los agentes no tienen acceso a la base de producción ni a sus credenciales. Si una tarea lo necesita, frenan y reportan.
- Borrar la cuenta de una persona en tablas con libros = **anonimizar** (se reemplaza la identidad, la historia queda). No prometer "borrado" sin ese diseño.
