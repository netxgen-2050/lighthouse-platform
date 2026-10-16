# Design

## Context

- `fogon-cuadratico-en-la-base` (design §1) deja `consulta_padron (consulta_id, persona_id, agregado_at)` con clave primaria compuesta, foráneas `on delete restrict` y un trigger `BEFORE INSERT OR DELETE` que rechaza si la consulta está **efectivamente cerrada** (`estado = 'cerrada'` o `now() >= cierre_at`). Mientras está abierta, la base acepta filas nuevas. Ninguna ruta las agrega después de crear la consulta.
- `fogon-consultas-panel` deja la sección "Consultas del Fogón" en `/netx`, la lista con `participantes` y el padrón con casillas desde `GET /api/personas`.
- `base-neon` deja "Personas y roles", donde el super admin suma una persona por email aunque todavía no tenga cuenta.
- ADR-007: una sola regla de visibilidad para todo el padrón; el super admin no ve más que el resto.

## Goals / Non-Goals

**Goals:** sumar gente a una consulta abierta sin perder los repartos; que quede registrado quién la sumó; que el padrón se entere de que cambió.

**Non-Goals:** quitar del padrón, editar la consulta, notificaciones.

## Decisions

### 1. Migración: `agregado_por`
- `alter table consulta_padron add column agregado_por uuid null references personas(id) on delete restrict`.
- Filas existentes y filas cargadas al crear la consulta: `agregado_por` queda nulo (la creación ya registra `creada_por` en `consultas`). Solo las filas de esta ruta lo llenan.
- "Se sumó después de abrirse" = `agregado_at > consultas.creada_at`. Al crear, consulta y padrón se insertan en la misma transacción y `now()` es el mismo, así que las filas del alta quedan con la misma hora y no cuentan. Un test con PGlite lo fija.
- No hay `check` que relacione `agregado_por` con `creada_at`: un `check` no puede mirar otra tabla. La regla vive en la consulta que arma el aviso.
- **Alternativa descartada:** una tabla `consulta_padron_cambios` de solo agregar. Hoy solo se agrega (no se quita), así que la fila del padrón con su hora y su autor ya es la historia completa. Si un día se permite quitar, ahí sí hace falta el libro.

### 2. Servidor
- `sumarAlPadron(slug, emails, superadminId)`: normaliza emails (minúsculas, sin espacios, sin repetidos), busca todas las personas; si falta alguna, 422 con la lista y no escribe. En una transacción: `insert ... on conflict (consulta_id, persona_id) do nothing returning persona_id` para saber quiénes eran nuevos. Traduce el error del trigger de cierre a 409.
- Orden de chequeos igual que las demás rutas de consultas (`sesionDelPedido` → `exigirConsentimiento` → rol → existencia → estado → validación → escritura); cuerpo JSON con tipo de contenido y origen propio (molde ADR-006). `Cache-Control: no-store`. Respuesta: `{ sumadas: n, yaEstaban: n, participantes }`, sin emails ni ids de persona.
- La vista (`vista`) suma `padronCambio: { sumadas: number, ultima: string } | null`, contado sobre las filas con `agregado_at > creada_at`. Sale igual para todo el padrón y para el super admin.
- Logs con código y `slug`, nunca con emails.
- Límite: el cuerpo acepta como máximo 50 emails (422 si son más).

### 3. Pantalla
- Botón "Sumar al padrón" solo en consultas abiertas. Diálogo nativo `<dialog>` con casillas de quienes no están en el padrón (sale de `GET /api/personas` menos los que ya están, que el panel ya conoce por la consulta) y un campo de email. Texto de ayuda: "¿Todavía no tiene cuenta? Sumalo primero en Personas y roles." Confirmar llama a la ruta y refresca la lista.
- En el detalle de la consulta, el aviso del cambio de padrón va arriba de "Mi reparto", como texto (no solo un ícono ni un color).

## Risks / Trade-offs

- [El super admin suma aliados para inclinar una consulta] → queda registrado `agregado_por` y el padrón ve el aviso "El padrón cambió…". Con voto abierto, además, aparece con su nombre en "Faltan votar" o en los repartos.
- [Con resultado "al votar" la persona sumada tarde ve el agregado antes de votar] → es lo mismo que le pasa a cualquiera que vota tarde (riesgo ya aceptado en ADR-007).
- [Carrera: se suma a alguien justo cuando la consulta cierra por fecha] → manda el trigger de la base (`now()`); la ruta responde 409.

## Migration Plan

1. Migración hacia adelante: una columna nula, sin tocar filas existentes; se aplica en el build del preview y en producción al mergear.
2. Volver atrás: revertir el PR deja la columna sin uso; quitarla es otra migración (decisión de Gus).

## Open Questions

- ¿Hace falta también **quitar** del padrón a quien todavía no repartió (alguien sumado por error)? Queda fuera; si Gus lo quiere, conviene el libro de cambios de la alternativa descartada.
- ¿El aviso del cambio de padrón debe nombrar a las personas sumadas cuando el voto es abierto? La spec no las nombra en el aviso (con voto abierto igual aparecen en "Faltan votar").
