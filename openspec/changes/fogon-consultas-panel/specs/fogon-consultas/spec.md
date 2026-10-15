## ADDED Requirements

### Requirement: Administrar consultas desde NetX
`/netx` SHALL show to the super admin a "Consultas del Fogón" section listing every consultation with its state, closing date and participation ("votaron X de N"), without any individual vote or the names of who voted. Other people MUST NOT see the section, and the API MUST refuse them on the server.

#### Scenario: Super admin
- **WHEN** el super admin abre `/netx`
- **THEN** ve "Consultas del Fogón" con cada consulta, su estado y "votaron X de N"

#### Scenario: Otra persona
- **WHEN** una persona con rol `persona` abre `/netx`
- **THEN** no ve la sección

### Requirement: Crear una consulta desde una plantilla
The super admin SHALL create a consultation from a template (U1 to U4 or blank) that fills title, mode and options, and SHALL set the closing date, the result rule (default: at close), votes against (default: off), and in budget mode the amount and currency (empty means "sin dato") and optional cap and floor per option. Invalid input SHALL be shown next to each field and announced.

#### Scenario: Cargar U1
- **WHEN** el super admin elige la plantilla U1, pone el cierre, marca a siete personas del equipo y crea la consulta
- **THEN** la consulta aparece en la lista con "votaron 0 de 7" y las siete personas la ven en `/fogon/consultas`

#### Scenario: Presupuesto sin monto
- **WHEN** el super admin crea U4 sin monto
- **THEN** la consulta se crea y las pantallas muestran "sin dato" donde irían los montos

#### Scenario: Fecha pasada
- **WHEN** el super admin pone una fecha de cierre anterior a hoy
- **THEN** el formulario muestra "La fecha de cierre tiene que ser futura" junto al campo y no crea nada

### Requirement: Padrón al crear
The form SHALL let the super admin choose the roll from the people in the database with checkboxes and add an existing person by email; a consultation MUST have at least one person on the roll.

#### Scenario: Padrón vacío
- **WHEN** el super admin intenta crear una consulta sin marcar a nadie
- **THEN** ve "Elegí al menos una persona para el padrón" y no se crea nada

### Requirement: Cerrar a mano
The super admin SHALL close an open consultation with "Cerrar ahora" after confirming that it cannot be reopened; the list SHALL then show it as closed with the closing time.

#### Scenario: Cerrar
- **WHEN** el super admin aprieta "Cerrar ahora" y confirma
- **THEN** la consulta pasa a "Cerrada" y las personas del padrón ven el resultado y el acta
