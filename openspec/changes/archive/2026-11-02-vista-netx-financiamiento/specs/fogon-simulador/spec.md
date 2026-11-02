# Spec Delta

## ADDED Requirements

### Requirement: Acceso desde la Vista NetX
El simulador SHALL abrirse en `/netx/simulador`, como pestaña "Simulador" de la Vista NetX, para toda persona con sesión, con un enlace "← Vista NetX", el rótulo "Vista NetX" en lugar de "Fogón de decisiones" y el h1 "Simulador de la tokenomics" (la bajada cita "NS_Tokenomics doc 28 · diseño B"). `/fogon/simulador` MUST llevar a `/netx/simulador`.

#### Scenario: Desde la Vista NetX
- **WHEN** una persona con sesión abre `/netx` y elige la pestaña "Simulador"
- **THEN** ve el simulador con el h1 "Simulador de la tokenomics" y la pestaña "Simulador" marcada como página actual

#### Scenario: Dirección vieja con rol persona
- **WHEN** una persona con rol "persona" abre `/fogon/simulador`
- **THEN** termina en `/netx/simulador` y ve el simulador

#### Scenario: Sin sesión
- **WHEN** alguien sin sesión abre `/netx/simulador`
- **THEN** termina en Sumarte y no ve el simulador

## REMOVED Requirements

### Requirement: Acceso desde el Fogón
**Reason**: Gus (23-oct-2026): el simulador de la tokenomics no es una decisión de la comunidad; es una herramienta del equipo y va como pestaña de la Vista NetX. El 26-oct abrió la Vista NetX a toda persona con sesión.
**Migration**: `/fogon` deja de enlazarlo y `/fogon/simulador` redirige a `/netx/simulador`. Cuando el resto de D8 lleve los parámetros a una consulta del Fogón, esa consulta puede enlazar al simulador con otro cambio.
