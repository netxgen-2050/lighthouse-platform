## ADDED Requirements

### Requirement: Próximo paso
The system SHALL show exactly one next step computed from the person's progress, in the order listed, with its action button.

#### Scenario: Sin perfil
- **WHEN** la persona no completó su perfil
- **THEN** el próximo paso es "Completá tu perfil" con un botón a `/perfil`

### Requirement: Línea de tiempo
The system SHALL show the activity timeline newest first, grouped by day.

#### Scenario: Actividad
- **WHEN** la persona adhirió a un manifiesto y propuso un pacto
- **THEN** ve los dos eventos en su línea de tiempo, el pacto primero

### Requirement: Bitácora como pestaña
The Bitácora SHALL be a tab of Mi recorrido, and `/panel/bitacora` SHALL open that tab.

#### Scenario: Enlace viejo
- **WHEN** la persona abre `/panel/bitacora`
- **THEN** ve Mi recorrido con la pestaña Bitácora seleccionada
