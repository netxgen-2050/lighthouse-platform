# Spec Delta

## Purpose

Dejar que el equipo mueva los números del barrio de la propuesta v0.1 (`NS_Tokenomics` doc 34 §4, `sim/barrio_stack_sim.py` v0.1) y vea en cuántos meses le vuelve la plata al inversor si cobra con las cuotas y cuánto le llega al común, sin guardar nada.

## ADDED Requirements

### Requirement: Sección "Los números del barrio"
`/bien-comun` SHALL mostrar la sección "Los números del barrio" después de la política de FARO, con la fuente y la versión del simulador leídas del módulo, y el aviso de que son números de ejemplo, que no es una oferta y que faltan los costos de obra reales ("sin dato").

#### Scenario: Fuente visible
- **WHEN** una persona lee la sección
- **THEN** lee "barrio_stack_sim.py v0.1", "números de ejemplo" y "sin dato" para los costos de obra

### Requirement: Calculadora editable
La sección SHALL tener una calculadora con cinco campos editables con teclado (precio del lote, lotes vendidos por trimestre, cantidad de cuotas, infraestructura por lote, prima anual del inversor), cada uno con etiqueta visible y su valor de partida leído del módulo. MUST NOT guardar nada: sin almacenamiento local ni parámetros en la dirección. SHALL tener un botón para volver a los valores de partida.

#### Scenario: Valores de partida
- **WHEN** una persona abre la página
- **THEN** los campos muestran los valores de partida del módulo (lote de USD 27.500, 2 lotes por trimestre, 24 cuotas, USD 12.000 de infraestructura, 10 % anual)

#### Scenario: Nada se guarda
- **WHEN** cambia un valor y recarga la página
- **THEN** vuelven los valores de partida

### Requirement: Resultados del carril A
La calculadora SHALL mostrar, calculados por `lib/bien-comun/barrio.ts`: cuánto tiene que traer el Token Inversor; en qué mes se le termina de devolver si cobra a medida que entran las cuotas y cuánto recibe en total; y qué parte de lo que debe tendría el fideicomiso si se hubiera prometido devolver a los 12 meses. Si no se termina de devolver en el horizonte del modelo, MUST decir "no en 6 años" y MUST NOT mostrar un mes. Los resultados MUST anunciarse a los lectores de pantalla al cambiar.

#### Scenario: Caso base
- **WHEN** la calculadora está en los valores de partida
- **THEN** muestra unos USD 317.200 a levantar, mes 48 y unos USD 384.382 recibidos, y 21 % a los 12 meses

#### Scenario: Lote más caro
- **WHEN** una persona escribe 40000 en el precio del lote
- **THEN** el mes pasa a 29 y la región de resultados lo anuncia

#### Scenario: No cierra en el horizonte
- **WHEN** escribe 1 en lotes por trimestre
- **THEN** lee "no en 6 años" y ningún mes

### Requirement: Lo que le llega al común
La calculadora SHALL mostrar, en una tabla con título, lo que le llega al común en cada uno de los 6 años (parte de cada pago, expensas y total) y qué parte del presupuesto anual del común (leído de `lib/lotes/modelo.ts`) cubren las expensas cuando terminan las ventas. MUST NOT hablar de FARO en estos resultados.

#### Scenario: Caso base del común
- **WHEN** la calculadora está en los valores de partida
- **THEN** la tabla muestra 12.700, 26.150, 34.275, 29.600, 25.750 y 25.200 dólares por año y que eso cubre cerca del 35 % del presupuesto

### Requirement: Entradas inválidas
Con un campo vacío, negativo o no numérico, o con cuotas o lotes por trimestre que no sean enteros, la calculadora SHALL decir qué campo revisar y MUST mostrar "sin dato" en lugar de cualquier resultado, nunca 0.

#### Scenario: Campo vacío
- **WHEN** una persona borra el precio del lote
- **THEN** lee que revise el precio y los resultados dicen "sin dato"

### Requirement: Cálculo fiel al simulador
`lib/bien-comun/barrio.ts` SHALL ser una función pura que reproduce `barrio_stack_sim.py` v0.1. Sus tests MUST reproducir los valores de `RESULTS_barrio_stack.md` para el caso base, para lotes a USD 40.000, para 1 lote por trimestre y para la cobertura a 12 y 24 meses. Los parámetros MUST salir de `lib/bien-comun/modelo.ts` o de `lib/lotes/modelo.ts`, cada uno con su fuente; ninguna pantalla ni diccionario MUST escribirlos.

#### Scenario: Tests del simulador
- **WHEN** corre `pnpm test lib/bien-comun`
- **THEN** pasan los casos tomados de `RESULTS_barrio_stack.md`

### Requirement: Calidad de la calculadora
La calculadora SHALL ser bilingüe, usable solo con teclado, pasar axe en los dos idiomas, no tener scroll horizontal a 390 px y usar solo tokens del tema. MUST vivir en un componente que recibe valores de partida y textos por props.

#### Scenario: Inglés
- **WHEN** una persona abre `/bien-comun?lang=en` y usa la calculadora con Tab y el teclado
- **THEN** todo está en inglés y axe no reporta violaciones
