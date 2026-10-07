## ADDED Requirements

### Requirement: Registrar un compromiso de tiempo o bienes
The system SHALL offer at `/compromisos` a form with: type ("Ofrezco" / "Necesito"), class ("Tiempo" / "Bienes"), description (required, 1 to 140 characters after trimming), an indicative quantity and a recipient ("El Lighthouse en general" or one of the example tribes). For "Tiempo" the quantity MUST be an integer number of hours per month between 1 and 160, or empty. For "Bienes" it MUST be optional free text up to 60 characters. There MUST NOT be any money class, amount, currency or contribution range.

#### Scenario: Registrar una oferta de tiempo
- **WHEN** una persona elige "Ofrezco", "Tiempo", escribe "Taller de compost", pone 8 horas por mes, elige "Semilla Viva" y aprieta "Registrar"
- **THEN** el compromiso aparece en "Tus compromisos" como "Ofrezco · Tiempo · Taller de compost · 8 h/mes · Para: Semilla Viva"

#### Scenario: Registrar una necesidad de bienes sin cantidad
- **WHEN** elige "Necesito", "Bienes", escribe "Herramientas de poda", deja la cantidad vacía y aprieta "Registrar"
- **THEN** el compromiso aparece con la cantidad "sin dato"

#### Scenario: Descripción vacía
- **WHEN** aprieta "Registrar" sin descripción
- **THEN** ve un mensaje de error asociado al campo (con `aria-describedby`), el foco va al campo y no se agrega nada

#### Scenario: Horas fuera de rango
- **WHEN** elige "Tiempo" y escribe 0, 161 o 2,5 horas
- **THEN** ve un mensaje de error asociado al campo y no se agrega nada

#### Scenario: Sin opciones de plata
- **WHEN** se inspeccionan las opciones de "Clase" y el texto de la página
- **THEN** solo existen "Tiempo" y "Bienes", y no aparecen "USD", "$", "plata", "monto" ni "aporte"

### Requirement: Ver y quitar compromisos
The system SHALL list registered commitments in "Tus compromisos", most recent first, each with a "Quitar" button whose accessible name includes the description. It SHALL offer "Borrar todo". When the list is empty it SHALL show "Todavía no registraste compromisos."

#### Scenario: Quitar uno
- **WHEN** hay dos compromisos y la persona aprieta "Quitar" en el primero
- **THEN** queda solo el segundo

#### Scenario: Borrar todo
- **WHEN** aprieta "Borrar todo"
- **THEN** la lista queda vacía y se muestra "Todavía no registraste compromisos."

### Requirement: Datos solo en el navegador
The system SHALL keep commitments only in the browser, show the notice "Modo demostración: lo que registres queda solo en este navegador.", and MUST NOT send them to any server.

#### Scenario: Recargar
- **WHEN** la persona registró dos compromisos y recarga la página
- **THEN** sigue viendo los dos

#### Scenario: Sin pedidos al servidor
- **WHEN** registra, quita y borra compromisos
- **THEN** no se hizo ningún pedido de red que contenga sus descripciones

### Requirement: Datos de ejemplo y accesibilidad
The system SHALL show the example-data notice (the tribes in the recipient selector are examples). The whole flow SHALL be usable with the keyboard only, every field SHALL have a visible label, and the confirmation of a new commitment SHALL be announced with `aria-live="polite"`.

#### Scenario: Solo teclado
- **WHEN** la persona completa y envía el formulario usando solo Tab, flechas, Espacio y Enter
- **THEN** el compromiso se registra y se anuncia "Compromiso registrado."

### Requirement: Integración con el marco visual
The page SHALL use only the theme color tokens and MUST NOT nest a `<main>` element inside the layout's `<main id="contenido">`. The global navigation SHALL include a "Compromisos" link to `/compromisos`.

#### Scenario: Un solo main
- **WHEN** se carga `/compromisos`
- **THEN** la página tiene exactamente un elemento `main`
