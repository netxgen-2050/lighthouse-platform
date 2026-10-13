## ADDED Requirements

### Requirement: Membresías en la base
The system SHALL store memberships in a `membresias` table (person, community, state `pedido` | `miembro` | `rechazado`, manifesto version, request date, resolver, resolution date, optional reason) with at most one row per person and community enforced by the database; the API MUST verify the session on the server and MUST NOT trust any role or state sent by the browser.

#### Scenario: Adherir
- **WHEN** una persona con sesión termina de leer el manifiesto de Valle Solar y adhiere
- **THEN** queda una fila `pedido` con la versión vigente del manifiesto y la ficha de la tribu muestra que el pedido llegó

#### Scenario: Doble pedido
- **WHEN** la misma persona vuelve a adherir a Valle Solar con el pedido pendiente
- **THEN** no se crea otra fila y el pedido sigue igual

#### Scenario: Sin sesión
- **WHEN** alguien sin sesión llama a `POST /api/membresias`
- **THEN** recibe 401 y no se guarda nada

### Requirement: Quién resuelve cada pedido
A request to join Valle Solar SHALL be resolvable by the `admin-tribu` of `valle` or by a super admin; requests to join the Lighthouse or a tribe without an admin SHALL be resolvable only by a super admin; nobody except a super admin MAY resolve their own request; any other caller MUST receive 403 without changes.

#### Scenario: Admin de Valle Solar acepta
- **WHEN** el admin de Valle Solar acepta el pedido de otra persona
- **THEN** la fila pasa a `miembro` con quién y cuándo, y esa persona ve "Proponer mi pacto" en la ficha de Valle Solar

#### Scenario: Admin de tribu y el Lighthouse
- **WHEN** el admin de Valle Solar intenta resolver un pedido para entrar al Lighthouse
- **THEN** recibe 403 y el pedido sigue pendiente

#### Scenario: Persona común
- **WHEN** alguien con rol `persona` llama a `PATCH /api/membresias/<id>`
- **THEN** recibe 403 y no cambia nada

### Requirement: Bandeja de pedidos
The page `/pedidos` SHALL list, for `admin-tribu` and `superadmin` only, the pending requests they can resolve (person, community, date, manifesto version) with "Aceptar" and "Rechazar" (optional reason up to 300 characters); the avatar menu SHALL link to it with the number of pending requests written as text; other roles MUST NOT see the link and MUST see a "no tenés acceso" message if they open the page.

#### Scenario: Bandeja con pedidos
- **WHEN** el admin de Valle Solar abre `/pedidos` con dos pedidos pendientes de Valle Solar y uno del Lighthouse
- **THEN** ve solo los dos de Valle Solar y el menú del avatar dice "Pedidos (2)"

#### Scenario: Bandeja vacía
- **WHEN** no hay pedidos que pueda resolver
- **THEN** ve "No hay pedidos pendientes"

#### Scenario: Persona sin rol de admin
- **WHEN** una persona con rol `persona` abre `/pedidos`
- **THEN** ve que no tiene acceso y no se muestra ningún pedido

### Requirement: Rechazo y nuevo intento
A rejected person SHALL see "No te aceptaron por ahora" with the reason when there is one, and SHALL be able to adhere again, which reopens the same row as `pedido`.

#### Scenario: Rechazo con motivo
- **WHEN** el admin rechaza un pedido con el motivo "Primero vení a una llamada de la tribu"
- **THEN** la persona ve "No te aceptaron por ahora" y el motivo en la ficha de la tribu, junto a "Adherir de nuevo"

### Requirement: Sin aceptación simulada
The button "Simular: la comunidad me acepta" MUST NOT appear anywhere, and every screen that reads memberships (Pactos, Semillas, Pasaporte, Perfil, Mi recorrido) SHALL read them from the API through a single client module.

#### Scenario: Pedido pendiente
- **WHEN** una persona tiene un pedido pendiente en Valle Solar
- **THEN** la ficha y el manifiesto no ofrecen ningún botón para aceptarlo y el Pasaporte muestra el sello de Valle Solar "En trámite"

### Requirement: Membresías del navegador
The first time a person with a session loads the app after this change, memberships stored in their browser (`pedido` or `miembro`) SHALL be sent once as requests and the local key SHALL be removed; a simulated membership MUST NOT become a real one without approval.

#### Scenario: Miembro simulado antes del cambio
- **WHEN** una persona tenía "miembro" de Valle Solar en el navegador y entra después del cambio
- **THEN** queda un pedido pendiente de Valle Solar en la base y la clave local ya no existe
