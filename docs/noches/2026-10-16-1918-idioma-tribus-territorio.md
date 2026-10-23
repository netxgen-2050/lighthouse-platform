# Noche 2026-10-16-1918 — idioma-tribus-territorio
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/92 · **Preview:** no hay (el deploy de Vercel falló)

## En una línea
Las tribus, el manifiesto, la postulación y el territorio ya se ven en inglés y el español quedó igual, pero el PR no tiene preview (Vercel falla) y hay dos temas medios que tenés que decidir vos.

## Primero, lo que falló o quedó trabado
- **Vercel no despliega.** El deploy del último commit (408bfe0) figura en error. La rama base (`idioma-portada-sumarte`) ya fallaba antes, así que no parece culpa de este cambio: el build local pasa. Hay que mirar los logs del deploy en Vercel. Por eso todo se probó solo en local, nada contra un preview.
- **La primera pasada del revisor no pudo comentar en el PR.** `scripts/pr.sh` le pidió una aprobación que no se concedió. Sus hallazgos están más abajo; la segunda pasada sí quedó publicada.
- El tester no recorrió el guion a mano en un navegador: lo dio por cubierto con los 22 escenarios automáticos.

## Qué quedó hecho (tareas 8/8)
Todas las tareas de `openspec/changes/idioma-tribus-territorio/tasks.md` están marcadas.
- Datos de ejemplo con inglés: 12 tribus, la declaración de cada una (con la nota de que el original es en español), 8 manifiestos, textos y nombres de lugares del territorio, ubicación y bienes comunes.
- Páginas en inglés con los mismos comportamientos que en español: lista de tribus, ficha, acciones de membresía, manifiesto, postulación y territorio (vitrina, leyenda, lista, ficha lateral, marcadores del mapa y página 404).
- El mapa se reconstruye al cambiar de idioma. Los nombres propios (tribus, barrios, Soluna, Temazcal, etc.) no se traducen.
- El manifiesto y la declaración en inglés llevan la nota "Translated from Spanish".
- El estado administrativo (Ord. 173) sigue en español, marcado y con aviso, hasta que llegue `idioma-legal`.
- Las cinco rutas se sumaron a la lista de rutas traducidas. Hay un e2e propio de 22 escenarios y pruebas de accesibilidad (axe) en inglés.
- Sumarte, Pactos, Semillas y Vista NetX no cambian.

## Qué decidir a la mañana
1. **Nombre del barrio en inglés (severidad media).** Hoy "Barrio 3" sale como "Neighborhood 3" (`lib/idioma/textos/tribus.ts:195`, `territorio.ts:104`), pero la propuesta dice que los nombres de barrios no se traducen nunca. Acción sugerida: decidir si se deja "Barrio 3" y se corrige el código, o si se acepta "Neighborhood 3" y se cambia la propuesta.
2. **Frases con peso legal en inglés fuera del catálogo con el símbolo ⚖ (severidad media).** Por ejemplo "NetX acts as an agency…", "license of use", "adherent to the project of", "Adhere to the Lighthouse Coexistence Pact…" (`territorio.ts:126`, `tribus.ts:224/247/299`). No están en `lib/legal/terminos.ts` ni marcadas como borrador. Acción sugerida: moverlas al catálogo con `borrador: true`, o dejarlas para `idioma-legal` y anotarlo.
3. **`/congreso/en` quedó desactualizado.** El enlace "Find my tribe (in Spanish)" lleva a `/tribus`, que ahora ya está en inglés. Es de `congreso-bilingue`. Acción sugerida: un seguimiento chico para corregir ese texto.
4. **`components/sello-tribu.tsx` sin tocar.** La spec pedía nombre accesible, pero el sello es decorativo y el nombre ya está en el texto de al lado. Acción sugerida: confirmar que está bien así.
5. **Traducciones a confirmar:** "Sign on" por "Adherir", "Neighborhood" por "Barrio", "Plot" por "Finca", "common pool" por "pozo común", "bioquincho (shared gathering hall)". "Lote 7" queda en español sin traducir.
6. **Vercel:** revisar por qué falla el deploy (afecta a este PR y a su base).

## Revisor: veredicto y hallazgos
Veredicto final: **con observaciones** (segunda pasada, comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/92#issuecomment-6225014321).
- Primera pasada: 5 hallazgos bajos. Tres eran corregibles y se corrigieron en el commit 408bfe0:
  - El título "Common land" no decía "del Lighthouse": ahora sale "Common land of the Lighthouse".
  - Se marcaba "no traducir" en todos los lugares, no solo en nombres propios: ahora solo en nombres propios.
  - No había test que detectara si el español de los territorios cambiaba: ahora lo hay.
- Segunda pasada: las tres correcciones están bien, sin regresiones. Quedan solo los puntos 1 y 2 de arriba, que el revisor dejó como severidad media a la espera de tu decisión.
- Cobertura de la spec: los cinco requisitos están cubiertos (tribus en inglés, datos traducidos, voz de la comunidad con su idioma original, páginas revisadas automáticamente, español sin cambios).
- Nota: en la primera pasada el revisor no verificó que el español siguiera igual (sin e2e ni build); eso lo cubrió después el tester con la suite completa.

## Tester: resultado
Pasa, **pero solo en local** (https://github.com/netxgen-2050/lighthouse-platform/pull/92#issuecomment-6225061733).
- Suite completa de Playwright: 695 de 695, sin fallas (incluye tribus, territorio, postulación, membresía, accesibilidad y el e2e nuevo).
- Guion manual de 7 pasos: los 7 marcados como bien, pero según los escenarios automáticos, no recorridos a mano.
- No probado: el preview de Vercel; los textos exactos del guion uno por uno (por ejemplo "USD 310,000 of USD 480,000" o "Plot 502: 9,130 m²"); la calidad del inglés.

## Para la próxima noche
- Arreglar o entender el fallo de Vercel antes de seguir apilando PRs sobre esta cadena de ramas.
- Revisión nativa del inglés, sobre todo los manifiestos, que son la voz de las comunidades (los diccionarios nuevos `tribus.ts` y `territorio.ts` están en `docs/idioma/revisar-nativo.md`).
- Seguimiento de `/congreso/en`.
- `idioma-legal`: pasar a inglés los ⚖ de estas páginas, el estado administrativo (Ord. 173) y los eventos de la bitácora (adherir, postular), que siguen en español.
- Una vez decidido el punto 1 o 2, aplicar la corrección en el código.
