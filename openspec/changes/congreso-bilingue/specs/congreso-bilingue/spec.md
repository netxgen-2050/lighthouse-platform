# Spec Delta

## Purpose

Hace bilingüe (español con voseo / inglés) la vitrina del Congreso, para que inversores del exterior y la página de los organizadores puedan usar una versión en inglés, sin traducir el resto de la plataforma.

## ADDED Requirements

### Requirement: Contenido del evento en dos idiomas
Every translatable text of the event content SHALL be stored in Spanish and English. The event access function SHALL take a language (`"es"` or `"en"`, default `"es"`) and return every text already resolved in that language. Proper names, identifiers, URLs, dates, amounts and initials are not translated. The Spanish text MUST never be empty.

#### Scenario: Pedir el evento en inglés
- **WHEN** un test pide el evento de ejemplo en `"en"`
- **THEN** el nombre del primer tipo de entrada y la primera pregunta están en inglés
- **AND** ningún texto del evento resuelto es un objeto con las dos versiones

#### Scenario: Sin idioma, español
- **WHEN** un test pide el evento sin indicar idioma
- **THEN** recibe los textos en español

### Requirement: Caída al español, marcada
When the English version of a text is missing or empty, the access function SHALL return the Spanish text instead, never an empty text, and MUST report the path of every text that fell back. In the English page, each section that contains a fallen-back text MUST show a visible note that part of it is only available in Spanish.

#### Scenario: Falta una traducción
- **WHEN** un test resuelve en `"en"` un evento cuya afiliación de la primera voz no tiene inglés
- **THEN** esa afiliación sale en español
- **AND** la lista de textos sin traducir incluye la ruta de ese texto

#### Scenario: Contenido de ejemplo completo
- **WHEN** un test resuelve el contenido de ejemplo en `"en"`
- **THEN** la lista de textos sin traducir está vacía

### Requirement: Sin texto sin traducir en inglés
The showcase container of the English page SHALL contain no Spanish text except texts explicitly marked: the prototype notice original, legal texts without an English version and fallen-back content, each inside an element with `lang="es"`. Fixed texts of event pieces and NetX pieces MUST come from dictionaries whose English side has every key of the Spanish side, and no English value MUST be identical to its Spanish value unless it is listed as language-neutral (proper names, brands, codes).

#### Scenario: Diccionarios completos
- **WHEN** corren los tests unitarios
- **THEN** cada diccionario en inglés tiene todas las claves del español
- **AND** ningún valor en inglés es igual al español salvo los de la lista de neutros

#### Scenario: Página en inglés sin textos de la interfaz en español
- **WHEN** una persona abre `/congreso/en`
- **THEN** dentro del contenedor con `lang="en"`, y fuera de sus elementos con `lang="es"`, no aparecen "Comprar", "ejemplo", "Por confirmar", "Preguntas" ni "Sumate"

### Requirement: Dos direcciones con las mismas anclas
The system SHALL serve the Spanish showcase at `/congreso` and the English showcase at `/congreso/en`. Both MUST keep the same section anchors (`#inicio`, `#acerca`, `#recorrido`, `#voces`, `#ejes`, `#territorio`, `#tribus`, `#entradas`, `#ticket`, `#faq`), so an external page can link directly to a section of either version. Both pages MUST declare each other as language alternates. `/congreso/en` MUST be a public route, like `/congreso`.

#### Scenario: Enlace directo a entradas en inglés
- **WHEN** una persona sin sesión abre `/congreso/en#entradas`
- **THEN** ve la sección de entradas en inglés, con su título visible bajo las barras

#### Scenario: Rail
- **WHEN** una persona abre `/congreso/en`
- **THEN** el rail muestra "Congreso" como página actual

### Requirement: Selector de idioma
The event bar SHALL show a language selector with two options, "ES" and "EN", visible on every screen width. Each option MUST be a link to the other version that keeps the current anchor, usable with the keyboard, with an accessible name that includes its visible text and the language name. The current language MUST be marked with `aria-current` and by more than color.

#### Scenario: Cambiar a inglés con teclado
- **WHEN** una persona en `/congreso` enfoca "EN" con Tab y aprieta Enter
- **THEN** llega a `/congreso/en`
- **AND** la opción "EN" queda con `aria-current`

#### Scenario: Conserva la sección
- **WHEN** una persona está en `/congreso/en#tribus` y elige "ES"
- **THEN** llega a `/congreso#tribus`

### Requirement: Preferencia de idioma por persona
The system SHALL remember the language chosen with the selector per person (in the browser, under the person's prefix when there is a session, and per browser without a session). Opening `/congreso` with a saved preference for English MUST move the person to `/congreso/en`, keeping the query and the anchor. Opening `/congreso/en` always shows English. Deleting the person's data MUST also delete this preference.

#### Scenario: Se recuerda
- **WHEN** una persona elige "EN" y después abre `/congreso`
- **THEN** termina en `/congreso/en`

#### Scenario: Volver al español
- **WHEN** una persona con preferencia inglés elige "ES"
- **THEN** queda en `/congreso` y al volver a abrir `/congreso` no la lleva al inglés

### Requirement: Idioma declarado
The showcase container SHALL carry `lang="es"` on `/congreso` and `lang="en"` on `/congreso/en`. The NetX frame (rail, top bar, Hifa, report button) MUST keep `lang="es"`.

#### Scenario: lang en inglés
- **WHEN** una persona abre `/congreso/en`
- **THEN** el contenedor de la vitrina tiene `lang="en"` y el documento sigue con `lang="es"`

### Requirement: Piezas de NetX traducidas dentro del Congreso
Inside the showcase, the NetX pieces (prototype strip and origin mode, territory, tribes, ticket steps, ticket registration, Genesis seal, demo dialog and the call to join) SHALL show their texts in the page language. The ticket registration MUST keep its Spanish texts unchanged. Links from the English page to NetX pages that are only in Spanish MUST say so in their text ("in Spanish") and the rest of the platform MUST stay in Spanish.

#### Scenario: Registrar el ticket en inglés
- **WHEN** una persona con sesión registra `LH27-8F3K-2Q` en `/congreso/en`
- **THEN** ve el mensaje de ticket registrado en inglés y el sello Genesis "Pending first check-in"

#### Scenario: Llamado a sumarse en inglés
- **WHEN** una persona sin sesión ve la sección del ticket en `/congreso/en`
- **THEN** ve un enlace en inglés que avisa que el registro está en español y lleva a `/sumarte?volver=%2Fcongreso%2Fen%23ticket&para=explorador`

### Requirement: Términos legales en inglés como borrador
The legal marks (⚖) shown in the English page SHALL show their English title and text from the single legal catalog, always marked as draft ("Draft: text under review"). A legal term without an English version MUST show its Spanish text inside an element with `lang="es"` and a visible note that it is only available in Spanish. The legal exposure log MUST record the language of the text actually shown, and every entry for a text shown in English MUST be marked as draft.

#### Scenario: ⚖ del ticket en inglés
- **WHEN** una persona abre el ⚖ de entradas en `/congreso/en`
- **THEN** ve el título y el texto en inglés y la marca de borrador

#### Scenario: Bitácora con idioma
- **WHEN** una persona abre un ⚖ en `/congreso/en`
- **THEN** la entrada de la bitácora guarda el título mostrado en inglés y el idioma `en`
- **AND** la entrada está marcada como borrador, aunque la versión en español de ese término no lo sea

#### Scenario: ⚖ sin inglés
- **WHEN** una persona con sesión abre en `/congreso/en` un ⚖ que no tiene versión en inglés
- **THEN** ve el texto en español con el aviso de que solo está en español
- **AND** la entrada de la bitácora guarda el idioma `es` y la ruta `/congreso/en`

### Requirement: Aviso de prototipo en los dos idiomas
The English page SHALL show "Internal prototype · sample data" together with the original "Prototipo interno · datos de ejemplo" marked as Spanish.

#### Scenario: Aviso en inglés
- **WHEN** una persona abre `/congreso/en`
- **THEN** ve "Internal prototype · sample data" y "Prototipo interno · datos de ejemplo"

### Requirement: Mismo comportamiento en inglés
The English page SHALL behave like the Spanish one: open without an account, store the visit origin from UTM parameters with the same logic, require an account to link the ticket, keep the demo-only purchase, and pass the axe audit (no serious or critical violations) with the origin mode on, with the dialog open and in the NetX dark theme.

#### Scenario: Origen en inglés
- **WHEN** una persona sin origen guardado abre `/congreso/en?utm_source=pagina-oficial`
- **THEN** el origen guardado tiene fuente "pagina-oficial"

#### Scenario: Auditoría en los dos idiomas
- **WHEN** corre la auditoría de axe en `/congreso` y en `/congreso/en`
- **THEN** no hay violaciones serias ni críticas en ninguna
