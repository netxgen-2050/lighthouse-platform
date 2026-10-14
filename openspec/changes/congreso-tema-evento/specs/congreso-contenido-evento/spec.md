# Spec Delta

## Purpose

Define el contenido del evento del Congreso (ficha, recorrido, voces, ejes, entradas, preguntas y enlaces) como datos tipados de ejemplo en un solo lugar, leídos por una única función de acceso que después puede alimentar una integración externa.

## ADDED Requirements

### Requirement: Una sola fuente del contenido del evento
The system SHALL read all event content shown by the Congreso pages through a single access function (`obtenerEvento()`). No page or component MUST import the example content file directly.

#### Scenario: Las pantallas leen por la función de acceso
- **WHEN** corren los tests unitarios
- **THEN** ningún archivo de `app/` ni de `components/` importa el archivo de contenido de ejemplo del evento
- **AND** la función de acceso devuelve el evento completo con el contenido de ejemplo

### Requirement: El contenido es de ejemplo y lo dice
The system SHALL mark the event content as example data (`esEjemplo: true`) at event level. The content MUST include: name, tagline, dates (start and end), the key moment (eclipse) with date, time and UTC offset, place, figures, the meeting text, four stops, voices, eight themes, six ticket types, questions, closing texts and the conveners.

#### Scenario: Forma completa del contenido de ejemplo
- **WHEN** un test pide el evento a la función de acceso
- **THEN** el evento tiene `esEjemplo: true`
- **AND** tiene 4 paradas en orden cronológico, de las cuales exactamente una está destacada (el día del eclipse)
- **AND** tiene 8 ejes, 6 tipos de entrada y al menos 4 preguntas
- **AND** el momento clave es `2027-02-06T12:00:00-03:00`

### Requirement: Precios opcionales, nunca cero
Each ticket type SHALL have an optional price (amount and currency, optional unit such as "c/u") and an `esEjemplo` flag. A price, when present, MUST be greater than zero. A missing price MUST be shown as "Precio sin dato", never as 0.

#### Scenario: Ningún precio es cero
- **WHEN** un test recorre los tipos de entrada del contenido de ejemplo
- **THEN** todo precio presente es mayor que 0
- **AND** todo tipo de entrada del contenido de ejemplo tiene `esEjemplo: true`

#### Scenario: Tipo de entrada sin precio
- **WHEN** un tipo de entrada no trae precio
- **THEN** su texto de precio es "Precio sin dato"

### Requirement: Toda voz tiene estado
Each voice SHALL have a state `confirmada` or `por-confirmar`, a name, an affiliation and initials. Voices are split into main voices and regional voices. No voice MUST carry a photo.

#### Scenario: Estado presente
- **WHEN** un test recorre las voces del contenido de ejemplo
- **THEN** cada voz tiene estado `confirmada` o `por-confirmar`
- **AND** todas las voces del contenido de ejemplo están `por-confirmar`

### Requirement: Enlace opcional a la página oficial del evento
The event content SHALL support an optional link to the official event page (URL, label and `esEjemplo` flag). The example content MUST include it as a placeholder with `esEjemplo: true`.

#### Scenario: Enlace de ejemplo
- **WHEN** un test pide el evento de ejemplo
- **THEN** trae el enlace a la página oficial con `esEjemplo: true`

#### Scenario: Sin enlace
- **WHEN** un evento no trae el enlace a la página oficial
- **THEN** el tipo lo permite y la función de acceso devuelve el evento sin ese campo

### Requirement: Sin red ni credenciales
The access function SHALL return the content from the repository, without network requests, environment variables or credentials.

#### Scenario: Funciona sin red
- **WHEN** corren los tests unitarios sin red
- **THEN** la función de acceso devuelve el evento
