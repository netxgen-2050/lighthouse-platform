## Purpose

Que cada persona vea quién está en cada tribu y pueda mostrar, con confirmación de las dos partes y de forma revocable, que conoce a otra persona, con registros que tienen la forma de una attestation.

## ADDED Requirements

### Requirement: Personas de la tribu
Each tribe page SHALL show a "Quiénes somos" section with the visible people of that tribe: first name, initial, role in the tribe and, when available, circle. Tribes looking for people MUST show "Todavía no hay personas en esta tribu". The section MUST NOT show email, phone, city, nationality, fiscal residence or any passport data of other people.

#### Scenario: Ver la tribu
- **WHEN** una persona abre la ficha de Valle Solar
- **THEN** ve la sección "Quiénes somos" con las personas de ejemplo de Valle Solar, su rol y la marca de ejemplo

#### Scenario: Tribu vacante
- **WHEN** una persona abre la ficha de Barrio 3
- **THEN** ve "Todavía no hay personas en esta tribu"

#### Scenario: Sin datos personales
- **WHEN** una persona mira cualquier tarjeta de otra persona
- **THEN** no ve email, teléfono, ciudad ni datos del pasaporte

### Requirement: Directorio de personas
The system SHALL offer `/tribus/personas` listing all visible people, filterable by tribe and searchable by first name.

#### Scenario: Filtrar por tribu
- **WHEN** la persona elige "Taller Común" en el filtro
- **THEN** ve solo las personas de Taller Común

### Requirement: Visibilidad elegida por cada persona
A person SHALL appear in tribe lists and the directory only if they turned on "Mostrarme en el directorio de mi tribu", which MUST be off by default. A session without accepted consent (ADR-005) MUST NOT appear and MUST NOT be offered the option.

#### Scenario: Por defecto no aparece
- **WHEN** una persona se suma a Taller Común y no cambia nada en Configuración
- **THEN** no aparece en "Quiénes somos" de Taller Común ni en el directorio

#### Scenario: Elige mostrarse
- **WHEN** la persona prende "Mostrarme en el directorio de mi tribu"
- **THEN** aparece con su nombre de pila y su rol en Taller Común, y desaparece al apagarlo

### Requirement: Nos conocemos con confirmación mutua
A "nos conocemos" relation SHALL count only when both people asserted it: A asserts, B confirms. Until B confirms, A MUST see "Esperando que confirme" and B MUST see a request in their inbox with "Sí, nos conocemos" and "No la/lo conozco". A person MUST NOT be able to confirm their own assertion, and MUST NOT assert twice about the same person while one is pending or active.

#### Scenario: Confirmación
- **WHEN** Lucía elige "Nos conocemos" en la tarjeta de Lucas y Lucas confirma "Sí, nos conocemos"
- **THEN** los dos ven "Se conocen" en la tarjeta del otro

#### Scenario: Sin confirmación
- **WHEN** Lucía elige "Nos conocemos" y Lucas todavía no respondió
- **THEN** Lucía ve "Esperando que confirme" y la relación no cuenta en ningún número

#### Scenario: Rechazo
- **WHEN** Lucas elige "No la/lo conozco"
- **THEN** la relación no cuenta, Lucía ve "No confirmado" y puede volver a pedirlo más adelante

### Requirement: Retirar la relación
Either person SHALL be able to withdraw an active relation ("Ya no quiero mostrar que nos conocemos"). After withdrawal the relation MUST stop counting for both, and its records MUST be kept (a withdrawal is a new record pointing to the relation).

#### Scenario: Retirar
- **WHEN** Lucas retira la relación con Lucía
- **THEN** ninguno de los dos ve "Se conocen" y el historial conserva la afirmación, la confirmación y el retiro

### Requirement: Registros con forma de attestation
Every assertion, confirmation, rejection and withdrawal SHALL be an append-only record with: who asserts, about whom, which record it points to (confirmation and rejection point to the assertion; withdrawal points to the confirmation), when, and the record type. Records MUST NOT be edited or deleted except by the platform-wide "Borrar todo" of the prototype. In this change records live only in the browser and MUST NOT be sent to any server or blockchain.

#### Scenario: Sin red
- **WHEN** la persona afirma, confirma o retira
- **THEN** no sale ningún pedido de red con esos datos

#### Scenario: Borrar todo
- **WHEN** la persona usa "Borrar todo" en el panel del prototipo
- **THEN** desaparecen sus relaciones y registros de "nos conocemos"

### Requirement: Prototipo y accesibilidad
The new pages and sections SHALL show the prototype notice, label example people as examples, use only theme tokens, keep the report button, be fully usable with keyboard, communicate states with text (not only color) and pass the axe audit.

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre `/tribus/personas` y la ficha de Valle Solar
- **THEN** no hay violaciones serias ni críticas
