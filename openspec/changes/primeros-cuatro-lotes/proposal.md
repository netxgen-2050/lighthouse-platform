# Proposal

## Why

Gus informó el 4-nov-2026 que los primeros lotes que se venden son 4 aledaños al 7A: BioPueblo los da así y son los únicos lotes aledaños ya aprobados por la municipalidad [NC, sin documento]. Son la excepción a "Chacras de Soluna es vitrina" (R40). La memoria técnica de Martín del 3-nov, además, permite nombrar las parcelas del plano, que hasta ahora decían "sin dato".

## What Changes

- **Lotes A, B, C y D** (Placemarks 33 a 36) entran como grupo `primeros`: van primero en la lista, en el mapa y en Sumarte, y el importador no les exige estar dentro del 7A.
- **Estado administrativo propio** (`lighthouse-primeros`): titular BioPueblo; aprobación "informada, sin documento a la vista"; expediente y fecha "sin dato"; ⚖ `primeroslotes` en borrador. `aprobacionMunicipal` sigue en `false`.
- **Aviso en la ficha** de cada uno: fuera del polígono del 7A, sin documento, simulación.
- **La escala de precio** baja su mínimo a 1.421 m². Los precios de los 21 lotes cambian.
- **Parcelas con código y uso** del cuadro 2.3.2 de la memoria técnica: el mapeo las nombra y el panel del mapa dice qué es cada una. Sigue siendo lectura nuestra, a confirmar con Martín.

## Fuera de alcance

- Quién vende y la comisión: "Quién vende" sigue "sin dato" en la pantalla (decisión de Gus, 4-nov, R38).
- Si estos 4 aportan a lo común de Lighthouse: es un apunte para `modelo-hibrido-procomun`.
- Ningún cobro real, sea cual sea el estado de la aprobación.

## Impact

`datos/planos/`, `lib/territorios/`, `lib/legal/`, `lib/lotes/modelo.ts`, `app/lotes/`, `app/territorios/`, `app/sumarte/`.
