## ADDED Requirements

### Requirement: Leer el manifiesto
The system SHALL let anyone read the full manifesto of an active or in-formation tribe and of the Lighthouse.

#### Scenario: Leer
- **WHEN** una persona aprieta "Leer el manifiesto de la tribu" en `/tribus/valle`
- **THEN** ve el título, la introducción y los compromisos del manifiesto de Valle Solar

### Requirement: Adherir con conciencia
The adhere button SHALL stay disabled until the person has reached the end of the text and checked both mandatory statements.

#### Scenario: Sin leer hasta el final
- **WHEN** la persona no llegó al final del texto
- **THEN** el botón "Adherir" está deshabilitado y lo explica

### Requirement: Estados de membresía
After adhering the membership SHALL be "pedido enviado" until the simulated acceptance, then "miembro"; states persist after reload and are per community.

#### Scenario: Aceptación simulada
- **WHEN** la persona adhiere a Valle Solar y aprieta "Simular: la comunidad me acepta"
- **THEN** pasa a ser miembro de Valle Solar y no de otras tribus, también al recargar

### Requirement: Botones según membresía
A non-member SHALL see "Leer el manifiesto" and "Adherir al manifiesto"; a member SHALL see "Proponer mi pacto" and "Entrar a la sala".

#### Scenario: Miembro
- **WHEN** la persona es miembro de Valle Solar
- **THEN** en `/tribus/valle` ve "Proponer mi pacto" y no ve "Adherir"
