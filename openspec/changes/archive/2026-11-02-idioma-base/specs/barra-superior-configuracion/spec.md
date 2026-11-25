## MODIFIED Requirements

### Requirement: Barra superior
The system SHALL show at the top right of every page NetX (marked internal), the bell with the unread count, the language selector (ES / EN) and the avatar menu with Perfil, Pasaporte, Mi recorrido and Configuración; the rail MUST no longer contain them. The language selector SHALL be shown with and without a session.

#### Scenario: Ver la barra
- **WHEN** una persona abre cualquier página en la computadora
- **THEN** ve NetX, la campanita, el selector de idioma y el avatar arriba a la derecha, y el rail solo con la navegación

#### Scenario: Sin cuenta
- **WHEN** una persona sin sesión abre la portada
- **THEN** ve el selector de idioma en la barra superior

### Requirement: Celular
At 390 px wide the top bar SHALL be compact, keep the four actions reachable (NetX, bell, language selector and avatar), and cause no horizontal scroll.

#### Scenario: 390 px
- **WHEN** la página se ve con 390 × 844 px
- **THEN** la barra superior muestra NetX, la campanita, el selector de idioma y el avatar sin desbordar

## ADDED Requirements

### Requirement: Idioma en Configuración
`/configuracion` SHALL let the person choose Español or English in the "Idioma" section; the choice SHALL apply immediately to the whole platform and be the same preference as the top bar selector.

#### Scenario: Elegir English
- **WHEN** la persona elige "English" en Configuración
- **THEN** el marco de la plataforma pasa a inglés sin recargar a mano y el selector de la barra marca "EN"
