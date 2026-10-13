## ADDED Requirements

### Requirement: Entregas por ítem del pozo
On the page of an active tribe, the section "Lo que aporta al pozo común" SHALL show, under each committed item, the deliveries registered for that item, most recent first, each as "<fecha> · <cantidad>" plus its note when present, and the written label "Registrada por la tribu · sin verificar". When an item has no deliveries it SHALL show "Sin entregas registradas todavía" and MUST NOT show "0" or any invented quantity. The section title SHALL carry the legal term `pozocomun`.

#### Scenario: Ítem sin entregas
- **WHEN** una persona abre `/tribus/valle` y nadie registró entregas en este navegador
- **THEN** debajo de "30 noches de hospedaje por año" ve "Sin entregas registradas todavía"

#### Scenario: Ítem con entregas
- **WHEN** la admin de Valle Solar registró dos entregas para "30 noches de hospedaje por año"
- **THEN** las ve debajo de ese ítem, la más reciente primero, cada una con "Registrada por la tribu · sin verificar"

#### Scenario: Término legal
- **WHEN** la persona abre el ⚖ junto a "Lo que aporta al pozo común"
- **THEN** ve el texto de `pozocomun`, que está marcado como borrador en el catálogo

### Requirement: Registrar y quitar entregas (solo quien administra la tribu)
The system SHALL show the form "Registrar una entrega" only to the person whose session administers that tribe (`tribuAdmin` equal to the tribe id). The form SHALL have: item (select with exactly the tribe's committed items), date (required, not later than today), quantity (required, 1 to 60 characters after trimming) and note (optional, up to 140 characters). Errors SHALL be shown next to the field with `aria-describedby` and focus SHALL move to the first invalid field. A successful registration SHALL be announced with `aria-live="polite"` ("Entrega registrada."). Each delivery SHALL have a "Quitar" button, visible only to the admin, whose accessible name includes the item and the date.

#### Scenario: Persona que no administra la tribu
- **WHEN** una persona sin rol de admin de Valle Solar abre `/tribus/valle`
- **THEN** no ve el formulario "Registrar una entrega" ni botones "Quitar"

#### Scenario: Registrar una entrega
- **WHEN** la admin de Valle Solar elige "30 noches de hospedaje por año", pone la fecha de hoy, escribe "4 noches" y aprieta "Registrar"
- **THEN** la entrega aparece debajo de ese ítem y se anuncia "Entrega registrada."

#### Scenario: Cantidad vacía
- **WHEN** aprieta "Registrar" sin cantidad
- **THEN** ve un error asociado al campo, el foco va a ese campo y no se agrega nada

#### Scenario: Fecha futura
- **WHEN** pone la fecha de mañana
- **THEN** ve un error asociado al campo y no se agrega nada

#### Scenario: Quitar
- **WHEN** la admin aprieta "Quitar" en una entrega
- **THEN** la entrega desaparece; si era la única del ítem, vuelve a verse "Sin entregas registradas todavía"

#### Scenario: Otra tribu
- **WHEN** la admin de Valle Solar abre la página de otra tribu activa
- **THEN** no ve el formulario

### Requirement: Datos solo en el navegador
Deliveries SHALL be stored only in the browser, under a key built with `lib/demo/claves.ts` (per-person prefix), MUST NOT be sent to any server, and SHALL be removed by the panel's "Borrar todo". When the form is visible, the page SHALL show "Modo demostración: las entregas quedan solo en este navegador."

#### Scenario: Recargar
- **WHEN** la admin registró una entrega y recarga la página
- **THEN** la sigue viendo

#### Scenario: Sin pedidos al servidor
- **WHEN** registra y quita entregas
- **THEN** ningún pedido de red contiene la cantidad ni la nota

#### Scenario: Borrar todo
- **WHEN** la admin usa "Borrar todo" en el panel y vuelve a `/tribus/valle`
- **THEN** todos los ítems muestran "Sin entregas registradas todavía"

### Requirement: Marco y accesibilidad
The section and form SHALL be fully usable with the keyboard, use only theme tokens, keep a single `<main>` (the layout's), and the tribe page SHALL keep passing the axe audit with deliveries and with the form visible.

#### Scenario: Solo teclado
- **WHEN** la admin completa y envía el formulario usando solo Tab, flechas, Espacio y Enter
- **THEN** la entrega se registra y se anuncia
