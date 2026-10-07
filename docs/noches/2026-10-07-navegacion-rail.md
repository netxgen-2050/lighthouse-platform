# Noche 2026-10-07 — navegacion-rail
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/13 · **Preview:** https://lighthouse-platform-40x7l7exn-net-xg-en.vercel.app

## En una línea
Nada falló: la navegación pasó del encabezado a una barra lateral con íconos (en computadora y en celular), con todas las pruebas en verde. Hay tres cosas para que decidas o mires vos, ninguna grave.

## Qué quedó hecho (tareas 3/3)
- **1.1 Rail:** nueva barra lateral con ocho destinos definidos en `lib/navegacion.ts`, cada uno con su ícono. Hoy se ven cuatro: Inicio, Tribus, Perfil y Congreso. Territorio, Compromisos, Sumarte y Mi recorrido aparecerán cuando existan sus páginas.
  - Ancho de 80 px en computadora y 64 px en celular, con desplazamiento propio si no entra en la altura.
  - El destino actual se marca con fondo relleno, negrita, subrayado y `aria-current="page"` (no solo con color). Las subrutas cuentan como su sección (en `/tribus/valle` sigue marcado Tribus).
  - La marca "NetX" pasó al tope del rail como texto (no es enlace), para que el segundo Tab llegue a Inicio. Se borró `components/encabezado.tsx`.
- **2.1 Tests:** e2e actualizados y nuevos (subruta, celular 390 × 844 sin scroll horizontal, Tab). Auditoría de accesibilidad (axe) incluida.
- **3.1 Integración:** `pnpm verificar` (168 tests) y `pnpm build` en verde; PR con guion de prueba.
- **Arreglo extra:** `/congreso` se desbordaba hacia el costado a 390 px; se corrigió con `grid-cols-1` en `app/congreso/page.tsx` y `registro-ticket.tsx`.

## Qué decidir a la mañana
1. **¿Agregamos CI? (media-baja, decisión tuya).** La lista de destinos del rail usa una bandera `existe` que se mantiene a mano y solo la vigila un test que corre dentro de `pnpm verificar`. No hay CI y el build de Vercel no corre tests. Si alguien crea o borra una página sin correr `verificar`, el rail queda desfasado: falta el destino nuevo o aparece un enlace que da 404. Acción sugerida: decidir si alcanza con la regla de CLAUDE.md (cada ruta nueva exige poner su `existe` en true; el test avisa si se olvida) o si se agrega un workflow de CI que corra `pnpm verificar`.
2. **Mirar el rail a ojo (baja).** Nadie lo vio en un navegador real: el implementador lo cubrió con Playwright midiendo posición y ancho, y el tester por HTML y tests. Acción sugerida: abrir el preview, bajar el alto de la ventana y confirmar que el rail se desplaza solo (paso 5 del guion). No hay test automático de ese scroll.
3. **Aviso del pie (baja, otro cambio).** `components/pie.tsx:19` dice "Prototipo en desarrollo. Datos de ejemplo." y CLAUDE.md pide "Prototipo interno · datos de ejemplo". Ya estaba así antes de este PR. Acción sugerida: abrir un cambio chico aparte.
4. **Pregunta abierta del implementador:** cómo entrarán las etiquetas "Compromisos" y "Mi recorrido" en 64 px cuando existan esas rutas. Acción sugerida: revisarlo cuando se cree la primera de esas páginas (abreviar, partir en dos líneas o mostrar solo el ícono con nombre accesible).

## Revisor: veredicto y hallazgos
Tres pasadas; el veredicto final es listo para revisión humana, sin hallazgos altos ni medios.
- **Pasada 1 (con observaciones; 1 media, 5 bajas):** el rail leía el disco (`existsSync`) en cada render, y se habría quedado vacío sin error si una página pasaba a dinámico en Vercel; no detectaba grupos de rutas ni `.mdx`; `h-screen` tapaba el último ítem en celular; un test frágil; la marca se buscaba en toda la página; faltaba probar `/tribus/valle` a 390 px. Todo corregido en la vuelta 1 (bandera `existe` a mano con test contra `app/`, `h-dvh`, test más preciso).
- **Pasada 2 (listo, 3 bajas):** verificó las seis correcciones. Quedaban `filtrarDestinos` sin uso, descripción del PR y `tasks.md` desactualizadas, y el tema del CI. Corregido en la vuelta 2 (se borró `filtrarDestinos`, el test ahora prueba `destinosDisponibles()`, se actualizaron textos).
- **Pasada 3 (listo):** único hallazgo abierto, el del CI (punto 1 de arriba). Spec cubierta: 4 requirements y 5 scenarios con código y test; solo el scroll propio del rail no tiene test automático.
- **Nota menor:** el mensaje del commit `ce6d6dc` quedó con el texto viejo (menciona leer `app/`); no se reescribe la historia.

## Tester: resultado
Pasa. El preview respondió bien, sin bloqueos. Playwright: 64 de 64 contra el preview, con axe en 15 rutas. Guion manual:
- Pasos 1 a 4 bien (rail con los cuatro destinos y el actual marcado; Tribus marcado en subrutas; Tab llega primero a "Saltar al contenido" y luego a Inicio; a 390 px el rail queda a la izquierda, de 72 px o menos, sin scroll horizontal). Se comprobó por HTML y por tests, no a ojo. Los desbordes de `/perfil` y `/congreso` no se repitieron a mano.
- **Sin probar:** paso 5 (alto de ventana reducido y scroll propio del rail; solo se confirmó en el HTML `h-dvh`, `overflow-y-auto` y `overscroll-contain`) y las etiquetas Compromisos y Mi recorrido en 64 px (las rutas no existen todavía).
- No hizo falta vuelta de corrección del tester.

## Para la próxima noche
- Cuando se agregue una ruta nueva (Territorio, Compromisos, Sumarte, Mi recorrido), poner su `existe` en true en `lib/navegacion.ts`; el test avisa si se olvida.
- Revisar cómo se ven las etiquetas largas en 64 px apenas exista la primera.
- Corregir el texto del aviso del pie en un cambio aparte.
- Según lo que decidas sobre el CI, un cambio chico para agregarlo.
- Nadie mergeó ni tocó `main`; el merge del PR #13 es tuyo.
