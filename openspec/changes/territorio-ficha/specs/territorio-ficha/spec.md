## ADDED Requirements

### Requirement: Ficha del territorio
The system SHALL serve at `/territorios/[id]` a page for each territory returned by `listarTerritorios()`, showing its name as the only `h1`, its location, its description and its surface. If the surface is missing it MUST show "sin dato", never "0". An unknown id MUST render the 404 page.

#### Scenario: Abrir la ficha del Lighthouse
- **WHEN** una persona abre `/territorios/lighthouse`
- **THEN** ve el título "Lighthouse", la ubicación "BioPueblo Mainqué" y la superficie "~1.000 ha (ilustrativa)"

#### Scenario: Territorio inexistente
- **WHEN** una persona abre `/territorios/no-existe`
- **THEN** ve la página de "no encontrado" con un enlace para volver

### Requirement: Resumen y barrios
The system SHALL show the summary from `resumenDeTerritorio(id)` (activas, en formación, vacantes) and a list of the 12 neighbourhoods in order, each with "Barrio N", the tribe name (or "Busca tribu" when vacant), its focus and its state written as text. Each item MUST be a link to `/tribus/[id]`. State MUST NOT be communicated only by color.

#### Scenario: Resumen coherente
- **WHEN** la persona mira el resumen
- **THEN** los tres números suman 12 y coinciden con la cantidad de barrios de cada estado en la lista

#### Scenario: Ir a una tribu
- **WHEN** la persona activa con el teclado el barrio 6
- **THEN** llega a `/tribus/valle` (Valle Solar)

### Requirement: Bienes comunes sin plata
The system SHALL list the territory's common goods by name only. The page MUST NOT show amounts of money, currency symbols, hours, progress bars, lots, parcels or purchase/reservation actions.

#### Scenario: Bienes comunes
- **WHEN** la persona mira la sección "Bienes comunes"
- **THEN** ve los cuatro nombres del mock-up y ningún "USD", "$", "h" de horas ni barra de avance

#### Scenario: Sin lotes ni compra
- **WHEN** se busca en la página el texto "lote", "parcela", "reservar" o "comprar"
- **THEN** no aparece

### Requirement: Datos de ejemplo declarados
The system SHALL show the example-data notice ("Tribus, personas y cifras de ejemplo.") on the page.

#### Scenario: Aviso visible
- **WHEN** la persona abre la ficha
- **THEN** ve el aviso de datos de ejemplo

### Requirement: Integración con el marco visual
The page SHALL use only the theme color tokens (`bg`, `surface`, `ink`, `muted`, `line`, `deep`, `green`, `gold` and their variants) and MUST NOT nest a `<main>` element inside the layout's `<main id="contenido">`. The global navigation SHALL include a "Territorio" link to `/territorios/lighthouse`, marked as current (`aria-current="page"`) on that page.

#### Scenario: Un solo main
- **WHEN** se carga `/territorios/lighthouse`
- **THEN** la página tiene exactamente un elemento `main`

#### Scenario: Enlace en la navegación
- **WHEN** la persona está en la portada y activa "Territorio" en la navegación
- **THEN** llega a `/territorios/lighthouse` y el enlace queda marcado como página actual
