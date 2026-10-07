# Noche 2026-10-07 — territorio-macrolote
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/31 · **Preview:** https://lighthouse-platform-lb0fzkma2-net-xg-en.vercel.app

## En una línea
El mapa del territorio quedó rehecho sobre el Macrolote 7 con ficha lateral y las 4 tareas hechas, pero hay dos problemas en los datos de las fincas que solo vos podés decidir, y un test e2e que falla de vez en cuando por algo ajeno al cambio. Nadie mergeó.

## Qué quedó hecho (tareas 4/4)
- 1.1 Datos: el GeoJSON de BioPueblo está en `lib/territorios/biopueblo-territorios.json`, con funciones y tests (12 barrios, 175 fincas, conteos 5/5/2). Se borró la geometría ilustrativa anterior.
- 2.1 Mapa en `/territorios/lighthouse`: fondo satelital Esri con atribución, Macrolote 7, 12 barrios, terreno común, Soluna con sus fincas, lugares y contexto apagado. Leyenda con texto y aviso de distribución ilustrativa.
- 2.2 Ficha lateral (resumen, barrio, común, finca, lugar). Las fincas disponibles ofrecen "Consultar por este lote" (simulado). Ya no hay listado de tribus. Lista "Elegir en el mapa" usable con teclado y con región aria-live.
- 3.1 Tests e2e de territorio y accesibilidad actualizados.
- 4.1 `pnpm verificar` (338 tests) y `pnpm build` en verde.
- Extras: término legal `agencia` (borrador), superficie "~993 ha", clave `consultasLotes` en `lib/demo/claves.ts` y parámetro `?sel=<id>` (era opcional en el design).

## Qué decidir a la mañana
1. **`finca-None` (media).** Es una finca sin número que sigue marcada como disponible y ofrece "Consultar por este lote". Se muestra como "Finca sin número". Acción sugerida: decidir si es una finca real (y qué número lleva) o un error del generador `generar_territorios.py`. Si es error, corregir el generador y regenerar el JSON.
2. **`finca-303` duplicada (media).** El id aparece dos veces en el JSON. Eso da claves React repetidas, dos botones y un polígono que pisa al otro. Los conteos 175/167 del test incluyen el duplicado y `finca-None`. Acción sugerida: corregir en el origen (generador) y ajustar los números del test. Este punto y el anterior quedaron sin tocar por decisión tuya.
3. **Textos de borrador.** Hay que revisar `agencia`, los textos del terreno común y los de los lugares. Son de ejemplo, y `agencia` está con `borrador: true`. Acción: leerlos y aprobarlos o reescribirlos antes de mostrar fuera del equipo.
4. **Polígonos sin foco por Tab.** Los polígonos son Canvas y no se enfocan con el teclado. Con Tab se llega a los marcadores de barrios, común y lugares, y a la lista "Elegir en el mapa", que sí permite elegir fincas. Acción: aceptar esto como solución por ahora o pedir una spec para mejorarlo.
5. **Test e2e intermitente (ajeno al cambio).** `e2e/sumarte.spec.ts:43` falló una vez porque la barra del preview de Vercel mandó un POST a `vercel.live/login/validate`. Aislado pasa 13/13. Acción: aplicar el mismo filtro de `vercel.live` que ya tienen pactos y fogon en `sumarte.spec.ts` y en otros tests "sin red". No se aplicó porque se agotó el cupo de vueltas.

## Revisor: veredicto y hallazgos
Veredicto final (ronda 2): con observaciones.
- Ronda 1: 2 altas, 1 media, 3 bajas.
  - Alta: 118 fincas sin superficie mostraban "0 m²". Corregido: ahora dice "sin dato".
  - Alta: la finca sin número aparecía como "Finca 0". Cambió a "Finca sin número", pero el problema de fondo sigue (decisión 1).
  - Media: `finca-303` duplicado (decisión 2).
  - Bajas corregidas: la cantera se distinguía solo por color (ahora es punteada), el reencuadre solo ocurría al elegir finca (ahora también barrio y común) y los nombres de lugares salían crudos (mapeo en `lib/territorios/textos.ts`).
- Ronda 2: quedan solo las 2 medias que necesitan tu decisión. El revisor no corrió verificar ni Playwright en esa ronda.
- Comentarios: https://github.com/netxgen-2050/lighthouse-platform/pull/31#issuecomment-6047328840 y https://github.com/netxgen-2050/lighthouse-platform/pull/31#issuecomment-6047368278

## Tester: resultado
Falló en la ronda 1 y pasó en la ronda 2, con un intermitente ajeno.
- Ronda 1: 216 OK y 2 fallas. Una fue el selector del barrio 6, ambiguo entre marcador y lista (`e2e/territorio.spec.ts:29`, test viejo). La otra fue un POST de `vercel.live` en `e2e/fogon.spec.ts:33`. Se corrigieron ambas (commit 9c0bbcc).
- Ronda 2, sobre el preview del commit 9c0bbcc: corrida 1 con 217 OK y 1 falla; corrida 2 con los 218 (uno pasó en reintento). La falla intermitente es la de `sumarte.spec.ts:43` (decisión 5).
- Guion manual de 7 pasos: OK, cubierto por `territorio-mapa.spec.ts` y `territorio.spec.ts`. Sin bloqueos.
- Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/31#issuecomment-6047482379

## Para la próxima noche
- Poner el filtro de `vercel.live` en `sumarte.spec.ts` y en los demás tests "sin red".
- Una vez decidido lo de `finca-None` y `finca-303`, corregir el generador y regenerar el JSON, y ajustar los conteos del test.
- Revisar y aprobar los textos de borrador (`agencia`, común, lugares).
- Evaluar una spec para el foco por teclado en los polígonos del mapa.
