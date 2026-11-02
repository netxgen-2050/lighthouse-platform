## MODIFIED Requirements

### Requirement: Fogón en inglés
With English as the platform language, `/fogon` SHALL show the consensus status, states, results, help texts and errors in English, with the same behavior as in Spanish.

#### Scenario: Estado del consenso
- **WHEN** una persona con sesión y la plataforma en inglés mira una decisión con propuesta
- **THEN** lee "Consensus status" con la fase, los concerns, los acuses y el quórum en inglés

### Requirement: Decisiones y ofertas de ejemplo traducidas
Sample Fogón decisions and sample market offers SHALL have an English translation and, in English pages, SHALL show a visible note saying they were translated from Spanish. Offers published by a person MUST be shown exactly as written, marked as Spanish, without translation.

#### Scenario: Decisión de ejemplo
- **WHEN** una persona con la plataforma en inglés abre el Fogón
- **THEN** el título y la descripción de cada decisión de ejemplo están en inglés con la nota visible "Translated from Spanish", y sus acciones están en inglés

#### Scenario: Oferta propia
- **WHEN** una persona publicó una oferta en español y pasa la plataforma a inglés
- **THEN** su oferta se ve tal cual la escribió, con `lang="es"`, sin traducir
