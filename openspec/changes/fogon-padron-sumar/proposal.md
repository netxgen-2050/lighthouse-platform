# Proposal

## Why

En el dogfooding del Fogón (nota `Desarrollo/2026-10-15 Estrategia - dogfooding del Fogón`) el padrón de cada consulta se elige **una sola vez, al crearla** (`fogon-consultas-panel`), y después no se puede tocar porque ninguna ruta edita consultas. Pero el caso ya está a la vista: U2 dice "Sumá a Martín (invitado) si ya tiene cuenta", y si Martín (o alguien que se suma al equipo) aparece cuando la consulta ya está abierta, la única salida es cerrarla y crear otra, perdiendo los repartos ya guardados. La base ya lo permite: `fogon-cuadratico-en-la-base` deja que `consulta_padron` reciba filas mientras la consulta está abierta y lo impide recién al cierre. Falta la ruta y el botón.

## What Changes

- **Sumar personas al padrón de una consulta abierta** desde la sección "Consultas del Fogón" de `/netx` (solo super admin): botón "Sumar al padrón" en cada consulta abierta, que abre un diálogo con las personas de la base que todavía no están en el padrón (casillas) y un campo para un email existente. Al confirmar, la lista muestra el nuevo "votaron X de N".
- **Ruta nueva** `POST /api/fogon/consultas/[slug]/padron` (super admin + consentimiento): agrega en una transacción, todo o nada; quien ya estaba no se duplica; con la consulta cerrada (a mano o por fecha) responde 409.
- **Queda registrado quién sumó a quién**: columna nueva `agregado_por` en `consulta_padron` (nula para las filas cargadas al crear, como hoy).
- **Transparencia para el padrón**: el detalle de la consulta dice "El padrón cambió después de abrirse: se sumaron M personas (la última, el DD-MM)", sin nombres, con voto abierto o secreto. Así nadie suma aliados en silencio.
- Recorrido para invitados sin cuenta (Martín): Gus lo suma primero como persona en "Personas y roles" (`base-neon`) y después al padrón. Este cambio solo lo explica en el diálogo.

**Fuera de alcance:**
- Quitar a alguien del padrón, editar título, opciones, fecha de cierre o tipo de voto, reabrir o borrar una consulta (las reglas de la base de `fogon-cuadratico-en-la-base` siguen igual).
- Sumar al padrón de una consulta cerrada.
- Avisarle a la persona sumada (lo cubriría `fogon-consultas-pendientes`, PR #81, si se aprueba), mail o Telegram.
- Crear cuentas o invitar por email a quien no está en `personas`.
- Consultas de tribu o asamblea y líderes que suman gente.

## Capabilities

### New Capabilities

### Modified Capabilities
- `fogon-consultas`: el super admin puede sumar personas al padrón de una consulta abierta, y el padrón ve que cambió.

## Impact

Orden: `base-neon` → `consentimiento-en-la-base` → `fogon-cuadratico-en-la-base` → `fogon-consultas-panel` → **`fogon-padron-sumar`**. Archivos: `lib/db/schema.ts` y una migración nueva en `drizzle/` (columna `agregado_por`), `lib/fogon/consultas/servidor.ts` (`sumarAlPadron` y el dato "se sumaron M" en la vista), `app/api/fogon/consultas/[slug]/padron/route.ts`, `lib/fogon/consultas/api.ts`, la sección de `/netx` y el detalle de `app/fogon/consultas/[id]/`, `e2e/fogon-panel.spec.ts`, `e2e/accesibilidad.spec.ts`. Toca una tabla con migración, permisos (super admin) y datos personales (quién está en un padrón): revisión de arquitectura antes de aprobar.
