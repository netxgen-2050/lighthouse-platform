# Spec Delta

## ADDED Requirements

### Requirement: Sumar al padrón de una consulta abierta
The "Consultas del Fogón" section in `/netx` SHALL offer the super admin a "Sumar al padrón" action on each open consultation. It MUST list only people in the database who are not on the roll yet, with checkboxes, plus a field to add an existing person by email. After confirming, the list SHALL show the updated "votaron X de N". Closed consultations MUST NOT offer the action.

#### Scenario: Sumar a Martín en U2
- **WHEN** U2 está abierta con 7 personas en el padrón, Martín ya está en "Personas y roles" y el super admin lo marca en "Sumar al padrón" y confirma
- **THEN** la lista muestra "votaron X de 8" y Martín ve U2 en `/fogon/consultas`

#### Scenario: Consulta cerrada
- **WHEN** el super admin mira una consulta cerrada en la lista
- **THEN** no ve "Sumar al padrón"

#### Scenario: Email que no está en la base
- **WHEN** el super admin escribe en el campo un email que no está en `personas` y confirma
- **THEN** ve, junto al campo y anunciado, "Ese email no está en la base. Sumalo primero en Personas y roles." y no se suma nadie

### Requirement: Ruta para sumar al padrón
`POST /api/fogon/consultas/[slug]/padron` SHALL add the given existing people to the roll in a single transaction, all or nothing, and record who added them and when. It MUST check, in this order: session (401), current consent (403), super admin role (403), consultation exists (404), consultation effectively open (409), every email exists in `personas` (422 listing the unknown ones). People already on the roll MUST NOT be duplicated nor make the request fail.

#### Scenario: Persona sin rol
- **WHEN** una persona con rol `persona` llama a la ruta
- **THEN** responde 403 y el padrón no cambia

#### Scenario: Cerrada por fecha
- **WHEN** el super admin llama a la ruta para una consulta cuya fecha de cierre ya pasó, aunque nadie la haya cerrado a mano
- **THEN** responde 409 y el padrón no cambia

#### Scenario: Uno desconocido entre dos
- **WHEN** el super admin pide sumar a una persona existente y a un email que no está en la base
- **THEN** responde 422 nombrando el email desconocido y no suma a ninguna de las dos

#### Scenario: Ya estaba
- **WHEN** el super admin pide sumar a alguien que ya está en el padrón
- **THEN** responde 200, el padrón queda con una sola fila para esa persona y la respuesta dice que ya estaba

### Requirement: El padrón ve que cambió
The consultation detail SHALL tell everyone who can open it that the roll changed after opening, as "El padrón cambió después de abrirse: se sumaron M personas (la última, el DD-MM)." ("se sumó 1 persona" when M is 1), without names, for open and secret votes alike. If the roll never changed after creation the message MUST NOT appear.

#### Scenario: Se sumó una persona
- **WHEN** una persona del padrón abre U2 después de que el super admin sumó a Martín el 20 de octubre
- **THEN** ve "El padrón cambió después de abrirse: se sumó 1 persona (la última, el 20-10)." sin el nombre de Martín en ese aviso

#### Scenario: Padrón sin cambios
- **WHEN** una persona del padrón abre una consulta a la que nadie se sumó después de crearla
- **THEN** no ve el aviso de cambio del padrón

### Requirement: Accesibilidad del diálogo del padrón
The "Sumar al padrón" dialog SHALL be fully usable with the keyboard (focus moves into the dialog on open and returns to the button on close), every checkbox SHALL have a visible label, errors SHALL be tied to their field and announced, and the axe audit MUST pass with the dialog open and with an error visible.

#### Scenario: Teclado
- **WHEN** el super admin llega a "Sumar al padrón" con Tab, aprieta Enter, marca una casilla con Espacio y cierra con Escape
- **THEN** el foco entra al diálogo, la casilla queda marcada y al cerrar el foco vuelve al botón

#### Scenario: Axe con error
- **WHEN** el diálogo está abierto con el error de email desconocido a la vista
- **THEN** axe no reporta violaciones serias ni críticas
