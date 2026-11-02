# Spec Delta

## MODIFIED Requirements

### Requirement: Descubrir sin sesión
The system SHALL show without a session the pages `/`, `/territorios/[id]`, `/tribus`, `/tribus/[id]`, `/tribus/[id]/manifiesto`, `/lotes` and `/lotes/[id]`, listed in a single place; every other page MUST keep showing the entry screen without a session.

#### Scenario: Territorio sin entrar
- **WHEN** una persona sin sesión abre `/territorios/lighthouse`
- **THEN** ve el mapa, la ficha lateral y el panel de tribus

#### Scenario: Lotes sin entrar
- **WHEN** una persona sin sesión abre `/lotes/lote-7`
- **THEN** ve la ficha y, en lugar del botón de reservar, "Entrá para reservar este lote"

#### Scenario: Pactos sin entrar
- **WHEN** una persona sin sesión abre `/pactos`
- **THEN** ve la pantalla de entrada
