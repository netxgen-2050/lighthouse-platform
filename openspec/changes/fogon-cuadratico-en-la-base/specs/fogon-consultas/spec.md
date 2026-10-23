## MODIFIED Requirements

### Requirement: Lista de consultas
`/fogon/consultas` SHALL list the consultations where the person in session is on the roll (all of them for the super admin), each with its title, a "Prioridades" or "Presupuesto" label, its scope (Equipo, Tribu, Asamblea), its closing date, its state (Abierta, Cerrada) and whether the person already saved a reparto. Without a session with current consent it SHALL invite the person to sign in. `/fogon` SHALL link to this list.

#### Scenario: Ver la lista
- **WHEN** una persona del padrón de "¿Para qué optimiza el Lighthouse?" abre `/fogon/consultas`
- **THEN** ve esa consulta con "Prioridades", "Equipo", su fecha de cierre y "Abierta"

#### Scenario: Fuera del padrón
- **WHEN** una persona que no está en el padrón de una consulta abre la lista o la dirección de esa consulta
- **THEN** no la ve en la lista y la dirección responde "No encontramos esta consulta"

#### Scenario: Sin sesión
- **WHEN** alguien sin sesión abre `/fogon/consultas`
- **THEN** ve "Las consultas del equipo se ven al entrar" con el botón "Entrar"

#### Scenario: Desde el Fogón
- **WHEN** una persona abre `/fogon`
- **THEN** ve un enlace a las consultas de prioridades y presupuesto

### Requirement: Cierre de la consulta
A consultation SHALL be closed when its closing date has passed or when the super admin closes it by hand; a closed consultation MUST NOT accept repartos, enforced by the database, and MUST NOT be reopened.

#### Scenario: Consulta cerrada
- **WHEN** una consulta está cerrada
- **THEN** "Mi reparto" se ve solo para leer, sin botones "+" ni "−" ni "Guardar mi reparto"

#### Scenario: Cierre por fecha
- **WHEN** pasa la fecha de cierre y alguien intenta guardar un reparto (por la pantalla o llamando a la API)
- **THEN** la API responde 409 "La consulta ya cerró" y la base no agrega ningún envío

#### Scenario: Cierre a mano
- **WHEN** el super admin cierra una consulta antes de su fecha
- **THEN** la consulta queda cerrada con la hora y quién la cerró, y nadie puede volver a abrirla

### Requirement: Prototipo y accesibilidad
The consultation pages SHALL show the prototype notice, have a single h1 and a single `<main>` (from the layout), be fully usable with the keyboard, pass the axe audit and have no horizontal scroll at 390 px. Repartos SHALL be sent only to the platform's own API, with the session verified on the server.

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre la lista y el detalle de una consulta (abierta y cerrada)
- **THEN** no hay violaciones serias ni críticas

#### Scenario: Celular
- **WHEN** la persona abre el detalle de una consulta de seis opciones en una pantalla de 390 px
- **THEN** no hay scroll horizontal y los botones "−" y "+" se pueden tocar

## REMOVED Requirements

### Requirement: Consultas de ejemplo
**Reason**: Las consultas pasan a ser reales: las crea el super admin en la base y votan personas reales; los votos de personas ficticias confundirían el resultado del equipo.
**Migration**: Las consultas U1–U4 se cargan en la base desde el panel de `fogon-consultas-panel` (o con la API de creación); los textos de U1–U4 siguen en el código como plantilla.

## ADDED Requirements

### Requirement: Padrón de cada consulta
Each consultation SHALL have an explicit roll of people who can vote, set by the super admin when creating it; only people on the roll MAY see and vote in it, and the database MUST reject a vote from someone who is not on the roll.

#### Scenario: Fuera del padrón llama a la API
- **WHEN** una persona que no está en el padrón manda un reparto a la API
- **THEN** recibe 404 y no se escribe nada

### Requirement: Sesión y consentimiento para votar
Every consultation route SHALL verify on the server the person in session (resolved through `cuentas`, with any login provider) and require a current consent (policy and terms); without a session it MUST respond 401, and without consent 403 with `{ consentimiento: false }`, writing nothing.

#### Scenario: Sin consentimiento
- **WHEN** una persona del padrón con sesión pero sin consentimiento vigente intenta guardar su reparto
- **THEN** recibe 403 con `{ consentimiento: false }` y la base no tiene ningún envío suyo

### Requirement: Votos en un libro de solo agregar
Each saved reparto SHALL be a new entry; entries MUST NOT be updated or deleted (the database rejects it). The person's last entry before the close SHALL be the one that counts; an entry with all options at 0 means the person withdrew their reparto.

#### Scenario: Cambiar el reparto
- **WHEN** una persona guarda un reparto y después otro distinto
- **THEN** la base tiene los dos envíos y el resultado cuenta solo el segundo

#### Scenario: Intento de borrar
- **WHEN** alguien intenta modificar o borrar un envío directamente en la base
- **THEN** la base lo rechaza y el envío queda igual

### Requirement: Validación también en el servidor y en la base
The server SHALL validate every reparto with the same rules as the screen (100 credits, whole votes, own options, votes against only if allowed) and respond 422 with the reasons if invalid; the database MUST also reject a stored reparto that exceeds the credits or has votes against when not allowed.

#### Scenario: Pedido armado a mano
- **WHEN** alguien llama a la API con 7, 7 y 2 votos
- **THEN** recibe 422 con "te pasás de los créditos" y no se escribe nada

### Requirement: Reglas fijas una vez que hay votos
Once a consultation has at least one entry, its options, mode, credits, votes-against setting, result-visibility rule, open or secret vote, amount, currency and amount note MUST NOT change; the database SHALL reject it.

#### Scenario: Cambiar opciones con votos
- **WHEN** alguien intenta agregar o cambiar una opción de una consulta que ya tiene envíos
- **THEN** la base lo rechaza

#### Scenario: Cambiar de abierto a secreto con votos
- **WHEN** alguien intenta pasar a voto secreto una consulta con voto abierto que ya tiene envíos
- **THEN** la base lo rechaza

### Requirement: Voto secreto ante la plataforma
On a consultation with secret vote, no API response SHALL include another person's reparto or say who voted what or who is missing; each person SHALL see only their own reparto and, when visible, the aggregated result and the number of participants. This applies to the super admin too.

#### Scenario: Otra persona
- **WHEN** la persona B abre una consulta con voto secreto donde la persona A ya repartió
- **THEN** la respuesta de la API trae el reparto de B (o ninguno) y, si corresponde, el agregado, pero nunca el reparto de A ni su identidad

#### Scenario: Super admin
- **WHEN** el super admin abre una consulta con voto secreto, abierta y con resultado al cierre
- **THEN** ve cuántas personas repartieron de cuántas del padrón, sin votos ni nombres

### Requirement: Voto abierto ante el padrón
On a consultation with open vote (the default for scope Equipo), the API SHALL give every person on the roll, and the super admin, the same view: at any time the names of the people on the roll who have not voted yet, and, once the result is visible, the last reparto of each person with their visible name. It MUST NOT include anyone's email, internal id or the time of each entry, and MUST NOT include other people's repartos before the result is visible.

#### Scenario: Quién falta
- **WHEN** A y B votaron en una consulta abierta con voto abierto y C, del padrón, no
- **THEN** la respuesta de la API para B incluye a C en "Faltan votar" y no incluye el reparto de A (el resultado se ve al cierre)

#### Scenario: Tabla al cierre
- **WHEN** esa consulta cierra
- **THEN** la respuesta de la API para B trae el último reparto de A y el de B con sus nombres, y en ningún lugar el email de A

#### Scenario: Consentimiento retirado
- **WHEN** A retira su consentimiento con la consulta abierta, después de haber repartido
- **THEN** el último reparto de A sigue contando en el resultado y, con voto abierto, sigue en la tabla al cierre

### Requirement: Crear consultas
Only the super admin SHALL create consultations (title, mode, scope "Equipo", closing date, options with optional cap and floor, amount, currency and amount note in budget mode, votes-against and result-visibility rules, open or secret vote with open as the default, and the roll by email of existing people); the API MUST verify the role on the server.

#### Scenario: Sin elegir el tipo de voto
- **WHEN** el super admin crea una consulta de Equipo sin decir si el voto es abierto o secreto
- **THEN** la consulta queda con voto abierto

#### Scenario: No es super admin
- **WHEN** una persona con rol `persona` llama a la API de creación
- **THEN** recibe 403 y no se crea nada

#### Scenario: Email desconocido en el padrón
- **WHEN** el super admin crea una consulta con un email que no está en `personas`
- **THEN** la API responde 422 con ese email y no crea la consulta

### Requirement: Ámbito de la consulta
<!-- Enmienda 2026-10-23: gobernanza fractal (fogon-limpieza, fogon-gobernanza-fractal). -->
Each consultation SHALL have a scope among Equipo, Círculo, Tribu, Lighthouse (el común) and Consejo; Círculo and Tribu MUST also name which circle or tribe. The scope "Asamblea" MUST NOT exist. In this change only the super admin creates consultations and only with scope Equipo; the scope MUST NOT change once the consultation has votes.

#### Scenario: Ámbito de círculo sin decir cuál
- **WHEN** se intenta guardar en la base una consulta de ámbito Círculo sin indicar el círculo
- **THEN** la base la rechaza

#### Scenario: Crear con otro ámbito
- **WHEN** el super admin pide crear una consulta de ámbito Tribu
- **THEN** la API responde 422 y no crea nada

### Requirement: Falla al guardar
If saving the reparto fails or the server does not answer, the screen SHALL keep the person's unsaved reparto, mark it "Sin guardar" and show "No pudimos guardar tu reparto. Probá de nuevo." with `role="alert"`; it MUST NOT show it as saved.

#### Scenario: Sin respuesta
- **WHEN** la API no responde al guardar
- **THEN** el reparto sigue en pantalla marcado "Sin guardar" con el mensaje de error, y la lista no dice "Ya repartiste"
