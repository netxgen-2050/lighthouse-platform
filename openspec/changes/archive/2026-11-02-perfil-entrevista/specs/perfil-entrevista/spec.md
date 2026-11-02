## ADDED Requirements

### Requirement: Entrevista de seis preguntas
The system SHALL present at `/perfil` the 6 questions of mock-up v6, one at a time and in order, as a conversation (question from "Agente NetX", answer from the person). The person MUST answer in a text field; an empty answer MUST NOT advance.

#### Scenario: Responder la primera pregunta
- **WHEN** una persona abre `/perfil`, escribe una respuesta a "¿Qué te trae a BioPueblo?" y aprieta "Responder"
- **THEN** su respuesta aparece en la conversación y se muestra la segunda pregunta

#### Scenario: Respuesta vacía
- **WHEN** aprieta "Responder" sin escribir
- **THEN** ve un mensaje de error asociado al campo y la pregunta no cambia

### Requirement: Propuesta y confirmación
The system SHALL, for each answer, propose a profile field (label from the mock-up: Qué te trae, Bioregión, Cómo decidir, Lo que aportás, Tiempo, No negociables) and let the person "Confirmar" it or "Corregir" it (editing the text and confirming). Only confirmed fields count as part of the profile. The proposal MUST come from a single replaceable function.

#### Scenario: Confirmar
- **WHEN** la persona aprieta "Confirmar" en "Qué te trae"
- **THEN** el dato queda marcado como confirmado en "Tu perfil" y el avance sube

#### Scenario: Corregir
- **WHEN** la persona aprieta "Corregir", cambia el texto y confirma
- **THEN** "Tu perfil" muestra el texto corregido

### Requirement: Datos solo en el navegador
The system SHALL keep answers only in the browser, show the notice "Tus respuestas quedan solo en este navegador.", and offer "Borrar mis respuestas", which resets the interview. Nothing MUST be sent to a server.

#### Scenario: Recargar y borrar
- **WHEN** la persona respondió 2 preguntas y recarga
- **THEN** sigue en la pregunta 3 con sus 2 respuestas
- **AND** al apretar "Borrar mis respuestas" vuelve a la pregunta 1 con el perfil vacío

#### Scenario: Sin pedidos al servidor
- **WHEN** la persona completa la entrevista
- **THEN** no se hizo ningún pedido de red con sus respuestas

### Requirement: Cierre de la entrevista
The system SHALL, after the 6th answer, thank the person and link to `/tribus` with "Ver las tribus".

#### Scenario: Fin
- **WHEN** la persona responde la sexta pregunta
- **THEN** ve el agradecimiento y el enlace a `/tribus`
