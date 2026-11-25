# Spec Delta

## MODIFIED Requirements

### Requirement: Aviso en las vistas con lotes
The system SHALL render the `EstadoAdministrativo` component in every view that shows lots. In `/territorios/lighthouse` the full version of Chacras de Soluna and of `lighthouse-norte` MUST appear above the map. The compact version MUST appear inside the side panel of every selected Soluna finca, whatever its status, and of every selected lot of the north sector, showing its own project. The component SHALL be a region whose name starts with "Estado administrativo" and names its project, so that two on the same page can be told apart, communicate the status with text (not only color) and include the legal term of its project: ⚖ `loteo` for Soluna and ⚖ `loteonorte` for the north sector.

#### Scenario: Aviso completo arriba del mapa
- **WHEN** una persona abre `/territorios/lighthouse`
- **THEN** ve, antes del mapa, una región "Estado administrativo · Chacras de Soluna" que dice "Chacras de Soluna", "Loteo en trámite", "Ord. 173/2026 de Mainqué" y "Aprobación municipal: pendiente"
- **AND** ve otra, "Estado administrativo · Lighthouse VRN", que dice "Lighthouse VRN · sector norte", "Loteo provisorio" y "Aprobación municipal: supuesto de trabajo, no otorgada"

#### Scenario: Aviso compacto en la ficha de una finca
- **WHEN** la persona elige la finca 502
- **THEN** la ficha muestra "Loteo en trámite · Ord. 173/2026" con su ⚖

#### Scenario: También en una finca reservada
- **WHEN** la persona elige la finca 501 (reservada)
- **THEN** la ficha también muestra el aviso compacto

#### Scenario: Aviso compacto en un lote del sector norte
- **WHEN** la persona elige el lote 7
- **THEN** el panel muestra "Loteo provisorio" y "supuesto de trabajo, no otorgada" con el ⚖ `loteonorte`
