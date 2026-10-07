# Noche 2026-10-07 — portada-caminos
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/14 (base: `agente/navegacion-rail`) · **Preview:** https://lighthouse-platform-j7oikd44r-net-xg-en.vercel.app

## En una línea
La portada ya muestra el héroe del mock-up, el aviso de prototipo y los tres caminos ("Explorar el Lighthouse", "Encontrar mi tribu", "Congreso · Feb 2027"), pero hay un enlace roto (404) y una frase legal omitida que tenés que decidir vos. Nadie mergeó nada.

## Qué quedó hecho (tareas 6/6)
- 0.1 Prerrequisitos revisados: faltan en esta base `/territorios/lighthouse` y `/sumarte`; quedó anotado.
- 1.1 a 1.3 Sección "Por dónde empezar" con tres enlaces, en orden. La cantidad de barrios sale de los datos (`tribusDeTerritorio("lighthouse")`). Sin datos, la descripción no lleva número. Singular correcto: "1 barrio y las tribus que lo están formando."
- 2.1 Héroe del mock-up con la mención a la inversión, botón "Ver las tribus" y aviso "Prototipo interno · datos de ejemplo".
- 3.1 Pruebas e2e: orden de los caminos, recorrido solo con teclado (Tab por los tres, Shift+Tab, Enter hasta `/perfil`), 200 en `/perfil` y `/congreso`, cantidad de barrios, héroe, aviso, y que no aparezcan San Martín de los Andes ni Atlántico Sur.
- 4.1 `pnpm verificar` (172 tests) y `pnpm build` en verde. e2e sobre el preview: 8/8. Capturas sacadas.

## Qué decidir a la mañana
1. **Enlace roto a `/territorios/lighthouse` (media).** El camino "Explorar el Lighthouse" lleva a una ruta que en esta base da 404 (`lib/portada.ts:24`). La spec pide 200. Además el rail usa `/territorio` (`lib/navegacion.ts:26`), así que las dos rutas van a divergir. Las instrucciones del cambio se contradicen (la tarea 0.1 dice dejarlo y anotarlo; design.md dice frenar).
   - Acción sugerida: elegí la ruta oficial (`/territorios/lighthouse` o `/territorio`), unificá portada y rail, y no mergees este PR hasta que la ruta exista o aceptes explícitamente mergear con el enlace roto.
2. **Falta "y podés salir cuando quieras" con ⚖ `salida` (media).** Está en el mock-up (línea 412), pero ese término no está en el catálogo legal y la proposal dice no agregarlo. CLAUDE.md sí permite agregarlo como borrador (`borrador: true`).
   - Acción sugerida: decidí si se agrega a `lib/legal/terminos.ts` como borrador (y se suma la frase a la portada) o si queda afuera hasta otra revisión.
3. **Dónde están las capturas.** Están solo en carpeta local, ignorada por git, y no están en el PR (GitHub por línea de comandos no adjunta imágenes):
   - `/Users/gus/Documents/dev/NetXState/lighthouse-platform/.carriles/1/.noches/tmp/portada-escritorio.png` (1280x800)
   - `/Users/gus/Documents/dev/NetXState/lighthouse-platform/.carriles/1/.noches/tmp/portada-movil.png` (390x844)
   - Capturas del tester, también locales: `/tmp/qa-escritorio.png` y `/tmp/qa-movil.png`.
   - Acción sugerida: abrilas, y si querés que queden en el PR, adjuntalas a mano.
4. **Test inestable (no es del cambio).** `perfil.spec.ts:97` ("entrevista completa…") falló en el primer intento y pasó en el reintento. Se vieron dos pedidos del navegador (`OPTIONS /` y `HEAD /perfil`). Parece ruido del entorno y este cambio no toca perfil.
   - Acción sugerida: si vuelve a pasar en otras noches, pedí una spec para estabilizarlo.
5. **Observación fuera del PR.** En la captura móvil de página completa, la barra lateral verde termina antes del final de la página. Viene del rail de la rama base (`h-dvh`), no de este cambio.
   - Acción sugerida: corregirlo en el PR del rail.

## Revisor: veredicto y hallazgos
Veredicto final: con observaciones. Todo lo que podía corregir un agente quedó cerrado. Quedan para vos los hallazgos 1 y 2 (arriba) y la ubicación de las capturas.
- Hallazgo 1 (media): enlace 404. Pendiente de Gus.
- Hallazgo 2 (media): falta la frase de salida con ⚖. Pendiente de Gus.
- Hallazgo 3 (bajo): el test de teclado solo llegaba a "Encontrar mi tribu". Corregido: ahora recorre los tres.
- Hallazgo 4 (bajo): no se verificaba el 200 de `/perfil` y `/congreso`. Corregido.
- Hallazgo 5 (bajo): "1 barrios". Corregido, con test.
- Hallazgo 6 (bajo): faltaba la tarea 4.1 (capturas y e2e sobre el preview). Cerrada. La nota desactualizada de `tasks.md` también se actualizó.
- Aclaración: que el e2e pase en el preview y que `playwright screenshot` muestre el login de Vercel no se contradice. La configuración (`playwright.config.ts`, líneas 6-17) manda los encabezados de bypass y el comando de capturas no los usa.

Comentario completo: https://github.com/netxgen-2050/lighthouse-platform/pull/14#issuecomment-6040299804

## Tester: resultado
Pasa. Playwright sobre el preview: 71 pasaron, 0 fallas definitivas (un test inestable, ver punto 4). Guion manual 5/5:
- `/` responde 200 con aviso, héroe y tres tarjetas.
- Dice "12 barrios…".
- Con Tab el foco se ve y Enter lleva a `/perfil`.
- Congreso e Inicio del rail funcionan.
- A 390px hay una columna y no hay scroll horizontal; a 1280px hay tres columnas.

Los pendientes conocidos quedaron anotados y no son fallas. Reporte: https://github.com/netxgen-2050/lighthouse-platform/pull/14#issuecomment-6040325418

## Para la próxima noche
- Resolver la ruta oficial del Lighthouse (`/territorios/lighthouse` o `/territorio`) y alinear portada y rail.
- Si aprobás la frase de salida: agregar `salida` al catálogo legal como borrador y sumarla a la portada.
- Cuando exista `/sumarte`, activar el enlace "Elegí cómo sumarte" del héroe (hoy no se muestra).
- Mirar el test inestable `perfil.spec.ts:97` si se repite.
- Este PR apunta a `agente/navegacion-rail`, así que conviene mergear primero el del rail.
