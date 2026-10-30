## ADDED Requirements

### Requirement: La holarquía es la portada del Fogón
`/fogon` SHALL mostrar primero "Cómo decidimos": el encabezado de la página y, enseguida, la holarquía con zoom, migas, lentes, leyenda, panel de detalle y lista accesible. Antes de la holarquía solo MUST haber el aviso de prototipo, el sobretítulo, el título y una línea de introducción; ninguna lista de decisiones ni bloque de enlaces.

#### Scenario: Lo primero que se ve
- **WHEN** una persona abre `/fogon`
- **THEN** el título dice "Cómo decidimos" y debajo de la introducción está el dibujo de la holarquía con el común enfocado

#### Scenario: Sin lista arriba
- **WHEN** la persona abre `/fogon` en una pantalla de 1280 px
- **THEN** ninguna tarjeta de decisión aparece antes del dibujo en el orden de la página

### Requirement: Propuestas del holón al lado de la holarquía
`/fogon` SHALL mostrar, adyacente al dibujo, una sección "Propuestas en {nombre del holón enfocado}" con las decisiones de ejemplo de ese holón, en dos grupos: "Se decide acá" (las que se deciden en ese holón) y "Nace o pasa por acá" (las que se deciden en otro holón y cuyo camino de ejemplo nace en este o lo cruza al subir o al derivarse; una que se decide abajo sin subir no cuenta como que pasa). Cada decisión MUST usar la misma tarjeta de hoy (votar, "Llevar al consejo", parámetros, "Abrir la propuesta"). Un grupo vacío MUST decir que no hay decisiones de ejemplo, sin mostrar 0.

#### Scenario: Zoom a un círculo
- **WHEN** la persona entra a "Cuidado de la tierra" de Valle Solar
- **THEN** la sección dice "Propuestas en Cuidado de la tierra" y en "Se decide acá" está "Calendario de siembra de otoño"

#### Scenario: Zoom a una tribu
- **WHEN** la persona entra a "Valle Solar"
- **THEN** en "Se decide acá" están "Elegir facilitador/a de Valle Solar" y "Pedir al Fondo Común una cisterna para la huerta de Valle Solar", en "Nace o pasa por acá" está "Pedido de Valle Solar al Fondo Común para la bomba solar" y "Calendario de siembra de otoño" no está en ninguno de los dos grupos

#### Scenario: Nace en un círculo del común
- **WHEN** la persona entra a "Tokenomics y Semillas" del común
- **THEN** en "Nace o pasa por acá" está "Parámetros de la regalía de regeneración", con "Se decide en Lighthouse VRN"

#### Scenario: El común
- **WHEN** la persona está en el común
- **THEN** en "Se decide acá" están "Usar el fondo común para la bomba solar", "Permitir animales de granja en las chacras" y "Parámetros de la regalía de regeneración"

#### Scenario: Holón sin decisiones
- **WHEN** la persona entra a un círculo sin decisiones de ejemplo, como "Compost" de Semilla Viva
- **THEN** la sección dice "No hay decisiones de ejemplo en Compost" y no muestra ningún número

#### Scenario: Votar desde la lista adyacente
- **WHEN** la persona, adherida al manifiesto de Lighthouse VRN, vota "A favor" en "Calendario de siembra de otoño" desde la sección adyacente
- **THEN** el voto queda guardado como hoy, se anuncia y el foco vuelve al botón de esa decisión

### Requirement: Sumar lo de adentro
La sección adyacente SHALL ofrecer un botón "Sumar lo de adentro ({n})", con `aria-expanded`, cuando los holones de adentro del holón enfocado tienen decisiones de ejemplo que no están en sus dos grupos. Al expandirlo MUST listar esas decisiones en un tercer grupo, cada una con el nombre del holón donde se decide. Sin decisiones de adentro, el botón MUST NOT aparecer.

#### Scenario: Desde el común
- **WHEN** la persona está en el común y activa "Sumar lo de adentro" con el teclado
- **THEN** aparece "Calendario de siembra de otoño" con "en Cuidado de la tierra · Valle Solar" y el botón queda con `aria-expanded="true"`

#### Scenario: Círculo sin nada adentro
- **WHEN** la persona está en "Cuidado de la tierra"
- **THEN** no ve el botón "Sumar lo de adentro"

### Requirement: Cada decisión tiene su holón
Toda decisión de ejemplo del Fogón SHALL tener el holón donde se decide, que MUST existir en la holarquía y coincidir con el holón de su propuesta cuando la tiene. Las copias llevadas al consejo MUST decidirse en el consejo. Las decisiones del fideicomiso MUST NOT tener holón: se muestran en el nivel del común, en un grupo "Fuera de la holarquía: lo decide el fideicomiso" con el ⚖ de la asamblea de beneficiarios.

#### Scenario: Fideicomiso
- **WHEN** la persona está en el común
- **THEN** ve "Presupuesto de obra 2027 del macrolote" en el grupo "Fuera de la holarquía: lo decide el fideicomiso", con su ⚖

#### Scenario: Copia llevada al consejo
- **WHEN** la líder de Valle Solar (simulado) lleva al consejo el pedido de la cisterna y la persona entra al "Consejo de tribus"
- **THEN** la copia aparece en "Se decide acá" del consejo con "Viene de Valle Solar (aprobada en la tribu)"

### Requirement: El lugar vive en la dirección
El holón enfocado y la lente elegida SHALL reflejarse en la dirección de `/fogon` (`?holon=<id>&lente=<id>`) sin sumar una entrada al historial por cada zoom. Abrir esa dirección MUST mostrar ese holón y esa lente. Un holón o una lente que no existen MUST volver al común o a la primera lente, sin errores.

#### Scenario: Recargar
- **WHEN** la persona entra a "Cuidado de la tierra" con la lente "Propósitos" y recarga la página
- **THEN** sigue en "Cuidado de la tierra" con "Propósitos" elegida

#### Scenario: Holón que no existe
- **WHEN** alguien abre `/fogon?holon=no-existe`
- **THEN** ve el común enfocado y ningún error

### Requirement: Otras herramientas del Fogón
`/fogon` SHALL mostrar, después de la holarquía y de la sección adyacente, una fila "Otras herramientas" con un enlace a las consultas de prioridades y presupuesto (`/fogon/consultas`) y otro al simulador de parámetros en la Vista NetX (`/netx/simulador`), cada uno con una línea que explica para qué sirve.

#### Scenario: Ir a las consultas
- **WHEN** la persona activa "Ver las consultas" en "Otras herramientas"
- **THEN** llega a `/fogon/consultas`

#### Scenario: Ir al simulador
- **WHEN** la persona activa el enlace al simulador
- **THEN** llega a `/netx/simulador` (o a la puerta que pide sesión, como hoy)

### Requirement: Portada accesible y bilingüe
`/fogon` SHALL funcionar solo con teclado, no tener scroll horizontal a 390 px (con el dibujo arriba, después la sección adyacente y después el panel de detalle), tomar sus textos de los diccionarios es/en, usar solo tokens del tema y pasar la auditoría de axe en cada lente y con "Sumar lo de adentro" expandido.

#### Scenario: Celular
- **WHEN** la persona abre `/fogon` a 390 px
- **THEN** no hay scroll horizontal y el orden es dibujo, propuestas del holón, panel de detalle y lista

#### Scenario: En inglés
- **WHEN** la persona abre `/fogon?lang=en` y entra a Valle Solar
- **THEN** la sección dice "Proposals in Valle Solar" con sus grupos en inglés y el nombre de la tribu sin traducir

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre `/fogon` con cada lente y con "Sumar lo de adentro" expandido
- **THEN** no hay violaciones serias ni críticas

## REMOVED Requirements

### Requirement: Filtro por ámbito
**Reason**: Gus (30-oct-2026): el alcance se elige navegando la holarquía; los filtros repetían con botones lo que muestra el zoom.
**Migration**: entrar al círculo, la tribu, el consejo o el común en la holarquía de `/fogon` (dibujo, migas o lista); las decisiones de ese holón aparecen al lado. Las del fideicomiso están en el nivel del común, en su grupo aparte.
