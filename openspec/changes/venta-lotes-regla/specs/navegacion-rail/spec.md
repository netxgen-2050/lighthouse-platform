# Spec Delta

## MODIFIED Requirements

### Requirement: Rail lateral
The system SHALL show on every page a navigation rail fixed on the left edge, as a `nav` landmark labelled "Principal", with one item per existing destination that is not hidden, in this order: Inicio, Territorio, Lotes, Sumarte, Tribus, Pactos, Semillas, Fogón. Each item MUST have an icon (decorative, `aria-hidden`) and a visible short text label. Destinations MUST come from a single list, and a destination whose route does not exist in the app MUST NOT be shown.

#### Scenario: Navegar desde el rail
- **WHEN** una persona hace clic en "Tribus" en el rail
- **THEN** llega a `/tribus`

#### Scenario: Solo destinos que existen
- **WHEN** la app no tiene la ruta `/lotes`
- **THEN** el rail no muestra "Lotes"
- **AND** el test que compara la lista con las páginas reales pasa con `/lotes` declarado como inexistente
