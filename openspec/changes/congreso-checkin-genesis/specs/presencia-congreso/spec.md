# Spec Delta

## Purpose

Simular en el prototipo la presencia de una persona en el Congreso (check-in por día y registro Genesis) y hacer que esa presencia abra lo que le corresponde en el resto de la plataforma.

## ADDED Requirements

### Requirement: Check-in simulado por día
Con un ticket registrado en `/congreso`, la página SHALL ofrecer el botón "Simular check-in del día N", donde N es el próximo día sin presencia (de 1 a 5), junto al texto "En el Congreso lo hace el anfitrión escaneando el QR de tu ticket". Sin ticket registrado, el botón MUST NOT aparecer.

#### Scenario: Sin ticket
- **WHEN** una persona abre `/congreso` sin ticket registrado
- **THEN** no hay ningún botón "Simular check-in"

#### Scenario: Primer check-in disponible
- **WHEN** la persona registra el ticket LH27-8F3K-2Q
- **THEN** aparece "Simular check-in del día 1"

### Requirement: Registro Genesis
Tras el primer check-in, la página SHALL reemplazar "Genesis pendiente" por el sello "Genesis" con el texto "Estuviste en el comienzo del Lighthouse.", el ⚖ `genesis` y "Presencia confirmada: N de 5 días". El estado MUST decirse en texto, no solo con color.

#### Scenario: Primer día
- **WHEN** la persona hace el check-in del día 1
- **THEN** se lee "Genesis", "Estuviste en el comienzo del Lighthouse." y "Presencia confirmada: 1 de 5 días"
- **AND** el botón pasa a "Simular check-in del día 2"

#### Scenario: Cinco días
- **WHEN** la persona completa el check-in del día 5
- **THEN** se lee "Cinco días de presencia" y no hay botón de check-in

### Requirement: Agenda con presencia
La agenda SHALL marcar con el texto "presente" cada día con check-in, y no marcar los demás.

#### Scenario: Dos días
- **WHEN** la persona hizo check-in en los días 1 y 2
- **THEN** la agenda dice "Día 1 · presente" y "Día 2 · presente"
- **AND** el día 3 no dice "presente"

### Requirement: Presencia guardada y borrada con el ticket
La presencia SHALL guardarse solo en el navegador, seguir al recargar y borrarse al quitar el ticket o con "Borrar datos de demo". Una presencia guardada sin ticket válido MUST leerse como sin presencia.

#### Scenario: Quitar ticket
- **WHEN** la persona tiene 2 días de presencia y activa "Quitar ticket"
- **THEN** al registrar un ticket nuevo vuelve a ver "Genesis pendiente" y "Simular check-in del día 1"

#### Scenario: Recargar
- **WHEN** la persona tiene 3 días de presencia y recarga `/congreso`
- **THEN** sigue viendo "Presencia confirmada: 3 de 5 días"

### Requirement: Presencia en Canales
`/canales` SHALL considerar presencia Genesis confirmada cuando hay un ticket válido y al menos un check-in. En ese caso el dato "Presencia Genesis" de la situación MUST decir "confirmada" y las puertas que abre la presencia MUST listar "por tu presencia". El refuerzo de voz MUST seguir diciendo "a decidir", sin número.

#### Scenario: Genesis abre los foros
- **WHEN** una persona Explorador sin Pase hace el check-in del día 1 y abre `/canales`
- **THEN** el dato "Presencia Genesis" de la situación dice "confirmada"
- **AND** "Foros de la red" figura "Abierta" con "por tu presencia"

#### Scenario: Ticket sin check-in
- **WHEN** la persona tiene ticket registrado y ningún check-in
- **THEN** `/canales` sigue diciendo "pendiente: la confirma el anfitrión en el check-in" y ninguna puerta dice "por tu presencia"

### Requirement: Presencia en Mi recorrido
`/panel` SHALL mostrar "Ticket {código} registrado · Genesis · N de 5 días" cuando hay check-ins, y "Genesis pendiente" cuando hay ticket sin check-in.

#### Scenario: Panel con presencia
- **WHEN** la persona tiene ticket y 2 días de presencia
- **THEN** `/panel` muestra "Genesis · 2 de 5 días"

### Requirement: Texto legal nuevo como borrador
El ⚖ `genesis` SHALL vivir en el catálogo único de términos con `borrador: true` y una explicación en palabras simples que diga que no tiene valor económico y no se compra ni se transfiere.

#### Scenario: Catálogo
- **WHEN** se consulta el catálogo de términos
- **THEN** `genesis` existe y es borrador

### Requirement: Accesibilidad y estilo
El check-in SHALL ser usable solo con teclado: tras cada check-in el foco va al estado de la presencia, anunciado con `role="status"`. `/congreso` MUST pasar axe sin violaciones `serious` ni `critical` con y sin presencia, usar solo tokens del tema y no agregar un `<main>`.

#### Scenario: Auditoría con Genesis
- **WHEN** se corre axe sobre `/congreso` con ticket y un check-in
- **THEN** no hay violaciones `serious` ni `critical`
