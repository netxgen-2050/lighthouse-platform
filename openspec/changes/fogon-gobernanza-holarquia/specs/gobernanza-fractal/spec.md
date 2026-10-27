## MODIFIED Requirements

### Requirement: Estructura de gobernanza visible
The system SHALL show at `/fogon/gobernanza` the governance structure as a holarchy of nested circles: Lighthouse (el común) as the outer circle; inside it, the común's own example circles, the council of tribes with one seat per tribe validated by the común, the transversal circles and the 12 tribes of the territory with their state; inside each active or forming tribe, its example circles; inside each circle, its roles. Tribes that look for a tribe MUST show a "Lugar libre" and no circles. Every example person, circle and role MUST be marked as example data.

#### Scenario: Ver la estructura
- **WHEN** una persona abre `/fogon/gobernanza`
- **THEN** ve el común con sus círculos (entre ellos "Agua del Lighthouse" y "Tokenomics y Semillas"), el "Consejo de tribus" y las 12 tribus con su estado en texto

#### Scenario: Tribu que busca tribu
- **WHEN** la persona entra a "Barrio 3"
- **THEN** la ve como "Busca tribu", con "Lugar libre", sin círculos y sin lugar en el consejo

#### Scenario: Consejo
- **WHEN** la persona entra al "Consejo de tribus"
- **THEN** ve un lugar por cada tribu validada por el común, cada uno con "Sin representante elegido", y ningún nombre inventado en esos lugares

### Requirement: Gráfico accesible
The holarchy SHALL be available both as a drawing with an accessible name and as an equivalent nested list (tree) navigable with keyboard and screen reader. The list MUST let the person zoom into any circle, like the drawing does. Nothing in the drawing MUST be communicated only by color. At 390 px wide the page MUST NOT scroll horizontally, with the drawing above and the detail panel below. With `prefers-reduced-motion: reduce`, zoom changes MUST happen without animation.

#### Scenario: Lector de pantalla
- **WHEN** una persona recorre `/fogon/gobernanza` con lector de pantalla
- **THEN** encuentra el dibujo con un nombre que dice qué muestra y la lista anidada común → círculos del común, consejo, tribus → círculos, con el estado de cada tribu en texto

#### Scenario: Zoom desde la lista
- **WHEN** la persona, solo con teclado, elige "Valle Solar" en la lista
- **THEN** el dibujo hace zoom a Valle Solar, las migas dicen "Lighthouse › Valle Solar" y el panel muestra Valle Solar

#### Scenario: Celular
- **WHEN** la persona abre la página en una pantalla de 390 px
- **THEN** no hay scroll horizontal, el dibujo queda arriba y el panel de detalle abajo

#### Scenario: Sin movimiento
- **WHEN** el sistema pide movimiento reducido y la persona entra a un círculo
- **THEN** la vista cambia de una vez, sin animación

### Requirement: Prototipo
The page SHALL show the prototype notice and the notice that the structure and its people are example data, use only theme tokens, have a single `<main>` (from the layout), keep the report button, take its texts from the es/en dictionaries, and pass the axe audit in every lens.

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre `/fogon/gobernanza` con cada una de las cuatro lentes
- **THEN** no hay violaciones serias ni críticas

#### Scenario: En inglés
- **WHEN** una persona abre `/fogon/gobernanza?lang=en`
- **THEN** las lentes, las migas, el panel y la leyenda salen en inglés

## ADDED Requirements

### Requirement: Zoom por niveles
Selecting a circle that contains other circles SHALL zoom into it; selecting the background or a breadcrumb SHALL zoom out to that level. The breadcrumbs MUST always show the path from the común to the current level and mark the current one. The same pattern MUST apply at every scale.

#### Scenario: Entrar y salir
- **WHEN** la persona toca "Valle Solar" en el dibujo y después toca el fondo
- **THEN** primero ve Valle Solar con sus círculos y después vuelve al común

#### Scenario: Migas
- **WHEN** la persona está en "Cuidado de la tierra" de Valle Solar y elige "Lighthouse" en las migas
- **THEN** vuelve al nivel del común y la miga actual queda marcada como ubicación actual

### Requirement: Panel de detalle
The system SHALL show, for the current or selected level, a detail panel with: its type (común, círculo del común, círculo transversal, círculo de una tribu, tribu, consejo, rol), its purpose, what it decides about ("Decide sobre"), its circles or its roles, and for tribes their state and whether the común validated them. A missing purpose or domain MUST show "sin dato".

#### Scenario: Detalle de un círculo
- **WHEN** la persona entra a "Agua del Lighthouse"
- **THEN** el panel dice "Círculo del común", "Propósito: Agua", lo que decide ("Cuenca y riego", "Cisternas compartidas") y sus roles

#### Scenario: Detalle de una tribu
- **WHEN** la persona entra a "Valle Solar"
- **THEN** el panel dice "Tribu", "Activa", "Validada por el común (ejemplo)", lo que decide y la lista de sus círculos, cada uno navegable

### Requirement: Roles en cada círculo
Each example circle SHALL have roles taken from: Facilita, Enlace hacia arriba, Enlace del nivel de arriba, Memoria, Miembro. Selecting a role MUST show every role that same example person holds, at every level.

#### Scenario: Una persona en varios círculos
- **WHEN** la persona elige un rol cuya persona de ejemplo participa en dos círculos
- **THEN** el panel lista los dos roles con el camino de cada uno (por ejemplo "Lighthouse › Valle Solar › Cuidado de la tierra")

### Requirement: Lentes
The page SHALL offer the lenses Estructura, Propósitos, Decisiones que suben and Desde mí as toggle buttons with `aria-pressed`. Each lens MUST define how the drawing paints the circles, what the panel shows and its legend. Every legend entry MUST pair the color with a text or symbol.

#### Scenario: Cambiar de lente
- **WHEN** la persona elige "Propósitos"
- **THEN** el botón queda presionado, los círculos se pintan por propósito y la leyenda muestra Tierra, Agua, Economía, Comunidad, Conocimiento y Gobierno, cada uno con su texto

### Requirement: Lente Propósitos
In the Propósitos lens, each circle SHALL be painted by its purpose (tierra, agua, economía, comunidad, conocimiento, gobierno) using theme tokens, and the purpose MUST also be available as text (in the panel and in the list), not only as color.

#### Scenario: Propósito sin color
- **WHEN** una persona que no distingue colores usa la lente Propósitos y elige "Banco de semillas"
- **THEN** el panel y la lista dicen "Propósito: Tierra"

### Requirement: Lente Decisiones que suben
In the Decisiones que suben lens, the panel SHALL list example decisions; choosing one MUST mark its path in the drawing with numbered marks in order (for example circle → tribe → council → común, or a derivation from the council to a circle of the común) and MUST show the same path as text. The decision detail MUST show its optional parameters (deadline or closing date, agreement or norm, amount requested and its source) only when they exist; an amount without a figure MUST show "sin dato", never 0.

#### Scenario: Camino que sube
- **WHEN** la persona elige "Pedido de Valle Solar al Fondo Común para la bomba solar"
- **THEN** el dibujo marca 1 Cuidado de la tierra, 2 Valle Solar, 3 Consejo de tribus, 4 Lighthouse, y el panel dice el mismo camino en texto

#### Scenario: Derivación
- **WHEN** la persona elige "Cisterna compartida entre Agua Clara y Valle Solar"
- **THEN** el camino termina en "Agua del Lighthouse" y el panel explica que el consejo la derivó a ese círculo

#### Scenario: Parámetros que existen y que faltan
- **WHEN** la persona elige una decisión con plazo y monto pedido pero sin acuerdo cargado
- **THEN** el panel muestra el plazo, el monto y su fuente, y no muestra una fila de acuerdo

#### Scenario: Se decide abajo
- **WHEN** la persona elige "Calendario de siembra de otoño"
- **THEN** el camino tiene dos pasos dentro de Valle Solar y el panel dice que no hace falta subir

### Requirement: Lente Desde mí
In the Desde mí lens, the drawing SHALL highlight every circle where the person takes part, at several levels at once, and the panel MUST list each of those places with its path, the person's role and what that circle decides about, with a link that zooms to it. The places come from the example roles of the demo person (marked as example) plus what the browser already knows (accepted tribe memberships and the tribe the person leads in Sumarte). The panel MUST include a short text of game ideas (Semillas for facilitating or being a link, a mark for each decision taken to the council) without any mechanics.

#### Scenario: Varios niveles
- **WHEN** la persona usa la lente Desde mí
- **THEN** ve resaltados "Permacultura y suelo" (del común) y "Cuidado de la tierra" (de Valle Solar), con su rol en cada uno y la marca "(ejemplo)"

#### Scenario: Membresía del navegador
- **WHEN** una persona con la membresía de Taller Común aceptada (simulado) usa la lente Desde mí
- **THEN** también ve "Taller Común" con el rol "Miembro"

#### Scenario: Ideas, no juego
- **WHEN** la persona lee el panel de Desde mí
- **THEN** ve las ideas de gamificación como texto, sin puntajes, Semillas ni botones para ganarlas

### Requirement: Lentes extensibles
Lenses SHALL be defined in a single typed registry, where each entry declares its id, its name keys in the dictionaries, how it paints a node, what the panel shows and its legend. Adding a lens MUST only require adding an entry to that registry, without changing the drawing, the list, the breadcrumbs or the other lenses.

#### Scenario: Lente de prueba
- **WHEN** un test suma una lente de ejemplo al registro
- **THEN** el dibujo, la leyenda y el panel la usan sin cambiar ningún otro archivo, y la lente de ejemplo no se ve en la página real
