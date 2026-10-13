## ADDED Requirements

### Requirement: Avisos creados por el servidor
The system SHALL store notifications in a `notificaciones` table (recipient, type, text, internal link, de-duplication key unique per recipient, creation date, read date) and SHALL create them in the same transaction as the event that causes them: accepting or rejecting a membership or a pact notifies the requester; a new membership request or a new pact notifies every person who may resolve it.

#### Scenario: Adhesión aceptada
- **WHEN** el admin de Valle Solar acepta la adhesión de una persona
- **THEN** esa persona tiene un aviso "Valle Solar aceptó tu adhesión" que lleva a la ficha de Valle Solar

#### Scenario: Pacto rechazado
- **WHEN** el admin de Valle Solar rechaza un pacto
- **THEN** la persona tiene un aviso "Valle Solar no aceptó tu pacto por ahora" que lleva a Pactos

#### Scenario: Pedido nuevo
- **WHEN** una persona adhiere a Valle Solar
- **THEN** el admin de Valle Solar y cada super admin tienen un aviso "Nuevo pedido de <persona> para Valle Solar" que lleva a `/pedidos`

#### Scenario: Falla la resolución
- **WHEN** la transacción que acepta un pedido falla
- **THEN** no queda ni el pedido aceptado ni el aviso

### Requirement: Avisos solo de uno
`GET /api/notificaciones` SHALL return the latest 100 notifications of the caller and `POST /api/notificaciones/leidas` SHALL mark all of the caller's notifications as read; both MUST verify the session on the server and MUST NOT read or change another person's notifications.

#### Scenario: Sin sesión
- **WHEN** alguien sin sesión llama a `GET /api/notificaciones`
- **THEN** recibe 401

#### Scenario: Marcar leídas
- **WHEN** una persona marca todas como leídas
- **THEN** sus avisos quedan con fecha de lectura y los de otras personas no cambian

### Requirement: Campanita y bandeja con las dos fuentes
The bell and `/bandeja` SHALL show server notifications together with the remaining local ones, newest first, hiding the types turned off in Configuración; "Marcar todas como leídas" SHALL mark both sources; the list SHALL refresh on page load, when the tab becomes visible again and every 60 seconds while visible.

#### Scenario: Aviso de otra persona
- **WHEN** el admin acepta la adhesión mientras la persona tiene la app abierta en otra pestaña visible
- **THEN** en un minuto como máximo la campanita de la persona dice "1 notificación sin leer"

#### Scenario: Marcar todas
- **WHEN** la persona tiene un aviso del servidor y uno local sin leer y toca "Marcar todas como leídas"
- **THEN** la campanita dice "Notificaciones, sin novedades"

### Requirement: Servidor sin respuesta
If notifications cannot be fetched, the inbox SHALL show the local ones with the message "No pudimos traer tus avisos; probá de nuevo en un rato" and the bell MUST NOT claim there is nothing new.

#### Scenario: API caída
- **WHEN** `GET /api/notificaciones` responde 500
- **THEN** la bandeja muestra el mensaje y los avisos locales, y la campanita no dice "sin novedades" por los avisos del servidor
