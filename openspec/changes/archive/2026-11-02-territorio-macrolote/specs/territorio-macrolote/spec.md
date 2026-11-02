## ADDED Requirements

### Requirement: Mapa del Macrolote 7
The system SHALL show at `/territorios/lighthouse` a map with satellite imagery, initially fitted to Macrolote 7, drawing from `biopueblo-territorios.geojson`: the Macrolote 7 outline (highlighted), its 12 barrios, the common land, the Chacras de Soluna outline with its 175 fincas and 5 points of interest, and the other BioPueblo macrolotes as muted context. The map MUST show the notice that barrios and common land are an illustrative random distribution until the masterplan, and the imagery attribution.

#### Scenario: Ver el macrolote
- **WHEN** una persona abre `/territorios/lighthouse`
- **THEN** el mapa aparece encuadrado en el Macrolote 7 con los 12 barrios y el terreno común dibujados
- **AND** ve el aviso de distribución ilustrativa

### Requirement: Estados legibles sin color
The system SHALL color each barrio by its tribe's status (activa, en formación, vacante) and each finca by its status (disponible, reservada, cantera), and MUST provide a legend with text for every color, plus the status in text in the side panel.

#### Scenario: Leyenda
- **WHEN** una persona mira el mapa
- **THEN** ve una leyenda que nombra cada estado en texto

### Requirement: Ficha lateral
The system SHALL show a side panel to the right of the map (below it under 768 px wide). With nothing selected it shows the Lighthouse summary and a tribe panel with three counts: Activas, En formación, Vacantes, computed from the tribe data. The full tribe list MUST NOT appear on this page.

#### Scenario: Sin selección
- **WHEN** una persona abre la página
- **THEN** la ficha muestra el resumen y los conteos 5 activas, 5 en formación y 2 vacantes (según los datos de ejemplo)
- **AND** no aparece el listado de las 12 tribus

### Requirement: Ficha de un barrio
The system SHALL, when a barrio is selected (click on the map or from the list), show in the side panel its tribe: seal, name, focus, status in text, households and what it is looking for, with a button "Conocer la tribu" to `/tribus/<id>`. A vacant barrio MUST show "Barrio N busca tribu" and what it needs. Selecting MUST NOT navigate away from the page.

#### Scenario: Elegir Valle Solar
- **WHEN** la persona hace clic en el barrio 6 del mapa
- **THEN** la ficha muestra "Valle Solar", "Activa" y el botón "Conocer la tribu"
- **AND** la URL sigue siendo `/territorios/lighthouse`

#### Scenario: Ir a la tribu
- **WHEN** la persona aprieta "Conocer la tribu"
- **THEN** llega a `/tribus/valle`

### Requirement: Ficha del terreno común
The system SHALL show, when the common land is selected, a panel describing it: name, surface in hectares (from the data), what it is for (sample text) and who takes care of it (sample text).

#### Scenario: Elegir el común
- **WHEN** la persona hace clic en el terreno común
- **THEN** la ficha muestra "Terreno común del Lighthouse" y su superficie en hectáreas

### Requirement: Vitrina de lotes de Soluna
The system SHALL show, when a Soluna finca is selected, its number, surface in m² and status. An available finca MUST show "Consultar por este lote" (simulated: stored in the browser, shows "Consulta enviada (simulado)") and the note that NetX acts as an agency and the purchase is private between the parties, with the ⚖ `agencia` (draft). Reserved or quarry fincas MUST NOT offer the button.

#### Scenario: Finca disponible
- **WHEN** la persona elige la finca 502 (disponible)
- **THEN** ve "Finca 502", "9.130 m²", "Disponible" y el botón "Consultar por este lote"

#### Scenario: Finca reservada
- **WHEN** la persona elige la finca 501 (reservada)
- **THEN** ve "Reservada" y no ve el botón de consulta

### Requirement: Elegir sin mouse
The system SHALL offer a keyboard-accessible list "Elegir en el mapa" (barrios, common land, available fincas) that selects the same element as clicking it, highlights it on the map and updates the side panel; the panel MUST be a live region so the change is announced.

#### Scenario: Teclado
- **WHEN** la persona elige "Barrio 3" en la lista con el teclado
- **THEN** el barrio queda resaltado en el mapa y la ficha muestra "Barrio 3 busca tribu"

### Requirement: Prototipo y calidad
The page SHALL keep the prototype notice, use only theme tokens, have a single `<main>`, pass the axe audit, and have no horizontal scroll at 390 px wide.

#### Scenario: Celular
- **WHEN** la página se ve con 390 × 844 px
- **THEN** el mapa ocupa el ancho, la ficha queda debajo y no hay scroll horizontal
