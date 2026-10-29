## ADDED Requirements

### Requirement: Adherir para participar en la gobernanza
Participating in any aspect of governance SHALL require having adhered to the manifesto of Lighthouse VRN. Participating means: voting on a decision of the Fogón, taking a decision to the council, distributing or saving credits in a consultation, and, when they exist, commenting, asking, raising, joining or backing concerns, blocking, standing aside or declaring oneself affected in a proposal. The rule MUST live in a single function over the browser membership; a person has adhered when the membership of `lighthouse` is "pedido" or "miembro". Every governance screen, including those added by later changes, MUST use that function instead of its own check.

#### Scenario: Una sola regla
- **WHEN** se buscan en el código las comprobaciones de adhesión de las pantallas del Fogón y de las consultas
- **THEN** todas usan la misma función de la regla

#### Scenario: Adhesión registrada
- **WHEN** la membresía de `lighthouse` es "pedido" o "miembro"
- **THEN** la regla permite participar

#### Scenario: Adhesión a una tribu sola
- **WHEN** la persona es miembro de Valle Solar pero no adhirió al manifiesto de Lighthouse VRN
- **THEN** la regla no permite participar

### Requirement: Sin adhesión se mira pero no se participa
Without adhesion a person SHALL still be able to see the Fogón, its decisions with their example votes, the consultations with their results and the holarchy, as their access level allows today. Where an action would be, the screen MUST show in text "Para participar, adherí al manifiesto de Lighthouse VRN" with a link to `/tribus/lighthouse/manifiesto` and a ⚖ in draft that explains the requirement, and MUST NOT show the action.

#### Scenario: Votar en el Fogón
- **WHEN** una persona de nivel Miembro que no adhirió mira una decisión abierta en `/fogon`
- **THEN** no ve "Votar" ni "Llevar al consejo", ve el aviso con el enlace al manifiesto y sigue viendo los votos de ejemplo

#### Scenario: Repartir créditos en una consulta
- **WHEN** esa persona abre una consulta abierta en `/fogon/consultas`
- **THEN** ve las opciones y los resultados, pero no los botones para sumar o quitar votos ni "Guardar", y ve el aviso con el enlace al manifiesto

#### Scenario: Después de adherir
- **WHEN** la persona adhiere al manifiesto de Lighthouse VRN y vuelve a `/fogon`
- **THEN** ve "Votar" en las decisiones donde su residencia y su pase se lo permiten

#### Scenario: La adhesión va antes que otros motivos
- **WHEN** una persona sin adhesión tampoco tiene el pase que pide una decisión
- **THEN** ve un solo motivo, el de la adhesión, con su enlace

### Requirement: Accesibilidad del aviso de adhesión
The adhesion notice SHALL be text (not only an icon or a color), reachable with the keyboard through its link, and MUST NOT move the focus by itself. While the browser membership is still being read, the screen MUST show neither the action nor the notice.

#### Scenario: Cargando
- **WHEN** la página todavía no leyó la membresía guardada
- **THEN** no muestra ni "Votar" ni el aviso de adhesión

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre `/fogon` sin adhesión
- **THEN** no hay violaciones serias ni críticas
