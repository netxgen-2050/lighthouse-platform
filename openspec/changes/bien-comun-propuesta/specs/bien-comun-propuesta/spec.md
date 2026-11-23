# Spec Delta

## Purpose

Mostrar la propuesta v0.1 del bien común y los tokens (`NS_Tokenomics` doc 34) como una propuesta en discusión: dos carriles, tres puentes, tres puertas de FARO, su política y las decisiones abiertas, sin emitir, cobrar ni prometer nada.

## ADDED Requirements

### Requirement: Sello de propuesta en discusión
`/bien-comun` SHALL mostrar, como primer contenido después del título y antes de cualquier número, el sello "Propuesta v0.1 · en discusión con el equipo · números de ejemplo · lo legal, a verificar con abogado", con la fecha de la versión y su fuente (doc 34), leídas del módulo. La página MUST seguir siendo pública, bilingüe y con el aviso "Prototipo interno · datos de ejemplo". MUST decir que es una simulación y que no es una oferta.

#### Scenario: Sello antes que todo
- **WHEN** una persona sin sesión abre `/bien-comun`
- **THEN** lee el sello con "v0.1", "en discusión", la fecha 19-nov-2026 y "doc 34" antes de cualquier número

#### Scenario: Sello en inglés
- **WHEN** abre `/bien-comun?lang=en`
- **THEN** lee el sello en inglés, con la misma versión y fecha

### Requirement: La propuesta en una frase
La página SHALL mostrar la frase del doc 34 §"En una frase" en palabras simples: la plata que espera retorno entra por Token Tierra y Token Inversor dentro de un fideicomiso por barrio; el bien común se organiza con FARO, que no levanta capital y no cotiza; los dos se tocan en tres puntos. MUST aclarar que nada de esto está acordado.

#### Scenario: Frase
- **WHEN** una persona lee la sección "En una frase"
- **THEN** lee que FARO no levanta capital y que la propuesta no está acordada

### Requirement: Diagrama de los dos carriles y los tres puentes
La página SHALL mostrar un diagrama propio, hecho con elementos de la página y no con una imagen, con el carril A (Token Tierra, Token Inversor, fideicomiso del barrio: quién pone plata y qué recibe) y el carril B (tesoro del común y FARO: qué es de todos y cómo se alimenta), y los tres puentes (una parte de cada pago va al común; FARO con cada cuota pagada; la reventa aporta y el FARO viaja con el lote). Cada puente MUST decir en texto de dónde sale y adónde va. La parte de cada pago MUST leerse de `lib/lotes/modelo.ts`. El diagrama MUST recorrerse con teclado y lector de pantalla en orden y MUST NOT comunicar nada solo con color o flechas.

#### Scenario: Tres puentes
- **WHEN** una persona recorre el diagrama con el lector de pantalla
- **THEN** escucha los dos carriles y una lista de tres puentes, cada uno con su origen y su destino

#### Scenario: Pantalla angosta
- **WHEN** abre la página a 390 px de ancho
- **THEN** el diagrama se apila en vertical sin scroll horizontal

### Requirement: Puertas de FARO, qué da y qué no tiene
La página SHALL mostrar las tres puertas para tener FARO (con el lote; aportando trabajo y cuidado validados por pares; prepagando servicios a precio fijo con cupo según capacidad), diciendo que ninguna es una inversión. SHALL listar qué da FARO (voz, noches, huerta y cocina, talleres, parte de las expensas) y qué no tiene (exchange, liquidez, recompra, respaldo en la tierra, premio por bloquear), sin jerga. La página MUST NOT ofrecer comprar ni prepagar FARO.

#### Scenario: Ninguna puerta es inversión
- **WHEN** una persona lee las tres puertas
- **THEN** lee "ninguna es una inversión" y no encuentra ningún botón para comprar o prepagar

#### Scenario: Qué no tiene
- **WHEN** lee "Qué no tiene FARO"
- **THEN** lee cinco ítems, entre ellos que no tiene respaldo en la tierra ni premio por bloquear

### Requirement: Política de FARO
La página SHALL mostrar la política de FARO como seis tarjetas cortas (emisión, quema, bloqueo, transferencia, reserva, voz) con la regla propuesta y de dónde viene. La transferencia MUST decir que en la versión 1 solo viaja con el lote y que se revisa a los 12 meses (valor leído del módulo).

#### Scenario: Seis tarjetas
- **WHEN** una persona lee la política
- **THEN** lee seis tarjetas, cada una con un título y su regla

### Requirement: Decisiones abiertas
La página SHALL listar las 8 decisiones del doc 34 §7, cada una con la pregunta, la recomendación de Gus y su estado. El estado MUST salir de un único dato por decisión en el módulo y MUST mostrarse en texto, no solo con color. Hoy las 8 MUST estar "abierta". Si una decisión pasa a "decidida", la página SHALL mostrar quién decidió y la fecha, leídos del módulo.

#### Scenario: Ocho abiertas
- **WHEN** una persona lee "Lo que hay que decidir"
- **THEN** lee 8 decisiones, cada una con "Recomendación de Gus" y el estado "abierta"

#### Scenario: Cambio de estado
- **WHEN** en el módulo una decisión pasa a `decidida` con fecha y quién
- **THEN** la página muestra "decidida", la fecha y quién, sin tocar ningún componente

### Requirement: Qué cambia respecto del modelo anterior
La página SHALL mostrar, una línea cada uno, lo que sale del modelo del 8-nov: la venta por tramos de precio creciente, el staking que paga FARO, la tierra como reserva de FARO y el reparto fijo con una parte en venta.

#### Scenario: Cambios
- **WHEN** una persona que vio la página el 9-nov lee "Qué cambió"
- **THEN** lee cuatro líneas, una por cada cosa que salió

### Requirement: Retiro del modelo anterior
La plataforma MUST NOT mostrar la venta de FARO por tramos ni su calculadora, el staking que da FARO nuevo, la tierra como reserva de FARO, el reparto fijo del suministro, la parte de NetXGen en FARO ni ningún texto sobre precio o retorno de FARO. Los ⚖ `ventatramos`, `stakingbiencomun` y `partenetxgen` MUST salir del catálogo. El ⚖ `tokenbiencomun` SHALL reescribirse según la propuesta, con `borrador: true`.

#### Scenario: Sin tramos ni staking
- **WHEN** se busca "tramo", "staking" o "precio de FARO" en `/bien-comun`, en los dos idiomas
- **THEN** solo aparecen dentro de la sección "Qué cambió"

#### Scenario: Catálogo
- **WHEN** se revisa `lib/legal/terminos.ts`
- **THEN** no existen `ventatramos`, `stakingbiencomun` ni `partenetxgen`

### Requirement: ⚖ de la propuesta
El catálogo SHALL sumar, con `borrador: true` y versión en inglés, `fideicomisobarrio`, `tokentierra`, `tokeninversor` y `tesorocomun`, cada uno con su explicación en palabras simples, diciendo que es una propuesta en discusión, que es una simulación y que lo legal está a verificar con abogado. `tokentierra` MUST decir que no arranca antes de la aprobación municipal (Ordenanza 173/2026). `tokeninversor` MUST decir que no hay fecha fija de devolución.

#### Scenario: Token Tierra y la Ordenanza 173
- **WHEN** una persona abre el ⚖ de Token Tierra
- **THEN** lee que no arranca antes de la aprobación municipal y que la aprobación no está otorgada

### Requirement: Un solo módulo con versión
Todos los valores de la propuesta SHALL salir de `lib/bien-comun/modelo.ts`, cada uno con su fuente, o de `lib/lotes/modelo.ts` cuando ya viven ahí. Ninguna pantalla ni diccionario MUST escribir un número de la propuesta. Un valor que falta MUST mostrarse "sin dato", nunca 0.

#### Scenario: Sin números escritos
- **WHEN** corre `lib/lotes/sin-numeros-escritos.test.ts`
- **THEN** pasa con los archivos de `app/bien-comun/`, `components/bien-comun/` y el diccionario del bien común

### Requirement: Sin promesas para FARO
Ningún texto sobre FARO o el tesoro del común MUST hablar de ganancia, retorno, valorización ni precio de FARO. La palabra "retorno" SHALL quedar permitida solo en los textos del carril A.

#### Scenario: Retorno solo en el carril A
- **WHEN** corre el test de promesas
- **THEN** "retorno" aparece solo bajo `carriles.a` del diccionario y en ningún ⚖ de FARO

### Requirement: Lenguaje y calidad
La página SHALL decir "bien común" (nunca "procomún") y "comunidad" (nunca "tribu"), MUST NOT nombrar a Hadron, MUST pasar axe en los dos idiomas, usar solo tokens del tema y ser usable con teclado. La presentación SHALL estar en componentes que reciben datos y textos por props y no importan el modelo.

#### Scenario: Inglés sin español suelto
- **WHEN** una persona abre `/bien-comun?lang=en`
- **THEN** lee todo en inglés y axe no reporta violaciones

#### Scenario: Palabras
- **WHEN** se busca "procomún", "tribu" o "Hadron" en la página
- **THEN** no aparecen
