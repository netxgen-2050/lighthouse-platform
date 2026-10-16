# Inglés pendiente de revisión por un hablante nativo

Este archivo lo genera `pnpm idioma:pendientes` (no se edita a mano) a partir de `lib/idioma/revision-nativa.ts`.
Todo el inglés lo escribió un agente y está pendiente hasta que un hablante nativo lo revise.

**Cómo marcar algo como revisado:** en `lib/idioma/revision-nativa.ts`, cambiá el `estado` de la fuente a `"revisado"`
y sumá `revisadoPor` y `fecha` (AAAA-MM-DD). Después corré `pnpm idioma:pendientes`.

Fuentes pendientes: 3

| Fuente | Qué es | Textos en inglés |
|---|---|---|
| `glosario` | Glosario de términos de la plataforma (Pase Fundador, Fogón…); confirmado por Gus el 15-oct-2026, falta el nativo | 23 |
| `textos/comunes` | Textos que se repiten en todas las zonas (cargando, cancelar, sin dato, notas de traducción…) | 10 |
| `textos/marco` | Marco de la plataforma: rail, barra superior, menú de la persona, campanita, pie, 404 y pantallas de la puerta | 53 |
