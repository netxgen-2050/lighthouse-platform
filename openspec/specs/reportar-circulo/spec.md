# reportar-circulo Specification

## Purpose
TBD - created by archiving change reportar-circulo. Update Purpose after archive.

## Requirements

### Requirement: Círculo con bicho
The report button SHALL be a circle the same size as Hifa's button, showing only an enlarged bug icon on the current green, surrounded by a dashed black ring, fixed to the right edge at half the viewport height.

#### Scenario: Ver el botón
- **WHEN** una persona abre cualquier página
- **THEN** ve un círculo verde con el bicho y un anillo negro punteado, a media altura del borde derecho, sin texto

### Requirement: Accesible
The button SHALL keep the accessible name "Reportar un problema o una idea" and show a "Reportar" tooltip on hover and focus.

#### Scenario: Teclado
- **WHEN** la persona llega al botón con Tab
- **THEN** ve el tooltip "Reportar" y el lector anuncia su nombre completo
