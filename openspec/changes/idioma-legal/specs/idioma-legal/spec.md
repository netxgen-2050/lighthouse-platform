# Spec Delta

## Purpose

Que todo lo que tiene peso legal (⚖, aviso de la Ord. 173, política de privacidad, términos, consentimiento y Mis datos) se pueda leer en inglés como borrador marcado, y que quede constancia del idioma en que cada persona aceptó.

## ADDED Requirements

### Requirement: Términos legales en inglés como borrador
Every legal term in the catalog SHALL have an English title and text. With English as the platform language, every legal term on a translated page SHALL be shown in English with the visible mark "Draft: text under review", and its log entry SHALL record the English language and the draft mark. On a page not yet translated, the legal term SHALL be shown and logged in Spanish, like the rest of the page content.

#### Scenario: ⚖ en Sumarte
- **WHEN** una persona con la plataforma en inglés abre el ⚖ de "Founder Pass"
- **THEN** ve el título y el texto en inglés con "Draft: text under review"
- **AND** la bitácora anota ese término con idioma inglés y como borrador

#### Scenario: ⚖ en una página sin traducir
- **WHEN** la plataforma está en inglés y una página que todavía no se tradujo muestra un ⚖
- **THEN** el ⚖ se ve en español y la bitácora lo anota con idioma español

#### Scenario: Catálogo completo
- **WHEN** corre el test del catálogo legal
- **THEN** falla si alguna clave no tiene inglés o tiene un inglés igual al español

### Requirement: Aviso de la Ordenanza 173 en inglés
With English as the platform language, the administrative status notice SHALL be shown in English, marked as draft, and logged in the language shown.

#### Scenario: Ficha del territorio
- **WHEN** una persona con la plataforma en inglés abre una vista con lotes de Soluna
- **THEN** el aviso del estado administrativo está en inglés con la marca de borrador

### Requirement: Política y términos en inglés como traducción de borrador
With English as the platform language, `/privacidad` SHALL show the full policy and the prototype terms in English with the same sections and rows as in Spanish, and a visible notice that it is a draft translation not reviewed by the legal team, that the Spanish version is the reference, and a link to it.

#### Scenario: Leer la política en inglés
- **WHEN** una persona abre `/privacidad?lang=en`
- **THEN** ve la política en inglés con el aviso "Draft translation, not reviewed by the legal team" y un enlace a la versión en español

#### Scenario: Mismas secciones
- **WHEN** corre el test de la política
- **THEN** falla si el inglés no tiene las mismas secciones y la misma cantidad de filas que el español

### Requirement: La política informa la cookie de idioma
The policy SHALL list the language cookie in the data it processes; because this changes the information given, the policy version SHALL change with that change listed, so every person accepts again.

#### Scenario: Re-consentimiento por la cookie
- **WHEN** una persona que aceptó la versión anterior entra después de este cambio
- **THEN** ve la pantalla de consentimiento con "Qué cambió" mencionando el idioma guardado en el navegador

### Requirement: Consentimiento y Mis datos en inglés
With English as the platform language, the consent screen, the account creation step and `/mis-datos` SHALL be fully in English, keeping two separate unchecked checkboxes and the same behavior as in Spanish.

#### Scenario: Alta en inglés
- **WHEN** una persona sin sesión y con la plataforma en inglés elige "Join for free" en Sumarte
- **THEN** ve "Create your account" con el resumen en inglés, la marca de borrador y las dos casillas sin marcar

### Requirement: Constancia del idioma aceptado
The consent record SHALL store the language of the text the person had in front of them when accepting. Records without a language MUST count as Spanish. "Mis datos" SHALL show that language and, for English, that it was a draft translation.

#### Scenario: Aceptar en inglés
- **WHEN** una persona acepta con la plataforma en inglés y abre Mis datos
- **THEN** ve que aceptó la versión vigente en inglés, como traducción de borrador

#### Scenario: Registro sin idioma
- **WHEN** el navegador tiene un consentimiento vigente sin idioma
- **THEN** sigue valiendo y Mis datos dice que se aceptó en español

### Requirement: Español sin cambios
With Spanish as the platform language, legal terms, the policy, the consent screens and Mis datos SHALL show the same texts as before this change, except the new line about the language cookie and the new version.

#### Scenario: Pruebas existentes
- **WHEN** corren `e2e/privacidad.spec.ts` y `e2e/estado-administrativo.spec.ts`
- **THEN** pasan, con el único ajuste de la versión nueva de la política
