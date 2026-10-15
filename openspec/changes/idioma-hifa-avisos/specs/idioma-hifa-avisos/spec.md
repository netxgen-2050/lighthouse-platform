# Spec Delta

## Purpose

Que Hifa, el botón de reportes y la ventana de login sigan el idioma de la plataforma, y comprobar que no quede ninguna página de la plataforma sin traducir salvo las internas.

## ADDED Requirements

### Requirement: Hifa en el idioma de la plataforma
With English as the platform language, Hifa SHALL greet, offer shortcuts, answer and show its buttons and errors in English. Each message SHALL keep the language it was written in, so earlier messages keep their language and are marked accordingly.

#### Scenario: Conversación nueva en inglés
- **WHEN** una persona con la plataforma en inglés abre Hifa por primera vez
- **THEN** el saludo y los atajos están en inglés y el asistente se llama "Hifa"

#### Scenario: Cambiar de idioma con una conversación empezada
- **WHEN** la persona habló con Hifa en español y cambia a inglés
- **THEN** los mensajes anteriores se ven en español con `lang="es"` y la respuesta siguiente sale en inglés

### Requirement: Reportar en el idioma de la plataforma
With English as the platform language, the report form SHALL be in English; the issue sent to the team SHALL keep its Spanish template, include the person's language and keep the person's text as typed.

#### Scenario: Reporte en inglés
- **WHEN** una persona con la plataforma en inglés envía un reporte
- **THEN** el formulario y la confirmación están en inglés y el cuerpo del issue tiene la línea "Idioma de la persona: en"

### Requirement: Ventana de login en el idioma de la plataforma
The login window SHALL show its main texts in Spanish when the platform is in Spanish and in English when it is in English, as far as the login provider allows.

#### Scenario: Español
- **WHEN** una persona con la plataforma en español aprieta "Entrar" y acepta en el paso de consentimiento (ver `consentimiento-alta`)
- **THEN** el título y la indicación principal de la ventana de login están en español

### Requirement: Toda la plataforma traducida salvo lo interno
Every navigable page and every public page SHALL be in the list of translated pages, except the internal team pages, which SHALL keep showing the untranslated-page notice in English.

#### Scenario: Cobertura
- **WHEN** corre el test de cobertura de rutas
- **THEN** falla si una página del rail, del menú de la persona o de las públicas no está en la lista de traducidas, salvo `/netx` y la bitácora del panel

#### Scenario: Página interna
- **WHEN** el super admin abre `/netx` con la plataforma en inglés
- **THEN** ve "This page is only available in Spanish for now." y el contenido en español con `lang="es"`
