# Noche 2026-10-09 — reportar-circulo
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/53 · **Preview:** https://lighthouse-platform-lx4czs4vw-net-xg-en.vercel.app

## En una línea
El botón Reportar ahora es un círculo verde del mismo tamaño que Hifa, con tooltip, y quedó aprobado por revisor y tester después de una vuelta extra que el tester pidió. Hay tres decisiones tuyas pendientes.

## Qué quedó hecho (tareas 2/2)
- 1.1 Botón Reportar rehecho: círculo verde (56 px) con solo el bicho y un anillo negro punteado por fuera, fijo al borde derecho a media altura. Nombre accesible "Reportar un problema o una idea". Tooltip "Reportar" con mouse y con teclado; Escape lo oculta. El tamaño sale de una constante compartida (`TAMANO_FLOTANTE` en `lib/ui/flotantes.ts`) que usan Reportar y Hifa.
- F.1 `pnpm verificar` (490 unitarios), `pnpm build` y e2e en verde.

Dato de proceso: el tester falló la primera prueba (con un Escape se cerraba el chat de Hifa además de ocultar el tooltip). Se corrigió (Hifa escucha Escape en fase de captura), se agregó un e2e y la segunda prueba pasó.

## Qué decidir a la mañana
1. **Ventana del chat de Hifa movida.** Con el anillo, Reportar mide ~66 px, así que el PR corrió la ventana de Hifa a la izquierda (`right-12` a `right-[4.75rem]`) y la achicó (`100vw-6rem` a `100vw-8rem`). A 390 px queda en ~262 px de ancho. El proposal decía que solo se tocaba `boton-reportar.tsx`. Acción sugerida: aceptar el cambio si el ancho en celular te parece bien, o pedir otro ajuste.
2. **¿"Mismo tamaño que Hifa" incluye el anillo?** La spec no lo dice. Se eligió círculo de 56 px con el anillo por fuera (~66 px en total). Acción sugerida: confirmar o pedir que el anillo entre dentro de los 56 px.
3. **Color del anillo.** Usa el token `border-ink` (verde casi negro, #14241a), no negro puro. El contraste 3:1 se juzgó a ojo, no se midió con números. Acción sugerida: aceptar el token (respeta la regla de solo tokens) o pedir una medición.

## Revisor: veredicto y hallazgos
Veredicto final (3ª revisión): listo para revisión humana. Se llegó al máximo de dos vueltas de corrección.
- 1ª revisión: [media] Escape solo ocultaba el tooltip con foco en el botón (WCAG 1.4.13). [baja] el tooltip se ocultaba al sacar el mouse aunque siguiera el foco. [baja] `size-14` escrito a mano en dos archivos. Todo corregido.
- 2ª revisión: [media] el `preventDefault` del Escape podía impedir que un solo Escape cerrara el diálogo de reporte. Corregido (se quitó, y hay e2e nuevo).
- 3ª revisión: [baja] con el mouse quieto sobre Reportar y Hifa abierta con teclado, un Escape podía cerrar Hifa. Esto fue lo que el tester confirmó y se arregló después.

## Tester: resultado
- 1ª prueba (commit 4e326f8): FALLÓ. Reprodujo dos veces el Escape que cerraba Hifa.
- 2ª prueba (commit 2255a05): PASA. Suite completa: 367 ok, 0 fallas. Los tres casos de Escape, la spec a 1280 y 390 px (sin superposición ni scroll horizontal) y axe, en verde.
- Flakies ajenos al PR (se cayeron sin relación con este cambio): `e2e/congreso.spec.ts:44` (2ª prueba); `e2e/territorio-mapa.spec.ts:114` y `e2e/tribus.spec.ts:201` (1ª prueba).

## Para la próxima noche
- Revisar los tests inestables de congreso, territorio-mapa y tribus: aparecen de a uno por corrida.
- Si decidís medir el contraste del anillo, sumar un chequeo numérico.
- Notas del entorno: corrida en la nube, `gh pr` no funciona (se usó `scripts/pr.sh`); los subagentes corrieron en segundo plano aunque se pidió primer plano.
