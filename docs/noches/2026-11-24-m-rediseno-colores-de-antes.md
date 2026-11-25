# Noche 2026-11-24-m — rediseno-colores-de-antes
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/209 · **Preview:** https://lighthouse-platform-git-agente-red-26b04a-netxgen-2030-projects.vercel.app (ver la limitación más abajo: nadie lo pudo probar)

Rama `agente/rediseno-colores-de-antes`, base `spec/rediseno-correcciones` (no apunta a `dev`). Es la primera de las cuatro correcciones que pediste el 24-nov-2026 al revisar el rediseño (PR #207).

## En una línea
La app volvió a la paleta de colores del mock-up v6 y a seguir el tema del sistema por defecto. Todo pasa, pero hay dos colores que tenés que mirar y aprobar, y la prueba final no se hizo contra el preview.

## Qué quedó hecho (tareas 4/4)
- [x] 1.1 Paleta: `app/globals.css` vuelve a los colores de antes del PR #201 (claro como base, oscuro con `data-tema="oscuro"`). Las tipografías nuevas no se tocaron.
- [x] 1.2 Tema por defecto "sistema" (en `preferencias.ts` y en el script de apariencia). Si alguien ya eligió Claro u Oscuro, se respeta.
- [x] 2.1 Pruebas e2e de configuración adaptadas; axe en claro y oscuro sin violaciones serias o críticas.
- [x] 3.1 `pnpm verificar` (2759 tests), `pnpm build` y `openspec validate --strict` en verde.

Este cambio no incluye el mapa de equipos de Participa ni el manifiesto 2050: son otros cambios y no se hicieron acá.

## Qué decidir a la mañana
Primero lo que necesita tu sí, y después la limitación del preview.

1. **El gris de los bordes (`faint`, tema claro).** En el mock-up era #8a8678, que sobre el fondo da 3,28:1 y no llega al 4,5:1 que exige el test. El implementador lo oscureció a #6f6b5d (unos 4,8:1) y lo anotó en el PR y en un comentario del CSS. El revisor encontró que nadie usa `faint` como texto: solo se usa en bordes y líneas (unos 250 usos), y para eso alcanza 3:1. Efecto: todos los bordes de la app quedan algo más oscuros que en el mock-up.
   - Acción sugerida: **dejarlo como está** (más contraste, sin riesgo). La otra opción es volver al #8a8678 original y que el test de `faint` pida 3:1 en vez de 4,5:1. Es un cambio chico en `app/globals.css` y `lib/tema-contraste.test.ts`.
2. **Los tres tonos del medio de la escala `regen-2..4`.** `regen-1` (arcilla #c2571a) y `regen-5` (verde #3c8c4b) son de la paleta de antes. Los tres del medio los calculó el implementador por interpolación, porque el dorado original (#eda100) no llega a 3:1 sobre el fondo hueso. La spec decía que tenían que tomar valores de esa paleta, así que son colores nuevos. Pasan 3:1 en los dos temas.
   - Claro: #a97400, #86872a, #5a9444.
   - Oscuro: #e0a63a, #b8b94f, #8cc46a.
   - Acción sugerida: mirarlos en Inicio, Invertir y Mi tierra (barras de avance). Si te gustan, no hacer nada. Si no, decirme cuáles ajustar. El vidrio de los paneles no tuvo observaciones.
3. **Limitación: no se probó contra el preview.** El tester informó que Vercel no publicó el preview del último commit (110a3e7) en 15 minutos, así que probó en local con el build de producción de la rama. El bot de Vercel en el PR muestra un preview "Ready" (de las 09:57 UTC), pero no se pudo confirmar que corresponda al último commit. Los 5 pasos del guion se verificaron con tests y leyendo el CSS, no a mano en un navegador.
   - Acción sugerida: abrir el preview, ver que sea el commit 110a3e7 y recorrer vos el guion de prueba manual que está en la descripción del PR (5 pasos).

## Revisor: veredicto y hallazgos
- Primera vuelta: con observaciones, 4 hallazgos de severidad baja, ninguno bloquea.
  - Hallazgos 1 y 2: los de arriba (necesitan tu decisión).
  - Hallazgo 3: el test de paleta solo comparaba dos colores. Corregido: ahora compara los 29 tokens del claro y los 30 del oscuro contra los de antes (commit 110a3e7). `faint` claro tiene su propia comprobación.
  - Hallazgo 4: faltaba un comentario junto a `faint`. Corregido.
- Segunda vuelta: listo para revisión humana, 0 hallazgos nuevos, sin regresiones. `pnpm verificar` con 2759 tests ok. Un aviso de lint que ya existía antes en `app/territorios/[id]/vistas/paneles.tsx:83` (no es de este PR).
- Comentarios: https://github.com/netxgen-2050/lighthouse-platform/pull/209#issuecomment-7128282219

## Tester: resultado
Pasa, pero probado en local y no en el preview (ver punto 3 arriba).
- Suite e2e completa: 1353 ok, 1 falla, 3 omitidas.
- La falla: `e2e/consentimiento-alta.spec.ts:385` (re-consentimiento desde Entrar). Esperaba una versión y recibió vacío. Al repetir el archivo pasó (23 ok), así que es intermitente y sin relación con colores.
- Antes, en la corrida del implementador, falló una vez `e2e/reportes.spec.ts:214` (tiempo de espera) y también pasó al repetir. Son dos intermitentes distintos en dos corridas.
- `configuracion.spec` y `accesibilidad.spec` repetidos: 191 ok, sin violaciones serias o críticas en claro y oscuro (48 rutas, es y en). Contraste y configuración: 85 tests ok. Build ok.
- Comprobado: claro hueso #f6f3ea con acento #154626; oscuro #101a14 con acento #8fd0a0; "Borrar todo" vuelve a seguir al sistema. Los estados del mapa se distinguen por la forma del borde y no solo por el color.
- Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/209#issuecomment-7129088706

## Para la próxima noche
- Si decidís volver al #8a8678 en `faint`, o ajustar `regen-2..4`, es una corrección chica sobre este mismo PR.
- Revisar los dos tests intermitentes (`consentimiento-alta.spec.ts:385` y `reportes.spec.ts:214`): no son de este cambio, pero aparecieron dos veces seguidas.
- Quedan los otros tres cambios de corrección: Inicio y Explorar unificado, Participa con mapa de equipos, y manifiesto 2050.
- Si el preview vuelve a no publicarse, conviene mirar por qué Vercel tardó más de 15 minutos.
