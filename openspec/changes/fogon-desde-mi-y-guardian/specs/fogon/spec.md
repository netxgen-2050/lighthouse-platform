## ADDED Requirements

### Requirement: Tus propuestas en la lente Desde mí
Con la lente "Desde mí" elegida, la sección adyacente de `/fogon` SHALL titularse "Tus propuestas" y listar, sin depender del holón enfocado, las decisiones de ejemplo donde la persona participa: las del ámbito de sus tribus y círculos, las del común si adhirió al manifiesto de Lighthouse VRN y aquellas donde se declaró afectada. MUST agruparlas por lo que necesita su acción, en este orden: "Necesitan tu acuse", "Esperan tu respuesta" (un concern suyo con una resolución en juego, o un desafío del Guardián sin respuesta que la persona puede responder), "Podés sugerir o votar" y "Las seguís"; dentro de cada grupo, primero la que vence antes. Cada una MUST mostrar el holón donde se decide y la acción en texto. Los grupos vacíos MUST NOT mostrarse. El nivel con el que se calcula MUST ser el mismo que muestra la página de la propuesta. Con otra lente, la sección MUST volver a ser "Propuestas en {holón}".

#### Scenario: Sin participación
- **WHEN** una persona con sesión que no adhirió ni es de ninguna tribu elige la lente "Desde mí"
- **THEN** la sección dice "Todavía no participás en ninguna propuesta de ejemplo" y muestra el aviso para adherir

#### Scenario: Miembro de una tribu
- **WHEN** una persona miembro de Valle Solar (simulado) y adherida elige "Desde mí" con el común enfocado
- **THEN** en "Tus propuestas" están "Elegir facilitador/a de Valle Solar" y "Calendario de siembra de otoño", cada una con su holón, y también las del común

#### Scenario: Afectada en otro holón
- **WHEN** la persona se declaró afectada en "Cisterna compartida entre Agua Clara y Valle Solar" sin ser del consejo, y elige "Desde mí"
- **THEN** esa propuesta aparece en "Tus propuestas"

#### Scenario: Primero lo que necesita su acción
- **WHEN** la persona puede firmar el acuse en una propuesta y en otra solo puede comentar
- **THEN** la primera aparece en "Necesitan tu acuse", antes del grupo "Podés sugerir o votar"

#### Scenario: Desafío del Guardián que espera respuesta
- **WHEN** una persona del ámbito del consejo (simulado) elige "Desde mí" y la propuesta del pedido de la bomba solar tiene un desafío del Guardián sin respuesta
- **THEN** esa propuesta aparece en "Esperan tu respuesta" con "Responder el desafío del Guardián" en texto

#### Scenario: Volver a la lente anterior
- **WHEN** la persona pasa de "Desde mí" a "Estructura" con Valle Solar enfocado
- **THEN** la sección vuelve a decir "Propuestas en Valle Solar"

#### Scenario: Accesible
- **WHEN** corre la auditoría de axe sobre `/fogon` con la lente "Desde mí" y una persona que participa
- **THEN** no hay violaciones serias ni críticas
