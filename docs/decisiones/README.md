# Decisiones de arquitectura

Acá viven los ADR (registros de decisiones de arquitectura) de lighthouse-platform: por qué elegimos cada camino técnico. Cómo se escriben: skill `decisiones-adr` (`.claude/skills/decisiones-adr/SKILL.md`).

| Número | Decisión | Estado | Fecha |
|---|---|---|---|
| [ADR-001](ADR-001-modelo-de-datos-hibrido.md) | La base es Postgres híbrida (tablas + JSON) con libros de solo agregar para lo que tiene valor | Propuesta | 2026-10-14 |
| [ADR-002](ADR-002-tema-propio-del-congreso.md) | El Congreso tiene un tema visual propio, encerrado en `/congreso` y en piezas portables | Propuesta | 2026-10-14 |
| [ADR-003](ADR-003-idioma-del-congreso.md) | El Congreso es bilingüe en `/congreso/en`, con diccionarios propios y sin librería de traducciones | Propuesta | 2026-10-14 |
| [ADR-004](ADR-004-plataforma-bilingue.md) | Toda la plataforma es bilingüe por preferencia (cookie y por persona), con `?lang=` para enlazar y diccionarios propios | Propuesta | 2026-10-14 |
| [ADR-005](ADR-005-consentimiento-antes-de-la-identidad.md) | Sin consentimiento no hay identidad: se acepta antes de crear la cuenta (solo los emails nuevos marcan las casillas), la sesión sin aceptar es anónima y el registro es un libro de solo agregar | Propuesta | 2026-10-14 (act. 2026-10-16) |
| [ADR-006](ADR-006-rutas-publicas-que-escriben.md) | Las rutas públicas que escriben se protegen sin base de datos hasta Neon, y los reportes sin cuenta viven solo en issues de un repo privado | Propuesta | 2026-10-15 |
| [ADR-007](ADR-007-voto-abierto-o-secreto-y-padron.md) | Cada consulta del Fogón define si el voto es abierto o secreto (abierto por defecto en las de Equipo), los votos se guardan en un libro de solo agregar y vota un padrón explícito por consulta | Propuesta | 2026-10-15 |
| [ADR-008](ADR-008-previews-sin-datos-reales.md) | Los previews nunca tienen datos reales: su rama de Neon sale de una rama `previews` sin datos reales y el modo de prueba solo acepta emails `.test` (B + C; la app de Privy aparte se descartó por ADR-009) | Aceptada | 2026-10-15 |
| [ADR-009](ADR-009-identidad-privy-o-neon-auth.md) | El login pasa a Neon Auth ahora con formulario propio e identidad nuestra (`personas.id` + cuentas y billeteras vinculadas); el proveedor de billeteras para las Semillas soulbound se elige en noviembre con una prueba | Aceptada | 2026-10-15 |
