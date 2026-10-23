## Purpose

Tomar decisiones del Lighthouse por Consenso Formal, con una facilitación que ayuda a las personas a escucharse sin decidir por ellas, y que convive con el voto cuadrático para repartir recursos, priorizar y curar.

## ADDED Requirements

### Requirement: Etapas del Consenso Formal
A proposal SHALL go through these stages in order: presentation, clarifying questions, concerns, resolve or modify, and closing. The current stage MUST be visible, and actions that belong to another stage MUST NOT be available.

#### Scenario: Pregunta en la etapa de preguntas
- **WHEN** una propuesta está en "Preguntas aclaratorias" y una participante escribe una pregunta
- **THEN** la pregunta queda registrada y el botón para registrar una preocupación no está disponible todavía

#### Scenario: Avanzar de etapa
- **WHEN** quien facilita (en la simulación, quien propone) pasa la propuesta a "Preocupaciones"
- **THEN** la etapa visible cambia y las participantes pueden registrar preocupaciones

### Requirement: Cierre con consenso, apartarse o bloqueo
The closing SHALL record one of three outcomes: consensus, consensus with people standing aside (their disagreement recorded, not blocking), or block (with a mandatory reason; the proposal is not adopted). A block or a stand-aside without a written reason MUST NOT be accepted.

#### Scenario: Bloqueo sin razón
- **WHEN** una participante intenta bloquear sin escribir la razón
- **THEN** el sistema pide la razón y no registra el bloqueo

#### Scenario: Consenso con personas que se apartan
- **WHEN** la propuesta cierra con dos personas que se apartan
- **THEN** se muestra "Adoptada por consenso" y la lista de quienes se apartaron, con sus razones

### Requirement: Versiones de la propuesta
Modifying a proposal in the resolve stage SHALL create a new version; earlier versions and the concerns raised on them MUST remain visible in the history and MUST NOT be edited.

#### Scenario: Modificar por una preocupación
- **WHEN** quien propone modifica el texto para resolver una preocupación
- **THEN** aparece la versión 2, la versión 1 queda en el historial y la preocupación muestra a qué versión se refería

### Requirement: Facilitación que no decide
The proposal SHALL show a "Facilitación" panel with summaries of positions, open concerns, reflections ("¿lo entendí bien?") and off-topic or noise flags. The panel MUST state that it is a simulation in this change and that it never decides. The facilitation MUST NOT close a proposal, block, accept, or hide anyone's contribution; an off-topic flag MUST be visible to the flagged person, who can dispute it.

#### Scenario: Marca de fuera de tema
- **WHEN** la facilitación marca un aporte como "fuera de tema"
- **THEN** el aporte sigue visible, con la marca, y su autora ve "No estoy de acuerdo con esta marca"

#### Scenario: Honestidad de la simulación
- **WHEN** una persona abre el panel de facilitación
- **THEN** lee que la facilitación es simulada y que las decisiones las toman las personas

### Requirement: Participación por ámbito
Each proposal SHALL belong to one governance scope (círculo, tribu, el común or consejo) and show who can participate in it. A person outside the scope MUST be able to read the proposal but MUST NOT be able to add questions, concerns or closing positions.

#### Scenario: Persona de otra tribu
- **WHEN** una persona que no es de Valle Solar abre una propuesta del ámbito Tribu de Valle Solar
- **THEN** puede leerla, pero ve "Participan las personas de Valle Solar" en lugar de los botones para participar

### Requirement: Voz con contexto visible
Each participant SHALL show the validated context they have in that scope (active pact, presence, membership of the tribe or circle), or "sin dato" when there is none. In this change the context MUST only be shown and MUST NOT enable, weight or limit participation.

#### Scenario: Participante sin pacto
- **WHEN** participa alguien de la tribu sin pacto activo
- **THEN** su aporte muestra "Pacto: sin dato" y puede participar igual

### Requirement: Reducción de ruido
The system SHALL keep questions and concerns separate, allow at most one open concern per person per proposal version, and require a written reason for every concern.

#### Scenario: Segunda preocupación abierta
- **WHEN** una participante con una preocupación abierta en la versión 1 intenta registrar otra
- **THEN** el sistema le propone editar o retirar la suya en lugar de abrir otra

### Requirement: Convivencia con el voto cuadrático
The Fogón SHALL distinguish two consultation types: "Propuesta (consenso)" for decisions and "Reparto o prioridad (voto cuadrático)" for distributing resources, prioritizing and curating. Both MUST remain available; this change MUST NOT alter the quadratic voting behavior.

#### Scenario: Filtrar por tipo
- **WHEN** una persona filtra el Fogón por "Reparto o prioridad"
- **THEN** ve las consultas de voto cuadrático, que funcionan igual que antes

### Requirement: Registros con forma de constancia y sin red
Questions, concerns, versions, stand-asides, blocks and closings SHALL be append-only records with who asserts, about which proposal and version, which record they point to, when, and whether withdrawn (a withdrawal is a new record). In this change they MUST live only in the browser, and no deliberation text MUST be sent to any server, AI provider or blockchain.

#### Scenario: Retirar una preocupación
- **WHEN** una participante retira su preocupación
- **THEN** se agrega un registro de retiro que apunta a la preocupación, y la original sigue en el historial

#### Scenario: Sin red
- **WHEN** una persona participa en una propuesta
- **THEN** no sale ningún pedido de red con el texto de la deliberación

### Requirement: Prototipo
The pages SHALL show the prototype notice, use only theme tokens, keep the single `<main>` from the layout, keep the report button, be keyboard usable and pass the axe audit.

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre el detalle de una propuesta
- **THEN** no hay violaciones serias ni críticas
