## ADDED Requirements

### Requirement: Grupos
The rail SHALL show the destinations grouped as Descubrir, Participar and Sumarte, in that order, from the single navigation list.

#### Scenario: Grupos
- **WHEN** una persona mira el rail en la computadora
- **THEN** ve los títulos de grupo y los destinos debajo de cada uno

### Requirement: Menú de la persona
The rail SHALL end with the bell and an avatar button that opens a menu with Perfil, Pasaporte and Mi recorrido; the menu MUST be keyboard accessible and close with Escape.

#### Scenario: Abrir el menú
- **WHEN** la persona activa el avatar con Enter
- **THEN** ve Perfil, Pasaporte y Mi recorrido, y Escape lo cierra

### Requirement: Destino actual en el menú
When the current page belongs to the avatar menu, the avatar SHALL be marked as current.

#### Scenario: Pasaporte
- **WHEN** la persona está en `/pasaporte`
- **THEN** el avatar del rail se marca como actual
