# Proposal

## Why

Última zona de la plataforma bilingüe (ver `idioma-base` y ADR-004): lo que acompaña a todas las páginas y no es de ninguna. Hifa (el asistente), el botón "Reportar", la ventana de login de Privy (que hoy aparece en inglés aunque la plataforma esté en español) y el cierre del recorrido: comprobar que no quede ninguna página de la plataforma sin traducir, salvo las internas. Entra en una noche.

## What Changes

- **Hifa en inglés:** saludo, atajos, respuestas del guion (`lib/hifa/guion.ts`), botones ("Yes, pass it on", "No, thanks", "Retry", "Leave it"), errores y nombres accesibles (`components/hifa/hifa.tsx`, `avatar-hifa.tsx`, `lib/hifa/estado.ts`). "Hifa" no se traduce. Cada mensaje guarda en qué idioma se escribió: una conversación empezada en español sigue mostrando esos mensajes en español con `lang="es"`, y los nuevos salen en el idioma actual.
- **Reportar en inglés:** el formulario, sus tipos, ayudas, errores y confirmación (`components/boton-reportar.tsx`). **El issue que llega a GitHub sigue en español** (lo lee el equipo) y suma la línea "Idioma de la persona: en"; lo que escribió la persona va tal cual.
- **Ventana de login de Privy en el idioma de la plataforma:** en español, con los textos principales en español (configuración `intl.textLocalization` del SDK); en inglés, la de Privy por defecto.
- **Cierre:** un test exige que toda ruta de `lib/navegacion.ts` y las públicas de `rutas-publicas.ts` estén en `RUTAS_TRADUCIDAS`, salvo las internas (`/netx`, `/panel/bitacora`), que siguen en español con el aviso de página sin traducir.

### Fuera de alcance

- Traducir `/netx` y la bitácora del panel (uso interno del equipo).
- Respuestas de Hifa con IA (sigue el guion fijo) y mails.
- Traducir los issues ya creados en GitHub.
- Los textos de la ventana de Privy que el SDK no deja cambiar.

## Capabilities

### New Capabilities
- `idioma-hifa-avisos`: Hifa, Reportar y la ventana de login en el idioma de la plataforma, y la verificación de que toda la plataforma (salvo lo interno) está traducida.

### Modified Capabilities
- (ninguna)

## Impact

- Código: `lib/idioma/textos/hifa.ts` y `reportar.ts` (nuevos), `components/hifa/*`, `lib/hifa/guion.ts`, `lib/hifa/estado.ts` (`idioma?` en cada mensaje, compatible con lo guardado), `components/boton-reportar.tsx`, `lib/reportes/reporte.ts` (línea de idioma en el cuerpo del issue), `components/sesion/privy-puente.tsx` (`intl.textLocalization` según idioma), `lib/idioma/rutas.test.ts`.
- **Toca una integración externa (Privy: solo textos de su ventana) y el contenido de los issues de GitHub (una línea más): pendiente de revisión del agente arquitecto.** No cambia qué datos se mandan a Privy ni a GitHub, salvo el idioma.
- Tests: `lib/hifa/estado.test.ts` (mensajes con idioma, estado viejo sin idioma), `lib/reportes/reporte.test.ts` (línea de idioma), test de cobertura de rutas, `e2e/idioma-hifa-avisos.spec.ts`; los e2e en español (`hifa`, `reportes`, `login`) siguen iguales.
- Depende de `idioma-base`; conviene al final, cuando las demás zonas ya estén (el test de cobertura de rutas lo exige).
