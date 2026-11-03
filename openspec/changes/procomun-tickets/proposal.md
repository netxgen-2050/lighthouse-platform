# Proposal

> **⛔ BLOQUEADA hasta el sí de Franz. No se implementa.** Este cambio es solo esta propuesta: no tiene specs, design ni tareas, a propósito. Ninguna noche lo tiene que tomar. Si Franz dice que sí, Gus pide escribir el resto; si dice que no, se archiva o se borra.

## Why

Vender tickets de acceso al procomún sería otra forma de financiar lo común, además del aporte y las expensas de los lotes. El problema: un ticket que da acceso y voz **mete la gobernanza en el alcance**. Hoy la gobernanza está en pausa para que la fase 1 sea la venta de lotes. Por eso esto no se hace sin una decisión explícita.

## What Changes

Si se aprueba, una persona podría comprar, de forma simulada, un ticket de acceso al procomún en uno de tres niveles, que salen de `NS_Tokenomics` doc 04 y `sim/hatch_sim.py`.

**Qué daría cada ticket.** Valores de ejemplo, a re-ajustar:

| Nivel en doc 04 | En la plataforma hoy | Precio | Créditos (30 % del precio) | Voz | Tierra o lote |
|---|---|---|---|---|---|
| Semilla | Semilla | USD 300 | USD 90 | La misma en los tres | Nada |
| Guardián / Steward | Brote | USD 1.500 | USD 450 | La misma en los tres | Nada |
| Raíz / Guardian | Raíz | USD 5.000 | USD 1.500 | La misma en los tres | Nada |

- **Acceso:** membresía no transferible del procomún.
- **Créditos:** se liberan en 3 años, cada parte vence a los 12 meses, y no se transfieren ni se cambian por plata. Incluyen estadías, como saldo que se consume, nunca "N noches por año".
- **Voz:** una persona, una voz, sea cual sea el nivel; la plata compra acceso y créditos, no más voz (doc 04 §2). Doc 04 suma un aumento por presencia confirmada de hasta ×2, atado al encuentro de febrero cancelado: hay que decidir si sigue.
- **Lo que no da:** tierra, lotes, prioridad, reserva, crédito hacia un lote ni rendimiento (doc 18 §4.5). No se revende.
- **Cupo de la cohorte:** sin dato en este contexto. Doc 04 lo ata a la capacidad del pozo común.

**Gobernanza mínima que se descongelaría.** Sin esto, la "voz" del ticket sería una promesa vacía:

| Qué | Hoy | Por qué hace falta |
|---|---|---|
| `consentimiento-alta` (y detrás `consentimiento-en-la-base`) | 0/15 y 0/6 | Es el primer bloqueante de toda la serie de la base (backlog B8): antes de guardar en la base quién compró y quién opina, hay que tener su consentimiento |
| Fogón en la base: `fogon-cuadratico-en-la-base` y `fogon-consultas-panel` | 0/13 y 0/4 | Para que la voz de quien tiene un ticket quede registrada de verdad, y no solo en su navegador |
| Influencia en el Fondo Común (backlog D38, conviction voting) | Sin spec | Es lo que el Pase ya promete como "próximamente"; hay que diseñarla con NS_Tokenomics |

**Relación con el Pase Fundador.** Los tres niveles y precios **son los mismos** que el Pase Fundador que `/sumarte` ya muestra simulado. `sumarte-diseno-b` conserva el Pase como está, sin mecanismo de gobernanza nuevo. Si esto se aprueba, hay que decidir si "ticket" es otro nombre del Pase o un producto distinto.

## Fuera de alcance

- **Todo, por ahora:** ni código, ni textos, ni specs, hasta el sí de Franz.
- **Aunque se apruebe, sigue congelado:** `fogon-desde-mi-y-guardian`, `fogon-consenso-en-tarjetas`, `fogon-consenso-formal`, `semillas-constancias`, `liderar-varias-tribus`, billeteras, Mi Raíz, EAS, smart contracts y red de nodos.
- **Cobros reales:** seguirían simulados, igual que los lotes.
- **Mezclar tickets con lotes:** un ticket nunca da prioridad sobre un lote.
- **Re-correr `sim/hatch_sim.py`:** su v0.1 (2-oct) supone el encuentro de febrero y un Guardián que hoy no existen. Eso es de NS_Tokenomics (I-15).

## Capabilities

### New Capabilities
<!-- Ninguna todavía: se definen si Franz dice que sí. -->

### Modified Capabilities
<!-- Ninguna todavía. El cambio declara `skip_specs: true` mientras está bloqueado. -->

## Impact

- **Ahora:** ninguno. Es un documento.
- **Si se aprueba:** tablas y migraciones por la serie de la base, datos personales, permisos y pagos simulados, así que necesitaría revisión de arquitectura. Es varias noches, y habría que partirlo en cambios chicos.

**Lo que tiene que responder Franz:**
1. ¿Se venden tickets de acceso al procomún en esta etapa, sí o no?
2. ¿Quién recibiría esa plata mientras la Fundación no exista?
3. ¿Se aceptan los derechos de la tabla, en especial "la misma voz en los tres niveles"?
