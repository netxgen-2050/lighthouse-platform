# Decisiones de arquitectura

Acá viven los ADR (registros de decisiones de arquitectura) de lighthouse-platform: por qué elegimos cada camino técnico. Cómo se escriben: skill `decisiones-adr` (`.claude/skills/decisiones-adr/SKILL.md`).

| Número | Decisión | Estado | Fecha |
|---|---|---|---|
| [ADR-001](ADR-001-modelo-de-datos-hibrido.md) | La base es Postgres híbrida (tablas + JSON) con libros de solo agregar para lo que tiene valor | Propuesta | 2026-10-14 |
| [ADR-002](ADR-002-tema-propio-del-congreso.md) | El Congreso tiene un tema visual propio, encerrado en `/congreso` y en piezas portables | Propuesta | 2026-10-14 |
| [ADR-003](ADR-003-idioma-del-congreso.md) | El Congreso es bilingüe en `/congreso/en`, con diccionarios propios y sin librería de traducciones | Propuesta | 2026-10-14 |
| [ADR-004](ADR-004-rutas-publicas-que-escriben.md) | Las rutas públicas que escriben se protegen sin base de datos hasta Neon, y los reportes sin cuenta viven solo en issues de un repo privado | Propuesta | 2026-10-15 |
