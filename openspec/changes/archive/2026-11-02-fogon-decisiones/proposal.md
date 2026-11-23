# Proposal

## Why

El Fogón muestra cómo se decide en el Lighthouse: qué se está decidiendo, dónde (tribu, asamblea, fideicomiso), con qué regla y en qué norma se apoya. Es la cara de la gobernanza. Pantalla aprobada por Gus el 7-oct-2026 (fase de prototipo interno: plata, inversión y textos legales de borrador permitidos, ver `CLAUDE.md`).

## What Changes

- Página `/fogon` copiada de `V.fogon` del mock-up v6: la lista de decisiones (Plan de huerta comunitaria 2027, Usar el fondo común para la bomba solar, Permitir animales de granja, Presupuesto de obra 2027 del macrolote, Elegir facilitador/a de Valle Solar), cada una con dónde se decide, la regla y su ⚖ de base normativa.
- Filtros por ámbito: Tribu, Asamblea de residentes, Fideicomiso (pestañas o chips).
- Votación simulada: "Votar" abre a favor / en contra / abstención; el resultado se guarda en el navegador y muestra el conteo de ejemplo más el voto propio. Quien no puede votar ve el motivo ("Solo residentes", "No sos beneficiaria/o").
- Un acta simple por decisión cerrada (texto de ejemplo).
- Destino nuevo en el rail: agregar "Fogón" → `/fogon` a la lista única `lib/navegacion.ts` (con su ícono de `lucide-react` y `existe: true`).
- Los ⚖ de la pantalla se copian del objeto `LEGAL` del mock-up al catálogo `lib/legal/terminos.ts`; los que no existan en el mock-up van con `borrador: true`.

**Fuera de alcance:** Cobros reales, firma real, base de datos y cuentas: todo es simulado y se guarda en el navegador.

## Capabilities

### New Capabilities
- `fogon`: la pantalla `/fogon` según `V.fogon` del mock-up v6.

### Modified Capabilities

## Impact

`app/fogon/`, `lib/fogon/`, `lib/navegacion.ts`, `lib/legal/terminos.ts` (y sus tests), `e2e/fogon.spec.ts`. Referencia: `V.fogon` en `docs/referencia/netx-tribus-mockup-v6.html`.
