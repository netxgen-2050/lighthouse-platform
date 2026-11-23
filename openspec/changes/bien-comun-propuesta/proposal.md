# Proposal

## Why

`/bien-comun` (cambio `bien-comun-tokens`, 8-nov) muestra un modelo que ya no es el que se discute: FARO vendido por tramos de precio creciente, staking que paga FARO, un reparto fijo con una parte "venta" y la tierra como respaldo. En la call del 16-nov con Juanpi y Franz (`NS_Tokenomics` doc 32) y en la propuesta que salió de ella (doc 34, v0.1 del 19-nov) el esquema cambió: **dos carriles** (capital con retorno por Token Tierra y Token Inversor, dentro de un fideicomiso por barrio; y el bien común con FARO, que no levanta capital, no cotiza y no tiene respaldo en la tierra), **tres puentes** entre ellos y **tres puertas** para tener FARO.

Nada de eso está acordado: el doc 34 es un borrador de Gus para Juanpi y Franz. La plataforma lo tiene que mostrar como **propuesta en discusión**, no como el modelo decidido (pedido de Gus, 23-nov).

Este es el primero de cuatro cambios en los que se partió el pedido (ver "Cambios hermanos").

## What Changes

- **`/bien-comun` pasa a "Propuesta en discusión"**, pública y bilingüe:
  - **Sello** antes de cualquier contenido: "Propuesta v0.1 · en discusión con el equipo · números de ejemplo · lo legal, a verificar con abogado", con la fecha de la versión (19-nov-2026) y la fuente (doc 34).
  - **En una frase** (doc 34 §"En una frase", en palabras simples).
  - **Diagrama de los dos carriles y los tres puentes**, hecho con HTML accesible (no una imagen): quién pone plata y qué recibe, qué es de todos y cómo se alimenta.
  - **Las tres puertas de FARO**, **qué da** y **qué no tiene**, sin jerga.
  - **La política de FARO** en seis tarjetas cortas (emisión, quema, bloqueo, transferencia, reserva, voz).
  - **Lo que hay que decidir**: las 8 decisiones del doc 34 §7 con la recomendación de Gus y su estado ("abierta"). El estado vive en un solo dato por decisión.
  - **Lo que cambia respecto del modelo anterior** (tramos, staking que paga FARO, tierra como reserva, reparto fijo con venta), una línea cada uno.
  - **Preguntas para el abogado** (doc 34 §9) en lugar de la lista de riesgos vieja.
  - Se mantienen, revisadas, las secciones de Ostrom y de parcelas comunes.
- **Sale de la plataforma:** la venta por tramos y su calculadora, el staking (opciones A y B), el reparto fijo del suministro con su parte "venta" y la parte de NetXGen, la tierra como reserva, el aporte de entrada del 10 % y todo texto que hable de precio o retorno de FARO. Se retiran los ⚖ `ventatramos`, `stakingbiencomun` y `partenetxgen`; se reescribe `tokenbiencomun`.
- **⚖ nuevos en borrador (es/en):** `fideicomisobarrio`, `tokentierra`, `tokeninversor`, `tesorocomun`. Los usan este cambio y los hermanos.
- **`lib/bien-comun/modelo.ts` se reescribe** como el único módulo con versión de la propuesta: cada valor con su fuente (doc 34, doc 32, slides del 9-nov o `sim/barrio_stack_sim.py`). Los valores que ya viven en `lib/lotes/modelo.ts` se importan de ahí, no se copian.
- **La regla "sin promesas" se afina:** la palabra "retorno" solo puede aparecer en los textos del carril A (Token Tierra, Token Inversor, fideicomiso); nunca junto a FARO.

## Cambios hermanos (el pedido partido en cuatro)

1. **`bien-comun-propuesta`** (este): modelo, página, retiros y ⚖.
2. **`bien-comun-numeros-barrio`**: la calculadora "Los números del barrio" en `/bien-comun`. Depende de este.
3. **`lote-token-tierra`**: la ficha del lote con el plan en cuotas (Token Tierra) y el FARO por cuota; el NFT como ficha del lote. Depende de este.
4. **`token-inversor-y-coherencia`**: el Token Inversor en `/netx/financiamiento` y la revisión de `/lotes/hibrido`, la Vista NetX y Sumarte. Depende de 1 y 2.

## Fuera de alcance

- Contratos, billeteras, red, emisión o cobros reales. Nada se guarda.
- La calculadora del barrio (cambio 2), la ficha del lote (cambio 3), el Token Inversor y los textos de otras páginas (cambio 4).
- El rediseño visual de la semana (otro cambio). Este cambio deja la presentación en componentes chicos para poder repintarla.
- Decidir por el equipo: la página muestra la propuesta y sus decisiones abiertas, no las cierra.
- Editar `NS_Tokenomics`.
- Vender o prepagar servicios en FARO (la tercera puerta solo se describe; `procomun-tickets` sigue bloqueado hasta el sí de Franz).

## Capabilities

### New Capabilities
- `bien-comun-propuesta`: la propuesta v0.1 del bien común y los tokens, mostrada como propuesta en discusión.

### Modified Capabilities
- Reemplaza, en `bien-comun-tokens` (cambio todavía sin archivar), los requisitos "Venta temprana por tramos", "Staking, CAPEX y OPEX, riesgos", "Reparto y parcelas comunes" (la parte del reparto) y "Dos tipos de token" (la parte de FARO). Ver la nota de archivo en `design.md`.

## Impact

- **Cambia:** `lib/bien-comun/modelo.ts` y su test, `lib/bien-comun/formato.ts` (si sobra algo), `app/bien-comun/page.tsx`, `lib/idioma/textos/bien-comun.ts` y su test, `lib/legal/terminos.ts` y su test, `lib/lotes/sin-numeros-escritos.test.ts`, `e2e/bien-comun.spec.ts`.
- **Nuevo:** componentes chicos en `components/bien-comun/` (sello, diagrama, tarjetas).
- **Se borra:** `app/bien-comun/calculadora.tsx` (`git rm`).
- **Sin** tablas, migraciones, permisos, integraciones ni dependencias nuevas. Ruta pública ya existente.

## Decisiones de Gus (23-nov-2026, issue #79)

- **Primeros 4 lotes:** no entran a Token Tierra por ahora (no están en el barrio de 21 lotes del doc 34).
- **Si el plano no tiene 21 lotes:** la calculadora usa 21 y la página muestra la diferencia.
- **Sello:** primero en la página, no fijo arriba de la pantalla.
- **Pase Fundador y la sección Invertir de Sumarte:** siguen como están, con la línea de contexto; se revisan cuando Juanpi y Franz decidan.
- **Plazo máximo del Token Inversor:** "sin dato" hasta que lo diga Juanpi.
- **`bien-comun-tokens`:** se archiva antes de construir (tarea 0.1).
- **FARO y la adhesión al manifiesto:** conviven; manda la adhesión (ADR-031, aceptada) hasta que se resuelva la decisión 5 del doc 34.
- **"Los números del barrio":** solo con sesión hasta la revisión R14 (`bien-comun-numeros-barrio`).
- **Lote comprado en cuotas:** estado propio "En cuotas (simulado)" (`lote-token-tierra`).
