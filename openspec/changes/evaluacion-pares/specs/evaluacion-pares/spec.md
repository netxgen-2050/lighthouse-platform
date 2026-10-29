# Spec Delta

## Purpose

Calcular el factor de evaluación entre pares (`f_eval`, entre 0,8 y 1,2) de cada persona al cerrar una ronda de un pacto o círculo, con las defensas contra la colusión que adoptó Gus el 23-oct-2026, y mostrar el resultado agregado y las constancias base y de ajuste de las Semillas.

## ADDED Requirements

### Requirement: Escala y fórmula del factor
The system SHALL compute `f_eval = 1 + fuerza × (nota_combinada − 3) / 2`, where `nota_combinada` is the weighted average of the aggregated scores of the two dimensions (role fulfilment and contribution to the group culture, 50/50 by default) and `fuerza` is the community's adjustment strength between 0 and 0.2, fixed when the round opens. The result MUST stay within 0.8–1.2 and be rounded to two decimals, half up.

#### Scenario: Rol y cultura pesan igual
- **WHEN** "Rol" da 3 y "Aporte al grupo" da 5, con los parámetros de partida
- **THEN** la nota combinada es 4

#### Scenario: Tres estrellas es neutro
- **WHEN** la nota combinada es 3 y la fuerza es 0,2
- **THEN** `f_eval` es 1,00

#### Scenario: Extremos con la fuerza máxima
- **WHEN** la nota combinada es 5 (o 1) y la fuerza es 0,2
- **THEN** `f_eval` es 1,20 (o 0,80)

#### Scenario: Fuerza cero
- **WHEN** la comunidad elige fuerza 0
- **THEN** `f_eval` es 1,00 para cualquier nota

#### Scenario: Fuerza fuera de rango
- **WHEN** se pide una fuerza menor que 0 o mayor que 0,2
- **THEN** se usa el límite más cercano (0 o 0,2)

#### Scenario: Redondeo sin error de coma flotante
- **WHEN** la nota combinada es 3,5 y la fuerza es 0,1 (1,025 exacto)
- **THEN** `f_eval` es 1,03

### Requirement: Sin autoevaluación
An evaluation whose rater and rated person are the same MUST NOT count.

#### Scenario: Alguien se puntúa a sí mismo
- **WHEN** una persona se pone 5 en las dos dimensiones
- **THEN** esa evaluación se descarta y se cuenta como "autoevaluación" en los descartes

### Requirement: Solo evalúa el equipo de la ronda
Only evaluations where both rater and rated person belong to the round team (people who worked together in the same pact or circle in that period) SHALL count.

#### Scenario: Alguien de afuera
- **WHEN** una persona que no está en el equipo de la ronda evalúa a alguien del equipo
- **THEN** esa evaluación se descarta y se cuenta como "fuera del equipo"

### Requirement: Motivo obligatorio
An evaluation without a written reason (empty or only spaces) or with a score that is not an integer from 1 to 5 MUST NOT count. The rating screen SHALL NOT send a round with missing scores or reasons.

#### Scenario: Puntaje sin motivo
- **WHEN** una evaluación trae nota 4 y motivo vacío
- **THEN** se descarta y se cuenta como "sin motivo"

### Requirement: Mínimo de evaluadores
A dimension with fewer than 3 valid raters (after every discard) SHALL count as 3 (neutral). If neither dimension reaches 3 raters, `f_eval` MUST be exactly 1.0 and the result SHALL say why.

#### Scenario: Dos evaluadores
- **WHEN** solo dos personas del equipo evaluaron a alguien, ambas con 5
- **THEN** `f_eval` es 1,00 y el resultado dice "menos de 3 evaluaciones: el factor queda en 1,0"

#### Scenario: El descuento deja menos de 3
- **WHEN** había 3 evaluadores en "Rol" y uno se descuenta (por ejemplo, por no tener motivo)
- **THEN** "Rol" cuenta como 3 (neutro)

### Requirement: Agregado robusto
Each dimension SHALL be aggregated with the median (default) or a trimmed mean that drops at least one score from each end (20 % per side, rounded down, minimum 1); never the plain mean.

#### Scenario: Un valor extremo no arrastra la mediana
- **WHEN** las notas de "Rol" son 3, 3, 4 y 5
- **THEN** la nota agregada con mediana es 3,5

#### Scenario: Media recortada
- **WHEN** el agregado es media recortada y las notas son 1, 4, 4, 4 y 5
- **THEN** se descartan la nota más baja y la más alta y la nota agregada es 4

### Requirement: Descuento de parejas recíprocas
The reciprocity defense SHALL be implemented and tested but MUST be off by default (`reciprocidadActiva: false`), because the starting point assumes everyone is honest; a community or the K11 simulation turns it on. When it is on, if A rated B and B rated A in the same round, A's score of B in a dimension MUST NOT count when it differs from the median of the other raters of B in that dimension by the reciprocity threshold or more (1.5 stars by default). The median of the others uses the evaluations still valid after self-rating, team and reason checks.

#### Scenario: Apagada por defecto
- **WHEN** Ana y Beto se evalúan entre sí, Ana le pone 5 a Beto en "Rol", la mediana de los otros tres es 3 y se usan los parámetros de partida
- **THEN** la nota de Ana no se descarta (no suma ningún descarte "reciprocidad") y el tope por evaluador la acota a 4

#### Scenario: Pareja que se infla, con la defensa activa
- **WHEN** la reciprocidad está activa, Ana y Beto se evalúan entre sí, Ana le pone 5 a Beto en "Rol" y la mediana de los otros tres evaluadores de Beto en "Rol" es 3
- **THEN** la nota de Ana no cuenta y se suma un descarte "reciprocidad"

#### Scenario: Pareja que coincide con el resto
- **WHEN** la reciprocidad está activa, Ana y Beto se evalúan entre sí y Ana le pone a Beto 4 con una mediana del resto de 4
- **THEN** la nota de Ana cuenta

#### Scenario: Sin reciprocidad no hay descuento
- **WHEN** la reciprocidad está activa y Ana le pone 5 a Beto con una mediana del resto de 3, pero Beto no evaluó a Ana
- **THEN** la nota de Ana no se descarta por reciprocidad (sí la limita el tope por evaluador)

#### Scenario: Anillo de colusión chico en un equipo honesto
- **WHEN** en un equipo de 6 personas, Ana y Beto se ponen 5 y 5 entre sí y los otros cuatro les ponen 3, con la reciprocidad apagada o activa
- **THEN** ni Ana ni Beto obtienen un `f_eval` distinto de 1,00 con fuerza 0,2 (la mediana y el tope alcanzan)

### Requirement: Tope por evaluador
Before aggregating, each counted score SHALL be clamped to the median of the other counted raters of that person and dimension, plus or minus the per-rater cap (1 star by default), so that no single rater can move a person's aggregated score by more than the cap.

#### Scenario: Una nota muy alta se acota
- **WHEN** los demás evaluadores le ponen 3, 3 y 3 y un cuarto le pone 5 sin reciprocidad
- **THEN** esa nota cuenta como 4

#### Scenario: Influencia acotada
- **WHEN** se reemplaza la nota de cualquier evaluador por la mediana de los demás
- **THEN** la nota agregada de esa dimensión cambia como mucho en el tope (1 estrella)

#### Scenario: Equipo dividido
- **WHEN** las notas de "Rol" son 1, 1, 5 y 5
- **THEN** cada 1 cuenta como 4, cada 5 cuenta como 2 y la nota agregada es 3 (neutro)

### Requirement: Resultado solo agregado
The result for a person SHALL contain only aggregated data: `f_eval`, aggregated score per dimension, number of raters counted per dimension, number of discarded scores (one per dimension) per reason and whether a feedback summary is available. It MUST NOT contain rater ids, names or the written reasons. A feedback summary SHALL be available only when at least 3 raters counted in each dimension.

#### Scenario: Sin nombres ni motivos
- **WHEN** se calcula el resultado de una persona
- **THEN** el resultado no contiene el id ni el nombre de ningún evaluador ni el texto de ningún motivo

#### Scenario: Pocos evaluadores, sin resumen
- **WHEN** contaron menos de 3 evaluadores en alguna dimensión
- **THEN** no hay resumen del feedback disponible

### Requirement: Resumen del feedback en vez de motivos crudos
Written reasons MUST NOT be shown verbatim to the rated person. The person SHALL see a single summary of the feedback of all raters, produced by an AI in the real version. In the prototype the summary SHALL be a fixed example text in Spanish and English, visibly marked as simulated; no AI model is called.

#### Scenario: Ver el resumen de ejemplo
- **WHEN** la persona envió la ronda de ejemplo y contaron 3 evaluadores o más en cada dimensión
- **THEN** ve un resumen del feedback marcado como "Resumen de ejemplo (simulado)" y no ve el texto de ningún motivo de ejemplo

### Requirement: Cómo te reconocieron sin nombres
The "Cómo te reconocieron" section of `/semillas` SHALL show the aggregated result of the example round and the feedback summary, and MUST NOT show who gave each score nor the raw reasons. This replaces the example with names of the `semillas-v2` change.

#### Scenario: Ver lo recibido
- **WHEN** la persona tiene un pacto aceptado y abre "Cómo te reconocieron"
- **THEN** ve notas agregadas y el resumen del feedback, y no ve "De Martina", ningún otro nombre de evaluador ni los motivos crudos

### Requirement: Parámetros de partida en un solo lugar
The defaults (median, reciprocity off with threshold 1.5, per-rater cap 1, minimum 3 raters, 50/50 weight, strength 0.2) SHALL live in a single place and be overridable per call, because they will be calibrated later by simulation.

#### Scenario: Cambiar el mínimo
- **WHEN** se calcula con mínimo de evaluadores 4 y hay 3
- **THEN** `f_eval` es 1,00

### Requirement: Guía por nivel de estrellas
When rating, the person SHALL see a written guide for the chosen star level (1 to 5) of each dimension, in Spanish and English.

#### Scenario: Elegir 3 en Rol
- **WHEN** la persona elige 3 en "Rol"
- **THEN** ve la guía del nivel 3 de "Rol" (cumple lo acordado) asociada al grupo de botones

#### Scenario: Antes de elegir
- **WHEN** todavía no eligió nivel
- **THEN** puede ver la guía de los cinco niveles sin elegir ninguno

### Requirement: Resultado de la ronda de ejemplo
After sending the round on `/semillas`, the person SHALL see "Tu resultado de esta ronda (ejemplo)" with aggregated scores, `f_eval`, counted raters and discards by reason, computed with the example team and the scores the person just sent. Before sending, it SHALL say the factor is computed when the round closes, never 0.

#### Scenario: Ronda de ejemplo enviada
- **WHEN** la persona envía la ronda puntuando a Martina y Joaquín, con fuerza 0,2 y los parámetros de partida
- **THEN** ve `f_eval` 1,08, "Rol" 3,5 (4 evaluadores), "Aporte al grupo" 4 (4 evaluadores), dos notas descartadas "fuera del equipo" y ninguna "reciprocidad"

#### Scenario: Ronda abierta
- **WHEN** la persona todavía no envió la ronda
- **THEN** ve que el ajuste se calcula al cerrar la ronda, sin un número

### Requirement: Fuerza elegida por la comunidad
`/semillas` SHALL offer a simulated "Fuerza del ajuste de esta comunidad" choice (0, 0.05, 0.1, 0.15, 0.2; default 0.2) that shows, without saving, what `f_eval` would have been with another strength, and SHALL say that in a real community the community decides it and it stays fixed from the moment the round opens (a change applies from the next round).

#### Scenario: Bajar la fuerza
- **WHEN** la persona con la ronda de ejemplo enviada elige fuerza 0,1
- **THEN** `f_eval` pasa a 1,04 y el rango posible que se muestra es 0,90–1,10

#### Scenario: La fuerza real no se toca con la ronda abierta
- **WHEN** la persona mira el selector
- **THEN** lee que en una comunidad real la fuerza queda fija al abrir la ronda y que un cambio vale desde la ronda siguiente

### Requirement: Constancias base y de ajuste
After the round closes, the system SHALL build a base attestation (pact, confirmed hours, `HOUR_REF_USD`, period, pact version and base Semillas, frozen) and an adjustment attestation that points to the base and carries `f_eval` and the adjusted Semillas, both with the EAS-like shape of ADR-012 and asserted by NetX, never by a person.

#### Scenario: Ajuste apunta a la base
- **WHEN** la ronda de ejemplo cierra con un pacto de 10 h al mes y `f_eval` 1,08
- **THEN** la constancia base tiene 50 Semillas y la de ajuste apunta a su id, con factor 1,08 y 54 Semillas

#### Scenario: Otra fuerza simulada no cambia la base
- **WHEN** la persona simula otra fuerza con la ronda cerrada
- **THEN** la constancia base no cambia y la de ajuste que se muestra es otra (otro id) que apunta a la misma base

#### Scenario: Sin pacto, sin constancias
- **WHEN** la persona no tiene un pacto aceptado en la comunidad
- **THEN** no ve constancias y ve "sin dato"

### Requirement: El ajuste solo alcanza a Semillas recibidas
The peer-evaluation adjustment SHALL apply only to Semillas that were received. "Semillas pendientes" of a variable-hours pact MUST NOT be adjusted nor added to any total while they are pending. Months confirmed after the minimum commitment is met are received when confirmed (Gus, 28-oct), so they can be adjusted from then on. If a person moves from variable to fixed hours with Semillas pendientes, those are received only if the circle validates them and otherwise are lost (Gus, 28-oct); lost Semillas MUST NOT get an attestation nor an adjustment. In this prototype the constancias block covers one month of a fixed-hours pact; with a variable pact it SHALL say "sin dato". Adjusting variable-hours months is left open (see design, Open Questions).

#### Scenario: Pacto de horas variables
- **WHEN** la persona tiene un pacto de horas variables aceptado
- **THEN** el bloque de constancias dice "sin dato" y las Semillas pendientes no se ajustan ni suman

### Requirement: Límites de las tareas no se tocan
A per-person maximum and a total maximum of a task (hours or Semillas adding up all people, set by whoever administers the holon, Gus 28-oct) belong to tasks (`pacto-puntual` and `pacto-puntual-verificacion`). A puntual pact MUST NOT enable the round nor the adjustment, so this change MUST NOT apply or change those maximums. If the adjustment is later extended to tasks (D20), the adjusted Semillas MUST NOT exceed either maximum.

#### Scenario: Pacto puntual
- **WHEN** la persona solo tiene un pacto puntual con máximo total
- **THEN** no ve la ronda ni el ajuste, y el máximo total no cambia

### Requirement: Rondas de círculos transversales facilitadas por Hifa
Transversal circles are administered and facilitated by Hifa (the AI). In the prototype this SHALL be simulated and marked as experimental, and as a human fallback the super admin SHALL be able to respond if Hifa is not available. The final decision depends on testing that it is stable and reliable. The example round of this change belongs to a pact, not to a transversal circle, so the screen does not show this notice yet.

#### Scenario: Ronda de ejemplo
- **WHEN** la persona abre la ronda de ejemplo de un pacto
- **THEN** no ve ningún aviso de Hifa

### Requirement: Nombres de las Semillas
Texts of this change MUST use "Semillas pendientes" and "Semillas"; they MUST NOT use "brotes" nor "germinar" for them.

#### Scenario: Textos del bloque
- **WHEN** la persona ve la ronda y las constancias
- **THEN** ningún texto dice "brotes" ni "germinar"

### Requirement: Términos legales en borrador
The screen SHALL explain peer evaluation and Semillas attestations with ⚖ terms from the single legal catalog, marked as draft, in Spanish and English.

#### Scenario: Términos nuevos
- **WHEN** la persona abre el ⚖ de "Evaluación entre pares" o de "Constancia de Semillas"
- **THEN** ve la explicación en palabras simples y el término figura como borrador en el catálogo
