# Spec Delta

## MODIFIED Requirements

### Requirement: Inversión y círculo con el mismo pedido
The system SHALL make "Pedir invitación" and "Pedir una charla" open the form; only after sending SHALL they keep their current effect ("Invitación pedida (simulado)" or "Charla pedida (simulado)"). Cancelling MUST leave `/sumarte` unchanged. Requests saved earlier with the reference "Lote 7" MUST keep showing as they were saved.

#### Scenario: Pedir invitación al círculo
- **WHEN** la persona aprieta "Pedir invitación", elige "Email" y envía
- **THEN** ve "Invitación pedida (simulado)"
- **AND** la bandeja tiene un pedido "Invitación al círculo · Programa de series" con destino "Equipo NetX"

#### Scenario: Cancelar la charla
- **WHEN** la persona aprieta "Pedir una charla" y después "Cancelar"
- **THEN** sigue viendo el botón "Pedir una charla"

#### Scenario: Pedido viejo
- **WHEN** el navegador tiene guardado un pedido "Invitación al círculo · Lote 7"
- **THEN** se sigue mostrando con esa referencia
