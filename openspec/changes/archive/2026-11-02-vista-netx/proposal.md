# Proposal

## Why

El equipo de NetX (Franz) necesita ver de un vistazo si vamos a vender en febrero: embudo, tribus, pactos, plata comprometida y cumplimiento. Para el prototipo, muestra el potencial de captación de la plataforma. Pantalla aprobada por Gus el 7-oct-2026 (fase de prototipo interno: plata, inversión y textos legales de borrador permitidos, ver `CLAUDE.md`).

## What Changes

- Página `/netx` copiada de `V.franz` del mock-up v6: título "¿Vamos a vender en febrero?", los indicadores (perfiles completos, tribus activas, pactos aceptados, USD en el espejo de aportes, horas comprometidas por mes), el embudo de los últimos 30 días, el bloque de cumplimiento con sus medidores y alertas, y la tabla "Tribus por proyecto".
- Todos los números son de ejemplo y salen de un solo archivo de datos (`lib/netx/`); el aviso "Todos los datos de esta vista son de ejemplo" queda visible.
- El embudo como barras horizontales con el número escrito en cada etapa y el porcentaje de conversión entre etapas (calculado, con test).
- Destino nuevo en el rail: agregar "NetX" → `/netx` a la lista única `lib/navegacion.ts` (con su ícono de `lucide-react` y `existe: true`).
- Los ⚖ de la pantalla se copian del objeto `LEGAL` del mock-up al catálogo `lib/legal/terminos.ts`; los que no existan en el mock-up van con `borrador: true`.

**Fuera de alcance:** Cobros reales, firma real, base de datos y cuentas: todo es simulado y se guarda en el navegador.

## Capabilities

### New Capabilities
- `vista-netx`: la pantalla `/netx` según `V.franz` del mock-up v6.

### Modified Capabilities

## Impact

`app/netx/`, `lib/vista-netx/`, `lib/navegacion.ts`, `lib/legal/terminos.ts` (y sus tests), `e2e/vista-netx.spec.ts`. Referencia: `V.franz` en `docs/referencia/netx-tribus-mockup-v6.html`.
