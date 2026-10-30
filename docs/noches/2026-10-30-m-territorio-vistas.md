# Noche 2026-10-30-m — territorio-vistas
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/145 · **Preview:** no hay (el deploy de Vercel falla; ver "Qué decidir a la mañana")

## En una línea
El cambio quedó hecho y probado en local (11 de 11 tareas), pero no hay preview de Vercel y hay una decisión tuya pendiente: si el terreno común se puede elegir en la vista "Ahora".

## Qué quedó hecho (tareas 11/11)
- Lógica pura de las vistas en `lib/territorios/vistas.ts`, con su test.
- El mapa del territorio ahora se muestra en tres vistas: Ahora, Plan y Visión. Cada una tiene su grupo de capas, sellos de frentes, selector de vistas y un control de Etapa que queda guardado en la URL.
- Paneles, ficha, leyenda y textos en español e inglés.
- Enlace "Ver en el mapa" en /tribus, sección Equipos (incluye `fase=N` para frentes de fases siguientes).
- Pruebas e2e nuevas `territorio-vistas.spec.ts` (19 escenarios) y axe en Plan y Visión.
- `pnpm verificar` (1964 tests) y `pnpm build` en verde. Hay un aviso de lint que ya existía en `app/territorios/[id]/vistas/paneles.tsx:82`.
- Los botones de fuentes del plan no se dibujan, porque hoy hay una sola fuente.
- Fuera de alcance, a propósito: la prop `desdeFrente` en SumarmeEquipo, "Plan" en `lib/idioma/neutros.ts`, regenerar `docs/idioma/revisar-nativo.md` y ajustar los e2e existentes (`?vista=vision`).

## Qué decidir a la mañana
1. **(a) Terreno común en "Ahora" (media atención, decisión tuya).** La spec se contradice: la tabla del design deja el terreno común fuera de lo elegible en Ahora, pero el test de la tarea 1.2 pide que `sel=comun` sin `vista` se quede en Ahora. Se hizo elegible el común en las tres vistas, que coincide con la tarea 1.2 y con el sello C. Acción sugerida: confirmar que así queda y corregir design §1/§4; o decir que no, y habría que cambiar `elegibles` y el test.
2. **(b) Vercel sin preview (alta).** El deploy falla en el mismo segundo de arrancar, también en el commit base de `dev`, así que no viene de este cambio. Sin preview no se pudo probar contra el entorno real. Acción sugerida: revisar la configuración de Vercel aparte (antes de mirar este PR) y, cuando funcione, repetir el guion manual de 8 pasos contra el preview.
3. **(c) Test inestable `e2e/idioma-pendientes.spec.ts:19` (media).** Falló axe `document-title` en /fogon en inglés. Pasó una vez y falló otra, y este PR no lo toca. Acción sugerida: abrir un cambio aparte para estabilizarlo; no bloquea este PR.
4. **(d) Rebase del PR #109 (media).** #109 sigue abierto. Se aplicó el caso "este cambio entra primero": la fuente permacultura no está en esta rama, así que #109 tendrá que rebasarse sobre este cambio. Acción sugerida: mergear este PR primero y rebasar #109 después.
5. **Desvío de proceso (baja).** En la primera corrección el implementador usó un `sed -i`, que CLAUDE.md prohíbe. El resultado quedó correcto. Acción sugerida: recordárselo en las instrucciones del implementador si vuelve a pasar.

## Revisor: veredicto y hallazgos
Veredicto final (3ª pasada): con observaciones. Sin hallazgos nuevos. Cubre 8 de 8 requirements. Sin problemas con las reglas del prototipo ni con seguridad.
- Media: el enlace "Ver en el mapa" no llevaba `fase` para frentes de fases siguientes. Resuelto en la vuelta 1 (commit 376ba27) con un e2e nuevo.
- Baja: la lista "Elegir en el mapa" no salía de `elegibles(vista, fase)`; resuelto en la vuelta 1.
- Baja: el campo `nombre` del registro no se usaba y dejaba que una vista usara la clave de otra. Resuelto en la vuelta 2 (commit 5588ba3): el nombre sale del id y design.md §1 lo aclara.
- Baja, abierta: terreno común elegible en Ahora (punto (a) arriba).
- Aparte: el deploy de Vercel falla (punto (b)).

## Tester: resultado
Pasó, pero solo en local. `preview-url.sh` dijo "El deploy de Vercel falló para 5588ba3", por eso se probó con `pnpm build && pnpm start` en el puerto 3347.
- Playwright: 1012 pasan y 1 falla (`idioma-pendientes.spec.ts:19`, inestable, ver (c)).
- Los 38 tests de territorio-vistas y tribus-equipos pasan. `idioma.spec.ts:86` y `configuracion.spec.ts:38` pasaron en 2 repeticiones.
- Una primera corrida con el puerto 3100 reutilizó un servidor viejo y no cuenta.
- El guion manual de 8 pasos quedó confirmado solo vía los e2e locales; falta repetirlo contra el preview.
- Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/145#issuecomment-6520942303

## Para la próxima noche
- Arreglar Vercel (lo que bloquea un preview para cualquier PR).
- Estabilizar `idioma-pendientes.spec.ts:19`.
- Rebasar #109 después de que entre este PR.
- Seguimientos fuera de alcance de esta noche: `desdeFrente` en SumarmeEquipo, "Plan" en `lib/idioma/neutros.ts`, regenerar `docs/idioma/revisar-nativo.md`, y ajustar los e2e existentes con `?vista=vision`.
- Corregir design §1/§4 según lo que decidas sobre el terreno común.
