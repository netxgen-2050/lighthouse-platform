## ADDED Requirements

### Requirement: Registro simplificado
The form SHALL ask only type (Ofrezco/Necesito), description and medium of exchange (Tiempo, Bienes, Plata, Trueque); the "Para quién" field MUST NOT exist.

#### Scenario: Sin para quién
- **WHEN** una persona abre `/compromisos`
- **THEN** no ve el campo "Para quién"

### Requirement: Mercado
The system SHALL show a market with the person's published items plus sample community items, filterable by type and medium, each with "Me interesa" (simulated).

#### Scenario: Filtrar
- **WHEN** la persona filtra por "Necesito" y "Tiempo"
- **THEN** solo ve necesidades de tiempo

### Requirement: Aviso de match
The market SHALL show the notice that AI matching is coming.

#### Scenario: Aviso
- **WHEN** la persona mira el mercado
- **THEN** ve el aviso del match con inteligencia artificial
