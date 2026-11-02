# Proposal

## Why

En la revisión del 23-oct-2026 con Bertrand (consultor web3), el selector Mensual/Anual de `/sumarte` confundió: al elegir "Anual", Miembro pasa a USD 100/año pero el Plan Tribu sigue en USD 60/mes, y el Pase Fundador (pago único) se lee como si fuera anual porque su "pago único" va en letra chica. Si se elige anual, todo tiene que verse anual; si se elige mensual, todo mensual, para poder comparar.

## What Changes

- El selector Mensual/Anual aplica a **todos los planes con precio periódico**: Miembro de la red y Plan Tribu.
  - Mensual: Miembro USD 10/mes, Plan Tribu USD 60/mes.
  - Anual: Miembro USD 100/año, Plan Tribu **USD 600/año** (supuesto, ver abajo).
- En "Anual", cada plan periódico muestra "2 meses gratis" junto a su precio (además del aviso que ya tiene el botón "Anual").
- El **Pase Fundador** no depende del selector: muestra "pago único · de por vida" en un tamaño legible (no en texto secundario chico) y lo dice también cuando está elegido "Mensual" o "Anual". El texto de la lista ("Todo lo de Miembro, 1 año incluido") se mantiene.
- Explorador sigue "Gratis" en los dos modos.
- La tabla "Qué incluye cada plan" no cambia.

**Supuestos para que Gus confirme antes de implementar:**
- **Precio anual del Plan Tribu = USD 600** (10 × USD 60, la misma regla de "2 meses gratis" que Miembro: 10 × 10 = 100). Hoy `lib/sumarte/datos.ts` solo tiene `PLAN_TRIBU_MENSUAL = 60`.
- **"De por vida"**: en la llamada Gus dijo que el Pase Fundador es "lifetime". Hoy la tarjeta dice "pago único" y la lista "Todo lo de Miembro, 1 año incluido". Se entiende que el **pase** es de por vida (voz en la Ronda 0, cohorte Génesis) y la **membresía incluida** es de 1 año. Si no es así, el texto a mostrar cambia. El ⚖ `pasefundador` no dice nada de la duración: no se toca su texto en este cambio.

**Fuera de alcance:** cobros reales, nuevos planes, cambiar precios de Miembro o del Pase, la sección "Para inversores".

## Capabilities

### New Capabilities

### Modified Capabilities
- `sumarte`: el período elegido (mensual/anual) se aplica de forma coherente a todos los planes periódicos, y el Pase Fundador se presenta como pago único de por vida.

## Impact

`lib/sumarte/datos.ts` (precio anual del Plan Tribu), `app/sumarte/sumarte-cliente.tsx` (precio y período del Plan Tribu, "2 meses gratis" por tarjeta, texto del Pase), `lib/sumarte/sumarte.test.ts` y el e2e de `/sumarte` si existe. Sin dependencias nuevas ni cambios de datos guardados (`facturacion` ya existe en el estado del navegador).

**Orden de archivo:** el delta es `MODIFIED` sobre la capacidad `sumarte`, que nace en `sumarte-planes` (todavía en `openspec/changes/`). Archivar `sumarte-planes` antes que este cambio; si no, `openspec archive` lo rechaza.
