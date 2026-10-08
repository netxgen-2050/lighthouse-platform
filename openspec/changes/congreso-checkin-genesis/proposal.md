# Proposal

## Why

La presencia es una de las cinco fuentes de permisos (nota 18 §3) y el registro Genesis es lo que conecta el Congreso con la voz en el Fondo Común. Hoy `/congreso` registra el ticket pero siempre dice "Genesis pendiente": no hay forma de mostrar en el prototipo qué pasa cuando la persona llega al territorio. El mock-up v6 (`V.congreso`) ya trae el check-in simulado de los 5 días y el sello Genesis; sin eso, `/canales` nunca puede mostrar una puerta abierta "por tu presencia" con datos reales del recorrido, y una futura pantalla "Mi Raíz" no tiene presencia que mostrar.

## What Changes

- En `/congreso`, con un ticket registrado: botón **"Simular check-in del día N"** (N = 1 a 5), con la aclaración "En el Congreso lo hace el anfitrión escaneando el QR de tu ticket".
- Tras el primer check-in: sello **Genesis** activo ("Estuviste en el comienzo del Lighthouse.") y "Presencia confirmada: N de 5 días". Con los 5 días: "Cinco días de presencia" y sin botón.
- La **agenda** marca en texto cada día con presencia ("Día 1 · presente").
- "Quitar ticket" también borra la presencia.
- **`/canales`** toma la presencia Genesis del navegador: con al menos un check-in, el dato "Presencia Genesis" de la situación dice "confirmada" y las puertas que abre la presencia muestran "por tu presencia".
- **Mi recorrido (`/panel`)** muestra "Genesis · N de 5 días" en lugar de "Genesis pendiente" cuando hay check-ins.
- ⚖ nuevo `genesis` en `lib/legal/terminos.ts`, con `borrador: true`.

**Fuera de alcance:** QR real, rol ni pantalla del anfitrión, validación del ticket contra Luma u otra ticketera, insignia on-chain, multiplicador de voz por presencia (sigue "a decidir"), fechas reales del Congreso (los días son "Día 1…5", sin calendario), check-in en otros eventos.

## Capabilities

### New Capabilities
- `presencia-congreso`: el check-in simulado por día, el registro Genesis y cómo la presencia se refleja en `/canales` y en Mi recorrido.

### Modified Capabilities
(ninguna: `openspec/specs/` todavía está vacío; lo que cambia en `/canales` y en el panel queda en `presencia-congreso`)

## Impact

`app/congreso/` (el registro del ticket y la agenda pasan a compartir estado en el cliente), un módulo nuevo `lib/congreso/presencia.ts`, una clave nueva en `lib/demo/claves.ts` (`CLAVES.presencia`), `lib/canales/puertas.ts` y `app/canales/canales-cliente.tsx` (lectura de la presencia), `lib/demo/resumen.ts` y `app/panel/resumen.tsx`, una clave nueva en `lib/legal/terminos.ts`, y e2e de congreso, canales, panel y accesibilidad. Sin dependencias nuevas.
