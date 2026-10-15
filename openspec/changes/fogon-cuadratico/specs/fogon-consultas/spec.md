# Spec Delta

## Purpose

Consultas de prioridades y de presupuesto dentro del Fogón, con voto cuadrático: cada persona reparte sus créditos de voz, ve su propio reparto y, según la regla de cada consulta, el resultado del grupo y el acta. El resultado es consultivo.

## ADDED Requirements

### Requirement: Lista de consultas
`/fogon/consultas` SHALL list the consultations, each with its title, a "Prioridades" or "Presupuesto" label, its scope (Equipo, Tribu, Asamblea), its closing date, its state (Abierta, Cerrada) and whether the person already saved a reparto. `/fogon` SHALL link to this list.

#### Scenario: Ver la lista
- **WHEN** una persona abre `/fogon/consultas`
- **THEN** ve "¿Para qué optimiza el Lighthouse?" con "Prioridades", "Equipo", su fecha de cierre y "Abierta"

#### Scenario: Desde el Fogón
- **WHEN** una persona abre `/fogon`
- **THEN** ve un enlace a las consultas de prioridades y presupuesto

### Requirement: Consultas de ejemplo
The prototype SHALL include consultations U1 to U4 from the 15-oct-2026 note with their options: U1 "¿Para qué optimiza el Lighthouse?", U2 "¿Cuánta tierra silvestre en la fase 1?", U3 "Usos del cono de 120 ha (fase 1)" (priorities) and U4 "Primer presupuesto de regeneración" (budget), with example votes from fictitious people, labeled as example data.

#### Scenario: Presupuesto de regeneración
- **WHEN** una persona abre U4
- **THEN** ve las opciones Estudio hidrológico, Obras de piedra a mano en el cauce, Vivero de nativas, Línea de base y monitoreo y Diseño de permacultura profesional, con la etiqueta "Presupuesto"

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
In budget mode, each option in "Mi reparto" SHALL show "Con tu reparto irían $X", computed with the same budget rules applied only to the person's votes; if the amount is unknown it SHALL show "sin dato".

#### Scenario: Con monto
- **WHEN** en U4 (monto de ejemplo USD 50.000, sin topes) la persona pone 3 votos en Vivero de nativas y 1 en Estudio hidrológico
- **THEN** junto a Vivero de nativas ve "Con tu reparto irían USD 37.500", junto a Estudio hidrológico "USD 12.500" y las demás opciones "USD 0"

#### Scenario: Sin votos propios
- **WHEN** la persona todavía no puso ningún voto en U4
- **THEN** cada opción muestra "Con tu reparto irían: sin dato"

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

### Requirement: Acta
A closed consultation SHALL show an example record ("Acta, ejemplo") with the title, closing date, rule (quadratic voting, 100 credits per person), number of participants, the ordered result and the statement that the result is consultative and does not replace decisions reserved by the contract or the statute.

#### Scenario: Acta al cerrar
- **WHEN** la persona simula el cierre de U1
- **THEN** ve el acta con el orden de las opciones y la frase "El resultado es consultivo"

### Requirement: Donut accesible
Every donut SHALL be readable without color: each slice SHALL carry a number that matches a legend entry with its label and percentage, the same data SHALL be available as a table, the colors SHALL come from theme tokens, and an empty donut SHALL say "sin dato".

#### Scenario: Sin color
- **WHEN** alguien ve el donut en escala de grises o con un lector de pantalla
- **THEN** puede saber qué opción es cada porción y su porcentaje por el número, la leyenda y la tabla

### Requirement: Prototipo y accesibilidad
The consultation pages SHALL show the prototype notice, have a single h1 and a single `<main>` (from the layout), be fully usable with the keyboard, pass the axe audit, have no horizontal scroll at 390 px, and, in this version, never send the person's repartos to a server.

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre la lista y el detalle de una consulta (abierta y cerrada)
- **THEN** no hay violaciones serias ni críticas

#### Scenario: Celular
- **WHEN** la persona abre el detalle de U3 en una pantalla de 390 px
- **THEN** no hay scroll horizontal y los botones "−" y "+" se pueden tocar
