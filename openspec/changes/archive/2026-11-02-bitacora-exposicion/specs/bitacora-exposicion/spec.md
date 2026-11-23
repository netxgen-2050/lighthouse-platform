## ADDED Requirements

### Requirement: Entrada de la bitácora
The system SHALL record exposure entries in the browser under the key `lh-bitacora` (listed in `lib/demo/claves.ts`). Each entry MUST include: ISO date and time, route, type ("estado-loteo" or "termino-legal"), what was shown (project, status, rule and file number as displayed; or term key and title), a fingerprint of the displayed text and whether it is a draft. The fingerprint SHALL be a deterministic short code computed from the title and text, so a change in the text changes the fingerprint.

#### Scenario: Huella estable
- **WHEN** se calcula la huella dos veces del mismo título y texto
- **THEN** da el mismo código

#### Scenario: Texto cambiado
- **WHEN** cambia una palabra del texto de un término
- **THEN** la huella es distinta

### Requirement: Qué se anota
The system SHALL add an entry when the `EstadoAdministrativo` component is shown and when a ⚖ explanation is opened (mouse, keyboard or touch). The same type, key, route and fingerprint MUST be recorded at most once every 30 minutes, and the log MUST keep at most the latest 300 entries, dropping the oldest. If the stored log is invalid it SHALL be treated as empty and the page MUST NOT fail.

#### Scenario: Ver el estado del loteo
- **WHEN** la persona abre `/territorios/lighthouse`
- **THEN** la bitácora tiene una entrada "estado-loteo" con "Chacras de Soluna", "Loteo en trámite" y la ruta `/territorios/lighthouse`

#### Scenario: Abrir un ⚖
- **WHEN** la persona abre con el teclado el ⚖ "Pase Fundador" en `/sumarte`
- **THEN** la bitácora tiene una entrada "termino-legal" con la clave `pasefundador` y su huella

#### Scenario: Sin repetidos
- **WHEN** la persona abre el mismo ⚖ tres veces en dos minutos
- **THEN** la bitácora tiene una sola entrada de ese término en esa ruta

#### Scenario: Tope
- **WHEN** la bitácora tiene 300 entradas y se anota otra
- **THEN** quedan 300 y la más vieja ya no está

### Requirement: Página "Lo que te mostramos"
The system SHALL offer `/panel/bitacora`, linked from `/panel`, with a table (date and time, screen, what was shown, fingerprint, "Borrador: sí/no"), newest first; a "Descargar (JSON)" button that downloads the log as it is stored; the empty message "Todavía no hay nada anotado en este navegador."; and a paragraph explaining its purpose with the ⚖ `bitacora`. The page MUST NOT add its own `<main>`.

#### Scenario: Ver la bitácora
- **WHEN** la persona abrió el territorio y después va a `/panel/bitacora`
- **THEN** ve una fila con "Estado del loteo" y "Chacras de Soluna"

#### Scenario: Vacía
- **WHEN** la bitácora está vacía
- **THEN** la página muestra "Todavía no hay nada anotado en este navegador."

#### Scenario: Descargar
- **WHEN** la persona aprieta "Descargar (JSON)"
- **THEN** se descarga un archivo `bitacora.json` con las mismas entradas que la tabla

#### Scenario: Borrar todo
- **WHEN** la persona usa "Borrar todo lo de este navegador" en `/panel` y confirma
- **THEN** `/panel/bitacora` muestra el mensaje de vacía

### Requirement: Término legal de la bitácora en borrador
The legal catalog SHALL include the term `bitacora` ("Bitácora de lo que te mostramos"), written by the agent and marked `borrador: true`.

#### Scenario: Abrir el ⚖ de la bitácora
- **WHEN** la persona abre el ⚖ en `/panel/bitacora`
- **THEN** ve "Bitácora de lo que te mostramos" y "Borrador: texto a revisar"

### Requirement: Calidad
The page SHALL be usable with the keyboard, use only theme tokens, keep the prototype notice, pass the axe audit and have no horizontal scroll at 390 px (the table may scroll inside its own container).

#### Scenario: Celular
- **WHEN** `/panel/bitacora` se ve a 390 × 844 px con entradas
- **THEN** la página no tiene scroll horizontal
