# Spec Delta

## Purpose

Lleva Comunidades a un destino nuevo, Participa, con los equipos de trabajo sobre un mapa ilustrado del territorio y el detalle de cada equipo con sus posiciones abiertas, por pedido de Gus del 24-nov-2026.

## ADDED Requirements

### Requirement: Destino Participa
`/participa` SHALL ser una página pública y bilingüe en el menú principal (después de Explorar), con las pestañas Equipos (por defecto) y Visión (`?ver=vision`), y la tarjeta del común Lighthouse VRN arriba. `/tribus` MUST redirigir a `/participa` y `/tribus?ver=tribus` a `/participa?ver=vision`; las páginas `/tribus/[id]` MUST seguir en su URL y marcar Participa en el menú.

#### Scenario: Abrir Participa
- **WHEN** una persona abre `/participa`
- **THEN** ve la tarjeta del común, la pestaña Equipos marcada y el mapa ilustrado

#### Scenario: URL vieja
- **WHEN** una persona abre `/tribus`
- **THEN** llega a `/participa`

### Requirement: Mapa ilustrado de equipos
La pestaña Equipos SHALL mostrar un mapa ilustrado en SVG del territorio (río, costa, planicie, barda, mesetas y cañadón) con la marca "Ilustración · no es un plano", y cada círculo del común como una forma de permacultura (no un círculo geométrico) con su nombre visible. Debajo, la misma lista de equipos MUST estar como botones.

#### Scenario: Nueve equipos
- **WHEN** una persona abre la pestaña Equipos
- **THEN** ve una forma con su nombre por cada círculo del común, y la lista de equipos debajo

#### Scenario: Tema oscuro
- **WHEN** la persona usa el tema oscuro
- **THEN** el mapa se ve de noche, con las etiquetas legibles

### Requirement: Formas interactivas
Cada forma SHALL reaccionar igual al pasar el puntero y al recibir el foco del teclado (se eleva, muestra un contorno y un globo con el nombre y la cantidad de posiciones abiertas en texto). Con movimiento reducido (sistema o Configuración) MUST NOT haber animaciones.

#### Scenario: Hover
- **WHEN** la persona pasa el puntero sobre la forma del equipo Agua
- **THEN** la forma se destaca y aparece "Agua · N posiciones abiertas"

#### Scenario: Teclado
- **WHEN** la persona llega con Tab a una forma
- **THEN** la forma se destaca igual que con el puntero

### Requirement: Detalle del equipo con posiciones abiertas
Al hacer clic (o Enter o Espacio) en una forma o en su botón de la lista, SHALL abrirse un diálogo con el nombre del equipo, qué decide, sus frentes de trabajo, entre 2 y 4 posiciones abiertas de ejemplo (título, dedicación, qué se busca, modalidad y la marca "Ejemplo · a definir") y el botón "Quiero sumarme". Escape MUST cerrarlo y devolver el foco a la forma; la URL MUST llevar `?equipo=<id>` y abrirlo directo. Las posiciones MUST NOT prometer pago, sueldo ni prioridad.

#### Scenario: Abrir el detalle
- **WHEN** la persona hace clic en la forma del equipo Gobernanza
- **THEN** se abre el detalle con al menos dos posiciones abiertas marcadas "Ejemplo · a definir"

#### Scenario: Link directo
- **WHEN** una persona abre `/participa?equipo=agua`
- **THEN** ve el detalle del equipo Agua abierto

#### Scenario: Celular
- **WHEN** una persona toca una forma a 390 px
- **THEN** el detalle se abre como hoja inferior, sin scroll horizontal
