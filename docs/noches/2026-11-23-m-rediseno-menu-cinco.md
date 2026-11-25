# Noche 2026-11-23-m — rediseno-menu-cinco
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/203 · **Preview:** https://lighthouse-platform-git-agente-red-1f1255-netxgen-2030-projects.vercel.app (ver el aviso de abajo: no se pudo probar ahí)

Atención: este PR apunta a `agente/rediseno-sistema-visual`, no a `dev`. Es el segundo de cinco cambios de `rediseno-defi-tierra`.

## En una línea
El menú pasó de 14 destinos a cinco (Explorar, Bien común, Invertir, Sumarte, Mi tierra), con subnavegación de Explorar y menú desplegable en el celular. Todo pasa en local, pero no se pudo probar en Vercel y hay dos decisiones tuyas pendientes.

## Qué falló o quedó sin hacer (primero)
- **No se probó en el preview de Vercel.** El tester esperó 15 minutos con `scripts/preview-url.sh` y no encontró preview para el commit `bee383b`. Ojo: el comentario del bot de Vercel en el PR dice "Ready" con una URL de preview (la de arriba, actualizada a las 21:24 UTC). Puede ser que el preview sí exista y que el script no lo esté encontrando (el nombre de la rama aparece recortado como `agente-red-1f1255` en la URL). No pude confirmar a qué commit corresponde ese preview. Todo se probó en local.
- **El guion manual no se recorrió a mano.** Los 7 pasos se verificaron a través de los e2e de `e2e/marco.spec.ts`. El paso 7 (sin candado en el rail) no se comprueba de forma explícita: el e2e verifica que la barra tenga Menú, idioma, Sumarte y Entrar, pero no la ausencia del candado.
- **Tarea 2.2 sin cumplir como estaba escrita.** Pedía un test de unidad con Testing Library. El repo no la tiene (ni jsdom) y la spec prohíbe dependencias nuevas. Hay un test de unidad del marcado cerrado, y abrir, elegir, Escape y foco van por e2e en navegador real.

## Qué quedó hecho (tareas 8/8 marcadas)
Las 8 tareas figuran como hechas en `tasks.md`, con la salvedad de la 2.2 explicada arriba.
- Cinco destinos sin títulos de grupo. Invertir y Mi tierra (y Barrios en la subnavegación) están declarados como "no existe todavía" y no se ven hasta que los cambios 3 a 5 creen sus páginas. Hoy el rail muestra Explorar, Bien común y Sumarte.
- Fogón, Pactos, Semillas, Compromisos y Congreso salieron de todo menú. Sus páginas, URL y permisos siguen igual.
- Explorar se marca en `/`, `/territorios`, `/barrios`, `/lotes` y `/tribus`. La subnavegación (Territorio, Lotes, Comunidades) aparece en esas tres páginas, no en la portada.
- Rail angosto de 80 px desde 768 px, sin candados. En celular hay un botón "Menú" con panel (Escape lo cierra y el foco vuelve al botón).
- Se adaptaron 12 specs e2e y se agregaron casos nuevos. Los de `sumarte-acceso` y `descubrir-publico`, que probaban el candado del rail, ahora comprueban que el rail no ofrece esos destinos y que entrar por URL sigue pidiendo plan Miembro.

## Qué decidir a la mañana
1. **Admin en el panel del celular (hallazgo 5, fuera de spec).** El implementador lo agregó por su cuenta, solo para super admin, y la spec no lo menciona. Acción sugerida: dejarlo (es chico y solo lo ve el super admin) o pedir que se saque. Hay que decidirlo antes de integrar.
2. **Tarea 2.2 sin Testing Library (hallazgo 6).** Acción sugerida: aceptar la cobertura actual (unidad del marcado cerrado más e2e en navegador real) y ajustar el texto de la tarea, o aprobar agregar `jsdom` y Testing Library en un cambio aparte.
3. **Nombres sin fuente en el glosario.** Se eligió "Neighborhoods" para Barrios en inglés y los íconos Telescope, TrendingUp, Mountain y Building2. Acción sugerida: mirarlos y cambiarlos si preferís otros.
4. **Vercel.** Revisar si el preview del PR está en verde y probar a mano el guion del PR (sobre todo el paso 7, sin sesión). Si el preview no existe, revisar la conexión del repo con Vercel o cómo `scripts/preview-url.sh` arma la URL.

## Revisor: veredicto y hallazgos
- **Primera pasada: con observaciones.** No pudo comentar en el PR (permiso rechazado).
  - (1, media) El panel del celular no se cerraba al elegir el destino actual.
  - (2, media) Los destinos en pausa no volvían al menú al quitar la marca `oculto`, lo que rompía el escenario "Volver a mostrarlo".
  - (3, baja) `destinoActivo()` solo se usaba en el test.
  - (4, baja) Faltaba un e2e sin sesión a 390 px.
  - (5 y 6) Quedaron para tu decisión (arriba).
- **Vuelta de corrección (una de dos).** El implementador corrigió 1 a 4: el panel se cierra al elegir cualquier destino; `destinosDelMenu()` lo usan el rail y el celular, con test de unidad; la marca de destino activo quedó unificada (ya no puede haber dos a la vez); y se agregó el e2e sin sesión a 390 px. No tocó 5 ni 6. En esa vuelta no corrió el e2e completo.
- **Segunda pasada: listo para revisión humana.** 0 hallazgos nuevos, 4 correcciones verificadas, sin regresiones y los 8 requisitos de la spec cubiertos. `pnpm verificar`: 2681 tests en verde. e2e de marco: 39 de 39. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/203#issuecomment-7114461386

## Tester: resultado
- **Pasa en local, no contra Vercel.** `pnpm build` en verde. Playwright: 1303 pasaron, 0 fallaron, 3 omitidos (5,3 min).
- Aviso de lint que ya existía: variable `_` sin usar en `app/territorios/[id]/vistas/paneles.tsx`.
- La primera corrida del e2e completo del implementador falló una vez por un error de descarga de fuentes de Google (red) y pasó al repetir.
- No hubo vuelta del tester después de las correcciones. Su corrida fue sobre `bee383b`, que ya incluye las correcciones.
- Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/203#issuecomment-7114986349

## Para la próxima noche
- Resolver las decisiones 1 y 2 antes de integrar el PR, y dejar el Vercel claro para poder probar el preview.
- Agregar un chequeo explícito de "sin candado" en el rail sin sesión, para cubrir el paso 7 del guion.
- Los cambios 3 a 5 de `rediseno-defi-tierra` (páginas de Invertir, Mi tierra y Barrios) harán que esos destinos aparezcan solos en el menú.
- Revisar la solución del warning de lint de `paneles.tsx` si se quiere dejar el build sin avisos.
