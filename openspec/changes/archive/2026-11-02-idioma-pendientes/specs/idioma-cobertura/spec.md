## Purpose

Que las pantallas que quedaron fuera de las zonas de idioma (consultas del Fogón y cambios a un pacto) se vean en inglés, y que toda pantalla nueva nazca bilingüe para que no vuelvan a quedar huecos.

## ADDED Requirements

### Requirement: Consultas del Fogón en inglés
The system SHALL show `/fogon/consultas` and `/fogon/consultas/[id]` in English when the platform language is English: list, filters, states, voting controls, voter roll, open or secret vote notice, closing, results per group, the donut chart's accessible name and legend, and reading errors. Example consultation titles and descriptions SHALL be bilingual with Spanish as original and show "Translated from Spanish" in English. Text written by a person MUST NOT be translated and MUST carry `lang="es"` when the interface is in English. Both routes SHALL be in the list of translated pages.

#### Scenario: Lista en inglés
- **WHEN** una persona con la plataforma en inglés abre `/fogon/consultas`
- **THEN** los estados, filtros y botones están en inglés y no aparece el aviso "This page is only available in Spanish for now."

#### Scenario: Resultado en inglés
- **WHEN** abre una consulta cerrada en inglés
- **THEN** el resultado por grupo y la dona tienen nombre accesible y leyenda en inglés, con números en formato `en-US`

#### Scenario: Consulta de ejemplo
- **WHEN** ve una consulta de ejemplo en inglés
- **THEN** lee el título en inglés con la nota "Translated from Spanish"

### Requirement: Cambios a un pacto en inglés
The system SHALL show in English, when the platform language is English, every text of pact withdrawal and change proposals: withdraw, propose a change, change draft, current version, history, acceptance and rejection notices (including the screen-reader announcements), and the inbox events they generate, built from type and data at display time.

#### Scenario: Cambio rechazado
- **WHEN** quien administra la comunidad no acepta un cambio propuesto y la plataforma está en inglés
- **THEN** la persona ve y escucha un aviso en inglés que dice que sigue vigente la versión anterior, con su número

#### Scenario: Historial
- **WHEN** abre el historial de un pacto en inglés
- **THEN** las etiquetas de versión, fecha y estado están en inglés y las fechas en formato `en-US`

### Requirement: Toda pantalla nueva nace bilingüe
Every change that adds or modifies interface text SHALL add that text to the typed dictionaries in Spanish and English in the same change, and every new navigable route SHALL be added to the list of translated pages in the same change, unless the change declares it internal. A change that does not comply MUST NOT be merged.

#### Scenario: Ruta nueva sin traducir
- **WHEN** un cambio suma una página nueva al rail y no la agrega a la lista de traducidas ni la declara interna
- **THEN** el test de cobertura de rutas falla

#### Scenario: Texto nuevo sin inglés
- **WHEN** un cambio suma una clave de texto solo en español
- **THEN** la verificación de tipos falla porque el diccionario en inglés está incompleto
