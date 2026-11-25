# Spec Delta

## Purpose

Permite que una persona retire un pacto de tiempo enviado y proponga cambios a un pacto ya aceptado, que la comunidad acepta o no (simulado), con versiones e historial (issue #50 y US-17 de la nota 15).

## ADDED Requirements

### Requirement: Retirar un pacto enviado
While a time pact is sent and not yet accepted, the person SHALL be able to withdraw it with "Retirar y editar", which MUST return it to draft with its content intact.

#### Scenario: Retirar antes de la respuesta
- **WHEN** una persona envió a Valle Solar un pacto de 10 h/mes y aprieta "Retirar y editar"
- **THEN** el pacto vuelve a Borrador con sus 10 h/mes, rol y descripción, y se puede editar

### Requirement: Proponer un cambio a un pacto aceptado
An accepted time pact SHALL offer "Proponer un cambio", opening a draft prefilled with the current version (role, description, hours). The draft MUST follow the same completeness rules as a new pact to be sent.

#### Scenario: Más horas
- **WHEN** una persona con un pacto aceptado de 10 h/mes en Jardinería propone un cambio a 20 h/mes y lo envía
- **THEN** ve el cambio como "Enviado a la comunidad" junto a la versión vigente de 10 h/mes

#### Scenario: Cambio incompleto
- **WHEN** en el borrador del cambio borra la descripción
- **THEN** no puede enviarlo y ve "Para enviarlo elegí un rol y contá qué vas a hacer."

### Requirement: La versión aceptada sigue vigente
While a change is in draft or sent, the accepted version SHALL remain in force: Semillas MUST keep using its hours.

#### Scenario: Semillas durante la revisión
- **WHEN** hay un cambio a 20 h/mes enviado sobre un pacto aceptado de 10 h/mes
- **THEN** Semillas sigue calculando con 10 h/mes

### Requirement: Respuesta simulada de la comunidad
A sent change SHALL offer "Simular: la comunidad acepta el cambio" and "Simular: la comunidad no lo acepta". Accepting MUST make the change the current version with the next version number. Rejecting MUST discard it and show "Quien administra <comunidad> no aceptó el cambio. Sigue vigente la versión N."

#### Scenario: Acepta
- **WHEN** la comunidad acepta (simulado) el cambio a 20 h/mes de un pacto en versión 1
- **THEN** el pacto queda en versión 2 con 20 h/mes y Semillas calcula con 20 h/mes

#### Scenario: No acepta
- **WHEN** la comunidad no acepta (simulado) el cambio
- **THEN** el pacto sigue en versión 1 con 10 h/mes y se anuncia el aviso de que no se aceptó

### Requirement: Descartar un cambio en borrador
A change still in draft SHALL be discardable with "Descartar cambio", leaving the current version untouched.

#### Scenario: Descartar
- **WHEN** una persona descarta un cambio en borrador
- **THEN** ve solo la versión vigente y vuelve a tener "Proponer un cambio"

### Requirement: Versión e historial
The pact SHALL show its real version number (1 when first accepted, +1 per accepted change) and a collapsible history listing each accepted version with role, hours, description and date, newest first. A pact never accepted MUST NOT show a version number.

#### Scenario: Historial
- **WHEN** un pacto pasó por las versiones 1 (10 h/mes) y 2 (20 h/mes)
- **THEN** el historial muestra la versión 2 arriba y la 1 abajo, cada una con su fecha

#### Scenario: Borrador nuevo
- **WHEN** una persona tiene un pacto en Borrador que nunca se aceptó
- **THEN** no ve "Versión"

### Requirement: Eventos en Mi recorrido
Proposing, accepting and rejecting a change SHALL each register an event in the person's timeline, linking to the pact of that community.

#### Scenario: Cambio aceptado
- **WHEN** Valle Solar acepta (simulado) un cambio
- **THEN** Mi recorrido muestra "Valle Solar aceptó el cambio a tu pacto" con enlace a `/pactos?comunidad=valle`

### Requirement: Compatibilidad con lo guardado
Pacts saved in the previous format SHALL still load: an accepted pact MUST appear as version 1 with no pending change.

#### Scenario: Pacto aceptado anterior
- **WHEN** una persona tenía un pacto aceptado guardado antes de este cambio
- **THEN** lo ve como versión 1 y puede proponer un cambio
