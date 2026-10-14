# Spec Delta

## Purpose

Que la persona acepte la política de privacidad y los términos del prototipo al darse de alta, con información en capas y casillas separadas, que la plataforma no guarde nada con su identidad hasta que acepte, y que quede constancia demostrable de qué aceptó, cuándo y por qué camino.

## ADDED Requirements

### Requirement: Aceptar al darse de alta en Sumarte
Without a session, any action in Sumarte that leads to creating an account SHALL first show a "Crear tu cuenta" step with the plain-language summary, links to the full policy and terms, and two separate unchecked checkboxes (policy, terms). The login MUST open only after both are checked.

#### Scenario: Elegir un plan sin cuenta
- **WHEN** una persona sin sesión aprieta "Sumarme gratis" en Sumarte
- **THEN** ve el paso "Crear tu cuenta" con el resumen y las dos casillas sin marcar
- **AND** todavía no se abrió el login

#### Scenario: Falta una casilla
- **WHEN** marca solo la casilla de la política y aprieta "Aceptar y crear mi cuenta"
- **THEN** ve un error que dice que tiene que marcar las dos, el foco va a la primera casilla sin marcar y el login no se abre

#### Scenario: Acepta y entra
- **WHEN** marca las dos casillas, aprieta "Aceptar y crear mi cuenta" y termina el login
- **THEN** su consentimiento queda registrado con la versión vigente, la fecha y hora en que marcó las casillas y el camino `alta`
- **AND** no vuelve a ver la pantalla de consentimiento y el plan elegido se aplica

#### Scenario: Cancela el paso
- **WHEN** cierra el paso con "Cancelar" o Escape
- **THEN** vuelve a Sumarte sin sesión, sin nada guardado, con el foco en el botón que había apretado

### Requirement: Aceptación previa con vencimiento
An acceptance given in the "Crear tu cuenta" step SHALL be kept only in the current browser tab, for the same time limit as the plan chosen in Sumarte (5 minutes) and only for the policy version in force; an expired acceptance or one for another version MUST NOT be registered and the consent screen MUST be shown instead. The acceptance SHALL be discarded at the first login in that tab, whether or not it was used, and on logout.

#### Scenario: Vence antes del login
- **WHEN** la persona aceptó en el paso y termina el login 6 minutos después
- **THEN** ve la pantalla de consentimiento con las casillas sin marcar

#### Scenario: Otra pestaña
- **WHEN** acepta en una pestaña y entra desde otra pestaña nueva
- **THEN** en la pestaña nueva ve la pantalla de consentimiento

#### Scenario: La aceptación no queda para otra persona
- **WHEN** una persona que ya tenía su consentimiento vigente pasa por el paso "Crear tu cuenta", entra, sale y otra persona entra en la misma pestaña antes de 5 minutos
- **THEN** la segunda persona ve la pantalla de consentimiento con las casillas sin marcar

### Requirement: Pantalla de consentimiento en cualquier página
A person with a session and without a consent for the policy version in force SHALL see the consent screen on every page, public pages included, except the privacy policy page, until they accept or log out.

#### Scenario: Entrar desde una página pública
- **WHEN** una persona sin consentimiento entra con "Entrar" estando en `/tribus`
- **THEN** en lugar del listado de tribus ve la pantalla de consentimiento

#### Scenario: La política se puede leer
- **WHEN** esa persona abre el enlace "política de privacidad" de la pantalla
- **THEN** `/privacidad` se ve completa, sin la pantalla de consentimiento encima

#### Scenario: No acepta
- **WHEN** aprieta "No acepto, salir"
- **THEN** se cierra la sesión y sigue viendo las páginas públicas sin cuenta

### Requirement: Persona anónima hasta aceptar
While a person with a session has no consent in force, the platform MUST NOT store, log or attach anything to their identity: browser data SHALL be read and written as without a session, the legal-terms log MUST NOT record entries, and Hifa, the report button and the notifications bell MUST NOT be shown.

#### Scenario: Llega con UTM y entra sin aceptar
- **WHEN** una persona abre `/?utm_source=newsletter`, entra con "Entrar" y todavía no aceptó
- **THEN** no hay ninguna clave del navegador con su prefijo `u:<id>:` y ninguna clave guarda su id
- **AND** el origen queda guardado como el de una visita sin sesión

#### Scenario: Bitácora
- **WHEN** una persona sin consentimiento tiene un ⚖ a la vista
- **THEN** la bitácora de términos legales no suma ninguna entrada

#### Scenario: Menú de la persona
- **WHEN** una persona sin consentimiento abre el menú de su avatar
- **THEN** la única acción es "Salir"

### Requirement: Constancia del consentimiento
The consent record SHALL store the accepted policy version, the date and time of acceptance, what was accepted and the path (`alta`, `al-entrar` or `nueva-version`). Records saved before this change, without a path, MUST still be valid. "Mis datos" SHALL show the version, the date and the path in plain words.

#### Scenario: Ver la constancia
- **WHEN** una persona que aceptó en el alta abre Mis datos
- **THEN** ve "Aceptaste la versión <versión vigente> el <fecha y hora en que marcó las casillas>, al crear tu cuenta"

#### Scenario: Registro viejo
- **WHEN** el navegador tiene un consentimiento de la versión vigente guardado antes de este cambio, sin camino
- **THEN** sigue valiendo y Mis datos muestra el camino como "sin dato"

### Requirement: Re-consentimiento con lo que cambió
When the policy version changes, the consent screen SHALL say which version the person had accepted and when, list in plain words what changed in the new version, link to the full text, and show both checkboxes unchecked. Every policy version after the first MUST have at least one listed change.

#### Scenario: Cambia la versión
- **WHEN** una persona que había aceptado la versión anterior entra después de que cambió `VERSION_POLITICA`
- **THEN** ve "Aceptaste la versión … el …", la lista "Qué cambió" y las dos casillas sin marcar
- **AND** al aceptar, el registro nuevo lleva el camino `nueva-version`

#### Scenario: Versión sin cambios listados
- **WHEN** un test recorre las versiones de la política
- **THEN** falla si la versión vigente no es la primera y no tiene cambios listados

### Requirement: Consentimientos separados
The policy and terms acceptance SHALL be separate from any optional consent: optional consents MUST be unchecked, MUST NOT be required to create an account, and the specific consent for sensitive KYC data SHALL keep being asked separately when starting the KYC.

#### Scenario: El alta no pide datos sensibles
- **WHEN** una persona termina el alta
- **THEN** no dio el consentimiento de datos sensibles y se lo piden recién al apretar "Verificar mi identidad"
