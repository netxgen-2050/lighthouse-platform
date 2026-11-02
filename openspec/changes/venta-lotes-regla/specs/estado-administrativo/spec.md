# Spec Delta

## MODIFIED Requirements

### Requirement: Dato del estado administrativo
The system SHALL keep, in `lib/legal/estado-administrativo.ts`, one record per project that has lots, with: project name, owner, status text, rule reference, file number (expediente), `aprobacionMunicipal` (boolean) and the date of the data. The records SHALL be Chacras de Soluna (owner BioPueblo, "Loteo en trámite", "Ord. 173/2026 de Mainqué", no file number, `aprobacionMunicipal: false`) and `lighthouse-norte` ("Lighthouse VRN · sector norte", "Loteo provisorio", "Ord. 173/2026 de Mainqué", no owner, no file number, no approval date, `aprobacionMunicipal: false`). A missing field MUST be shown as "sin dato", never as an empty string, 0 or an invented value.

#### Scenario: Expediente sin dato
- **WHEN** el componente muestra el estado de Chacras de Soluna
- **THEN** se lee "Expediente: sin dato"

#### Scenario: Norte sin titular ni fecha
- **WHEN** el componente muestra el estado de `lighthouse-norte`
- **THEN** se lee "Titular: sin dato", "Expediente: sin dato" y "Fecha: sin dato"

### Requirement: Sin compra ni reserva sin aprobación
The system SHALL decide which actions a view may offer on a lot through a pure function `accionesDeLote(proyecto)`. For Chacras de Soluna it MUST return only "consultar" (never "comprar", "reservar" or "señar"), whatever its approval says, and no view SHALL show a button or link to buy, reserve or put a deposit on a Soluna lot. For `lighthouse-norte`, marked as simulated sale (ADR-028), it SHALL return "consultar", "reservar" and "comprar". Those two actions MUST exist only as simulated flows, with no charge, and the function MUST NOT read `aprobacionMunicipal` to enable them.

#### Scenario: Sin aprobación
- **WHEN** se llama `accionesDeLote` para Chacras de Soluna con `aprobacionMunicipal: false`
- **THEN** devuelve solo "consultar"

#### Scenario: Soluna con aprobación
- **WHEN** se llama `accionesDeLote` para Chacras de Soluna con `aprobacionMunicipal: true`
- **THEN** sigue devolviendo solo "consultar"

#### Scenario: Norte simulado
- **WHEN** se llama `accionesDeLote` para `lighthouse-norte`
- **THEN** devuelve "consultar", "reservar" y "comprar"
- **AND** el registro de `lighthouse-norte` sigue con `aprobacionMunicipal: false`

#### Scenario: Ningún botón de compra en la ficha
- **WHEN** la persona elige cualquier finca disponible de Chacras de Soluna
- **THEN** no hay ningún botón ni enlace cuyo nombre contenga "Comprar", "Reservar" o "Señar"

## ADDED Requirements

### Requirement: La aprobación de Norte es un supuesto de trabajo
El estado de `lighthouse-norte` SHALL decir en texto, en español y en inglés, que la aprobación municipal es un supuesto de trabajo y que no está otorgada, con la fecha como "sin dato". MUST NOT mostrarse como aprobada ni como pendiente con fecha, en la versión completa ni en la compacta, y sin depender del color.

#### Scenario: Versión completa
- **WHEN** el componente muestra `lighthouse-norte` completo
- **THEN** se lee "Aprobación municipal: supuesto de trabajo, no otorgada" y "Fecha: sin dato"

#### Scenario: Versión compacta
- **WHEN** el componente muestra `lighthouse-norte` compacto
- **THEN** se lee "Loteo provisorio" y "supuesto de trabajo, no otorgada", con su ⚖

#### Scenario: En inglés
- **WHEN** el componente muestra `lighthouse-norte` con el idioma en inglés
- **THEN** se lee "working assumption, not granted"

### Requirement: Término legal del loteo de Norte
El catálogo legal SHALL incluir el término `loteonorte`, marcado como borrador y con versión en inglés, que diga en palabras simples que la venta es simulada, que no hay aprobación, que no es una oferta y que no se cobra nada.

#### Scenario: Abrir el ⚖
- **WHEN** la persona abre el ⚖ del estado de `lighthouse-norte`
- **THEN** ve "Loteo provisorio de Lighthouse VRN", el texto y "Borrador: texto a revisar"
