# Spec Delta

## MODIFIED Requirements

### Requirement: Rail lateral
The system SHALL show on every page, on screens 768 px wide or more, a narrow navigation rail fixed on the left edge, as a `nav` landmark labelled "Principal", with one item per existing destination in this order: Explorar, Bien común, Invertir, Sumarte, Mi tierra. Each item MUST have an icon (decorative, `aria-hidden`) and a visible short text label. Destinations MUST come from a single list, and a destination whose route does not exist in the app MUST NOT be shown.

#### Scenario: Navegar desde el rail
- **WHEN** una persona hace clic en "Bien común" en el rail
- **THEN** llega a `/bien-comun`

#### Scenario: Solo destinos que existen
- **WHEN** la app no tiene la ruta `/invertir`
- **THEN** el rail no muestra "Invertir"

### Requirement: Igual en computadora y celular
The system SHALL keep the same main destinations at every viewport width. From 768 px wide the rail is on the left, at most 88 px wide, with icon and label for every item. Below 768 px the rail MUST be hidden and the destinations MUST be reachable from a "Menú" button in the top bar that opens a dropdown panel. In both cases the page content MUST have no horizontal scroll.

#### Scenario: Celular
- **WHEN** la página se ve con 390 × 844 px
- **THEN** no se ve el rail, la barra superior tiene el botón "Menú" que abre los destinos, y la página no tiene scroll horizontal

#### Scenario: Computadora
- **WHEN** la página se ve con 1280 × 800 px
- **THEN** el rail está a la izquierda, mide 88 px o menos y muestra ícono y nombre de cada destino

### Requirement: Teclado
The system SHALL keep "Saltar al contenido" as the first focusable element. On screens 768 px wide or more it MUST be followed by the rail items in order; below 768 px, by the "Menú" button.

#### Scenario: Tab
- **WHEN** una persona aprieta Tab dos veces al cargar `/` en una pantalla de 1280 px
- **THEN** el foco pasa por "Saltar al contenido" y luego por "Explorar" en el rail

#### Scenario: Tab en el celular
- **WHEN** una persona aprieta Tab dos veces al cargar `/` en una pantalla de 390 px
- **THEN** el foco pasa por "Saltar al contenido" y luego por el botón "Menú"
