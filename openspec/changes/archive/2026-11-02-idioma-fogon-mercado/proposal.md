# Proposal

## Why

Cuarta zona de la plataforma bilingüe (ver `idioma-base` y ADR-004): la vida en comunidad. El Fogón (decisiones), Compromisos con su Mercado y Canales son donde participa un miembro ya sumado. Entra en una noche.

## What Changes

- **Fogón (`/fogon`) en inglés:** filtros por ámbito, opciones de voto, estados, conteos, resultados, ayudas y errores (`lib/fogon/datos.ts`: `AMBITOS` y `OPCIONES` por idioma).
- **Compromisos y Mercado (`/compromisos`) en inglés:** formulario de registro (`app/compromisos/formulario.tsx`) con sus validaciones (`lib/compromisos/validar.ts`), formatos (`lib/compromisos/formato.ts`), tipos de compromiso, el Mercado (`lib/compromisos/mercado.ts`) con sus estados, y "Para quién" (nombres de tribus y barrios sin traducir).
- **Canales (`/canales`) en inglés:** nombres de las puertas y sus requisitos (`lib/canales/puertas.ts`), con los nombres de planes y niveles del pase tomados del glosario.
- **Decisiones y ofertas de ejemplo traducidas, con su idioma original a la vista** (decisión de Gus, 15-oct-2026): el título y la descripción de cada decisión de ejemplo del Fogón y las ofertas de ejemplo del Mercado pasan a `Bilingue` con `original: "es"` y en inglés muestran "Translated from Spanish" (`TextoBilingue`, regla de `idioma-base` design §10).
- **Lo que publica la persona no se traduce:** sus ofertas se muestran tal cual las escribió, con `lang="es"` si la interfaz está en inglés.
- Las tres rutas se suman a `RUTAS_TRADUCIDAS`; diccionarios y datos con inglés quedan `pendiente` en la lista de revisión nativa.

### Fuera de alcance

- Traducción automática de lo que escribe la persona.
- Revisión de las traducciones por un hablante nativo (más adelante, con la lista de pendientes).
- ⚖ de estas páginas (`idioma-legal`).
- Decidir si el Mercado queda (D6) o cómo se navega el Fogón con muchas tribus (D5).

## Capabilities

### New Capabilities
- `idioma-fogon-mercado`: Fogón, Compromisos con su Mercado y Canales en inglés, con las decisiones y ofertas de ejemplo traducidas (y su idioma original a la vista) y lo que escribe la persona sin traducir.

### Modified Capabilities
- (ninguna)

## Impact

- Código: `lib/idioma/textos/fogon.ts`, `compromisos.ts` y `canales.ts` (nuevos), `app/fogon/**`, `app/compromisos/**`, `app/canales/page.tsx`, `lib/fogon/datos.ts`, `lib/compromisos/validar.ts`, `formato.ts`, `mercado.ts`, `tipos.ts` (etiquetas), `lib/canales/puertas.ts`, `lib/idioma/rutas.ts`, `lib/idioma/revision-nativa.ts`.
- Tests: diccionarios nuevos; `lib/compromisos/validar.test.ts` (mensajes en inglés); `e2e/idioma-fogon-mercado.spec.ts`; los e2e en español (`fogon`, `compromisos`, `canales`) siguen iguales.
- Sin datos personales nuevos, sin permisos, sin base, sin plata nueva.
- Depende de `idioma-base`.
