## ADDED Requirements

### Requirement: Tres tipos de pacto
The system SHALL show at `/pactos` three tabs from mock-up v6: "Pacto de tiempo", "Sumarte con plata" and "Pacto de convivencia", as an accessible tablist.

#### Scenario: Cambiar de pestaña
- **WHEN** una persona elige "Sumarte con plata"
- **THEN** ve el contenido de esa pestaña y la pestaña queda marcada (`aria-selected="true"`)

### Requirement: Cálculo del pacto de tiempo
The system SHALL compute monthly Semillas as hours × reference hour value in USD × share given as seed × peer evaluation (1.0 by default), and show the cash part, both updating as the person changes hours or share.

#### Scenario: Cambiar las horas
- **WHEN** la persona pasa de 10 a 20 h/mes con 50 % en semilla
- **THEN** las Semillas por mes se duplican y la fórmula sigue visible

### Requirement: Estado del pacto
The system SHALL show the steps Borrador, En revisión, Aceptado, move forward with "Enviar a la tribu" and "Simular: la tribu acepta", and keep the state after reload.

#### Scenario: Aceptar
- **WHEN** la persona envía el pacto y simula la aceptación
- **THEN** ve "Pacto aceptado" y al recargar sigue aceptado

### Requirement: Prototipo
The system SHALL show the prototype notice on `/pactos`, use only theme tokens, have a single `<main>` (from the layout), pass the axe audit, and never send the person's simulated data to a server.

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre `/pactos`
- **THEN** no hay violaciones serias ni críticas
