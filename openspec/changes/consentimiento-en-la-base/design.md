# Design

## Context

La forma de la tabla, la regla del servidor, la identidad antes del consentimiento, la falla y la aceptación previa ya están decididas en `openspec/changes/consentimiento-alta/design.md` §7.1 a §7.5 y en ADR-005 (opción C). **Este design no las repite: las implementa.** Si algo difiere, manda `consentimiento-alta` §7. Este cambio va después de `base-neon` (tabla, trigger de solo agregar, `personas`, `db()`) y de `consentimiento-alta` (paso antes del login, `tomarAceptacionPrevia`, canales, novedades en el navegador).

## Goals / Non-Goals

**Goals:** que el servidor sepa, en cualquier dispositivo, si una persona aceptó; que exista `exigirConsentimiento` para que `fogon-cuadratico-en-la-base` (y después `datos-en-la-nube`) la use.

**Non-Goals:** datos sensibles (KYC), mudanza del resto de los datos, borrar en Privy (R29), anonimizar.

## Decisions

### 1. Servidor (`lib/privacidad/servidor.ts`)
- `estadoConsentimiento(db, personaId)` → `{ general: "vigente" | "pendiente" | "retirado", version, registradoAt, canal, novedades: boolean }` desde la última fila por tipo (índice `(persona_id, tipo, registrado_at desc)` de `base-neon`). "Vigente" = última fila de `politica` y de `terminos` es `acepta` con `VERSION_POLITICA`.
- `exigirConsentimiento(sesion)` → `{ ok: true, personaId } | Response 403`. Busca la persona por `privy_id` (o por email, la primera vez, como `/api/sesion` de `base-neon`) y su estado. Sin fila en `personas` = sin consentimiento.
- `registrar(db, sesion, pedido)` en **una transacción**: (1) si la persona no existe y el pedido es `acepta` del general, se inserta en `personas` (rol `persona`, email en minúsculas, `privy_id`); (2) idempotencia: `pg_advisory_xact_lock(hash(persona))` y, si la última fila del mismo tipo tiene el mismo `evento` y `version` y es de hace menos de 10 s, no se escribe; (3) inserta las filas. Un choque por único (`privy_id` o email) con otra pestaña que creó la persona al mismo tiempo se reintenta una vez leyendo la existente.
- Novedades: la regla "no pisa" (§9 de `consentimiento-alta`) se calcula en el servidor con la última fila de `novedades`.
- Retirar: filas `retira` de novedades (si estaba en `acepta`), política y términos en la misma transacción, en ese orden.

### 2. Rutas
- `POST /api/consentimientos` con cuerpo `{ accion: "acepta" | "retira", canal, version, aceptadoEnCliente?, novedades?: "acepta" | "retira" | "sin-cambio" }`; valida con una función pura (versión vigente, `aceptadoEnCliente` ≤ 5 min y no en el futuro, canal conocido). 401 sin sesión, 422 inválido, 200 con el estado nuevo. Tipo de contenido JSON y origen propio, como el molde de ADR-006.
- `GET /api/consentimientos` → el estado de §1.

### 3. Cliente
- `lib/privacidad/consentimiento.ts` mantiene sus funciones como única puerta, pero con sesión pasan a ser asíncronas y llaman a la API; `useConsentimiento` carga el estado con `GET` (estado `cargando` mientras tanto, como hoy). El valor de `localStorage` deja de ser la fuente con sesión: se ignora y se borra la primera vez que el servidor responde (la constancia vive en la base).
- `proveedor-sesion.tsx`: al consumir la aceptación previa (`consentimiento-alta` §2), manda `POST` con `canal` y `aceptadoEnCliente`; la persona pasa a activa recién con el 200.
- Mis datos: la constancia y el bloque de novedades leen del `GET`; la descarga JSON trae las filas de la persona.

### 4. Pruebas
- Vitest con PGlite: cada escenario de la spec, incluido el rechazo de `UPDATE`/`DELETE` heredado de `base-neon`, la transacción de persona nueva (se fuerza un error después del insert de `personas` y no queda nada) y la idempotencia.
- E2E: `e2e/fixtura.ts` siembra el consentimiento con `POST /api/consentimientos` y el header de prueba (con `consentimiento: "ninguno"` no siembra). Los e2e de `consentimiento-alta` siguen pasando con la base.

## Risks / Trade-offs

- [Cada página con sesión hace un `GET` más] → una sola vez por carga del proveedor; se puede sumar al `/api/sesion` más adelante si pesa.
- [Cambiar la fixtura de los e2e toca todas las pruebas] → la fixtura mantiene la misma opción `consentimiento` y el mismo valor por defecto; solo cambia cómo siembra.
- [Si la base no responde nadie puede entrar como persona activa] → es lo que pide ADR-005: sin confirmación del servidor, la persona sigue anónima y puede navegar lo público.

## Migration Plan

Sin migraciones (la tabla nace completa en `base-neon`). En el primer deploy, las personas del equipo que ya aceptaron en su navegador vuelven a ver la pantalla una vez (no había constancia en la base); es aceptable en el prototipo y queda dicho en el PR. Volver atrás: revertir el PR; las filas quedan en el libro.
