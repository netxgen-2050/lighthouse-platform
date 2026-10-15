# Spec Delta

## Purpose

Guardar en el servidor, como libro de solo agregar, qué aceptó o retiró cada persona (política, términos y novedades por email), y garantizar que el servidor no escriba nada a nombre de una persona sin un consentimiento vigente.

## ADDED Requirements

### Requirement: Registrar la aceptación
`POST /api/consentimientos` SHALL record, for the person in session, an `acepta` of the policy and the terms as two rows with the same version and server time, the path (`alta`, `al-entrar`, `nueva-version`, `mis-datos`) and the informative browser time. It MUST reject a version that is not the current one, and a prior acceptance older than 5 minutes or in the future.

#### Scenario: Alta
- **WHEN** una persona marca las casillas en "Crear tu cuenta" y termina el login dentro de los 5 minutos
- **THEN** quedan dos filas `acepta` (política y términos) con canal `alta`, la versión vigente y la hora del servidor

#### Scenario: Aceptación vencida
- **WHEN** el cliente manda una aceptación previa de hace 6 minutos
- **THEN** la API la rechaza, no escribe nada y la persona ve la pantalla de consentimiento

#### Scenario: Versión vieja
- **WHEN** el cliente manda una versión que no es la vigente
- **THEN** la API responde 422 y no escribe nada

### Requirement: Persona nueva con su primer consentimiento
A person who is not yet in `personas` SHALL get their row in the same transaction as their first `acepta`; `/api/sesion` MUST NOT create it. A person already loaded by the team SHALL only get their Privy id completed.

#### Scenario: Persona nueva
- **WHEN** una persona que nunca entró acepta por primera vez
- **THEN** su fila en `personas` y sus dos filas `acepta` aparecen juntas, o no aparece ninguna si algo falla

#### Scenario: Sin aceptar
- **WHEN** una persona nueva entra con Privy y no acepta
- **THEN** no hay ninguna fila suya en `personas` ni en `consentimientos`

### Requirement: Retirar sin borrar
Withdrawing SHALL append `retira` rows (first email updates if they were accepted, then policy and terms, in one transaction); no row MUST ever be updated or deleted.

#### Scenario: Retirar
- **WHEN** una persona con novedades aceptadas aprieta "Retirar mi consentimiento"
- **THEN** se agregan filas `retira` de novedades, política y términos, y las filas `acepta` anteriores siguen en el libro

### Requirement: Novedades por email
The optional email-updates consent SHALL be given or withdrawn with its own rows; the checkbox of the login step MUST NOT overwrite a previous choice (it only writes `acepta` when checked and the last event was not `acepta`, or the first choice when there is none).

#### Scenario: No pisa
- **WHEN** una persona con novedades en `acepta` entra sin marcar la casilla
- **THEN** no se escribe ninguna fila de novedades y sigue en `acepta`

### Requirement: Estado vigente desde el servidor
`GET /api/consentimientos` SHALL return the person's current state (policy and terms valid for the current version or not, email updates yes or no) and the record (version, date, path), computed from the last row per type. The browser SHALL use it as the source of truth when there is a session.

#### Scenario: Otro navegador
- **WHEN** una persona que aceptó en su computadora entra desde el celular
- **THEN** no ve la pantalla de consentimiento y Mis datos muestra la misma constancia

### Requirement: Exigir consentimiento para escribir
Every server route that writes on behalf of a person SHALL first check that the person has a current `acepta` of policy and terms; otherwise it MUST respond 403 with `{ consentimiento: false }` and write nothing. `/api/sesion` and `/api/consentimientos` are the only exceptions.

#### Scenario: Sin consentimiento
- **WHEN** una persona con sesión pero sin aceptación vigente llama a una ruta que escribe
- **THEN** recibe 403 con `{ consentimiento: false }` y no se escribe nada

### Requirement: Falla y doble envío
If saving fails the person SHALL stay anonymous and see "No pudimos guardar tu aceptación. Probá de nuevo." (with `role="alert"`); a repeated identical request within a few seconds MUST NOT add duplicate rows.

#### Scenario: Doble clic
- **WHEN** el cliente manda dos veces la misma aceptación en un segundo
- **THEN** quedan solo dos filas (política y términos), no cuatro
