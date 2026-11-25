## ADDED Requirements

### Requirement: Página de perfil
`/perfil` SHALL show the header, skills and roles, communities, summary and decision preferences, without the chat interview as the main element.

#### Scenario: Ver el perfil
- **WHEN** una persona con datos abre `/perfil`
- **THEN** ve su nombre, sus roles, sus comunidades y el resumen, y no ve una conversación

### Requirement: Editar
The person SHALL be able to edit their profile in a form with validation, and changes persist in the browser.

#### Scenario: Cambiar la frase
- **WHEN** la persona edita su frase y guarda
- **THEN** la ve actualizada también al recargar

### Requirement: Migración
Data from the previous interview SHALL appear in the new fields.

#### Scenario: Datos viejos
- **WHEN** la persona había confirmado "Lo que aportás" en la entrevista
- **THEN** lo ve en "Qué sabés hacer y qué ofrecés"
