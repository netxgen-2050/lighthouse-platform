# Proposal

## Why

Cuarta zona de la plataforma bilingüe (ver `idioma-base` y ADR-004): la vida en comunidad. El Fogón (decisiones), Compromisos con su Mercado y Canales son donde participa un miembro ya sumado. Entra en una noche.

## What Changes

- **Fogón (`/fogon`) en inglés:** filtros por ámbito, opciones de voto, estados, conteos, resultados, ayudas y errores (`lib/fogon/datos.ts`: `AMBITOS` y `OPCIONES` por idioma).
- **Compromisos y Mercado (`/compromisos`) en inglés:** formulario de registro (`app/compromisos/formulario.tsx`) con sus validaciones (`lib/compromisos/validar.ts`), formatos (`lib/compromisos/formato.ts`), tipos de compromiso, el Mercado (`lib/compromisos/mercado.ts`) con sus estados, y "Para quién" (nombres de tribus y barrios sin traducir).
- **Canales (`/canales`) en inglés:** nombres de las puertas y sus requisitos (`lib/canales/puertas.ts`), con los nombres de planes y niveles del pase tomados del glosario.
- **Voz de la comunidad en el original:** el título y la descripción de cada decisión del Fogón y las ofertas publicadas en el Mercado (de ejemplo o de la persona) se muestran como se escribieron, con `lang="es"` y "Written in Spanish" en inglés (regla de `idioma-base` design §10).
- Las tres rutas se suman a `RUTAS_TRADUCIDAS`.

### Fuera de alcance

- Traducir las decisiones y ofertas de ejemplo (pregunta para Gus, junto con los manifiestos).
- ⚖ de estas páginas (`idioma-legal`).
- Decidir si el Mercado queda (D6) o cómo se navega el Fogón con muchas tribus (D5).

## Capabilities

### New Capabilities
- `idioma-fogon-mercado`: Fogón, Compromisos con su Mercado y Canales en inglés, con la voz de la comunidad en el original.

### Modified Capabilities
- (ninguna)

## Impact

- Código: `lib/idioma/textos/fogon.ts`, `compromisos.ts` y `canales.ts` (nuevos), `app/fogon/**`, `app/compromisos/**`, `app/canales/page.tsx`, `lib/fogon/datos.ts`, `lib/compromisos/validar.ts`, `formato.ts`, `mercado.ts`, `tipos.ts` (etiquetas), `lib/canales/puertas.ts`, `lib/idioma/rutas.ts`.
- Tests: diccionarios nuevos; `lib/compromisos/validar.test.ts` (mensajes en inglés); `e2e/idioma-fogon-mercado.spec.ts`; los e2e en español (`fogon`, `compromisos`, `canales`) siguen iguales.
- Sin datos personales nuevos, sin permisos, sin base, sin plata nueva.
- Depende de `idioma-base`.
