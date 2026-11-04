## ADDED Requirements

### Requirement: Los primeros 4 lotes

La plataforma SHALL mostrar primero los lotes del grupo `primeros`, con su propio estado administrativo. MUST NOT mostrar su aprobación municipal como otorgada mientras no haya documento, y la venta MUST seguir siendo simulada.

#### Scenario: Lista
- **WHEN** una persona abre `/lotes`
- **THEN** el primer lote es "Lote 535"
- **AND** ve el estado administrativo "Primeros 4 lotes" con "Titular: BioPueblo" y "Aprobación municipal: informada, sin documento a la vista"

#### Scenario: Ficha y boleto
- **WHEN** una persona abre `/lotes/lote-535`
- **THEN** lee que el lote está fuera del polígono del 7A, y "Quién vende: sin dato"
- **AND** no lee "supuesto de trabajo"
- **AND** el boleto de ejemplo dice "Aprobación municipal: informada, sin documento a la vista"

#### Scenario: Sin doble oferta
- **WHEN** una persona mira la vitrina de Chacras de Soluna
- **THEN** las fincas 535 a 538 no figuran: se muestran solo como lotes

### Requirement: Qué es cada parcela

El panel de la vista Lotes SHALL decir el uso de cada parcela del plano según la memoria técnica de Martín, sin mostrarla como lote.

#### Scenario: Panel
- **WHEN** una persona abre el panel de Lotes y despliega "Qué es cada parcela"
- **THEN** lee "CH-01" junto a "Chacra: vid y olivo"
