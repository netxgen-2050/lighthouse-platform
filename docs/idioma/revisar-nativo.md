# Inglés pendiente de revisión por un hablante nativo

Este archivo lo genera `pnpm idioma:pendientes` (no se edita a mano) a partir de `lib/idioma/revision-nativa.ts`.
Todo el inglés lo escribió un agente y está pendiente hasta que un hablante nativo lo revise.

**Cómo marcar algo como revisado:** en `lib/idioma/revision-nativa.ts`, cambiá el `estado` de la fuente a `"revisado"`
y sumá `revisadoPor` y `fecha` (AAAA-MM-DD). Después corré `pnpm idioma:pendientes`.

Fuentes pendientes: 13

| Fuente | Qué es | Textos en inglés |
|---|---|---|
| `glosario` | Glosario de términos de la plataforma (Pase Fundador, Fogón…); confirmado por Gus el 15-oct-2026, falta el nativo | 23 |
| `lib/congreso/evento-ejemplo.ts` | Página del Congreso en inglés (/congreso/en): datos de ejemplo del evento | — |
| `lib/legal/terminos.ts` | Catálogo de términos legales (⚖) con su explicación en inglés; borradores sin revisión legal | — |
| `lib/manifiestos/datos.ts` | Manifiestos de ejemplo (el del Lighthouse y siete de tribus) traducidos del español: voz de la comunidad, a revisar también con quien los escriba de verdad | — |
| `lib/sumarte/datos.ts` | Comparativa de planes de Sumarte (filas de ejemplo con su inglés) | — |
| `lib/territorios/textos.ts` | Textos del territorio con su inglés: terreno común, descripción y nombres descriptivos de los lugares, bienes comunes | — |
| `lib/tribus/datos.ts` | Datos de ejemplo de las 12 tribus con su inglés (foco, qué tiene, qué busca, ritual, forma jurídica…) y la declaración de cada tribu, traducida del español | — |
| `textos/comunes` | Textos que se repiten en todas las zonas (cargando, cancelar, sin dato, notas de traducción…) | 15 |
| `textos/marco` | Marco de la plataforma: rail, barra superior, menú de la persona, campanita, pie, 404 y pantallas de la puerta | 53 |
| `textos/portada` | Portada: título, bajada, los tres caminos y la cantidad de barrios | 17 |
| `textos/sumarte` | Sumarte: planes, niveles del pase (Seed, Sprout, Root, a confirmar), inversores, avisos de nivel, formulario de pedido de contacto y panel Entrar como… | 143 |
| `textos/territorio` | Territorio: vitrina, leyenda y controles del mapa, ficha lateral y marcadores | 60 |
| `textos/tribus` | Tribus: listado, ficha, botones de membresía, interfaz del manifiesto y postulación de una comunidad (formulario, requisitos y errores) | 140 |
