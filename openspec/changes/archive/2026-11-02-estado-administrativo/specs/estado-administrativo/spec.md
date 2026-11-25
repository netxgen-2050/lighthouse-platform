## ADDED Requirements

### Requirement: Dato del estado administrativo
The system SHALL keep, in `lib/legal/estado-administrativo.ts`, one record per project that has lots, with: project name, owner, status text, rule reference, file number (expediente), `aprobacionMunicipal` (boolean) and the date of the data. Today the only record SHALL be Chacras de Soluna (owner BioPueblo, "Loteo en trámite", "Ord. 173/2026 de Mainqué", no file number, `aprobacionMunicipal: false`). A missing field MUST be shown as "sin dato", never as an empty string, 0 or an invented value.

#### Scenario: Expediente sin dato
- **WHEN** el componente muestra el estado de Chacras de Soluna
- **THEN** se lee "Expediente: sin dato"

### Requirement: Aviso en las vistas con lotes
The system SHALL render the `EstadoAdministrativo` component in every view that shows lots. In `/territorios/lighthouse` the full version MUST appear above the map, and the compact version MUST appear inside the side panel of every selected Soluna finca, whatever its status. The component SHALL be a region named "Estado administrativo", communicate the status with text (not only color) and include the ⚖ `loteo`.

#### Scenario: Aviso completo arriba del mapa
- **WHEN** una persona abre `/territorios/lighthouse`
- **THEN** ve, antes del mapa, una región "Estado administrativo" que dice "Chacras de Soluna", "Loteo en trámite", "Ord. 173/2026 de Mainqué" y "Aprobación municipal: pendiente"

#### Scenario: Aviso compacto en la ficha de una finca
- **WHEN** la persona elige la finca 502
- **THEN** la ficha muestra "Loteo en trámite · Ord. 173/2026" con su ⚖

#### Scenario: También en una finca reservada
- **WHEN** la persona elige la finca 501 (reservada)
- **THEN** la ficha también muestra el aviso compacto

### Requirement: Sin compra ni reserva sin aprobación
The system SHALL decide which actions a view may offer on a lot through a pure function `accionesDeLote(proyecto)`. While `aprobacionMunicipal` is false it MUST return only "consultar" (never "comprar", "reservar" or "señar"), and no view SHALL show a button or link to buy, reserve or put a deposit on a lot.

#### Scenario: Sin aprobación
- **WHEN** se llama `accionesDeLote` para Chacras de Soluna con `aprobacionMunicipal: false`
- **THEN** devuelve solo "consultar"

#### Scenario: Ningún botón de compra en la ficha
- **WHEN** la persona elige cualquier finca disponible
- **THEN** no hay ningún botón ni enlace cuyo nombre contenga "Comprar", "Reservar" o "Señar"

### Requirement: Registro de vistas con lotes
The system SHALL keep the list of routes that show lots in `lib/legal/vistas-con-lotes.ts` (today `/territorios/lighthouse`), and an end-to-end test MUST visit every route in the list and fail if the "Estado administrativo" region is missing.

#### Scenario: Ruta sin aviso
- **WHEN** una ruta de la lista se renderiza sin el componente
- **THEN** el e2e `estado-administrativo.spec.ts` falla nombrando la ruta

### Requirement: Término legal del loteo en borrador
The legal catalog SHALL include the term `loteo` ("Estado del loteo"), written by the agent and marked `borrador: true`. The catalog SHALL accept the optional `borrador: true` mark, and the ⚖ of a draft term MUST show "Borrador: texto a revisar" inside its explanation.

#### Scenario: Abrir el ⚖ del loteo
- **WHEN** la persona abre el ⚖ del aviso
- **THEN** ve el título "Estado del loteo", el texto y "Borrador: texto a revisar"

### Requirement: Calidad del aviso
The component SHALL use only theme tokens, be readable by screen readers, and `/territorios/lighthouse` MUST keep passing the axe audit with no horizontal scroll at 390 px.

#### Scenario: Celular
- **WHEN** la página se ve a 390 × 844 px
- **THEN** el aviso completo se lee entero, sin scroll horizontal
