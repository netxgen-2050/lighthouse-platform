## MODIFIED Requirements

### Requirement: Guardián, arquetipo de IA simulado
The page SHALL show the suggestions of the "Guardián", an AI archetype (not a human role) that defends the Voice of the Earth: it speaks for water, soil and native life from the principles of life and the land. Before a proposal can be approved (at the latest when it enters the call for consensus or the objection period), the Guardián MAY suggest a possible impact or a possible illegitimacy when it perceives a contradiction with a Lighthouse principle or with an earlier decision, citing that principle or decision. Its texts MUST be scripted, marked as coming from the Guardián that defends the Voice of the Earth (IA, simulado), and phrased as a possibility, never as a verdict. A person who can raise a concern in the current phase MAY back a suggestion as a concern, writing their own reason; the concern is theirs and cites the suggestion. A suggestion nobody backs MUST stay visible with "Nadie la respaldó como concern". The Guardián itself MUST NOT stop, pause, block, decide, close, judge legitimacy or declare anything illegitimate; the only thing its suggestion asks for is a written answer from a person, as the requirement "Desafío del Guardián con respuesta por escrito" says.

#### Scenario: Sugerencia respaldada
- **WHEN** la persona abre la propuesta de la bomba solar
- **THEN** ve la sugerencia del Guardián sobre el posible impacto en el agua, con el principio que cita, y el concern de Inés que la respalda con su propia razón

#### Scenario: Sugerencia sin respaldo
- **WHEN** la persona abre la propuesta de la cisterna compartida
- **THEN** ve la sugerencia del Guardián sobre una posible contradicción con el "Calendario de siembra de otoño", con "Nadie la respaldó como concern", y la propuesta sigue en su fase

#### Scenario: Respaldar como concern
- **WHEN** una persona del ámbito, en una fase donde puede levantar concerns, respalda una sugerencia del Guardián y escribe su razón
- **THEN** aparece un concern con su nombre que cita la sugerencia y su principio, y la sugerencia dice que fue respaldada

#### Scenario: El Guardián no declara
- **WHEN** se revisan todos los textos guionados del Guardián
- **THEN** ninguno afirma que una propuesta o un bloqueo es ilegítimo; todos hablan de un posible impacto o una posible contradicción

## ADDED Requirements

### Requirement: El Guardián defiende la Voz de la Tierra y ningún agente decide
La página de una propuesta SHALL presentar al Guardián como el agente (IA, simulado) que defiende la Voz de la Tierra: habla por el agua, el suelo y la vida nativa y desafía lo que pueda dañarlos. Su etiqueta y su ⚖ `guardianIA` (borrador) MUST decirlo en palabras simples y MUST decir que nunca pausa ni decide. Ningún texto del Guardián, de Hifa ni de su ⚖ MUST decir que un agente pausa, frena, bloquea o decide una propuesta; la decisión es siempre de personas.

#### Scenario: Etiqueta del Guardián
- **WHEN** la persona abre la propuesta del pedido de la bomba solar
- **THEN** la sugerencia del Guardián dice que viene del Guardián que defiende la Voz de la Tierra (IA, simulado), con su ⚖ marcado como borrador

#### Scenario: Ningún agente pausa
- **WHEN** se revisan en es y en todos los textos guionados del Guardián y de Hifa y el ⚖ del Guardián
- **THEN** ninguno dice que el agente pausa, frena, bloquea o decide

### Requirement: Desafío del Guardián con respuesta por escrito
Cada sugerencia del Guardián cuya fase ya llegó SHALL verse como un desafío destacado arriba de la ficha de la propuesta, bajo "El Guardián desafía esta propuesta", con su texto, el principio o la decisión que cita, quiénes lo respaldaron como concern y sus respuestas (cada una con el nombre de quien responde y su texto), o "Sin respuesta todavía". Cualquier persona del ámbito de la decisión, quien facilita, quien presenta y las personas que se declararon afectadas MUST poder responderlo por escrito en cualquier fase antes del cierre, además de respaldarlo como concern (Gus, 1-nov: las personas afectadas respaldan y también responden, como en el resto del Fogón); una respuesta vacía MUST NOT registrarse. Antes de pasar al llamado al consenso (recorrido importante) o al período de objeción (recorrido simple), cada desafío cuya fase ya llegó MUST tener al menos una respuesta; si falta, "Pasar de fase" MUST NOT estar disponible y MUST decir en texto "Falta responder el desafío del Guardián". La regla MUST valer también en el estado calculado de la propuesta: un cambio de fase registrado hacia el llamado o la objeción con desafíos sin respuesta MUST ignorarse y quedar en el historial como ignorado. El desafío MUST NOT pausar la propuesta: los plazos siguen corriendo, las demás acciones siguen abiertas y, si nadie responde el desafío y la fase vence, la propuesta se cierra sin llegar al llamado al consenso (ni al período de objeción), como cualquier propuesta que nadie hace avanzar (Gus, 1-nov); el cierre no figura como obra del Guardián. Las respuestas MUST ser registros de solo agregar con forma de constancia (ADR-012), solo en el navegador, que "Borrar todo" limpia y que no se envían a ningún servidor.

#### Scenario: Desafío destacado
- **WHEN** la persona abre la propuesta del pedido de la bomba solar
- **THEN** antes de la ficha ve "El Guardián desafía esta propuesta" con el desafío sobre la napa, su principio, el respaldo de Inés y la respuesta de Gala, y el desafío sobre si la medida es reversible con "Sin respuesta todavía"

#### Scenario: Falta la respuesta
- **WHEN** quien facilita (simulado) mira la propuesta de la bomba solar, en "Resolver", con un desafío sin respuesta
- **THEN** "Pasar de fase" no está disponible y dice "Falta responder el desafío del Guardián", y "Proponer una resolución" sigue disponible para el ámbito

#### Scenario: Responde alguien del ámbito
- **WHEN** una persona del ámbito del consejo (simulado), que no presenta, escribe una respuesta al desafío sobre si la medida es reversible y la envía con el teclado
- **THEN** la respuesta aparece debajo del desafío con su nombre, se anuncia, el foco va a la respuesta, y quien facilita ya puede pasar al llamado al consenso

#### Scenario: Quien no es del ámbito no responde
- **WHEN** una persona de la red o del común (simulado) mira la propuesta de la bomba solar
- **THEN** ve los desafíos y sus respuestas pero no el formulario para responder, y puede respaldar el desafío como concern si su nivel lo permite

#### Scenario: La persona afectada respalda y responde
- **WHEN** una persona que se declaró afectada en la propuesta de la bomba solar respalda el desafío sobre la napa como concern y escribe una respuesta al desafío sobre si la medida es reversible
- **THEN** ambas cosas quedan registradas con su nombre: el concern cuenta como respaldo y la respuesta aparece debajo del desafío

#### Scenario: Respuesta vacía
- **WHEN** una persona del ámbito envía la respuesta sin texto
- **THEN** no se registra nada y el campo dice que falta la respuesta

#### Scenario: Un cambio de fase guardado sin respuesta no vale
- **WHEN** el navegador tiene guardado un cambio de fase de la bomba solar hacia el llamado al consenso mientras el desafío sobre si la medida es reversible no tiene respuesta
- **THEN** la propuesta sigue en "Resolver" y el historial muestra ese cambio como ignorado porque faltaba responder el desafío

#### Scenario: Vence sin respuesta
- **WHEN** la fase "Resolver" de una propuesta vence con un desafío del Guardián sin respuesta
- **THEN** la propuesta se cierra sin llegar al llamado al consenso, por vencer sin que nadie la hiciera avanzar, y ni el desafío ni el Guardián figuran como quien la cerró o la pausó

#### Scenario: Recorrido simple
- **WHEN** una propuesta simple tiene un desafío del Guardián de la fase "Presentación" sin respuesta
- **THEN** quien facilita no puede pasar al período de objeción hasta que alguien del ámbito lo responda

#### Scenario: Accesible y en inglés
- **WHEN** corre la auditoría de axe sobre la propuesta de la bomba solar y la persona la abre con `?lang=en`
- **THEN** no hay violaciones serias ni críticas, y "The Guardián challenges this proposal", "No answer yet" y "The Guardián's challenge still needs an answer" salen en inglés
