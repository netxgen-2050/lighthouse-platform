# Noche 2026-10-28 — pactos-horas-variables
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/135 (base `agente/pacto-puntual-verificacion`) · **Preview:** no hay (el deploy de Vercel falla, ver más abajo)

## En una línea
El código del cambio quedó hecho, revisado y probado en local, pero no se pudo ver en el preview porque Vercel falla, y hay una decisión tuya (P.1) que frena una parte del flujo.

## Bloqueos y pendientes de Gus (primero)
1. **Vercel falla y nadie pudo leer los logs.** El deploy del último commit (`dpl_Agm1kKBAbg7QzDD7EV6a5NNNtExN`) falló. La base `agente/pacto-puntual-verificacion` también falla; `dev` está bien. Por eso el tester no pudo probar en el preview. El código no lo explica (el build local pasa). `npx vercel inspect --logs` pide aprobación, así que ningún agente pudo correrlo. **Acción:** correrlo vos o alguien con acceso y pasar el error.
2. **P.1 abierto: qué pasa con las Semillas pendientes cuando un pacto pasa de variable a fija.** La spec se contradice: dice que valida "el círculo", pero el pacto variable es con la tribu o con el Lighthouse, no con un círculo. El flujo de validación **no se construyó**. Hoy, por una solución provisoria, esas Semillas quedan aparte, no suman y se muestra un aviso. **Acción:** definir quién valida, cómo se registra y cuándo se pierden.
3. **Meses confirmados que se procesan después del cambio a fija.** Si la tribu confirmó un mes cuando el pacto todavía era variable, pero se procesa ya con el pacto fijo, ese mes queda "esperando confirmación" para siempre. **Acción:** que P.1 defina qué pasa con esos meses.
4. **H3 del revisor: escenario "Perfil" de la spec.** Pide mostrar "entre 0 y 30 h/mes" en `/perfil`, pero el perfil no muestra horas. **Acción:** sacar el escenario de la spec o aprobar agregar esa línea (más alcance).
5. **Decisiones 3 y 4 del 28-oct** (máximo total por tarea; Hifa y círculos transversales). Ya existían en `pacto-puntual-verificacion` y aplican solo a tareas puntuales, no al pacto recurrente. Se anotó en la spec. **Acción:** confirmar que está bien así.
6. **Falla ajena al PR: `e2e/idioma.spec.ts:86`.** El selector de idioma pierde `?sel=valle` (llega `/tribus?lang=en`). El implementador dice que ya falla en la base, pero el tester no lo comprobó contra la base. **Acción:** investigar (puede ser un problema de tiempos).
7. **Test desactualizado `e2e/idioma-pendientes.spec.ts:105`.** Viene de la base (el commit b4541d1 de pactos-dos-partes cambió la frase sin actualizar el test). Se corrigió en este PR. **Acción:** aplicar el mismo arreglo en la base para evitar un conflicto al juntar.
8. **Alinear documentos del cambio.** `proposal.md`, `design.md` y `tasks.md` siguen diciendo que valida "el círculo" (queda como registro de la decisión del 28-oct). Hay que corregirlos cuando se resuelva P.1.

## Qué quedó hecho (tareas 9/10)
Queda una tarea sin marcar en `tasks.md` (la de la validación pendiente, ligada a P.1; confirmalo en el archivo).
- Pacto variable: se elige horas fijas o variables, con rango de 0 a 80 h por mes en pasos de 2. Mínimos: Valle Solar 3, Agua Clara 2, Taller Común 1. Monte Nuevo y Barda no ofrecen pactos variables.
- Declaración mensual de horas y confirmación de la comunidad en `/pactos/responder`.
- Solo lo confirmado genera Semillas. Antes de llegar al mínimo se muestran como "Semillas pendientes" y no suman; al cumplirlo pasan a "Semillas". Un mes de 0 h no cuenta.
- Los meses confirmados después de llegar al mínimo se reciben al confirmarse (con tests).
- El término legal ⚖ `compromisominimo`, marcado como borrador.
- Spec, design, proposal y tasks actualizados con las decisiones del 28-oct.
- Nombres en pantalla: solo "Semillas pendientes" y "Semillas".

## Revisor: veredicto y hallazgos
**Veredicto final: listo para revisión humana, sin hallazgos nuevos** (comentarios en el PR: issuecomment-6488454991 y issuecomment-6488709223). Se agotaron las dos vueltas de corrección.
- Vuelta 1: 7 hallazgos (0 altos, 2 medios, 5 bajos). Se corrigieron H1 (que se recibieran pendientes sin validación tras pasar a fija), H2 (aviso neutro, ya no promete "el círculo"), H4 (etiqueta "proyección de 3 meses"), H5 (nombres "Semillas recibidas"/"Your Semillas"), H6 (campo de horas al salir) y H7 (falta de e2e del pase a fija). H3 quedó para vos.
- Vuelta 2: 4 hallazgos nuevos (1 medio: la etiqueta "se suma lo confirmado" sugería que sumaban las pendientes; 3 bajos: la spec línea 84, un e2e que no probaba el mínimo y falta de prueba de que las ya recibidas siguen sumando). Todos corregidos en el commit c9209f3.
- Vuelta 3: sin hallazgos. Única observación, no bloqueante: el punto 8 de arriba.
- El revisor consideró razonables los criterios del implementador (P.1 abierto; decisiones 3 y 4 fuera de alcance).

## Tester: resultado
**Pasó con una falla ajena al PR, y sin preview** (comentario issuecomment-6489348907).
- Preview: no se pudo probar porque Vercel falla (punto 1).
- Local (`PORT=3117 pnpm test:e2e`): 965 pruebas pasaron y 1 falló (`idioma.spec.ts:86`, punto 6). Los e2e del cambio pasaron 11/11, con axe.
- En la primera prueba había 2 fallas; una era un test desactualizado heredado de la base (punto 7), ya corregido.
- **No se verificó a mano:** el guion manual no se recorrió paso a paso; falta mirar la revisión visual y el ⚖ con Tab y Escape.

## Para la próxima noche
- Cuando decidas P.1: construir la validación de Semillas pendientes al pasar a fija, resolver qué pasa con los meses confirmados tardíos y alinear proposal/design/tasks.
- Resolver H3 (Perfil) según lo que decidas.
- Con Vercel arreglado: repetir la prueba en el preview, incluida la revisión visual y el ⚖ con teclado.
- Aplicar en la base el arreglo de `idioma-pendientes.spec.ts:105` e investigar `idioma.spec.ts:86`.
- Otros bloqueos de permisos de la noche: `git ls-remote`, `scripts/pr.sh diff` y `scripts/pr.sh comentar` pidieron aprobación en algunos subagentes, y `npx vercel inspect --logs` quedó bloqueado. Conviene revisar `.claude/settings.json`.
