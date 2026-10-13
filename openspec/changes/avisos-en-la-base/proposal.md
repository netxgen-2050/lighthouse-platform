# Proposal

## Why

La campanita y la bandeja (`bandeja-notificaciones`) leen avisos que el **mismo navegador** se escribe a sí mismo: por ejemplo, "Valle Solar aceptó tu adhesión" se generaba al apretar el botón simulado. Con `aprobaciones-admin` y `aprobaciones-pactos`, quien acepta o rechaza es **otra persona**, en otro navegador, así que ese aviso tiene que salir del servidor. Es la parte de "eventos y notificaciones" del plan de `aprobaciones-admin` (nota `backend/01`, sección 5: "te avisa algo que hizo otra persona"). También cierra lo que quedó pendiente en `aprobaciones-admin`, que deja de emitir el aviso de adhesión aceptada.

**Depende de:** `base-neon`, `aprobaciones-admin` y `aprobaciones-pactos` implementados.

## What Changes

- **Tabla `notificaciones`** (migración de Drizzle): destinatario, tipo, texto, enlace interno, clave para no repetir el mismo aviso (única por destinatario), fecha de creación y fecha de lectura (nula si no se leyó).
- **El servidor crea avisos en la misma transacción** que el hecho que los origina:
  - a la persona: "Valle Solar aceptó tu adhesión", "Valle Solar no aceptó tu adhesión por ahora", "Valle Solar aceptó tu pacto" y "Valle Solar no aceptó tu pacto por ahora", con enlace a la ficha o a Pactos;
  - a cada persona que puede resolver un pedido o un pacto nuevo (regla `puedeResolver`): "Nuevo pedido de <nombre o email> para Valle Solar", con enlace a `/pedidos`.
- **API `/api/notificaciones`**, con la sesión verificada en el servidor:
  - `GET`: las últimas 100 de quien pide.
  - `POST /api/notificaciones/leidas`: marcar todas como leídas.
  
  Nadie puede leer ni marcar avisos de otra persona.
- **Campanita y bandeja** muestran juntos los avisos del servidor y los que siguen siendo locales (por ejemplo, el aviso simulado del mercado), ordenados por fecha. "Marcar todas como leídas" marca las dos fuentes. Los tipos que la persona apagó en Configuración siguen ocultos.
- **Cuándo se actualiza**: al cargar la página, al volver a la pestaña y cada 60 segundos mientras la pestaña está visible. No hay conexión en tiempo real.
- **Si el servidor no responde**, la bandeja muestra los avisos locales y el texto "No pudimos traer tus avisos; probá de nuevo en un rato". No se muestra "0 sin leer" como si no hubiera nada.

## Fuera de alcance

- Avisos por mail o por Telegram. El mail necesita un dominio propio y un proveedor (punto 10 de `backend/04` y nota `backend/03`).
- Avisos de otras cosas compartidas (mercado, Fogón, postulaciones): llegan con `datos-en-la-nube` o con sus propias specs.
- Mudar a la base la actividad local ("lo que hiciste") y la línea de tiempo de Mi recorrido.
- Conexión en tiempo real (WebSocket o *server-sent events*) y notificaciones push.
- Borrar avisos o marcarlos de a uno.

## Capabilities

### New Capabilities
- `avisos-en-la-base`: notificaciones creadas por el servidor cuando otra persona hace algo que te toca, mostradas en la campanita y la bandeja.

### Modified Capabilities

## Impact

`lib/db/schema.ts` y una migración nueva; las rutas de resolución de `app/api/membresias/` y `app/api/pactos/` (crean avisos dentro de la transacción); `app/api/notificaciones/`; `lib/actividad/` (unir lo local con lo del servidor, con funciones puras y tests); la campanita de la barra superior y `app/bandeja/`; e2e con dos personas.
