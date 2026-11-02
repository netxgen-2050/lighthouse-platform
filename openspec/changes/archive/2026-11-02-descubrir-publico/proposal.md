# Proposal

## Why

Gus quiere (13-oct-2026) que cualquiera pueda **explorar sin entrar**: las secciones de **Descubrir** (Inicio, Territorio y Tribus), que es lo que ofrece el plan gratis **Explorador** de Sumarte ("Mapa y páginas de tribus"). Hoy la puerta de sesión tapa toda la app hasta que la persona entra.

## What Changes

- **Rutas públicas** (sin sesión): `/` (Inicio), `/territorios/[id]` (Territorio con el mapa y la ficha lateral) y `/tribus`, `/tribus/[id]`, `/tribus/[id]/manifiesto` (leer el manifiesto). Se definen en **una sola lista** (`lib/sesion/rutas-publicas.ts`), con tests.
- En una ruta pública, la puerta **no tapa el contenido**. Las acciones que necesitan cuenta muestran, en su lugar, un llamado a entrar: "Entrá para adherir", "Entrá para proponer una comunidad", "Entrá para consultar por este lote", "Entrá para pedir tu pacto". Al tocarlo se abre el login de Privy y, al volver, la persona sigue en la misma página.
- El resto de las rutas sigue igual: sin sesión, la pantalla de entrada.
- **Rail sin sesión**: muestra Descubrir completo; los destinos de Participar y Sumarte aparecen con un candado y la etiqueta "Entrá para ver" (llevan a la pantalla de entrada). La barra superior muestra solo **Entrar** (sin NetX, campanita ni avatar).
- **Hifa** queda disponible sin sesión (es una conversación simulada en el navegador); ofrecer "pasarle tu idea al equipo" pide entrar primero. El **botón Reportar** se muestra solo con sesión (la ruta ya exige sesión).
- Sin sesión, nada se guarda con el prefijo de una persona: la selección en el mapa y lo que se mira no se guardan.
- El aviso "Prototipo interno · datos de ejemplo" sigue en todas las páginas públicas.

**Fuera de alcance:** que Sumarte o Congreso sean públicos (se puede sumar después), SEO.

## Capabilities

### New Capabilities
- `descubrir-publico`: explorar Inicio, Territorio y Tribus sin entrar.

### Modified Capabilities

## Impact

`components/sesion/puerta.tsx`, `lib/sesion/rutas-publicas.ts`, `app/layout.tsx`, `components/rail.tsx`, `components/barra-superior.tsx`, las acciones con cuenta en `app/tribus/[id]/`, `app/tribus/[id]/manifiesto`, `app/territorios/[id]/` (ficha lateral), Hifa y el botón Reportar, e2e (sin el fixture de login para las rutas públicas).
