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

### Requirement: Descuento del SAFU informativo
The SAFU discount SHALL appear among the decided values with its value (20 %) and who decides ("NetX + Fundación, una vez por emisión"), without a control, and with the text that the series model does not use it: it applies when the SAFU converts into Units of the Mother Series.

#### Scenario: Ver el SAFU
- **WHEN** una persona mira el descuento del SAFU
- **THEN** ve "20 %", quién decide y que este modelo no lo usa, y no hay control para moverlo

### Requirement: Datos que se miden
Under the heading "Datos que se miden (no se votan)", the page SHALL show one control per measured datum of the chosen scenario with label, value, unit, starting value and its source. The vineyard shows yield at maturity and net wine price; the agrivoltaic plant shows cost per MW and energy price.

#### Scenario: Fuente de un dato
- **WHEN** una persona mira el precio del vino en el Viñedo
- **THEN** ve "USD 6 por botella (neto para la serie)" y la fuente "Supuesto del modelo, a confirmar con un enólogo local"

### Requirement: Supuestos fijos visibles
The page SHALL list the fixed model assumptions of the chosen scenario (hectares, horizon, capital structure, Green Notes rate and terms, reserve, exit multiple, costs) without controls, with the source "NS_Tokenomics, doc 28 §7 y sim/series_waterfall_sim.py".

#### Scenario: Supuestos de la agrovoltaica
- **WHEN** la persona elige la agrovoltaica y abre los supuestos
- **THEN** ve "60 % Notas Verdes al 7 %, 12 años, 1 de gracia" y "Múltiplo de salida: 3 veces"

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

### Requirement: Resultado por clase
The page SHALL show a results table with one row per class (Procomún · Fundación, Unidades de Regeneración, Primera pérdida, Notas Verdes when the scenario has them, NetX) and the columns: puts in, receives, multiple and IRR. Amounts SHALL show "USD" and thousands separators; a missing IRR or multiple SHALL read "sin dato".

#### Scenario: Resultado de partida del Viñedo
- **WHEN** una persona abre el simulador
- **THEN** ve el procomún con "USD 306.970", las Unidades con "USD 484.500", "USD 1.290.250", "2,66x" y "9,2 %", y NetX con "USD 128.250"

#### Scenario: Más regalía
- **WHEN** la persona sube la regalía a 10 %
- **THEN** en el año por año, lo que va a la Fundación (canon y regalía) sube en cada año con ventas, y la tabla por clase se recalcula sin recargar la página

#### Scenario: TIR sin dato
- **WHEN** la persona baja el rendimiento del viñedo a 0 t/ha
- **THEN** la TIR de las Unidades dice "sin dato"

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
