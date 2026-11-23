# Spec Delta

## MODIFIED Requirements

### Requirement: Celular
At 390 px wide the top bar SHALL be compact, keep the "Menú" button and the four actions reachable (NetX for whoever has permission, bell, language selector and avatar, or "Sumarte" and "Entrar" without a session), and cause no horizontal scroll. Every button MUST have a touch area of at least 44 × 44 px.

#### Scenario: 390 px
- **WHEN** la página se ve con 390 × 844 px
- **THEN** la barra superior muestra el botón "Menú", NetX, la campanita, el selector de idioma y el avatar sin desbordar

#### Scenario: Sin sesión
- **WHEN** una persona sin sesión ve la página con 390 × 844 px
- **THEN** la barra superior muestra el botón "Menú", el selector de idioma, "Sumarte" y "Entrar" sin desbordar
