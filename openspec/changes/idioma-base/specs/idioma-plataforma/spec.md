# Spec Delta

## Purpose

Base para que toda la plataforma funcione en español (voseo) e inglés: cómo se elige y se recuerda el idioma, cómo se enlaza directo al inglés, cómo convive con `/congreso/en`, qué pasa cuando falta una traducción y cómo se detectan los textos sin traducir.

## ADDED Requirements

### Requirement: Elegir el idioma
The platform SHALL offer Spanish and English. Choosing a language in the top bar selector or in Configuración SHALL change every page to that language without changing the page address, with or without a session.

#### Scenario: Cambiar a inglés sin cuenta
- **WHEN** una persona sin sesión está en `/tribus` y elige "EN" en la barra superior
- **THEN** sigue en `/tribus` y el rail, la barra superior y el pie están en inglés

#### Scenario: Selector con teclado
- **WHEN** la persona llega con Tab al selector y aprieta Enter sobre "EN"
- **THEN** la plataforma pasa a inglés y "EN" queda marcado como actual con algo más que el color

### Requirement: Idioma inicial según el navegador
When neither the browser nor the person has chosen a language, the platform SHALL use the browser's preferred language (the one with the highest weight in `Accept-Language`): Spanish for any Spanish variant, English for any English variant, and English for any other language or a missing header. A chosen language (link parameter, browser cookie or the person's saved preference) MUST always win over the detected one, and the detected language MUST NOT be saved as a choice.

#### Scenario: Navegador en inglés
- **WHEN** una persona sin idioma elegido abre la portada con el navegador en `en-US`
- **THEN** la plataforma se ve en inglés y no queda ninguna cookie de idioma guardada

#### Scenario: Navegador en otro idioma
- **WHEN** una persona sin idioma elegido abre la portada con el navegador en `pt-BR`
- **THEN** la plataforma se ve en inglés

#### Scenario: Navegador en español de España
- **WHEN** una persona sin idioma elegido abre la portada con el navegador en `es-ES`
- **THEN** la plataforma se ve en español

#### Scenario: Lo elegido gana
- **WHEN** una persona con el navegador en `en-US` eligió "ES" y vuelve a abrir la plataforma
- **THEN** la plataforma se ve en español

### Requirement: Recordar el idioma
The chosen language SHALL be remembered in the browser, with or without a session, and SHALL also be saved in the person's preferences when there is a session and a consent in force. When a person enters and the browser has no language chosen, their saved preference SHALL be used; when the browser already has a choice, that choice SHALL win and be saved as the person's preference. While the person's preferences live in the browser, the saved preference is only available in that browser; this is enough for the prototype until the preferences move to the database.

#### Scenario: Recargar
- **WHEN** la persona eligió inglés y recarga la página
- **THEN** la página sigue en inglés

#### Scenario: Navegador sin idioma elegido
- **WHEN** una persona que eligió inglés con su cuenta borra la cookie de idioma del navegador, que está en español, y vuelve a entrar
- **THEN** la plataforma pasa a inglés al terminar de entrar

#### Scenario: Borrar todo
- **WHEN** la persona usa "Borrar todo" en Configuración
- **THEN** su preferencia de idioma guardada se borra junto con el resto de sus preferencias
- **AND** la pantalla sigue en el idioma elegido en el navegador

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

#### Scenario: Término legal en una página sin traducir
- **WHEN** la plataforma está en inglés y una página sin traducir muestra un ⚖
- **THEN** el ⚖ se ve en español, como el resto del contenido de la página
- **AND** la bitácora lo anota con idioma español

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

### Requirement: Glosario de la plataforma
Platform terms SHALL have a single English rendering taken from one glossary. "Semillas" MUST NOT be translated: in English it SHALL read "Semillas", and the first mention in the content of an English page SHALL read "Semillas (seeds)".

#### Scenario: Semillas en el rail
- **WHEN** la plataforma está en inglés
- **THEN** el rail muestra "Semillas" y no "Seeds"

### Requirement: Textos de ejemplo traducidos con su idioma original
Sample texts written for or by communities (manifestos, tribe declarations, Fogón decisions, sample market offers) SHALL be translated like other sample data and, when shown in a language other than the original, SHALL show a visible note with the original language ("Translated from Spanish" / "Traducido del inglés"). Text typed by a person MUST NOT be automatically translated.

#### Scenario: Texto traducido del español
- **WHEN** la plataforma está en inglés y se muestra un texto de ejemplo escrito originalmente en español que tiene traducción
- **THEN** se lee en inglés con la nota visible "Translated from Spanish"

#### Scenario: Texto de la persona
- **WHEN** la plataforma está en inglés y se muestra un texto que escribió una persona en español
- **THEN** se ve tal cual lo escribió, marcado como español, sin traducir

### Requirement: Revisión nativa pendiente
Every English dictionary and every source of sample data or legal text with English SHALL be listed with its native-speaker review status (pending or reviewed); a test MUST fail when a dictionary is not listed, and a command SHALL generate the list of pending sources in a versioned file.

#### Scenario: Diccionario sin anotar
- **WHEN** alguien suma un diccionario de una zona y no lo anota en la lista de revisión nativa
- **THEN** `pnpm test` falla nombrando el diccionario

#### Scenario: Lista de pendientes
- **WHEN** Gus corre `pnpm idioma:pendientes`
- **THEN** `docs/idioma/revisar-nativo.md` lista todas las fuentes en inglés que todavía no revisó un hablante nativo

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
