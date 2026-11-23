# Spec Delta

## MODIFIED Requirements

### Requirement: Grupos
The rail SHALL show the destinations grouped as Descubrir (Inicio, Territorio, Lotes), Sumarte and Lo que viene (Tribus, Pactos, Semillas, Fogón), in that order, from the single navigation list. The change of group MUST NOT change who can open each destination.

#### Scenario: Grupos
- **WHEN** una persona mira el rail en la computadora
- **THEN** ve los títulos de grupo y los destinos debajo de cada uno
- **AND** Inicio, Territorio y Sumarte aparecen antes que el título "Lo que viene"

#### Scenario: En inglés
- **WHEN** una persona mira el rail con el idioma en inglés
- **THEN** ve el grupo "Coming next" con Tribes, Pacts, Semillas y Fireside

#### Scenario: Sin cuenta
- **WHEN** una persona sin cuenta mira el rail
- **THEN** Tribus sigue disponible, y Pactos, Semillas y Fogón se ven deshabilitados con su ayuda "Sumate para participar"
