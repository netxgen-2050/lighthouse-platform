# Spec Delta

## Purpose

Guardar en el servidor, como libro de solo agregar, las reservas y pagos SIMULADOS de lotes de Lighthouse VRN, para que un lote reservado por una persona aparezca reservado para todas, sin cobrar nada ni dar prioridad a nadie.

## ADDED Requirements

### Requirement: Libro de reservas
The server SHALL record every simulated reservation, payment and undo of a lot as a new row (`reserva`, `paga`, `deshace`) in the `reservas` ledger, with the person, who appended it, the lot id, the chosen option, what the person saw and the server time. The database MUST reject UPDATE, DELETE and TRUNCATE on `reservas`. No row MUST carry payment data or identity data other than the person's id.

#### Scenario: Reservar
- **WHEN** una persona con consentimiento vigente reserva el lote 7 con la opción "solo el lote"
- **THEN** aparece una fila `reserva` con su `persona_id`, `hecho_por` igual a su id, `lote_id` "lote-7", la opción y lo que vio, con la hora del servidor

#### Scenario: Libro intocable
- **WHEN** alguien intenta un UPDATE o un DELETE sobre una fila de `reservas`
- **THEN** la base lo rechaza y la fila queda igual

### Requirement: Una sola reserva vigente por lote
The current state of a lot SHALL be computed from the last ledger event for that lot. A lot MUST have at most one current reservation or payment: a reservation SHALL be accepted only if the lot's sample state is `disponible` and its last event is absent or `deshace`, checked and written inside one transaction that holds a per-lot lock. The first request to take the lock wins; no role, pass or profile SHALL give priority.

#### Scenario: Dos personas a la vez
- **WHEN** dos personas mandan la reserva del mismo lote al mismo tiempo
- **THEN** una queda con la reserva y la otra recibe 409 `ya-reservado` y ve "Alguien reservó este lote hace un momento."

#### Scenario: Lote vendido de ejemplo
- **WHEN** una persona intenta reservar un lote cuyo estado de ejemplo es `vendido`
- **THEN** la API responde 409 `no-disponible` y no escribe nada

#### Scenario: Pagar lo ajeno
- **WHEN** una persona intenta pagar un lote reservado por otra
- **THEN** la API responde 409 `no-reservado` y no escribe nada

### Requirement: Todos ven el estado del lote
`GET /api/lotes/estados` SHALL return, without a session and without any person identifier, the state of each lot that is not available: the sample states combined with the ledger (`reserva` → `reservado`, `paga` → `vendido`, cash or installments). The lot screens SHALL show another person's reservation as "Reservado" or "Vendido", and the person's own as today ("reservado por vos", "vendido a vos", "en cuotas, tuyo").

#### Scenario: Otra persona lo ve
- **WHEN** la persona A reserva el lote 7 y la persona B abre la lista de lotes en otro navegador
- **THEN** B ve el lote 7 como "Reservado" y no puede reservarlo

#### Scenario: Sin identidad
- **WHEN** alguien sin sesión pide `/api/lotes/estados`
- **THEN** la respuesta trae solo ids de lotes y estados, sin ningún id, email ni nombre de persona

#### Scenario: Sin respuesta de la base
- **WHEN** `/api/lotes/estados` falla
- **THEN** la pantalla deja los estados de ejemplo y avisa "No pudimos traer el estado actual de los lotes." sin mostrar ningún lote como disponible por eso

### Requirement: Deshacer y liberar
A person SHALL be able to undo their own current reservation or payment, which appends a `deshace` row. A super admin SHALL be able to release any lot, appending `deshace` with `hecho_por` set to the super admin and `persona_id` set to the holder. Undoing a lot with nothing current MUST be a no-op.

#### Scenario: Super admin libera
- **WHEN** el super admin libera el lote 7 que reservó otra persona
- **THEN** aparece una fila `deshace` con `hecho_por` del super admin y el lote vuelve a "Disponible" para todos

#### Scenario: Persona sin permiso
- **WHEN** una persona que no es super admin intenta deshacer la reserva de otra
- **THEN** la API responde 403 y no escribe nada

### Requirement: Sin consentimiento no se reserva
Every write to `reservas` on behalf of a person SHALL call `exigirConsentimiento`; without a current `acepta` the API MUST answer 403 `{ consentimiento: false }` and write nothing. Without a session the screens SHALL behave as today (they ask the person to sign in and nothing is saved).

#### Scenario: Sin consentimiento vigente
- **WHEN** una persona con la política sin aceptar manda una reserva
- **THEN** la API responde 403 con `consentimiento: false` y no hay fila nueva

### Requirement: Error al guardar
If a reservation, payment or undo cannot be saved, the screen SHALL show "No pudimos guardar tu reserva. Probá de nuevo." with `role="alert"` and MUST NOT change the lot state it shows.

#### Scenario: La API falla
- **WHEN** `POST /api/lotes/reservas` responde 500
- **THEN** la persona ve el error y el lote sigue como estaba

### Requirement: Mis datos con las reservas
The "Mis datos" download SHALL include the person's reservation events from the server (`null` if they could not be fetched). "Retirar y borrar mis datos" SHALL first append `deshace` for every lot the person holds, in one transaction, before withdrawing consent; if that fails, nothing is withdrawn and the current error is shown.

#### Scenario: Borrar libera el lote
- **WHEN** la persona A, que tiene reservado el lote 7, retira y borra sus datos
- **THEN** el lote 7 vuelve a "Disponible" para la persona B y las filas anteriores de A siguen en el libro

### Requirement: Nada en el navegador
`lh-lotes` and `lh-consultas-lotes` SHALL no longer be written, and SHALL be removed (with and without a person prefix) the first time the person opens the app after this change; their contents MUST NOT be copied to the server.

#### Scenario: Navegador con reservas viejas
- **WHEN** una persona entra con `lh-lotes` guardado de antes
- **THEN** la clave desaparece del navegador y no aparece ninguna reserva suya en la base por eso
