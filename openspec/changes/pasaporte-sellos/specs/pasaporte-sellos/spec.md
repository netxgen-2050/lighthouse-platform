## ADDED Requirements

### Requirement: Sellos con estado
The system SHALL show every stamp with its state in text (obtenido with date, en trámite, disponible) and how to get it.

#### Scenario: Sin nada
- **WHEN** una persona nueva abre `/pasaporte`
- **THEN** ve el sello Explorador/a obtenido y los demás disponibles con su botón o enlace

### Requirement: Qué abre cada sello
Each stamp SHALL list the doors it opens, computed with the permissions service.

#### Scenario: Pase Fundador
- **WHEN** la persona mira el sello Pase Fundador
- **THEN** ve que abre el canal de fundadores, la voz en el Fondo Común y los créditos

### Requirement: KYC por pasos
"Verificar mi identidad" SHALL open a five-step dialog, validate required fields per step, and leave the stamp "en trámite" until the simulated approval.

#### Scenario: Enviar
- **WHEN** la persona completa los cinco pasos y envía
- **THEN** el sello Identidad verificada queda en trámite y, al simular la aprobación, obtenido

### Requirement: KYC a pedido
Trying to invest or to register a money contribution without the identity stamp SHALL offer the KYC dialog instead of continuing.

#### Scenario: Invertir sin KYC
- **WHEN** la persona aprieta "Pedir invitación" en la sección de inversores sin el sello de identidad
- **THEN** se abre el proceso de verificación

### Requirement: Canales absorbido
`/canales` SHALL redirect to `/pasaporte` and `/semillas` MUST NOT show the "Lo que se te abre" ladder.

#### Scenario: Redirección
- **WHEN** la persona abre `/canales`
- **THEN** llega a `/pasaporte`
