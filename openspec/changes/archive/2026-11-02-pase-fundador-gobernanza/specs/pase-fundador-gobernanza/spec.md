## ADDED Requirements

### Requirement: Nivel Fundador
The system SHALL treat a person with the Founder Pass (any tier) as the Fundador level: everything Miembro enables plus voting in Fideicomiso decisions, voice in the Common Fund (founders' chamber) and the founders' channel.

#### Scenario: Comprar el Pase
- **WHEN** una persona Miembro activa el Pase Brote en Sumarte (simulado)
- **THEN** queda con nivel Fundador y el Pasaporte muestra "Voto en el Fideicomiso" en lo que abre el sello

### Requirement: Voto en el Fideicomiso
In the Fogón, Fideicomiso decisions SHALL be votable only by the Fundador level; others MUST see the decisions and their results with the note "Votan quienes tienen el Pase Fundador" and a link to Sumarte.

#### Scenario: Miembro sin Pase
- **WHEN** una persona Miembro abre la pestaña Fideicomiso del Fogón
- **THEN** ve el presupuesto de obra del macrolote con su conteo y "Votan quienes tienen el Pase Fundador", sin botón de votar

#### Scenario: Fundador vota
- **WHEN** una persona Fundadora vota a favor en una decisión del Fideicomiso
- **THEN** su voto queda registrado (simulado) y el conteo se actualiza

### Requirement: Texto en Sumarte y ⚖
The Founder Pass card SHALL say it gives voice in Fideicomiso and Common Fund decisions, with the draft ⚖ `gobernanzafideicomiso`.

#### Scenario: Tarjeta
- **WHEN** una persona mira el Pase Fundador en `/sumarte`
- **THEN** lee que da voz en las decisiones del fideicomiso y del Fondo Común, con su ⚖
