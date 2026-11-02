# Spec Delta

## MODIFIED Requirements

### Requirement: La Vista NetX es para toda persona con sesión
Todas las pestañas de la Vista NetX (Resumen, Simulador y Comunidad y embudo) SHALL mostrarse a toda persona con sesión, de cualquier nivel. A quien no tiene sesión, la plataforma MUST llevarlo a Sumarte como en cualquier página personal, sin mostrar el contenido. El enlace "NetX" de la barra superior SHALL aparecer para toda persona con sesión.

#### Scenario: Persona con sesión
- **WHEN** una persona con rol "persona" abre `/netx`
- **THEN** ve el h1 "¿Cómo se financia NetX?" y los tres bolsillos

#### Scenario: Comunidad y embudo con sesión
- **WHEN** una persona con rol "persona" abre `/netx/comunidad`
- **THEN** ve el h1 "Comunidad y embudo" y el embudo, sin "No tenés acceso"

#### Scenario: Enlace en la barra
- **WHEN** una persona con rol "persona" entra a la plataforma
- **THEN** ve el enlace "NetX" en la barra superior y la lleva a `/netx`

#### Scenario: Sin sesión
- **WHEN** alguien sin sesión abre `/netx`
- **THEN** termina en Sumarte con la vuelta a `/netx` y no ve el Resumen

### Requirement: Un título por pestaña, sin el hito del Congreso
Cada pestaña SHALL tener un único título de nivel 1 propio y el aviso "Prototipo interno · datos de ejemplo". Ninguna pestaña MUST usar el Congreso ni "febrero" como hito de venta: el texto "¿Vamos a vender en febrero?" desaparece.

#### Scenario: Títulos
- **WHEN** una persona con sesión recorre las tres pestañas
- **THEN** ve un solo h1 en cada una: "¿Cómo se financia NetX?", "Simulador de la tokenomics" y "Comunidad y embudo"
- **AND** en ninguna aparece "¿Vamos a vender en febrero?"

### Requirement: Resumen en una frase
La pestaña Resumen SHALL abrir con el h1 "¿Cómo se financia NetX?" y una respuesta corta: NetX es la empresa que diseña, gestiona y opera la plataforma y cobra por su trabajo; la fase 1 suma la venta de lotes privados en Lighthouse VRN, simulada en este prototipo; la tierra común queda en una Fundación que todavía no existe y la plata de los proyectos entra por series.

#### Scenario: Respuesta corta
- **WHEN** una persona con sesión abre `/netx`
- **THEN** lee, debajo del título, que NetX cobra por su trabajo, que la venta de lotes está simulada, y que la Fundación todavía no existe

### Requirement: Quién es quién con la plata
La pestaña SHALL mostrar una tabla con NetX, la Fundación, las series y BioPueblo: qué es cada uno, qué plata tiene y si NetX puede tomar de ahí, con la respuesta en texto (no solo con un ícono). La Fundación MUST presentarse como parte del modelo híbrido que todavía no existe, no como un hecho.

#### Scenario: Fundación
- **WHEN** una persona con sesión lee la fila de la Fundación
- **THEN** lee "en el modelo híbrido, la tierra común queda en ella (todavía no existe)" y que NetX nunca toma un porcentaje, solo una tarifa fija y pública si la Fundación contrata la plataforma

## ADDED Requirements

### Requirement: El modelo híbrido en el Resumen
El Resumen SHALL contar en un solo bloque el modelo híbrido: lotes privados simulados en el sector norte, y lo común sostenido entre todos, con el procomún explicado en palabras simples y un enlace a `/lotes/hibrido`. Ningún texto de la Vista NetX MUST usar "capitalista", "extractivista" ni "colonialista", ni nombrar a una persona como defensora de una opción. "Diseño B" solo MUST aparecer al citar doc 28.

#### Scenario: Bloque híbrido
- **WHEN** una persona con sesión abre `/netx`
- **THEN** lee "El modelo híbrido", que el procomún es "lo que es de todos y se cuida entre todos", y un enlace a `/lotes/hibrido`
- **AND** no lee "Juego A", "Juego B" ni "¿Y vender lotes?"

#### Scenario: Palabras que no van
- **WHEN** se lee todo el texto de `/netx` y `/netx/simulador`
- **THEN** no aparece "capitalista", "extractivista", "colonialista" ni "Franz"
- **AND** "diseño B" aparece solo junto a "doc 28"

### Requirement: El modelo híbrido en la pestaña de financiamiento
`/netx/financiamiento` SHALL mostrar la sección "El modelo híbrido" con tres bloques: lotes privados, procomún y series y NetX. MUST mostrar las lecciones del módulo de lotes y sus valores sin escribirlos a mano, decir "sin dato" sobre quién cobra la venta, y MUST NOT decir "vender lotes no es el atajo".

#### Scenario: Índice
- **WHEN** una persona con sesión activa "El modelo híbrido" en el índice
- **THEN** llega a esa sección, y no hay ningún enlace "Juego A o Juego B"

#### Scenario: Bloques
- **WHEN** una persona con sesión lee la sección
- **THEN** lee que la venta es simulada, las lecciones del aporte y de las expensas, "Quién cobra la venta: sin dato", y que NetX no puede cobrar comisión por vender lotes sin matrícula de corredor

#### Scenario: Palabras que no van
- **WHEN** se lee todo el texto de `/netx/financiamiento`
- **THEN** no aparece "capitalista", "extractivista" ni "colonialista", "diseño B" aparece solo junto a "doc 28", y no aparece "atajo"

## REMOVED Requirements

### Requirement: Juego A y Juego B
**Reason**: La fase 1 es la venta de lotes más el modelo híbrido (ADR-028). El contraste presentaba vender como el camino que no se toma.
**Migration**: Lo reemplaza "El modelo híbrido en el Resumen". `PROCOMUN_EN_SIMPLE` se conserva.

### Requirement: Vender lotes en tres líneas
**Reason**: Sus tres razones ("no se puede", "no hace falta" y que la tierra queda en la Fundación) contradicen la decisión de la fase 1.
**Migration**: Lo reemplaza "El modelo híbrido en el Resumen". La explicación de la Ordenanza 173 sigue en su ⚖, reescrito.

### Requirement: Juego A o Juego B
**Reason**: La tabla comparaba "vender lotes ahora" con "el procomún", cuando ahora conviven.
**Migration**: La reemplaza "El modelo híbrido en la pestaña de financiamiento". El detalle sigue en NS_Tokenomics doc 30 §3 como contexto.
