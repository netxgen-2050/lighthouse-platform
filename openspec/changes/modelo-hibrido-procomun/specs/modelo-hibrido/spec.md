# Spec Delta

## Purpose

Explicar a quien mira un lote qué sería suyo y qué sería de todos, quién lo paga, por qué la venta sola no alcanza y qué resguardos pide el modelo híbrido, sin inventar los números que faltan.

## ADDED Requirements

### Requirement: Qué es privado y qué es común
`/lotes/hibrido` SHALL mostrar el título "Qué es tuyo y qué es de todos" y una tabla que marque en texto como privado el lote y la casa, y como común caminos, agua, aguas grises y negras, basura, escuela, restauración y producción. MUST ser pública y estar enlazada desde `/lotes` y desde cada ficha.

#### Scenario: Leer la tabla
- **WHEN** una persona sin sesión abre `/lotes/hibrido`
- **THEN** lee cada rubro con la palabra "Privado" o "Común"

#### Scenario: Desde la ficha
- **WHEN** la persona activa el enlace desde `/lotes/lote-7`
- **THEN** llega a `/lotes/hibrido`

### Requirement: Quién lo paga
La tabla SHALL decir quién pagaría cada rubro: quien compra lo privado, y el presupuesto común lo común, presentado como supuesto del modelo. El costo de cada rubro sin valor MUST decir "sin dato", y la tabla MUST NOT repartir el presupuesto entre rubros.

#### Scenario: Costo de un rubro
- **WHEN** una persona lee la fila "Escuela"
- **THEN** lee "Común", "Presupuesto común" y "sin dato"

### Requirement: Cuánto aporta cada lote
La página SHALL mostrar el aporte único y las expensas por lote, leídos del módulo del modelo, con sus ⚖ en borrador, y decir que no hay dato de si el aporte se suma al precio o va incluido.

#### Scenario: Aportes
- **WHEN** una persona lee "Cuánto aporta cada lote"
- **THEN** lee que el aporte único es el 5 % de lo que se paga, "USD 1.200" por año y "sin dato" sobre si el aporte va incluido

### Requirement: Por qué la venta sola no alcanza
La página SHALL mostrar las lecciones calculadas por el módulo: qué paga el aporte único, cuánta expensa haría falta para cubrir el presupuesto común y cuánto falta por año con la expensa de ejemplo. De dónde sale lo que falta MUST decir "sin dato". Ningún número MUST estar escrito en la página.

#### Scenario: Con los valores de hoy
- **WHEN** una persona lee esa sección con 25 lotes
- **THEN** lee "USD 190.125", "USD 63.375", "USD 72.000", "USD 2.880", "USD 1.200" y "USD 42.000"

#### Scenario: Cambia el modelo
- **WHEN** cambia un valor del módulo
- **THEN** las lecciones cambian sin tocar la página

### Requirement: Resguardos
La página SHALL listar los resguardos del modelo: servidumbres antes de la primera venta, mismo reglamento y aporte para todos, preferencia de reventa, y ninguna venta sobre la franja del río. Cada uno MUST decir en texto que todavía no está hecho, con un ⚖ en borrador. MUST NOT dar a entender que ya se cumplen.

#### Scenario: Estado
- **WHEN** una persona lee los resguardos
- **THEN** cada uno dice "Todavía no está hecho"

#### Scenario: Franja del río
- **WHEN** una persona lee el resguardo de la franja del río
- **THEN** lee que el loteo provisorio no considera la costa ni la línea de inundación y que no está verificado (sin dato)

### Requirement: Calidad de la página
`/lotes/hibrido` SHALL mostrar el aviso de prototipo y el estado administrativo compacto de `lighthouse-norte`, ser bilingüe (es/en), usar solo tokens del tema, pasar la auditoría de axe en los dos idiomas y no tener scroll horizontal a 390 px. Las tablas MUST leerse sin depender del color.

#### Scenario: Inglés
- **WHEN** una persona abre `/lotes/hibrido?lang=en`
- **THEN** el contenido se lee en inglés, sin español suelto

#### Scenario: Celular
- **WHEN** la página se ve a 390 × 844 px
- **THEN** no hay scroll horizontal en la página
