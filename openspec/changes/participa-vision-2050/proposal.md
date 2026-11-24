# Proposal

## Why

Gus pidió el 24-nov-2026 que la pestaña Visión de Comunidades (hoy Participa) sea **un manifiesto del Lighthouse en 2050**:
- armado con la historia del sitio que está en `NS_permacultura`;
- con una visión **solarpunk**;
- ubicado en el contexto político y social de la Argentina;
- con un tono que diga que **necesitamos colaborar**: coordinar recursos y esfuerzos para la regeneración y el bien común, en lugar de competir hasta que todos pierdan.

El texto ya está escrito en `design.md` §3 (es y en). Este cambio lo pone en pantalla con un diseño editorial.

Es el **cuarto y último cambio de corrección**. Depende de `participa-mapa-equipos`.

## What Changes

- **Pestaña Visión de `/participa`** (`?ver=vision`): el manifiesto "Lighthouse 2050 · Una luz en el borde del desierto", con diseño editorial (`design.md` §2), la marca "Visión, no promesa · borrador" y al final un llamado a la pestaña Equipos.
- Las tribus de ejemplo que mostraba la pestaña se van de la pestaña (sus páginas `/tribus/[id]` siguen en su URL).
- Textos en `lib/idioma/textos/vision-2050.ts` (es/en), sumados a la revisión nativa del inglés.

## Fuera de alcance

- El manifiesto del común Lighthouse VRN (`/tribus/lighthouse/manifiesto`): es otro documento y no cambia.
- Las adhesiones: este texto no se firma ni se adhiere.

## Capabilities

### New Capabilities
- `participa-vision`: el manifiesto Lighthouse 2050 en la pestaña Visión de Participa.

## Impact

- **Nuevo:** `components/participa/vision-2050.tsx`, `lib/idioma/textos/vision-2050.ts` (+ test de copia prohibida), `e2e/participa-vision.spec.ts`.
- **Cambia:** `app/participa/page.tsx` (pestaña Visión), `docs/idioma/revisar-nativo.md`.
- **Sin** tablas, datos personales ni dependencias nuevas.
