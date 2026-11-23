# Proposal

## Why

El encabezado ya no alcanza: con Territorio, Tribus, Perfil, Congreso, Compromisos, Sumarte y Mi recorrido son siete destinos. Gus pidió (7-oct-2026) un **navigation rail**: una barra fija a la izquierda con íconos y etiquetas cortas, que sirva igual en la computadora y en el celular.

## What Changes

- Un **rail** fijo a la izquierda, en todas las páginas, con un ítem por destino: ícono + etiqueta corta debajo (estilo Material 3 navigation rail). Los destinos se definen en **una sola lista** (`lib/navegacion.ts`) y el rail muestra solo los que existen en la app.
- Destinos y orden: Inicio, Territorio, Tribus, Perfil, Compromisos, Congreso, Sumarte, Mi recorrido.
- **Computadora:** rail de ~80 px con ícono y etiqueta.
- **Celular:** el mismo rail a la izquierda, más angosto (~64 px), con ícono y etiqueta chica; el contenido usa el resto del ancho. Si los ítems no entran en alto, el rail se desplaza solo, sin mover la página.
- El destino actual queda resaltado (fondo y texto, no solo color) con `aria-current="page"`.
- La marca "NetX" pasa a la parte de arriba del rail (logo corto). El encabezado actual se reduce o se quita; "Saltar al contenido" y el pie se mantienen.
- Íconos con `lucide-react` (la misma librería que netxgen-platform).

**Fuera de alcance:** menú de cuenta, modo oscuro.

## Capabilities

### New Capabilities
- `navegacion-rail`: la navegación principal como rail lateral con íconos.

### Modified Capabilities

## Impact

`app/layout.tsx`, `components/` (rail; el encabezado se simplifica), `lib/navegacion.ts`, `e2e/marco.spec.ts` y los e2e que buscaban enlaces en el encabezado. Dependencia nueva: `lucide-react`.
