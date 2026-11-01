## ADDED Requirements

### Requirement: Consulta de decisión
The Fogón SHALL support a `decision` mode where each person on the roll casts exactly one vote among "Aprobar", "Rechazar" and "Abstenerme", with equal weight for everyone and no quadratic credits. The last vote of each person until closing SHALL count, and the database MUST reject a submission with zero or more than one option. The result SHALL be "Aprobada" when Aprobar exceeds Rechazar and at least half of the roll voted (abstentions do not count toward that half), "Rechazada" when Rechazar is equal to or greater than Aprobar with that quorum, and "Sin quórum" otherwise. The rule SHALL live in a single pure function.

#### Scenario: Votar
- **WHEN** una persona del padrón elige "Aprobar" y guarda
- **THEN** ve su voto, y si después elige "Rechazar" y guarda, cuenta solo el último

#### Scenario: Empate
- **WHEN** cierra una consulta con quórum, 2 votos para Aprobar y 2 para Rechazar
- **THEN** el resultado es "Rechazada"

#### Scenario: Envío inválido
- **WHEN** alguien envía a la API dos opciones a la vez en una consulta de decisión
- **THEN** la API responde 400 y la base no guarda nada

#### Scenario: Accesibilidad
- **WHEN** se abre una consulta de decisión con el teclado
- **THEN** las tres opciones son un grupo de radios con nombre accesible, y la auditoría de axe pasa
