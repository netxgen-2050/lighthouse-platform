# Proposal

## Why

Los pactos son cómo una persona se compromete con su tribu: con tiempo, con plata o con la convivencia. Es la pieza que convierte el interés en compromiso, y la que genera Semillas. Pantalla aprobada por Gus el 7-oct-2026 (fase de prototipo interno: plata, inversión y textos legales de borrador permitidos, ver `CLAUDE.md`).

## What Changes

- Página `/pactos` copiada de `V.pactos` del mock-up v6, con sus tres pestañas: **Pacto de tiempo** (rol, horas por mes con control deslizante, valor de referencia de la hora, parte que se aporta como semilla, cálculo de Semillas y de caja por mes), **Sumarte con plata** y **Pacto de convivencia**.
- Estado del pacto con los tres pasos del mock-up: Borrador → En revisión → Aceptado, con los botones "Enviar a la tribu" y "Simular: la tribu acepta".
- Los valores de referencia (`HOUR_REF_ARS`, `HOUR_REF_USD`) y la fórmula salen de `lib/pactos/` (funciones puras con tests): Semillas por mes = horas × valor hora en USD × parte en semilla × evaluación entre pares (1,0 por defecto).
- El pacto aceptado queda guardado en el navegador para que `semillas-libro` lo lea (clave documentada en `lib/pactos/`).
- Destino nuevo en el rail: agregar "Pactos" → `/pactos` a la lista única `lib/navegacion.ts` (con su ícono de `lucide-react` y `existe: true`).
- Los ⚖ de la pantalla se copian del objeto `LEGAL` del mock-up al catálogo `lib/legal/terminos.ts`; los que no existan en el mock-up van con `borrador: true`.

**Fuera de alcance:** Cobros reales, firma real, base de datos y cuentas: todo es simulado y se guarda en el navegador.

## Capabilities

### New Capabilities
- `pactos`: la pantalla `/pactos` según `V.pactos` del mock-up v6.

### Modified Capabilities

## Impact

`app/pactos/`, `lib/pactos/`, `lib/navegacion.ts`, `lib/legal/terminos.ts` (y sus tests), `e2e/pactos.spec.ts`. Referencia: `V.pactos` en `docs/referencia/netx-tribus-mockup-v6.html`.
