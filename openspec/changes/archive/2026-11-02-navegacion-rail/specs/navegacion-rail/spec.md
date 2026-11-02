## ADDED Requirements

### Requirement: Rail lateral
The system SHALL show on every page a navigation rail fixed on the left edge, as a `nav` landmark labelled "Principal", with one item per existing destination in this order: Inicio, Territorio, Tribus, Perfil, Compromisos, Congreso, Sumarte, Mi recorrido. Each item MUST have an icon (decorative, `aria-hidden`) and a visible short text label. Destinations MUST come from a single list, and a destination whose route does not exist in the app MUST NOT be shown.

#### Scenario: Navegar desde el rail
- **WHEN** una persona hace clic en "Tribus" en el rail
- **THEN** llega a `/tribus`

#### Scenario: Solo destinos que existen
- **WHEN** la app no tiene la ruta `/panel`
- **THEN** el rail no muestra "Mi recorrido"

### Requirement: Destino actual
The system SHALL mark the item of the current section with `aria-current="page"` and a visual highlight that does not rely only on color (for example a filled pill behind icon and label). Sub-routes count as their section (`/tribus/valle` marks "Tribus").

#### Scenario: Subruta
- **WHEN** una persona está en `/tribus/valle`
- **THEN** "Tribus" tiene `aria-current="page"`

### Requirement: Igual en computadora y celular
The system SHALL keep the rail on the left at every viewport width. At 390 px wide the rail MUST be at most 72 px wide, keep icon and label for every item, and leave the page content without horizontal scroll. If items do not fit vertically, the rail scrolls independently.

#### Scenario: Celular
- **WHEN** la página se ve con 390 × 844 px
- **THEN** el rail está a la izquierda, mide 72 px o menos, y la página no tiene scroll horizontal

### Requirement: Teclado
The system SHALL keep "Saltar al contenido" as the first focusable element, followed by the rail items in order.

#### Scenario: Tab
- **WHEN** una persona aprieta Tab dos veces al cargar `/`
- **THEN** el foco pasa por "Saltar al contenido" y luego por "Inicio" en el rail
