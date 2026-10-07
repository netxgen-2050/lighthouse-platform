# Noche 2026-10-07 — termino-legal-tooltip
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/9 (base `agente/accesibilidad-auditoria`) · **Preview:** https://lighthouse-platform-qlapp0pfk-net-xg-en.vercel.app

**Ojo, primero lo que no cerró:** el cambio quedó incompleto. La tarea 1.1 sigue sin marcar porque nadie lo probó a mano, el paso 7 del guion (tooltip cortado en celular angosto) no se verificó, y hay una limitación conocida: en algunos casos el tooltip tapa el ⚖ siguiente. Los tests automáticos están todos en verde.

## En una línea
El ⚖ ahora abre un tooltip flotante (con mouse, teclado y toque) en lugar de empujar el contenido, pero cuando no hay lugar arriba abre hacia abajo y en ese caso puede tapar el ⚖ siguiente.

## Qué quedó hecho (tareas 2/3)
- [ ] 1.1 Rehacer `components/termino-legal.tsx` como tooltip flotante. El componente está hecho y cubierto por tests, pero **falta que alguien lo pruebe a mano en `pnpm dev`** en `/tribus/valle`.
- [x] 2.1 Tests e2e con los escenarios de la spec (hover, pasar al tooltip, Tab + Escape, toque, dos ⚖ cercanos).
- [x] 3.1 `pnpm verificar` y `pnpm build` en verde; PR con guion de prueba.

Cómo funciona:
- Mouse: aparece al entrar y se va al salir; se puede pasar el mouse al tooltip sin que se cierre.
- Teclado: aparece con el foco por Tab; Escape lo esconde sin mover el foco.
- Celular: un toque lo abre o cierra; un toque afuera lo esconde. Se decide por el tipo de toque del evento, así que también anda en equipos híbridos (pantalla táctil y mouse).
- Se mantiene dentro de la pantalla en celulares angostos y hay un solo tooltip abierto a la vez.
- Abre hacia arriba; si no hay lugar (menos de 8 px al borde superior), abre hacia abajo.
- Los textos legales no se tocaron.
- Suite e2e completa: 45/45 en local y 45/45 contra el preview.

## Qué decidir a la mañana
1. **Qué priorizar cuando no hay lugar arriba (media).** Al abrir hacia abajo el tooltip tapa el ⚖ siguiente (hoy pasa con "Comunidad con personería" en `/tribus/valle`). La spec pide las dos cosas: no tapar y no salirse de la pantalla, y no siempre se puede. Hoy hay un test que documenta que lo tapa. Acción sugerida: elegir entre (a) aceptar la limitación, (b) pedir un cambio de spec con otra solución, por ejemplo mover el tooltip hacia el costado.
2. **`aria-describedby` (baja).** Se agrega en el render posterior al foco, y algunos lectores de pantalla pueden no anunciar la descripción. La spec dice "mientras es visible", así que cumple al pie de la letra. Acción sugerida: aceptar, o pedir que esté siempre presente.
3. **Clic de mouse (a confirmar).** Un clic de mouse que deja el foco en el ⚖ no mantiene el tooltip abierto. El revisor entiende que cumple la spec. Acción sugerida: confirmar que es lo que querés.
4. **Verificación manual de la tarea 1.1.** Probar en `pnpm dev`, en `/tribus/valle`, con mouse y teclado; si está bien, marcar la tarea.
5. **Paso 7 del guion (sin verificar).** Mirar a mano en un celular angosto que el tooltip no se corta por el borde derecho. Ningún test lo cubre.

## Revisor: veredicto y hallazgos
Tres revisiones (la última sobre el commit `837758f`). Veredicto final: con observaciones, listo para revisión humana. 0 hallazgos altos.
- Primera revisión: 2 medias (el toque no andaba en híbridos; abría siempre hacia arriba y podía salirse de pantalla) y 3 bajas. Corregidas en la vuelta 1, salvo `aria-describedby` (decisión tuya).
- Segunda revisión: 1 media nueva (el tapado del ⚖ siguiente) y 4 bajas; las corregibles se arreglaron en la vuelta 2. El tapado no se pudo arreglar y quedó como limitación documentada.
- Revisión final, pendientes:
  - [media] Tapado del ⚖ siguiente (decisión 1).
  - [baja, corregible, no corregido porque se agotaron las dos vueltas] `e2e/tribus.spec.ts:139-143`: el test de la limitación da verdadero también si no hay ningún elemento en ese punto (fuera de pantalla) y no comprueba que lo que tapa sea el tooltip. Arreglo: comprobar que `arriba?.closest('[role="tooltip"]')` no sea nulo.
  - [baja] `aria-describedby` (decisión 2).
- El revisor corrió él mismo los tests: 44/44 y luego 16/16 de `tribus.spec`. Su comentario final no lo pudo publicar (no tenía permiso de escritura); lo publicó el documentador en el PR.

## Tester: resultado
**Incompleto.** Playwright contra el preview: 45 pasaron, 0 fallaron. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/9#issuecomment-6036193307

Bloqueo: el tester quiso recorrer el guion manual con un test temporal propio en `.noches/tmp/`, pero se le denegó el permiso de ejecutar `pnpm exec playwright test -c .noches/tmp/pw.config.ts`. No lo esquivó. Por eso los pasos 1 a 6 y 8 del guion están cubiertos solo por los tests del propio PR (que pasaron), sin verificación independiente.
- Paso 3: el test usa el ⚖ "Comunidad con personería", no "Forma jurídica" como dice el guion.
- Paso 7 (borde derecho en celular angosto): sin test y sin verificar.
No hubo fallas, así que no se hizo vuelta extra.

## Para la próxima noche
- Decidir el punto 1 y, según eso, abrir un cambio de spec o cerrar la limitación.
- Corregir el test de `e2e/tribus.spec.ts:139-143` (comprobar que lo que tapa es el tooltip).
- Agregar un test de borde horizontal para el paso 7, o recorrerlo a mano.
- Habilitar al tester a correr Playwright con una config temporal en `.noches/tmp/`, para que pueda verificar el guion por su cuenta.
- Nadie mergeó nada; el merge de este PR queda para vos, después de la base `agente/accesibilidad-auditoria`.
