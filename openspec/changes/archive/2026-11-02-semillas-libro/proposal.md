# Proposal

## Why

Las Semillas son la cuenta de lo que cada persona aportó (tiempo, plata, presencia) y lo que eso le abre. Muestran que el compromiso tiene un registro y un camino. Pantalla aprobada por Gus el 7-oct-2026 (fase de prototipo interno: plata, inversión y textos legales de borrador permitidos, ver `CLAUDE.md`).

## What Changes

- Página `/semillas` copiada de `V.semillas` del mock-up v6: tres tarjetas (Tiempo, Plata, Presencia) y la escalera "Lo que se te abre" (Explorador/a, Miembro de tribu, Sembrador/a activo/a con su medidor de 120 semillas, Parte del proyecto, Residente).
- Los datos salen del navegador: el pacto aceptado de `/pactos` (tiempo), el Pase o la plata simulada de `/sumarte`, y el ticket de `/congreso` (presencia). Lo que no existe se muestra como "sin dato" o con el texto del mock-up, nunca como 0 inventado.
- Ronda de reconocimiento entre pares (del mock-up): evaluar a dos compañeros de tribu de 1 a 5 en rol y cultura, simulado, y ver cómo cambia el factor de evaluación.
- Si `pactos-tribu` está en la base, usar su clave del navegador; si no, mostrar "Todavía no tenés un pacto aceptado" con enlace a `/pactos`.
- Destino nuevo en el rail: agregar "Semillas" → `/semillas` a la lista única `lib/navegacion.ts` (con su ícono de `lucide-react` y `existe: true`).
- Los ⚖ de la pantalla se copian del objeto `LEGAL` del mock-up al catálogo `lib/legal/terminos.ts`; los que no existan en el mock-up van con `borrador: true`.

**Fuera de alcance:** Cobros reales, firma real, base de datos y cuentas: todo es simulado y se guarda en el navegador.

## Capabilities

### New Capabilities
- `semillas`: la pantalla `/semillas` según `V.semillas` del mock-up v6.

### Modified Capabilities

## Impact

`app/semillas/`, `lib/semillas/`, `lib/navegacion.ts`, `lib/legal/terminos.ts` (y sus tests), `e2e/semillas.spec.ts`. Referencia: `V.semillas` en `docs/referencia/netx-tribus-mockup-v6.html`.
