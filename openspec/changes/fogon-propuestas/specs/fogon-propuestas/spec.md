# Spec Delta

## Purpose

Mostrar cada propuesta del Fogón como un proceso para decidir juntas, inspirado en Formal Consensus: su ficha, sus fases, una discusión con concerns basados en principios y lo que cada persona puede hacer según cuánto la implica la decisión. La facilitación y el Guardián sugieren y ayudan a escuchar; nunca deciden.

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
Each proposal SHALL follow one of two routes, chosen by whoever facilitates: a simple decision (presentation, a period to object, closing) or an important decision (draft, presentation, clarifying questions, open discussion, concerns: name and group them, resolve concerns, call for consensus, closing). The page MUST show the ordered list of phases of its route, mark done phases and the current one with text (not only color) and `aria-current="step"`. People in the scope or affected MUST be able to ask for the important route while a simple one is open.

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
The discussion SHALL list entries in order, each with its type in text: clarifying question, answer, comment, concern, resolution proposal (counter-proposal), Guardián suggestion or closing, plus its author (example person marked as example, or the simulated AI marked as such) and their relation to the decision. A concern MUST show its author's name, its principle (if any), the group it belongs to (if grouped) and its state.

#### Scenario: Leer la discusión
- **WHEN** la persona abre la propuesta de la bomba solar
- **THEN** ve una pregunta, su respuesta, un comentario, el grupo de concerns "Uso compartido" con los concerns de Ramiro y de Paz y sus principios, una sugerencia del Guardián respaldada como concern y una propuesta de resolución, cada una con su tipo escrito

### Requirement: Concerns con estado
A concern SHALL have a written reason, an optional principle from the Lighthouse principles list and a state: open, grouped (with the group's name), being resolved, resolved, withdrawn, standing aside, or block. People who can raise concerns MUST be able to join someone else's concern instead of repeating it. A person MUST have at most one open concern per proposal version.

#### Scenario: Concern sin razón
- **WHEN** una persona intenta levantar un concern sin escribir la razón
- **THEN** el sistema pide la razón y no registra nada

#### Scenario: Sumarse a un concern
- **WHEN** una persona del ámbito se suma al concern de Paz sobre los días de riego
- **THEN** el concern muestra que se sumó una persona más y no aparece un concern repetido

#### Scenario: Segundo concern abierto
- **WHEN** una persona con un concern abierto en la versión 1 intenta levantar otro
- **THEN** el sistema le propone editar, retirar o sumarse en lugar de abrir otro

### Requirement: Agrupar concerns
In the concerns phase of an important decision (and in the objection period of a simple one) concerns SHALL be named (each one with its author) and MAY be grouped: several concerns from different people that say the same thing can end up grouped in a single concern with a short name. A person with a process role MUST be able to group two or more concerns, name the group, and take a concern out of a group; Hifa (simulated) MAY suggest which concerns to group, which only applies when a person with a process role confirms. A grouped concern MUST list all its authors (those of the grouped concerns and those who joined), and each original concern MUST keep its reason, author and principle, visible inside the group. Grouping MUST NOT be possible outside those phases. Classifying concerns by theme is not part of this change.

#### Scenario: Agrupar en la fase de concerns
- **WHEN** una persona con rol de proceso agrupa dos concerns de distintas personas sobre la cisterna con el nombre "Ubicación" durante "Concerns"
- **THEN** aparece un solo concern "Ubicación" que nombra a las dos autoras, cada razón original se sigue viendo dentro del grupo, y la agrupación queda en el historial con quién la hizo

#### Scenario: Sacar un concern del grupo
- **WHEN** la persona con rol de proceso saca un concern del grupo "Ubicación"
- **THEN** ese concern vuelve a verse solo, con su autora, y el grupo deja de nombrarla

#### Scenario: Fuera de la fase
- **WHEN** una persona con rol de proceso mira la propuesta de la bomba, que está en "Resolver concerns"
- **THEN** ve el grupo "Uso compartido" pero no la acción de agrupar

### Requirement: Concerns con nombre
Concerns SHALL be shown with the author's name by default. Only in proposals marked as a care or conflict topic, and with facilitation, a person MAY raise a concern without a visible name; it MUST be shown as "Sin nombre (con facilitación)".

#### Scenario: Tema común
- **WHEN** una persona levanta un concern en la propuesta de la regalía
- **THEN** no tiene la opción de levantarlo sin nombre y el concern muestra su nombre

#### Scenario: Tema de cuidado
- **WHEN** una persona levanta un concern sin nombre en una propuesta marcada como tema de cuidado o conflicto
- **THEN** el concern se ve como "Sin nombre (con facilitación)"

### Requirement: Principios del Lighthouse
The system SHALL read the Lighthouse principles from a single source behind a seam, so the list can later come from the manifesto of the Lighthouse meta-tribe without touching screens. In this change the source MUST return an initial example list centered on regeneration and life, inspired by the Universal Declaration of the Rights of Mother Earth and by regenerative principles of reference communities (which MUST NOT be named in the interface or the data), marked "borrador, a ratificar por el común", with a ⚖ that explains it in simple words. Concerns, blocks and Guardián suggestions cite principles from this source only. A cited principle that is no longer in the list MUST show "principio fuera de la lista vigente", not disappear.

#### Scenario: Lista visible
- **WHEN** una persona va a citar un principio
- **THEN** elige de la lista de principios del Lighthouse, que dice "borrador, a ratificar por el común"

#### Scenario: Principio que ya no está
- **WHEN** un registro cita un principio que la fuente ya no devuelve
- **THEN** el registro muestra "principio fuera de la lista vigente" y su id, sin errores

### Requirement: Bloqueo con principio
A block SHALL require a written reason and a principle from the Lighthouse list; a block without both MUST NOT be recorded. Whether a block is legitimate MUST be decided by the group of the scope; whoever facilitates, Hifa and the Guardián MUST only ask or suggest. A block the group judges not legitimate MUST stay in the record as a concern and MUST NOT stop the proposal; a legitimate block MUST stop it.

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
Whoever presents SHALL be able to raise concerns, join concerns and block their own proposal, because they can change their mind after listening to others; a block by the presenter follows the same rules (reason, principle, legitimacy decided by the group). They MUST NOT stand aside from their own proposal. They SHALL NOT take part in deciding whether a concern or block about their own proposal is legitimate, even if they also belong to the scope. They MUST be able to edit the proposal; every edit MUST create a new version, and earlier versions with their concerns MUST stay visible in the history.

#### Scenario: Cambia de opinión
- **WHEN** quien presenta la propuesta de la huerta levanta un concern durante el plazo para objetar
- **THEN** el concern queda registrado con su nombre y la marca "quien presenta"

#### Scenario: No se hace a un lado
- **WHEN** quien presenta la propuesta de la huerta, que también es del ámbito, mira sus acciones durante el plazo para objetar
- **THEN** no ve "Hacerse a un lado" y sí ve "Levantar un concern" y "Bloquear citando un principio"

#### Scenario: Conflicto de interés en un pedido de plata
- **WHEN** quien presenta la propuesta de la bomba solar también es del ámbito y hay un bloqueo pendiente
- **THEN** no ve la acción de decidir la legitimidad

#### Scenario: Nueva versión
- **WHEN** quien presenta modifica la propuesta en "Resolver concerns"
- **THEN** aparece la versión 2, la versión 1 queda en el historial y cada concern dice a qué versión se refería

### Requirement: Permisos por nivel de implicación
What a person can do in a proposal SHALL depend on their level of involvement in that decision: visit, network, del común, del ámbito, affected, process role, or presenter. The rules for the 15 actions of the approved sketch, with Gus's changes (no access without an account; the presenter may raise concerns and block), MUST live as typed data in a single place, where each cell is yes, no, or yes with a condition and its explanation, so they can change without touching screens. A person with several levels MUST get the union of their permissions, except for the presenter restriction on legitimacy.

#### Scenario: Persona de la red en una decisión de tribu
- **WHEN** alguien mira la propuesta de la huerta como persona de la red
- **THEN** puede leer la propuesta, pero no la discusión, ni preguntar, ni levantar concerns

#### Scenario: Del común en una decisión del común
- **WHEN** alguien mira la propuesta de la regalía como persona del común
- **THEN** puede leer la discusión y preguntar, y puede comentar y levantar un concern con la condición "solo decisiones del común" escrita en texto

#### Scenario: Tabla de permisos visible
- **WHEN** la persona abre "Quién puede hacer qué" en la página de una propuesta
- **THEN** ve una tabla con las 15 acciones y los 7 niveles, con encabezados de fila y columna, donde cada celda dice sí, no o la condición en texto, no solo con un símbolo o un color

### Requirement: Ver la propuesta como cada nivel
The page SHALL let the person simulate each level with a "Mirá la propuesta como…" control, starting at the level computed from what the browser knows (member of the tribe of the scope → del ámbito; in a council decision, being on the scope list defined for the board of NetXGen → del ámbito; otherwise → de la red), marked as "tu nivel". The available actions MUST update to that level and the current phase. When there is no action, the page MUST say so in text. Without an account nothing of a proposal is visible: the visit level MUST show only an invitation to open an account.

#### Scenario: Cambiar de nivel
- **WHEN** la persona elige "Afectada por la decisión" en "Mirá la propuesta como…"
- **THEN** las acciones disponibles cambian a las de una persona afectada en la fase actual

#### Scenario: Visita en cualquier propuesta
- **WHEN** la persona elige "Visita (sin cuenta)" en la propuesta de la regalía o en la de la huerta
- **THEN** no ve el título, la ficha, la discusión ni el resultado, y lee que para ver las propuestas hay que abrir una cuenta, con un enlace a `/sumarte`

### Requirement: Acciones según la fase
Each action SHALL be available only in the phases where it makes sense (for example, clarifying questions only in "Preguntas para aclarar" and, in a simple decision, during presentation and the objection period; standing aside and blocking only in the call for consensus or the objection period). An action allowed by the level but not by the phase MUST NOT be offered; reading is always available to levels that can read.

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

### Requirement: Quórum de participación
A proposal SHALL NOT close by consensus, and a simple decision SHALL NOT be adopted at its deadline, unless the number of people of the scope or affected who took part reaches the quorum: half of the scope, or 3 people when half is less than 3 (never more than the scope's size). Taking part MUST mean having written something in the discussion (question, answer, comment, concern, joining a concern, resolution proposal, standing aside or block) or having signed the acknowledgment of conformity; opening the proposal without doing anything MUST NOT count, and each person MUST count once. The page MUST show the participation, how many signed the acknowledgment and the quorum; when the scope size is unknown it MUST show "sin dato" and MUST NOT allow closing by consensus nor adopting at the deadline.

#### Scenario: Grupo chico
- **WHEN** el ámbito tiene 4 personas
- **THEN** el quórum para cerrar es 3 personas

#### Scenario: Participación insuficiente
- **WHEN** quien facilita intenta cerrar por consenso con menos participación que el quórum
- **THEN** el sistema no lo permite y dice cuánta participación falta

#### Scenario: Abrir no es participar
- **WHEN** una persona del ámbito abre la propuesta de la huerta y no escribe ni firma nada
- **THEN** la participación no cambia

### Requirement: Acuse de conformidad
Each person of the scope SHALL be able to sign, once per proposal version, "Entiendo la propuesta y no tengo ningún concern" (acknowledgment of conformity), recorded with the shape of an EAS attestation (ADR-012) and marked as simulated. It MUST be available from presentation until the deadline (never in draft or after closing). A person with an open concern in that version MUST NOT sign it; if a person who signed later raises a concern, the acknowledgment MUST show as replaced by that concern, and it keeps counting as participation. After a new version, earlier acknowledgments MUST show which version they referred to. The acknowledgment counts toward the quorum like writing in the discussion, and MUST NOT by itself close or adopt anything.

#### Scenario: Firmar el acuse
- **WHEN** una persona del ámbito firma el acuse en la propuesta de la huerta
- **THEN** aparece "Entiende la propuesta y no tiene ningún concern" con su nombre y la versión, y la participación sube en uno

#### Scenario: Acuse con un concern abierto
- **WHEN** una persona con un concern abierto en la versión actual intenta firmar el acuse
- **THEN** el sistema le explica que primero tiene que retirar o resolver su concern y no registra nada

#### Scenario: Concern después del acuse
- **WHEN** una persona que firmó el acuse levanta después un concern
- **THEN** su acuse se ve como "reemplazado por un concern" y la persona sigue contando una sola vez en la participación

### Requirement: Ámbito del consejo
While the council has no elected representatives, who is "del ámbito" in a council decision SHALL be defined by the board of NetXGen. In the prototype the super admin (platform level `superadmin` of the session) MUST be able to mark it on the board's behalf, adding or removing example people and themself from the scope list of a council proposal; every change MUST be recorded and shown as "Definido por el super admin en nombre del board de NetXGen (simulado)". The scope size of a council proposal MUST be the length of that list. People without the super admin level MUST NOT see the control. Proposals that are not of the council MUST NOT show it.

#### Scenario: El super admin marca el ámbito
- **WHEN** el super admin agrega a "vos" al ámbito de la propuesta de la bomba solar
- **THEN** la página dice que el ámbito lo definió el super admin en nombre del board de NetXGen (simulado), el tamaño del ámbito se actualiza y el nivel inicial de "vos" en esa propuesta pasa a "del ámbito"

#### Scenario: Sin super admin
- **WHEN** una persona con nivel de miembro abre la propuesta de la bomba solar
- **THEN** ve quién es del ámbito y que lo definió el board de NetXGen, pero no el control para cambiarlo

### Requirement: Cierre
Closing SHALL record one of: consensus, consensus with people standing aside (their reasons in the record), blocked (not adopted), or no consensus. Only a person with a process role (who facilitates) MUST be able to close; neither Hifa nor the Guardián ever close. A closed proposal MUST show its outcome and the record ("acta"), written by the Memoria role, and MUST NOT offer any action except reading and the process evaluation.

#### Scenario: Consenso con una persona a un lado
- **WHEN** la persona abre la propuesta "Calendario de siembra de otoño"
- **THEN** ve "Adoptada por consenso", que Paz se hizo a un lado con su razón, y el acta

#### Scenario: Cerrar con un bloqueo legítimo
- **WHEN** quien facilita cierra una propuesta con un bloqueo que el grupo consideró legítimo
- **THEN** el resultado es "Bloqueada: no se adopta" y el bloqueo con su principio queda en el acta

### Requirement: Sin consenso al vencer
When the deadline of a proposal ends without consensus, it SHALL be paused, to come back with changes. If it is marked urgent, it MUST instead go up to the level above (circle → tribe → council); a decision of the común that is urgent MUST be paused, because there is no level above. A simple decision MUST be adopted at its deadline only if nobody objected (no open concern and no block) and the participation quorum was reached; if nobody objected but the quorum was not reached, it MUST be paused saying that the minimum participation was not reached.

#### Scenario: Vence sin consenso
- **WHEN** vence el plazo de una propuesta importante sin cerrar por consenso
- **THEN** la propuesta dice "Pausada: vuelve con cambios"

#### Scenario: Urgente
- **WHEN** vence sin consenso una propuesta urgente de un círculo de Valle Solar
- **THEN** la propuesta dice que sube a Valle Solar

#### Scenario: Simple sin objeciones y con quórum
- **WHEN** vence el plazo para objetar de la propuesta de la huerta sin concerns abiertos y con 3 de 4 personas que participaron (dos acuses de ejemplo y el acuse de "vos")
- **THEN** la propuesta dice "Adoptada: nadie objetó en el plazo y hubo quórum"

#### Scenario: Simple sin quórum
- **WHEN** vence el plazo para objetar de la propuesta de la huerta sin concerns abiertos y solo con los dos acuses de ejemplo
- **THEN** la propuesta dice "Pausada: no se alcanzó la participación mínima" y no se adopta

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

### Requirement: Sugerir un mecanismo para priorizar o repartir
The proposal and each resolution proposal (counter-proposal) SHALL have a place to suggest a mechanism to prioritize or distribute resources, attention or priorities: quadratic voting, dot voting, conviction voting or another one named in text, with a required one-line purpose. The people who can comment MAY suggest one in the phases where commenting is available, with the same permissions as commenting; Hifa (simulated) facilitates the choice: it MUST explain each mechanism in simple words and MAY suggest the one that best fits the decision, saying why. Every suggestion MUST show who suggested it and the fixed note "Sirve para priorizar o repartir; no reemplaza al consenso". A suggestion MUST NOT change the phase, the participation or the outcome. Quadratic voting MUST link to the existing consultations (`/fogon/consultas`); the other mechanisms MUST say they are not in the prototype yet.

#### Scenario: Sugerir en una contrapropuesta
- **WHEN** una persona del ámbito sugiere "Voto cuadrático" en la propuesta de resolución de Gala sobre la bomba, con el fin "Repartir los días de riego entre los círculos"
- **THEN** la sugerencia aparece debajo de esa resolución con su nombre, el fin, la nota "no reemplaza al consenso" y un enlace a las consultas, y la fase no cambia

#### Scenario: Mecanismo que no está
- **WHEN** la persona mira la sugerencia de Hifa de usar puntos para priorizar las ubicaciones de la cisterna
- **THEN** lee que la sugirió Hifa (simulada), por qué cree que se alinea con la decisión, y que ese mecanismo todavía no está en el prototipo

#### Scenario: Hifa explica los mecanismos
- **WHEN** la persona abre "¿Qué mecanismo conviene?" en el panel de facilitación de la propuesta de la cisterna
- **THEN** lee una explicación simple de voto cuadrático, puntos y voto por convicción, cuál sugiere Hifa para esta decisión y por qué, y que elegir o no un mecanismo lo deciden las personas

#### Scenario: Del común sugiere en una decisión del común
- **WHEN** una persona del común mira la propuesta de la regalía en "Discusión abierta"
- **THEN** ve "Sugerir un mecanismo" con la condición "solo decisiones del común", igual que "Comentar"

#### Scenario: Sugerencia sin fin
- **WHEN** una persona intenta sugerir un mecanismo sin escribir para qué
- **THEN** el sistema pide el fin y no registra nada

### Requirement: Facilitación de Hifa simulada
The page SHALL show a "Facilitación (Hifa, simulada)" panel that summarizes the discussion, suggests which concerns to group, reminds the rules, the deadlines and how much participation is missing for the quorum, proposes moving to the next phase, and explains and MAY suggest a mechanism to prioritize or distribute. Its texts MUST be scripted and marked as simulated. Any change it proposes MUST be confirmed by a person with a process role. It MUST NOT decide, close, block, judge a block, or hide anyone's contribution.

#### Scenario: Proponer pasar de fase
- **WHEN** Hifa propone pasar la propuesta de la cisterna a "Discusión abierta"
- **THEN** la fase no cambia hasta que una persona con rol de proceso confirma, y el historial dice quién confirmó

#### Scenario: Honestidad
- **WHEN** una persona lee el panel de facilitación
- **THEN** lee que es una simulación, que los textos no los escribió una IA y que las decisiones las toman las personas

### Requirement: Guardián, arquetipo de IA simulado
The page SHALL show the suggestions of the "Guardián", an AI archetype (not a human role) that speaks from the principles of life and the land. Before a proposal can be approved (at the latest when it enters the call for consensus or the objection period), the Guardián MAY suggest a possible impact or a possible illegitimacy when it perceives a contradiction with a Lighthouse principle or with an earlier decision, citing that principle or decision. Its texts MUST be scripted, marked "Guardián (IA, simulado)", and phrased as a possibility, never as a verdict. A person who can raise a concern in the current phase MAY back a suggestion as a concern, writing their own reason; the concern is theirs and cites the suggestion. A suggestion nobody backs MUST stay visible with "Nadie la respaldó: no frena la propuesta" and MUST NOT stop, pause or block it. The Guardián MUST NOT decide, close, block, judge legitimacy or declare anything illegitimate.

#### Scenario: Sugerencia respaldada
- **WHEN** la persona abre la propuesta de la bomba solar
- **THEN** ve la sugerencia del Guardián sobre el posible impacto en el agua, con el principio que cita, y el concern de Inés que la respalda con su propia razón

#### Scenario: Sugerencia sin respaldo
- **WHEN** la persona abre la propuesta de la cisterna compartida
- **THEN** ve la sugerencia del Guardián sobre una posible contradicción con el "Calendario de siembra de otoño", con "Nadie la respaldó: no frena la propuesta", y la propuesta sigue en su fase

#### Scenario: Respaldar como concern
- **WHEN** una persona del ámbito, en una fase donde puede levantar concerns, respalda una sugerencia del Guardián y escribe su razón
- **THEN** aparece un concern con su nombre que cita la sugerencia y su principio, y la sugerencia dice que fue respaldada

#### Scenario: El Guardián no declara
- **WHEN** se revisan todos los textos guionados del Guardián
- **THEN** ninguno afirma que una propuesta o un bloqueo es ilegítimo; todos hablan de un posible impacto o una posible contradicción

### Requirement: Registros de solo agregar y sin red
Questions, answers, comments, concerns, joins, withdrawals, groupings, acknowledgments of conformity, council scope changes, versions, phase changes, affected declarations and objections, stand-asides, blocks, legitimacy decisions, mechanism suggestions, backings of Guardián suggestions, closings and evaluations SHALL be append-only records with the shape of an EAS attestation (ADR-012). They MUST live only in the browser, be cleared by "Borrar todo", and no deliberation text MUST be sent to any server, AI provider or blockchain.

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
The proposal pages SHALL show the prototype notice and a notice that proposals and people are example data, take their texts from the es/en dictionaries, mark new legal-weight terms (concern, block, standing aside, affected, acknowledgment of conformity, quorum, Lighthouse principles, Guardián) with ⚖ and draft status, use only theme tokens, keep the single `<main>` from the layout and the report button, be fully usable with the keyboard and pass the axe audit.

#### Scenario: En inglés
- **WHEN** una persona abre `/fogon/propuestas/consejo-bomba?lang=en`
- **THEN** las fases, los tipos de la discusión, las acciones, los mecanismos y la tabla de permisos salen en inglés

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre la propuesta de la bomba solar, con la tabla de permisos abierta
- **THEN** no hay violaciones serias ni críticas
