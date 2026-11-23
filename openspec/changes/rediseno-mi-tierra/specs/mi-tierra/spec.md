# Spec Delta

## Purpose

Mi tierra es el portafolio de la persona en Lighthouse: en una sola vista, su lote, su plan en cuotas, los FARO que se le acreditarían, su voz y su actividad, todo simulado. Las reservas se leen por una sola función para que pasarlas a la base cambie solo ese lugar.

## ADDED Requirements

### Requirement: Mi tierra sin sesión
`/mi-tierra` SHALL abrirse sin sesión mostrando solo un aviso corto con el enlace para entrar, sin leer ni mostrar ninguna reserva.

#### Scenario: Sin sesión
- **WHEN** una persona sin sesión abre `/mi-tierra`
- **THEN** ve el aviso para entrar y ningún lote, cuota ni FARO

### Requirement: Mi tierra sin compras
Con sesión y sin reservas ni pagos simulados, la página SHALL decir que todavía no reservó un lote y ofrecer un enlace a `/lotes`. MUST NOT mostrar indicadores en 0.

#### Scenario: Sin compras
- **WHEN** una persona con sesión que nunca reservó abre `/mi-tierra`
- **THEN** ve "Todavía no reservaste un lote" y el enlace "Ver los lotes"

### Requirement: Tu lote
Por cada reserva o pago simulado, la página SHALL mostrar el lote, su chip de estado (reservado, en cuotas o vendido), la opción elegida, el precio que la persona vio con la versión del modelo y un enlace a la ficha del lote. Un valor que la persona no vio MUST decir "sin dato".

#### Scenario: Lote reservado
- **WHEN** la persona reservó un lote del sector norte y no pagó
- **THEN** ve ese lote con el chip "Reservado", el precio que vio y el enlace a su ficha

#### Scenario: Reserva vieja
- **WHEN** la reserva se guardó antes de que existiera el plan en cuotas
- **THEN** el plan dice "sin dato" y la página no falla

### Requirement: Plan en cuotas
Para un lote comprado en cuotas, la página SHALL mostrar con números en monoespaciada el anticipo, el valor de la cuota, las cuotas pagadas sobre el total y una barra de avance del plan con su porcentaje, todo leído de lo que la persona vio al comprar. Para un lote al contado MUST decir "Contado". Para los primeros 4 lotes MUST decir que no entran al plan en cuotas.

#### Scenario: En cuotas
- **WHEN** la persona pagó el anticipo de un plan de 24 cuotas
- **THEN** ve el anticipo, la cuota, "0 de 24 cuotas" y la barra con el porcentaje pagado del lote

#### Scenario: Primeros 4 lotes
- **WHEN** la persona reservó uno de los primeros 4 lotes
- **THEN** la sección del plan dice que ese lote no entra al plan en cuotas y no muestra FARO

### Requirement: FARO acreditados
La página SHALL mostrar los FARO acreditados con lo pagado y los que se acreditarían si se completa el plan, calculados con la regla del plan en cuotas (FARO por fracción pagada), marcados como simulados. Si no hubo ningún pago, MUST decir que todavía no se acreditó FARO porque falta el primer pago. MUST NOT hablar de precio, venta ni rendimiento de FARO.

#### Scenario: Con anticipo pagado
- **WHEN** la persona pagó el anticipo
- **THEN** ve los FARO acreditados por el anticipo y los del plan completo, con la marca "simulado"

#### Scenario: Solo reservado
- **WHEN** la persona reservó y no pagó
- **THEN** ve "Todavía no se acreditó FARO: falta el primer pago"

### Requirement: Tu voz
La página SHALL decir si la persona adhirió al manifiesto de Lighthouse VRN, con un enlace para hacerlo si no adhirió, y aclarar que hoy ser parte del común sale de esa adhesión. Lo que el doc 34 propone sobre la voz MUST mostrarse como propuesta en discusión, y la página MUST decir que FARO no da voto en la plataforma.

#### Scenario: Sin adhesión
- **WHEN** la persona no adhirió al manifiesto
- **THEN** ve que todavía no es parte del común, el enlace para adherir y la aclaración de que FARO no da voto

#### Scenario: Con adhesión
- **WHEN** la persona adhirió al manifiesto
- **THEN** ve que es parte del común por su adhesión y la propuesta de voz marcada "en discusión"

### Requirement: Actividad
La página SHALL mostrar un libro de movimientos con título, una fila por paso de cada compra simulada (reserva y pago) con fecha, motivo y el monto que se vio, del más nuevo al más viejo. Un monto que falta MUST decir "sin dato".

#### Scenario: Reserva y pago
- **WHEN** la persona reservó y después pagó el anticipo de un lote
- **THEN** el libro tiene dos filas, primero el pago y después la reserva, con sus fechas

### Requirement: Sello de venta en Mi tierra
Con sesión y con al menos una compra, la página SHALL mostrar "Prototipo interno · datos de ejemplo" y "venta simulada · aprobación municipal pendiente". La aprobación municipal MUST NOT mostrarse como otorgada.

#### Scenario: Sello
- **WHEN** la persona con una reserva abre `/mi-tierra`
- **THEN** ve "venta simulada · aprobación municipal pendiente"

### Requirement: Una sola función de lectura de reservas
Las reservas y pagos simulados de la persona SHALL leerse en un solo lugar del código, por una función asíncrona que devuelve la lista de compras de la persona en sesión (vacía sin sesión o si lo guardado no se puede leer). Mi tierra y la ficha de cada lote MUST leer por esa función, y ningún otro archivo MUST leer la clave de reservas del navegador.

#### Scenario: Lectura única
- **WHEN** se busca en `app/`, `components/` y `lib/` quién lee la clave de reservas del navegador
- **THEN** solo aparece la función de lectura (y su test)

#### Scenario: Ficha del lote sin cambios
- **WHEN** una persona reserva un lote desde su ficha y vuelve a abrirla
- **THEN** la ficha muestra la reserva como antes de este cambio

### Requirement: Calidad de Mi tierra
`/mi-tierra` SHALL ser bilingüe, pasar axe en los dos idiomas y los dos temas, ser usable con teclado, no tener scroll horizontal a 390 px y no tener ningún número del modelo escrito en sus archivos.

#### Scenario: Axe con una compra
- **WHEN** corre axe sobre `/mi-tierra` con una compra en cuotas, en inglés y en tema claro
- **THEN** no hay violaciones
