# Spec Delta

## Purpose

Que el espacio personal (Perfil, Mi recorrido, notificaciones y Configuración) se use en inglés, con las notificaciones armadas en el idioma actual y sin traducir lo que escribe la persona.

## ADDED Requirements

### Requirement: Perfil en inglés
With English as the platform language, `/perfil` SHALL show its sections, interview questions, profile proposal, roles, help texts and errors in English, and MUST show the person's own answers exactly as typed.

#### Scenario: Entrevista
- **WHEN** una persona con la plataforma en inglés abre la entrevista del perfil
- **THEN** las preguntas están en inglés y sus respuestas anteriores se ven tal cual las escribió

### Requirement: Mi recorrido en inglés
With English as the platform language, `/panel` SHALL show progress, next step and timeline in English, with dates in the English format.

#### Scenario: Próximo paso
- **WHEN** una persona sin pactos abre `/panel` en inglés
- **THEN** el próximo paso le propone en inglés proponer un pacto

### Requirement: Notificaciones en el idioma actual
Each new activity event SHALL be stored with its type and data, and its text SHALL be built in the current platform language when shown in the bell and in `/bandeja`. Events stored before this change SHALL keep showing their original text, marked as Spanish.

#### Scenario: Cambiar de idioma con notificaciones
- **WHEN** una persona recibe "Valle Solar aceptó tu adhesión" en español y después cambia a inglés
- **THEN** en `/bandeja` lee "Valle Solar accepted your membership" (o el texto del diccionario) con "Valle Solar" sin traducir

#### Scenario: Evento viejo
- **WHEN** el navegador tiene un evento guardado antes de este cambio, solo con texto
- **THEN** en inglés se muestra su texto en español con `lang="es"`

### Requirement: Configuración en inglés
With English as the platform language, `/configuracion` SHALL show appearance, notification types, the assistant option, currency with its exchange note, language and "Borrar todo" with its confirmation in English.

#### Scenario: Borrar todo
- **WHEN** aprieta "Delete everything" con la plataforma en inglés
- **THEN** la confirmación está en inglés y al aceptar se borra lo mismo que en español

### Requirement: Páginas revisadas automáticamente
Perfil, Mi recorrido, the notifications page and Configuración SHALL be in the list of translated pages, and with Spanish as the platform language they SHALL show exactly the same texts as before.

#### Scenario: Revisión automática
- **WHEN** corren el e2e de idioma y los e2e de perfil, panel, bandeja y configuración
- **THEN** en inglés no hay palabras en español fuera de lo marcado y en español pasan sin cambios
