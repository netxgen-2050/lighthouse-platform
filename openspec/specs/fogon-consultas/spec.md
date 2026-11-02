# fogon-consultas Specification

## Purpose
Consultas de prioridades y de presupuesto dentro del Fogón, con voto cuadrático: cada persona reparte sus créditos de voz, ve su propio reparto y, según la regla de cada consulta, el resultado del grupo y el acta. El resultado es consultivo.

## Requirements

### Requirement: Lista de consultas
`/fogon/consultas` SHALL list the consultations, each with its title, a "Prioridades" or "Presupuesto" label, its scope (Equipo, Tribu, Asamblea), its voting rule ("Voto abierto" or "Voto secreto"), its closing date, its state (Abierta, Cerrada) and whether the person already saved a reparto. `/fogon` SHALL link to this list.

#### Scenario: Ver la lista
- **WHEN** una persona abre `/fogon/consultas`
- **THEN** ve "¿Para qué optimiza el Lighthouse?" con "Prioridades", "Equipo", "Voto abierto", su fecha de cierre y "Abierta"

#### Scenario: Desde el Fogón
- **WHEN** una persona abre `/fogon`
- **THEN** ve un enlace a las consultas de prioridades y presupuesto

### Requirement: Consultas de ejemplo
The prototype SHALL include consultations U1 to U4 from the 15-oct-2026 note with their options: U1 "¿Para qué optimiza el Lighthouse?", U2 "¿Cuánta tierra silvestre en la fase 1?", U3 "Usos del cono de 120 ha (fase 1)" (priorities) and U4 "Primer presupuesto de regeneración" (budget), with an example roll of fictitious people (some of whom have not voted) and their example votes, labeled as example data. U4 SHALL carry the suggested amount USD 20.000 with the note "Sugerencia del equipo: lo decide Franz".

#### Scenario: Presupuesto de regeneración
- **WHEN** una persona abre U4
- **THEN** ve las opciones Estudio hidrológico, Obras de piedra a mano en el cauce, Vivero de nativas, Línea de base y monitoreo y Diseño de permacultura profesional, con la etiqueta "Presupuesto"

#### Scenario: Monto sugerido
- **WHEN** una persona abre U4
- **THEN** ve el monto "USD 20.000" junto a "Sugerencia del equipo: lo decide Franz"

### Requirement: Repartir votos
On an open consultation, "Mi reparto" SHALL show for each option buttons to remove and add one vote, the current votes and their cost in credits. Adding a vote the remaining credits cannot pay MUST be blocked with a text that says the cost of the next vote and the credits left.

#### Scenario: Sumar votos
- **WHEN** la persona aprieta "+" tres veces en "Regeneración ecológica"
- **THEN** ve "3 votos · 9 créditos" en esa opción

#### Scenario: No alcanzan los créditos
- **WHEN** a la persona le quedan 4 créditos y la opción ya tiene 2 votos (el tercero suma 5 créditos)
- **THEN** "+" no suma y la pantalla dice "No te alcanzan los créditos: el próximo voto en esta opción suma 5 y te quedan 4"

#### Scenario: Votos en contra
- **WHEN** la consulta no permite votos en contra y la opción tiene 0 votos
- **THEN** "−" no baja de 0

### Requirement: Medidor y donut propio
"Mi reparto" SHALL show a credit meter with the text "Te quedan X de 100 créditos" and a donut of the person's credits where each slice is an option with its label and percentage, and the unused credits are a slice labeled "Sin usar".

#### Scenario: Reparto a medias
- **WHEN** la persona usó 59 de sus 100 créditos
- **THEN** ve "Te quedan 41 de 100 créditos" y el donut tiene una porción "Sin usar · 41 %"

### Requirement: Mi reparto en plata
In budget mode, each option in "Mi reparto" SHALL show "Con tu reparto irían $X", computed with the same budget rules applied only to the person's votes. While the person has not started to distribute (no option has a vote other than 0), every option SHALL show "sin dato", because the vote has not started. Once the person has at least one vote (in favor or, if the consultation allows it, against) in any option and the amount is known, an option with 0 votes in favor SHALL show "USD 0" (in the consultation's currency). When the amount is unknown, every option SHALL always show "sin dato", never "USD 0". The same rule SHALL apply in English ("no data").

#### Scenario: Con monto
- **WHEN** en U4 (monto sugerido USD 20.000, sin topes) la persona pone 3 votos en Vivero de nativas y 1 en Estudio hidrológico
- **THEN** junto a Vivero de nativas ve "Con tu reparto irían USD 15.000", junto a Estudio hidrológico "USD 5.000" y las demás opciones "USD 0"

#### Scenario: Sin votos propios
- **WHEN** la persona todavía no puso ningún voto en U4 (monto conocido)
- **THEN** cada opción muestra "Con tu reparto irían: sin dato", y en ninguna dice "USD 0"

#### Scenario: Primer voto
- **WHEN** en U4 la persona, que no había votado, pone 1 voto en Vivero de nativas
- **THEN** Vivero de nativas muestra "Con tu reparto irían USD 20.000" y cada una de las demás opciones "Con tu reparto irían USD 0"

#### Scenario: Saca todos sus votos
- **WHEN** la persona pone 1 voto en Vivero de nativas de U4 y después lo quita
- **THEN** cada opción vuelve a mostrar "Con tu reparto irían: sin dato"

#### Scenario: Solo votos en contra
- **WHEN** en una consulta de presupuesto con monto conocido que admite votos en contra la persona pone solo votos en contra
- **THEN** cada opción muestra "Con tu reparto irían USD 0", porque la persona ya empezó a repartir

#### Scenario: Monto sin cargar
- **WHEN** una consulta de presupuesto no tiene el monto cargado, con o sin votos de la persona (por ejemplo, 3 votos en una opción)
- **THEN** cada opción, también la que tiene votos, muestra "Con tu reparto irían: sin dato", nunca "USD 0"

### Requirement: Guardar el reparto
The person SHALL save the reparto explicitly with "Guardar mi reparto"; unsaved changes SHALL be marked "Sin guardar". A saved reparto SHALL be kept after reloading and MAY be changed and saved again until the consultation closes; the last saved one counts. Saving SHALL be announced to screen readers.

#### Scenario: Guardar y recargar
- **WHEN** la persona guarda su reparto y recarga la página
- **THEN** ve el mismo reparto y la lista marca la consulta como "Ya repartiste"

#### Scenario: Cambiar antes del cierre
- **WHEN** la persona cambia su reparto y lo vuelve a guardar
- **THEN** el resultado del grupo cuenta solo el último

### Requirement: Cierre de la consulta
A consultation SHALL be closed when its closing date has passed or when it is closed by hand; a closed consultation MUST NOT accept repartos. In this browser-only version the person SHALL be able to simulate the close with "Simular el cierre", clearly marked as simulated.

#### Scenario: Consulta cerrada
- **WHEN** una consulta está cerrada
- **THEN** "Mi reparto" se ve solo para leer, sin botones "+" ni "−" ni "Guardar mi reparto"

### Requirement: Cuándo se ve el resultado
Each consultation SHALL define whether the group result is visible after the person saves a reparto or only at close; by default only at close. Before it is visible the screen SHALL say when it will be visible and how many people already took part, without showing any votes.

#### Scenario: Por defecto, al cierre
- **WHEN** la persona guardó su reparto en una consulta abierta con la regla por defecto
- **THEN** ve "El resultado del grupo se ve al cierre, el <fecha>" y cuántas personas ya repartieron, sin donut ni barras del grupo

#### Scenario: Visible al votar
- **WHEN** la consulta muestra el resultado al votar y la persona guarda su reparto
- **THEN** ve el resultado del grupo

### Requirement: Resultado del grupo
The group result SHALL show a donut of votes per option and, below it, bars ordered by votes with votes, percentage, people who supported each option, the amount in budget mode, and the person's own votes marked "Tu voto" on each row. Without votes it SHALL show "sin dato".

#### Scenario: Ver el resultado
- **WHEN** una consulta de prioridades está cerrada y la persona había repartido
- **THEN** cada fila muestra votos, %, "N personas la apoyaron" y "Tu voto: X"

#### Scenario: Presupuesto
- **WHEN** U4 está cerrada
- **THEN** cada fila muestra además el monto que le toca, y los fondos sin asignar si los hay

### Requirement: Voto abierto o voto secreto
Each consultation SHALL define whether its vote is open ("Voto abierto") or secret ("Voto secreto"); consultations with scope Equipo SHALL default to open. The rule SHALL be the same for everyone on the roll. On an open consultation, "Mi reparto" SHALL warn before voting "Tu reparto lo va a ver todo el padrón", with text and not only color. On a secret consultation it SHALL say that nobody sees another person's reparto, and the screen MUST NOT show anyone else's reparto or who is missing.

#### Scenario: Aviso antes de votar
- **WHEN** una persona abre una consulta abierta con voto abierto
- **THEN** ve "Tu reparto lo va a ver todo el padrón" antes de los botones "+" y "−", y el botón "Guardar mi reparto" está asociado a ese aviso

#### Scenario: Voto secreto
- **WHEN** una persona abre U3 (voto secreto) cerrada
- **THEN** ve el resultado del grupo y su propio reparto, pero ninguna tabla de repartos ni lista de quién falta

### Requirement: Quién repartió cómo
On an open-vote consultation, when the group result is visible, the screen SHALL show a table "Cómo repartió cada persona" with one row per person on the roll who saved a reparto (name, votes per option and credits used), marking the person's own row "Vos". Before the result is visible it MUST NOT show other people's repartos.

#### Scenario: Tabla al cierre
- **WHEN** U1 (voto abierto, resultado al cierre) se cierra
- **THEN** la persona ve una fila por cada persona que repartió, con sus votos por opción, y su propia fila marcada "Vos"

#### Scenario: Antes del cierre
- **WHEN** U1 está abierta y la persona ya guardó su reparto
- **THEN** no ve los repartos de las demás personas

### Requirement: Quién falta votar
On an open-vote consultation the screen SHALL list, at any time, the people on the roll who have not saved a reparto with at least one vote ("Faltan votar"), titled "No repartieron" once closed; when everyone voted it SHALL say "Ya repartió todo el padrón".

#### Scenario: Falta una persona
- **WHEN** una persona abre U1 abierta y la "Persona de ejemplo 6" no repartió
- **THEN** ve "Faltan votar" con "Persona de ejemplo 6" y, si todavía no guardó su reparto, también "Vos"

### Requirement: Acta
A closed consultation SHALL show an example record ("Acta, ejemplo") with the title, closing date, rule (quadratic voting, 100 credits per person), number of participants, the ordered result and the statement that the result is consultative and does not replace decisions reserved by the contract or the statute.

#### Scenario: Acta al cerrar
- **WHEN** la persona simula el cierre de U1
- **THEN** ve el acta con el orden de las opciones y la frase "El resultado es consultivo"

### Requirement: Donut accesible
Every donut SHALL be readable without color: each option slice SHALL carry a number that matches a legend entry with its label and percentage, the same data SHALL be available as a table, the colors SHALL come from theme tokens, and an empty donut SHALL say "sin dato". The number SHALL be drawn inside the slice only when the slice is 5 % or more; a smaller slice MAY have no number inside (it does not fit), but its number, label and percentage SHALL still appear in the legend and in the table.

#### Scenario: Sin color
- **WHEN** alguien ve el donut en escala de grises o con un lector de pantalla
- **THEN** puede saber qué opción es cada porción y su porcentaje por el número, la leyenda y la tabla

#### Scenario: Porción chica
- **WHEN** una opción ocupa menos del 5 % del donut
- **THEN** su porción no lleva número adentro, y la leyenda y la tabla la muestran con su número, su etiqueta y su porcentaje

### Requirement: Prototipo y accesibilidad
The consultation pages SHALL show the prototype notice, have a single h1 and a single `<main>` (from the layout), be fully usable with the keyboard, pass the axe audit, have no horizontal scroll at 390 px, and, in this version, never send the person's repartos to a server.

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre la lista y el detalle de una consulta (abierta y cerrada)
- **THEN** no hay violaciones serias ni críticas

#### Scenario: Celular
- **WHEN** la persona abre el detalle de U3 en una pantalla de 390 px
- **THEN** no hay scroll horizontal y los botones "−" y "+" se pueden tocar

### Requirement: Explicación de "consultivo"
The ⚖ next to "consultivo" (in the consultation list intro and in the act) SHALL show a plain-language explanation that is different from the visible phrase "El resultado es consultivo: no reemplaza las decisiones que reservan el contrato o el estatuto.", which stays unchanged. The explanation SHALL say, using voseo, that the result guides a decision but does not bind anyone, that whoever holds that power under the contract or the statute decides, and that voting costs no money and the consultation moves no funds by itself. Both texts SHALL live in the legal catalog under the `consultivo` key, each with an English version, and SHALL stay marked as draft. On an English page, the act SHALL show the English phrase and the ⚖ SHALL show the English explanation marked "Draft: text under review".

#### Scenario: Abrir el ⚖ del acta
- **WHEN** la persona abre el ⚖ junto a la frase consultiva del acta de U1
- **THEN** ve una explicación distinta de la frase, que dice que el resultado orienta pero no obliga, quién decide y que votar no cuesta plata, marcada como borrador

#### Scenario: La frase no cambia
- **WHEN** la persona simula el cierre de U1
- **THEN** el acta sigue diciendo "El resultado es consultivo: no reemplaza las decisiones que reservan el contrato o el estatuto."

#### Scenario: En inglés
- **WHEN** la persona, con la plataforma en inglés, simula el cierre de U1 y abre el ⚖ del acta
- **THEN** el acta dice "The result is advisory: it does not replace the decisions reserved by the contract or the statute.", sin texto en español, y el ⚖ muestra la explicación en inglés con "Draft: text under review"
