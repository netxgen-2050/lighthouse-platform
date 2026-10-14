# Spec Delta

## Purpose

Que el Fogón, Compromisos con su Mercado y Canales se usen en inglés, con la interfaz traducida y lo que escriben las personas y las comunidades en su idioma original.

## ADDED Requirements

### Requirement: Fogón en inglés
With English as the platform language, `/fogon` SHALL show filters, voting options, states, counts, results, help texts and errors in English, with the same behavior as in Spanish.

#### Scenario: Votar
- **WHEN** una persona con la plataforma en inglés vota "In favor" en una decisión
- **THEN** su voto queda registrado igual que en español y el estado se lee en inglés

### Requirement: Compromisos y Mercado en inglés
With English as the platform language, `/compromisos` SHALL show the form, its validations, commitment types, market states and formats in English, keeping tribe and neighborhood names untranslated.

#### Scenario: Validación
- **WHEN** envía un compromiso sin elegir para quién es
- **THEN** ve el error en inglés asociado al campo y el foco va a ese campo

### Requirement: Canales en inglés
With English as the platform language, `/canales` SHALL show each channel's name and access requirements in English, with plan and pass names from the platform glossary.

#### Scenario: Requisito
- **WHEN** una persona Explorer abre `/canales` en inglés
- **THEN** ve en inglés qué plan le falta para entrar a cada canal

### Requirement: Voz de la comunidad en el original
Fogón decisions and market offers SHALL be shown as written, marked as Spanish, with a visible "Written in Spanish" note in English pages.

#### Scenario: Decisión de ejemplo
- **WHEN** una persona con la plataforma en inglés abre el Fogón
- **THEN** el título de cada decisión está en español con `lang="es"` y la nota "Written in Spanish", y los botones de voto están en inglés

### Requirement: Páginas revisadas automáticamente
Fogón, Compromisos and Canales SHALL be in the list of translated pages, and with Spanish as the platform language they SHALL show exactly the same texts as before.

#### Scenario: Revisión automática
- **WHEN** corren el e2e de idioma y los e2e de fogón, compromisos y canales
- **THEN** en inglés no hay palabras en español fuera de lo marcado y en español pasan sin cambios
