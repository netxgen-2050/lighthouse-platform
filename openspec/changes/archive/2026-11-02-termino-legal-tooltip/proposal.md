# Proposal

## Why

Hoy el ⚖ funciona como un botón que abre un panel en el flujo de la página: empuja el contenido y, en `/tribus/valle`, el panel de "Ritual de entrada" tapa el ⚖ de "Forma jurídica". Gus decidió (7-oct-2026, pendiente R6 en `NS_platform/Documentation/Desarrollo/Segunda revisión/`) que se comporte como un **tooltip**: aparece al pasar el mouse y desaparece al sacarlo. Tiene que seguir funcionando con teclado y en el celular.

## What Changes

- El ⚖ muestra su explicación como un tooltip **flotante** (no empuja ni tapa otros ⚖ ni el texto que explica).
- **Mouse:** aparece al pasar el puntero sobre el ⚖ y desaparece al sacarlo. Se puede mover el puntero hacia el tooltip sin que desaparezca (para leerlo o seleccionarlo).
- **Teclado:** aparece cuando el ⚖ recibe el foco (Tab) y desaparece al perderlo; Escape lo esconde sin mover el foco.
- **Táctil (sin mouse):** un toque en el ⚖ lo muestra y otro toque, o un toque afuera, lo esconde.
- Se elimina el comportamiento de "clic para abrir/cerrar" en dispositivos con mouse.

**Fuera de alcance:** cambiar los textos legales, agregar términos nuevos.

## Capabilities

### New Capabilities
- `termino-legal-tooltip`: cómo aparece y desaparece la explicación de un término legal.

### Modified Capabilities

## Impact

`components/termino-legal.tsx` y los e2e que lo usan (`e2e/tribus.spec.ts`, `e2e/accesibilidad.spec.ts`, `e2e/congreso.spec.ts` si existe en la rama). Sin dependencias nuevas.
