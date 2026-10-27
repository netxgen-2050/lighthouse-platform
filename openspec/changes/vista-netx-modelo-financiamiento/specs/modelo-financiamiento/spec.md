# Spec Delta

## ADDED Requirements

### Requirement: Valor de la Serie Madre a 10 años
El sistema SHALL calcular el valor a N años de un monto invertido con un retorno neto anual reinvertido (monto × (1 + retorno)^N) y MUST devolver "sin dato" si el monto, el retorno o los años faltan o no son números finitos, o si el retorno es menor o igual a −100 %.

#### Scenario: USD 10.000 a 10 años
- **WHEN** se calcula USD 10.000 a 3, 6 y 9 % durante 10 años
- **THEN** da USD 13.439, 17.908 y 23.674 (±1), como `RESULTS_series_waterfall.md`

#### Scenario: USD 30.000
- **WHEN** se calcula USD 30.000 a 3, 6 y 9 % durante 10 años
- **THEN** da USD 40.317, 53.725 y 71.021 (±1)

### Requirement: Camino del vino
El sistema SHALL calcular cuántas botellas recibe quien pone USD 1.000 en Unidades del viñedo si toma en vino lo que cobra del año 1 al anteúltimo, al precio de la serie, y cuánto cobra en plata el último año. Con un precio no positivo MUST devolver "sin dato".

#### Scenario: Valores de partida
- **WHEN** se calcula el camino del vino con los valores de partida (USD 6 por botella)
- **THEN** da 302 botellas (redondeado) y USD 850 el año 15 (±1)

### Requirement: Catálogo de supuestos a confirmar
El sistema SHALL ofrecer una lista única de los supuestos sin confirmar que usa la Vista NetX, cada uno con etiqueta, valor de partida (o "sin dato"), quién lo confirma y fuente.

#### Scenario: Todos con dueño
- **WHEN** se recorre la lista
- **THEN** cada supuesto tiene quién lo confirma y fuente, y la entrada de la vivienda tiene valor "sin dato"
