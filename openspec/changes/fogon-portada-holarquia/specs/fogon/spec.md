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
`/fogon` SHALL mostrar, adyacente al dibujo, una sección "Propuestas en {nombre del holón enfocado}" con las decisiones de ejemplo de ese holón, en dos grupos (más el de los círculos de adentro, en el requisito siguiente): "Se decide acá" (las que se deciden en ese holón) y "Nace o pasa por acá" (las que se deciden en otro holón y cuyo camino de ejemplo nace en este o lo cruza al subir o al derivarse; una que se decide abajo sin subir no cuenta como que pasa). Cada decisión MUST usar la misma tarjeta de hoy (votar, "Llevar al consejo", parámetros, "Abrir la propuesta"). Un grupo vacío MUST decir que no hay decisiones de ejemplo, sin mostrar 0.

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

#### Scenario: Votar desde la lista adyacente
- **WHEN** la persona, adherida al manifiesto de Lighthouse VRN, vota "A favor" en "Calendario de siembra de otoño" desde la sección adyacente
- **THEN** el voto queda guardado como hoy, se anuncia y el foco vuelve al botón de esa decisión

### Requirement: Lo de los círculos de adentro, por defecto
La sección adyacente SHALL mostrar por defecto, en un tercer grupo "En los círculos de adentro", las decisiones de ejemplo que se deciden en holones de adentro del holón enfocado y que no están en sus otros dos grupos, cada una con la etiqueta del círculo donde se decide ("en {círculo} · {tribu}", o el tramo que corresponda). Cuando ese grupo tiene decisiones, la sección MUST ofrecer un botón "Solo las de {holón}", con `aria-pressed`, que esconde ese grupo y deja solo "Se decide acá" y "Nace o pasa por acá"; activarlo otra vez lo vuelve a mostrar. Al cambiar de holón, la sección MUST volver a mostrar lo de adentro. Sin decisiones de adentro, ni el grupo ni el botón MUST aparecer.

#### Scenario: Abierto al llegar
- **WHEN** la persona abre `/fogon` en el común
- **THEN** en "En los círculos de adentro" está "Calendario de siembra de otoño" con "en Cuidado de la tierra · Valle Solar", y el botón "Solo las de Lighthouse VRN" está con `aria-pressed="false"`

#### Scenario: Acotar al holón
- **WHEN** la persona está en el común y activa "Solo las de Lighthouse VRN" con el teclado
- **THEN** "Calendario de siembra de otoño" deja de estar en la sección, "Se decide acá" sigue y el botón queda con `aria-pressed="true"`

#### Scenario: Vuelve a mostrar todo al cambiar de holón
- **WHEN** la persona acotó la lista en el común y después entra a "Valle Solar"
- **THEN** ve "En los círculos de adentro" con "Calendario de siembra de otoño" y el botón "Solo las de Valle Solar" con `aria-pressed="false"`

#### Scenario: Círculo sin nada adentro
- **WHEN** la persona está en "Cuidado de la tierra"
- **THEN** no ve el grupo "En los círculos de adentro" ni el botón "Solo las de Cuidado de la tierra"

### Requirement: Cada decisión tiene su holón
Toda decisión de ejemplo del Fogón SHALL tener el holón donde se decide, que MUST existir en la holarquía y coincidir con el holón de su propuesta cuando la tiene. Las copias llevadas al consejo MUST decidirse en el consejo. El Fogón MUST NOT tener decisiones fuera de la holarquía ni un ámbito "fideicomiso".

#### Scenario: Sin fideicomiso
- **WHEN** la persona recorre el común con lo de los círculos de adentro a la vista
- **THEN** no ve ningún grupo, decisión ni texto de "fideicomiso" ni de "Asamblea de beneficiarios"

#### Scenario: Copia llevada al consejo
- **WHEN** la líder de Valle Solar (simulado) lleva al consejo el pedido de la cisterna y la persona entra al "Consejo de tribus"
- **THEN** la copia aparece en "Se decide acá" del consejo con "Viene de Valle Solar (aprobada en la tribu)"

### Requirement: El Fogón recomienda a los órganos legales
El Fogón SHALL presentarse como el espacio consultivo del procomún. Una decisión de ejemplo que la toma un órgano legal fuera de la holarquía MUST mostrar su destino debajo del lugar, en texto: "Lo decide el Consejo de la Fundación; el Fogón le lleva la recomendación", con un ⚖ en borrador que lo explique en palabras simples, y su voto MUST presentarse como "Tu recomendación". Votar o recomendar en el Fogón MUST NOT pedir el Pase Fundador.

#### Scenario: Presupuesto del Fondo Común
- **WHEN** la persona está en el común
- **THEN** ve "Presupuesto 2027 del Fondo Común" en "Se decide acá", con "Lo decide el Consejo de la Fundación; el Fogón le lleva la recomendación" y su ⚖ marcado como borrador

#### Scenario: Recomendar sin Pase
- **WHEN** una persona adherida al manifiesto de Lighthouse VRN, sin Pase Fundador, elige "A favor" en "Presupuesto 2027 del Fondo Común"
- **THEN** su recomendación queda guardada y anunciada como cualquier voto, sin pedirle el Pase

#### Scenario: Decisión sin destino
- **WHEN** la persona mira "Elegir facilitador/a de Valle Solar"
- **THEN** no ve ningún destino y el voto dice "Tu voto"

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
`/fogon` SHALL funcionar solo con teclado, no tener scroll horizontal a 390 px (con el dibujo arriba, después la sección adyacente y después el panel de detalle), tomar sus textos de los diccionarios es/en, usar solo tokens del tema y pasar la auditoría de axe en cada lente, con lo de los círculos de adentro a la vista y con "Solo las de {holón}" activado.

#### Scenario: Celular
- **WHEN** la persona abre `/fogon` a 390 px
- **THEN** no hay scroll horizontal y el orden es dibujo, propuestas del holón, panel de detalle y lista

#### Scenario: En inglés
- **WHEN** la persona abre `/fogon?lang=en` y entra a Valle Solar
- **THEN** la sección dice "Proposals in Valle Solar" con sus grupos y el botón "Only those of Valle Solar" en inglés y el nombre de la tribu sin traducir

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre `/fogon` con cada lente, con lo de adentro a la vista y con "Solo las de Lighthouse VRN" activado
- **THEN** no hay violaciones serias ni críticas

## REMOVED Requirements

### Requirement: Filtro por ámbito
**Reason**: Gus (30-oct-2026): el alcance se elige navegando la holarquía; los filtros repetían con botones lo que muestra el zoom.
**Migration**: entrar al círculo, la tribu, el consejo o el común en la holarquía de `/fogon` (dibujo, migas o lista); las decisiones de ese holón aparecen al lado. El ámbito "Fideicomiso" desaparece sin reemplazo (Gus, 1-nov-2026): lo que decide un órgano legal aparece en su holón con su destino.
