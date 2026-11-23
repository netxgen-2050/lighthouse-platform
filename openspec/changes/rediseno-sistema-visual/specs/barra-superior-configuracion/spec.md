# Spec Delta

## MODIFIED Requirements

### Requirement: Apariencia
`/configuracion` SHALL let the person choose light, dark or system theme, normal or large text, and reduced motion, applied immediately and kept after reload. The default theme, for a person who never chose one, SHALL be dark; a choice already saved ("Claro", "Oscuro" or "Sistema") MUST be kept.

#### Scenario: Tema oscuro
- **WHEN** la persona elige "Oscuro"
- **THEN** toda la app cambia a la paleta oscura y sigue así al recargar

#### Scenario: Primera visita
- **WHEN** una persona sin preferencias guardadas abre la portada con el sistema en modo claro
- **THEN** la app se ve con el tema oscuro, sin parpadeo del tema claro al cargar

#### Scenario: Preferencia guardada
- **WHEN** una persona que antes eligió "Claro" vuelve a entrar
- **THEN** la app se ve con el tema claro

#### Scenario: Sistema
- **WHEN** una persona que eligió "Sistema" abre la app con el sistema en modo claro
- **THEN** la app se ve con el tema claro
