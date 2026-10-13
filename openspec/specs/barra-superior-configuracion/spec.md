# barra-superior-configuracion Specification

## Purpose
TBD - created by archiving change barra-superior-configuracion. Update Purpose after archive.

## Requirements

### Requirement: Barra superior
The system SHALL show at the top right of every page NetX (marked internal), the bell with the unread count and the avatar menu with Perfil, Pasaporte, Mi recorrido and Configuración; the rail MUST no longer contain them.

#### Scenario: Ver la barra
- **WHEN** una persona abre cualquier página en la computadora
- **THEN** ve NetX, la campanita y el avatar arriba a la derecha, y el rail solo con la navegación

### Requirement: Menú del avatar
The avatar menu SHALL be keyboard accessible, close with Escape and mark the avatar as current when the page belongs to the menu.

#### Scenario: En configuración
- **WHEN** la persona está en `/configuracion`
- **THEN** el avatar se marca como actual

### Requirement: Apariencia
`/configuracion` SHALL let the person choose light, dark or system theme, normal or large text, and reduced motion, applied immediately and kept after reload.

#### Scenario: Tema oscuro
- **WHEN** la persona elige "Oscuro"
- **THEN** toda la app cambia a la paleta oscura y sigue así al recargar

### Requirement: Notificaciones por tipo
Notification types turned off SHALL not appear in the bell count nor in `/bandeja`.

#### Scenario: Apagar rondas
- **WHEN** la persona apaga "Rondas de reconocimiento"
- **THEN** esas notificaciones dejan de contarse y de verse

### Requirement: Ocultar a Hifa
Turning the assistant off SHALL hide Hifa's button on every page.

#### Scenario: Ocultar
- **WHEN** la persona apaga "Mostrar a Hifa"
- **THEN** el botón de Hifa desaparece en todas las páginas

### Requirement: Moneda
Amounts in `/sumarte` and in the money contributions shown in Pactos SHALL be shown in the chosen reference currency, with the sample exchange rate disclosed. Other screens (tribe pages, Vista NetX, Compromisos) and the amount the person types in Pactos stay in USD.

#### Scenario: ARS
- **WHEN** la persona elige ARS y abre `/sumarte`
- **THEN** ve los precios en ARS con la nota del tipo de cambio de ejemplo

#### Scenario: Fuera de alcance
- **WHEN** la persona elige ARS y abre la ficha de una tribu, `/netx` o `/compromisos`
- **THEN** los montos siguen en USD

### Requirement: Celular
At 390 px wide the top bar SHALL be compact, keep the three actions reachable, and cause no horizontal scroll.

#### Scenario: 390 px
- **WHEN** la página se ve con 390 × 844 px
- **THEN** la barra superior muestra NetX, la campanita y el avatar sin desbordar
