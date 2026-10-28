# Spec Delta

## Purpose

Mostrar cada propuesta del Fogón como un proceso para decidir juntas, inspirado en Formal Consensus: su ficha, sus fases, una discusión con concerns basados en principios y lo que cada persona puede hacer según cuánto la implica la decisión. La facilitación ayuda a escuchar y nunca decide.

## ADDED Requirements

### Requirement: Abrir la propuesta
Every Fogón decision that has an example proposal SHALL show an "Abrir la propuesta" link on its card in `/fogon` and in the panel of the chosen decision in the "Decisiones que suben" lens of `/fogon/gobernanza`. The link MUST lead to `/fogon/propuestas/<id de la decisión>`. Decisions without a proposal (for example those of the fideicomiso or copies taken to the council) MUST NOT show it.

#### Scenario: Desde el Fogón
- **WHEN** una persona toca "Abrir la propuesta" en la tarjeta "Pedido de Valle Solar al Fondo Común para la bomba solar"
- **THEN** llega a la página de esa propuesta con su título como encabezado

#### Scenario: Desde la lente Decisiones
- **WHEN** la persona elige "Cisterna compartida entre Agua Clara y Valle Solar" en la lente "Decisiones que suben" y activa "Abrir la propuesta" con el teclado
- **THEN** llega a la página de esa propuesta

#### Scenario: Decisión sin propuesta
- **WHEN** la persona mira la tarjeta "Presupuesto de obra 2027 del macrolote" (fideicomiso)
- **THEN** no ve "Abrir la propuesta"

#### Scenario: Propuesta que no existe
- **WHEN** alguien abre `/fogon/propuestas/no-existe`
- **THEN** ve la página de "no encontrada" del sitio, sin errores

### Requirement: Ficha de la propuesta
The proposal page SHALL show its scope and a sheet with: who presents, the problem, what is proposed, the time (deadline per phase), the agreement or norm it relies on, the money (amount and source, marked as simulated) and the principles it touches. A requested amount without a figure MUST show "sin dato", never 0; a proposal that asks for no money MUST say so. A missing field MUST show "sin dato".

#### Scenario: Con plata
- **WHEN** la persona abre la propuesta de la bomba solar
- **THEN** la ficha dice quién presenta, el problema, lo que se propone, el monto con "(simulado)", la fuente "Fondo Común" y los principios que toca

#### Scenario: Monto sin cifra
- **WHEN** la persona abre la propuesta de la cisterna compartida
- **THEN** la fila de plata dice "sin dato" y no muestra 0

#### Scenario: No pide plata
- **WHEN** la persona abre la propuesta de la regalía de regeneración
- **THEN** la fila de plata dice que no pide plata

### Requirement: Dos recorridos de fases
Each proposal SHALL follow one of two routes, chosen by whoever facilitates: a simple decision (presentation, a period to object, closing) or an important decision (draft, presentation, clarifying questions, open discussion, concerns: list and group, resolve concerns, call for consensus, closing). The page MUST show the ordered list of phases of its route, mark done phases and the current one with text (not only color) and `aria-current="step"`. People in the scope or affected MUST be able to ask for the important route while a simple one is open.

#### Scenario: Recorrido importante
- **WHEN** la persona abre la propuesta de la bomba solar
- **THEN** ve las ocho fases en orden, con "Resolver concerns" marcada como fase actual y las anteriores como hechas

#### Scenario: Recorrido simple
- **WHEN** la persona abre la propuesta "Plan de huerta comunitaria 2027"
- **THEN** ve tres fases: presentación, plazo para objetar y cierre

#### Scenario: Pedir el recorrido importante
- **WHEN** una persona del ámbito pide el recorrido importante en la propuesta de la huerta
- **THEN** la propuesta pasa al recorrido de ocho fases, en la fase de preguntas para aclarar, y el pedido queda en el historial

### Requirement: Plazos por fase
Each phase SHALL have a deadline. By default an important decision lasts 7 days (2 for clarifying questions, 3 for discussion and concerns, 2 to resolve concerns) and a simple decision gives 3 days to object; a holon MAY have its own durations. Dates MUST be shown in the person's language and never shift by a day because of the time zone.

#### Scenario: Plazo por defecto
- **WHEN** una propuesta importante entra en "Preguntas para aclarar" el 1 de noviembre
- **THEN** la fase vence el 3 de noviembre y la propuesta entera, el 8 de noviembre

#### Scenario: Holón con plazos propios
- **WHEN** un holón de ejemplo define 5 días para la discusión
- **THEN** sus propuestas usan 5 días para esa fase y el resto, los valores por defecto

### Requirement: Discusión con tipos
The discussion SHALL list entries in order, each with its type in text: clarifying question, answer, comment, concern, resolution proposal or closing, plus its author (example person, marked as example) and their relation to the decision. A concern MUST show its principle (if any) and its state.

#### Scenario: Leer la discusión
- **WHEN** la persona abre la propuesta de la bomba solar
- **THEN** ve una pregunta, su respuesta, un comentario, dos concerns agrupados en "Uso compartido" con su principio y una propuesta de resolución, cada una con su tipo escrito

### Requirement: Concerns con estado
A concern SHALL have a written reason, an optional principle from the Lighthouse principles list and a state: open, grouped (with the group name), being resolved, resolved, withdrawn, standing aside, or block. People who can raise concerns MUST be able to join someone else's concern instead of repeating it. A person MUST have at most one open concern per proposal version.

#### Scenario: Concern sin razón
- **WHEN** una persona intenta levantar un concern sin escribir la razón
- **THEN** el sistema pide la razón y no registra nada

#### Scenario: Sumarse a un concern
- **WHEN** una persona del ámbito se suma al concern de Paz sobre los días de riego
- **THEN** el concern muestra que se sumó una persona más y no aparece un concern repetido

#### Scenario: Segundo concern abierto
- **WHEN** una persona con un concern abierto en la versión 1 intenta levantar otro
- **THEN** el sistema le propone editar, retirar o sumarse en lugar de abrir otro

### Requirement: Concerns con nombre
Concerns SHALL be shown with the author's name by default. Only in proposals marked as a care or conflict topic, and with facilitation, a person MAY raise a concern without a visible name; it MUST be shown as "Sin nombre (con facilitación)".

#### Scenario: Tema común
- **WHEN** una persona levanta un concern en la propuesta de la regalía
- **THEN** no tiene la opción de levantarlo sin nombre y el concern muestra su nombre

#### Scenario: Tema de cuidado
- **WHEN** una persona levanta un concern sin nombre en una propuesta marcada como tema de cuidado o conflicto
- **THEN** el concern se ve como "Sin nombre (con facilitación)"

### Requirement: Principios del Lighthouse
The system SHALL keep a single list of Lighthouse principles (a first draft based on the draft Lighthouse constitution, OASA and Juego B), marked as a draft to be ratified by the común, with a ⚖ that explains it in simple words. Concerns and blocks cite principles from this list only.

#### Scenario: Lista visible
- **WHEN** una persona va a citar un principio
- **THEN** elige de la lista de principios del Lighthouse, que dice que es un borrador a ratificar por el común

### Requirement: Bloqueo con principio
A block SHALL require a written reason and a principle from the Lighthouse list; a block without both MUST NOT be recorded. Whether a block is legitimate MUST be decided by the group of the scope; whoever facilitates and the facilitation AI MUST only ask. A block the group judges not legitimate MUST stay in the record as a concern and MUST NOT stop the proposal; a legitimate block MUST stop it.

#### Scenario: Bloqueo sin principio
- **WHEN** una persona del ámbito intenta bloquear sin elegir un principio
- **THEN** el sistema pide el principio y no registra el bloqueo

#### Scenario: El grupo decide la legitimidad
- **WHEN** hay un bloqueo y una persona del ámbito registra "El grupo considera legítimo este bloqueo" (simulado)
- **THEN** la decisión queda registrada como del grupo del ámbito y la propuesta no puede cerrar por consenso

#### Scenario: Quien facilita no decide la legitimidad
- **WHEN** una persona mira la propuesta como rol de proceso con un bloqueo pendiente
- **THEN** ve "Preguntarle al grupo si el bloqueo es legítimo" y no ve un botón para decidirlo

### Requirement: Quien presenta
Whoever presents SHALL NOT raise concerns, join concerns, block, stand aside or take part in deciding whether a concern about their own proposal is legitimate, even if they also belong to the scope. They MUST be able to edit the proposal; every edit MUST create a new version, and earlier versions with their concerns MUST stay visible in the history.

#### Scenario: Conflicto de interés en un pedido de plata
- **WHEN** quien presenta la propuesta de la bomba solar también es del ámbito
- **THEN** no ve las acciones de concern, bloqueo ni legitimidad

#### Scenario: Nueva versión
- **WHEN** quien presenta modifica la propuesta en "Resolver concerns"
- **THEN** aparece la versión 2, la versión 1 queda en el historial y cada concern dice a qué versión se refería

### Requirement: Permisos por nivel de implicación
What a person can do in a proposal SHALL depend on their level of involvement in that decision: visit, network, del común, del ámbito, affected, process role, or presenter. The rules for the 15 actions of the approved sketch MUST live as typed data in a single place, where each cell is yes, no, or yes with a condition and its explanation, so they can change without touching screens. A person with several levels MUST get the union of their permissions, except for the presenter restrictions.

#### Scenario: Persona de la red en una decisión de tribu
- **WHEN** alguien mira la propuesta de la huerta como persona de la red
- **THEN** puede leer la propuesta, pero no la discusión, ni preguntar, ni levantar concerns

#### Scenario: Del común en una decisión del común
- **WHEN** alguien mira la propuesta de la regalía como persona del común
- **THEN** puede leer la discusión, preguntar, comentar y levantar un concern, cada acción condicionada con su explicación

#### Scenario: Tabla de permisos visible
- **WHEN** la persona abre "Quién puede hacer qué" en la página de una propuesta
- **THEN** ve una tabla con las 15 acciones y los 7 niveles, con encabezados de fila y columna, donde cada celda dice sí, no o la condición en texto, no solo con un símbolo o un color

### Requirement: Ver la propuesta como cada nivel
The page SHALL let the person simulate each level with a "Mirá la propuesta como…" control, starting at the level computed from what the browser knows (member of the tribe of the scope → del ámbito; otherwise → de la red), marked as "tu nivel". The available actions MUST update to that level and the current phase. When there is no action, the page MUST say so in text.

#### Scenario: Cambiar de nivel
- **WHEN** la persona elige "Afectada por la decisión" en "Mirá la propuesta como…"
- **THEN** las acciones disponibles cambian a las de una persona afectada en la fase actual

#### Scenario: Visita en una decisión del común
- **WHEN** la persona elige "Visita (sin sesión)" en la propuesta de la regalía
- **THEN** ve solo el título y el resultado, sin la ficha completa ni la discusión

#### Scenario: Visita en una decisión de tribu
- **WHEN** la persona elige "Visita (sin sesión)" en la propuesta de la huerta
- **THEN** ve que esta propuesta solo se ve con sesión, sin su contenido

### Requirement: Acciones según la fase
Each action SHALL be available only in the phases where it makes sense (for example, clarifying questions only in "Preguntas para aclarar" and, in a simple decision, during presentation and the objection period; standing aside and blocking only in the call for consensus or the objection period). An action allowed by the level but not by the phase MUST NOT be offered; reading is always available.

#### Scenario: Concern antes de tiempo
- **WHEN** una persona del ámbito mira la propuesta de la cisterna, que está en "Preguntas para aclarar"
- **THEN** puede hacer una pregunta, pero no ve "Levantar un concern"

#### Scenario: Objetar en una decisión simple
- **WHEN** una persona del ámbito mira la propuesta de la huerta durante el plazo para objetar
- **THEN** puede levantar un concern o bloquear citando un principio

### Requirement: Declararse afectada
A person who is not in the scope SHALL be able to declare themselves affected with a one-line reason; from then on they act with the "afectada" level in that proposal. A person of the scope MUST be able to object to the declaration on behalf of the group (simulated); then the person goes back to their previous level. Both the declaration and the objection MUST stay in the history.

#### Scenario: Declararse afectada
- **WHEN** una persona de la red se declara afectada por la cisterna con el motivo "Vivo al lado de la ubicación"
- **THEN** su nivel en esa propuesta pasa a "Afectada" y la declaración aparece en el historial con su motivo

#### Scenario: Declaración sin motivo
- **WHEN** una persona intenta declararse afectada sin escribir el motivo
- **THEN** el sistema pide el motivo y no cambia su nivel

#### Scenario: El grupo objeta
- **WHEN** una persona del ámbito objeta esa declaración
- **THEN** la persona vuelve a su nivel anterior y la declaración y la objeción quedan en el historial

### Requirement: Participación mínima
An important decision SHALL NOT close by consensus unless the number of people of the scope or affected who took part reaches the minimum: half of the scope, or 3 people when half is less than 3 (never more than the scope's size). The page MUST show the participation and the minimum; when the scope size is unknown it MUST show "sin dato" and MUST NOT allow closing by consensus.

#### Scenario: Grupo chico
- **WHEN** el ámbito tiene 4 personas
- **THEN** el mínimo para cerrar es 3 personas

#### Scenario: Participación insuficiente
- **WHEN** quien facilita intenta cerrar por consenso con menos participación que el mínimo
- **THEN** el sistema no lo permite y dice cuánta participación falta

### Requirement: Cierre
Closing SHALL record one of: consensus, consensus with people standing aside (their reasons in the record), blocked (not adopted), or no consensus. Only a person with a process role (who facilitates) MUST be able to close; the facilitation AI never closes. A closed proposal MUST show its outcome and the record ("acta"), written by the Memoria role, and MUST NOT offer any action except reading and the process evaluation.

#### Scenario: Consenso con una persona a un lado
- **WHEN** la persona abre la propuesta "Calendario de siembra de otoño"
- **THEN** ve "Adoptada por consenso", que Paz se hizo a un lado con su razón, y el acta

#### Scenario: Cerrar con un bloqueo legítimo
- **WHEN** quien facilita cierra una propuesta con un bloqueo que el grupo consideró legítimo
- **THEN** el resultado es "Bloqueada: no se adopta" y el bloqueo con su principio queda en el acta

### Requirement: Sin consenso al vencer
When the deadline of a proposal ends without consensus, it SHALL be paused, to come back with changes. If it is marked urgent, it MUST instead go up to the level above (circle → tribe → council); a decision of the común that is urgent MUST be paused, because there is no level above. A simple decision with no open concern at its deadline MUST be adopted.

#### Scenario: Vence sin consenso
- **WHEN** vence el plazo de una propuesta importante sin cerrar por consenso
- **THEN** la propuesta dice "Pausada: vuelve con cambios"

#### Scenario: Urgente
- **WHEN** vence sin consenso una propuesta urgente de un círculo de Valle Solar
- **THEN** la propuesta dice que sube a Valle Solar

#### Scenario: Simple sin objeciones
- **WHEN** vence el plazo para objetar de la propuesta de la huerta sin concerns abiertos
- **THEN** la propuesta dice "Adoptada: nadie objetó en el plazo"

### Requirement: Reabrir solo con nuevo consenso
A closed proposal SHALL NOT be edited or reopened from its page; the page MUST explain that reopening needs a new consensus through a new proposal.

#### Scenario: Propuesta cerrada
- **WHEN** la persona mira la propuesta de la siembra como quien presenta
- **THEN** no ve "Editar la propuesta" y lee que reabrirla pide un nuevo consenso

### Requirement: Evaluación del proceso
After closing, people who took part SHALL be able to answer an optional, two-question evaluation of the process. Skipping it MUST be possible without any warning or penalty, and the answers MUST stay in the browser.

#### Scenario: Responder la evaluación
- **WHEN** una persona que participó responde las dos preguntas
- **THEN** ve un agradecimiento y sus respuestas quedan guardadas en su navegador

#### Scenario: Saltear la evaluación
- **WHEN** la persona no la responde
- **THEN** la propuesta se ve igual, sin avisos pendientes

### Requirement: Facilitación de Hifa simulada
The page SHALL show a "Facilitación (Hifa, simulada)" panel that summarizes the discussion, suggests groups of concerns, reminds the rules and deadlines and proposes moving to the next phase. Its texts MUST be scripted and marked as simulated. Any change it proposes MUST be confirmed by a person with a process role. It MUST NOT decide, close, block, judge a block, or hide anyone's contribution.

#### Scenario: Proponer pasar de fase
- **WHEN** Hifa propone pasar la propuesta de la cisterna a "Discusión abierta"
- **THEN** la fase no cambia hasta que una persona con rol de proceso confirma, y el historial dice quién confirmó

#### Scenario: Honestidad
- **WHEN** una persona lee el panel de facilitación
- **THEN** lee que es una simulación, que los textos no los escribió una IA y que las decisiones las toman las personas

### Requirement: Guardián de la tierra
In proposals that come from circles whose purpose is land or water, the example data SHALL include a "Guardián de la tierra" role. A concern raised by a guardian MUST be recorded as a principled concern (citing the rights of the land unless they choose another principle) and shown with the guardian mark; its legitimacy as a block is still decided by the group.

#### Scenario: Concern de la guardiana
- **WHEN** la persona abre la propuesta de la bomba solar
- **THEN** ve el concern de la guardiana de la tierra marcado "Guardián de la tierra · concern de principio", con el principio "Derechos de la tierra"

### Requirement: Registros de solo agregar y sin red
Questions, answers, comments, concerns, joins, withdrawals, versions, phase changes, affected declarations and objections, stand-asides, blocks, legitimacy decisions, closings and evaluations SHALL be append-only records with the shape of an EAS attestation (ADR-012). They MUST live only in the browser, be cleared by "Borrar todo", and no deliberation text MUST be sent to any server, AI provider or blockchain.

#### Scenario: Retirar un concern
- **WHEN** una persona retira su concern
- **THEN** se agrega un registro de retiro y el concern original sigue en el historial como "Retirado"

#### Scenario: Sin red
- **WHEN** una persona participa en una propuesta
- **THEN** no sale ningún pedido de red con el texto de la discusión

#### Scenario: Borrar todo
- **WHEN** la persona usa "Borrar todo" y vuelve a la propuesta
- **THEN** ve solo la discusión de ejemplo

### Requirement: Prototipo
The proposal pages SHALL show the prototype notice and a notice that proposals and people are example data, take their texts from the es/en dictionaries, mark new legal-weight terms (concern, block, standing aside, affected, Lighthouse principles, guardian of the land) with ⚖ and draft status, use only theme tokens, keep the single `<main>` from the layout and the report button, be fully usable with the keyboard and pass the axe audit.

#### Scenario: En inglés
- **WHEN** una persona abre `/fogon/propuestas/consejo-bomba?lang=en`
- **THEN** las fases, los tipos de la discusión, las acciones y la tabla de permisos salen en inglés

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre la propuesta de la bomba solar, con la tabla de permisos abierta
- **THEN** no hay violaciones serias ni críticas
