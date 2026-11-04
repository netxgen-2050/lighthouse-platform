# Spec Delta

## Purpose

Tener en un solo lugar, con su versión y su fuente, los valores de ejemplo de la venta de lotes y las cuentas que se hacen con ellos, para que ninguna pantalla escriba un número propio.

## ADDED Requirements

### Requirement: Un solo módulo con versión
Los valores de la venta de lotes SHALL vivir en un único módulo que declare su fuente, su versión y su fecha: rango de precios de lote, casas, aporte único, expensa anual, presupuesto común anual, años de venta, infraestructura por lote y parte del dueño. Ninguna pantalla ni diccionario MUST escribir estos números.

#### Scenario: Número en una pantalla
- **WHEN** alguien escribe "15.000" en una página de lotes o en su diccionario
- **THEN** el test que vigila los números falla nombrando el archivo

#### Scenario: Versión visible
- **WHEN** una persona lee los costos de un lote
- **THEN** ve la fuente, la versión y la fecha del modelo

### Requirement: Valores provisorios marcados
Todo valor del módulo SHALL mostrarse como de ejemplo. Lo que no salga de un presupuesto (casas, infraestructura, parte del dueño) MUST decir en texto que es una estimación, nunca presentarse como un precio firme.

#### Scenario: Costos
- **WHEN** una persona lee los costos de un lote
- **THEN** Infraestructura y Parte del dueño muestran un valor con la marca "de ejemplo"

### Requirement: Precio del lote según la superficie
El precio de un lote SHALL ir de forma lineal del mínimo al máximo del rango según su superficie, y MUST quedar en el extremo si la superficie está fuera del rango. Sin superficie, el precio MUST decir "sin dato".

#### Scenario: Extremos
- **WHEN** se calcula el precio de lotes de 1.680 y 2.798 m²
- **THEN** dan USD 15.000 y USD 40.000

#### Scenario: Fuera de rango
- **WHEN** se calcula el precio de un lote de 3.000 m²
- **THEN** da USD 40.000

### Requirement: Paquetes con casa
El módulo SHALL calcular el precio de cada casa como superficie por precio por m², y el del paquete como lote más casa. Las tres casas MUST dar los valores de `sim/RESULTS_lot_sale.md` v0.2.

#### Scenario: Casas
- **WHEN** se calculan las casas modular, familiar y amplia
- **THEN** dan USD 90.000, USD 238.000 y USD 500.000

### Requirement: Cuentas puras según la cantidad de lotes
El módulo SHALL calcular, para una cantidad de lotes dada: el aporte total y el del primer año, las expensas totales, la expensa necesaria para cubrir el presupuesto común y los años que cubre el aporte, usando el paquete promedio de la mezcla de compradores. La cantidad MUST venir de los datos del loteo. Con cero lotes MUST dar "sin dato", nunca un error ni infinito.

#### Scenario: Con 25 lotes
- **WHEN** se calcula con 25 lotes y los valores de ejemplo
- **THEN** el aporte total es USD 190.125, el del primer año USD 63.375, las expensas totales USD 30.000 y la expensa necesaria USD 2.880 por lote al año

#### Scenario: Sin lotes
- **WHEN** se calcula con 0 lotes
- **THEN** el resultado es "sin dato"

### Requirement: La lección del aporte sale de la cuenta
El texto sobre si el aporte único alcanza SHALL elegirse según la cuenta, en los dos idiomas. Si lo que entra el primer año es menor que el presupuesto anual, MUST decir que no alcanza y que el aporte no se repite; si no, MUST decir cuántos años paga y que no se repite. El texto MUST NOT afirmar algo que los valores no sostengan.

#### Scenario: Valores de hoy
- **WHEN** se arma la lección con 25 lotes y los valores de ejemplo
- **THEN** dice que el aporte suma USD 190.125, que el primer año entran USD 63.375 y que no alcanza para USD 72.000 por año

#### Scenario: Más lotes
- **WHEN** se arma la lección con 50 lotes
- **THEN** dice cuántos años paga y que no se repite

### Requirement: La lección de las expensas
El módulo SHALL dar el texto de cuánto pide por lote cubrir el presupuesto común solo con expensas, comparado con la expensa de ejemplo, en los dos idiomas.

#### Scenario: Con 25 lotes
- **WHEN** se arma la lección con 25 lotes
- **THEN** dice "USD 2.880" por lote al año y que la expensa de ejemplo es "USD 1.200"
