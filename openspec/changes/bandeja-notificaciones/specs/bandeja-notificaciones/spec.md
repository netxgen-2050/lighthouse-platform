## ADDED Requirements

### Requirement: Registro de eventos
The system SHALL record activity and notification events in the browser when the listed actions happen, each with type, text, date and link.

#### Scenario: Adhesión aceptada
- **WHEN** la persona adhiere a Valle Solar y la comunidad la acepta (simulado)
- **THEN** queda una actividad "Adheriste al manifiesto de Valle Solar" y una notificación "Valle Solar aceptó tu adhesión"

### Requirement: Campanita
The system SHALL show a bell with the unread count, announced in text, linking to `/bandeja`.

#### Scenario: Sin leer
- **WHEN** hay 2 notificaciones sin leer
- **THEN** la campanita muestra 2 y su nombre accesible dice "2 notificaciones sin leer"

### Requirement: Bandeja
`/bandeja` SHALL list notifications newest first with their links, allow marking all as read, and show the upcoming-messages note.

#### Scenario: Marcar leídas
- **WHEN** la persona aprieta "Marcar todas como leídas"
- **THEN** la campanita deja de mostrar un número
