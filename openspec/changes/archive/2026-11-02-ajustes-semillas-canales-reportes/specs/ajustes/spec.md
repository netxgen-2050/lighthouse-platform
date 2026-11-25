## ADDED Requirements

### Requirement: Factor de evaluación fijo en Semillas
The system SHALL use a fixed peer-evaluation factor of 1.0 to compute Semillas, as in mock-up v6; the peer round MAY still be sent (simulated) but MUST NOT change the factor.

#### Scenario: Ronda enviada
- **WHEN** la persona envía la ronda de reconocimiento con notas distintas de 5
- **THEN** el factor sigue siendo 1,0 y las Semillas no cambian

### Requirement: Solo el pacto de tiempo suma Semillas de tiempo
The system SHALL count as time Semillas only an accepted pact of type "tiempo"; accepted pacts of type "plata" or "convivencia" MUST NOT add time Semillas.

#### Scenario: Pacto de convivencia
- **WHEN** la persona tiene aceptado solo un pacto de convivencia
- **THEN** la tarjeta de Tiempo en `/semillas` invita a proponer un pacto de tiempo y no muestra Semillas

### Requirement: ⚖ en la frase del Pase
The system SHALL mark the phrase about the pass being a service that does not add Semillas with the ⚖ `pasefundador`.

#### Scenario: ⚖ presente
- **WHEN** la persona ve esa frase en `/semillas`
- **THEN** a su lado hay un ⚖ con nombre accesible "Qué significa legalmente: Pase Fundador"

### Requirement: Canales como tarjetas en el celular
The system SHALL show the doors of `/canales` as stacked cards (name, status in text, reason and what opens it) under 640 px wide, and as the table from 640 px up.

#### Scenario: 320 px
- **WHEN** `/canales` se ve con 320 px de ancho
- **THEN** cada puerta es una tarjeta legible, no hay tabla y no hay scroll horizontal

### Requirement: Aviso de privacidad en reportes
The system SHALL show next to the contact field of the report dialog: "Tu reporte, y tu contacto si lo dejás, lo ve el equipo de NetX."

#### Scenario: Aviso visible
- **WHEN** la persona abre el diálogo "Reportar"
- **THEN** ve el aviso junto al campo de contacto
