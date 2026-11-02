## ADDED Requirements

### Requirement: Selector de vistas del mapa
The page `/territorios/lighthouse` SHALL show above the map a group of buttons named "Vista del mapa" with three views, in this order: "Ahora · frentes de trabajo", "Plan · zonas" and "Visión · tribus por barrio". The selected view MUST be marked with `aria-pressed="true"` and with a visible difference that does not rely only on color. "Ahora" MUST be the default. Changing the view MUST NOT navigate away from the page. It MUST clear the selection and write `?vista=<id>` to the URL without adding a history entry. Opening the page with `?vista=plan` or `?vista=vision` MUST open that view, and any other value MUST open "Ahora". The views MUST come from a typed registry, so that adding a view means adding one entry (name, layers, legend, list and panel).

#### Scenario: Vista por defecto
- **WHEN** una persona abre `/territorios/lighthouse`
- **THEN** la vista "Ahora · frentes de trabajo" está marcada y el mapa muestra los frentes, no los barrios

#### Scenario: Enlace compartible
- **WHEN** una persona abre `/territorios/lighthouse?vista=vision`
- **THEN** la vista "Visión · tribus por barrio" está marcada y el mapa muestra los 12 barrios con sus tribus

#### Scenario: Vista desconocida
- **WHEN** una persona abre `/territorios/lighthouse?vista=red`
- **THEN** ve la vista "Ahora"

#### Scenario: Enlace viejo a un barrio
- **WHEN** una persona abre `/territorios/lighthouse?sel=barrio-6` sin `vista`
- **THEN** se abre la vista Visión con el barrio 6 elegido

### Requirement: Línea de tiempo por fases
The page SHALL show an "Etapa" control with the three phases of the Lighthouse. The current phase MUST be selected by default and labeled "hoy" in text. The phase MUST be operable with the keyboard and written to the URL (`?fase=0|1|2`), and an invalid value MUST fall back to the current phase. What each view shows MUST depend on the phase:
- **Ahora** draws only the fronts in force in that phase.
- **Plan** states "Este plan todavía no dice qué se hace en cada fase (sin dato)".
- **Visión** shows a text for the phase.

Elements MUST be filtered by phase through the single function `vigenteEn`.

#### Scenario: Pasar a la fase 1
- **WHEN** la persona elige la fase 1 con el teclado en la vista Ahora
- **THEN** el mapa y la lista muestran también "Primer obrador" y "Parque agrovoltaico"
- **AND** la URL tiene `fase=1`

#### Scenario: Fase de hoy
- **WHEN** la persona abre la página sin `fase`
- **THEN** la fase 0 está elegida y su opción dice "hoy"

### Requirement: Vista Ahora con frentes de trabajo
The "Ahora" view SHALL draw:
- the Macrolote 7 outline and the common land, as context;
- one keyboard-focusable numbered seal for each front that has a place and is in force in the chosen phase.

Its accessible name MUST state the front name and its team. Selecting a seal or its list item MUST show in the side panel the name, the team, the need, "Falta: …" (or "sin dato"), "Para: …" (or "sin dato") and the notice that the place is illustrative.

Without a selection, the panel SHALL show "Dónde podés ayudar" with three groups: the fronts as buttons with the same number as their seal, "Sin lugar en el mapa", and "Más adelante" (fronts of later phases, with their phase in text).

A front of the current phase MUST offer "Quiero sumarme a este frente", which follows the same rules as joining its team in `equipos-de-trabajo`. Fronts of a later phase MUST NOT offer it.

#### Scenario: Elegir un frente desde la lista
- **WHEN** la persona elige "Agua y cuenca" en la lista con el teclado
- **THEN** el sello 1 queda resaltado y el panel muestra el equipo Agua, la necesidad, lo que falta y para cuándo
- **AND** la URL tiene `sel=agua-cuenca`

#### Scenario: Frente sin lugar
- **WHEN** la persona mira el panel sin selección
- **THEN** "Papeles y fideicomiso" y "Comunicación" aparecen bajo "Sin lugar en el mapa" y no tienen sello en el mapa

#### Scenario: Frente que viene
- **WHEN** la persona está en la fase 1 y elige "Primer obrador"
- **THEN** el panel dice "Más adelante · fase 1" y no ofrece "Quiero sumarme"

#### Scenario: Sumarse desde el mapa
- **WHEN** una persona que adhirió al Lighthouse elige "Vivero y suelo", aprieta "Quiero sumarme a este frente" y confirma
- **THEN** ve "Pediste sumarte a" seguido del nombre del equipo de Permacultura y "aspirante"

### Requirement: Vista Plan con fuentes del plan
The "Plan · zonas" view SHALL draw the existing illustrative distribution: the common land and the 12 neighborhood zones, without tribe names or seals, with the notice of illustrative random distribution. Only the common land is selectable. The panel SHALL list the plan sources:
- "Distribución ilustrativa", available and selected;
- "Masterplan de permacultura (borrador)", listed only when its data exists in the code;
- "Masterplan de Martín", shown as text "todavía no está", not as a disabled control.

#### Scenario: Plan sin tribus
- **WHEN** la persona elige "Plan · zonas"
- **THEN** el mapa muestra las zonas de barrio sin los nombres de las tribus
- **AND** el panel lista "Masterplan de Martín: todavía no está"

### Requirement: Vista Visión con tribus de ejemplo
The "Visión · tribus por barrio" view SHALL keep the current behavior of the map: barrios colored by their tribe's status with seals, the barrio panel with "Conocer la tribu", the common land panel, and the status counts. It MUST show in the legend, in the panel summary and in the barrio panel the label "Tribus de ejemplo, a definir". The panel MUST show a text for the chosen phase:
- phase 0: "En la fase 0 todavía no hay tribus: hay equipos";
- phase 1: the first communities are born, many from a team that already worked together;
- phase 2: the neighborhoods are inhabited.

#### Scenario: Elegir un barrio en Visión
- **WHEN** la persona, en la vista Visión, elige el barrio 6
- **THEN** el panel muestra "Valle Solar", "Activa", "Tribus de ejemplo, a definir" y "Conocer la tribu"

### Requirement: Soluna en todas las vistas
The Chacras de Soluna outline, its fincas and the "Fincas disponibles" list SHALL stay visible and selectable in all three views, with the same panel and simulated consultation as today.

#### Scenario: Finca en la vista Ahora
- **WHEN** la persona, en la vista Ahora, elige la finca 502
- **THEN** ve "Finca 502" y el botón "Consultar por este lote"

### Requirement: Del equipo al mapa
In the "Equipos · ahora" tab of `/tribus`, each front with a place SHALL link to `/territorios/lighthouse?vista=ahora&sel=<front id>`, which opens the map with that front selected.

#### Scenario: Ver en el mapa
- **WHEN** la persona aprieta "Ver en el mapa" en el frente "Agua y cuenca"
- **THEN** llega al mapa en la vista Ahora con "Agua y cuenca" elegido en el panel

### Requirement: Accesibilidad y calidad de las vistas
In every view:
- the map container MUST have an accessible name stating the view and the phase;
- the legend MUST name every symbol in text;
- fronts in force and later fronts MUST differ by border shape (solid or dashed) and text, not only by color;
- every selectable element MUST be reachable from a keyboard list.

The page SHALL be bilingual (es/en), keep the prototype notice, use only theme tokens, pass the axe audit in all three views and have no horizontal scroll at 390 px wide.

#### Scenario: Celular
- **WHEN** la página se ve con 390 × 844 px en la vista Ahora
- **THEN** el selector de vistas y la etapa se acomodan en el ancho, la ficha queda debajo del mapa y no hay scroll horizontal

#### Scenario: Inglés
- **WHEN** la persona cambia a inglés en la vista Ahora
- **THEN** el selector, la etapa, la leyenda y los frentes se leen en inglés
