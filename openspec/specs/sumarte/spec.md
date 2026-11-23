# sumarte Specification

## Purpose
TBD - created by archiving change sumarte-planes. Update Purpose after archive.

## Requirements

### Requirement: Planes para usuarios
The system SHALL show at `/sumarte` the title "Elegí cómo sumarte" and four plans from mock-up v6: Explorador (free), Miembro de la red, Pase Fundador (levels Semilla USD 300, Brote USD 1.500, Raíz USD 5.000) and Plan Tribu, plus the comparison table "Qué incluye cada plan". The Mensual/Anual selector MUST apply to every plan with a periodic price (Miembro de la red and Plan Tribu): with "Mensual" every periodic plan MUST show its monthly price with "/mes" (Miembro USD 10/mes, Plan Tribu USD 60/mes), and with "Anual" every periodic plan MUST show its yearly price with "/año" (Miembro USD 100/año, Plan Tribu USD 600/año). No periodic plan SHALL show a monthly price while "Anual" is selected, nor a yearly price while "Mensual" is selected.

#### Scenario: Cambiar a anual
- **WHEN** una persona elige "Anual"
- **THEN** el botón "Anual" queda marcado (`aria-pressed="true"`)
- **AND** Miembro muestra "USD 100/año" y Plan Tribu muestra "USD 600/año"
- **AND** ningún plan periódico muestra "/mes"

#### Scenario: Cambiar a mensual
- **WHEN** una persona elige "Mensual"
- **THEN** Miembro muestra "USD 10/mes" y Plan Tribu muestra "USD 60/mes"
- **AND** ningún plan periódico muestra "/año"

#### Scenario: Moneda en pesos
- **WHEN** la preferencia de moneda es ARS y está elegido "Anual"
- **THEN** los precios anuales de Miembro y Plan Tribu se muestran convertidos con el mismo tipo de cambio que el resto de la página, y siguen diciendo "/año"

#### Scenario: Elegir nivel del Pase
- **WHEN** una persona elige "Raíz" en el selector del Pase Fundador
- **THEN** el precio muestra "USD 5.000" con "pago único · de por vida" y los créditos "USD 1.500"

### Requirement: Cohorte del Pase Fundador
The system SHALL show for the founder pass two meters from mock-up data: "Pases de la cohorte" (142 of 300) and "Mínimo para abrir el Fondo Común" (USD 46.000 of USD 75.000), each with its numbers written in text, not only as a bar.

#### Scenario: Medidores legibles
- **WHEN** una persona abre `/sumarte`
- **THEN** lee "142 de 300" y los montos del Fondo Común en texto

### Requirement: Acceso para inversores
The system SHALL show a section "Para inversores" with "Sumarte al proyecto del Lote 7" (by invitation, with the circle's seat meters and a "Pedir invitación" button) and "Invertir en NetX como empresa" (with "Pedir una charla").

#### Scenario: Pedir invitación
- **WHEN** una persona aprieta "Pedir invitación"
- **THEN** ve "Invitación pedida (simulado)" y el medidor de lugares suma uno

### Requirement: Todo simulado
The system SHALL never charge or send data: choosing a plan, a pass or asking for an invitation MUST be stored only in the browser and labelled "(simulado)", and the page MUST show the prototype notice.

#### Scenario: Activar el pase
- **WHEN** una persona aprieta "Quiero el Pase Brote"
- **THEN** ve "Pase Brote activo (simulado)" y no se hizo ningún pedido de red con esos datos
- **AND** al recargar sigue activo, y hay una forma de deshacerlo ("Volver a Explorador")

### Requirement: Ahorro anual visible por plan
The system SHALL show, while "Anual" is selected, the text "2 meses gratis" next to the price of each periodic plan (Miembro de la red and Plan Tribu), in text (not only with color or an icon). While "Mensual" is selected, the per-plan text SHALL NOT be shown; the "Anual" button MAY keep its own "2 meses gratis" label.

#### Scenario: Ahorro en anual
- **WHEN** una persona elige "Anual"
- **THEN** la tarjeta de Miembro y la del Plan Tribu dicen "2 meses gratis" junto al precio

#### Scenario: Sin ahorro en mensual
- **WHEN** una persona elige "Mensual"
- **THEN** ninguna tarjeta de plan dice "2 meses gratis" junto al precio

### Requirement: Pase Fundador como pago único de por vida
The system SHALL present the Pase Fundador price with the text "pago único · de por vida", readable at the same size as the body text of the card (not as small secondary text), and this text MUST NOT change with the Mensual/Anual selector.

#### Scenario: El pase no cambia con el selector
- **WHEN** una persona alterna entre "Mensual" y "Anual"
- **THEN** el precio del Pase Fundador y el texto "pago único · de por vida" quedan iguales

#### Scenario: Legible
- **WHEN** una persona abre `/sumarte`
- **THEN** "pago único · de por vida" se lee junto al precio del pase, con el tamaño del texto de la tarjeta
