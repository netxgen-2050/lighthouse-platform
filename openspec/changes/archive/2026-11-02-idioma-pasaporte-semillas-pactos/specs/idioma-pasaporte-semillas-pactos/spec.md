# Spec Delta

## Purpose

Que Pasaporte (con la verificación de identidad), Semillas y Pactos se usen completos en inglés, con la misma conducta que en español y sin traducir lo que escribe la persona.

## ADDED Requirements

### Requirement: Pasaporte en inglés
With English as the platform language, `/pasaporte` SHALL show paths, stamps (name, what it unlocks, how to get it and its state), the wallet stamp and the work hours section in English. "Genesis" MUST stay untranslated.

#### Scenario: Sellos
- **WHEN** una persona con la plataforma en inglés abre `/pasaporte`
- **THEN** cada sello muestra en inglés qué abre y cómo se obtiene, y el sello Genesis se llama "Genesis"

### Requirement: Verificación de identidad en inglés
The identity verification dialog SHALL show its steps, fields, validation errors and simulated approval in English, wherever it is opened (Pasaporte or Sumarte), without changing which data it asks for or where it is stored.

#### Scenario: Error de un campo
- **WHEN** en el diálogo en inglés deja vacía la fecha de nacimiento y sigue
- **THEN** ve el error en inglés asociado al campo y el foco va a ese campo

### Requirement: Semillas en inglés
With English as the platform language, `/semillas` SHALL show the ledger, the recognition round, the explained calculation and the economic term in English, with numbers and dates in the English format; the English economic term MUST be marked as draft. The word "Semillas" MUST NOT be translated: the first mention in the page content SHALL read "Semillas (seeds)" and the rest "Semillas".

#### Scenario: Término económico
- **WHEN** abre el 🌱 de "Semillas" en inglés
- **THEN** ve el título "Semillas" y el texto en inglés con "Draft: text under review"

#### Scenario: Nombre sin traducir
- **WHEN** una persona con la plataforma en inglés abre `/semillas`
- **THEN** el título dice "Semillas", la primera explicación dice "Semillas (seeds)" y la página no dice "Seeds" como nombre

### Requirement: Pactos en inglés
With English as the platform language, `/pactos` SHALL show how to propose and accept time and money pacts, the reference hour value, contributions with the sample exchange rate, states and errors in English, and MUST keep any text typed by the person exactly as typed.

#### Scenario: Pacto propio
- **WHEN** una persona con la plataforma en inglés ve un pacto que escribió en español
- **THEN** su descripción se muestra tal cual, con `lang="es"` si el texto de la interfaz alrededor está en inglés

### Requirement: Páginas revisadas automáticamente
Pasaporte, Semillas and Pactos SHALL be in the list of translated pages, and with Spanish as the platform language they SHALL show exactly the same texts as before.

#### Scenario: Revisión automática
- **WHEN** corren el e2e de idioma y los e2e de pasaporte, semillas y pactos
- **THEN** en inglés no hay palabras en español fuera de lo marcado y en español pasan sin cambios
