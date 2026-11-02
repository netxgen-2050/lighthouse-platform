# Spec Delta

## ADDED Requirements

### Requirement: Manifiesto en el modelo híbrido
The "El modelo híbrido" section of `/netx/financiamiento` SHALL include a short block "Las decisiones, con la vida en el centro" with the purpose of Lighthouse VRN, the names of the five groups of principles with how many principles each has, the draft mark and a link to `/tribus/lighthouse`. The block MUST read from the same source as the sheet.

#### Scenario: Relato del modelo híbrido
- **WHEN** una persona del equipo abre `/netx/financiamiento` en la sección "El modelo híbrido"
- **THEN** lee el propósito de Lighthouse VRN, los cinco grupos con su cantidad de principios, la marca de borrador y un enlace a la ficha

## REMOVED Requirements

### Requirement: Manifiesto en la Vista NetX
**Reason**: Nombraba la sección "Juego A o Juego B", que sale de `/netx/financiamiento` (ADR-028).
**Migration**: Lo reemplaza "Manifiesto en el modelo híbrido", con el mismo bloque en la sección nueva.
