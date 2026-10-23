# Spec Delta

## Purpose

Que cada número del financiamiento de NetX, del procomún y de los inversores que muestra la plataforma salga de un cálculo con fuente y versión, reproducible contra los RESULTS de NS_Tokenomics, y que lo que falta quede como "sin dato".

## ADDED Requirements

### Requirement: Fuente y versión de cada número
Cada valor del financiamiento SHALL tener anotados su documento o modelo de origen en NS_Tokenomics y su versión y fecha. Los valores que el modelo marca como supuestos sin confirmar MUST quedar marcados como tales, con quién los confirma.

#### Scenario: Consumo del equipo
- **WHEN** la plataforma pide el consumo mensual del equipo
- **THEN** obtiene USD 31.000 con fuente "NS_Tokenomics doc 30 §2b (doc 12)" y la marca "a confirmar con Vagner"

### Requirement: Ingresos de la plataforma
El sistema SHALL calcular, para los escenarios bajo, base y bueno del modelo de ingresos de la plataforma (membresías y Plan Tribu), los usuarios registrados, miembros que pagan, tribus que pagan, ingreso por mes y porcentaje del consumo en cada mes del 1 al 36, y el total de los 36 meses, igual que `platform_revenue_sim.py` v0.1, incluido su redondeo de las tribus.

#### Scenario: Mes 36 del escenario base
- **WHEN** se corre el escenario base
- **THEN** el mes 36 da 2.660 registrados, 82 miembros que pagan (redondeado), 10 tribus, USD 1.336 por mes (±1) y 4,3 % del consumo (±0,05 puntos)

#### Scenario: Totales de 36 meses
- **WHEN** se corren los tres escenarios
- **THEN** los totales dan USD 11.659, 31.478 y 72.323 (±1) y cubren 0,4, 1,0 y 2,3 meses de consumo

#### Scenario: Redondeo de las tribus
- **WHEN** el modelo interpola 2,5 tribus en un mes
- **THEN** cuenta 2, como el redondeo de Python, no 3

### Requirement: Pase Fundador para el procomún
El sistema SHALL calcular lo que junta el Pase Fundador en cada escenario y si alcanza el mínimo de USD 75.000, y MUST identificarlo como plata del procomún, nunca como ingreso de NetX.

#### Scenario: Pase Fundador
- **WHEN** se calculan los tres escenarios del Pase
- **THEN** dan USD 49.500 (no alcanza), 96.000 (alcanza) y 171.000 (alcanza), y ninguno suma a los ingresos de NetX

### Requirement: Capital bajo gestión necesario
El sistema SHALL calcular el capital bajo gestión que hace falta para cubrir el consumo anual solo con la comisión de gestión, dado el consumo mensual y la tasa de la comisión; con una tasa no positiva o un dato que falta MUST devolver "sin dato".

#### Scenario: Con 1,5 % y 1 %
- **WHEN** el consumo es USD 31.000 por mes
- **THEN** a 1,5 % hacen falta USD 24.800.000 y a 1 % USD 37.200.000

#### Scenario: Tasa cero
- **WHEN** la tasa de la comisión es 0
- **THEN** el resultado es "sin dato", no infinito ni 0

### Requirement: Comisión de desarrollo
El sistema SHALL calcular la comisión de desarrollo de una serie como el rango del 3 al 5 % de su capex, cobrada una vez.

#### Scenario: Agrovoltaica
- **WHEN** el capex de la agrovoltaica es USD 4.000.000
- **THEN** la comisión de desarrollo va de USD 120.000 a 200.000

### Requirement: Reparto de partida de cada serie
El sistema SHALL armar, para el viñedo y la agrovoltaica con sus valores de partida, cuánto recibe cada destino (procomún, NetX, Unidades, primera pérdida y Notas Verdes si la serie las tiene), con montos, múltiplos, TIR y comisión anual de NetX, usando el mismo modelo de series que el simulador.

#### Scenario: Viñedo de partida
- **WHEN** se arma el reparto del viñedo
- **THEN** el procomún recibe USD 306.970, NetX USD 128.250 (8.550 por año), las Unidades USD 1.290.250 (2,66x, 9,2 %), la primera pérdida USD 153.981 y Notas Verdes no tiene (sin dato, no 0)

#### Scenario: Agrovoltaica de partida
- **WHEN** se arma el reparto de la agrovoltaica
- **THEN** el procomún recibe USD 1.357.031, NetX USD 800.000 (40.000 por año), las Notas Verdes USD 3.688.622 (7,0 %) y las Unidades USD 3.402.456 (2,84x, 10,3 %)

### Requirement: Rangos de Monte Carlo como tabla versionada
El sistema SHALL ofrecer los resultados de `series_montecarlo_sim.py` v0.1 (2.000 futuros, semilla 7) tal como están en `RESULTS_series_montecarlo.md`, por serie: P10, P50 y P90 de la TIR de las Unidades y de lo que recibe la Fundación, el múltiplo de la primera pérdida, y las probabilidades de perder plata, de llegar al tope y de que la primera pérdida no se recupere completa. No los recalcula.

#### Scenario: Viñedo
- **WHEN** se piden los rangos del viñedo
- **THEN** la TIR de las Unidades es −2,6 % / 8,4 % / 10,8 %, la Fundación recibe USD 115.739 / 160.220 / 1.332.549, y las probabilidades son 22 %, 44 % y 60 %

#### Scenario: Orden de los percentiles
- **WHEN** se leen los rangos de cualquier serie
- **THEN** P10 ≤ P50 ≤ P90 y cada probabilidad está entre 0 y 1

### Requirement: Cálculos puros
Los cálculos del financiamiento SHALL correr sin red, sin base de datos y sin depender de la pantalla, y dar el mismo resultado cada vez que se corren con los mismos datos.

#### Scenario: Dos corridas
- **WHEN** se arma el resumen dos veces
- **THEN** los dos resultados son idénticos
