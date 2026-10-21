# Spec Delta

## Purpose

Que el equipo mueva los parámetros de la tokenomics del diseño legal B dentro del Fogón y vea cómo cambian los flujos al procomún, a los inversores y a NetX, antes de que esos valores se lleven a una consulta o decisión.

## ADDED Requirements

### Requirement: Acceso desde el Fogón
`/fogon/simulador` SHALL show the simulator, and `/fogon` SHALL link to it with a short text. The rail SHALL mark "Fogón" as active on this page.

#### Scenario: Desde el Fogón
- **WHEN** una persona abre `/fogon`
- **THEN** ve un enlace "Simular los parámetros de la tokenomics" que lleva a `/fogon/simulador`

### Requirement: Avisos
The page SHALL show "Prototipo interno · datos de ejemplo" and, before the controls, the notice "Prototipo interno · valores de partida, no son una oferta ni un pronóstico · el diseño legal no lo revisó un abogado". That notice MUST come from the single legal catalog and be marked as a draft.

#### Scenario: Ver los avisos
- **WHEN** una persona abre `/fogon/simulador`
- **THEN** ve los dos avisos arriba de los controles

### Requirement: Elegir el escenario
The page SHALL offer the two scenarios of the model, "Viñedo · 10 ha" and "Agrovoltaica · 5 MW", as a keyboard-usable choice; Viñedo SHALL be selected at first. Each scenario SHALL keep its own values while the page is open.

#### Scenario: Cambiar de escenario
- **WHEN** la persona elige "Agrovoltaica · 5 MW"
- **THEN** los controles muestran los valores de partida de la agrovoltaica (tope 10 %, comisión 1 %, meta de primera pérdida 5 %) y el resultado muestra la fila de Notas Verdes

### Requirement: Valores que se deciden
Under the heading "Valores que se deciden", the page SHALL show one control per decided value with a visible label, the current value with its unit, its starting value and the informative text "Quién decide (propuesta, a discutir): …" from issue #94. The residual split SHALL be shown as one control with both shares ("80 % procomún · 20 % Unidades").

#### Scenario: Regalía
- **WHEN** una persona mira la regalía de regeneración
- **THEN** ve "5 % de los ingresos brutos", "Valor de partida: 5 %" y "Quién decide (propuesta, a discutir): Consejo de la Fundación, con la Voz de la Tierra y consulta a residentes y miembros RAIZ"

#### Scenario: Comisión de NetX
- **WHEN** una persona mira la comisión de NetX
- **THEN** ve quién decide: "Asamblea de inversores de cada serie (es su costo)"

#### Scenario: Reparto del excedente
- **WHEN** la persona sube la parte de las Unidades a 30 %
- **THEN** el control dice "70 % procomún · 30 % Unidades"

### Requirement: Conversión del SAFU
The SAFU discount SHALL appear among the decided values with a control, its starting value (20 %) and who decides ("NetX + Fundación, una vez por emisión"), and the text that it does not change the series, only the SAFU conversion. The page SHALL show how many Units of the Mother Series USD 1.000 in SAFU convert into, as amount divided by one minus the discount, labeled as a platform calculation that is not in the model.

#### Scenario: Ver el SAFU
- **WHEN** una persona abre el simulador
- **THEN** ve "USD 1.000 en SAFU se convierten en USD 1.250 de Unidades de la Serie Madre (descuento 20 %)" y que es un cálculo de la plataforma

#### Scenario: Mover el descuento
- **WHEN** la persona sube el descuento del SAFU a 25 %
- **THEN** la frase dice "USD 1.333" y la tabla por clase no cambia

### Requirement: Datos que se miden
Under the heading "Datos que se miden (no se votan)", the page SHALL show one control per measured datum of the chosen scenario with label, value, unit, starting value and its source, so a person can try the possible cases. The vineyard shows yield at maturity and net wine price; the agrivoltaic plant shows cost per MW and energy price.

#### Scenario: Fuente de un dato
- **WHEN** una persona mira el precio del vino en el Viñedo
- **THEN** ve "USD 6 por botella (neto para la serie)", "Valor de partida: USD 6" y la fuente "Supuesto del modelo, a confirmar con un enólogo local"

### Requirement: Supuestos del modelo a confirmar
Inside the "no se votan" group, under "Supuestos del modelo · a confirmar con Vagner", the page SHALL show one control per adjustable assumption of the chosen scenario (exit multiple, Green Notes share and rate in the agrivoltaic plant, first-loss share, reserve and, in the vineyard, whether the ramp-up curve scales with yield), each with its starting value and the source "Supuesto del modelo, a confirmar con Vagner", and the resulting Units share as text.

#### Scenario: Supuestos de la agrovoltaica
- **WHEN** la persona elige la agrovoltaica
- **THEN** ve "Parte de Notas Verdes: 60 %", "Tasa de las Notas Verdes: 7 %", "Múltiplo de salida: 3 veces", "Unidades: el resto (30 %)" y "a confirmar con Vagner"

#### Scenario: Mover el múltiplo de salida
- **WHEN** la persona baja el múltiplo de salida del viñedo a 0
- **THEN** lo que reciben las Unidades baja y el año 15 deja de sumar una salida

### Requirement: Supuestos fijos visibles
The page SHALL list the fixed assumptions of the chosen scenario (hectares, horizon, physical investment, costs, Green Notes term and grace) without controls, with the source "NS_Tokenomics, doc 28 §7 y sim/series_waterfall_sim.py".

#### Scenario: Supuestos fijos de la agrovoltaica
- **WHEN** la persona elige la agrovoltaica y abre los supuestos fijos
- **THEN** ve "Notas Verdes a 12 años, 1 de gracia" y "20 años"

### Requirement: Vivienda sin dato
The page SHALL show the home entry premium and yearly ground rent as "sin dato", with who decides ("Asamblea de residentes + Consejo, después de la aprobación municipal"), never as 0.

#### Scenario: Vivienda
- **WHEN** una persona mira la vivienda
- **THEN** ve "Entrada: sin dato" y "Canon anual: sin dato" con quién lo decide

### Requirement: Controles accesibles
Every control SHALL be usable with the keyboard alone, have a visible label tied to it, expose its value with its unit as text (not only by position or color), and stay within its range. Moving a control SHALL update the result without leaving the page.

#### Scenario: Con teclado
- **WHEN** la persona llega con Tab al control de la regalía y aprieta la flecha hacia arriba
- **THEN** la regalía pasa a 5,5 % y el resultado cambia

### Requirement: Volver a los valores de partida
A button "Volver a los valores de partida" SHALL restore every control of the chosen scenario to its starting value and announce it to assistive technology.

#### Scenario: Volver
- **WHEN** la persona movió la regalía y el tope y aprieta "Volver a los valores de partida"
- **THEN** los controles vuelven a 5 % y 9 % y el resultado vuelve a los números de referencia

#### Scenario: Volver también los supuestos
- **WHEN** la persona movió el múltiplo de salida y el descuento del SAFU y aprieta "Volver a los valores de partida"
- **THEN** el múltiplo vuelve a 6 veces y el SAFU a 20 %

### Requirement: Resultado por clase
The page SHALL show a results table with one row per class (Procomún · Fundación, Unidades de Regeneración, Primera pérdida, Notas Verdes when the scenario has them, NetX) and the columns: puts in, receives, multiple and IRR. Amounts SHALL show "USD" and thousands separators. An IRR SHALL always show its value, even above 100 % a year; an IRR or multiple SHALL read "sin dato" only when it cannot be calculated, with a note explaining why.

#### Scenario: Resultado de partida del Viñedo
- **WHEN** una persona abre el simulador
- **THEN** ve el procomún con "USD 306.970", las Unidades con "USD 484.500", "USD 1.290.250", "2,66x" y "9,2 %", y NetX con "USD 128.250"

#### Scenario: Más regalía
- **WHEN** la persona sube la regalía a 10 %
- **THEN** en el año por año, lo que va a la Fundación (canon y regalía) sube en cada año con ventas, y la tabla por clase se recalcula sin recargar la página

#### Scenario: TIR sin dato
- **WHEN** la persona baja el rendimiento del viñedo a 0 t/ha
- **THEN** la TIR de las Unidades dice "sin dato" y debajo de la tabla se lee que la clase no recupera lo que puso

#### Scenario: TIR muy alta
- **WHEN** la persona lleva la agrovoltaica a costo por MW 400.000, energía USD 150 por MWh y 50 % del excedente para las Unidades
- **THEN** cada TIR de la tabla muestra un porcentaje, aunque pase el 100 %, y ninguna dice "sin dato"

### Requirement: Gráfico con tabla equivalente
The page SHALL show a chart of how the total paid by the series splits among the classes (theme tokens only, decorative drawing, numbered legend with text and percentage) with an equivalent table.

#### Scenario: Gráfico
- **WHEN** una persona abre el simulador
- **THEN** ve el gráfico con la leyenda numerada (Procomún, Unidades, Primera pérdida, NetX) y puede abrir "Ver como tabla" con los montos en USD

### Requirement: USD 1.000 en Unidades y año por año
The page SHALL show what USD 1.000 in Units returns (total and IRR) and, folded by default, the year-by-year table of the chosen scenario.

#### Scenario: Mil dólares
- **WHEN** una persona abre el simulador
- **THEN** ve "USD 1.000 en Unidades del viñedo devuelven USD 2.663 en 15 años (TIR 9,2 %)"

#### Scenario: Año por año
- **WHEN** la persona abre "Ver año por año"
- **THEN** ve una fila por año con ingresos, costos, a la Fundación, comisión de NetX, Notas, Unidades, primera pérdida y excedente al procomún

### Requirement: Términos con peso legal
The terms "Unidades de Regeneración", "Notas Verdes", "primera pérdida", "SAFU" and "serie" SHALL carry the ⚖ with a plain-language explanation from the single legal catalog, marked as draft.

#### Scenario: Explicación de primera pérdida
- **WHEN** la persona abre el ⚖ de "Primera pérdida"
- **THEN** lee una explicación en palabras simples marcada como borrador

### Requirement: Sin red ni guardado
The simulator SHALL run entirely in the browser with no network requests and no storage; reloading the page SHALL show the starting values again.

#### Scenario: Recargar
- **WHEN** la persona mueve la regalía y recarga la página
- **THEN** la regalía vuelve a 5 %
