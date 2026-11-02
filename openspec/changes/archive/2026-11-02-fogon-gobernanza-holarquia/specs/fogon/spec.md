## ADDED Requirements

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
