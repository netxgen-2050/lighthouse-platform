# Noche 2026-10-06 — accesibilidad-auditoria
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/5 (base `agente/navegacion-base`) · **Preview:** https://lighthouse-platform-89my4i7z0-net-xg-en.vercel.app

## En una línea
Quedó casi todo: la auditoría de accesibilidad automática y el cierre del ⚖ con teclado y clic funcionan y los tests pasan, pero **falta una tarea (borrar un archivo) que el permiso de Bash bloqueó**, y apareció un problema de diseño que tenés que decidir vos.

## Lo que falló o quedó bloqueado (primero)
1. **No se pudo borrar `app/tribus/[id]/not-found.tsx`.** El permiso de Bash bloqueó todos los intentos (`git rm`, `rm`, `find -delete`), probablemente por los corchetes de la ruta. El implementador lo intentó en las dos pasadas y frenó, sin usar `dangerouslyDisableSandbox`. Por eso las tareas 3.1 y 4.1 quedan sin marcar. El orquestador no hizo una segunda vuelta de corrección porque reintentar era inútil.
2. **El tester no pudo publicar su reporte como comentario en el PR** (la herramienta le rechazó escribir el archivo). Su texto completo está en la sección "Tester" de este reporte.

## Qué quedó hecho (tareas 3/5 completas y 1 a medias)
Marcadas en `tasks.md`: 1.1, 1.2 y 2.1 (3 de 5). La 3.1 está a medias y la 4.1 depende de ella.
- **1.1 y 1.2 (auditoría):** se agregó `@axe-core/playwright` y `e2e/accesibilidad.spec.ts`, que revisa las 15 rutas con WCAG 2.1 A y AA. No encontró violaciones serias ni críticas, así que no hubo que cambiar nada en `app/**`.
- **2.1 (⚖):** en `components/termino-legal.tsx`, Escape cierra el ⚖ y devuelve el foco al botón; el clic afuera también lo cierra. Abrir un ⚖ cierra los otros abiertos. Hay tests en `e2e/tribus.spec.ts` (Escape, clic afuera, Tab real con Enter y con Space, dos ⚖ por teclado).
- **3.1 (a medias):** el test "sin plata ni avales" ya recorre el listado y las 12 tribus. Falta borrar `app/tribus/[id]/not-found.tsx`.
- **4.1:** `pnpm verificar` y `pnpm build` en verde; `pnpm test:e2e` con 40 tests verdes. No se marca porque depende de 3.1.

## Qué decidir a la mañana
1. **[media] El panel de "Ritual de entrada" tapa el ⚖ de "Forma jurídica" en `/tribus/valle`.** Con el mouse, el clic cae dentro del panel y no se puede abrir el segundo ⚖ sin cerrar el primero. Con teclado, el foco llega al botón tapado (queda escondido) y Enter igual lo abre. La auditoría automática no lo detecta. El tester lo confirmó 2 de 2 veces. Es un tema de diseño (`components/termino-legal.tsx:59`, el panel es `absolute left-0 top-full z-10 w-72`). Acción sugerida: decidir dónde va el panel (por ejemplo, que no tape otros ⚖) o si se cierra al perder el foco, y abrir un cambio nuevo.
2. **[baja] Alcance de Escape.** Hoy Escape cierra el ⚖ y devuelve el foco al botón aunque la persona ya haya tabulado a otro control. La spec (línea 11) dice "en el ⚖ o dentro del panel"; la proposal (línea 11) agrega "o en otro control". Hay un test que fija el comportamiento amplio. Acción sugerida: si te gusta como está, no hacer nada y alinear la spec; si no, el ajuste es chico (cerrar sin mover el foco cuando el foco no está en el ⚖) y hay que cambiar ese test.
3. **[media] Borrar `app/tribus/[id]/not-found.tsx`.** La acción ya estaba aprobada en la spec. Hay que hacerlo a mano (o darle permiso al agente): `git rm -- 'app/tribus/[id]/not-found.tsx'`, correr `pnpm test:e2e`, confirmar que el 404 sigue mostrando "Volver a las tribus" (lo da `app/not-found.tsx`) y marcar 3.1 y 4.1 en `tasks.md`.

## Revisor: veredicto y hallazgos
Veredicto en las dos pasadas: ⚠️ con observaciones. Sin problemas con las reglas de CLAUDE.md ni de seguridad.
- **1ª pasada (0 altos, 2 medios, 1 bajo):** (1) tarea 3.1 a medias; (2) con dos ⚖ abiertos el foco podía volver al equivocado; (3) un test forzaba `tabindex="-1"` a mano y faltaba el caso "Tab a otro control y Escape". Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/5#issuecomment-6026365281
- **Vuelta de corrección:** se corrigieron (2) y (3). El (1) no, por el bloqueo de permisos.
- **2ª pasada (0 altos, 2 medios, 1 bajo):** los hallazgos 2 y 3 anteriores están corregidos y las cuatro partes de la spec tienen código y tests; solo falta 3.1. Quedan: el borrado (corregible sin vos), el panel que tapa el ⚖ y el alcance de Escape (los dos los decidís vos). Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/5#issuecomment-6026425875

## Tester: resultado
✅ Pasa, con un hallazgo conocido sin resolver.
- Playwright contra el preview: 40 pasaron, 0 fallaron. (El PR menciona 39 en la primera pasada; la corrida real contó 40.)
- Guion manual, pasos 1 a 4, OK: Enter abre, Escape cierra y devuelve el foco, Space reabre, clic afuera cierra, Tab a otro control y Escape cierra.
- Contexto de 3.1: `/tribus/no-existe` da 404 con "Volver a las tribus" (con curl y con Playwright), con el `not-found.tsx` de la tribu todavía presente. Hay que repetir la prueba cuando se borre.
- ❌ Confirmado 2 de 2: en `/tribus/valle` con el panel de "Ritual de entrada" abierto, el ⚖ de "Forma jurídica" queda tapado (`elementFromPoint` devuelve `STRONG: Ritual de entrada`).
- Temporales del tester en `.noches/tmp/`: manual.mjs, overlap.mjs, 404.html, valle.png, valle-abierto.png, e2e.txt.

## Para la próxima noche
- Borrar `app/tribus/[id]/not-found.tsx`, correr `pnpm test:e2e`, marcar 3.1 y 4.1 y archivar el cambio.
- Especificar el arreglo del panel que tapa el ⚖ una vez que decidas el diseño.
- Alinear spec y proposal sobre Escape según lo que elijas.
- Revisar por qué el permiso de Bash bloquea rutas con corchetes, para que los agentes puedan tocar `app/tribus/[id]/`.
