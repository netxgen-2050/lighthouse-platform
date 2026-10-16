# Proposal

## Why

Con el dogfooding del Fogón el equipo usa producción con su login real y datos en Neon (nota Desarrollo/2026-10-15). Las rutas nuevas (`/api/personas`, consultas, consentimiento en la base) pueden fallar: la base no responde, una migración no corrió, un dato viene distinto. Hoy **no hay `app/error.tsx` ni `app/global-error.tsx`**: si una página falla, Next muestra su pantalla genérica en inglés ("Application error: a client-side exception has occurred") o una página en blanco, sin rail, sin forma de volver y sin cómo avisar. Una de las medidas de éxito del dogfooding es que "lo aprendido vuelve como issues con el botón Reportar"; justo cuando algo se rompe, ese camino no está.

Además, la página de no encontrado global solo ofrece "Volver a las tribus", aunque se llegue desde cualquier lado.

Roadmap: hardening (It.4) adelantado porque el equipo ya usa producción; acompaña la demo de It.1 "sobre un preview real". No viene de un ítem del backlog ni repite propuestas abiertas o cerradas.

## What Changes

- **Error dentro de una página** (`app/error.tsx`): el marco sigue en pie (rail, barra superior, pie, aviso de prototipo) y en lugar del contenido aparece "Algo se rompió en esta página" con una explicación corta en palabras simples, el **código del error** (el `digest` que da Next, o "sin dato") y tres acciones: **Probar de nuevo**, **Ir al inicio** y **Avisar al equipo**.
- **Avisar al equipo** abre el diálogo de Reportar de siempre con el tipo "Algo no funciona" y "¿Qué pasó?" ya escrito ("Apareció la pantalla de error en /ruta. Código del error: …"), que la persona puede cambiar antes de enviar. **No se envía nada solo**: la persona ve todo lo que se manda y decide. No cambia la API de reportes ni lo que se adjunta.
- **Nunca se muestra el mensaje técnico ni la traza** del error a la persona (pueden tener detalles internos); el código alcanza para encontrarlo en los logs de Vercel.
- **Error en el marco** (`app/global-error.tsx`, cuando falla el propio layout): una página mínima propia con el aviso "Prototipo interno · datos de ejemplo", el título, el código, **Volver a cargar** e **Ir al inicio**, y el texto que explica cómo avisar con el botón Reportar desde el inicio. Con el estilo del tema y un solo `<main>`.
- **No encontrado** (`app/not-found.tsx`): suma **Ir al inicio** (además de "Ver las tribus") y **Avisar al equipo** con "Llegué a una página que no existe: /ruta".
- **En inglés** cuando la plataforma está en inglés (textos del marco, con `idioma-base`).
- Una **ruta de prueba** que falla a propósito, que solo existe fuera de producción, para que el e2e pueda provocar el error.

### Fuera de alcance

- Enviar errores automáticamente a un servicio de monitoreo (Sentry u otro): es una integración externa y una decisión aparte (backend/03, "Monitoreo de errores").
- Cambiar la API de reportes, sus límites o los datos que se adjuntan.
- Errores de las rutas de API (las pantallas que ya manejan sus fallas, como el Fogón con `ErrorLectura`, siguen igual).
- Pantallas de carga (`loading.tsx`) y reintentos automáticos.
- La página de no encontrado del territorio (`app/territorios/[id]/not-found.tsx`), que ya tiene la suya.

## Capabilities

### New Capabilities
- `errores-pagina`: qué ve y qué puede hacer una persona cuando una página falla o no existe, incluido avisar al equipo con el código del error.

### Modified Capabilities

## Impact

- Archivos nuevos: `app/error.tsx`, `app/global-error.tsx`, `app/prueba-error/page.tsx` (y su parte de cliente), `lib/errores/aviso.ts` (+ test), `e2e/errores.spec.ts`.
- Archivos que cambian: `app/not-found.tsx`, `components/boton-reportar.tsx` (escucha el pedido de abrirse con texto), `lib/idioma/textos/marco.ts` (textos en español e inglés), `e2e/accesibilidad.spec.ts`.
- **Depende de `idioma-base`** (PR #90): los textos van en el catálogo del marco, en los dos idiomas. Si `idioma-base` no estuviera en `dev`, se frena y se reporta (no se escriben textos sueltos).
- No toca tablas, migraciones, permisos, pagos ni datos personales, y no cambia lo que se envía a GitHub (el texto lo ve y lo edita la persona): no necesita revisión del arquitecto.
