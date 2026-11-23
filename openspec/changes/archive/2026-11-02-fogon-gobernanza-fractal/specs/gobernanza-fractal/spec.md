## Purpose

Mostrar y simular la gobernanza holocrática y fractal del Lighthouse: círculos dentro de cada tribu, las tribus, Lighthouse como el común y un consejo con un representante por tribu, con quién valida a quién y qué sube al consejo.

## ADDED Requirements

### Requirement: Estructura de gobernanza visible
The system SHALL show at `/fogon/gobernanza` the governance structure: Lighthouse (el común) at the center, the 12 tribes of the territory with their state, the example circles of each active or forming tribe, and the council with one seat per tribe validated by the común.

#### Scenario: Ver la estructura
- **WHEN** una persona abre `/fogon/gobernanza`
- **THEN** ve Lighthouse (el común), las 12 tribus con su estado, los círculos de Valle Solar y el consejo con un lugar por cada tribu validada

#### Scenario: Tribu que busca tribu
- **WHEN** la persona mira "Barrio 3" en la estructura
- **THEN** la ve como "Busca tribu", sin círculos y sin lugar en el consejo

### Requirement: Círculos transversales
A circle SHALL be able to belong to a single tribe or be transversal: spanning several tribes, or not tied to any area of the territory. A transversal circle MUST hang from the común in the structure and MUST show which tribes take part in it (amendment of 2026-10-23).

#### Scenario: Círculo de dos tribus
- **WHEN** una persona mira el círculo transversal de ejemplo en `/fogon/gobernanza`
- **THEN** lo ve colgando del común, con el texto "Participan: Valle Solar y Taller Común"

#### Scenario: Círculo sin zona
- **WHEN** una persona abre la ficha de un círculo transversal
- **THEN** la ficha no le asigna una zona del territorio y no muestra 0 ni un lote inventado

### Requirement: Gráfico accesible
The structure SHALL be available both as a drawing and as a nested list that is fully usable with keyboard and screen reader; nothing in the drawing MUST be communicated only by color.

#### Scenario: Lector de pantalla
- **WHEN** una persona recorre `/fogon/gobernanza` con lector de pantalla
- **THEN** escucha la lista anidada común → tribus → círculos y el consejo con sus lugares, con el estado de cada tribu en texto

#### Scenario: Celular
- **WHEN** la persona abre la página en una pantalla de 390 px
- **THEN** el gráfico entra sin scroll horizontal o se reemplaza por la lista

### Requirement: Validación en capas
The system SHALL show who validates whom: the común validates tribes and tribes validate people. Each tribe page MUST show whether it is validated by the común, and the person's journey MUST show which tribes validated them.

#### Scenario: Ficha de tribu
- **WHEN** una persona abre la ficha de Valle Solar
- **THEN** ve "Validada por el común" (dato de ejemplo)

#### Scenario: Persona validada
- **WHEN** una persona con la membresía de Taller Común aceptada (simulado) abre su recorrido
- **THEN** ve "Validada por Taller Común"

### Requirement: Registros con forma de attestation
Every validation and every decision taken to the council SHALL be recorded with: who asserts it, about whom or what, which earlier record it points to (if any), when, and whether it was revoked. Records MUST NOT be edited: a revocation is a new record that points to the original. In this change, records live only in the browser and MUST NOT be sent to any server or blockchain.

#### Scenario: Revocar una validación
- **WHEN** en la simulación una tribu retira la validación de una persona
- **THEN** se agrega un registro de revocación que apunta al original y la persona deja de verse como validada, sin borrar el registro original

#### Scenario: Sin red
- **WHEN** la persona valida o lleva una decisión al consejo
- **THEN** no sale ningún pedido de red con esos datos

### Requirement: Prototipo
The page SHALL show the prototype notice, use only theme tokens, have a single `<main>` (from the layout), keep the report button, and pass the axe audit.

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre `/fogon/gobernanza`
- **THEN** no hay violaciones serias ni críticas
