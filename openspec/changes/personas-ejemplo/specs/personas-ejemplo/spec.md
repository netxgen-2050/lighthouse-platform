# Spec Delta

## Purpose

Permitir recorrer la plataforma como una de las dos personas de ejemplo del mock-up v6 (Lucía o Lucas) para mostrar la demo de la It.1 sin tipear en vivo y probar el recorrido completo hasta el perfil.

## ADDED Requirements

### Requirement: Elegir una persona de ejemplo
The system SHALL offer at `/` and at `/perfil` a control labelled "Ver como" with three mutually exclusive options: "Sin persona", "Lucía" and "Lucas". The default MUST be "Sin persona". The selected option MUST be conveyed with text or ARIA state, not only with color, and MUST be operable with the keyboard.

#### Scenario: Valor por defecto
- **WHEN** una persona abre `/` por primera vez
- **THEN** el control "Ver como" tiene seleccionada la opción "Sin persona"
- **AND** no se muestra ninguna tarjeta de persona

#### Scenario: Elegir con teclado
- **WHEN** una persona llega con Tab al control y elige "Lucas" solo con el teclado
- **THEN** la opción "Lucas" queda seleccionada y un lector de pantalla lo anuncia como seleccionada

### Requirement: La elección queda solo en el navegador
The system SHALL keep the selected persona only in the browser, shared between `/` and `/perfil`, and MUST NOT send it to any server.

#### Scenario: Se mantiene entre páginas y recargas
- **WHEN** una persona elige "Lucía" en `/`, va a `/perfil` y recarga
- **THEN** en `/perfil` el control muestra "Lucía" seleccionada

#### Scenario: Volver a sin persona
- **WHEN** una persona con "Lucía" elegida selecciona "Sin persona"
- **THEN** desaparecen la tarjeta de la portada y el botón de respuesta de ejemplo del perfil

### Requirement: Tarjeta de persona en la portada
The system SHALL show at `/`, when a persona is selected, a card with "Estás viendo la plataforma como <nombre>, <edad> · <ciudad>", the persona's short description copied from mock-up v6, and the visible mark "Persona de ejemplo". The card MUST NOT show nationality, fiscal residence, amounts or investment capacity.

#### Scenario: Tarjeta de Lucía
- **WHEN** la persona elegida es "Lucía"
- **THEN** la portada muestra "Estás viendo la plataforma como Lucía, 38 · Oslo, Noruega" y "Persona de ejemplo"
- **AND** no aparecen "Nacionalidad", "Residencia fiscal", "USD" ni "$"

### Requirement: Respuesta de ejemplo en la entrevista
The system SHALL show in `/perfil`, when a persona is selected and the interview is not finished, a button "Usar la respuesta de ejemplo de <nombre>" that fills the answer field with that persona's mock-up answer for the current question, without submitting it. The field MUST remain editable and the person MUST still press "Responder".

#### Scenario: Completar sin enviar
- **WHEN** con "Lucas" elegido, en la pregunta 1, la persona aprieta "Usar la respuesta de ejemplo de Lucas"
- **THEN** el campo contiene "Quiero dejar el petróleo, mudarme con mi pareja y construir nuestra casa."
- **AND** la conversación sigue en la pregunta 1 hasta que aprieta "Responder"

#### Scenario: Sin persona no hay botón
- **WHEN** la opción elegida es "Sin persona"
- **THEN** `/perfil` no muestra ningún botón de respuesta de ejemplo

### Requirement: Propuesta con el resumen del mock-up
The system SHALL, when a submitted answer is exactly a persona's mock-up answer for that question (after trimming spaces), propose the mock-up's summary for that field; otherwise it MUST keep the existing proposal behavior.

#### Scenario: Respuesta de ejemplo sin cambios
- **WHEN** la persona envía en la pregunta 2 la respuesta de ejemplo de Lucía sin editarla
- **THEN** "Tu perfil" propone "Valle ribereño patagónico" para "Bioregión"

#### Scenario: Respuesta de ejemplo editada
- **WHEN** la persona edita la respuesta de ejemplo antes de enviarla
- **THEN** la propuesta se arma como en `perfil-entrevista`, sin usar el resumen del mock-up

### Requirement: Recorrido completo de la demo
The system SHALL allow completing the six questions and confirming the six fields using only the example answers of either persona, ending with the link "Ver las tribus" to `/tribus`.

#### Scenario: Recorrido de Lucía
- **WHEN** una persona elige "Lucía" en la portada, entra por "Encontrar mi tribu", usa y envía las seis respuestas de ejemplo y confirma los seis datos
- **THEN** "Tu perfil" muestra 6/6 confirmados y el enlace "Ver las tribus" lleva a `/tribus`
