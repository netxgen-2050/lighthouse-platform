# Proposal

## Why

Gus revisó el 24-nov-2026 la integración del rediseño (PR #207) y la paleta nueva no le gustó: "esos colores están horrendos, los de antes estaban mucho mejor". Se vuelve a la paleta anterior al rediseño (la del mock-up v6, que está en `dev` antes del PR #201) en los dos temas, y al tema por defecto de antes ("el del sistema").

Es el **primero de cuatro cambios de corrección** del rediseño. Va apilado sobre la integración `integracion/2026-11-24-0204` (PR #207).

## What Changes

- Los tokens de color de `app/globals.css` vuelven a los valores de `dev` antes del PR #201, en el tema claro (base) y en el oscuro (`data-tema="oscuro"`).
- El tema por defecto vuelve a ser "el del sistema" (`PREFERENCIAS_INICIALES.tema = "sistema"`, y el script de apariencia sin preferencia guardada sigue al sistema).
- Los tokens que sumó el rediseño (`regen-1` a `regen-5` y los de vidrio) se quedan, con valores tomados de la paleta de antes para que los componentes nuevos (Indicador, BarraAvance, PanelVidrio, TablaLibro, SelloPrototipo, ChipEstado) se vean bien en los dos temas.
- **Se quedan** las tipografías nuevas (Fraunces, Inter Tight y JetBrains Mono): Gus solo objetó los colores.

## Fuera de alcance

- Cambiar la disposición de las páginas del rediseño (lo hacen los cambios 2 a 4).
- Tipografías.

## Capabilities

### New Capabilities
- `paleta-de-antes`: vuelve la paleta anterior al rediseño y el tema por defecto del sistema (reemplaza en esos dos puntos a `sistema-visual`).

## Impact

- **Cambia:** `app/globals.css`, `lib/configuracion/preferencias.ts`, `lib/configuracion/script-apariencia.ts`, sus tests, `lib/tema-contraste.test.ts`, `e2e/configuracion.spec.ts`.
- **Sin** tablas, datos personales ni dependencias nuevas.
