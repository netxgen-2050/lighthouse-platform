# Spec Delta

## Purpose

Que las casillas de la política y los términos se marquen una sola vez: "Entrar" abre el login directo, y solo quien no tiene el consentimiento vigente de la versión actual ve la pantalla de consentimiento después del login. "Crear tu cuenta" sigue pidiendo las casillas antes del login. Reemplaza, para "Entrar" y "Entrar como…", el requisito "Aceptar antes de cualquier login" de `consentimiento-alta` (decisión de Gus, 27-nov-2026).

## ADDED Requirements

### Requirement: Entrar sin casillas
"Entrar" in the top bar, any other call to `entrar()` that is not in `alta` mode, and choosing an email in the "Entrar como…" panel of the test mode SHALL open the login directly, without showing the consent checkboxes first. With Neon Auth the dialog titled "Entrar" SHALL show the login form at once, with a line saying that a first-time person will be asked to accept the policy and terms afterwards. The step with the checkboxes before the login SHALL remain only for "Crear tu cuenta" (Sumarte), unchanged.

#### Scenario: Entrar desde la barra
- **WHEN** una persona sin sesión aprieta "Entrar" en la barra superior
- **THEN** ve el diálogo "Entrar" con el formulario de login, sin casillas
- **AND** el diálogo dice que, si es su primera vez, después le van a pedir aceptar la política y los términos

#### Scenario: Entrar como… en modo de prueba
- **WHEN** sin sesión, una persona elige un email del panel "Entrar como…"
- **THEN** entra con ese email sin pasar por el paso de las casillas

#### Scenario: Crear tu cuenta sigue igual
- **WHEN** una persona sin sesión aprieta "Sumarme gratis" en Sumarte
- **THEN** ve el paso "Crear tu cuenta" con el resumen y las dos casillas sin marcar, y el login no se abre hasta aceptar

### Requirement: Consentimiento una sola vez por versión
After the login, a person whose account has a consent in force for the current policy version SHALL enter without seeing any checkbox, and no new acceptance SHALL be registered. A person without a consent in force (never accepted, withdrew, or accepted an older version) SHALL see the consent screen, with "Qué cambió" when they had accepted an older version, on every page except the privacy policy, until they accept or log out. Until they accept, the platform MUST NOT store anything under their identity.

#### Scenario: Ya aceptó esta versión
- **WHEN** una persona con consentimiento vigente de la versión actual aprieta "Entrar" y termina el login
- **THEN** entra sin ver casillas ni la pantalla de consentimiento
- **AND** su constancia sigue igual: no se registró otra aceptación

#### Scenario: Primera vez por Entrar
- **WHEN** una persona que nunca aceptó aprieta "Entrar" y termina el login
- **THEN** ve la pantalla de consentimiento con el texto de la primera vez y las dos casillas sin marcar
- **AND** hasta aceptar sigue anónima para todo lo que se guarda

#### Scenario: Acepta en la pantalla
- **WHEN** en esa pantalla marca las dos casillas y acepta
- **THEN** su consentimiento queda registrado con la versión vigente, la fecha y hora y el camino de entrada
- **AND** la próxima vez que entra no ve casillas

#### Scenario: Cambió la versión
- **WHEN** una persona que aceptó una versión anterior entra
- **THEN** ve la pantalla de consentimiento con "Cambió la política…" y "Qué cambió", una sola vez

### Requirement: Textos de una sola vez
The texts that say the checkboxes are asked every time SHALL say instead that they are accepted once: the "Entrar" dialog SHALL NOT say "cada vez que entrás", and the legal basis in the policy SHALL say that consent is given when creating the account or the first time the person enters. The policy version SHALL NOT be bumped for this change; the version `2026-11-25-borrador` SHALL list it among its changes.

#### Scenario: La política lo dice
- **WHEN** una persona abre `/privacidad`
- **THEN** la base legal dice que el consentimiento se da al crear la cuenta o la primera vez que entra
- **AND** en ningún texto de la plataforma dice que las casillas se piden cada vez que se entra
