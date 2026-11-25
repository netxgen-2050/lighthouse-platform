## ADDED Requirements

### Requirement: Dos pestañas en Tribus
The page `/tribus` SHALL show two tabs as links: "Equipos · ahora" (default, `/tribus`) and "Tribus · visión" (`/tribus?ver=tribus`). The current tab MUST be marked with `aria-current="page"` and with a visible difference that does not rely only on color (weight or underline). Any other value of `ver` MUST show the default tab.

#### Scenario: Pestaña por defecto
- **WHEN** una persona abre `/tribus`
- **THEN** ve la pestaña "Equipos · ahora" marcada como actual y la lista de equipos

#### Scenario: Cambiar con el teclado
- **WHEN** la persona llega con Tab a "Tribus · visión" y aprieta Enter
- **THEN** la URL es `/tribus?ver=tribus` y ve el listado de las tribus

### Requirement: Pestaña Equipos
The "Equipos · ahora" tab SHALL explain what a team is, using the sketch text. It SHALL show one card per circle of the commons, first those with fronts in the current phase. Each card shows:
- the team name and what it decides;
- its fronts, each with its need, who is missing, the date, and its place ("En el mapa del Lighthouse (ilustrativo)" or "Sin lugar en el mapa");
- fronts of a later phase, labeled "Más adelante · fase N" and without the join button;
- the join control ("Quiero sumarme").

A team without fronts SHALL say "Sin frentes abiertos por ahora". The tab MUST state "Un equipo puede volverse una tribu más adelante; el proceso está por definir" and MUST mark the data as sample.

#### Scenario: Equipo con frentes
- **WHEN** una persona mira la pestaña Equipos
- **THEN** la tarjeta de Agua muestra el frente "Agua y cuenca" con lo que falta y para cuándo

#### Scenario: Frente sin lugar
- **WHEN** una persona mira la tarjeta de Legal
- **THEN** el frente "Papeles y fideicomiso" dice "Sin lugar en el mapa"

#### Scenario: Frente de una fase futura
- **WHEN** una persona mira la tarjeta de Gestión de contratistas
- **THEN** "Primer obrador" aparece como "Más adelante · fase 1"

### Requirement: Tribus como visión
The "Tribus · visión" tab SHALL show the current list of tribes (active, forming, vacant, and "Proponer una comunidad") without removing any tribe. At the top it MUST show the notice "Ejemplo, a definir: estas tribus son ejemplos para pensar hacia dónde va el Lighthouse, no tribus reales". Each tribe card and the header of `/tribus/<id>` MUST show the label "Ejemplo · a definir" in text.

#### Scenario: Las 12 tribus siguen
- **WHEN** una persona abre `/tribus?ver=tribus`
- **THEN** ve las 12 tribus de ejemplo, cada una con la marca "Ejemplo · a definir"

#### Scenario: Ficha de una tribu
- **WHEN** una persona abre `/tribus/valle`
- **THEN** ve la marca "Ejemplo · a definir" junto al nombre

### Requirement: Calidad de la sección
The section SHALL be available in Spanish and English, keep the prototype notice, use only theme tokens, have a single `<main>`, pass the axe audit on both tabs, and have no horizontal scroll at 390 px wide.

#### Scenario: Celular en inglés
- **WHEN** la página se ve en inglés con 390 × 844 px
- **THEN** las pestañas y las tarjetas de equipos están en inglés y no hay scroll horizontal
