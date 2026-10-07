# Noche 2026-10-07 — accesibilidad-auditoria
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/5 · **Preview:** https://lighthouse-platform-git-agente-accesibilidad-a-48c39f-net-xg-en.vercel.app

## En una línea
**Lo que falló primero:** el tester quedó bloqueado por permisos y no probó nada, así que el preview y el ⚖ no tienen ninguna prueba hecha por una persona o agente esta noche. Lo demás: se cerraron todas las tareas del cambio y el revisor lo dejó "listo para revisión humana", con dos temas del ⚖ que pasan al cambio `termino-legal-tooltip`.

## Qué quedó hecho (tareas 9/9)
Todas las tareas de `openspec/changes/accesibilidad-auditoria/tasks.md` están marcadas. Esta noche fue una vuelta de corrección sobre el PR #5 que ya estaba abierto (no se abrió otro).

- 3.1 y 5.2: se borró `app/tribus/[id]/not-found.tsx`. El 404 de una tribu desconocida lo resuelve `app/not-found.tsx` y sigue mostrando "Volver a las tribus".
- 4.1: `pnpm verificar` (138 tests unitarios), `pnpm build` y `pnpm test:e2e` (40 tests) pasan, **según informa el implementador**.
- 5.1: se trajo `main` a la rama sin conflictos.
- 5.3: no se tocó el comportamiento del ⚖. Quedó anotado en la descripción del PR.
- El implementador tuvo que correr `pnpm install --frozen-lockfile` en el carril porque faltaba `@axe-core/playwright`.

Nadie mergeó ni tocó `main`.

## Qué decidir a la mañana
1. **Tester bloqueado (acción: destrabar y volver a probar).** El sistema negó el permiso para ejecutar `scripts/preview-url.sh`. Hay dos salidas: habilitar `scripts/preview-url.sh` (y `pnpm test:e2e` o `scripts/curl-preview.sh` si hacen falta) en `.claude/settings.json`, o autorizar `pnpm build && pnpm start` en local. Mientras tanto, conviene que Gus mire el preview a mano con el guion de más abajo antes de mergear.
2. **[media] El panel del ⚖ tapa al ⚖ vecino** (`components/termino-legal.tsx:59`, panel `absolute left-0 top-full z-10 w-72`). En `/tribus/valle`, el panel de "Ritual de entrada" cubre el ⚖ de "Forma jurídica". Con el mouse hay que cerrar primero para llegar al otro. Con teclado, el foco puede quedar escondido debajo del panel. La herramienta axe no lo detecta. Acción sugerida: decidir dónde va el panel y si se cierra al perder el foco, dentro del cambio `termino-legal-tooltip`.
3. **[baja] Escape lleva el foco al ⚖ desde cualquier lado** (`components/termino-legal.tsx:25-28`). La spec dice "con el foco en el botón ⚖ o dentro del panel", pero el código escucha Escape en toda la página y mueve el foco aunque la persona esté en otro control. El test "Tab a otro control y Escape…" de `e2e/tribus.spec.ts` asegura hoy ese comportamiento más amplio y habrá que cambiarlo. Acción sugerida: confirmar la regla que se quiere y resolverlo en `termino-legal-tooltip`.
4. **Vercel:** el revisor vio el check de Vercel todavía pendiente. Al escribir este reporte, el comentario de Vercel en el PR marca el preview como "Ready" (10:25 UTC). Eso dice que el preview se construyó, no que se haya probado.

Alta: ninguno. Media: 1. Baja: 1. No hay preguntas abiertas más allá de las de arriba.

## Revisor: veredicto y hallazgos
**Veredicto: listo para revisión humana.** 0 altos, 1 medio, 1 bajo, ninguno nuevo. Los dos son los de arriba (puntos 2 y 3) y ya estaban reportados en la revisión anterior.

- Cobertura de la spec cumplida: auditoría axe de las 15 rutas (WCAG 2.1 A/AA), cierre del ⚖ con Escape y clic afuera, ⚖ operable con teclado real, y sin plata en ninguna tribu.
- Reglas de CLAUDE.md: sin textos legales nuevos (el panel lee de `TERMINOS`), sin montos ni lotes, sin secretos, nada fuera de la spec.
- Límites de la revisión: **el revisor no corrió los tests**; se apoyó en lo que informa el PR.
- Incidente: el revisor no pudo publicar su comentario (no tenía Write y `gh pr comment --body` fue denegado). El orquestador publicó el texto sin cambios: https://github.com/netxgen-2050/lighthouse-platform/pull/5#issuecomment-6035979180
- No hubo vuelta de corrección del revisor porque lo que queda necesita decisión de Gus.

## Tester: resultado
**No probado por bloqueo de permisos.** Esto no es un "verde": el tester no probó nada.

- El sistema le negó ejecutar `scripts/preview-url.sh agente/accesibilidad-auditoria`.
- No consultó el preview, no corrió Playwright, no recorrió el guion manual y no publicó comentario en el PR.
- No intentó otra vía (ni levantar la app en local), y el orquestador decidió no esquivar el permiso denegado.
- No hubo vuelta de corrección porque no hubo fallas, solo bloqueo.

**Lo único verificado con tests es lo que informó el implementador** (`pnpm verificar`, `pnpm build`, `pnpm test:e2e`). Nadie más lo corroboró.

Guion manual sin probar (para hacer a mano o en la próxima corrida):
1. En `/tribus/valle`, llegar con Tab al ⚖ de "Ritual de entrada".
2. Enter abre, Escape cierra y devuelve el foco, Space reabre.
3. Con el panel abierto, un clic en el título lo cierra.
4. Con el panel abierto, tabular a otro control: Escape igual cierra.
5. `/tribus/no-existe` muestra el 404 con "Volver a las tribus".

Los pasos 3 y 4 tocan el comportamiento que quedó abierto para `termino-legal-tooltip` y podrían fallar o cambiar.

## Para la próxima noche
- Destrabar el permiso del tester (punto 1 de "Qué decidir") y correr el guion y `pnpm test:e2e` contra el preview.
- Avanzar con el cambio `termino-legal-tooltip`, que absorbe los hallazgos 2 y 3: panel que tapa al ⚖ vecino y alcance de Escape. Ese cambio debe actualizar el test "Tab a otro control y Escape…".
- Que el revisor, si puede, corra los tests y no solo lea lo que informa el PR.
- Revisar que el revisor y el tester tengan los permisos que necesitan (publicar comentarios con `gh pr comment --body-file`, usar `scripts/preview-url.sh`).
