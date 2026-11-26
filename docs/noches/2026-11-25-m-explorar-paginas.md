# Noche 2026-11-25-m — explorar-paginas
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/218 (base `spec/explorar-paginas`; la spec está en el PR #215) · **Preview:** no hay. Vercel no generó el preview de este PR.

## En una línea
Explorar quedó partido en tres páginas (Territorio, Barrio Norte y Lotes) y el botón de Inicio ahora dice "Explorar el territorio". Todo anda en las pruebas automáticas locales, pero no se pudo mirar en un navegador sobre el preview porque Vercel no lo generó.

## Qué falló o quedó bloqueado (primero)
- **Sin preview:** Vercel falla en los commits de este PR y en los PR 216, 217 y 219 desde las 10:01 UTC del 25-nov. Parece un problema del entorno de Vercel, no del código. El tester esperó 15 minutos y el preview del commit 9888072 no apareció. Por eso la prueba sobre el preview **no se hizo**.
- **El revisor no pudo comentar en el PR:** el sistema de permisos frenó `scripts/pr.sh comentar` y `scripts/pr.sh diff` en las dos vueltas. Sus hallazgos están en este reporte, no en un comentario del PR.
- **Una prueba falló en local una vez:** `e2e/congreso-en.spec.ts:80` (la página `/congreso`, que este PR no toca). Al repetir ese archivo solo pasaron las 22. Se toma como intermitencia.

## Qué quedó hecho (tareas 10/10)
- El botón principal de Inicio dice "Explorar el territorio" (en inglés, "Explore the territory") y lleva a `/explorar/territorio`.
- Tres páginas nuevas: `/explorar/territorio`, `/explorar/barrio-norte` y `/explorar/lotes`. Comparten un encabezado con las pestañas, que son enlaces entre páginas. La pestaña actual se marca con borde y negrita, no solo con color.
- `/explorar` lleva a Territorio, o a la página que corresponda según el ancla (por ejemplo `/explorar#lotes` lleva a Lotes). Conserva los parámetros.
- `/territorios/lighthouse`, `/barrios/norte` y `/lotes` redirigen a la página nueva y conservan `vista`, `fase` y `sel`.
- El menú "Explorar" lleva directo a Territorio y queda marcado como actual en las tres páginas.
- Rutas públicas, rutas traducidas, textos es/en y el listado de revisión nativa quedaron ajustados. La barra de anclas vieja se borró.
- Pruebas e2e reescritas, con accesibilidad (axe) en las tres rutas, en dos idiomas y dos temas.
- `pnpm verificar`, `pnpm build` y `openspec validate explorar-paginas --strict` en verde.
- No se tocaron `ListaLotes` ni los hooks de reservas, que son del cambio `lotes-en-la-base` (PR #214).

## Qué decidir a la mañana
1. **Avisos de estado administrativo en `/explorar/lotes` (hallazgo media).** El implementador los agregó (lighthouse-primeros y lighthouse-norte) aunque la spec no lo pedía. Lo exigen `lib/legal/vistas-con-lotes.ts` y `e2e/lotes.spec.ts`, porque antes estaban en la sección Territorio de la misma página. Acción sugerida: aceptarlos y pedirle al especificador que los sume a la spec. Si preferís otra cosa, es un bloque de pocas líneas en `app/explorar/lotes/page.tsx`.
2. **`/explorar/barrio-norte` muestra cantidades de lotes por estado sin el aviso (hallazgo media).** Tampoco lo tenía antes y ningún test lo pide. Acción sugerida: decidir si esa página también debe llevar el aviso. Si sí, sumarlo a la spec y a `VISTAS_CON_LOTES`.
3. **Orden de merge.** Conviene mergear este PR antes que `lotes-en-la-base` (PR #214). El único roce posible es un import en `app/explorar/lotes/page.tsx`. Al archivar: primero `explorar-unificado`, después este.
4. **Prueba en el preview.** Cuando Vercel vuelva a generar el preview, o si lo probás en local, mirá a mano los pasos 2, 3 y 6 del guion del PR (ver "Tester"). Hasta entonces el cambio no está aprobado del todo.
5. **Proceso (baja).** El implementador usó `sed -i` una vez en `e2e/portada.spec.ts`, contra lo que dice CLAUDE.md. El resultado se revisó con `git diff` y es correcto. Es solo para que lo sepas.

## Revisor: veredicto y hallazgos
- **Vuelta 1:** con observaciones, 7 hallazgos.
  1. [media] La tarea 4.2 estaba tildada sin correr la suite e2e completa tras los arreglos. **Corregido.** La suite completa dio 1393 pasaron, 3 omitidas, 0 fallas.
  2. [baja] El menú apuntaba a `/explorar` en vez de `/explorar/territorio`, y faltaba el e2e "tocar Explorar en el menú". **Corregido.**
  3. [baja] El e2e de portada solo verificaba la URL, no el mapa. **Corregido.** Ahora verifica el h2 Territorio y la ficha del mapa.
  4. [baja, proceso] El uso de `sed -i`. No se corrige, queda anotado (decisión 5).
  5. [baja, luego media] Avisos de estado administrativo en Lotes. Queda para Gus (decisión 1).
  6. [baja, luego media] Barrio Norte sin aviso. Queda para Gus (decisión 2).
  7. [baja] `design.md` línea 17 contradecía el §4. **Corregido.**
- **Vuelta 2:** listo para revisión humana, sin hallazgos nuevos corregibles y sin regresiones. Quedan abiertos solo el 4, el 5 y el 6.
- El revisor tampoco pudo publicar el comentario en esta vuelta (permisos).

## Tester: resultado
- **Sobre el preview: no se pudo probar.** No existe el preview (ver arriba).
- **En local (complemento, no reemplaza la prueba en el preview):** `pnpm build` verde, con una advertencia de lint que ya existía en `app/territorios/[id]/vistas/paneles.tsx:84`, ajena a este PR. `pnpm test:e2e`: 1392 pasaron, 3 omitidas, 1 falló (`e2e/congreso-en.spec.ts:80`, intermitencia como se explicó arriba).
- Los equivalentes automáticos de los pasos 1 a 6 del guion pasan en local.
- **Pendiente de mirar en un navegador real sobre el preview:**
  - Paso 2: que las pestañas queden pegadas arriba al bajar y que el héroe no parpadee.
  - Paso 3: que con sesión aparezca el panel "La obra del barrio".
  - Paso 6: que a 390 px no haya scroll horizontal.
- **Veredicto:** sin fallas atribuibles al PR en local, pero no aprobado del todo hasta probarlo en el preview.
- Reporte completo: https://github.com/netxgen-2050/lighthouse-platform/pull/218#issuecomment-7162393399

## Para la próxima noche
- Si el especificador acepta la decisión 1 (y la 2, si la tomás), actualizar la spec con los avisos de estado administrativo.
- Revisar por qué Vercel no genera previews desde las 10:01 UTC y volver a pedir la prueba sobre el preview.
- Revisar los permisos de `scripts/pr.sh comentar` y `scripts/pr.sh diff` para el revisor, que se frenaron las dos vueltas.
- Después de mergear este PR, rebasar `lotes-en-la-base` (PR #214) y chequear el import de `app/explorar/lotes/page.tsx`.
- La traducción al inglés de los textos nuevos es borrador y está en `docs/idioma/revisar-nativo.md`.

Nadie mergeó ni tocó `dev` ni `main`.
