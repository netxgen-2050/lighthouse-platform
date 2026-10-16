# Spec Delta

## Purpose

Que se entre y se cree la cuenta desde un único formulario de email, que solo quien todavía no tiene cuenta tenga que marcar las casillas de la política y los términos antes del login, y que averiguar si un email tiene cuenta sea caro y diga lo mínimo.

## ADDED Requirements

### Requirement: Un solo formulario de email
Every entry point that opens the login ("Entrar" in the top bar, the Sumarte actions that create an account and any other call to the platform's entry) SHALL first ask for the person's email in the platform's own form, inside the same dialog as the consent step. The form SHALL be titled "Crear tu cuenta" from Sumarte and "Entrar" elsewhere, and MUST NOT say whether the email has an account before the person continues.

#### Scenario: Entrar desde la barra
- **WHEN** una persona sin sesión aprieta "Entrar" en `/tribus`
- **THEN** ve el diálogo "Entrar" con el campo "Tu email" y el botón "Seguir", con el foco en el campo
- **AND** el login todavía no se abrió

#### Scenario: Crear la cuenta desde Sumarte
- **WHEN** una persona sin sesión aprieta "Sumarme gratis"
- **THEN** ve el mismo formulario titulado "Crear tu cuenta"

#### Scenario: Email mal escrito
- **WHEN** escribe "ana@" y aprieta "Seguir"
- **THEN** ve un error con `role="alert"` asociado al campo y no sale ninguna consulta al servidor

### Requirement: Email nuevo acepta antes del login
When the server answers that the email has no account, the person SHALL see the consent block (layered summary, two unchecked required checkboxes, the separate unchecked optional email-updates checkbox) and the login MUST NOT open until both required checkboxes are checked and accepted. The acceptance SHALL be valid only for that email.

#### Scenario: Email nuevo
- **WHEN** una persona escribe un email que no tiene cuenta y aprieta "Seguir"
- **THEN** ve el bloque de consentimiento con las dos casillas obligatorias sin marcar y un enlace "Usar otro email"
- **AND** el login no se abre hasta que marque las dos y acepte

#### Scenario: Acepta y entra
- **WHEN** marca las dos casillas, acepta y termina el login con ese mismo email
- **THEN** su consentimiento queda registrado con el camino `alta` y no ve la pantalla de consentimiento después

#### Scenario: El login termina con otro email
- **WHEN** aceptó con `ana@prueba.test` y el login termina con `beto@prueba.test`, que no tiene cuenta
- **THEN** la aceptación no se registra para `beto@prueba.test` y ve la pantalla de consentimiento

#### Scenario: Persona cargada por el equipo que nunca aceptó
- **WHEN** escribe el email de una persona que existe en la plataforma pero no tiene ninguna aceptación registrada
- **THEN** ve el bloque de consentimiento como un email nuevo

### Requirement: Email con cuenta entra sin casillas
When the server answers that the email already has an account (a person with that email and at least one recorded acceptance of the policy, of any version), the person SHALL go straight to the login without seeing the consent checkboxes.

#### Scenario: Entra directo
- **WHEN** una persona con consentimiento vigente escribe su email y aprieta "Seguir"
- **THEN** se abre el login sin el bloque de consentimiento
- **AND** después del login no ve la pantalla de consentimiento y su constancia sigue igual

#### Scenario: Versión vieja de la política
- **WHEN** una persona que había aceptado una versión anterior escribe su email
- **THEN** entra sin casillas y, antes de cualquier otra cosa, ve la pantalla de consentimiento con "Qué cambió" y las casillas sin marcar

#### Scenario: Consentimiento retirado
- **WHEN** una persona que había retirado su consentimiento escribe su email y termina el login
- **THEN** ve la pantalla de consentimiento antes de cualquier otra cosa y sigue anónima hasta aceptar

### Requirement: La consulta dice lo mínimo
The account lookup SHALL answer only which step comes next. It MUST NOT return the person's name, role, policy version, dates or login provider, MUST NOT be cached, MUST NOT write the email to logs, and SHALL only accept JSON requests from the platform's own origin.

#### Scenario: Respuesta de la consulta
- **WHEN** se consulta un email con cuenta y otro sin cuenta
- **THEN** las dos respuestas tienen el mismo código de estado, las mismas cabeceras y un único campo que dice el paso siguiente

#### Scenario: Pedido desde otro sitio
- **WHEN** llega una consulta con un `Origin` ajeno o sin tipo de contenido JSON
- **THEN** se rechaza sin consultar la base

### Requirement: Límite de consultas
Outside the test mode, the account lookup SHALL be limited per IP address and in total per server instance; over the limit it SHALL answer 429 with the waiting time, and the form SHALL show a message with that time instead of the consent block or the login.

#### Scenario: Muchas consultas desde la misma IP
- **WHEN** desde una misma IP se hacen más consultas que el límite dentro de la ventana
- **THEN** la siguiente responde 429 con `Retry-After` y el formulario dice cuánto esperar

#### Scenario: Modo de prueba
- **WHEN** el modo de prueba está activo y los e2e consultan muchas veces desde la misma IP
- **THEN** ninguna consulta responde 429

### Requirement: Si la consulta falla, se piden las casillas
If the account lookup fails for any reason other than the request limit (the database does not answer, network error, unexpected answer), the form SHALL show the consent block as for a new email; it MUST NOT open the login without consent because of an error.

#### Scenario: La base no responde
- **WHEN** la consulta responde 503 o no responde
- **THEN** la persona ve el bloque de consentimiento y puede seguir aceptando
- **AND** si ya tenía cuenta con consentimiento vigente, su constancia no se duplica

### Requirement: Modo de prueba con el mismo flujo
With the test mode active, choosing an email in "Entrar como…" (in the dialog or in the Sumarte panel) SHALL go through the same lookup and the same steps: a `.test` email without an account sees the consent block; one with an account enters directly.

#### Scenario: Entrar como… con cuenta
- **WHEN** en modo de prueba se elige un email `.test` que ya aceptó la política
- **THEN** la sesión se abre sin el bloque de consentimiento

#### Scenario: Entrar como… sin cuenta
- **WHEN** en modo de prueba se elige un email `.test` sin ninguna aceptación
- **THEN** ve el bloque de consentimiento y la sesión no se abre hasta aceptar

### Requirement: Privy con el email de la plataforma
While Privy is the login of the environment, the platform SHALL open Privy's window with the email written in the platform's form already filled in and, for an email with an account, with new sign-ups blocked, so that an email without an account typed in Privy's window cannot create a user without having accepted. If blocking sign-ups does not work, Privy SHALL ask everyone for the checkboxes before its window, as in `consentimiento-alta`.

#### Scenario: Email con cuenta y Privy
- **WHEN** con Privy una persona con cuenta escribe su email y aprieta "Seguir"
- **THEN** se abre la ventana de Privy con su email ya escrito y sin casillas antes

#### Scenario: Cambia el email en la ventana de Privy
- **WHEN** en esa ventana borra el email y escribe uno que no tiene usuario en Privy
- **THEN** Privy no crea el usuario y la persona sigue sin sesión
