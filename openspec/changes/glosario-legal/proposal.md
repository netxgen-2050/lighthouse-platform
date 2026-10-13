# Proposal

## Why

El catálogo `lib/legal/terminos.ts` ya tiene unos 40 términos ⚖ (7 marcados como borrador) y `lib/economia/terminos.ts` suma los términos económicos. Hoy solo se leen de a uno, abriendo cada ⚖ en la página donde aparece. Eso tiene dos problemas:

- **Para revisar (R14):** antes de mostrar la plataforma fuera del equipo, Gabriel tiene que revisar todos los textos ⚖, empezando por los borradores. Cada PR arma a mano "la lista de textos borrador para Gabriel"; no hay un lugar que los muestre todos juntos y siempre al día.
- **Para la persona que explora:** el roadmap pone el componente `TerminoLegal` en la It.1 y el Glosario UX-Legal (Desarrollo/02) como la forma de explicar en palabras simples cada término con peso legal. No hay una página donde leerlos todos.

## What Changes

- **Página `/glosario`**, pública (como Descubrir), generada **solo** a partir de los dos catálogos existentes (sin textos nuevos):
  - Sección "Términos legales ⚖" con cada término de `TERMINOS`, ordenados alfabéticamente por título, con su título y su texto.
  - Sección "Términos económicos" con los de `TERMINOS_ECONOMICOS`.
  - Cada término lleva un ancla estable `#<clave>` (por ejemplo `/glosario#pasefundador`) para enlazarlo.
  - Los borradores muestran la etiqueta escrita **"Borrador: a revisar"** (texto, no solo color) y un contador arriba: "N de M textos son borrador".
  - Un interruptor "Mostrar solo borradores" (accesible con teclado, estado anunciado) filtra la lista; el filtro se refleja en la URL (`?borradores=1`) para poder pasarle el enlace a Gabriel.
- **Enlace "Glosario"** en el pie de todas las páginas.
- `/glosario` entra en `RUTAS_PUBLICAS` y en la auditoría de accesibilidad.

**Fuera de alcance:**
- Escribir o cambiar textos legales (la página solo lee el catálogo).
- Un enlace "Ver en el glosario" dentro de cada tooltip ⚖ (toca `termino-legal.tsx`, que tiene R9 abierto).
- Mostrar en qué páginas aparece cada término.
- Búsqueda de texto libre.
- Exportar a PDF o a un documento para Gabriel.

## Capabilities

### New Capabilities
- `glosario-legal`: página pública con todos los términos ⚖ y económicos, borradores marcados y filtro.

### Modified Capabilities

## Impact

`app/glosario/` (página y filtro cliente), `lib/legal/glosario.ts` (arma la lista ordenada desde los dos catálogos, con tests), `components/pie.tsx` (enlace), `lib/sesion/rutas-publicas.ts` (suma `/glosario`), `e2e/glosario.spec.ts`, `e2e/accesibilidad.spec.ts`. Sin dependencias nuevas. Si `sumarte-acceso` o `privacidad-consentimiento` ya tocaron el pie o las rutas públicas, se suma a lo que haya.
