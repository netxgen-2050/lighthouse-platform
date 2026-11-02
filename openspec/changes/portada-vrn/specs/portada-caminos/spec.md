# Spec Delta

## MODIFIED Requirements

### Requirement: Tres caminos en la portada
The system SHALL show at `/`, below the narrative of Lighthouse VRN, a section titled "Por dónde empezar" with exactly three links, in this order: "Ver los lotes" to `/lotes` (label "Comprar"), "Explorar el territorio" to `/territorios/lighthouse` (label "Descubrir") and "Ver las tribus" to `/tribus` (label "Lo que viene"). Each link MUST include a one-line description.

#### Scenario: Ver los tres caminos
- **WHEN** una persona abre `/`
- **THEN** ve la sección "Por dónde empezar" con los tres caminos en ese orden
- **AND** no ve ningún camino al Congreso

#### Scenario: Cada camino lleva a su página
- **WHEN** una persona activa "Ver los lotes", "Explorar el territorio" o "Ver las tribus"
- **THEN** llega a `/lotes`, `/territorios/lighthouse` o `/tribus`, respectivamente, y la página responde 200

### Requirement: Caminos usables con teclado
Each path SHALL be a single focusable link whose accessible name includes its title, reachable with Tab and activated with Enter, with a visible focus indicator.

#### Scenario: Recorrer con teclado
- **WHEN** una persona navega la portada solo con Tab
- **THEN** cada camino recibe el foco en orden y muestra un indicador de foco visible
- **AND** al apretar Enter sobre "Explorar el territorio" llega a `/territorios/lighthouse`

### Requirement: Cantidad de barrios desde los datos
The description of "Ver las tribus" SHALL derive the number of neighborhoods from the territory data, not from a hard-coded number.

#### Scenario: Cantidad de barrios desde los datos
- **WHEN** el territorio Lighthouse tiene 12 tribus en sus datos
- **THEN** la descripción de "Ver las tribus" dice "12 barrios"

## REMOVED Requirements

### Requirement: Héroe del mock-up con la propuesta para inversores
**Reason**: La portada pasa a contar la narrativa de Lighthouse VRN a 2030 (fase 1, ADR-028).
**Migration**: La reemplazan los requisitos de `portada-narrativa`. El enlace "Elegí cómo sumarte" se conserva como acción secundaria, y `/sumarte` sigue dejando claro que la plataforma sirve para captar plata.
