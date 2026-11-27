# Spec Delta

## Purpose

Guardar en el servidor, como libro de solo agregar, qué texto legal o estado del loteo se le mostró a cada persona y cuándo (regla C11), para que sirva como constancia.

## ADDED Requirements

### Requirement: Libro de bitácora
`POST /api/bitacora` SHALL append, for the person in session with a current consent, an entry with the path, type (`estado-loteo` or `termino-legal`), key, text shown, hash, draft flag, language and server time. The database MUST reject UPDATE, DELETE and TRUNCATE on `bitacora`. If an entry with the same person, type, key and hash exists in the last 30 minutes, the server SHALL answer 200 and append nothing. Without a session nothing is recorded, as today.

#### Scenario: Se muestra un término legal
- **WHEN** una persona con sesión abre la ficha de un lote y ve el aviso del estado administrativo
- **THEN** aparece una fila en `bitacora` con su `persona_id`, tipo `estado-loteo`, el texto tal como se leía y su huella

#### Scenario: Sin repetir
- **WHEN** la misma persona vuelve a ver el mismo texto a los 10 minutos
- **THEN** no aparece una fila nueva; a los 31 minutos, sí

#### Scenario: La bitácora no rompe la pantalla
- **WHEN** `POST /api/bitacora` falla
- **THEN** la pantalla se ve igual y no muestra ningún error

### Requirement: Ver la propia bitácora
`GET /api/bitacora` SHALL return the person's own entries, newest first, at most 300; `/panel/bitacora` SHALL read from it and show "sin dato" if it fails.

#### Scenario: Panel
- **WHEN** una persona abre `/panel/bitacora` desde otro navegador
- **THEN** ve las entradas que se anotaron en el primero

### Requirement: La bitácora se conserva
"Retirar y borrar mis datos" SHALL NOT delete the person's `bitacora` rows (proof of what legal text was shown, pending legal review); the download SHALL include them (`null` if they could not be fetched). `lh-bitacora` SHALL no longer be written and SHALL be removed from the browser without copying it.

#### Scenario: Borrar mis datos
- **WHEN** una persona retira y borra sus datos
- **THEN** sus filas de `bitacora` siguen en el libro, y la clave `lh-bitacora` ya no existe en su navegador
