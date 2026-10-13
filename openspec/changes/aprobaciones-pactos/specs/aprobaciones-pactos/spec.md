## ADDED Requirements

### Requirement: Pactos de tiempo en la base
The system SHALL store sent time pacts in a `pactos` table (person, community, role, "other" role text, description, hours per month, state `enviado` | `aceptado` | `rechazado`, send date, resolver, resolution date, optional reason) with at most one time pact per person and community enforced by the database; drafts SHALL stay in the browser; the server MUST validate the pact with the same rules as the screen and MUST reject a pact from someone who is not a member of that community.

#### Scenario: Enviar un pacto
- **WHEN** una persona miembro de Valle Solar completa rol, descripción y 12 horas por mes y toca "Enviar a la comunidad"
- **THEN** queda un pacto `enviado` en la base y la pantalla lo muestra en el paso "Enviado a la comunidad", sin poder editarlo

#### Scenario: No es miembro
- **WHEN** una persona con el pedido de Valle Solar todavía pendiente llama a `POST /api/pactos` para Valle Solar
- **THEN** recibe 403 y no se guarda nada

#### Scenario: Pacto incompleto
- **WHEN** llega un `POST /api/pactos` sin descripción
- **THEN** recibe 400 con el campo que falta

### Requirement: Resolver pactos
Pending pacts SHALL be resolvable by whoever may resolve memberships of that community (same rule as `aprobaciones-admin`), from a "Pactos" section in `/pedidos` showing person, community, role, hours per month and description, with "Aceptar" and "Rechazar" (optional reason up to 300 characters); the avatar menu count SHALL include pending pacts; any other caller MUST receive 403 without changes.

#### Scenario: Admin acepta un pacto
- **WHEN** el admin de Valle Solar acepta el pacto de otra persona
- **THEN** el pacto pasa a `aceptado` con quién y cuándo, y esa persona ve el paso "Aceptado" y sus Semillas de tiempo en `/semillas`

#### Scenario: Contador
- **WHEN** el admin de Valle Solar tiene un pedido de membresía y dos pactos pendientes
- **THEN** el menú del avatar dice "Pedidos (3)"

#### Scenario: Persona común
- **WHEN** alguien con rol `persona` llama a `PATCH /api/pactos/<id>`
- **THEN** recibe 403 y no cambia nada

### Requirement: Rechazo y reenvío
A person whose pact was rejected SHALL see "No te aceptaron este pacto por ahora" with the reason when there is one, and SHALL be able to edit it and send it again, which reopens the same row as `enviado`.

#### Scenario: Reenviar
- **WHEN** el admin rechaza un pacto con el motivo "Bajá a 8 horas por ahora" y la persona lo corrige y lo reenvía
- **THEN** el pacto vuelve a aparecer pendiente en `/pedidos` con las horas nuevas

### Requirement: Sin aceptación simulada de pactos
The button "Simular: la comunidad acepta" MUST NOT appear, and Semillas and Mi recorrido SHALL read accepted pacts from the API through a single client module; the Semillas calculation SHALL stay the same.

#### Scenario: Semillas sin aceptar
- **WHEN** una persona tiene un pacto enviado y todavía no aceptado
- **THEN** `/semillas` no le suma Semillas de tiempo por ese pacto

### Requirement: Pactos del navegador
The first time a person with a session loads the app after this change, pacts stored in their browser as sent or accepted SHALL be sent once as `enviado` and removed from the local state; drafts and money contributions MUST stay in the browser unchanged.

#### Scenario: Pacto aceptado antes del cambio
- **WHEN** una persona tenía un pacto "Aceptado" en el navegador y entra después del cambio
- **THEN** queda un pacto `enviado` en la base, pendiente de un admin, y sus aportes en plata siguen como estaban
