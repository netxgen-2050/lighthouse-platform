## ADDED Requirements

### Requirement: Fuentes del permiso
The system SHALL compute permissions only from five sources of a person: plan (`explorador` | `miembro`), founder pass (none or `semilla` | `brote` | `raiz`), accepted tribe memberships (list of tribe ids), Genesis presence (yes/no) and resident role (yes/no). An Explorer with nothing else is the minimum state.

#### Scenario: Persona mínima
- **WHEN** se calculan los permisos de una persona con plan `explorador`, sin pase, sin tribu, sin presencia y no residente
- **THEN** solo están abiertas "Mapa, tribus y eventos abiertos" y "Registrar ticket del Congreso"

### Requirement: Tabla de puertas de la nota 18
The system SHALL open each door exactly as table §3 of note 18 says, and the table MUST live as data in one place so it can be audited against the document. Doors: mapa-tribus-eventos, registrar-ticket, foros-red, sala-tribu, canal-fundadores, voz-tribu, voz-fondo-comun, voto-asamblea-residentes, creditos.

#### Scenario: Miembro visita salas de tribu
- **WHEN** una persona con plan `miembro`, sin tribu, consulta la puerta `sala-tribu`
- **THEN** está abierta con grado "visita"

#### Scenario: Miembro aceptado de una tribu
- **WHEN** una persona aceptada en la tribu `valle` consulta `sala-tribu`
- **THEN** está abierta con grado "completa" solo para `valle`, y "visita" para otras tribus si su plan o pase lo permite

#### Scenario: Canal de fundadores
- **WHEN** una persona con pase `semilla` consulta `canal-fundadores`
- **THEN** está abierta con motivo `pase`
- **AND** para cualquier persona sin pase está cerrada

#### Scenario: Voto en la Asamblea de residentes
- **WHEN** una persona residente consulta `voto-asamblea-residentes`
- **THEN** está abierta con grado "1 persona = 1 voto" y motivo `rol`
- **AND** ninguna otra fuente la abre

#### Scenario: Presencia sin pase no da voz en el Fondo Común
- **WHEN** una persona con presencia Genesis y sin pase consulta `voz-fondo-comun`
- **THEN** está cerrada

### Requirement: Motivos auditables
The system SHALL return, for every open door, the list of sources that open it (`plan`, `pase`, `tribu`, `presencia`, `rol`). A door opened by several sources MUST list all of them.

#### Scenario: Dos motivos
- **WHEN** una persona `miembro` con pase `brote` consulta `foros-red`
- **THEN** está abierta con motivos `plan` y `pase`

### Requirement: Lo no decidido no se inventa
The system SHALL represent the presence boost on the founders' voice in the Common Fund as "pending decision" (note 18: ×1.5 to ×2 with a cap), never as a number, until a decision is recorded.

#### Scenario: Pase con presencia
- **WHEN** una persona con pase `raiz` y presencia Genesis consulta `voz-fondo-comun`
- **THEN** está abierta con 1 voz base y el refuerzo por presencia figura como "a decidir"
