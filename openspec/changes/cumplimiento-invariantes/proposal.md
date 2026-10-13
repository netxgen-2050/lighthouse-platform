# Proposal

## Why

`Desarrollo/03 - Compliance by design` define cada regla de cumplimiento con **cómo se verifica** (columna "Test"). La fase de prototipo (R14) relaja lo de plata y textos legales, pero hay reglas que el prototipo **sigue cumpliendo** y que nadie vigila con un test:

| Regla | Qué dice | ¿Hay test hoy? |
|---|---|---|
| C1 | Toda vista con lotes muestra el estado administrativo | Sí (`e2e/estado-administrativo.spec.ts` + `lib/legal/vistas-con-lotes.ts`) |
| C3 / C18 | Semillas, pases y membresías no tienen operación de transferencia; el Pase no promete tierra, lotes, prioridad ni rendimiento | No |
| C10 | Cada decisión del Fogón muestra su base normativa | No (solo el tipo) |
| C20 | El peso de la voz no depende del nivel del Pase (Semilla, Brote, Raíz) | No |
| C21 | El servicio de permisos no tiene recursos de tipo "lote" | No |

Con varias specs en vuelo que tocan permisos, Fogón y Sumarte (`sumarte-acceso`, `pase-fundador-gobernanza`), un cambio puede romper una de estas reglas sin que `pnpm verificar` se entere. Es un cambio chico, solo de tests, que deja las reglas de la It.1 en adelante protegidas automáticamente.

## What Changes

- **Tests de invariantes** en `lib/cumplimiento/invariantes.test.ts` (Vitest, entran en `pnpm verificar`):
  - **C3 / C18 (sin transferencia):** ningún módulo de `lib/semillas`, `lib/sumarte`, `lib/membresia`, `lib/permisos` ni `lib/pasaporte` exporta un símbolo cuyo nombre contenga `transfer`, `ceder`, `revend` o `vender` (sin distinguir mayúsculas).
  - **C18 (copy del Pase):** los nombres de `PASSES` y las filas de `FILAS` que incluye el Pase Fundador no contienen "tierra", "lote", "prioridad", "rendimiento", "retorno" ni "revender". El ⚖ `pasefundador` sí los menciona para negarlos: queda fuera de este control.
  - **C10 (base normativa):** cada decisión de `DECISIONES` (`lib/fogon/datos.ts`) tiene una `regla` no vacía y una `base` que existe en `TERMINOS`.
  - **C20 (voz igual en los tres niveles):** para cada puerta del servicio de permisos, `calcularPermisos` da el mismo resultado con Pase Semilla, Brote o Raíz (mismo resto de la persona).
  - **C21 (sin lotes):** ninguna puerta de `PUERTAS` contiene "lote" en su nombre.
- **Tabla de trazabilidad** en `docs/cumplimiento.md`: cada regla C1–C23 con "test automático" (con la ruta del test), "revisión manual" o "relajada en el prototipo (R14)", copiando la columna "Test" del documento 03. Así el revisor sabe qué mirar a mano.
- Cada test, si falla, explica en su mensaje qué regla rompió y por qué existe (una línea en palabras simples).

**Fuera de alcance:**
- Cambiar código de la app: si un test falla al escribirlo, se frena y se reporta (no se corrige en este cambio).
- Las reglas relajadas por R14 (C2, C4, C13, C17 sobre cobros e inversión), C5–C9 (KYC, residencia, tribus: dependen del backend o de decisiones de Gabriel) y C19 (todavía no hay libro de créditos).
- Revisar los textos legales en sí.

## Capabilities

### New Capabilities
- `cumplimiento-invariantes`: tests automáticos de las reglas de cumplimiento que el prototipo debe respetar y tabla de trazabilidad.

### Modified Capabilities

## Impact

`lib/cumplimiento/invariantes.test.ts` (nuevo), `docs/cumplimiento.md` (nuevo). Lee, sin modificar: `lib/semillas`, `lib/sumarte`, `lib/membresia`, `lib/permisos`, `lib/pasaporte`, `lib/fogon`, `lib/legal/terminos.ts`. Si `pase-fundador-gobernanza` ya está en `main`, el test C20 cubre también la puerta del voto en el Fideicomiso.
