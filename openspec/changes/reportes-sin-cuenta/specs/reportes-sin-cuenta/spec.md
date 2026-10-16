# Spec Delta

## Purpose

Que cualquier persona que pruebe la plataforma, con o sin cuenta, pueda reportar un problema o una idea desde cualquier página, sabiendo qué se publica, y que el servidor lo acepte con protecciones razonables sin base de datos.

## ADDED Requirements

### Requirement: Botón para toda persona
The system SHALL show the "Reportar un problema o una idea" button on every page to every person, with or without a session and whether or not the privacy policy was accepted, including public pages and the consent screen. It MUST keep working with the keyboard (Tab reaches it, Enter opens the dialog, Escape closes it and focus returns to the button).

#### Scenario: Páginas públicas sin sesión
- **WHEN** una persona sin sesión abre `/`, `/tribus/valle`, `/territorios/lighthouse`, `/sumarte` o `/privacidad`
- **THEN** ve el botón "Reportar un problema o una idea"

#### Scenario: Con la política pendiente
- **WHEN** una persona con sesión que todavía no aceptó la política abre `/pactos`
- **THEN** ve la pantalla de consentimiento y también el botón Reportar, que abre el formulario sin cuenta

#### Scenario: Teclado sin sesión
- **WHEN** una persona sin sesión llega al botón con Tab, aprieta Enter y después Escape
- **THEN** el diálogo se abre con el foco adentro, se cierra y el foco vuelve al botón

### Requirement: Modo del formulario
The system SHALL use the with-account form (as today) only when there is a valid session and the current privacy policy is accepted; in any other case it MUST use the without-account form and send the report without session headers.

#### Scenario: Con sesión y política aceptada
- **WHEN** una persona con sesión y la política aceptada abre el diálogo
- **THEN** ve el campo "Tu nombre o email" y el aviso "Tu reporte, y tu contacto si lo dejás, lo ve el equipo de NetX.", como hoy

#### Scenario: Sin sesión
- **WHEN** una persona sin sesión abre el diálogo
- **THEN** ve el campo "Tu email" y el aviso de publicación, y no ve "Tu nombre o email"

### Requirement: Aviso de publicación sin cuenta
The without-account form SHALL show, before the fields, this notice in plain words: "Estás reportando sin cuenta. Tu reporte se publica como un issue en GitHub, donde lo ve el equipo de NetX y quien tenga acceso a ese repositorio. Si dejás tu email, queda escrito en el issue. También se envía lo que ves en «Esto se adjunta al reporte». Tu IP solo se usa un rato para limitar los envíos y no va al issue."

#### Scenario: Ver el aviso
- **WHEN** una persona sin sesión abre el diálogo
- **THEN** ve el aviso completo y la sección "Esto se adjunta al reporte" con los datos que se envían

### Requirement: Email opcional sin cuenta
The without-account form SHALL offer an optional field labelled "Tu email" (help text: "Solo si querés que te respondamos. Queda escrito en el issue.", tied as its accessible description). If filled, it MUST look like an email (something@something.something, up to 200 characters); otherwise the error "Escribí un email válido o dejalo vacío." is shown next to the field, announced, focus goes to the field and nothing is sent.

#### Scenario: Sin email
- **WHEN** una persona sin sesión envía un reporte válido con el email vacío
- **THEN** el reporte se envía

#### Scenario: Email mal escrito
- **WHEN** una persona sin sesión escribe "juan" en "Tu email" y envía
- **THEN** ve "Error: Escribí un email válido o dejalo vacío." junto al campo, el foco va al campo y no se envía nada

### Requirement: Contexto sin datos sensibles sin cuenta
Without an account, the context shown and sent SHALL include the URL and route without query string or fragment; the rest of the context stays as today. The server MUST strip query and fragment again before writing the issue, and the issue MUST NOT include the IP, request headers, cookies or session identifiers.

#### Scenario: URL con parámetros
- **WHEN** una persona sin sesión abre el diálogo en `/sumarte?volver=%2Fpactos`
- **THEN** el contexto muestra la ruta `/sumarte`, sin `?volver=`

#### Scenario: Issue sin IP
- **WHEN** el servidor crea un issue sin cuenta para un pedido que llegó desde la IP 203.0.113.7
- **THEN** ni el título ni el cuerpo ni las etiquetas contienen `203.0.113.7`

### Requirement: Servidor acepta pedidos sin sesión
`POST /api/reportes` SHALL accept requests without a valid session and treat them as without-account reports: validated with the email rule, labelled `reporte`, the type label and `sin-cuenta`, with a "**Enviado sin cuenta**" line in the body. A `privacidad` request without account MUST be ignored (no `privacidad` label). Requests with a valid session MUST behave as today, without the `sin-cuenta` label.

#### Scenario: Sin sesión crea el issue
- **WHEN** llega un reporte válido sin sesión y GitHub responde que creó el issue 51
- **THEN** responde 200 con el número 51 y el issue lleva las etiquetas `reporte`, el tipo y `sin-cuenta`

#### Scenario: Con sesión, como hoy
- **WHEN** llega un reporte válido con una sesión válida
- **THEN** el issue lleva solo `reporte` y el tipo

#### Scenario: Privacidad sin cuenta
- **WHEN** llega un pedido sin sesión con tipo "pregunta" y `privacidad: true`
- **THEN** el issue no lleva la etiqueta `privacidad`

<!-- arquitecto: requisito agregado en la revisión de arquitectura, a pedido de Gus (pedidos desde sitios ajenos). -->
### Requirement: Solo pedidos desde nuestras páginas
The server route SHALL reject, before reading the body and without creating anything, any request whose `Content-Type` is not `application/json` (status 415) and any request with an `Origin` header whose host differs from the request host (status 403). Requests without an `Origin` header are not rejected by this rule. This applies with or without session.

#### Scenario: Formulario de otro sitio
- **WHEN** llega un pedido sin sesión con `Content-Type: text/plain`
- **THEN** responde 415 y no llama a GitHub

#### Scenario: Origen ajeno
- **WHEN** llega un pedido sin sesión con `Content-Type: application/json` y `Origin: https://otro.example`
- **THEN** responde 403 y no llama a GitHub

#### Scenario: Desde la propia plataforma
- **WHEN** llega un pedido válido sin sesión cuyo `Origin` tiene el mismo host que el pedido
- **THEN** se procesa como cualquier reporte sin cuenta

### Requirement: Tamaño máximo del pedido
The server route SHALL reject with 413, without creating anything, any request whose body is larger than 64 KB, checking the declared length first and the bytes actually read after.

#### Scenario: Cuerpo enorme
- **WHEN** llega un pedido de 100 KB, con o sin sesión
- **THEN** responde 413 y no llama a GitHub

### Requirement: Campo trampa en silencio
The server route SHALL answer `{ ok: true, numero: 0 }` with status 200 to any request with the trap field filled, with or without session, MUST NOT create an issue and MUST NOT count it toward the limit. The dialog then shows "¡Gracias! Quedó registrado" without a number.

#### Scenario: Bot sin sesión
- **WHEN** llega un pedido sin sesión con el campo trampa completado
- **THEN** responde 200 `{ ok: true, numero: 0 }` y no llama a GitHub

### Requirement: Límite por IP sin cuenta
The server route SHALL limit valid without-account reports to 5 per IP every 10 minutes and to 30 in total per server instance every hour, kept only in memory. IPv6 addresses SHALL be grouped by their /64 block. Over the limit it MUST answer 429 with a `Retry-After` header and the seconds to wait, without calling GitHub. The IP MUST NOT be logged nor stored in clear text, and the in-memory key MUST be a salted hash. A report that could not be created (GitHub failed or no token) MUST NOT count toward the limit. Reports with a session are not limited by this rule.
<!-- arquitecto: /64, hash con sal y "lo que falla no cuenta" agregados en la revisión de arquitectura, a pedido de Gus. -->

#### Scenario: Sexto reporte en 10 minutos
- **WHEN** la misma IP manda sin sesión un sexto reporte válido dentro de 10 minutos
- **THEN** responde 429 con `Retry-After` y no llama a GitHub

#### Scenario: Pasada la ventana
- **WHEN** pasan 10 minutos desde el primero de esos reportes
- **THEN** esa IP puede volver a reportar

#### Scenario: Misma red IPv6
- **WHEN** ya se mandaron sin sesión 5 reportes válidos en 10 minutos desde `2001:db8:1:2::a` y llega un sexto desde `2001:db8:1:2::b`
- **THEN** responde 429 y no llama a GitHub

#### Scenario: Falla de GitHub no consume cupo
- **WHEN** la misma IP manda sin sesión 5 reportes válidos que fallan porque GitHub no responde, y después un sexto
- **THEN** el sexto no recibe 429

#### Scenario: Con sesión no cuenta
- **WHEN** una persona con sesión válida manda 6 reportes en 10 minutos desde la misma IP
- **THEN** los 6 se crean

### Requirement: Mensaje claro al llegar al límite
The dialog SHALL, on a 429 answer, show "Llegaste al límite de reportes por ahora. Probá de nuevo en N minutos." (N rounded up from the wait, at least 1; "en un rato" if unknown), keep what was typed and offer "Copiar el reporte".

#### Scenario: Límite alcanzado
- **WHEN** una persona sin sesión envía y la ruta responde 429 con 300 segundos de espera
- **THEN** ve "Llegaste al límite de reportes por ahora. Probá de nuevo en 5 minutos.", su texto sigue en el formulario y ve "Copiar el reporte"

### Requirement: Accesibilidad del modo sin cuenta
The without-account dialog SHALL pass the axe audit (WCAG 2.1 A and AA) without serious or critical violations, also with an error or the limit message visible, and MUST NOT communicate anything only with color.

#### Scenario: Axe sin sesión
- **WHEN** una persona sin sesión abre el diálogo, envía con el email mal escrito y se ve el error
- **THEN** axe no reporta violaciones serias ni críticas
