## ADDED Requirements

### Requirement: Tooltip flotante
The system SHALL show the explanation of a legal term as a floating tooltip anchored to its ⚖, layered above the page content. Showing it MUST NOT move any other content, and it MUST NOT cover the ⚖ it belongs to nor the next ⚖ on the page. The tooltip MUST have `role="tooltip"` and the ⚖ MUST reference it with `aria-describedby` while it is visible. The ⚖ keeps its accessible name "Qué significa legalmente: <título>".

#### Scenario: Dos ⚖ cercanos
- **WHEN** en `/tribus/valle` se muestra el tooltip de "Ritual de entrada"
- **THEN** el contenido de la página no se desplaza
- **AND** el ⚖ de "Forma jurídica" sigue visible y se puede pasar el mouse sobre él

### Requirement: Con mouse
The system SHALL show the tooltip when the pointer enters the ⚖ and hide it when the pointer leaves both the ⚖ and the tooltip. Moving the pointer from the ⚖ onto the tooltip MUST keep it visible.

#### Scenario: Pasar y sacar el mouse
- **WHEN** la persona pasa el mouse sobre el ⚖ de "Ritual de entrada"
- **THEN** ve el título y la explicación
- **AND** al sacar el mouse el tooltip desaparece

#### Scenario: Leer el tooltip
- **WHEN** la persona mueve el mouse desde el ⚖ hasta el tooltip
- **THEN** el tooltip sigue visible

### Requirement: Con teclado
The system SHALL show the tooltip when the ⚖ receives keyboard focus and hide it when the ⚖ loses focus. Escape MUST hide it without moving focus.

#### Scenario: Tab y Escape
- **WHEN** la persona llega con Tab al ⚖ de "Ritual de entrada"
- **THEN** ve la explicación
- **AND** Escape la esconde y el foco sigue en el ⚖
- **AND** al seguir con Tab la explicación no vuelve a aparecer para ese ⚖

### Requirement: En pantallas táctiles
The system SHALL, on devices without hover, toggle the tooltip with a tap on the ⚖ and hide it with a tap anywhere else.

#### Scenario: Celular
- **WHEN** en un celular la persona toca el ⚖
- **THEN** ve la explicación
- **AND** al tocar fuera del tooltip, desaparece
