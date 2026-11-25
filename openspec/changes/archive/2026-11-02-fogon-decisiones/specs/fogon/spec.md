## ADDED Requirements

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
The system SHALL filter decisions by scope: Tribu, Asamblea de residentes, Fideicomiso.

#### Scenario: Filtrar
- **WHEN** la persona elige "Fideicomiso"
- **THEN** ve solo el presupuesto de obra del macrolote

### Requirement: Prototipo
The system SHALL show the prototype notice on `/fogon`, use only theme tokens, have a single `<main>` (from the layout), pass the axe audit, and never send the person's simulated data to a server.

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre `/fogon`
- **THEN** no hay violaciones serias ni críticas
