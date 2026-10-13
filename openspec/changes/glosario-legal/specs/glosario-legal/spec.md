## ADDED Requirements

### Requirement: Glosario generado desde los catálogos
The system SHALL serve a page at `/glosario` that lists every entry of `TERMINOS` (`lib/legal/terminos.ts`) under the heading "Términos legales ⚖" and every entry of `TERMINOS_ECONOMICOS` (`lib/economia/terminos.ts`) under the heading "Términos económicos". Each entry SHALL show its title and its full text exactly as in the catalog, and SHALL have the element id equal to its catalog key. Entries within each section SHALL be sorted alphabetically by title (Spanish collation). The page MUST NOT contain legal text that is not in one of the two catalogs.

#### Scenario: Están todos los términos
- **WHEN** se carga `/glosario`
- **THEN** la cantidad de términos en "Términos legales ⚖" es igual a la cantidad de claves de `TERMINOS` y la de "Términos económicos" es igual a la de `TERMINOS_ECONOMICOS`

#### Scenario: Enlace directo a un término
- **WHEN** una persona abre `/glosario#pasefundador`
- **THEN** la página se desplaza al término "Pase Fundador" y su texto es el mismo que muestra el ⚖ `pasefundador`

#### Scenario: Orden alfabético
- **WHEN** se leen los títulos de "Términos legales ⚖" en orden
- **THEN** están ordenados alfabéticamente

### Requirement: Borradores marcados con texto
Every entry whose catalog item has `borrador: true` SHALL show the written label "Borrador: a revisar" next to its title; entries without that flag MUST NOT show it. Above the lists the page SHALL show "N de M textos son borrador", where N is the number of drafts and M the total number of entries in both catalogs. The label MUST NOT rely on color alone.

#### Scenario: Un término borrador
- **WHEN** se mira el término de clave `kyc`
- **THEN** muestra "Borrador: a revisar"

#### Scenario: Un término del mock-up
- **WHEN** se mira el término de clave `ritual`
- **THEN** no muestra "Borrador: a revisar"

#### Scenario: Contador
- **WHEN** se carga `/glosario`
- **THEN** el contador coincide con la cantidad de entradas con `borrador: true` en los dos catálogos y con el total de entradas

### Requirement: Filtro de borradores
The page SHALL offer a switch "Mostrar solo borradores", operable with the keyboard, whose state is exposed to assistive technology (`aria-pressed` or a checkbox). When on, only draft entries SHALL be listed, and the URL SHALL carry `?borradores=1`; opening `/glosario?borradores=1` SHALL start with the filter on. When a section has no drafts it SHALL show "Sin borradores en esta sección."

#### Scenario: Activar el filtro
- **WHEN** una persona activa "Mostrar solo borradores" con el teclado
- **THEN** solo se ven términos con "Borrador: a revisar" y la URL tiene `?borradores=1`

#### Scenario: Abrir el enlace filtrado
- **WHEN** alguien abre `/glosario?borradores=1`
- **THEN** el filtro está activo desde el principio

### Requirement: Acceso y marco
`/glosario` SHALL be viewable without a session (listed in `RUTAS_PUBLICAS`). The footer of every page SHALL include a link "Glosario" to `/glosario`. The page SHALL show the prototype notice, use only theme tokens, contain exactly one `<main>` (the layout's), and pass the axe audit.

#### Scenario: Sin sesión
- **WHEN** una persona sin sesión abre `/glosario`
- **THEN** ve el glosario, sin pantalla de entrada ni redirección

#### Scenario: Enlace en el pie
- **WHEN** una persona está en `/tribus` y sigue el enlace "Glosario" del pie
- **THEN** llega a `/glosario`

#### Scenario: Accesibilidad
- **WHEN** se corre la auditoría de axe sobre `/glosario`
- **THEN** no hay violaciones
