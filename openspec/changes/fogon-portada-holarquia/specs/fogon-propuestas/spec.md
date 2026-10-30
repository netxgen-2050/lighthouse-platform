## MODIFIED Requirements

### Requirement: Abrir la propuesta
Every Fogón decision that has an example proposal SHALL show an "Abrir la propuesta" link on its card in the section of proposals next to the holarchy in `/fogon` and in the panel of the chosen decision in the "Decisiones que suben" lens. The link MUST lead to `/fogon/propuestas/<id de la decisión>?desde=<holón enfocado>` (y `&lente=<lente>` si no es la primera). Decisions without a proposal (for example those of the fideicomiso or copies taken to the council) MUST NOT show it.

#### Scenario: Desde el Fogón
- **WHEN** una persona, con el consejo enfocado, toca "Abrir la propuesta" en la tarjeta "Pedido de Valle Solar al Fondo Común para la bomba solar"
- **THEN** llega a `/fogon/propuestas/consejo-bomba?desde=consejo`, con el título de la propuesta como encabezado

#### Scenario: Desde la lente Decisiones
- **WHEN** la persona elige "Cisterna compartida entre Agua Clara y Valle Solar" en la lente "Decisiones que suben" y activa "Abrir la propuesta" con el teclado
- **THEN** llega a la página de esa propuesta

#### Scenario: Decisión sin propuesta
- **WHEN** la persona mira la tarjeta "Presupuesto de obra 2027 del macrolote" (fideicomiso)
- **THEN** no ve "Abrir la propuesta"

#### Scenario: Propuesta que no existe
- **WHEN** alguien abre `/fogon/propuestas/no-existe`
- **THEN** ve la página de "no encontrada" del sitio, sin errores

## ADDED Requirements

### Requirement: Migas de la holarquía en la propuesta
La página de una propuesta SHALL mostrar como migas el camino de la holarquía hasta el holón donde se decide, seguido del título: "Lighthouse VRN › {tribu} › {círculo} › {propuesta}" (o el tramo que corresponda). Cada miga de holón MUST llevar a `/fogon?holon=<id>`. Mientras la persona no puede ver el título (visita sin cuenta), MUST mostrarse el camino de holones sin el título.

#### Scenario: Propuesta de un círculo
- **WHEN** la persona abre la propuesta "Calendario de siembra de otoño"
- **THEN** las migas dicen "Lighthouse VRN › Valle Solar › Cuidado de la tierra › Calendario de siembra de otoño" y la última está marcada como página actual

#### Scenario: Miga de la tribu
- **WHEN** la persona activa la miga "Valle Solar" con el teclado
- **THEN** llega a `/fogon?holon=valle` con Valle Solar enfocado en la holarquía

#### Scenario: Propuesta del consejo
- **WHEN** la persona abre la propuesta "Pedido de Valle Solar al Fondo Común para la bomba solar"
- **THEN** las migas dicen "Lighthouse VRN › Consejo de tribus › Pedido de Valle Solar al Fondo Común para la bomba solar"

### Requirement: Dónde se decide
La página de una propuesta SHALL mostrar, antes de la ficha, una tarjeta corta "Dónde se decide" con el nombre y el tipo del holón, lo que ese holón "Decide sobre" y, si la decisión tiene camino de ejemplo, el camino en texto con su tipo (sube, se deriva o se decide abajo). Sin camino MUST decir "Sin camino de ejemplo", sin inventarlo.

#### Scenario: Camino que sube
- **WHEN** la persona abre la propuesta del pedido de la bomba solar
- **THEN** la tarjeta dice "Consejo de tribus" y el camino "Cuidado de la tierra → Valle Solar → Consejo de tribus → Lighthouse VRN" con "sube"

#### Scenario: Sin camino
- **WHEN** la persona abre una propuesta cuya decisión no tiene camino de ejemplo
- **THEN** la tarjeta dice "Sin camino de ejemplo"

### Requirement: Volver al lugar de la holarquía
La página de una propuesta SHALL ofrecer "Volver a {holón}" que lleva a `/fogon` con el holón y la lente de donde vino la persona (`desde` y `lente`). Si `desde` falta o no existe en la holarquía, MUST volver al holón donde se decide la propuesta. Si la persona vino de un holón distinto del que decide, la página MUST decirlo ("La abriste desde {holón}").

#### Scenario: Volver al común
- **WHEN** la persona, en el común con "Sumar lo de adentro" y la lente "Propósitos", abre "Calendario de siembra de otoño" y activa "Volver a Lighthouse VRN"
- **THEN** llega a `/fogon?holon=lighthouse&lente=propositos` con el común enfocado y "Propósitos" elegida

#### Scenario: Abierta desde otro holón
- **WHEN** la persona abre la propuesta del pedido de la bomba solar desde Valle Solar
- **THEN** la página dice "La abriste desde Valle Solar" y "Volver a Valle Solar" lleva a `/fogon?holon=valle`

#### Scenario: Desde que no existe
- **WHEN** alguien abre `/fogon/propuestas/siembra?desde=no-existe`
- **THEN** "Volver a Cuidado de la tierra" lleva a `/fogon?holon=valle-0`, sin errores

#### Scenario: Accesible y en inglés
- **WHEN** corre la auditoría de axe sobre la propuesta abierta desde un holón, y la persona la abre con `?lang=en`
- **THEN** no hay violaciones serias ni críticas, y las migas, "Where it is decided" y "Back to {holón}" salen en inglés con los nombres propios sin traducir
