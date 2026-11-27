# Spec Delta

## Purpose

Guardar en la base las consultas por un lote y los pedidos de contacto, con el origen de la visita, para que el equipo los vea todos en un solo lugar y la persona los pueda borrar.

## ADDED Requirements

### Requirement: Guardar un pedido en la base
`POST /api/contactos` SHALL store, for the person in session with a current consent, the request's reason, reference, channel, time of day, message (at most 500 characters), destination, the administrative state shown (lot requests only) and the visit origin. It MUST reject an unknown reason or channel, an empty channel or a longer message with 422, and write nothing without a current consent (403 `{ consentimiento: false }`). The three forms (lot sheet, territory showcase, Sumarte) SHALL wait for the answer and show an error with `role="alert"` if it fails.

#### Scenario: Consulta por un lote
- **WHEN** una persona manda una consulta por el lote 7 desde su ficha
- **THEN** hay una fila en `contactos` con su `persona_id`, motivo `consulta-lote-vrn`, el estado administrativo que vio y el origen, si lo había

#### Scenario: Falla al enviar
- **WHEN** `POST /api/contactos` responde 500
- **THEN** el formulario muestra el error, conserva lo escrito y no dice "enviado"

### Requirement: Bandeja del equipo
`GET /api/admin/contactos` SHALL return every request with the person's email and name to a super admin only, and 403 to everyone else. The `/admin` inbox and the pending counter SHALL read from it; if it fails, the counter shows "sin dato", never 0.

#### Scenario: El equipo ve todo
- **WHEN** dos personas mandan pedidos desde navegadores distintos y el super admin abre `/admin`
- **THEN** ve los dos pedidos en la bandeja y el contador suma los dos

#### Scenario: Persona común
- **WHEN** una persona que no es super admin pide `/api/admin/contactos`
- **THEN** la API responde 403 sin datos

### Requirement: Origen de la visita
The visit origin (source, medium, campaign, path) SHALL stay in the browser (`lh-origen`) until the person writes a request or a reservation; then it SHALL be saved with that row, and copied to `personas.origen` only if it was empty. `personas.origen` MUST never be overwritten.

#### Scenario: Primera visita se conserva
- **WHEN** una persona llegó por una campaña A, después vuelve por una campaña B y manda un pedido
- **THEN** el pedido guarda el origen B y `personas.origen` sigue siendo el de su primer registro

### Requirement: La persona borra sus pedidos
The "Mis datos" download SHALL include the person's requests from the server (`null` if they could not be fetched). "Retirar y borrar mis datos" SHALL delete the person's rows in `contactos` and set their `personas.origen` to null in the same transaction that releases their lots; this route SHALL require a session but not a current consent.

#### Scenario: Borrar mis datos
- **WHEN** una persona con dos pedidos retira y borra sus datos
- **THEN** sus dos filas de `contactos` desaparecen y el super admin ya no las ve en la bandeja

### Requirement: Contactos fuera del navegador
`lh-contactos` SHALL no longer be written and SHALL be removed from the browser (with and without a person prefix) the first time the person opens the app after this change, without copying its contents.

#### Scenario: Bandeja vieja
- **WHEN** una persona entra con `lh-contactos` guardado de antes
- **THEN** la clave desaparece y no aparece ningún pedido nuevo en la base por eso
