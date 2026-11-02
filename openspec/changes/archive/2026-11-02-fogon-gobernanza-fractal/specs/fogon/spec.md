## MODIFIED Requirements

### Requirement: Filtro por ámbito
The system SHALL filter decisions by scope: Todas, Círculo, Tribu, Lighthouse (el común), Consejo, Fideicomiso. The scope "Asamblea de residentes" MUST NOT be offered.

#### Scenario: Filtrar
- **WHEN** la persona elige "Fideicomiso"
- **THEN** ve solo el presupuesto de obra del macrolote

#### Scenario: Filtrar por el común
- **WHEN** la persona elige "Lighthouse (el común)"
- **THEN** ve "Usar el fondo común para la bomba solar" y "Permitir animales de granja en las chacras", cada una con su regla y su ⚖

#### Scenario: Filtros disponibles
- **WHEN** la persona mira el grupo "Filtrar por ámbito"
- **THEN** ve exactamente "Todas", "Círculo", "Tribu", "Lighthouse (el común)", "Consejo" y "Fideicomiso"

## ADDED Requirements

### Requirement: Llevar una decisión al consejo
A tribe decision that was approved in the tribe and asks something from the común SHALL be able to be taken to the council by a leader of that tribe (simulated). In the council scope it MUST show the tribe it comes from and that it was approved there. People who do not lead the tribe MUST NOT see the action.

#### Scenario: Líder lleva la decisión
- **WHEN** la líder de Valle Solar (simulado) elige "Llevar al consejo" en el pedido al Fondo Común
- **THEN** la decisión aparece en "Consejo" con "Viene de Valle Solar (aprobada en la tribu)" y queda así al recargar

#### Scenario: No lidera
- **WHEN** una persona que no lidera Valle Solar mira esa decisión
- **THEN** no ve "Llevar al consejo"

### Requirement: Acceso a la estructura
The `/fogon` page SHALL link to `/fogon/gobernanza` ("Cómo decidimos").

#### Scenario: Desde el Fogón
- **WHEN** la persona abre `/fogon`
- **THEN** ve el enlace "Cómo decidimos" y llega a `/fogon/gobernanza`
