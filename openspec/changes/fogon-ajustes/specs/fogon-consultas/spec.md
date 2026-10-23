## MODIFIED Requirements

### Requirement: Mi reparto en plata
In budget mode, each option in "Mi reparto" SHALL show "Con tu reparto irían $X", computed with the same budget rules applied only to the person's votes. When the amount is known, an option where the person has 0 votes SHALL show "USD 0" (in the consultation's currency), also when the person has not placed any vote yet; it SHALL show "sin dato" only when the amount is unknown.

#### Scenario: Con monto
- **WHEN** en U4 (monto sugerido USD 20.000, sin topes) la persona pone 3 votos en Vivero de nativas y 1 en Estudio hidrológico
- **THEN** junto a Vivero de nativas ve "Con tu reparto irían USD 15.000", junto a Estudio hidrológico "USD 5.000" y las demás opciones "USD 0"

#### Scenario: Sin votos propios
- **WHEN** la persona todavía no puso ningún voto en U4 (monto conocido)
- **THEN** cada opción muestra "Con tu reparto irían USD 0", y en ninguna dice "sin dato"

#### Scenario: Monto sin cargar
- **WHEN** una consulta de presupuesto no tiene el monto cargado y la persona pone 3 votos en una opción
- **THEN** cada opción, también la que tiene votos, muestra "Con tu reparto irían: sin dato", nunca "USD 0"

### Requirement: Donut accesible
Every donut SHALL be readable without color: each option slice SHALL carry a number that matches a legend entry with its label and percentage, the same data SHALL be available as a table, the colors SHALL come from theme tokens, and an empty donut SHALL say "sin dato". The number SHALL be drawn inside the slice only when the slice is 5 % or more; a smaller slice MAY have no number inside (it does not fit), but its number, label and percentage SHALL still appear in the legend and in the table.

#### Scenario: Sin color
- **WHEN** alguien ve el donut en escala de grises o con un lector de pantalla
- **THEN** puede saber qué opción es cada porción y su porcentaje por el número, la leyenda y la tabla

#### Scenario: Porción chica
- **WHEN** una opción ocupa menos del 5 % del donut
- **THEN** su porción no lleva número adentro, y la leyenda y la tabla la muestran con su número, su etiqueta y su porcentaje

## ADDED Requirements

### Requirement: Explicación de "consultivo"
The ⚖ next to "consultivo" (in the consultation list and in the act) SHALL show a plain-language explanation that is different from the visible phrase "El resultado es consultivo: no reemplaza las decisiones que reservan el contrato o el estatuto.", which stays unchanged. The explanation SHALL say, using voseo, that the result guides a decision but does not bind anyone, that whoever holds that power under the contract or the statute decides, and that voting costs no money and the consultation moves no funds by itself. Both texts SHALL live in the legal catalog under the `consultivo` key and SHALL stay marked as draft.

#### Scenario: Abrir el ⚖ del acta
- **WHEN** la persona abre el ⚖ junto a la frase consultiva del acta de U1
- **THEN** ve una explicación distinta de la frase, que dice que el resultado orienta pero no obliga, quién decide y que votar no cuesta plata, marcada como borrador

#### Scenario: La frase no cambia
- **WHEN** la persona simula el cierre de U1
- **THEN** el acta sigue diciendo "El resultado es consultivo: no reemplaza las decisiones que reservan el contrato o el estatuto."
