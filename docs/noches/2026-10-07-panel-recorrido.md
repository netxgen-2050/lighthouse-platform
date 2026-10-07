# Noche 2026-10-07 — panel-recorrido
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/15 · **Preview:** https://lighthouse-platform-jk8t5s4xg-net-xg-en.vercel.app

## En una línea
La página "Mi recorrido" (`/panel`) quedó hecha y funcionando, con todas las pruebas en verde. Falta una tarea (las capturas) y hay dos cosas para decidir: el orden de merge y el encabezado en pantallas angostas. Nadie mergeó nada.

## Qué quedó hecho (tareas 11/12)
Nada falló: `pnpm verificar` (195 tests), `pnpm build` y Playwright contra el preview (103 pasaron, 0 fallaron) están en verde.

- La página `/panel` muestra "Tu próximo paso" y tres tarjetas (Perfil, Compromisos, Congreso). Cuando un dato falta, dice "sin dato", nunca 0.
- Hay un aviso de modo demostración y un botón "Borrar todo lo de este navegador" con confirmación. Al borrar, un mensaje "Listo: se borró todo lo guardado en este navegador." se anuncia para lectores de pantalla, también si se borra dos veces seguidas.
- Si una clave no se puede borrar, se intentan igual todas las demás y aparece un mensaje de error propio.
- Si el navegador no permite guardar datos, se muestra un error en texto.
- Las claves de `localStorage` ahora viven en un solo lugar (`lib/demo/claves.ts`) y las usan perfil, compromisos y congreso.
- Enlace "Mi recorrido" en el encabezado. `lib/navegacion.ts` no existe, por eso quedó ahí.
- `/panel` entró en la auditoría de accesibilidad (axe) y hay 11 tests e2e propios.
- **Sin hacer: tarea 4.1.** No hay capturas del panel vacío, a medias y completo. El e2e contra el preview sí se corrió (lo hizo el tester). Tampoco se recorrió a mano en `pnpm dev` (la tarea 2.1 se verificó solo con e2e).

## Qué decidir a la mañana
1. **Orden de merge (necesita tu decisión).** Este PR sale de `agente/compromisos-registro`, que todavía no está en `main`. La tarea 0.1 pedía los tres cambios previos en `main` y quedó marcada como hecha igual. Acción sugerida: mergear primero `compromisos-registro` y después este PR (cambiando su base a `main`).
2. **Encabezado en pantallas angostas (decisión tuya, hallazgo bajo).** Con el nuevo enlace son cinco pastillas en una fila sin salto de línea (`components/encabezado.tsx:11`). Cerca de 360 px aparece scroll horizontal (WCAG 1.4.10). El problema ya existía y este enlace lo agrava. Acción sugerida: elegir entre un menú plegable o el rail abierto en el design, o como arreglo mínimo permitir que las pastillas pasen a otra línea (`flex-wrap`).
3. **Aviso "Prototipo interno · datos de ejemplo" (viene de antes, no es de este PR).** CLAUDE.md lo pide en todas las páginas, pero no está en ninguna. Hoy el aviso dice "Tribus, personas y cifras de ejemplo." y el pie "Prototipo en desarrollo. Datos de ejemplo.". Acción sugerida: abrir un cambio chico que ponga el texto pedido en el layout común.
4. **Tarea 4.1 pendiente.** Acción sugerida: sacar las capturas a mano (vacío, a medias, completo) y sumarlas al PR, o decidir que no hacen falta y cerrar la tarea.
5. **Cosas que el implementador dejó sin investigar (sin urgencia):**
   - El servidor imprimió `NoFallbackError` en rutas 404 durante los e2e.
   - El panel no se actualiza si cambian los datos desde otra pestaña (no escucha el evento `storage`).
   - El test de teclado arranca en el enlace del próximo paso.

## Revisor: veredicto y hallazgos
Veredicto final (tercera pasada): ⚠️ con observaciones. 0 hallazgos altos o medios, 2 bajos. Los 7 requisitos de la spec están cubiertos y no hay regresiones.

- Resueltos en las dos vueltas de corrección: falta de anuncio tras borrar, borrado que se cortaba si una clave fallaba, y segundo borrado que no se anunciaba.
- Queda 1 (corregible, **no se corrigió** porque se agotaron las dos vueltas): el test e2e de `e2e/panel.spec.ts:117-128` solo comprueba que el contador pasa de 1 a 2, y eso pasaría igual sin la corrección. Hay que reforzarlo comprobando que el mensaje anterior ya no está en la página. No bloquea. Sugerido para la próxima noche.
- Queda 2: el encabezado sin salto de línea (ver decisión 2).
- Reglas de CLAUDE.md: sin textos legales nuevos, sin plata, solo colores del tema, un solo `<main>`, sin pedidos de red ni secretos.

## Tester: resultado
Pasa. Playwright contra el preview: 103 pasaron, 0 fallaron (incluye `panel.spec.ts` y `/panel` en axe). Los pasos 1 a 7 del guion manual se dieron por verificados con esos tests y con un `curl` a `/panel`. **No hubo recorrida manual en navegador ni capturas.** Vercel respondió sin bloqueos. Comentario del tester: https://github.com/netxgen-2050/lighthouse-platform/pull/15#issuecomment-6040487026

Observaciones sin bloqueo: los textos de aviso y pie no son los que pide CLAUDE.md (heredado, ver decisión 3). El servidor entrega "Cargando…" y el contenido aparece al cargar, algo esperado porque lee `localStorage`.

## Para la próxima noche
- Reforzar el test e2e del re-montaje del mensaje de borrado (hallazgo 1 del revisor).
- Resolver el encabezado angosto según lo que decidas.
- Poner el aviso "Prototipo interno · datos de ejemplo" en el layout.
- Hacer la tarea 4.1 (capturas) o cerrarla.
- Investigar el `NoFallbackError` en rutas 404.
- Después de mergear `compromisos-registro`, cambiar la base del PR a `main`.
