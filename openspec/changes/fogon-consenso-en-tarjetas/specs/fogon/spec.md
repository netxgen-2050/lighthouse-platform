## ADDED Requirements

### Requirement: Estado del consenso en cada decisión
Cada decisión del Fogón con propuesta de ejemplo SHALL mostrar un bloque "Estado del consenso" en su tarjeta de la sección adyacente a la holarquía y en el panel de la lente Decisiones, calculado con la misma derivación que la página de esa propuesta. El bloque MUST decir en texto: la fase actual y, si cerró, el resultado; los concerns abiertos y cuántos están agrupados, sin contar los que discuten la urgencia, y los bloqueos si los hay; los acuses firmados de la versión vigente sobre el tamaño del ámbito; el quórum, cuántas personas participaron y si se alcanzó o cuántas faltan; la urgencia si la hay, con su estado; y los desafíos del Guardián sin responder si los hay y la propuesta no cerró. Lo que no se sabe MUST decir "sin dato", nunca 0 ni un valor inventado; un 0 que sí se sabe MUST mostrarse como dato. Con cuenta, el bloque MUST mostrar solo cantidades, sin nombres de personas, razones ni nombres de grupos de concerns. Sin cuenta MUST NOT mostrar el estado y MUST invitar a abrir una cuenta con un enlace a `/sumarte`. Mientras se lee la sesión o la hora, MUST NOT mostrar datos. Una marca visual del quórum, si la hay, MUST ser un refuerzo oculto para los lectores de pantalla: nada se comunica solo con color.

#### Scenario: Propuesta en resolución
- **WHEN** una persona con sesión mira "Pedido de Valle Solar al Fondo Común para la bomba solar" el 30 de octubre de 2026
- **THEN** lee la fase "Resolver concerns", 3 concerns abiertos con 2 agrupados en 1 grupo, 0 acuses firmados de 7 del ámbito, quórum de 4 personas con 5 que participaron y "se alcanzó", la urgencia pedida a la que le falta 1 respaldo y 1 desafío del Guardián sin responder

#### Scenario: Decisión simple con quórum pendiente
- **WHEN** una persona con sesión mira "Plan de huerta comunitaria 2027" el 30 de octubre de 2026
- **THEN** lee la fase "Plazo para objetar", ningún concern abierto, 2 acuses firmados de 4 del ámbito y un quórum de 3 personas al que le falta 1, sin líneas de urgencia ni de desafíos

#### Scenario: Propuesta cerrada
- **WHEN** una persona con sesión mira "Calendario de siembra de otoño"
- **THEN** lee la fase "Cierre" y el resultado por consenso, 1 acuse firmado de 12 y el quórum alcanzado, sin línea de desafíos

#### Scenario: Ámbito desconocido
- **WHEN** una propuesta no tiene tamaño de ámbito conocido
- **THEN** el ámbito y el quórum dicen "sin dato", no aparece ningún 0 en su lugar y no se dibuja la marca del quórum

#### Scenario: Decisión sin propuesta
- **WHEN** una persona con sesión mira "Elegir facilitador/a de Valle Solar"
- **THEN** lee "Estado del consenso: sin dato. Esta decisión de ejemplo todavía no tiene propuesta." y no ve "Abrir la propuesta"

#### Scenario: Sin cuenta
- **WHEN** una persona sin sesión mira la tarjeta del pedido de la bomba solar
- **THEN** no ve ninguna cantidad de concerns, acuses ni quórum, y lee "Para ver el estado del consenso, abrí una cuenta." con un enlace a `/sumarte`

#### Scenario: La lente Decisiones dice lo mismo
- **WHEN** la persona elige la cisterna compartida en la lente Decisiones y después abre su propuesta
- **THEN** el panel y la página muestran la misma fase, los mismos concerns, los mismos acuses y el mismo quórum

#### Scenario: Super admin cambia el ámbito del consejo
- **WHEN** el super admin agrega a una persona al ámbito de la propuesta de la bomba solar
- **THEN** la tarjeta y la página muestran el mismo tamaño del ámbito y el mismo quórum

#### Scenario: Sin pedidos de red
- **WHEN** la persona recorre las tarjetas de `/fogon`
- **THEN** ningún dato de la deliberación sale a un servidor

#### Scenario: En inglés
- **WHEN** la persona abre `/fogon?lang=en` con sesión
- **THEN** el bloque dice "Consensus status" con la fase, los concerns, los acuses y el quórum en inglés, y "no data" donde falta el dato

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre `/fogon` con sesión y sin sesión, y con una decisión elegida en la lente Decisiones
- **THEN** no hay violaciones serias ni críticas

### Requirement: Las decisiones del Fogón no se votan
Ninguna decisión del Fogón SHALL ofrecer votar ni mostrar un conteo de votos, propio o de ejemplo, en la sección adyacente, en el panel de la lente Decisiones ni en la página de la propuesta: MUST NOT aparecer "Votar", "Cambiar voto", "Votos de ejemplo", "A favor", "En contra", "Abstención" ni "Tu voto". La acción de la tarjeta MUST ser "Abrir la propuesta" cuando la decisión tiene propuesta; "Llevar al consejo" MUST seguir como hoy. Los mecanismos de votación (voto cuadrático, puntos, voto por convicción) MUST NOT nombrarse en esas superficies ni en la portada de `/fogon`: solo aparecen cuando una persona o Hifa los sugiere en una propuesta, y en las páginas de las consultas de `/fogon/consultas`. Los votos guardados en el navegador con el formato anterior MUST ignorarse sin error, conservando las decisiones llevadas al consejo.

#### Scenario: Tarjeta sin votos
- **WHEN** una persona adherida al manifiesto recorre el común con lo de los círculos de adentro a la vista
- **THEN** ninguna tarjeta muestra "Votar", opciones de voto, conteos ni "Votos de ejemplo"

#### Scenario: Abrir con el teclado
- **WHEN** la persona llega con el teclado a "Abrir la propuesta" en la tarjeta de la regalía y lo activa
- **THEN** llega a la página de esa propuesta

#### Scenario: Votos guardados antes
- **WHEN** el navegador tiene guardado `{ "votos": { "huerta": "favor" }, "alConsejo": ["cisterna"] }`
- **THEN** la página no falla, no muestra ningún voto y la copia de la cisterna sigue en el consejo

#### Scenario: Llevar al consejo sigue
- **WHEN** la líder de Valle Solar (simulado), adherida, lleva al consejo el pedido de la cisterna
- **THEN** la copia aparece en el consejo con "Viene de Valle Solar (aprobada en la tribu)", se anuncia, el foco pasa al título y su estado dice que todavía no tiene propuesta

#### Scenario: Sin mecanismos en la portada
- **WHEN** la persona lee `/fogon` completa
- **THEN** no aparece "voto cuadrático", "dot voting", "puntos" como mecanismo ni "conviction voting"

## MODIFIED Requirements

### Requirement: Decisiones con su base
El sistema SHALL mostrar en `/fogon` las decisiones de ejemplo de la holarquía, cada una con dónde se decide, la regla y un ⚖ con su base. El Fogón MUST NOT listar decisiones del ámbito Fideicomiso ni de la Asamblea de residentes.

#### Scenario: Ver una decisión
- **WHEN** una persona entra a "Huerta intensiva" de Semilla Viva en `/fogon`
- **THEN** ve "Plan de huerta comunitaria 2027" con su lugar, su regla y su ⚖

#### Scenario: Sin fideicomiso ni asamblea de residentes
- **WHEN** una persona recorre `/fogon`
- **THEN** no ve "Fideicomiso", "Asamblea de beneficiarios", "Asamblea de residentes" ni el párrafo sobre la residencia fiscal

### Requirement: Propuestas del holón al lado de la holarquía
`/fogon` SHALL mostrar, adyacente al dibujo, una sección "Propuestas en {nombre del holón enfocado}" con las decisiones de ejemplo de ese holón, en dos grupos (más el de los círculos de adentro, en el requisito siguiente): "Se decide acá" (las que se deciden en ese holón) y "Nace o pasa por acá" (las que se deciden en otro holón y cuyo camino de ejemplo nace en este o lo cruza al subir o al derivarse; una que se decide abajo sin subir no cuenta como que pasa). Cada decisión MUST usar la misma tarjeta, con su estado del consenso, "Abrir la propuesta", "Llevar al consejo" y parámetros, sin votos. Un grupo vacío MUST decir que no hay decisiones de ejemplo, sin mostrar 0.

#### Scenario: Zoom a un círculo
- **WHEN** la persona entra a "Cuidado de la tierra" de Valle Solar
- **THEN** la sección dice "Propuestas en Cuidado de la tierra" y en "Se decide acá" está "Calendario de siembra de otoño"

#### Scenario: Zoom a una tribu
- **WHEN** la persona entra a "Valle Solar"
- **THEN** en "Se decide acá" están "Elegir facilitador/a de Valle Solar" y "Pedir al Fondo Común una cisterna para la huerta de Valle Solar", en "Nace o pasa por acá" está "Pedido de Valle Solar al Fondo Común para la bomba solar" y "Calendario de siembra de otoño" no está en esos dos grupos sino en "En los círculos de adentro", con "en Cuidado de la tierra"

#### Scenario: Nace en un círculo del común
- **WHEN** la persona entra a "Tokenomics y Semillas" del común
- **THEN** en "Nace o pasa por acá" está "Parámetros de la regalía de regeneración", con "Se decide en Lighthouse VRN"

#### Scenario: El común
- **WHEN** la persona está en el común
- **THEN** en "Se decide acá" están "Usar el fondo común para la bomba solar", "Permitir animales de granja en las chacras", "Parámetros de la regalía de regeneración" y "Presupuesto 2027 del Fondo Común"

#### Scenario: Holón sin decisiones
- **WHEN** la persona entra a un círculo sin decisiones de ejemplo, como "Compost" de Semilla Viva
- **THEN** la sección dice "No hay decisiones de ejemplo en Compost" y no muestra ningún número

#### Scenario: Estado en la lista adyacente
- **WHEN** la persona con sesión mira "Calendario de siembra de otoño" en la sección adyacente
- **THEN** ve su estado del consenso y "Abrir la propuesta", sin ninguna opción de voto

### Requirement: El Fogón recomienda a los órganos legales
El Fogón SHALL presentarse como el espacio consultivo del procomún. Una decisión de ejemplo que la toma un órgano legal fuera de la holarquía MUST mostrar su destino debajo del lugar, en texto: "Lo decide el Consejo de la Fundación; el Fogón le lleva la recomendación", con un ⚖ en borrador que lo explique en palabras simples y sin hablar de votos. MUST NOT ofrecer opciones de recomendación ni pedir el Pase Fundador.

#### Scenario: Presupuesto del Fondo Común
- **WHEN** la persona está en el común
- **THEN** ve "Presupuesto 2027 del Fondo Común" en "Se decide acá", con "Lo decide el Consejo de la Fundación; el Fogón le lleva la recomendación" y su ⚖ marcado como borrador

#### Scenario: Sin opciones de recomendación
- **WHEN** una persona adherida al manifiesto de Lighthouse VRN mira "Presupuesto 2027 del Fondo Común"
- **THEN** no ve "Tu recomendación", ni opciones, ni conteos, y lee que todavía no tiene propuesta

#### Scenario: Decisión sin destino
- **WHEN** la persona mira "Elegir facilitador/a de Valle Solar"
- **THEN** no ve ningún destino

### Requirement: Otras herramientas del Fogón
`/fogon` SHALL mostrar, después de la holarquía y de la sección adyacente, una fila "Otras herramientas" con un enlace a las consultas para priorizar o repartir (`/fogon/consultas`) y otro al simulador de parámetros en la Vista NetX (`/netx/simulador`), cada uno con una línea que explica para qué sirve. La línea de las consultas MUST decir que no son decisiones y MUST NOT nombrar el voto cuadrático.

#### Scenario: Ir a las consultas
- **WHEN** la persona activa "Ver las consultas" en "Otras herramientas"
- **THEN** llega a `/fogon/consultas`

#### Scenario: Las consultas no son decisiones
- **WHEN** la persona lee "Otras herramientas"
- **THEN** lee "Consultas para priorizar o repartir: no son decisiones, orientan a quien decide."

#### Scenario: Ir al simulador
- **WHEN** la persona activa el enlace al simulador
- **THEN** llega a `/netx/simulador` (o a la puerta que pide sesión, como hoy)

### Requirement: Tus propuestas en la lente Desde mí
Con la lente "Desde mí" elegida, la sección adyacente de `/fogon` SHALL titularse "Tus propuestas" y listar, sin depender del holón enfocado, las decisiones de ejemplo donde la persona participa: las del ámbito de sus tribus y círculos, las del común si adhirió al manifiesto de Lighthouse VRN y aquellas donde se declaró afectada. MUST agruparlas por lo que necesita su acción, en este orden: "Necesitan tu acuse", "Esperan tu respuesta" (un concern suyo con una resolución en juego, o un desafío del Guardián sin respuesta que la persona puede responder), "Podés aportar" y "Las seguís"; una decisión sin propuesta MUST ir a "Las seguís". Dentro de cada grupo, primero la que vence antes. Cada una MUST mostrar el holón donde se decide y la acción en texto. Los grupos vacíos MUST NOT mostrarse. El nivel con el que se calcula MUST ser el mismo que muestra la página de la propuesta. Con otra lente, la sección MUST volver a ser "Propuestas en {holón}".

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
- **THEN** la primera aparece en "Necesitan tu acuse", antes del grupo "Podés aportar"

#### Scenario: Decisión sin propuesta
- **WHEN** una persona miembro de Valle Solar y adherida mira "Elegir facilitador/a de Valle Solar" en "Tus propuestas"
- **THEN** la decisión está en "Las seguís" y no ofrece votar

#### Scenario: Desafío del Guardián que espera respuesta
- **WHEN** una persona del ámbito del consejo (simulado) elige "Desde mí" y la propuesta del pedido de la bomba solar tiene un desafío del Guardián sin respuesta
- **THEN** esa propuesta aparece en "Esperan tu respuesta" con "Responder el desafío del Guardián" en texto

#### Scenario: Volver a la lente anterior
- **WHEN** la persona pasa de "Desde mí" a "Estructura" con Valle Solar enfocado
- **THEN** la sección vuelve a decir "Propuestas en Valle Solar"

#### Scenario: Accesible
- **WHEN** corre la auditoría de axe sobre `/fogon` con la lente "Desde mí" y una persona que participa
- **THEN** no hay violaciones serias ni críticas

## REMOVED Requirements

### Requirement: Votación simulada
**Reason**: Gus (2-nov-2026): en Formal Consensus no se vota; el botón y el conteo eran herencia de `fogon-decisiones`.
**Migration**: cada decisión muestra "Estado del consenso" y "Abrir la propuesta". Para priorizar o repartir están las consultas de `/fogon/consultas`.
