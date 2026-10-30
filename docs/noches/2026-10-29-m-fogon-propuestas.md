# Noche 2026-10-29 — fogon-propuestas
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/143 · **Preview:** no hay (el deploy de Vercel falla)

## En una línea
Salió la noche 1 de 4 del cambio: la página de solo lectura de las propuestas del Fogón, con sus reglas y permisos. Quedó bloqueada la prueba contra el preview porque Vercel no despliega, y hay cinco decisiones tuyas pendientes.

## Qué falló o quedó trabado (primero)
- **Sin preview de Vercel.** El deploy falla en los commits de este PR y también en el PR 142; en `dev` pasa. La API solo dice "Deployment has failed". El log está en https://vercel.com/net-xg-en/lighthouse-platform/6o7RRRSdgNf46rUKtf8jLhvbHjua (o `npx vercel inspect dpl_6o7RRRSdgNf46rUKtf8jLhvbHjua --logs`). Nadie de los agentes pudo verlo: tenés que abrirlo vos.
- **Tester: BLOQUEADO.** Sin URL de preview no se pudo cumplir la tarea 3.2. En local (build de producción) pasaron 1001 pruebas e2e y fallaron 2, ninguna por este PR (detalle más abajo).
- **Permisos.** En la primera vuelta el revisor no pudo publicar su comentario porque se rechazó `pr.sh comentar` y `pr.sh diff`. En la segunda vuelta sí pudo.
- **PR en "borrador" solo de nombre.** `scripts/pr.sh` no permite abrir borradores de GitHub; se tituló "BORRADOR (noche 1 de 4)". No lo mergees.
- Un `pnpm build` del orquestador chocó con la carpeta `.next` de las pruebas del implementador. Error propio, sin consecuencias.
- El revisor no corrió e2e: su build local falló al bajar las fuentes de Google. Al tester le pasó lo mismo en el primer intento; el segundo anduvo.

## Qué quedó hecho (tareas 13 hechas, 19 pendientes)
Grupos 1 a 3 de `tasks.md` (tareas 1.1 a 2.6 y 3.1 marcadas; falta 3.2, confirmar el preview).
- Modelo, reglas, permisos, fases, principios y ejemplos de las propuestas, más el estado derivado (`derivarEstado`, con el reloj inyectado), el nivel y la discusión.
- Una prueba por regla (matriz de 105 celdas).
- Textos en español e inglés, y diez términos legales con ⚖ nuevos, todos marcados como borrador.
- Página `/fogon/propuestas/[id]` de solo lectura: ficha, fases, resultado, urgencia, ámbito del consejo, participación y acuses, discusión con concerns, selector de nivel, acciones, tabla de permisos y vista sin cuenta.
- Botón "Abrir la propuesta" en el Fogón y en la lente Decisiones.
- Se actualizaron `lib/idioma/revision-nativa.ts`, las rutas y `docs/idioma/revisar-nativo.md`.
- Estado de calidad: `pnpm verificar` en verde (2044 tests), 31 e2e de fogon-propuestas y los de accesibilidad en verde. Después de la última corrección no se corrió `pnpm build`; el tester sí lo hizo en local sobre el estado final.

Faltan las noches 2, 3 y 4 (grupos 4 a 8): registros en el navegador, formularios, bloqueo, acuse, urgencia con botones, Hifa, Guardián y mecanismos.

## Qué decidir a la mañana
1. **(Alta) Las fechas de los ejemplos vs. el reloj real.** La página usa la hora real y los ejemplos tienen fechas fijas. Desde el 1-nov la huerta queda "Pausada: no se alcanzó la participación mínima"; desde el 3-nov la bomba deja de estar en "Resolver concerns"; el 5-nov vence la cisterna. Los e2e (que no fijan el reloj) se romperían antes de la noche 4. Opciones: (a) fechas de ejemplo relativas a hoy, (b) hora fija para los ejemplos, (c) `page.clock` solo en los e2e (no arregla el preview). Sugerencia: (a) o (b), que también arreglan lo que ve el equipo en el preview.
2. **(Media, #5) El escenario "Leer la discusión" choca con la matriz de permisos.** La spec (`spec.md:72-74`) dice que se lee la discusión del consejo, pero la matriz (`permisos.ts:29`) deja al nivel inicial "de la red" sin ese permiso. El implementador cambió el e2e para elegir "del ámbito". Decidir: reescribir el escenario como "del ámbito" (sugerido, es lo que ya hace el código) o dejar que la red lea las discusiones del consejo.
3. **(Media, #10) Participación en decisiones del común.** La participación solo cuenta niveles del ámbito y afectada. En la regalía, quienes escriben quedan "del común", se muestra 0 de 20, nunca llega al quórum y el común no puede firmar acuse ni evaluar. Decidir si en una decisión del común ese nivel cuenta como del ámbito. Sugerencia: sí.
4. **(Baja, #11) Las tribus suben al consejo con una regla fija** (`nivelDeArriba`), no con `caminoHasta` como dice el design §4c. Coincide con la spec y la tarea 1.1, y en la holarquía las tribus cuelgan del común. Sugerencia: aceptarlo y anotarlo en el design.
5. **(Baja, #12) Interpretaciones del implementador.** (a) `agrupar` solo vale con rol de proceso: más estricto que el design, igual a la spec; aceptar. (b) El cierre por consenso exige quórum y ningún concern abierto, si no queda "sin consenso": coincide con la spec; aceptar. (c) `inicio` es el día en que empiezan las preguntas o el plazo para objetar. Si quien facilita adelanta la fase, los vencimientos no se mueven (la bomba pasó a "resolver" el 29-oct y la página sigue diciendo que concerns vence el 31-oct). Confirmar si eso es lo que querés.
6. **Abrir el log de Vercel** (link arriba) y ver por qué falla el deploy. Mientras no se arregle, no hay preview y la tarea 3.2 sigue abierta.
7. **Las dos fallas de e2e** (abajo): decidir si se abre un cambio aparte para la de idioma.

## Revisor: veredicto y hallazgos
Veredicto en las dos vueltas: con observaciones (⚠️), nada bloqueante.
- **1ª vuelta, 12 hallazgos.** Los 8 corregibles (migas y pestaña con título en Visita; discusión visible sin permiso de leerla; condición "solo común" que no se escribía; falta del texto "reabrir solo con nuevo consenso"; falta de la fila de acuerdo/norma; entradas sin relación con la decisión; principios sin el aviso "borrador, a ratificar por el común"; registro de cierre aceptado en cualquier fase) se corrigieron en el commit 0042166. Los otros 4 son las decisiones 1, 3, 4 y 5 de arriba. En esa corrección, quien mira "de la red" en el consejo dejó de ver la discusión.
- **2ª vuelta.** Verificó que las 8 correcciones están bien hechas. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/143#issuecomment-6507163892. Encontró 4 detalles bajos y la decisión 2. Los 4 detalles se corrigieron: Mecanismos ya no sugiere a niveles sin permiso de leer la discusión; texto de reabrir con "a través de una propuesta nueva" en es y en; etiquetas de relaciones por nivel; el inglés "as in the circle" no gramatical; el e2e de propuesta cerrada ahora elige "quien presenta" y comprueba que no aparece "Editar la propuesta" (más dos tests nuevos).

## Tester: resultado
**BLOQUEADO.** `scripts/preview-url.sh` terminó con "El deploy de Vercel falló para 54b0b26". Reporte: https://github.com/netxgen-2050/lighthouse-platform/pull/143#issuecomment-6507427093.
En local (build de producción y servidor propio de Playwright): 1001 pasaron, 2 fallaron; `e2e/fogon-propuestas.spec.ts` 31 de 31.
- `e2e/idioma.spec.ts:86`: el enlace del selector de idioma da `/tribus?lang=en` en lugar de `/tribus?sel=valle&lang=en`. **No es de este PR:** falla igual en `origin/dev` (el commit b0b8cc0 de `dev` agregó la relectura del enlace) y el PR no toca el selector ni ese spec. Hay que arreglarlo en un cambio aparte.
- `e2e/pacto-puntual.spec.ts:385`: falla de accesibilidad "document-title" en `/pactos`, intermitente (pasó al repetir). No tiene relación con la página nueva, que sí define título.
Como el implementador no cambió código después, no se repitió al tester.

## Para la próxima noche
- Resolver antes la decisión 1 (fechas de ejemplo): si no, los e2e se rompen en cuanto cambie el reloj.
- Arreglar el deploy de Vercel y recién entonces cerrar la tarea 3.2 con el preview.
- Noche 2: grupo 4 en adelante (registros en el navegador y formularios). Noches 3 y 4: bloqueo, acuse, urgencia con botones, Hifa, Guardián y mecanismos.
- Cambio aparte para `idioma.spec.ts:86` (la falla ya está en `dev`).
- Si aceptás las decisiones 3 a 5, anotarlas en el design y en la spec para que las noches siguientes no las reabran.
