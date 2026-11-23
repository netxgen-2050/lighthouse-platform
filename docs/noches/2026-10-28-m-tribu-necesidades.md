# Noche 2026-10-28-m — tribu-necesidades
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/131 (base `agente/pactos-dos-partes`, rama `agente/tribu-necesidades`) · **Preview:** no disponible (el deploy de Vercel falló)

## En una línea
El código está hecho y pasa todas las pruebas que corrimos en local, pero el preview de Vercel no se pudo levantar, el tester marcó falla por 2 pruebas que ya fallaban antes de este PR, y hay 3 decisiones tuyas pendientes.

## Qué falló o está trabado (leer primero)
- **Preview de Vercel caído.** Falla en 6e3632c y 01c95f0, y también en la base (41d96a2) y en 532017c. Pasó de "pendiente" a "falló" en unos 2 segundos, demasiado rápido para un build real. No pudimos leer el log (`npx vercel inspect … --logs` pide aprobación y la API REST solo da el estado). Sospecha, sin confirmar: configuración de Vercel o un problema de la base. Deploy: https://vercel.com/net-xg-en/lighthouse-platform/2W4YwhQ8HQp7QBHRpiT5ZzZgpWDC
- **Tester: resultado "falla".** Nadie recorrió el preview. Todo se probó en local.
- **Permisos.** Revisor e implementador no pudieron correr varios comandos (`scripts/pr.sh diff`, `comentar` en las primeras pasadas, `npx vercel inspect`, `git ls-remote`).
- **Comentarios del PR incompletos.** Los hallazgos de la 1ª y 2ª revisión no están como comentarios; solo el de la 3ª pasada (https://github.com/netxgen-2050/lighthouse-platform/pull/131#issuecomment-6483429711) y el del tester (https://github.com/netxgen-2050/lighthouse-platform/pull/131#issuecomment-6483513778). Por eso los hallazgos 1 a 3 están completos más abajo.

## Qué quedó hecho (tareas 8/8)
- Las necesidades de cada tribu se muestran como tareas, con ficha, holón, aval (para las de diseño), máximo por persona y ancla `#necesidad-<id>` (`lib/tribus/necesidades.ts`, `app/tribus/[id]/necesidades.tsx`, `abrir-por-ancla.tsx`).
- 12 necesidades de ejemplo en español e inglés, y un test que exige una necesidad por cada etiqueta de `busca`.
- Decisión 3: máximo total por necesidad (`topeTotal`, `repartirConTopeTotal`): primero se respeta el máximo por persona y después se reparte lo que queda del total por orden de verificación. Ejemplos: valle-solar 20 h, agua-plomeria 150 Semillas, monte-bioconstruccion 40 h.
- Decisión 4: `administradorDe` devuelve Hifa experimental, con super admin de respaldo para círculos transversales. La ficha de `valle-eventos` lo dice.
- Decisión 5: se usa "Semillas" y "Semillas pendientes"; un test prohíbe "brotes" y "germinar".
- Decisiones 1 y 2: solo quedaron en el delta de spec de `pactos-horas-variables` (ese cambio no está implementado, no hay código).
- Corrección tras la 1ª revisión (6e3632c): ancla mal codificada ya no rompe la ficha (try/catch en `lib/tribus/ancla.ts`, con test), 4 e2e nuevos, test de teclado con Tab real, test de nombres que también lee `lib/idioma/textos/tribus.ts`, comentario y test del orden en `repartirConTopeTotal`.
- Corrección tras la 2ª revisión (01c95f0): `pactos-horas-variables/design.md` y tarea 1.3 ya dicen que los meses confirmados después del mínimo quedan `recibidas`.
- Inglés nuevo para revisión nativa: `lib/idioma/revision-nativa.ts` y `docs/idioma/revisar-nativo.md`.
- `pnpm verificar` (1704 tests) y `pnpm build` en verde. 14 de 14 e2e de `tribus-necesidades`.
- Se ajustó una aserción en `e2e/idioma-tribus-territorio.spec.ts` ("Solar energy" ahora está dentro del resumen plegable).
- La base `agente/pactos-dos-partes` no tenía los cambios de `openspec/`, por eso se hizo merge de `origin/dev` (solo specs y ADRs, sin código).

## Qué decidir a la mañana
1. **Regla de reparto del máximo total (media).** La spec la fija "por orden de verificación"; el design dice "a confirmar". Con ese orden, quien verifica último puede quedar en 0 (ejemplo: 12/10/6 h con tope 20 da 10/10/0). Acción sugerida: elegir entre orden de verificación (lo implementado) o prorrateo proporcional; si es prorrateo, hay que cambiar spec, design y `repartirConTopeTotal`.
2. **Reglas de pactos variables sin scenario (media).** "El círculo las valida" es ambiguo: en esa spec el pacto es con la comunidad, que confirma los meses. Además el texto legal borrador `compromisominimo` dice que las pendientes se reciben, sin avisar que pueden perderse al pasar a fijas. `pactos-horas-variables/design.md:40` todavía lo deja como pregunta. Acción sugerida: decidir quién valida, agregar los scenarios y completar el aviso en el texto legal (sigue como borrador).
3. **PR con ~2.000 líneas ajenas (media).** El merge de `dev` (f3b2c75) trae specs de evaluacion-pares, fogon-ajustes, pacto-puntual, pacto-puntual-verificacion y pactos-horas-variables, y ADR-019 a 021. Además el commit 532017c edita la spec de otro cambio. Acción sugerida: rebasar o cambiar la base del PR para que solo muestre lo propio, o aceptar que va así. Ojo que el cambio de base depende de cuándo entre `pactos-dos-partes`.
4. **Preview de Vercel.** Acción sugerida: mirar el log del deploy en el panel de Vercel; falla también en la base, así que probablemente no es de este PR.
5. **2 fallos de Playwright que no son de este PR** (ver Tester): decidir quién los arregla (¿`pactos-dos-partes`?).

## Revisor: veredicto y hallazgos
Veredicto final (3ª pasada): **con observaciones**, 0 altas, 0 medias nuevas, 0 bajas nuevas. `pnpm verificar` y `pnpm build` en verde.
- Hallazgos 1 a 3: siguen abiertos, esperan tu decisión (arriba).
- Hallazgo 4 (proposal de pactos-horas-variables contradictoria): resuelto en la 2ª vuelta, sin regresiones.
- Hallazgos 5 a 7 (ancla mal codificada, tests e2e y unitarios faltantes, comentario y test del orden de verificación): resueltos.
- Limitación conocida: el test de teclado no revisa el nombre del círculo de Plomería, solo la etiqueta "Círculo:" (no se encontró dónde se define `agua-0`).

## Tester: resultado
**Falla.** No hubo preview para probar, así que todo se corrió en local.
- Playwright local: 918 pasaron, 2 fallaron (repetidos):
  - `e2e/idioma-pendientes.spec.ts:105`: esperaba 2 elementos con `/did not accept your pact: Not for now/` y encontró 0.
  - `e2e/idioma.spec.ts:86`: esperaba el href `/tribus?sel=valle&lang=en` y recibió `/tribus?lang=en`.
- `e2e/tribus-necesidades.spec.ts`: 14/14.
- El implementador comprobó que esos 2 fallos **también ocurren en la base** `origin/agente/pactos-dos-partes` (41d96a2): no son regresión de este PR. Pista sin verificar: el selector de idioma no actualiza el href cuando la query cambia con `replaceState`. No se re-corrió el tester porque no hubo cambios de código.
- No hubo recorrido manual contra el preview.

## Para la próxima noche
- Resolver las decisiones 1 a 3 y actualizar spec, design y código según corresponda.
- Arreglar el preview de Vercel (o confirmar que es de configuración) para poder hacer el recorrido manual del tester.
- Arreglar los 2 fallos de Playwright de `pactos-dos-partes`.
- Implementar `pactos-horas-variables` (hoy solo spec) y el aviso legal de `compromisominimo`.
- Dar permiso a revisor e implementador para `scripts/pr.sh diff` y `comentar`, así los hallazgos quedan siempre en el PR.
- Revisión nativa del inglés nuevo (`docs/idioma/revisar-nativo.md`).
