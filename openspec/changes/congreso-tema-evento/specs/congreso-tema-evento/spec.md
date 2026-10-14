# Spec Delta

## Purpose

Da al Congreso una identidad visual propia (colores, tipografía y movimiento) con alcance limitado a su página, y las piezas base portables que la usan, sin romper la regla de colores del resto de la plataforma ni su accesibilidad.

## ADDED Requirements

### Requirement: Tokens del evento con alcance
The system SHALL define the event palette as `--evento-*` custom properties declared only inside the `.tema-evento` container, in a single stylesheet under `app/congreso/`. Every selector in that stylesheet MUST include `.tema-evento`, so the theme never affects the NetX rail, top bar, bell or Hifa.

#### Scenario: Todo selector bajo el contenedor
- **WHEN** corren los tests unitarios
- **THEN** cada selector de la hoja del tema del evento contiene `.tema-evento`

#### Scenario: El marco de NetX no cambia
- **WHEN** una persona navega de `/congreso` a otra página
- **THEN** el rail, la barra superior y el resto de las páginas se ven con los tokens de NetX de siempre

### Requirement: Colores del evento solo dentro del Congreso
The system SHALL allow literal color values (hex, `rgb()`, `hsl()`) only inside `--evento-*` declarations of the event stylesheet. The `--evento-*` tokens MUST NOT be referenced outside `app/congreso/`. The rest of `app/` and `components/` keeps the rule "no loose colors".

#### Scenario: Un color suelto fuera del tema del evento
- **WHEN** un archivo de `app/` o `components/` fuera de la hoja del tema usa un color hexadecimal
- **THEN** el test de colores falla

#### Scenario: Un token del evento fuera del Congreso
- **WHEN** un archivo fuera de `app/congreso/` usa `--evento-`
- **THEN** el test de colores falla

#### Scenario: Un color literal fuera de una declaración de token
- **WHEN** la hoja del tema usa un color literal en una regla que no declara un token `--evento-*`
- **THEN** el test de colores falla

### Requirement: Contraste AA del tema
Every text and background combination declared for the event theme SHALL meet WCAG AA contrast: 4.5:1 for normal text and 3:1 for large text (24px or more, or 18.66px bold or more) and for focus outlines and component borders. For gradient backgrounds, the check MUST use every gradient stop that lies behind text.

#### Scenario: Pares de contraste
- **WHEN** corren los tests unitarios
- **THEN** cada par declarado (texto, fondo) del tema cumple el mínimo AA que le corresponde

### Requirement: El tema oscuro de NetX no aplica dentro del evento
The event theme SHALL keep its own colors regardless of the NetX appearance setting (light or dark). The NetX frame around it MUST keep following that setting.

#### Scenario: NetX en tema oscuro
- **WHEN** la persona tiene el tema oscuro de NetX y abre una página con el tema del evento
- **THEN** el contenido del evento conserva su paleta y el rail y la barra superior se ven oscuros

### Requirement: Tipografía del evento solo en el Congreso
The system SHALL load the Unbounded (headings) and Hanken Grotesk (text) fonts only for the event theme container, with system fallbacks. Other pages MUST NOT load them.

#### Scenario: Otra página no carga las fuentes del evento
- **WHEN** una persona abre `/tribus`
- **THEN** la página no pide las fuentes Unbounded ni Hanken Grotesk

### Requirement: Piezas del evento portables
The event pieces SHALL receive all their content through props (from the event access function) and MUST NOT depend on the NetX frame: no session, permissions, rail, top bar, browser storage or NetX routing. Links in event pieces MUST be plain anchors whose destinations come from props.

#### Scenario: Importaciones permitidas
- **WHEN** corren los tests unitarios
- **THEN** ningún archivo de las piezas del evento importa módulos de sesión, permisos, almacenamiento de demo, el rail, la barra superior ni `next/navigation`

### Requirement: Botones del evento
The system SHALL provide event buttons in three variants: "corona" (primary), "línea" (outline on light background) and "línea clara" (outline on dark background). They MUST render as a link when given a destination and as a button otherwise, and show a visible focus outline.

#### Scenario: Botón como enlace
- **WHEN** se dibuja un botón del evento con destino `#entradas`
- **THEN** es un enlace a `#entradas` con la variante pedida

### Requirement: Barra flotante del evento
The system SHALL provide a floating event bar with the event logo and name, a navigation landmark labeled "Secciones del evento" with the anchors it receives, the language indicator "ES" and an "Entradas" button. On narrow screens the anchors MAY hide, but the logo and "Entradas" MUST stay.

#### Scenario: Anclas de la barra
- **WHEN** se dibuja la barra con las anclas "El encuentro" (`#acerca`) y "Preguntas" (`#faq`)
- **THEN** hay una navegación "Secciones del evento" con esos dos enlaces y un enlace "Entradas"

### Requirement: Chip de fechas
The system SHALL show the event date range from the content as a chip with the days and the month and year (for example "5–9" and "febrero 2027").

#### Scenario: Rango de fechas
- **WHEN** las fechas del evento son del 5 al 9 de febrero de 2027
- **THEN** el chip muestra "5–9" y "febrero 2027"

### Requirement: Cuenta regresiva
The system SHALL show a countdown in days, hours and minutes to the key moment of the event, using its UTC offset. Before it is computed in the browser it MUST NOT show 0; it shows "—" with an accessible text. When the moment has passed it MUST show "Llegó el día" instead of zeros.

#### Scenario: Faltan días
- **WHEN** faltan 10 días, 3 horas y 5 minutos para `2027-02-06T12:00:00-03:00`
- **THEN** la cuenta muestra 10 días, 3 horas y 5 minutos

#### Scenario: Ya pasó
- **WHEN** la fecha actual es posterior al momento clave
- **THEN** la cuenta muestra "Llegó el día" y ningún cero

### Requirement: Tarjeta de tipo de entrada
The system SHALL provide a ticket type card with tag, name, description, price and action button. When the type is an example, the price MUST show the mark "ejemplo" next to it. The featured type MUST be distinguished by more than color (tag text and a thicker border).

#### Scenario: Precio de ejemplo
- **WHEN** se dibuja un tipo de entrada de ejemplo con precio USD 290
- **THEN** la tarjeta muestra "USD 290" y la marca "ejemplo"

#### Scenario: Sin precio
- **WHEN** se dibuja un tipo de entrada sin precio
- **THEN** la tarjeta muestra "Precio sin dato" y no muestra 0

### Requirement: Eclipse animado una sola vez
The system SHALL provide the hero eclipse illustration, decorative (hidden from assistive technology), in which the moon covers the sun once on load, leaving the ring. With "reducir animaciones" (NetX setting or the system preference), the eclipse MUST appear already formed, with no movement.

#### Scenario: Reducir animaciones
- **WHEN** la persona tiene "reducir animaciones" activado y se dibuja el eclipse
- **THEN** la luna ya está sobre el sol desde el primer cuadro y no hay animación
