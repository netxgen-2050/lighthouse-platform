# Proposal

## Why

Tercera zona de la plataforma bilingüe (ver `idioma-base` y ADR-004): lo que hace una persona con cuenta para comprometerse con una comunidad y lo que la plataforma le reconoce. Pasaporte (con la verificación de identidad que se pide para invertir), Semillas y Pactos son las pantallas que un miembro o inversor del exterior va a usar después de sumarse. Entra en una noche.

## What Changes

- **Pasaporte (`/pasaporte`) en inglés:** caminos, sellos (`lib/pasaporte/sellos.ts`: nombre descriptivo, qué abre, cómo se obtiene, estados "No disponible todavía" incluido), sello de la billetera, horas de trabajo y el **diálogo de verificación de identidad** (`components/kyc-dialogo.tsx` y los mensajes de validación de `lib/pasaporte/kyc.ts`), que también usa Sumarte. "Genesis" no se traduce.
- **Semillas (`/semillas`) en inglés:** libro, ronda de reconocimiento, cálculo explicado, lo que te abre, con números y fechas según idioma. **"Semillas" no se traduce** (decisión de Gus, 15-oct-2026, glosario de `idioma-base`): en inglés se dice "Semillas", y la primera mención del contenido de cada página se explica como "Semillas (seeds)". El término económico 🌱 "Semillas" (`lib/economia/terminos.ts`) suma su texto en inglés como **borrador** (el catálogo ya lo marca así), con el título "Semillas".
- **Pactos (`/pactos`) en inglés:** proponer y aceptar pactos de tiempo y de plata, valor de la hora de referencia, aportes con el tipo de cambio de ejemplo, estados y errores.
- **Datos de ejemplo:** los textos que escribe la plataforma (descripción de sellos, tipos de pacto, ejemplos de la ronda) pasan a `Bilingue`. Lo que escribe la persona (descripción de su pacto, horas en texto libre) nunca se traduce.
- Las tres rutas se suman a `RUTAS_TRADUCIDAS`; diccionarios y datos con inglés quedan `pendiente` en la lista de revisión nativa (`lib/idioma/revision-nativa.ts`).

### Fuera de alcance

- ⚖ de estas páginas (`pasefundador`, `creditos`, `art32`…) y el consentimiento de datos sensibles del KYC: `idioma-legal`.
- Cambiar reglas de cálculo de Semillas (L2) o el valor de la hora (L1).
- Fogón, Compromisos, Perfil y Mi recorrido (otros cambios).

## Capabilities

### New Capabilities
- `idioma-pasaporte-semillas-pactos`: Pasaporte (con verificación de identidad), Semillas y Pactos en inglés.

### Modified Capabilities
- (ninguna)

## Impact

- Código: `lib/idioma/textos/pasaporte.ts`, `semillas.ts` y `pactos.ts` (nuevos), `app/pasaporte/**`, `app/semillas/**`, `app/pactos/**`, `components/kyc-dialogo.tsx`, `components/termino-economico.tsx`, `lib/economia/terminos.ts` (`en` borrador), `lib/pasaporte/sellos.ts`, `datos.ts`, `kyc.ts` (mensajes), `lib/semillas/datos.ts`, `lib/pactos/datos.ts`, `lib/idioma/rutas.ts`.
- Tests: diccionarios nuevos; `lib/pasaporte/sellos.test.ts` (cada sello con `en`), `lib/pasaporte/kyc.test.ts` (mensajes en inglés); `e2e/idioma-pasaporte-semillas-pactos.spec.ts`; los e2e en español (`pasaporte`, `semillas`, `pactos`) siguen iguales.
- El KYC trata datos sensibles, pero este cambio **no cambia qué se pide ni dónde se guarda**: solo los textos. No hace falta revisión del arquitecto salvo que el implementador toque la lógica (si pasa, frenar y reportar).
- Depende de `idioma-base`.
