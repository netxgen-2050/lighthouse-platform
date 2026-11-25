## ADDED Requirements

### Requirement: Botón siempre presente
The system SHALL show on every page a "Reportar" button fixed at the bottom-right corner of the viewport, visible while scrolling and on every route, that MUST NOT cover the navigation rail nor the page's primary actions at 1280 px and at 390 px wide (the page reserves space at the bottom so content is never hidden behind it). It MUST be reachable by keyboard and have the accessible name "Reportar un problema o una idea".

#### Scenario: En cualquier página
- **WHEN** una persona abre `/`, `/tribus/valle`, `/sumarte` o `/netx` y hace scroll hasta el final
- **THEN** el botón "Reportar" sigue visible abajo a la derecha

#### Scenario: Celular
- **WHEN** la página se ve con 390 × 844 px
- **THEN** el botón está visible, no tapa el rail y la página no tiene scroll horizontal

### Requirement: Formulario de reporte
The system SHALL open an accessible modal dialog (focus moves into it, Escape closes it, focus returns to the button) with: type (Algo no funciona / Idea o mejora / Pregunta), "¿Qué pasó?" (required, up to 2000 characters), "¿Qué esperabas que pasara?" (optional), and name or email (optional). Errors MUST be shown next to their field and announced.

#### Scenario: Falta la descripción
- **WHEN** la persona envía sin escribir qué pasó
- **THEN** ve el error junto al campo y no se envía nada

#### Scenario: Teclado
- **WHEN** la persona abre el diálogo con Enter y aprieta Escape
- **THEN** el diálogo se cierra y el foco vuelve al botón "Reportar"

### Requirement: Contexto automático
The system SHALL attach to every report the URL and route, page title, viewport size, browser user agent, deployed version (Vercel commit, or "local"), environment (production, preview or local) and timestamp, and MUST show this context in the dialog before sending.

#### Scenario: Ver el contexto
- **WHEN** la persona abre el diálogo en `/tribus/valle`
- **THEN** ve que el reporte incluirá la ruta `/tribus/valle`, el tamaño de pantalla y la versión

### Requirement: Registro como issue de GitHub
The system SHALL send the report from a server route to GitHub Issues of `netxgen-2050/lighthouse-platform`, with a title "[tipo] primeras palabras de qué pasó", a body with all fields and the context, and the labels `reporte` plus the type label (`bug`, `idea` or `pregunta`). The token MUST live only on the server (`REPORTES_GITHUB_TOKEN`) and never reach the browser. On success the dialog MUST show "¡Gracias! Quedó registrado" with the issue number.

#### Scenario: Envío correcto
- **WHEN** la persona envía un reporte válido y GitHub responde que creó el issue 42
- **THEN** ve "¡Gracias! Quedó registrado (#42)"

#### Scenario: El token no se expone
- **WHEN** se inspecciona el código y las respuestas que recibe el navegador
- **THEN** no aparece el token ni la variable `REPORTES_GITHUB_TOKEN`

### Requirement: Sin configuración o con error, nada se pierde
The system SHALL, when the server route is not configured or GitHub fails, tell the person it could not be registered and offer "Copiar el reporte" (the full text with context), keeping what was typed.

#### Scenario: Sin token
- **WHEN** la variable `REPORTES_GITHUB_TOKEN` no está configurada y la persona envía
- **THEN** ve que no se pudo registrar, el botón "Copiar el reporte" y su texto sigue en el formulario

### Requirement: Protección mínima
The server route SHALL validate type and lengths, reject requests whose hidden trap field is filled, and MUST NOT create an issue in those cases.

#### Scenario: Bot
- **WHEN** llega un envío con el campo trampa completado
- **THEN** la ruta responde como si estuviera bien pero no crea ningún issue
