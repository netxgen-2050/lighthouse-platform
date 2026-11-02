## ADDED Requirements

### Requirement: Botón de Hifa
The system SHALL show on every page a fixed button at the bottom-right with Hifa's SVG avatar and the accessible name "Hablar con Hifa".

#### Scenario: En cualquier página
- **WHEN** una persona abre `/tribus` o `/sumarte`
- **THEN** ve el botón de Hifa abajo a la derecha

### Requirement: Ventana de chat
Activating it SHALL open a chat window with Hifa's greeting and the four shortcuts; Escape or the close button MUST close it and return focus to the button.

#### Scenario: Abrir y cerrar
- **WHEN** la persona abre el chat y aprieta Escape
- **THEN** el chat se cierra y el foco vuelve al botón

### Requirement: Honesta e imaginativa
Every reply SHALL come from the script, be honest that Hifa cannot yet read, understand, think or coordinate for people, and invite the person to imagine the mycelium-like assistant.

#### Scenario: Escribir algo
- **WHEN** la persona escribe "necesito una pala"
- **THEN** Hifa responde con una frase del guion que reconoce que todavía no entiende y la invita a imaginar

### Requirement: Pasar al equipo
After an idea or a need Hifa SHALL offer to send it to the team; if accepted it SHALL use `/api/reportes` and confirm with the issue number, or offer to copy it if it fails.

#### Scenario: Enviar al equipo
- **WHEN** la persona acepta y `/api/reportes` responde con el issue 50
- **THEN** Hifa confirma "Se lo pasé al equipo (#50)"

### Requirement: Reportar a media altura
The report button SHALL be fixed to the right edge at half the viewport height and MUST NOT overlap Hifa's button.

#### Scenario: Sin superposición
- **WHEN** la página se ve a 1280 px y a 390 px
- **THEN** el botón Reportar está pegado al borde derecho a media altura y no se superpone con Hifa
