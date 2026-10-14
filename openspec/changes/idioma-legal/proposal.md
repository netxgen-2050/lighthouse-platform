# Proposal

## Why

Zona legal de la plataforma bilingüe (ver `idioma-base` y ADR-004). Una persona del exterior hoy acepta una política de privacidad y unos términos **en español** (L10 lo acepta para el prototipo) y ve los ⚖ en español. Para el prototipo interno, CLAUDE.md permite que los agentes redacten textos legales como **borrador**: este cambio escribe la versión en inglés de todo lo legal, marcada como borrador y como traducción no revisada, y deja constancia de en qué idioma aceptó cada persona. La revisión legal sigue siendo R14 / L10 y queda fuera. Entra en una noche.

## What Changes

- **⚖ en inglés, borrador:** las 42 claves de `lib/legal/terminos.ts` suman `en: { titulo, texto }` (hoy solo las 4 del Congreso lo tienen). `TerminoLegal` toma el idioma de la plataforma cuando no se le pasa uno; en inglés siempre muestra "Draft: text under review" y la bitácora lo anota con `idioma: "en"` y `borrador: true` (regla que ya fijó `congreso-bilingue`).
- **Aviso del estado administrativo (Ord. 173)** (`lib/legal/estado-administrativo.ts`, `components/estado-administrativo.tsx`) en inglés, borrador, con su anotación en la bitácora en el idioma mostrado.
- **Política de privacidad y términos en inglés (`/privacidad`)**, borrador: `lib/privacidad/politica.ts` pasa a tener los dos idiomas (resumen, datos por pantalla, finalidades, base legal, conservación, encargados, derechos, marco legal, términos de uso). Arriba, en inglés: "Draft translation, not reviewed by the legal team. The Spanish version is the reference." (con enlace a la versión en español, `?lang=es`).
- **La política suma la cookie de idioma** (`lh-idioma`, preferencia de interfaz, sin identidad) en "Qué datos tratamos". Como cambia lo informado, **sube la versión** de la política con su cambio listado ("Ahora guardamos en tu navegador el idioma que elegís") y todas las personas vuelven a aceptar (mecanismo de `consentimiento-alta`).
- **Pantalla de consentimiento, paso "Crear tu cuenta" y Mis datos en inglés.**
- **Constancia del idioma:** el registro del consentimiento suma `idioma` (el del texto que la persona tenía delante al aceptar). Registros sin ese campo valen como `"es"`. Mis datos muestra "You accepted version X on … , in English (draft translation)".
- `/privacidad` y `/mis-datos` se suman a `RUTAS_TRADUCIDAS`.

### Fuera de alcance

- **Revisión legal** de cualquier texto en inglés o en español (R14, L10, C14; con Gabriel). Todo queda como borrador.
- Decidir qué versión prevalece si difieren (el texto propone "la versión en español es la de referencia"; pregunta para Gus y Gabriel).
- Textos con peso legal que todavía no son ⚖ (R16: "No es una inversión…", "podés salir cuando quieras"): se traducen como texto de la zona, sin sumarlos al catálogo, hasta que Gus decida R16.
- Cambios de fondo en la política (jurisdicción, encargados, R29).

## Capabilities

### New Capabilities
- `idioma-legal`: ⚖, aviso de la Ord. 173, política, términos, consentimiento y Mis datos en inglés como borrador, con constancia del idioma aceptado.

### Modified Capabilities
- (ninguna en `openspec/specs/`: `privacidad-consentimiento` y `consentimiento-alta` todavía no están archivadas; el design anota qué suma a cada una.)

## Impact

- Código: `lib/legal/terminos.ts` (+`en` en todas las claves), `components/termino-legal.tsx` (idioma de la plataforma por defecto), `lib/legal/estado-administrativo.ts`, `components/estado-administrativo.tsx`, `components/anotar-exposicion.tsx` (idioma mostrado), `lib/privacidad/politica.ts` (dos idiomas, versión nueva), `app/privacidad/page.tsx`, `components/sesion/pantalla-consentimiento.tsx`, `bloque-consentimiento.tsx`, `paso-alta.tsx`, `lib/privacidad/consentimiento.ts` (`idioma` en el registro), `app/mis-datos/**`, `lib/idioma/textos/legal.ts` y `privacidad.ts` (nuevos), `lib/idioma/rutas.ts`.
- **Toca datos personales (el registro del consentimiento suma un campo) y textos legales: pendiente de revisión del agente arquitecto.** Compatible con `base-neon`: el idioma del consentimiento sería una columna más en `consentimientos`, junto con `canal` (ver design de `consentimiento-alta` §7).
- Tests: `lib/legal/terminos.test.ts` (todas las claves con `en`), `lib/privacidad/politica.test.ts` (mismas secciones y cantidad de filas en los dos idiomas), `consentimiento.test.ts` (idioma), `e2e/idioma-legal.spec.ts`; `e2e/privacidad.spec.ts` sigue igual en español.
- Depende de `idioma-base` y de `consentimiento-alta`.
