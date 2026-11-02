## ADDED Requirements

### Requirement: Indicadores
The system SHALL show at `/netx` the five indicators from mock-up v6 with their numbers in text and the notice that all data is sample data.

#### Scenario: Ver indicadores
- **WHEN** una persona abre `/netx`
- **THEN** ve "412 perfiles completos", "9 tribus activas", "37 pactos aceptados", "USD 1,2 M en el espejo de aportes" y "640 h horas comprometidas por mes"

### Requirement: Embudo con conversión
The system SHALL show the five funnel stages with their counts and the conversion percentage between consecutive stages, computed from the data (not hard-coded).

#### Scenario: Conversión
- **WHEN** el embudo tiene 412 perfiles completos y 186 en una tribu
- **THEN** entre esas etapas muestra 45 %

### Requirement: Cumplimiento y tribus
The system SHALL show the compliance block (meters and alerts) and the "Tribus por proyecto" table from the mock-up, as an accessible table with headers.

#### Scenario: Tabla
- **WHEN** una persona recorre la tabla con lector de pantalla
- **THEN** cada celda se anuncia con su encabezado

### Requirement: Prototipo
The system SHALL show the prototype notice on `/netx`, use only theme tokens, have a single `<main>` (from the layout), pass the axe audit, and never send the person's simulated data to a server.

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre `/netx`
- **THEN** no hay violaciones serias ni críticas
