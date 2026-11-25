# Noche 2026-10-27-m — idioma-fogon-mercado
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/115 · **Preview:** no hay (el deploy de Vercel falló)

Esta fue una vuelta de corrección: se integró `dev` en la rama, se arreglaron los tests que el merge rompió y se volvió a revisar y probar.

## Lo primero: qué falló y qué decidir

**Bloqueo: el deploy de Vercel falla para el último commit (4f3a33c).**
- No hay preview, así que nadie pudo recorrer a mano el guion de prueba (pasos 1 a 8 del PR).
- En local todo pasa: el build de producción compila y los tests e2e dan 821 pasaron y 0 fallaron.
- La causa no se vio. Sospecha sin verificar: en Vercel corre `tsx scripts/migrar.ts` antes de `next build`, y podría fallar por variables de entorno. El revisor ya había avisado que no sale de ninguna línea del cambio.
- Acción sugerida: abrir el log del deploy en https://vercel.com/net-xg-en/lighthouse-platform/88wwNS6dff1gTu1FYjniWR6jSAo6 y ver el error real. Hasta eso, el PR no debería entrar a `dev`.

**Decisión 6 (media): el campo "para quién es" no existe.**
- La spec pide validar ese campo en el formulario de Compromisos, pero ya no existe, y el test `e2e/compromisos.spec.ts:35` exige que no esté. Hoy se valida la descripción vacía.
- Acción sugerida: ajustar la spec para que el escenario hable de la descripción vacía. No hay que tocar código.

**Decisión 7 (media): lo traducido de Canales no se ve en pantalla.**
- `/canales` solo redirige a `/pasaporte`. El texto "qué plan le falta" (`abreCon`) está traducido y con test unitario, pero no aparece en ninguna pantalla.
- Acción sugerida: o se ajusta la spec (alcance = solo el diccionario) o se abre otro cambio para mostrarlo.

## En una línea
El Fogón, Compromisos/Mercado y los textos de Canales quedaron en inglés. Después del merge con `dev` hubo que arreglar tests y traducir lo nuevo. Todo pasa en local, pero Vercel no despliega y quedan dos decisiones sobre la spec.

## Qué quedó hecho (tareas 5/5)
- Todas las tareas de `openspec/changes/idioma-fogon-mercado/tasks.md` están marcadas.
- Se integró `origin/dev` (commit 0137dba) conservando lo nuevo de dev: ámbitos Círculo, Tribu, común, Consejo y Fideicomiso, la gobernanza y la limpieza. Hubo conflictos en `lib/fogon/datos.ts`, `estado.ts`, `app/fogon/page.tsx`, `fogon-cliente.tsx`, `fogon.test.ts` y `lib/idioma/textos.ts`.
- Se tradujo al inglés lo nuevo del Fogón: los ámbitos, "How we decide", "Take to the council" y las decisiones nuevas. Los nombres de tribu (Valle Solar) y Semillas quedan sin traducir a propósito. `/fogon/gobernanza` ya venía traducida.
- Se regeneró `docs/idioma/revisar-nativo.md`. Todo el inglés es borrador pendiente de revisión nativa.
- Sigue sin traducir `/fogon/consultas` y `/fogon/simulador` (ya era así y está fuera del alcance de la spec).
- Corrección 4f3a33c: arregló los 5 primeros hallazgos del revisor (ver abajo). `pnpm verificar` en verde (1510 tests).

## Revisor: veredicto y hallazgos
Veredicto final: ⚠️ con observaciones. Solo quedan abiertas las dos decisiones de arriba.

Primera pasada tras el merge, 3 altas y 2 bajas. Todas resueltas en 4f3a33c y verificadas en la segunda pasada:
1. (alta) El e2e propio esperaba el filtro "Residents' Assembly", que dev eliminó. Ahora espera los cinco filtros nuevos y que ese no aparezca.
2. (alta) El e2e esperaba el estado guardado sin `alConsejo: []`. Corregido.
3. (alta) El e2e esperaba avisos de residencia que ya no existen con los cambios de dev. Ahora refleja el escenario en español (0 avisos).
4. (baja) El chip de "dónde" marcaba todo como no traducible. Ahora solo el nombre de la tribu.
5. (baja) Faltaban e2e en inglés de "Take to the council". Se agregaron.

Reglas de CLAUDE.md: sin problemas (aviso de prototipo traducido, un solo `main`, sin colores sueltos ni cobros, el dato faltante se muestra como "sin dato", sin cambios de seguridad).

Comentarios: #issuecomment-6450589668 (1ª pasada) y #issuecomment-6450713474 (2ª pasada).

## Tester: resultado
- **Local (build de producción, puerto 3115):** pasa. 821 pasaron, 0 fallaron, incluida la auditoría de accesibilidad (axe) en inglés de `/fogon`, `/compromisos` y `/canales`.
- **Preview:** bloqueado, no hay deploy (ver arriba).
- **Guion manual:** los pasos 1 a 8 no se recorrieron a mano. Solo quedan cubiertos por los e2e (filtros y votos del Fogón en inglés y español, validación de Compromisos, filtros del Market, accesibilidad).
- Reporte: #issuecomment-6450852417.

## Para la próxima noche
- Primero resolver el deploy de Vercel y recién después recorrer el guion manual del PR sobre el preview.
- Según lo que decidas en 6 y 7, ajustar la spec (cambio chico, sin código) o abrir un cambio nuevo para mostrar "qué plan le falta" en alguna pantalla.
- Traducir `/fogon/consultas` y `/fogon/simulador` si se quiere completar la zona.
- Revisión nativa del inglés (`docs/idioma/revisar-nativo.md`).
