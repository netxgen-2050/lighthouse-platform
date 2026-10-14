# Spec Delta

## Purpose

Muestra en `/congreso` la vitrina del evento del Congreso, con identidad propia y dentro del marco de NetX, separando lo que es del evento (portable) de lo que aporta NetX (territorio, tribus, ticket vinculado y Genesis), con compra solo de demostración.

## ADDED Requirements

### Requirement: Secciones de la vitrina en orden
The system SHALL show at `/congreso`, inside the NetX frame (rail and top bar unchanged), in this order: prototype strip, event bar, hero, figures, "El encuentro", "Recorrido", "Voces", "Ejes", "El territorio", "Tribus", "Entradas", "Tu ticket también abre la puerta a NetX", "Preguntas" and closing. All event content MUST come from the event access function.

#### Scenario: Orden de las secciones
- **WHEN** una persona abre `/congreso`
- **THEN** los títulos de sección aparecen en el orden indicado
- **AND** el rail sigue mostrando "Congreso" como página actual

### Requirement: Vitrina abierta sin cuenta
The system SHALL list `/congreso` as a public route, so visitors without an account see the whole showcase (every section, the origin mode and the demo dialog) without being sent to Sumarte. The NetX rail MUST show "Congreso" enabled for visitors without an account.

#### Scenario: Visitante sin cuenta
- **WHEN** una persona sin sesión abre `/congreso`
- **THEN** la dirección sigue siendo `/congreso`
- **AND** ve el héroe, las entradas, las tribus, la sección del ticket y las preguntas

#### Scenario: Rail sin sesión
- **WHEN** una persona sin sesión mira el rail
- **THEN** "Congreso" es un enlace habilitado a `/congreso`

### Requirement: Vincular el ticket pide cuenta
The ticket registration form SHALL be shown only to a person with a session, at least the Explorador level and the current privacy policy accepted. Otherwise, the ticket block MUST show, instead of the form, a link "Sumate gratis para vincular tu ticket" (or "Aceptá la política de privacidad para vincular tu ticket" when only the policy is missing) to Sumarte that returns to `/congreso#ticket` afterwards. While the session is being checked, neither the form nor the link is shown. Without a session the system MUST NOT read or write the ticket in the browser.

#### Scenario: Sin sesión ve el llamado
- **WHEN** una persona sin sesión llega a `/congreso#ticket`
- **THEN** ve los cinco pasos y el sello Genesis
- **AND** no ve el campo "Código de tu ticket"
- **AND** ve el enlace "Sumate gratis para vincular tu ticket" a `/sumarte?volver=%2Fcongreso%23ticket&para=explorador`

#### Scenario: Vuelve al ticket después de sumarse
- **WHEN** esa persona se suma como Explorador desde ese enlace
- **THEN** vuelve a `/congreso#ticket` y ve el formulario del ticket

#### Scenario: Sin sesión no se guarda nada
- **WHEN** una persona sin sesión abre `/congreso`
- **THEN** el navegador no tiene la clave del ticket del Congreso guardada por esta página

### Requirement: Origen de la visita al entrar directo
The `/congreso` page SHALL store the visit origin (`utm_source`, `utm_medium`, `utm_campaign`) with the same logic as the home page: raw values trimmed and cut to 200 characters, saved only when at least one is present, and keeping the first origin already stored. It MUST work with and without a session.

#### Scenario: Entrar con UTM
- **WHEN** una persona sin origen guardado abre `/congreso?utm_source=pagina-oficial&utm_campaign=congreso-2027`
- **THEN** el origen guardado tiene fuente "pagina-oficial" y campaña "congreso-2027"

#### Scenario: Se conserva el primero
- **WHEN** ya hay un origen guardado y la persona abre `/congreso?utm_source=otra`
- **THEN** el origen guardado no cambia

### Requirement: Héroe con un solo h1
The hero SHALL show the decorative eclipse, the date chip, the countdown to the key moment, the event name as the page's only `h1` (with the tagline), the intro text and a place card with "Quiero ir" (to `#entradas`) and "Ver el recorrido" (to `#recorrido`).

#### Scenario: Ver el héroe
- **WHEN** una persona abre `/congreso` con el contenido de ejemplo
- **THEN** ve un único `h1` con "Solarpunk Patagonia", el chip "5–9" "febrero 2027" y la cuenta regresiva

#### Scenario: Eclipse con reducir animaciones
- **WHEN** la persona tiene "reducir animaciones" activado y abre `/congreso`
- **THEN** el eclipse aparece ya formado, sin movimiento

### Requirement: Aviso de prototipo y modo "de dónde viene"
The page SHALL show a strip with "Prototipo interno · datos de ejemplo" and a toggle button "¿Qué viene de UnityHub?" (`aria-pressed`), available to every visitor, with or without an account. When on, every marked block MUST show a visible origin text (for example "Viene de UnityHub · agenda" or "Viene de NetX · tribus") besides its outline color. When off, the origin texts are hidden. The state lives only in memory.

#### Scenario: Activar el modo
- **WHEN** una persona aprieta "¿Qué viene de UnityHub?"
- **THEN** el botón queda con `aria-pressed="true"`
- **AND** cada bloque marcado muestra su texto de origen

#### Scenario: Sin cuenta también
- **WHEN** una persona sin sesión aprieta "¿Qué viene de UnityHub?"
- **THEN** cada bloque marcado muestra su texto de origen

#### Scenario: Al recargar
- **WHEN** la persona recarga la página
- **THEN** el modo vuelve a estar apagado

### Requirement: Recorrido como secuencia
The "Recorrido" section SHALL show the four stops as an ordered list in chronological order, with day, title, text and place. The eclipse day MUST be distinguished by more than color (a visible label). The hands-on stop MUST carry the ⚖ `obra`.

#### Scenario: Paradas en orden
- **WHEN** una persona ve el recorrido
- **THEN** hay una lista ordenada de 4 paradas, de viernes a lunes-martes
- **AND** la parada del sábado tiene una etiqueta visible que la destaca
- **AND** "Manos en la tierra" tiene el ⚖ "Horas de obra"

### Requirement: El encuentro con aviso educativo
The "El encuentro" section SHALL show the manifesto and two text columns. The sentence that the gathering is educational and that projects are presented separately and are optional MUST carry the ⚖ `encuentroeducativo`, a new draft legal term (`borrador: true`).

#### Scenario: ⚖ del encuentro
- **WHEN** una persona ve "El encuentro"
- **THEN** la frase sobre el carácter educativo tiene el ⚖ "Encuentro educativo"
- **AND** el catálogo legal marca esa clave como borrador

### Requirement: Voces sin fotos y por confirmar
The "Voces" section SHALL show each main voice as a portrait with gradient and initials (no photos), name, affiliation and a visible state text ("Por confirmar" or "Confirmada"), plus the regional voices and the hybrid stage note. Initials MUST be hidden from assistive technology.

#### Scenario: Estado visible
- **WHEN** una persona ve las voces con el contenido de ejemplo
- **THEN** ve a Roxanne Meadows, Michel Bauwens, Michael Reynolds y Bill Reed como voces principales
- **AND** cada voz principal muestra "Por confirmar"

### Requirement: Textos en voseo
Every Spanish text of the page, including NetX pieces and the demo dialog, SHALL be written in Argentine voseo.

#### Scenario: Título de tribus en voseo
- **WHEN** una persona ve "Tribus"
- **THEN** el título dice "No vengas solo. Llegá con tu tribu."

### Requirement: Ejes del encuentro
The "Ejes" section SHALL show the eight themes from the content, each with a decorative line icon, title and text.

#### Scenario: Ocho ejes
- **WHEN** una persona ve "Ejes"
- **THEN** hay 8 ejes con título y texto

### Requirement: El territorio desde NetX
The "El territorio" section SHALL show the valley illustration (with a text alternative), the territory's figures taken from the NetX territory catalog ("sin dato" when missing, never 0) and a button "Explorar el mapa en NetX" to `/territorios/lighthouse`.

#### Scenario: Ir al mapa
- **WHEN** una persona aprieta "Explorar el mapa en NetX"
- **THEN** llega a `/territorios/lighthouse`

### Requirement: Tribus con ticket, de ejemplo
The "Tribus" section SHALL show "No vengas solo. Llegá con tu tribu.", a link to `/tribus` and, for up to three tribes from the NetX catalog, how many members already have a ticket as visible text ("N de M van") with a decorative bar, each marked as example.

#### Scenario: Cifras en texto
- **WHEN** una persona ve "Tribus"
- **THEN** cada tribu muestra "N de M van" en texto y la marca de ejemplo
- **AND** hay un enlace a `/tribus`

### Requirement: Entradas con compra de demostración
The "Entradas" section SHALL show the six ticket types with tag, name, description, price with the mark "ejemplo" and a button "Comprar …", plus the ⚖ `ticket`. The featured type MUST be distinguished by its tag text and a thicker border. Every "Comprar …" button MUST open a demo dialog and MUST NOT navigate, charge or open an external link. The demo dialog MUST NOT state who charges for the ticket (organizer, UnityHub, Stripe or NetX).

#### Scenario: Cada precio dice "ejemplo"
- **WHEN** una persona ve "Entradas" con el contenido de ejemplo
- **THEN** cada uno de los 6 precios tiene al lado la marca "ejemplo"

#### Scenario: Comprar abre el diálogo
- **WHEN** una persona aprieta "Comprar pase completo"
- **THEN** se abre un diálogo con el título "Acá se abriría la compra del ticket" y el texto de que es un prototipo y no se cobra nada
- **AND** el diálogo no nombra a UnityHub, Stripe ni NetX
- **AND** la dirección de la página no cambia y no hay pedidos de red a otros dominios
- **AND** no se envía ningún pedido que escriba datos (POST) desde el clic hasta que se cierra el diálogo

### Requirement: Diálogo de demostración accesible
The demo dialog SHALL be modal, keep keyboard focus inside while open, close with Escape and with its "Entendido" button, and return focus to the button that opened it.

#### Scenario: Cerrar con Escape
- **WHEN** el diálogo está abierto y la persona aprieta Escape
- **THEN** el diálogo se cierra y el foco vuelve al botón "Comprar …" que lo abrió

### Requirement: Página oficial del evento opcional
When the content includes the official event page link, the closing section SHALL show it as a secondary button. If the link is an example, the button MUST open the demo dialog ("Acá se abriría la página oficial del evento") instead of navigating. If the content has no link, no button is shown.

#### Scenario: Enlace de ejemplo
- **WHEN** el contenido trae la página oficial marcada como ejemplo y la persona aprieta su botón
- **THEN** se abre el diálogo de demostración y la dirección no cambia

#### Scenario: Sin enlace
- **WHEN** el contenido no trae la página oficial
- **THEN** el cierre no muestra ese botón

### Requirement: El ticket abre la puerta a NetX
The section "Tu ticket también abre la puerta a NetX" SHALL show five ordered steps, each with who does it as visible text ("UnityHub" or "NetX"), the existing ticket registration (same behavior, texts and browser-only storage as today, subject to the requirement "Vincular el ticket pide cuenta") styled for the event, and the Genesis seal with the ⚖ `presencia`.

#### Scenario: Pasos con responsable
- **WHEN** una persona ve la sección del ticket
- **THEN** hay 5 pasos en orden y cada uno dice quién lo hace

#### Scenario: Genesis pendiente con ticket
- **WHEN** una persona con sesión registra el código `LH27-8F3K-2Q`
- **THEN** ve "Ticket LH27-8F3K-2Q registrado"
- **AND** el sello Genesis muestra el estado "Pendiente del primer check-in", sin cálculo de presencia

#### Scenario: Genesis sin ticket
- **WHEN** no hay ticket registrado
- **THEN** el sello Genesis explica que se activa con el primer check-in en el territorio

### Requirement: Preguntas desplegables
The "Preguntas" section SHALL show each question from the content as a native disclosure that opens and closes with the keyboard.

#### Scenario: Abrir una pregunta
- **WHEN** una persona enfoca "¿Necesito una cuenta en NetX para ir?" y aprieta Enter
- **THEN** se ve la respuesta

### Requirement: Cierre y pie
The closing SHALL show the large closing sentence, the actions "Reservar mi lugar" (to `#entradas`) and "Llegar con mi tribu" (to `#tribus`), and a footer with "Convocan NetX Gen, BioPueblo y Rubania" and "Entradas y check-in con UnityHub".

#### Scenario: Ver el cierre
- **WHEN** una persona llega al final de `/congreso`
- **THEN** ve las dos acciones y los dos textos del pie

### Requirement: Barra de entradas en móvil
On screens narrower than 640px the page SHALL show a fixed bottom bar with the featured ticket price (with "ejemplo") and an "Entradas" link to `#entradas`. The bar MUST NOT cover the NetX Hifa button and MUST stay clickable.

#### Scenario: Móvil
- **WHEN** una persona abre `/congreso` a 390 px de ancho
- **THEN** ve la barra fija y puede apretar "Entradas", que lleva a la sección de entradas

### Requirement: Anclas estables para entrar desde afuera
The page SHALL keep the anchors `#inicio`, `#acerca`, `#recorrido`, `#voces`, `#ejes`, `#territorio`, `#tribus`, `#entradas`, `#ticket` and `#faq` stable, so an external event page can link into NetX. Landing on an anchor MUST leave its heading visible below the NetX top bar and the event bar.

#### Scenario: Entrar al ticket
- **WHEN** una persona, con o sin sesión, abre `/congreso#ticket`
- **THEN** la página muestra la sección del ticket con su título visible, no tapado por las barras

### Requirement: Accesibilidad de la vitrina
The page SHALL be fully usable with the keyboard, pass the axe audit (no serious or critical violations) with the origin mode on and with the dialog open, meet AA contrast in every section (including the dawn gradient) and have no horizontal scroll at 390px.

#### Scenario: Auditoría
- **WHEN** corre la auditoría de axe en `/congreso`, con sesión y sin sesión
- **THEN** no hay violaciones serias ni críticas

#### Scenario: Sin scroll horizontal
- **WHEN** la página se abre a 390 px de ancho
- **THEN** el ancho del documento no supera el de la ventana
