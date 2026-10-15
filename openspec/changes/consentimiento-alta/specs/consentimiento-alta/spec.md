# Spec Delta

## Purpose

Que la persona acepte la política de privacidad y los términos del prototipo antes de cualquier login (al darse de alta y también al entrar), con información en capas y casillas separadas, que la plataforma no guarde nada con su identidad hasta que acepte, y que quede constancia demostrable de qué aceptó, cuándo y por qué camino.

## ADDED Requirements

### Requirement: Aceptar antes de cualquier login
Every entry point that opens the login (the Sumarte actions that create an account, "Entrar" in the top bar, any other link or button that calls `entrar()`, and the "Entrar como…" panel of the test mode) SHALL first show a step with the consent block: the plain-language summary, links to the full policy and terms, two separate unchecked required checkboxes (policy, terms) and the separate optional group for email updates. The login (Privy's window, or the session of the test mode) MUST NOT open until both required checkboxes are checked and the person confirms; closing the step or leaving a required checkbox unchecked MUST leave the person without a session. In Sumarte the step SHALL be titled "Crear tu cuenta"; from "Entrar" it SHALL be titled "Entrar", with the same block and the same checkbox texts. A person who already has an account SHALL also check the boxes when entering, because before the login the platform does not know who they are. Only an acceptance given in this step and still valid (see "Aceptación previa con vencimiento") SHALL let the login open.

#### Scenario: Entrar desde una página pública
- **WHEN** una persona sin sesión aprieta "Entrar" en la barra superior estando en `/tribus`
- **THEN** ve el paso "Entrar" con el resumen, los enlaces y las dos casillas obligatorias sin marcar
- **AND** el login todavía no se abrió y sigue sin sesión

#### Scenario: Entrar sin aceptar
- **WHEN** en el paso "Entrar" cierra con "Cancelar" o Escape, o aprieta "Aceptar y entrar" con una sola casilla obligatoria marcada o ninguna
- **THEN** el login no se abre y sigue sin sesión
- **AND** si apretó el botón, ve el error que dice que tiene que marcar las dos y el foco va a la primera casilla sin marcar; si cerró, el foco vuelve a "Entrar"

#### Scenario: Acepta y entra desde la barra
- **WHEN** marca las dos casillas en el paso "Entrar" y aprieta "Aceptar y entrar"
- **THEN** recién ahí se abre el login (Privy, o "Entrar como…" en modo de prueba)
- **AND** al terminar el login no ve la pantalla de consentimiento

#### Scenario: Privy no recibe el email antes de las casillas
- **WHEN** una persona sin sesión aprieta cualquier "Entrar", cualquier acción de Sumarte que crea la cuenta o un email de "Entrar como…", y todavía no marcó las dos casillas
- **THEN** la plataforma no llamó al login de Privy (ni a la sesión del modo de prueba), así que no hay ventana de Privy donde escribir el email y no salió ningún pedido a Privy para iniciar el login

#### Scenario: Entrar como… en modo de prueba
- **WHEN** sin sesión y sin aceptación previa vigente, una persona elige un email del panel "Entrar como…"
- **THEN** primero ve el paso "Entrar" con las casillas sin marcar y la sesión no se abre hasta que marque las dos y acepte
- **AND** al aceptar entra con el email que había elegido

#### Scenario: Quien ya tiene cuenta también marca
- **WHEN** una persona con consentimiento vigente de la versión actual aprieta "Entrar"
- **THEN** ve el paso "Entrar" con las casillas sin marcar como cualquier otra persona
- **AND** después del login su constancia anterior sigue igual (no se registra otra aceptación) y su elección de novedades solo cambia si marcó la casilla de novedades

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
An acceptance given in the "Crear tu cuenta" or "Entrar" step SHALL be kept only in the current browser tab, for the same time limit as the plan chosen in Sumarte (5 minutes) and only for the policy version in force; an expired acceptance or one for another version MUST NOT be registered and MUST NOT let the login open: the step SHALL be shown again before the login, and if the session already exists the consent screen MUST be shown instead. The acceptance SHALL be discarded at the first login in that tab, whether or not it was used, and on logout.

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
The consent screen after the login SHALL be a safety net, not the normal way in: it covers the cases where a session exists without a registered acceptance in force for the policy version in force, for example an acceptance given in the step that expired before the login ended (more than 5 minutes), a session restored automatically (Privy already logged in from before, without going through the step), a login finished in another tab, or a new policy version. In those cases the person SHALL see the consent screen on every page, public pages included, except the privacy policy page, until they accept or log out.

#### Scenario: Sesión restaurada sin aceptación
- **WHEN** una persona con la sesión de Privy guardada de antes y sin consentimiento de la versión vigente abre `/tribus`
- **THEN** en lugar del listado de tribus ve la pantalla de consentimiento

#### Scenario: La política se puede leer
- **WHEN** esa persona abre el enlace "política de privacidad" de la pantalla
- **THEN** `/privacidad` se ve completa, sin la pantalla de consentimiento encima

#### Scenario: No acepta
- **WHEN** aprieta "No acepto, salir"
- **THEN** se cierra la sesión y sigue viendo las páginas públicas sin cuenta

### Requirement: Persona anónima hasta aceptar
While a person with a session has no consent in force, the platform MUST NOT store, log or attach anything to their identity: browser data SHALL be read and written as without a session, the legal-terms log MUST NOT record entries, and Hifa, the report button and the notifications bell MUST NOT be shown.

#### Scenario: Llega con UTM y tiene sesión sin aceptar
- **WHEN** una persona abre `/?utm_source=newsletter` con una sesión sin consentimiento vigente (por ejemplo, su aceptación del paso venció antes de terminar el login)
- **THEN** no hay ninguna clave del navegador con su prefijo `u:<id>:` y ninguna clave guarda su id
- **AND** el origen queda guardado como el de una visita sin sesión

#### Scenario: Bitácora
- **WHEN** una persona sin consentimiento tiene un ⚖ a la vista
- **THEN** la bitácora de términos legales no suma ninguna entrada

#### Scenario: Menú de la persona
- **WHEN** una persona sin consentimiento abre el menú de su avatar
- **THEN** la única acción es "Salir"

### Requirement: Constancia del consentimiento
The consent record SHALL store the accepted policy version, the date and time of acceptance, what was accepted and the path (`alta` for the "Crear tu cuenta" step, `al-entrar` for the "Entrar" step or the consent screen without a previous record, `nueva-version` when there was a record of another version). Records saved before this change, without a path, MUST still be valid. "Mis datos" SHALL show the version, the date and the path in plain words.

#### Scenario: Ver la constancia
- **WHEN** una persona que aceptó en el alta abre Mis datos
- **THEN** ve "Aceptaste la versión <versión vigente> el <fecha y hora en que marcó las casillas>, al crear tu cuenta"

#### Scenario: Registro viejo
- **WHEN** el navegador tiene un consentimiento de la versión vigente guardado antes de este cambio, sin camino
- **THEN** sigue valiendo y Mis datos muestra el camino como "sin dato"

### Requirement: Re-consentimiento con lo que cambió
When the policy version changes, the consent screen SHALL say which version the person had accepted and when, list in plain words what changed in the new version, link to the full text, and show both checkboxes unchecked. The "Entrar" step, which does not know who the person is, SHALL show the version in force and, when it is not the first, its "Qué cambió" list. An acceptance taken from the "Entrar" step by a person whose record was of another version SHALL be registered with the path `nueva-version`. Every policy version after the first MUST have at least one listed change.

#### Scenario: Cambia la versión
- **WHEN** una persona que había aceptado la versión anterior entra con "Entrar" después de que cambió `VERSION_POLITICA`
- **THEN** el paso "Entrar" muestra la versión vigente, la lista "Qué cambió" y las dos casillas sin marcar
- **AND** al aceptar y terminar el login, el registro nuevo lleva el camino `nueva-version` y Mis datos dice "cuando cambió la política"

#### Scenario: Cambia la versión con la sesión abierta
- **WHEN** una persona con la sesión abierta y el consentimiento de la versión anterior vuelve a la plataforma después de que cambió `VERSION_POLITICA`
- **THEN** ve la pantalla de consentimiento con "Aceptaste la versión … el …", la lista "Qué cambió" y las dos casillas sin marcar
- **AND** al aceptar, el registro nuevo lleva el camino `nueva-version`

#### Scenario: Versión sin cambios listados
- **WHEN** un test recorre las versiones de la política
- **THEN** falla si la versión vigente no es la primera y no tiene cambios listados

### Requirement: Consentimientos separados
The policy and terms acceptance SHALL be separate from any optional consent: optional consents MUST be unchecked, MUST NOT be required to create an account, and the specific consent for sensitive KYC data SHALL keep being asked separately when starting the KYC.

#### Scenario: El alta no pide datos sensibles
- **WHEN** una persona termina el alta
- **THEN** no dio el consentimiento de datos sensibles y se lo piden recién al apretar "Verificar mi identidad"

#### Scenario: Crear la cuenta sin el opcional
- **WHEN** una persona marca solo las dos casillas obligatorias y aprieta "Aceptar y crear mi cuenta"
- **THEN** el login se abre sin errores y la casilla de novedades no se menciona en ningún mensaje

### Requirement: Novedades por email, opcional
The "Crear tu cuenta" and "Entrar" steps SHALL always offer, in a separate group labeled as optional, an unchecked checkbox "Quiero recibir novedades por email" (before the login they do not know the person); the consent screen SHALL offer it only while the person has no recorded choice about it. An unchecked box in a step MUST NOT overwrite a choice the person had already recorded; checking it SHALL record that they want the updates. Every choice made with the checkbox in view SHALL be recorded (given or not given) with the policy version, date and time, and path. "Mis datos" SHALL show the current choice and let the person give or withdraw it at any time, recording each change with the path `mis-datos`. Withdrawing the general consent SHALL also withdraw this one. No email is sent in the prototype.

#### Scenario: Pedir novedades en el alta
- **WHEN** una persona marca las dos casillas obligatorias y la de novedades, acepta y termina el login
- **THEN** queda registrado que pidió novedades, con la versión vigente, la fecha y hora y el camino `alta`
- **AND** Mis datos dice que pidió recibir novedades por email y cuándo

#### Scenario: No marcarla
- **WHEN** una persona acepta en la pantalla de consentimiento sin marcar la casilla de novedades
- **THEN** queda registrado que no las pidió y la casilla no vuelve a aparecer en el próximo re-consentimiento

#### Scenario: El paso no pisa una elección anterior
- **WHEN** una persona que ya había pedido novedades entra con "Entrar", marca las dos casillas obligatorias sin marcar la de novedades y termina el login
- **THEN** su registro de novedades sigue diciendo que las pidió

#### Scenario: Retirar desde Mis datos
- **WHEN** una persona que pidió novedades aprieta "Dejar de recibir novedades" en Mis datos
- **THEN** Mis datos dice que no recibe novedades, el cambio se anuncia a los lectores de pantalla y queda constancia del retiro con fecha y camino `mis-datos`
- **AND** su consentimiento de la política y los términos sigue vigente

#### Scenario: Retirar el consentimiento general
- **WHEN** una persona que pidió novedades usa "Retirar mi consentimiento"
- **THEN** también queda registrado el retiro de las novedades

### Requirement: Una sola versión nueva de la política
This change SHALL raise the policy version once, and the new version SHALL already inform the account-creation acceptance, the language cookie and the optional email updates, so the English translation can be published under the same version without asking for consent again.

#### Scenario: Qué cambió
- **WHEN** una persona que aceptó `2026-10-14-borrador` entra después de este cambio
- **THEN** la lista "Qué cambió" menciona aceptar antes de entrar o de crear la cuenta, el idioma guardado en el navegador y las novedades opcionales por email
