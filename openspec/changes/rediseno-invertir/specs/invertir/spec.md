# Spec Delta

## Purpose

Invertir muestra a quien invierte, con la claridad de una app financiera, qué barrio se financia, cómo se le devuelve la plata y qué parte va al común: indicadores, una curva de devolución y el libro del barrio, todo de ejemplo, como propuesta en discusión y sin rendimiento prometido.

## ADDED Requirements

### Requirement: Invertir solo con sesión
`/invertir` SHALL mostrarse completo solo a una persona con sesión, hasta la revisión R14. Sin sesión, MUST mostrar un aviso corto con el enlace para entrar y ningún número del barrio, ni en la pantalla ni en el HTML de la página.

#### Scenario: Sin sesión
- **WHEN** una persona sin sesión abre `/invertir`
- **THEN** ve el aviso para entrar y la página no contiene la meta de la obra ni la curva

#### Scenario: Con sesión
- **WHEN** una persona con sesión abre `/invertir`
- **THEN** ve el barrio en financiamiento con sus indicadores, la curva y el libro

### Requirement: Sellos de Invertir
Con sesión, la página SHALL mostrar antes de cualquier número "Propuesta v0.1 · en discusión", "Prototipo interno · datos de ejemplo", "venta simulada · aprobación municipal pendiente" y que no es una oferta. La aprobación municipal MUST NOT mostrarse como otorgada.

#### Scenario: Sellos primero
- **WHEN** una persona con sesión abre `/invertir`
- **THEN** los sellos aparecen antes del primer indicador

### Requirement: Indicadores del barrio en financiamiento
Por cada barrio en financiamiento, la página SHALL mostrar como indicadores, con números en monoespaciada: la meta de la obra, cuánto se juntó, el mes en que se terminaría de devolver al inversor si cobra con las cuotas y la parte de cada pago que va al común. Lo juntado MUST decir "sin dato" mientras no haya plata real. Si no se termina de devolver en el horizonte del modelo, MUST decir "no en 6 años".

#### Scenario: Barrio Norte
- **WHEN** una persona con sesión mira Barrio Norte
- **THEN** ve la meta de la obra, "sin dato" en lo juntado, el mes de devolución y la parte para el común, calculados por el módulo del barrio

#### Scenario: Chip de estado
- **WHEN** la persona mira el barrio
- **THEN** el barrio lleva el chip "En financiamiento" con su texto e ícono

### Requirement: Curva de devolución
La página SHALL mostrar la curva de lo devuelto al inversor, acumulado mes a mes, frente a lo que trajo, calculada por el módulo del barrio. El gráfico MUST tener título y descripción para el lector de pantalla, distinguir las dos series por forma o trazo además del color, y venir acompañado de una tabla equivalente por trimestre.

#### Scenario: Tabla equivalente
- **WHEN** una persona con lector de pantalla llega a la curva
- **THEN** oye el título y la descripción del gráfico y puede leer la tabla con lo devuelto por trimestre

#### Scenario: Sin color
- **WHEN** se mira la curva en escala de grises
- **THEN** se distingue lo devuelto de lo que trajo el inversor por el trazo

### Requirement: Libro del barrio
La página SHALL mostrar el libro del barrio: una tabla con título con los movimientos del fideicomiso del caso de ejemplo, por trimestre, con el momento ("mes N"), el motivo (cuotas que entran, devolución al inversor, parte para el común) y el monto. MUST NOT inventar fechas de calendario.

#### Scenario: Movimientos
- **WHEN** una persona con sesión mira el libro
- **THEN** ve filas con "mes N", motivo y monto, que coinciden con el cálculo del módulo del barrio

### Requirement: Cómo funciona
La página SHALL explicar en tres líneas qué financia el Token Inversor, cómo cobra (a medida que entran las cuotas) y por qué no hay fecha fija, con los términos ⚖ del Token Inversor y del fideicomiso del barrio, y enlazar a `/bien-comun`.

#### Scenario: Términos legales
- **WHEN** la persona activa el ⚖ de "Token Inversor"
- **THEN** ve su explicación en palabras simples, marcada como borrador

### Requirement: Sin rendimiento prometido
Ningún texto de Invertir SHALL mostrar un rendimiento anual, APY, TIR, ganancia, recupero ni valorización, en ningún idioma. Un test MUST recorrer los archivos y textos de Invertir y fallar si aparece alguna de esas palabras.

#### Scenario: Palabra prohibida
- **WHEN** alguien agrega "rendimiento anual" a un texto de Invertir
- **THEN** el test de sin rendimiento falla

### Requirement: Sin números escritos en Invertir
Todos los números de Invertir SHALL salir de los módulos del bien común y de lotes, con su versión. El test que vigila números escritos MUST recorrer los archivos de Invertir.

#### Scenario: Número escrito a propósito
- **WHEN** alguien escribe la meta de la obra en `app/invertir/page.tsx`
- **THEN** el test de números escritos falla

### Requirement: Calidad de Invertir
`/invertir` SHALL ser bilingüe, pasar axe en los dos idiomas y los dos temas, ser usable con teclado, no tener scroll horizontal a 390 px y respetar la reducción de movimiento (la curva no se anima cuando se pide).

#### Scenario: Celular
- **WHEN** una persona con sesión abre `/invertir` a 390 × 844
- **THEN** los indicadores, la curva y el libro se ven sin scroll horizontal en la página
