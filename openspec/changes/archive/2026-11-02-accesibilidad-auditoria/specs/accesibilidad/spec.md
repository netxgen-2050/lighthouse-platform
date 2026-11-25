## ADDED Requirements

### Requirement: Auditoría automática
The system SHALL run an automated axe audit (WCAG 2.1 A and AA rules) on every public route (`/`, `/tribus`, each `/tribus/<id>` taken from the tribe list, and the 404 page) as part of the e2e suite, and MUST have zero violations of impact `serious` or `critical`.

#### Scenario: Todas las rutas
- **WHEN** corre `pnpm test:e2e`
- **THEN** la auditoría recorre las 15 rutas y no reporta violaciones serias ni críticas

### Requirement: Cierre del ⚖
The system SHALL close an open legal explanation when the person presses Escape while focus is on the ⚖ button or inside the panel, and when the person clicks outside of it. After closing with Escape, focus MUST return to the ⚖ button.

#### Scenario: Escape con el foco en otro lado del panel
- **WHEN** la explicación está abierta y la persona aprieta Escape con el foco dentro del panel
- **THEN** la explicación se cierra y el foco vuelve al ⚖

#### Scenario: Clic afuera
- **WHEN** la explicación está abierta y la persona hace clic en otra parte de la página
- **THEN** la explicación se cierra

### Requirement: ⚖ operable con teclado real
The system SHALL make every ⚖ reachable by Tab in the natural order of the page, and openable with Enter and with Space.

#### Scenario: Tab, Enter y Space
- **WHEN** en `/tribus/valle` la persona avanza con Tab hasta el ⚖ de "Ritual de entrada"
- **THEN** Enter abre la explicación, Escape la cierra y Space la vuelve a abrir

### Requirement: Sin plata en ninguna tribu
The system SHALL show no amount in USD and no endorsements ("avales") on any of the 12 tribe pages.

#### Scenario: Las 12 páginas
- **WHEN** el test recorre las 12 `/tribus/<id>`
- **THEN** ninguna contiene "USD" ni "avales"
