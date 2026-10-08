## ADDED Requirements

### Requirement: Panel por comunidad
The system SHALL show one card per community where the person is a member, with time, money and presence Semillas and a total.

#### Scenario: Dos comunidades
- **WHEN** la persona es miembro del Lighthouse y de Valle Solar
- **THEN** ve dos tarjetas con sus Semillas en cada una

### Requirement: Ronda solo con pacto aceptado
The recognition round SHALL appear only in communities where the person has an accepted pact.

#### Scenario: Sin pacto
- **WHEN** la persona es miembro de Valle Solar sin pacto aceptado
- **THEN** no ve la ronda y ve cómo habilitarla

### Requirement: Explicación obligatoria
Each score SHALL require a written reason before sending.

#### Scenario: Sin explicación
- **WHEN** la persona puntúa "Aporte al grupo" sin escribir por qué
- **THEN** ve el error y la ronda no se envía

### Requirement: Cómo te reconocieron
The system SHALL show the recognition the person received, with scores and reasons.

#### Scenario: Ver lo recibido
- **WHEN** la persona tiene un pacto aceptado en Valle Solar
- **THEN** ve "Cómo te reconocieron" con puntuaciones y explicaciones de ejemplo
