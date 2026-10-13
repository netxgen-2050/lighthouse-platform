# Proposal

## Why

Hoy un pacto de tiempo pasa de "Enviado a la comunidad" a "Aceptado" con el botón **Simular: la comunidad acepta**, que aprieta la misma persona. Es la segunda parte del ítem **B6** del backlog ("pactos aceptados"). Con `aprobaciones-admin` ya existen las membresías en la base y la bandeja `/pedidos`. Este cambio suma los pactos de tiempo a esa bandeja, así quien administra la comunidad acepta o rechaza el pacto, y las Semillas salen solo de pactos aceptados por otra persona.

**Depende de:** `base-neon` y `aprobaciones-admin` implementados.

## What Changes

- **Tabla `pactos`** (migración de Drizzle): persona, comunidad, rol (clave de `lib/pactos/datos.ts`), texto del rol "Otro", descripción, horas por mes, estado (`enviado`, `aceptado`, `rechazado`), fecha de envío, quién resolvió, cuándo y un motivo opcional. Un solo pacto de tiempo por persona y comunidad (único en la base).
- **El borrador sigue en el navegador**, como hoy. Recién al tocar **Enviar a la comunidad** el pacto va a la base. Enviado, ya no se edita.
- **API `/api/pactos`**, con la sesión verificada en el servidor:
  - `GET`: los pactos de quien pide.
  - `POST`: enviar. Exige ser `miembro` de la comunidad en `membresias` y que el pacto esté completo, con la misma validación que hoy (`pactoCompleto`, límites de horas y de texto).
  - `GET /api/pactos/pedidos`: los pactos pendientes que quien pide puede resolver.
  - `PATCH /api/pactos/<id> { decision, motivo? }`: resolver.
- **Quién resuelve**: la misma regla que las membresías (`puedeResolver` de `aprobaciones-admin`).
- **Bandeja `/pedidos`**: suma una sección **Pactos** con persona, comunidad, rol, horas por mes y descripción, y los botones **Aceptar** y **Rechazar** (con motivo opcional). El contador del menú del avatar suma membresías y pactos pendientes.
- **Del lado de la persona**: desaparece **Simular: la comunidad acepta**. Con el pacto rechazado ve "No te aceptaron este pacto por ahora" con el motivo, y puede editarlo y volver a enviarlo: la misma fila vuelve a `enviado`.
- **Semillas y Mi recorrido** leen los pactos aceptados de la API, a través de un cliente único (`lib/pactos/cliente.ts`). El cálculo de Semillas no cambia.
- **Pactos que ya estaban en el navegador**: la primera vez, los que estaban "Enviado" o "Aceptado" se mandan como `enviado` (vuelven a pasar por un admin). Los borradores quedan en el navegador.

## Fuera de alcance

- **Aportes en plata**: siguen simulados en el navegador, como hoy. Van con `datos-en-la-nube` o con la pasarela.
- Libro de Semillas en la base (`semillas_movimientos`, de `datos-en-la-nube`) y ronda de reconocimiento.
- Notificaciones en la base (`avisos-en-la-base`).
- Más de un pacto de tiempo por comunidad, renegociar un pacto aceptado y darlo de baja.
- Contrapropuestas del admin (cambiar horas o rol): solo acepta o rechaza.

## Capabilities

### New Capabilities
- `aprobaciones-pactos`: pactos de tiempo en la base, aprobados por quien administra la comunidad.

### Modified Capabilities

## Impact

`lib/db/schema.ts` y una migración nueva; `app/api/pactos/` (rutas y tests con PGlite); `lib/pactos/` (cliente de la API y mudanza; las funciones puras de `estado.ts` se reutilizan para validar en el servidor); `app/pactos/pactos-cliente.tsx`; `app/pedidos/` (sección Pactos); el contador del menú del avatar; `app/semillas/semillas-cliente.tsx`, `app/perfil/perfil-cliente.tsx` y `lib/panel/proximo-paso.ts`; e2e.
