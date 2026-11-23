## MODIFIED Requirements

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

## ADDED Requirements

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
