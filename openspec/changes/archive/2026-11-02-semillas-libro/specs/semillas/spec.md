## ADDED Requirements

### Requirement: Tres orígenes
The system SHALL show at `/semillas` three cards (Tiempo, Plata, Presencia) built from the person's simulated data in the browser; missing data MUST show "sin dato" or the mock-up's guidance text, never an invented number.

#### Scenario: Sin pacto
- **WHEN** la persona no tiene un pacto aceptado
- **THEN** la tarjeta de Tiempo invita a proponer un pacto y no muestra un número

### Requirement: Lo que se te abre
The system SHALL show the five-step ladder from the mock-up with each step's state written in text, and the "Sembrador/a activo/a" meter (semillas de tiempo en 3 meses, of 120) with its numbers in text.

#### Scenario: Medidor
- **WHEN** la persona tiene un pacto de 20 h/mes
- **THEN** ve el medidor con su número de semillas de 120 y el estado "En camino" o "Lista"

### Requirement: Ronda de reconocimiento
The system SHALL let the person rate two tribe peers 1–5 on role and culture (simulated) and show the resulting evaluation factor.

#### Scenario: Evaluar
- **WHEN** la persona envía la ronda
- **THEN** ve "Ronda enviada (simulado)" y el factor resultante

### Requirement: Prototipo
The system SHALL show the prototype notice on `/semillas`, use only theme tokens, have a single `<main>` (from the layout), pass the axe audit, and never send the person's simulated data to a server.

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre `/semillas`
- **THEN** no hay violaciones serias ni críticas
