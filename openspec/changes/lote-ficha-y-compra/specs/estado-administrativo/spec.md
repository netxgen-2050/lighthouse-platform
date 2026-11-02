# Spec Delta

## MODIFIED Requirements

### Requirement: Registro de vistas con lotes
The system SHALL keep the list of routes that show lots in `lib/legal/vistas-con-lotes.ts` (today `/territorios/lighthouse`, `/lotes` and `/lotes/lote-1`, as a sample of the lot sheet), and an end-to-end test MUST visit every route in the list and fail if the "Estado administrativo" region is missing.

#### Scenario: Ruta sin aviso
- **WHEN** una ruta de la lista se renderiza sin el componente
- **THEN** el e2e `estado-administrativo.spec.ts` falla nombrando la ruta

#### Scenario: Ficha de un lote
- **WHEN** el e2e visita `/lotes/lote-1`
- **THEN** encuentra la región "Estado administrativo" con "supuesto de trabajo, no otorgada"
