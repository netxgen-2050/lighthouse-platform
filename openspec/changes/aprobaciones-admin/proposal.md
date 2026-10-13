# Proposal

## Why

Hoy la adhesión a una comunidad se "acepta" con un botón **Simular: la comunidad me acepta** que aprieta la misma persona, y todo queda en su navegador. Con el login (PR #57) y la base (`base-neon`) ya se puede hacer de verdad: la persona pide entrar y **otra persona**, quien administra la comunidad, acepta o rechaza. Es el ítem **B6** del backlog ("Aprobaciones de un admin de comunidad") y la segunda spec del plan de backend (`base-neon` → `aprobaciones-admin` → `datos-en-la-nube`, nota `backend/00`).

El plan original ponía en `aprobaciones-admin` cinco tablas (membresías, postulaciones, pactos, eventos y notificaciones). No entra en una noche, así que se parte: **este cambio solo hace las membresías y la bandeja de pedidos del admin**. Los pactos van en `aprobaciones-pactos` y los avisos en `avisos-en-la-base`. Las postulaciones de comunidades esperan el tema D1 del backlog (comunidades postulantes vs. tribus).

**Depende de:** `base-neon` implementado (tabla `personas`, roles en la base, PGlite en local).

## What Changes

- **Tabla `membresias`** (migración de Drizzle): persona, comunidad (`lighthouse` o el id de texto de la tribu), estado (`pedido`, `miembro`, `rechazado`), versión del manifiesto firmado, fecha del pedido, quién resolvió, cuándo y un motivo opcional. Una sola fila por persona y comunidad (único en la base).
- **API `/api/membresias`**, con la sesión verificada en el servidor:
  - `GET`: las membresías de quien pide.
  - `POST { comunidad }`: adherir (crea o reabre el pedido con la versión vigente del manifiesto).
  - `GET /api/membresias/pedidos`: los pedidos pendientes que quien pide puede resolver.
  - `PATCH /api/membresias/<id> { decision: "aceptar" | "rechazar", motivo? }`: resolver un pedido.
- **Quién resuelve** (decisión por ahora; ver preguntas abiertas):
  - Valle Solar: la persona con rol `admin-tribu` de `valle`, o un super admin.
  - Lighthouse y las tribus sin admin: un super admin.
  - Nadie resuelve su propio pedido, salvo un super admin (para poder probar solo; la fila queda marcada como resuelta por sí misma).
- **Página `/pedidos` ("Pedidos de tu comunidad")**, solo para `admin-tribu` y `superadmin`: lista de pedidos pendientes con persona (nombre o email), comunidad, fecha y versión del manifiesto, y botones **Aceptar** y **Rechazar** (con motivo opcional, hasta 300 caracteres). Entrada en el menú del avatar y un contador de pendientes al lado. Sin pedidos: "No hay pedidos pendientes".
- **Del lado de la persona**: desaparece el botón **Simular: la comunidad me acepta** (en la ficha de la tribu y en el manifiesto). Con el pedido rechazado ve "No te aceptaron por ahora" con el motivo, si lo hay, y puede volver a adherir.
- **Todo lo que hoy lee la membresía del navegador** (Pactos, Semillas, Pasaporte, Perfil, Mi recorrido) pasa a leerla de la API, mediante un solo módulo cliente (`lib/membresia/`), sin cambiar lo que muestra cada pantalla.
- **Datos que ya estaban en el navegador**: la primera vez que la persona entra con este cambio, sus membresías locales (`pedido` o `miembro`) se envían como **pedidos**, para que un admin las resuelva, y se borra la clave local. Una membresía simulada no se convierte en membresía real sin aprobación.

## Fuera de alcance

- Pactos (`aprobaciones-pactos`), notificaciones en la base (`avisos-en-la-base`) y postulaciones de comunidades (esperan D1).
- Avisos por mail, más de un admin por tribu y otras tribus con admin. Hoy `admin-tribu` es siempre de `valle`.
- Que el admin edite el manifiesto o la ficha de la tribu.
- Expulsar o dar de baja a un miembro ya aceptado.
- Límite de pedidos por persona (punto 8 de `backend/04`).

## Capabilities

### New Capabilities
- `aprobaciones-admin`: membresías en la base y bandeja de pedidos para quien administra cada comunidad.

### Modified Capabilities

## Impact

`lib/db/schema.ts` y una migración nueva en `drizzle/`; `app/api/membresias/` (rutas y tests con PGlite); `lib/membresia/` (cliente de la API, reemplaza la lectura de `localStorage`); `components/membresia-acciones.tsx`, `app/tribus/[id]/manifiesto/lectura.tsx`; `app/pedidos/`; el menú del avatar; los clientes de Pactos, Semillas, Pasaporte, Perfil y `lib/panel/proximo-paso.ts`; e2e con dos personas del modo de prueba (persona y admin de tribu).
