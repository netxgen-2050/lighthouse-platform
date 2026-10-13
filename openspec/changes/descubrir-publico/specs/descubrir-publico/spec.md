## ADDED Requirements

### Requirement: Descubrir sin sesión
The system SHALL show without a session the pages `/`, `/territorios/[id]`, `/tribus`, `/tribus/[id]` and `/tribus/[id]/manifiesto`, listed in a single place; every other page MUST keep showing the entry screen without a session.

#### Scenario: Territorio sin entrar
- **WHEN** una persona sin sesión abre `/territorios/lighthouse`
- **THEN** ve el mapa, la ficha lateral y el panel de tribus

#### Scenario: Pactos sin entrar
- **WHEN** una persona sin sesión abre `/pactos`
- **THEN** ve la pantalla de entrada

### Requirement: Acciones que piden cuenta
On public pages, actions that need an account SHALL be replaced by a call to log in ("Entrá para …") that opens the Privy login and returns to the same page.

#### Scenario: Adherir sin entrar
- **WHEN** una persona sin sesión abre `/tribus/valle`
- **THEN** puede leer el manifiesto y en lugar de "Adherir al manifiesto de la tribu" ve "Entrá para adherir"

#### Scenario: Consultar por un lote sin entrar
- **WHEN** una persona sin sesión elige una finca disponible en el mapa
- **THEN** ve "Entrá para consultar por este lote" en lugar del botón de consulta

### Requirement: Navegación sin sesión
Without a session the rail SHALL show Descubrir fully and the other destinations with a lock and the label "Entrá para ver"; the top bar SHALL show only "Entrar"; the report button MUST NOT appear; Hifa SHALL be available but sending to the team MUST ask to log in first.

#### Scenario: Rail sin entrar
- **WHEN** una persona sin sesión mira el rail
- **THEN** Inicio, Territorio y Tribus están disponibles y Pactos aparece con candado y "Entrá para ver"

### Requirement: Sin datos guardados sin sesión
Without a session the system MUST NOT store data under any person's prefix.

#### Scenario: Mirar sin entrar
- **WHEN** una persona sin sesión recorre las páginas públicas
- **THEN** no se crea ninguna clave de persona en el navegador
