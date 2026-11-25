## MODIFIED Requirements

### Requirement: Decisiones con su base
The system SHALL list at `/fogon` the example decisions of the scopes Tribu and Fideicomiso from mock-up v6 (Plan de huerta comunitaria 2027, Presupuesto de obra 2027 del macrolote, Elegir facilitador/a de Valle Solar), each showing where it is decided, the rule and a ⚖ with its normative basis. The decisions of the Asamblea de residentes MUST NOT be listed.

#### Scenario: Ver una decisión
- **WHEN** una persona abre `/fogon`
- **THEN** ve "Plan de huerta comunitaria 2027" con "Círculo de Tierra", "Consentimiento" y su ⚖

#### Scenario: Sin asamblea de residentes
- **WHEN** una persona abre `/fogon`
- **THEN** no ve "Usar el fondo común para la bomba solar" ni "Permitir animales de granja en las chacras", ni el texto "Asamblea de residentes", ni el párrafo sobre la residencia fiscal

### Requirement: Filtro por ámbito
The system SHALL filter decisions by scope: Todas, Tribu, Fideicomiso. The scope "Asamblea de residentes" MUST NOT be offered.

#### Scenario: Filtrar
- **WHEN** la persona elige "Fideicomiso"
- **THEN** ve solo el presupuesto de obra del macrolote

#### Scenario: Filtros disponibles
- **WHEN** la persona mira el grupo "Filtrar por ámbito"
- **THEN** ve exactamente "Todas", "Tribu" y "Fideicomiso"

## ADDED Requirements

### Requirement: El Fogón es para decidir, no para eventos
The Fogón pages (`/fogon` and `/fogon/consultas`) SHALL show only decisions and consultations. Events (meetings, workdays, dated calls to gather) MUST NOT be listed in the Fogón; they belong to `/congreso` or a dedicated events page.

#### Scenario: Sin eventos
- **WHEN** una persona abre `/fogon`
- **THEN** no ve tarjetas de eventos con fecha y lugar, solo decisiones y el acceso a las consultas

### Requirement: Reportar desde el Fogón
The report button ("Reportar un problema o una idea") SHALL remain available on every Fogón page, as on every other page of the platform.

#### Scenario: Botón en el Fogón
- **WHEN** una persona abre `/fogon` o `/fogon/consultas`
- **THEN** ve el botón circular "Reportar un problema o una idea" y puede abrir el diálogo con el teclado
