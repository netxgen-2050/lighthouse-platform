# Spec Delta

## Purpose

Que la portada y Sumarte, lo primero que ve un inversor o un miembro del exterior, se lean completas en inglés con la misma conducta que en español.

## ADDED Requirements

### Requirement: Portada en inglés
With English as the platform language, the home page SHALL show its title, intro, the three paths and their links in English, with the neighborhood count worded in English and no number when there is no data.

#### Scenario: Caminos
- **WHEN** una persona con la plataforma en inglés abre `/`
- **THEN** ve "See the tribes", "Find my tribe" y "Congress · Feb 2027"

#### Scenario: Enlace para un inversor
- **WHEN** alguien abre `/?lang=en&utm_source=deck`
- **THEN** ve la portada en inglés y el origen de la visita queda guardado como siempre

### Requirement: Sumarte en inglés
With English as the platform language, `/sumarte` SHALL show the plans, the Founder Pass levels, the comparison table, the investor section, the level notices, the simulated states and the error messages in English, with the same behavior as in Spanish.

#### Scenario: Planes
- **WHEN** una persona con la plataforma en inglés abre `/sumarte`
- **THEN** ve "Explorer", "Member", "Founder Pass" y "Tribe Plan", y los precios con coma de miles ("USD 1,500")

#### Scenario: Aviso de nivel
- **WHEN** una persona sin el nivel necesario abre `/pactos` con la plataforma en inglés y termina en Sumarte
- **THEN** el aviso dice en inglés qué plan habilita esa página

#### Scenario: Elegir un plan
- **WHEN** una persona con cuenta y la plataforma en inglés elige "Member"
- **THEN** su plan queda guardado igual que en español y se lee "Your plan (simulated)"

### Requirement: Lo que falta traducir cae marcado
Legal terms, the identity verification dialog and the account creation step shown in these pages, while not yet translated, SHALL appear in Spanish marked as Spanish, never empty.

#### Scenario: Término legal
- **WHEN** una persona con la plataforma en inglés abre el ⚖ de "Founder Pass" antes de que exista su inglés
- **THEN** ve el texto en español con "Only available in Spanish"

### Requirement: Sin textos en español fuera de lo marcado
The home page and Sumarte SHALL be in the list of translated pages, so the untranslated-text check covers their main content in English.

#### Scenario: Revisión automática
- **WHEN** corre el e2e de idioma
- **THEN** `/` y `/sumarte` en inglés no tienen palabras en español fuera de `lang="es"` y de los nombres propios

### Requirement: Español sin cambios
With Spanish as the platform language, the home page and Sumarte SHALL show exactly the same texts as before this change.

#### Scenario: Pruebas existentes
- **WHEN** corren `e2e/portada.spec.ts`, `e2e/sumarte.spec.ts` y `e2e/sumarte-acceso.spec.ts`
- **THEN** pasan sin cambios
