# Noche 2026-11-24-m — explorar-unificado
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/210 · **Preview:** no hay (Vercel no generó preview en 15 min, dos veces). Rama `agente/explorar-unificado`, base `agente/rediseno-colores-de-antes`.

## En una línea
El código está hecho y el revisor lo dejó listo para revisión humana, pero el tester no pudo probar en Vercel (no hubo preview) y en local la suite completa tuvo 2 fallas que parecen intermitentes. Falta tu revisión a ojo.

## Qué falló o quedó sin verificar (primero)
- **Sin preview de Vercel.** No apareció en 15 minutos, en las dos pasadas del tester. Hay que revisar si el repo está conectado a Vercel. Todo se probó en local.
- **Dos fallas en la corrida completa local** (1357 pasaron, 2 fallaron, 3 omitidas): `e2e/consentimiento-alta.spec.ts:385` (esperaba canal `al-entrar` y versión `2026-11-24-borrador`, llegó null) y `e2e/membresia.spec.ts:182` (axe `document-title` en `/territorios/lighthouse`). Repetidas solas, pasaron las dos. Parecen intermitencias por carga y no del cambio, pero conviene mirarlas aparte. El `document-title` ya había salido una vez antes.
- **Sin verificación a ojo.** El guion manual y la revisión visual (mapa contra barra pegajosa, títulos en 390 px y en oscuro) no se hicieron. Solo los cubren los e2e. El `isolate` del mapa tampoco se vio con el desenfoque desactivado.
- **Última corrección sin tercera revisión** (tope de dos vueltas). La cubrió el tester.
- **Build y e2e completo no se repitieron** después del último commit (solo cambia dos expectativas de href en e2e).
- **Proceso huérfano:** quedó un `pnpm start` del tester en el puerto 3000 (tarea bu7gyvpsk). No se pudo cerrar sin `kill`. Cerralo vos.
- El implementador usó `sed -i` en algunos e2e, contra CLAUDE.md. El revisor miró el resultado y estaba bien.
- Un primer implementador de la vuelta 1 se colgó horas sin cambios y se lo detuvo. Se relanzó uno nuevo.
- El orquestador no escribió código. Nadie mergeó ni tocó `dev` ni `main`.

## Qué quedó hecho (tareas 6/6 en tasks.md, todas marcadas)
- Menú: Inicio (/) y Explorar. Participa aparece sola cuando exista (cambio 3).
- `/explorar` pública y bilingüe: héroe de Barrio Norte, barra de secciones pegajosa (#territorio, #barrio, #lotes, con `aria-current="location"`).
- `/territorios/lighthouse`, `/barrios/norte` y `/lotes` redirigen a `/explorar#…` conservando vista, fase y sel.
- Se borraron la subnavegación de Explorar y los layouts de territorios, lotes y tribus.
- Textos nuevos en `lib/idioma/textos/explorar.ts` (borrador).
- Jerarquía de títulos arreglada (`components/ui/titulo.tsx`). El Congreso apunta a `/explorar#territorio`.
- E2E nuevo `e2e/explorar.spec.ts` (9/9) y unos 15 specs adaptados.

## Qué decidir a la mañana
- **A. Lista de lotes duplicada.** Aparece en Territorio y en Lotes, y la página mide unos 5300 px a 1280. Acción sugerida: dejar solo una, o acortar la de Territorio.
- **B. Comunidades sin entrada en el menú** hasta que exista Participa. A `/tribus` solo se llega por la tarjeta de la portada. Acción sugerida: aceptarlo hasta el cambio 3, o poner un acceso temporal.
- **C. Tres avisos de estado administrativo completos antes del mapa.** Los exige `e2e/estado-administrativo`. Acción sugerida: decidir si se compactan y ajustar ese e2e.
- **D. Textos del héroe.** Los escribió un agente. Acción sugerida: leerlos y ajustarlos.
- **E. El Congreso sigue como vitrina.** Acción sugerida: reutilizarlo o retirarlo (decisión de producto).
- **F. Inglés a revisión nativa** (`docs/idioma/revisar-nativo.md`).
- **G. Warning de lint previo** en `paneles.tsx:84` (variable sin usar). No es de este cambio.
- **H. Las dos fallas intermitentes** (ver arriba). Acción sugerida: abrir una tarea aparte si se repiten.

## Revisor: veredicto y hallazgos
- **1ª pasada:** con observaciones (0 altas, 1 media, 4 bajas). https://github.com/netxgen-2050/lighthouse-platform/pull/210#issuecomment-7130967553. Corregibles: títulos h2 dentro de h2, código muerto en `app/territorios/[id]/page.tsx`, enlace del Congreso, e2e de sel/fase, `isolate` del mapa. Más las decisiones A a D.
- **2ª pasada:** listo para revisión humana. Los 5 hallazgos quedaron resueltos y apareció 1 bajo nuevo (`e2e/explorar.spec.ts:76`, débil). https://github.com/netxgen-2050/lighthouse-platform/pull/210#issuecomment-7131623137. Se corrigió en el commit 1633093.

## Tester: resultado
- **1º:** falla. Sin preview, probó en local. 1357 pasaron, 2 fallaron, 3 omitidas. Fallaron `e2e/congreso.spec.ts:71` y `e2e/congreso-en.spec.ts:57`, que esperaban el href viejo. La descripción del PR tenía afirmaciones inciertas. https://github.com/netxgen-2050/lighthouse-platform/pull/210#issuecomment-7132785193. Se corrigió en el commit f8f1f32 (e2e del Congreso y descripción del PR).
- **2º (final):** pasa en local, sin preview. Congreso pasa. Las dos fallas que quedaron son las intermitentes descritas arriba.

## Para la próxima noche
- Cambio 3 (Participa): que el menú marque Comunidades y se quite la excepción de `/tribus`.
- Conectar o revisar Vercel para tener preview.
- Mirar las dos intermitencias (`consentimiento-alta` y axe `document-title`).
- Si querés, otra pasada visual real: 390 px, oscuro, mapa contra barra pegajosa.
