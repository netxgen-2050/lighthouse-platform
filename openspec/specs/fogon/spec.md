# fogon Specification

## Purpose
TBD - created by archiving change fogon-decisiones. Update Purpose after archive.

## Requirements

### Requirement: Decisiones con su base
The system SHALL list at `/fogon` the five decisions from mock-up v6, each showing where it is decided, the rule (Consentimiento, Consenso, 2/3 de los votos, Mayoría según el contrato, Según el estatuto) and a ⚖ with its normative basis.

#### Scenario: Ver una decisión
- **WHEN** una persona abre `/fogon`
- **THEN** ve "Usar el fondo común para la bomba solar" con "Asamblea de residentes", "Consenso" y su ⚖

### Requirement: Votación simulada
The system SHALL let the person vote (a favor, en contra, abstención) on decisions they can vote on, store it in the browser and show the updated count; decisions they cannot vote on MUST show why.

#### Scenario: Votar
- **WHEN** la persona vota a favor en el plan de huerta
- **THEN** ve su voto registrado (simulado) y el conteo actualizado, también al recargar

### Requirement: Filtro por ámbito
The system SHALL filter decisions by scope: Todas, Círculo, Tribu, Lighthouse (el común), Consejo, Fideicomiso. The scope "Asamblea de residentes" MUST NOT be offered.

#### Scenario: Filtrar
- **WHEN** la persona elige "Fideicomiso"
- **THEN** ve solo el presupuesto de obra del macrolote

#### Scenario: Filtrar por el común
- **WHEN** la persona elige "Lighthouse (el común)"
- **THEN** ve "Usar el fondo común para la bomba solar" y "Permitir animales de granja en las chacras", cada una con su regla y su ⚖

#### Scenario: Filtros disponibles
- **WHEN** la persona mira el grupo "Filtrar por ámbito"
- **THEN** ve exactamente "Todas", "Círculo", "Tribu", "Lighthouse (el común)", "Consejo" y "Fideicomiso"

### Requirement: Prototipo
The system SHALL show the prototype notice on `/fogon`, use only theme tokens, have a single `<main>` (from the layout), pass the axe audit, and never send the person's simulated data to a server.

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre `/fogon`
- **THEN** no hay violaciones serias ni críticas

### Requirement: Llevar una decisión al consejo
A tribe decision that was approved in the tribe and asks something from the común SHALL be able to be taken to the council by a leader of that tribe (simulated). In the council scope it MUST show the tribe it comes from and that it was approved there. People who do not lead the tribe MUST NOT see the action.

#### Scenario: Líder lleva la decisión
- **WHEN** la líder de Valle Solar (simulado) elige "Llevar al consejo" en el pedido al Fondo Común
- **THEN** la decisión aparece en "Consejo" con "Viene de Valle Solar (aprobada en la tribu)" y queda así al recargar

#### Scenario: No lidera
- **WHEN** una persona que no lidera Valle Solar mira esa decisión
- **THEN** no ve "Llevar al consejo"

### Requirement: Acceso a la estructura
The `/fogon` page SHALL link to `/fogon/gobernanza` ("Cómo decidimos").

#### Scenario: Desde el Fogón
- **WHEN** la persona abre `/fogon`
- **THEN** ve el enlace "Cómo decidimos" y llega a `/fogon/gobernanza`

### Requirement: Parámetros opcionales de una decisión
A decision SHALL be able to carry optional parameters: a deadline or closing date, the agreement or norm it relies on, and an amount requested with its source (simulated money). The decision card in `/fogon` and the decision detail in `/fogon/gobernanza` MUST show each parameter only when it exists. An amount whose figure is unknown MUST show "sin dato", never 0. These parameters MUST NOT be drawn on the governance map.

#### Scenario: Decisión con monto
- **WHEN** la persona mira en `/fogon` el pedido de Valle Solar al Fondo Común para la bomba solar
- **THEN** ve el monto pedido, que sale del Fondo Común, y la fecha de cierre, con el aviso de que la plata es simulada

#### Scenario: Decisión sin parámetros
- **WHEN** la persona mira "Elegir facilitador/a de Valle Solar"
- **THEN** la tarjeta no muestra filas de plazo, acuerdo ni monto

#### Scenario: Monto sin cifra
- **WHEN** una decisión pide plata del Fondo Común pero su cifra no se conoce
- **THEN** la tarjeta dice "Monto pedido: sin dato" y no muestra 0

### Requirement: Decisiones de ejemplo con camino
The Fogón SHALL include the example decisions "Parámetros de la regalía de regeneración" (scope Lighthouse (el común), proposed by the común's Tokenomics y Semillas circle) and "Cisterna compartida entre Agua Clara y Valle Solar" (scope Consejo, derived to the común's Agua del Lighthouse circle), each marked as example.

#### Scenario: Regalía en el común
- **WHEN** la persona filtra por "Lighthouse (el común)"
- **THEN** entre las decisiones ve "Parámetros de la regalía de regeneración"

#### Scenario: Cisterna en el consejo
- **WHEN** la persona filtra por "Consejo"
- **THEN** entre las decisiones ve "Cisterna compartida entre Agua Clara y Valle Solar"
