## ADDED Requirements

### Requirement: Territorio como entidad
The system SHALL model a `Territorio` with at least: `id`, `nombre`, `ubicacion`, `descripcion`, `superficie` (optional text) and `bienesComunes` (list of names). The example data MUST contain exactly one territory, `lighthouse`, with the texts of mock-up v6 (name "Lighthouse", location "BioPueblo Mainqué, margen sur del Río Negro", surface "~1.000 ha (ilustrativa)" and the four common goods: "Agua: toma, cisterna y riego", "Energía: parque solar comunitario", "Núcleo común: bioquincho y cocina", "Vivero y banco de semillas"). The model MUST NOT include lots, parcels, prices, costs or amounts of money.

#### Scenario: Listar territorios
- **WHEN** se llama a `listarTerritorios()`
- **THEN** devuelve un solo territorio, con `id` "lighthouse" y sus cuatro bienes comunes por nombre

#### Scenario: Buscar un territorio que no existe
- **WHEN** se llama a `buscarTerritorio("no-existe")`
- **THEN** devuelve `undefined`

### Requirement: Cada tribu pertenece a un territorio
The system SHALL give every `Tribu` a `territorioId` that refers to an existing territory. `tribusDeTerritorio(id)` MUST return the tribes of that territory ordered by `barrio`, and an empty list for an unknown territory.

#### Scenario: Tribus del Lighthouse
- **WHEN** se llama a `tribusDeTerritorio("lighthouse")`
- **THEN** devuelve las 12 tribus de ejemplo, en el orden de los barrios 1 a 12

#### Scenario: Integridad de las referencias
- **WHEN** se recorren todas las tribus de ejemplo
- **THEN** cada `territorioId` corresponde a un territorio de `listarTerritorios()`

#### Scenario: Territorio desconocido
- **WHEN** se llama a `tribusDeTerritorio("no-existe")`
- **THEN** devuelve una lista vacía

### Requirement: Resumen del territorio
The system SHALL compute `resumenDeTerritorio(id)` with the number of tribes per state (`activa`, `formacion`, `vacante`) and the total, derived from the tribe data (never hard-coded). For an unknown territory it MUST return `undefined`, not a summary with zeros.

#### Scenario: Resumen del Lighthouse
- **WHEN** se llama a `resumenDeTerritorio("lighthouse")`
- **THEN** la suma de activas, en formación y vacantes es 12 y coincide con contar los estados de las tribus de ejemplo

#### Scenario: Resumen de un territorio inexistente
- **WHEN** se llama a `resumenDeTerritorio("no-existe")`
- **THEN** devuelve `undefined`

### Requirement: El dato que falta no es cero
The system SHALL represent a missing territory attribute (for example `superficie`) as absent (`undefined`), never as `0` or an empty string, so that screens can show "sin dato".

#### Scenario: Territorio sin superficie
- **WHEN** un territorio de prueba (solo en el test) se define sin `superficie`
- **THEN** el tipo lo acepta y el valor leído es `undefined`
