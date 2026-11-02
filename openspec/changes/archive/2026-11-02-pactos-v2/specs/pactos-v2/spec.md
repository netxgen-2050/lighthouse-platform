## ADDED Requirements

### Requirement: Solo miembros
The system SHALL let a person propose pacts only in communities where they are a member, and explain how to become one otherwise.

#### Scenario: Sin membresía
- **WHEN** una persona que no es miembro de ninguna comunidad abre `/pactos`
- **THEN** ve que primero tiene que pertenecer a una comunidad y un enlace a `/tribus`

### Requirement: Rol primero
The time pact SHALL ask for the role (from the list or "Otro") and a description before the hours.

#### Scenario: Elegir rol
- **WHEN** la persona elige "Facilitación"
- **THEN** ve la descripción del rol y el campo para su descripción propia

### Requirement: Sin cobro
The time pact SHALL compute Semillas per month as hours × reference hour value and MUST NOT show any cash, share-as-seed or payment to the person.

#### Scenario: Calcular
- **WHEN** la persona pone 10 h/mes
- **THEN** ve las Semillas por mes y no aparecen las palabras "caja" ni "cobrás"

### Requirement: Plata aparte
Money contributions SHALL live in their own section and be recorded as Semillas (1 USD = 1 reference Semilla), simulated.

#### Scenario: Aporte en plata
- **WHEN** la persona registra un aporte de USD 200
- **THEN** ve 200 Semillas de plata (simulado)

### Requirement: Tooltip económico
The Semillas term SHALL carry a 🌱 economic tooltip, distinct from the ⚖ legal one, with the same interaction rules.

#### Scenario: Abrir con teclado
- **WHEN** la persona llega con Tab al 🌱 de "Semillas"
- **THEN** ve la explicación y Escape la esconde
