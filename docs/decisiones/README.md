# Decisiones de arquitectura

Acá viven los ADR (registros de decisiones de arquitectura) de lighthouse-platform: por qué elegimos cada camino técnico. Cómo se escriben: skill `decisiones-adr` (`.claude/skills/decisiones-adr/SKILL.md`).

| Número | Decisión | Estado | Fecha |
|---|---|---|---|
| [ADR-001](ADR-001-modelo-de-datos-hibrido.md) | La base es Postgres híbrida (tablas + JSON) con libros de solo agregar para lo que tiene valor | Propuesta | 2026-10-14 |
| [ADR-002](ADR-002-tema-propio-del-congreso.md) | El Congreso tiene un tema visual propio, encerrado en `/congreso` y en piezas portables | Propuesta | 2026-10-14 |
| [ADR-003](ADR-003-idioma-del-congreso.md) | El Congreso es bilingüe en `/congreso/en`, con diccionarios propios y sin librería de traducciones | Propuesta | 2026-10-14 |
| [ADR-004](ADR-004-plataforma-bilingue.md) | Toda la plataforma es bilingüe por preferencia (cookie y por persona), con `?lang=` para enlazar y diccionarios propios | Propuesta | 2026-10-14 |
| [ADR-005](ADR-005-consentimiento-antes-de-la-identidad.md) | Sin consentimiento no hay identidad: se acepta antes de cualquier login, la sesión sin aceptar es anónima y el registro es un libro de solo agregar | Propuesta | 2026-10-14 |
| [ADR-006](ADR-006-rutas-publicas-que-escriben.md) | Las rutas públicas que escriben se protegen sin base de datos hasta Neon, y los reportes sin cuenta viven solo en issues de un repo privado | Propuesta | 2026-10-15 |
| [ADR-007](ADR-007-voto-abierto-o-secreto-y-padron.md) | Cada consulta del Fogón define si el voto es abierto o secreto (abierto por defecto en las de Equipo), los votos se guardan en un libro de solo agregar y vota un padrón explícito por consulta | Propuesta | 2026-10-15 |
| [ADR-008](ADR-008-previews-sin-datos-reales.md) | Los previews nunca tienen datos reales: su rama de Neon sale de una rama `previews` sin datos reales y el modo de prueba solo acepta emails `.test` (B + C; la app de Privy aparte se descartó por ADR-009) | Aceptada | 2026-10-15 |
| [ADR-009](ADR-009-identidad-privy-o-neon-auth.md) | El login pasa a Neon Auth ahora con formulario propio e identidad nuestra (`personas.id` + cuentas y billeteras vinculadas); el proveedor de billeteras para las Semillas soulbound se elige en noviembre con una prueba | Aceptada | 2026-10-15 |
| [ADR-010](ADR-010-modelos-de-tokenomics-copiados.md) | Los modelos de tokenomics los manda NS_Tokenomics: la plataforma los copia como funciones puras con versión y números de referencia | Propuesta | 2026-10-17 |
| [ADR-011](ADR-011-billeteras-safe-con-candide.md) | Cada persona tiene una cuenta Safe (con Candide) cuyo dueño es una passkey; el login sigue en Neon Auth y quien quiera trae su billetera | Propuesta | 2026-10-23 |
| [ADR-012](ADR-012-attestations-con-eas.md) | Las constancias siguen el estándar EAS: forma de EAS en nuestra base ahora, firma fuera de la cadena después y en la cadena solo cuando sume | Propuesta | 2026-10-23 |
| [ADR-013](ADR-013-unityhub-capa-de-comunidad.md) | UnityHub es la capa de comunicación y convocatoria; NetX sigue siendo la casa de la identidad, los pactos, las Semillas, las constancias, la gobernanza y la plata | Propuesta | 2026-10-23 |
| [ADR-014](ADR-014-monte-carlo-como-tabla-copiada.md) | Los resultados de Monte Carlo de NS_Tokenomics se copian como tabla versionada; los modelos determinísticos se siguen traduciendo como funciones puras (amplía ADR-010) | Propuesta | 2026-10-23 |
| [ADR-015](ADR-015-acceso-en-el-navegador-datos-en-el-servidor.md) | Las páginas se ocultan en el navegador y los datos de personas se protegen en el servidor; la Vista NetX abre su relato a toda persona con sesión | Propuesta | 2026-10-26 |
| [ADR-016](ADR-016-admin-protegido-en-el-servidor.md) | `/admin` se protege en el servidor: la sesión del super admin viaja en una cookie limitada a `/admin` y el servidor responde 403 a cualquier otra persona | Propuesta | 2026-10-26 |
| [ADR-017](ADR-017-version-de-la-politica-solo-al-ampliar.md) | La versión de la política se sube solo cuando amplía lo que se trata; quitar una categoría no pide el consentimiento de nuevo, pero queda anotado | Propuesta | 2026-10-27 |
| [ADR-020](ADR-020-semillas-base-por-tarea-puntual.md) | Un pacto puntual emite su propia constancia base de Semillas, una por tarea, cuando el holón verifica las horas, fuera de la ronda mensual y sin evaluación de pares (el 019 queda para renumerar uno de los dos ADR-018 de otras ramas) | Propuesta | 2026-10-28 |
