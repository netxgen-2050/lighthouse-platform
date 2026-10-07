## ADDED Requirements

### Requirement: Formulario de pedido de contacto
The system SHALL offer one inline contact-request form, opened by "Consultar por este lote" (Soluna finca panel), "Pedir invitación" and "Pedir una charla" (`/sumarte`). The reason and reference MUST come from the button that opened it. The form SHALL ask for the preferred channel (Email, Telegram or WhatsApp; required), the best moment (optional) and a message (optional, up to 500 characters), and MUST NOT ask for name, email or phone. It SHALL show the notice "En el prototipo no te pedimos email ni teléfono: el pedido queda solo en este navegador." and the ⚖ `contacto`.

#### Scenario: Abrir desde una finca
- **WHEN** la persona elige la finca 502 y aprieta "Consultar por este lote"
- **THEN** se abre el formulario con "Consulta por un lote · Finca 502"
- **AND** el aviso compacto del estado administrativo está dentro del formulario

#### Scenario: Canal obligatorio
- **WHEN** la persona aprieta "Enviar pedido (simulado)" sin elegir canal
- **THEN** ve el error "Elegí cómo preferís que te contactemos" asociado al campo y el foco va a ese campo
- **AND** no se guarda nada

#### Scenario: Mensaje largo
- **WHEN** la persona escribe más de 500 caracteres en el mensaje
- **THEN** ve el error "El mensaje puede tener hasta 500 caracteres" y no se guarda nada

#### Scenario: Cancelar
- **WHEN** la persona aprieta "Cancelar"
- **THEN** el formulario se cierra, el foco vuelve al botón que lo abrió y no se guarda nada

### Requirement: Guardar el pedido en la bandeja
The system SHALL store each sent request in the browser under the key `lh-contactos` (listed in `lib/demo/claves.ts`) with: id, date, reason, reference, channel, moment (or none), message (or none), destination and, for lots, the administrative status shown. The destination MUST be "BioPueblo, vía NetX como agencia" for lots and "Equipo NetX" for the circle invitation and the NetX talk. After sending, the screen SHALL announce "Pedido recibido (simulado). Lo vería: <destino>." in a live region.

#### Scenario: Enviar una consulta por un lote
- **WHEN** la persona elige "WhatsApp" y envía el pedido de la finca 502
- **THEN** ve "Pedido recibido (simulado). Lo vería: BioPueblo, vía NetX como agencia."
- **AND** al recargar, el pedido sigue en la bandeja con el estado "Loteo en trámite"

#### Scenario: Borrar todo
- **WHEN** la persona usa "Borrar todo lo de este navegador" en `/panel` y confirma
- **THEN** la bandeja de pedidos queda vacía

#### Scenario: Dato guardado inválido
- **WHEN** lo guardado en `lh-contactos` no es una lista válida
- **THEN** la bandeja se lee como vacía y la pantalla no falla

### Requirement: Inversión y círculo con el mismo pedido
The system SHALL make "Pedir invitación" and "Pedir una charla" open the form; only after sending SHALL they keep their current effect ("Invitación pedida (simulado)" plus one in the circle meters, or "Charla pedida (simulado)"). Cancelling MUST leave `/sumarte` unchanged.

#### Scenario: Pedir invitación al círculo
- **WHEN** la persona aprieta "Pedir invitación", elige "Email" y envía
- **THEN** ve "Invitación pedida (simulado)" y el medidor "Lugares en el círculo" suma uno
- **AND** la bandeja tiene un pedido "Invitación al círculo · Lote 7" con destino "Equipo NetX"

#### Scenario: Cancelar la charla
- **WHEN** la persona aprieta "Pedir una charla" y después "Cancelar"
- **THEN** sigue viendo el botón "Pedir una charla"

### Requirement: Bandeja en la Vista NetX
The system SHALL show in `/netx` a section "Pedidos de contacto · este navegador (simulado)" with a table (date, reason, reference, channel, destination, status "Recibido (simulado)"), newest first, and the note "En el producto real irían al CRM". With no requests it MUST show "Todavía no hay pedidos en este navegador." A missing optional field MUST be shown as "sin dato".

#### Scenario: Ver los pedidos
- **WHEN** la persona envió un pedido de la finca 502 y abre `/netx`
- **THEN** la tabla muestra una fila con "Consulta por un lote", "Finca 502", "WhatsApp" y "BioPueblo, vía NetX como agencia"

#### Scenario: Sin pedidos
- **WHEN** la bandeja está vacía y la persona abre `/netx`
- **THEN** ve "Todavía no hay pedidos en este navegador."

### Requirement: Término legal del pedido en borrador
The legal catalog SHALL include the term `contacto` ("Pedir contacto"), written by the agent and marked `borrador: true`, shown next to the form title.

#### Scenario: Abrir el ⚖ del pedido
- **WHEN** la persona abre el ⚖ del formulario
- **THEN** ve "Pedir contacto" y "Borrador: texto a revisar"

### Requirement: Calidad
The form and the new section SHALL be fully usable with the keyboard, use only theme tokens, keep a single `<main>`, and `/sumarte` and `/netx` MUST pass the axe audit with the form open.

#### Scenario: Solo teclado
- **WHEN** la persona abre el formulario, elige canal y envía usando solo el teclado
- **THEN** el pedido se guarda y el anuncio se lee en la región en vivo
