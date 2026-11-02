# Spec Delta

## Purpose

Tener en un solo lugar, con su versión y su fuente, los valores de ejemplo de la venta de lotes y las cuentas que se hacen con ellos, para que ninguna pantalla escriba un número propio.

## ADDED Requirements

### Requirement: Un solo módulo con versión
Los valores de la venta de lotes SHALL vivir en un único módulo que declare su fuente, su versión y su fecha: precio de referencia, aporte único, expensa anual, presupuesto común anual y casa de referencia. Ninguna pantalla ni diccionario MUST escribir estos números.

#### Scenario: Número en una pantalla
- **WHEN** alguien escribe "500.000" en una página de lotes o en su diccionario
- **THEN** el test que vigila los números falla nombrando el archivo

#### Scenario: Versión visible
- **WHEN** una persona lee los costos de un lote
- **THEN** ve la fuente, la versión y la fecha del modelo

### Requirement: Lo que falta es sin dato
Infraestructura, precio de la casa y parte del dueño SHALL mostrarse como "sin dato" mientras no haya un valor. MUST NOT mostrarse como 0 ni estimarse, y un total que dependa de uno de ellos MUST decir también "sin dato".

#### Scenario: Costos
- **WHEN** una persona lee los costos de un lote
- **THEN** Infraestructura y Parte del dueño dicen "sin dato"

### Requirement: Cuentas puras según la cantidad de lotes
El módulo SHALL calcular, para una cantidad de lotes dada: el aporte por lote y total, las expensas totales, la expensa necesaria para cubrir el presupuesto común y los años que cubre el aporte. La cantidad MUST venir de los datos del loteo. Con cero lotes MUST dar "sin dato", nunca un error ni infinito.

#### Scenario: Con 25 lotes
- **WHEN** se calcula con 25 lotes y los valores de ejemplo
- **THEN** el aporte total es USD 625.000, las expensas totales USD 75.000 y la expensa necesaria USD 9.600 por lote al año

#### Scenario: Sin lotes
- **WHEN** se calcula con 0 lotes
- **THEN** el resultado es "sin dato"

### Requirement: La lección del aporte sale de la cuenta
El texto sobre si el aporte único alcanza SHALL elegirse según la cuenta, en los dos idiomas. Si el aporte total es menor que el presupuesto anual, MUST decir que no alcanza ni el primer año; si no, MUST decir cuántos años paga y que no se repite. El texto MUST NOT afirmar algo que los valores no sostengan.

#### Scenario: Valores de hoy
- **WHEN** se arma la lección con 25 lotes y los valores de ejemplo
- **THEN** dice que el aporte suma USD 625.000, que paga 2,6 años de presupuesto y que no se repite

#### Scenario: Aporte menor que el presupuesto
- **WHEN** se arma la lección con 5 lotes
- **THEN** dice que no alcanza ni para el primer año

### Requirement: La lección de las expensas
El módulo SHALL dar el texto de cuánto pide por lote cubrir el presupuesto común solo con expensas, comparado con la expensa de ejemplo, en los dos idiomas.

#### Scenario: Con 25 lotes
- **WHEN** se arma la lección con 25 lotes
- **THEN** dice "USD 9.600" por lote al año y que la expensa de ejemplo es "USD 3.000"
