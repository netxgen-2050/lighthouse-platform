## ADDED Requirements

### Requirement: Consultas para priorizar o repartir, no decisiones
Las consultas de `/fogon/consultas` (U1 a U4) SHALL presentarse como consultas para priorizar o repartir, no como decisiones. La página MUST titularse "Consultas para priorizar o repartir"; cada tarjeta MUST llevar la etiqueta "Consulta para priorizar" o "Consulta para repartir" según su modo; la lista y la página de cada consulta MUST decir "No es una decisión: orienta a quien decide.". La descripción de una consulta MUST NOT presentarla como una decisión. El reparto, el resultado y el acta MUST seguir funcionando como hoy, y estas páginas son las únicas de la portada del Fogón que MAY explicar el voto cuadrático sin una sugerencia de por medio. Todo MUST estar en es y en, y en texto, no solo con un color.

#### Scenario: Lista de consultas
- **WHEN** una persona abre `/fogon/consultas`
- **THEN** el título dice "Consultas para priorizar o repartir", lee "No es una decisión: orienta a quien decide." y "¿Para qué optimiza el Lighthouse?" lleva "Consulta para priorizar"

#### Scenario: Consulta de presupuesto
- **WHEN** la persona mira "Primer presupuesto de regeneración"
- **THEN** la tarjeta lleva "Consulta para repartir"

#### Scenario: Dentro de una consulta
- **WHEN** la persona abre la consulta U1
- **THEN** lee su etiqueta y "No es una decisión: orienta a quien decide.", y puede repartir sus créditos como antes

#### Scenario: U1 no se llama decisión
- **WHEN** la persona lee la descripción de "¿Para qué optimiza el Lighthouse?"
- **THEN** lee que el resultado alimenta la Decisión A del modelo híbrido, que se toma aparte

#### Scenario: En inglés
- **WHEN** la persona abre `/fogon/consultas?lang=en`
- **THEN** el título dice "Consultations to prioritize or split" y lee "Not a decision: it guides whoever decides."

#### Scenario: Auditoría
- **WHEN** corre la auditoría de accesibilidad sobre `/fogon/consultas`
- **THEN** no hay violaciones serias ni críticas
