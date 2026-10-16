# Spec Delta

## ADDED Requirements

### Requirement: Límite por persona con cuenta
`POST /api/reportes` SHALL limit valid reports sent with a valid session to 10 per person in any 60-minute window. Over the limit it MUST answer 429 with a `Retry-After` header and the seconds to wait, without calling GitHub. Trap-field requests and invalid requests MUST NOT count. A report that could not be created (GitHub failed or no token) MUST NOT count. The without-account limit by IP stays as it is.

#### Scenario: Undécimo reporte en una hora
- **WHEN** una persona con sesión manda su undécimo reporte válido dentro de los 60 minutos de su primero
- **THEN** responde 429 con `Retry-After` y no llama a GitHub

#### Scenario: Pasada la hora
- **WHEN** pasan 60 minutos desde el más viejo de esos diez reportes
- **THEN** esa persona puede volver a reportar

#### Scenario: Falla de GitHub no consume cupo
- **WHEN** una persona con sesión manda 10 reportes válidos que fallan porque GitHub no responde, y después uno más
- **THEN** ese reporte no recibe 429

#### Scenario: Otra persona no se ve afectada
- **WHEN** la persona A llegó al límite y la persona B, con sesión, manda un reporte válido
- **THEN** el reporte de B se crea

### Requirement: Cuenta que sobrevive al reinicio
For a person who exists in `personas` and has a current consent recorded in the database, the count SHALL be kept in the database, so it holds across server instances and restarts, and two simultaneous requests from the same person MUST NOT both pass when only one slot is left. Only the person and the time of each sent report SHALL be stored: never the text, type, context or issue number.

#### Scenario: Otra instancia
- **WHEN** una persona con consentimiento en la base mandó 10 reportes y el undécimo lo atiende otra instancia del servidor
- **THEN** responde 429

#### Scenario: Dos a la vez con un lugar
- **WHEN** a una persona le queda un lugar y llegan dos reportes suyos al mismo tiempo
- **THEN** se crea uno y el otro recibe 429

#### Scenario: Qué se guarda
- **WHEN** se crea un reporte de una persona con consentimiento en la base
- **THEN** la base guarda solo una fila con esa persona y la hora, sin el texto del reporte ni el número del issue

### Requirement: Sin consentimiento en la base no se guarda nada
For a valid session whose person is not in `personas` or has no current consent in the database, the limit SHALL apply with the same numbers but kept only in memory, keyed by a salted hash of the login account, and the database MUST NOT receive any row for that request.

#### Scenario: Cuenta nueva sin fila
- **WHEN** una persona con sesión válida que no está en `personas` manda un reporte válido
- **THEN** el reporte se crea, cuenta para su límite en memoria y no aparece ninguna fila nueva en la base

### Requirement: Sin base no se reporta sin límite
If the database cannot be read or written while checking the limit of a person with consent in the database, the route SHALL answer 503 without calling GitHub, and the dialog SHALL keep the text and offer "Copiar el reporte".

#### Scenario: Base caída
- **WHEN** una persona con consentimiento en la base manda un reporte válido y la base no responde
- **THEN** responde 503, no llama a GitHub y el diálogo muestra el error con "Copiar el reporte"

### Requirement: Los envíos viejos se borran
When recording a sent report, the system SHALL delete that person's recorded sends older than 24 hours, so the table never keeps more than a day of history per person.

#### Scenario: Envío de anteayer
- **WHEN** una persona con un envío registrado hace 30 horas manda un reporte nuevo
- **THEN** la fila de hace 30 horas ya no está y queda la nueva

### Requirement: Mensaje del límite con cuenta
The with-account dialog SHALL, on a 429 answer, show the same message as without account ("Llegaste al límite de reportes por ahora. Probá de nuevo en N minutos."), keep what was typed and offer "Copiar el reporte". The axe audit MUST pass with that message visible.

#### Scenario: Límite con cuenta
- **WHEN** una persona con sesión envía y la ruta responde 429 con 1.200 segundos de espera
- **THEN** ve "Llegaste al límite de reportes por ahora. Probá de nuevo en 20 minutos.", su texto sigue en el formulario y ve "Copiar el reporte"
