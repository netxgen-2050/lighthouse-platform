## ADDED Requirements

### Requirement: Marca de término legal
The system SHALL mark every term with legal weight with a ⚖ control placed next to the term. Activating the control (click, tap, Enter or Space) MUST show the term title and a plain-language explanation; Escape or activating it again MUST close it.

#### Scenario: Abrir con teclado
- **WHEN** una persona llega con Tab al ⚖ de "Ritual de entrada" y aprieta Enter
- **THEN** ve el título "Ritual de entrada" y su explicación
- **AND** al apretar Escape la explicación se cierra y el foco vuelve al ⚖

#### Scenario: Nombre accesible
- **WHEN** un lector de pantalla llega al ⚖
- **THEN** anuncia "Qué significa legalmente: <título del término>"

### Requirement: Solo textos aprobados
The system SHALL take legal explanations only from a single catalog in the repo. In this version the catalog MUST contain only `ritual` ("Ritual de entrada") and `personeria` ("Comunidad con personería"), copied verbatim from mock-up v6. A term key missing from the catalog MUST fail the build or the tests, never render an empty explanation.

#### Scenario: Clave inexistente
- **WHEN** el código usa una clave que no está en el catálogo
- **THEN** el chequeo de tipos o los tests fallan
