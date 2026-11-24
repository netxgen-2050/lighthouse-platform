# Noche 2026-11-24-m — participa-vision-2050
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/212 · **Preview:** https://lighthouse-platform-git-agente-par-84b417-netxgen-2030-projects.vercel.app (pide login de Vercel; ver más abajo)

Rama `agente/participa-vision-2050`, base `agente/participa-mapa-equipos` (PR #207). Este PR depende de ese.

## En una línea
La pestaña Visión de Participa ahora es el manifiesto Lighthouse 2050, con el texto de design.md §3 tal cual y una cabecera ilustrada de amanecer. Todo anda en local y las tareas están hechas, pero **no se pudo probar en el preview** y quedan 4 cosas que decidís vos.

## Qué falló o quedó sin verificar (primero)
- **El preview no se pudo probar.** Todas las rutas del preview de Vercel (estado Ready para el commit e306ff4) mandan al login de Vercel. Además `scripts/curl-preview.sh` falló con `CABECERAS[@]: unbound variable`, es decir, no tenía cargada la variable del secreto. El tester probó el mismo commit con un build de producción local (puerto 3100). Si querés ver el preview, entrá con tu cuenta de Vercel.
- **Dos tests de accesibilidad (axe) fallan a veces** por `document-title` en `/lotes?lang=en` y `/territorios/lighthouse`. Pasan solos al repetirlos; no tocan la Visión. En la última tanda completa del implementador fallaron esos dos. En la del tester falló solo `/territorios/lighthouse`. El implementador recomienda abrir un cambio aparte para esa carrera del `<title>`.
- **La ancla de Sumarte no se probó** (depende de tu decisión, abajo).
- **El revisor no vio la cabecera renderizada**; la vio el tester en local.

## Qué quedó hecho (tareas 6/6)
Las tareas de `tasks.md` están todas marcadas (1.1, 2.1, 3.1, 4.1). Resumido:
- Texto en `lib/idioma/textos/vision-2050.ts` (es y en), con test de que ambos idiomas tengan las mismas secciones. El revisor y el tester confirmaron que coincide con §3. La última línea ("Vení a plantar…") está partida en dos campos solo por diseño.
- Pantalla `components/participa/vision-2050.tsx`: cabecera de amanecer (río, barda, álamos, faro con haz, sol) con los colores del tema; de noche el cielo se vuelve oscuro con brasa. Título en Fraunces, marca "Visión, no promesa · borrador", columna de lectura de 60 a 75 caracteres, capitular, separadores (hoja, gota, llama), siete principios en tarjetas (2 columnas, 1 en celular) y cierre con el botón "Conocé los equipos". El fundido al entrar solo ocurre debajo del pliegue y se apaga con movimiento reducido o sin JavaScript.
- Se borró `components/participa/vision.tsx`: las comunidades de ejemplo ya no están en la pestaña (las fichas en `/tribus/[id]` siguen).
- E2E: spec nuevo `e2e/participa-vision.spec.ts`; se retiraron 4 tests del listado de tribus y se adaptaron varios specs.
- Inglés anotado en `docs/idioma/revisar-nativo.md` (sin revisión nativa todavía).
- `pnpm verificar` (2809 unitarios), `pnpm build` y `openspec validate --strict` en verde.

## Qué decidir a la mañana
1. **[Media] Sumarte apunta a un lugar que ya no existe.** "Proponer una comunidad nueva" (`app/sumarte/sumarte-cliente.tsx`, líneas 141, 203 y 467) y el test `e2e/sumarte-acceso.spec.ts` mandan a `/participa?ver=vision#sec-vacantes`. Esa ancla ya no existe: la persona cae en la Visión sin lista de barrios vacantes. Además `/tribus?ver=tribus` redirige a una Visión que ya no lista comunidades. La spec no dice el destino. Acción sugerida: decidir dónde vive el flujo de "proponer comunidad" (¿en Equipos?, ¿en una página propia?) y abrir un cambio chico que corrija los tres enlaces y el test.
2. **[Baja] Cambio de fuentes fuera de spec.** `participa.css` usaba `var(--font-display)` y `var(--font-sans)`, que no resuelven. Se cambiaron por `--font-fraunces` y `--font-inter-tight`. Efecto: los nombres del territorio y los carteles del mapa (PR #207) pasan a Fraunces. Acción sugerida: mirar el mapa en el preview; si te gusta, aceptarlo; si no, revertir esas dos líneas.
3. **[Baja] Textos en inglés que no están en §3:** la marca "A vision, not a promise · draft", el botón "Meet the teams" y la descripción accesible de la ilustración (`ilustracionAria`, en los dos idiomas). Acción sugerida: aceptarlos como borrador o dar el texto que prefieras.
4. **[Baja] La cabecera es una escena nueva** hecha con las piezas del mapa, no el mapa de Participa en versión amanecer. Acción sugerida: mirarla en el preview y decir si alcanza o si querés reutilizar el mapa real.

Observaciones menores del tester, sin decisión obligatoria: hay mucho cielo vacío entre la marca y la escena; a 1280x900 la escena queda bajo el pliegue; la séptima tarjeta de principios queda sola en una fila de ancho completo.

## Revisor: veredicto y hallazgos
**Primera pasada: con observaciones, 7 hallazgos** (0 altos, 2 medios, 5 bajos). Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/212#issuecomment-7138426951
- Corregidos por el implementador (commit e306ff4): (1) media, axe intermitente por el fundido de 0,7 s con espera fija de 900 ms, y la tarea 3.1 marcada hecha sin estar estable; (2) baja, se había sacado el control de español suelto en la Visión en inglés; (3) baja, ancho de línea 55–80 contra 60–75 de la spec.
- Para vos: los hallazgos 4 a 7, que son las 4 decisiones de arriba.

**Segunda pasada: con observaciones.** Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/212#issuecomment-7138986162
- Los hallazgos 1 a 3 quedaron bien corregidos. Verificó que la espera no puede quedar colgada (las animaciones infinitas solo existen con `.forma[data-activa]`, que la Visión no usa) y corrió los dos archivos de tests 3 veces (99 tests). No corrió la suite completa.
- Detalle sin efecto hoy: la lista de nombres propios permitidos distingue mayúsculas y en inglés el texto dice "Jarilla".
- Total pendiente: alta 0, media 1, baja 3. Reglas de CLAUDE.md cumplidas.

## Tester: resultado
**Pasa, pero probado en local y no en el preview** (por el bloqueo de login explicado arriba). Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/212#issuecomment-7139665674
- Playwright local: 1375 pasaron, 1 falló (axe `document-title` en `/territorios/lighthouse`, el flaky conocido; pasa solo), 3 omitidos. Los e2e de `participa-vision` y los axe de la Visión pasaron.
- Guion manual 6/6: tema claro y oscuro, inglés, 390 px sin scroll horizontal, movimiento reducido y el botón "Conocé los equipos" que vuelve a /participa.
- Calidad visual buena, con las observaciones menores de arriba.
- No probó la ancla de Sumarte.

## Para la próxima noche
- Abrir un cambio para el destino de "Proponer una comunidad nueva" y de `/tribus?ver=tribus` (decisión 1).
- Abrir un cambio aparte para la carrera del `<title>` que hace fallar axe a veces.
- Si se quiere, pasar la lista de nombres propios del test de español suelto a comparación sin distinguir mayúsculas.
- Cuando entres al preview con tu cuenta, repetir el guion de prueba manual del PR (los 6 pasos), en especial el mapa por el cambio de fuentes.
- Tras mergear #207, cambiar la base de este PR a `dev`.
