# Spec Delta

## Purpose

Base para que toda la plataforma funcione en español (voseo) e inglés: cómo se elige y se recuerda el idioma, cómo se enlaza directo al inglés, cómo convive con `/congreso/en`, qué pasa cuando falta una traducción y cómo se detectan los textos sin traducir.

## ADDED Requirements

### Requirement: Elegir el idioma
The platform SHALL offer Spanish (default) and English. Choosing a language in the top bar selector or in Configuración SHALL change every page to that language without changing the page address, with or without a session.

#### Scenario: Cambiar a inglés sin cuenta
- **WHEN** una persona sin sesión está en `/tribus` y elige "EN" en la barra superior
- **THEN** sigue en `/tribus` y el rail, la barra superior y el pie están en inglés

#### Scenario: Selector con teclado
- **WHEN** la persona llega con Tab al selector y aprieta Enter sobre "EN"
- **THEN** la plataforma pasa a inglés y "EN" queda marcado como actual con algo más que el color

### Requirement: Recordar el idioma
The chosen language SHALL be remembered in the browser, with or without a session, and SHALL also be saved in the person's preferences when there is a session. When a person enters in a browser with no language chosen, their saved preference SHALL be used; when the browser already has a choice, that choice SHALL win and be saved as the person's preference.

#### Scenario: Recargar
- **WHEN** la persona eligió inglés y recarga la página
- **THEN** la página sigue en inglés

#### Scenario: Otro navegador
- **WHEN** una persona que eligió inglés con su cuenta entra desde un navegador sin idioma elegido
- **THEN** la plataforma pasa a inglés al terminar de entrar

#### Scenario: Borrar todo
- **WHEN** la persona usa "Borrar todo" en Configuración
- **THEN** su preferencia de idioma guardada se borra junto con el resto de sus preferencias

### Requirement: Enlace directo a un idioma
Any page address with the `lang` parameter set to `en` or `es` SHALL set that language and redirect to the same address without the parameter, keeping the other parameters and the anchor. Any other value MUST be dropped without changing the language.

#### Scenario: Enlace a Sumarte en inglés
- **WHEN** alguien sin idioma elegido abre `/sumarte?lang=en&utm_source=mail#planes`
- **THEN** termina en `/sumarte?utm_source=mail#planes` con la plataforma en inglés

#### Scenario: Valor desconocido
- **WHEN** alguien abre `/tribus?lang=fr`
- **THEN** termina en `/tribus` y el idioma no cambia

### Requirement: Convivencia con la dirección del Congreso
`/congreso/en` SHALL keep working as the permanent public address of the Congress in English and always show English. With English chosen, opening `/congreso` SHALL lead to `/congreso/en` keeping parameters and anchor. Choosing a language in the Congress selector SHALL set the platform language.

#### Scenario: Preferencia inglés y Congreso
- **WHEN** una persona con inglés elegido abre `/congreso?utm_source=x#entradas`
- **THEN** termina en `/congreso/en?utm_source=x#entradas` sin ver antes la versión en español

#### Scenario: Dirección explícita
- **WHEN** una persona con español elegido abre `/congreso/en`
- **THEN** ve el Congreso en inglés y su idioma elegido no cambia

#### Scenario: Selector del Congreso
- **WHEN** en `/congreso` elige "EN" en el selector del evento y después abre `/tribus`
- **THEN** `/tribus` se ve con el marco en inglés

### Requirement: Atributo de idioma
The document language attribute SHALL match the platform language, and every Spanish text shown inside an English page SHALL be marked as Spanish for assistive technology.

#### Scenario: Inglés
- **WHEN** la plataforma está en inglés
- **THEN** `<html>` tiene `lang="en"` y el aviso de una página sin traducir y su contenido tienen `lang="es"`

### Requirement: Textos de interfaz completos en los dos idiomas
Every interface text of a translated area SHALL exist in Spanish (with voseo) and English; a missing English text MUST make the type check fail, and no interface text MAY be empty in either language.

#### Scenario: Falta una clave
- **WHEN** alguien suma una clave al diccionario en español y no al inglés
- **THEN** `pnpm verificar` falla

### Requirement: Caída al español marcada
When an English text of sample data is missing, the platform SHALL show the Spanish text marked as Spanish with a visible "ES" mark, never an empty text. A page not yet translated SHALL show, in English, a visible notice that it is only available in Spanish, and its content marked as Spanish.

#### Scenario: Dato sin inglés
- **WHEN** un dato de ejemplo traducible no tiene inglés y la plataforma está en inglés
- **THEN** se ve el texto en español con la marca "ES" y su nombre accesible dice que solo está en español

#### Scenario: Página sin traducir
- **WHEN** la plataforma está en inglés y la persona abre una página que todavía no se tradujo
- **THEN** ve arriba "This page is only available in Spanish for now." y el contenido en español con `lang="es"`

### Requirement: Fechas, números y montos según idioma
Dates, numbers and amounts SHALL be formatted for the platform language (Spanish for Argentina, English for the United States), and a missing value SHALL read "sin dato" or "no data", never zero.

#### Scenario: Monto en inglés
- **WHEN** la plataforma está en inglés y se muestra un monto de 1200 dólares
- **THEN** se lee "USD 1,200"

#### Scenario: Fecha en español
- **WHEN** la plataforma está en español y se muestra el 15 de octubre de 2026
- **THEN** se lee "15 de octubre de 2026"

#### Scenario: Sin dato
- **WHEN** la plataforma está en inglés y un monto no tiene valor
- **THEN** se lee "no data"

### Requirement: Marco de la plataforma en inglés
In English, the rail and its group titles, the top bar, the avatar menu, the bell, the footer, the prototype notice, the skip link, the not-found page, the session gate screens and the browser tab title SHALL be in English. The prototype notice SHALL read "Internal prototype · sample data".

#### Scenario: Rail en inglés
- **WHEN** la plataforma está en inglés
- **THEN** el rail muestra "Discover", "Home", "Territory" y "Tribes"

### Requirement: Nombres propios sin traducir
Proper names (people, tribes, neighborhoods, territories, places, organizations, the event and the assistant) MUST NOT be translated and SHALL be marked so that the untranslated-text check ignores them.

#### Scenario: Nombre de tribu
- **WHEN** la plataforma está en inglés y se muestra "Valle Solar"
- **THEN** se lee "Valle Solar"

### Requirement: Detección de textos sin traducir
Automated tests SHALL fail when an English interface text equals its Spanish text (outside a list of neutral words), when an English text contains Spanish marks, when a Spanish text uses tuteo, or when a translated page in English shows Spanish words outside elements marked as Spanish or as proper names.

#### Scenario: Copia sin traducir
- **WHEN** un diccionario tiene en inglés "Cargando…" igual que en español
- **THEN** el test de diccionarios falla nombrando la clave

#### Scenario: Página traducida con un texto en español
- **WHEN** una página de la lista de traducidas muestra "Elegí un plan" en inglés fuera de `lang="es"`
- **THEN** el e2e de idioma falla nombrando la página y el texto
