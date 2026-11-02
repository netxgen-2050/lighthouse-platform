# Spec Delta

## MODIFIED Requirements

### Requirement: Selector de vistas del mapa
The page `/territorios/lighthouse` SHALL show above the map a group of buttons named "Vista del mapa" with four views, in this order: "Lotes · sector norte", "Ahora · frentes de trabajo", "Plan · zonas" and "Visión · tribus por barrio". The selected view MUST be marked with `aria-pressed="true"` and with a visible difference that does not rely only on color. "Lotes" MUST be the default. Changing the view MUST NOT navigate away from the page. It MUST clear the selection and write `?vista=<id>` to the URL without adding a history entry. Opening the page with `?vista=ahora`, `?vista=plan` or `?vista=vision` MUST open that view, and any other value MUST open "Lotes". The views MUST come from a typed registry, so that adding a view means adding one entry (name, layers, legend, list and panel).

#### Scenario: Vista por defecto
- **WHEN** una persona abre `/territorios/lighthouse`
- **THEN** la vista "Lotes · sector norte" está marcada y el mapa muestra los lotes, no los barrios

#### Scenario: Enlace compartible
- **WHEN** una persona abre `/territorios/lighthouse?vista=vision`
- **THEN** la vista "Visión · tribus por barrio" está marcada y el mapa muestra los 12 barrios con sus tribus

#### Scenario: Ahora por enlace
- **WHEN** una persona abre `/territorios/lighthouse?vista=ahora`
- **THEN** la vista "Ahora · frentes de trabajo" está marcada y el mapa muestra los frentes

#### Scenario: Vista desconocida
- **WHEN** una persona abre `/territorios/lighthouse?vista=red`
- **THEN** ve la vista "Lotes"

#### Scenario: Enlace viejo a un barrio
- **WHEN** una persona abre `/territorios/lighthouse?sel=barrio-6` sin `vista`
- **THEN** se abre la vista Visión con el barrio 6 elegido

#### Scenario: Enlace viejo a un frente
- **WHEN** una persona abre `/territorios/lighthouse?sel=agua-cuenca` sin `vista`
- **THEN** se abre la vista Ahora con "Agua y cuenca" elegido

### Requirement: Línea de tiempo por fases
The page SHALL show an "Etapa" control with the three phases of the Lighthouse. The current phase MUST be selected by default and labeled "hoy" in text. The phase MUST be operable with the keyboard and written to the URL (`?fase=0|1|2`), and an invalid value MUST fall back to the current phase. What each view shows MUST depend on the phase:
- **Lotes** states "Este loteo todavía no dice qué se vende en cada fase (sin dato)".
- **Ahora** draws only the fronts in force in that phase.
- **Plan** states "Este plan todavía no dice qué se hace en cada fase (sin dato)".
- **Visión** shows a text for the phase.

Elements MUST be filtered by phase through the single function `vigenteEn`.

#### Scenario: Pasar a la fase 1
- **WHEN** la persona elige la fase 1 con el teclado en la vista Ahora
- **THEN** el mapa y la lista muestran también "Primer obrador" y "Parque agrovoltaico"
- **AND** la URL tiene `fase=1`

#### Scenario: Fase de hoy
- **WHEN** la persona abre la página sin `fase`
- **THEN** la fase 0 está elegida y su opción dice "hoy"

#### Scenario: Fase en la vista Lotes
- **WHEN** la persona mira la Etapa en la vista Lotes
- **THEN** lee "Este loteo todavía no dice qué se vende en cada fase (sin dato)"

### Requirement: Soluna en todas las vistas
The Chacras de Soluna outline, its fincas and the "Fincas disponibles" list SHALL stay visible and selectable in all four views, with the same panel and simulated consultation as today. Soluna fincas MUST NOT offer reserving or buying in any view.

#### Scenario: Finca en la vista Ahora
- **WHEN** la persona, en la vista Ahora, elige la finca 502
- **THEN** ve "Finca 502" y el botón "Consultar por este lote"

#### Scenario: Finca en la vista Lotes
- **WHEN** la persona, en la vista Lotes, elige la finca 502
- **THEN** ve "Finca 502" y el botón "Consultar por este lote", y ningún botón para reservar o comprar

### Requirement: Accesibilidad y calidad de las vistas
In every view:
- the map container MUST have an accessible name stating the view and the phase;
- the legend MUST name every symbol in text;
- fronts in force and later fronts MUST differ by border shape (solid or dashed) and text, not only by color;
- lot statuses MUST differ by border shape and text, not only by color;
- every selectable element MUST be reachable from a keyboard list.

The page SHALL be bilingual (es/en), keep the prototype notice, use only theme tokens, pass the axe audit in all four views and have no horizontal scroll at 390 px wide.

#### Scenario: Celular
- **WHEN** la página se ve con 390 × 844 px en la vista Ahora
- **THEN** el selector de vistas y la etapa se acomodan en el ancho, la ficha queda debajo del mapa y no hay scroll horizontal

#### Scenario: Inglés
- **WHEN** la persona cambia a inglés en la vista Ahora
- **THEN** el selector, la etapa, la leyenda y los frentes se leen en inglés
