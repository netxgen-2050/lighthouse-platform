# Spec Delta

## ADDED Requirements

### Requirement: Acceso desde la Vista NetX
El simulador SHALL abrirse en `/netx/simulador`, como pestaña "Simulador" de la Vista NetX, solo para el super admin, con un enlace "← Vista NetX" y el rótulo "Vista NetX" en lugar de "Fogón de decisiones". El rail SHALL marcar "NetX" como activo en esa página. `/fogon/simulador` MUST llevar a `/netx/simulador`.

#### Scenario: Desde la Vista NetX
- **WHEN** el super admin abre `/netx` y elige la pestaña "Simulador"
- **THEN** ve el simulador con el h1 "Simulador de la tokenomics (diseño B)" y el rail marca "NetX"

#### Scenario: Persona sin permiso
- **WHEN** una persona que no es super admin abre `/fogon/simulador`
- **THEN** termina en `/netx/simulador` y ve "No tenés acceso a esta vista"

## REMOVED Requirements

### Requirement: Acceso desde el Fogón
**Reason**: Gus (23-oct-2026): el simulador de la tokenomics no es una decisión de la comunidad; es una herramienta del equipo y va como pestaña de la Vista NetX.
**Migration**: `/fogon` deja de enlazarlo y `/fogon/simulador` redirige a `/netx/simulador`. Cuando el resto de D8 lleve los parámetros a una consulta del Fogón, esa consulta puede enlazar al simulador con otro cambio.
