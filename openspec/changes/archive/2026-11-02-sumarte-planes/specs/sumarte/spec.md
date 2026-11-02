## ADDED Requirements

### Requirement: Planes para usuarios
The system SHALL show at `/sumarte` the title "Elegí cómo sumarte" and four plans from mock-up v6: Explorador (free), Miembro de la red (USD 10/month or USD 100/year depending on the Mensual/Anual selector), Pase Fundador (levels Semilla USD 300, Brote USD 1.500, Raíz USD 5.000, one-time payment) and Plan Tribu (USD 60/month), plus the comparison table "Qué incluye cada plan".

#### Scenario: Cambiar a anual
- **WHEN** una persona elige "Anual"
- **THEN** el precio de Miembro muestra "USD 100/año" y el botón "Anual" queda marcado (`aria-pressed="true"`)

#### Scenario: Elegir nivel del Pase
- **WHEN** una persona elige "Raíz" en el selector del Pase Fundador
- **THEN** el precio muestra "USD 5.000 · pago único" y los créditos "USD 1.500"

### Requirement: Cohorte del Pase Fundador
The system SHALL show for the founder pass two meters from mock-up data: "Pases de la cohorte" (142 of 300) and "Mínimo para abrir el Fondo Común" (USD 46.000 of USD 75.000), each with its numbers written in text, not only as a bar.

#### Scenario: Medidores legibles
- **WHEN** una persona abre `/sumarte`
- **THEN** lee "142 de 300" y los montos del Fondo Común en texto

### Requirement: Acceso para inversores
The system SHALL show a section "Para inversores" with "Sumarte al proyecto del Lote 7" (by invitation, with the circle's seat meters and a "Pedir invitación" button) and "Invertir en NetX como empresa" (with "Pedir una charla").

#### Scenario: Pedir invitación
- **WHEN** una persona aprieta "Pedir invitación"
- **THEN** ve "Invitación pedida (simulado)" y el medidor de lugares suma uno

### Requirement: Todo simulado
The system SHALL never charge or send data: choosing a plan, a pass or asking for an invitation MUST be stored only in the browser and labelled "(simulado)", and the page MUST show the prototype notice.

#### Scenario: Activar el pase
- **WHEN** una persona aprieta "Quiero el Pase Brote"
- **THEN** ve "Pase Brote activo (simulado)" y no se hizo ningún pedido de red con esos datos
- **AND** al recargar sigue activo, y hay una forma de deshacerlo ("Volver a Explorador")
