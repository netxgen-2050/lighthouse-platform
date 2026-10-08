## ADDED Requirements

### Requirement: Tres secciones
The system SHALL group `/tribus` into "Tribus activas", "En formación" and "Barrios vacantes", each with a heading and a one-line explanation, built from the data.

#### Scenario: Secciones
- **WHEN** una persona abre `/tribus`
- **THEN** ve las tres secciones con 3, 5 y 4 elementos según los datos de ejemplo

### Requirement: Tarjetas distintas
Active cards SHALL show households and common-pool contribution; in-formation cards SHALL show their stage and the roles they are looking for; vacant cards SHALL show what the barrio needs and a "Proponer una comunidad" button.

#### Scenario: Tarjeta en formación
- **WHEN** una persona mira la tarjeta de Monte Nuevo
- **THEN** ve su etapa y los roles que busca, y no ve lo que aporta al pozo común

### Requirement: Aviso en formación
The page of an in-formation tribe SHALL show that it does not yet have a signed commitment with the Lighthouse.

#### Scenario: Aviso
- **WHEN** una persona abre `/tribus/monte`
- **THEN** ve el aviso de que está en formación
