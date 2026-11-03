# Spec Delta

## ADDED Requirements

### Requirement: Textos del modelo híbrido
El sistema SHALL ofrecer los textos del modelo híbrido como datos con fuente, y MUST NOT contener "capitalista", "extractivista", "colonialista", "Franz" ni "diseño B". Los montos MUST leerse del módulo de lotes, no escribirse en esos textos.

#### Scenario: Palabras que no van
- **WHEN** se leen los textos del modelo híbrido
- **THEN** ninguno contiene esas palabras y cada uno tiene fuente

## REMOVED Requirements

### Requirement: Textos del Juego A y el Juego B
**Reason**: El contraste entre los dos juegos sale de la Vista NetX (ADR-030).
**Migration**: Lo reemplaza "Textos del modelo híbrido". La lista de palabras que no van se conserva.
