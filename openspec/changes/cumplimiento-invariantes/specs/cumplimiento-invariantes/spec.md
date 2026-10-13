## ADDED Requirements

### Requirement: Sin operaciones de transferencia (C3, C18)
The unit test suite SHALL fail if any module under `lib/semillas`, `lib/sumarte`, `lib/membresia`, `lib/permisos` or `lib/pasaporte` exports a symbol whose name matches `/transfer|ceder|revend|vender/i`. The failure message SHALL name the rule (C3) and the offending symbol.

#### Scenario: Estado actual
- **WHEN** se corre `pnpm test` sobre el código actual
- **THEN** el test de C3 pasa

#### Scenario: Alguien agrega una transferencia
- **WHEN** un módulo de `lib/semillas` exporta `transferirSemillas`
- **THEN** `pnpm test` falla con un mensaje que menciona C3 y `transferirSemillas`

### Requirement: El Pase no promete tierra ni rendimiento (C18)
The unit test suite SHALL fail if any name in `PASSES` or any row text in `FILAS` that the Pase Fundador includes (`lib/sumarte/datos.ts`) contains, case-insensitively, "tierra", "lote", "prioridad", "rendimiento", "retorno" or "revender". The legal term `pasefundador` in `lib/legal/terminos.ts` SHALL be excluded from this check because it names those words to deny them.

#### Scenario: Estado actual
- **WHEN** se corre `pnpm test`
- **THEN** el test de C18 pasa

#### Scenario: Una fila promete prioridad
- **WHEN** una fila del Pase dice "Prioridad para elegir lote"
- **THEN** `pnpm test` falla con un mensaje que menciona C18

### Requirement: Cada decisión tiene base normativa (C10)
The unit test suite SHALL fail if any item of `DECISIONES` (`lib/fogon/datos.ts`) has an empty `regla` or a `base` that is not a key of `TERMINOS`.

#### Scenario: Estado actual
- **WHEN** se corre `pnpm test`
- **THEN** el test de C10 pasa para todas las decisiones

### Requirement: La voz no depende del nivel del Pase (C20)
The unit test suite SHALL fail if, for any door in `PUERTAS`, `calcularPermisos` returns a different result for two people that differ only in their Pase level (`semilla`, `brote`, `raiz`).

#### Scenario: Estado actual
- **WHEN** se corre `pnpm test`
- **THEN** el test de C20 pasa para todas las puertas

#### Scenario: Alguien le da más voz a Raíz
- **WHEN** la tabla de permisos le da a Raíz un grado distinto que a Semilla en `voz-fondo-comun`
- **THEN** `pnpm test` falla con un mensaje que menciona C20 y la puerta

### Requirement: Permisos sin lotes (C21)
The unit test suite SHALL fail if any door in `PUERTAS` contains "lote" in its identifier.

#### Scenario: Estado actual
- **WHEN** se corre `pnpm test`
- **THEN** el test de C21 pasa

### Requirement: Tabla de trazabilidad
The repository SHALL include `docs/cumplimiento.md` listing every rule C1 to C23 from `Desarrollo/03 - Compliance by design` with one of: "test automático" (with the test path), "revisión manual", or "relajada en el prototipo (R14)". Every rule marked "test automático" SHALL point to a test file that exists.

#### Scenario: Ruta existente
- **WHEN** se sigue cualquier ruta de test de la tabla
- **THEN** el archivo existe en el repo
