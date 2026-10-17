# Spec Delta

## Purpose

Calcular, año por año, cómo reparte su plata una serie del programa de fideicomisos del diseño legal B (procomún, Notas Verdes, Unidades de Regeneración, primera pérdida y NetX), con el mismo modelo que `NS_Tokenomics/sim/series_waterfall_sim.py`.

## ADDED Requirements

### Requirement: Parámetros separados por naturaleza
The model's inputs SHALL be split into three groups: values that are decided (regeneration royalty, ground rent per hectare, Units cap, Units share of the residual, NetX management fee, first-loss target, SAFU discount), data that is measured (vineyard yield at maturity, net wine price, solar plant cost per MW, energy price) and fixed model assumptions. Each decided value and each measured datum SHALL carry its unit, its starting value and a text: who decides it, or its source.

#### Scenario: Un valor que se decide
- **WHEN** se lee la regalía de regeneración del escenario Viñedo
- **THEN** vale 5 %, su unidad es "% de los ingresos brutos" y quién decide es "Consejo de la Fundación, con la Voz de la Tierra y consulta a residentes y miembros RAIZ"

#### Scenario: Un dato que se mide
- **WHEN** se lee el precio de la energía del escenario Agrovoltaica
- **THEN** vale 60, su unidad es "USD por MWh" y su fuente dice que es un supuesto del modelo a confirmar con la cotización de un desarrollador y la consulta a la red

#### Scenario: El SAFU no entra en la cascada
- **WHEN** se cambia el descuento del SAFU y se corre el modelo
- **THEN** ningún flujo de la serie cambia

### Requirement: Orden de la cascada
Each year the model SHALL pay, in this order: operating costs; the Foundation (ground rent plus royalty on gross revenue); the NetX fee (a percentage of the capital raised); the Green Notes; the Regeneration Units up to their cap; the first-loss up to its target; and the residual, split between the commons and the Units by the residual share. The commons SHALL be paid before any investor every year.

#### Scenario: Año sin ventas
- **WHEN** se corre el Viñedo con los valores de partida
- **THEN** el año 1 tiene ingresos 0, costos 60.000, a la Fundación 1.000, comisión de NetX 8.550 y 0 para las Unidades, la primera pérdida y el excedente

#### Scenario: Excedente sobre los topes
- **WHEN** se corre el Viñedo con los valores de partida
- **THEN** el año 15 paga 411.950 a las Unidades, 153.981 a la primera pérdida y 123.220 de excedente al procomún (±1 USD)

### Requirement: Topes con cuentas de rendimiento
The Units and the first-loss SHALL each have a balance that starts at their capital, grows each year by their cap or target rate and shrinks with every payment; a class is paid at most its balance. Above both balances, the Units SHALL only receive their share of the residual.

#### Scenario: Unidades sin excedente
- **WHEN** se corre el Viñedo con el reparto del excedente en 0 % para las Unidades
- **THEN** la TIR de las Unidades no supera su tope del 9 %

### Requirement: Reserva y déficit
The part of the raise kept as a reserve SHALL cover yearly shortfalls first; a shortfall the reserve cannot cover SHALL become a deficit that later years repay before paying any investor class. Whatever is left of the reserve SHALL be released in the last year.

#### Scenario: La reserva cubre los primeros años
- **WHEN** se corre el Viñedo con los valores de partida
- **THEN** los años 1 a 4 no pagan a ninguna clase de inversor y ningún año queda con un pago negativo

### Requirement: Notas Verdes
The Green Notes SHALL pay interest only during the grace years and a fixed annuity afterwards until the balance is repaid, as in the source model.

#### Scenario: Gracia y anualidad
- **WHEN** se corre la Agrovoltaica con los valores de partida
- **THEN** las Notas Verdes cobran 168.000 el año 1, 320.057 cada año del 2 al 12 y 0 desde el 13 (±1 USD)

### Requirement: Salida al final del horizonte
In the last year the model SHALL add an exit value equal to the exit multiple times that year's operating cash after costs, Foundation and fee, never negative.

#### Scenario: Salida del viñedo
- **WHEN** se corre el Viñedo con los valores de partida
- **THEN** el año 15 suma una salida de 6 veces la caja operativa de ese año

### Requirement: Resultados de referencia del Viñedo
With the starting values, the vineyard scenario SHALL reproduce `sim/RESULTS_series_waterfall.md` (v0.1, 17-oct-2026) within ±1 USD on amounts, ±0,01 on multiples and ±0,05 percentage points on IRR.

#### Scenario: Totales del Viñedo
- **WHEN** se corre el Viñedo con los valores de partida
- **THEN** la serie levanta 570.000 (primera pérdida 85.500, Unidades 484.500, Notas 0); la primera pérdida recibe 153.981 (1,80x, TIR 4,0 %); las Unidades 1.290.250 (2,66x, TIR 9,2 %); el procomún 306.970; NetX 128.250

#### Scenario: Cada año del Viñedo
- **WHEN** se corre el Viñedo con los valores de partida
- **THEN** cada fila de la tabla año por año coincide con la de `RESULTS_series_waterfall.md` (±1 USD por celda)

### Requirement: Resultados de referencia de la Agrovoltaica
With the starting values, the agrivoltaic scenario SHALL reproduce `sim/RESULTS_series_waterfall.md` within the same tolerances.

#### Scenario: Totales de la Agrovoltaica
- **WHEN** se corre la Agrovoltaica con los valores de partida
- **THEN** la serie levanta 4.000.000 (Notas 2.400.000, primera pérdida 400.000, Unidades 1.200.000); las Notas reciben 3.688.622 (1,54x, TIR 7,0 %); la primera pérdida 1.024.620 (2,56x, TIR 5,0 %); las Unidades 3.402.456 (2,84x, TIR 10,3 %); el procomún 1.357.031; NetX 800.000

### Requirement: USD 1.000 en Unidades
The model SHALL scale the Units' cash flows to an investment of USD 1.000 and return the total received and its IRR.

#### Scenario: Mil dólares en el viñedo y en la agrovoltaica
- **WHEN** se corren los dos escenarios con los valores de partida
- **THEN** USD 1.000 en Unidades del Viñedo devuelven 2.663 (TIR 9,2 %) y en la Agrovoltaica 2.835 (TIR 10,3 %), ±1 USD y ±0,05 puntos

### Requirement: TIR sin dato
When a class's cash flows have no sign change in the search interval (for example, it never gets paid), its IRR SHALL be "sin dato" (`null`), never 0 nor an invented value. A class with no capital SHALL have no multiple nor IRR.

#### Scenario: Una clase que no cobra
- **WHEN** se corre el Viñedo con el rendimiento en madurez en 0 t/ha
- **THEN** la TIR de las Unidades es `null`

#### Scenario: Viñedo sin Notas
- **WHEN** se corre el Viñedo con los valores de partida
- **THEN** las Notas Verdes no tienen múltiplo ni TIR

### Requirement: Rendimiento del viñedo escalado
Changing the vineyard yield at maturity SHALL scale the whole ramp-up curve (0, 0, 2, 4, 6 and then 7 t/ha with the starting value) in the same proportion.

#### Scenario: Mitad de rendimiento
- **WHEN** se corre el Viñedo con 3,5 t/ha en madurez
- **THEN** la cosecha es 0, 0, 1, 2 y 3 t/ha los años 1 a 5 y 3,5 t/ha desde el año 6

### Requirement: Mover un valor que se decide
Changing a decided value SHALL change the flows only through its place in the waterfall.

#### Scenario: Sin regalía
- **WHEN** se corre el Viñedo con la regalía en 0 %
- **THEN** cada año la Fundación recibe solo el canon, 1.000 USD, antes del excedente

#### Scenario: Sin comisión
- **WHEN** se corre cualquier escenario con la comisión de NetX en 0 %
- **THEN** NetX recibe 0 en total

### Requirement: Cálculo puro
The model SHALL be a pure function: same inputs, same outputs, no network, no storage and no dependency on the UI.

#### Scenario: Dos corridas iguales
- **WHEN** se corre dos veces el mismo escenario con los mismos parámetros
- **THEN** los dos resultados son idénticos
