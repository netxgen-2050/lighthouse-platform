# Noche 2026-10-06 — perfil-entrevista
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/6 · **Preview:** https://lighthouse-platform-bfklpsbiv-net-xg-en.vercel.app (commit c8937ff, desactualizado: el código cambió desde entonces)

## Lo que falló o quedó trabado (primero)
- **El tester no pudo publicar su reporte en el PR**, ni en la primera ni en la segunda pasada. La herramienta de escritura rechazó el archivo temporal `.noches/tmp/reporte-6.md`, que hace falta para `gh pr comment --body-file`. No se esquivó. Falta ese permiso. El texto del comentario está más abajo, para que lo publiques vos. Los logs están en `.noches/tmp/e2e-6.txt` y `.noches/tmp/e2e-6b.txt`.
- **Este PR depende de otro.** Su base es `agente/congreso-registro`, así que hay que mergear primero ese (PR de congreso-registro) y después este.
- Una prueba falló en la primera pasada del tester (ver "Tester"). Era un problema del test, no de la app, y ya se corrigió.

## En una línea
La página `/perfil` hace seis preguntas de a una, propone un dato de perfil con cada respuesta y la persona lo confirma o lo corrige. Todo queda solo en el navegador. Está terminada y con las pruebas en verde, pero hay decisiones tuyas pendientes.

## Qué quedó hecho (tareas 6/6)
- [x] 1.1 Lógica: las 6 preguntas del mock-up, `propuestaDePerfil` (la única función que mañana reemplaza el agente) y el estado (responder, confirmar, corregir, borrar).
- [x] 2.1 Página `/perfil`: conversación, panel "Tu perfil", avance, aviso de datos locales y "Borrar mis respuestas".
- [x] 2.2 Pruebas e2e, incluida la de "sin pedidos al servidor".
- [x] 3.1 Verificar y build en verde; PR con guion de prueba.
- [x] 4.1 Traer la base corregida (merge de `agente/congreso-registro`).
- [x] 4.2 Colores sueltos de `app/perfil/**` reemplazados por tokens del tema y sin `<main>` propio.

Estado actual (commit b7275d9 más la vuelta de corrección): `pnpm verificar` con 155 tests y build en verde; `e2e/perfil.spec.ts` local, 10 de 10 (al commit 2455b9e; ver el reporte del 7-oct). Los números "22 de 22" (local y preview) son del commit c8937ff y **no se volvieron a medir** sobre el commit actual; falta repetir el preview y la corrida completa del tester.

## Qué decidir a la mañana
**Decisiones que dejó el revisor (baja gravedad, no las corrigió el agente):**
1. **Aviso de error de almacenamiento.** Si el navegador no deja guardar, la pantalla dice "tu navegador no permite guardar datos…". La spec no lo pide. Acción sugerida: dejarlo y sumarlo a la spec, o sacarlo. Como es un texto nuevo de cara a la persona, conviene que lo mires vos.
2. **Respuestas guardadas sin vencimiento.** Las respuestas libres quedan en el navegador hasta que alguien las borre. En una computadora compartida (por ejemplo en el Congreso), la persona siguiente ve la entrevista de la anterior. Cumple la spec (hay aviso y botón de borrar). Acción sugerida: decidir si alcanza, o si se guarda solo mientras dure la sesión o con un vencimiento. Recomiendo resolverlo antes del Congreso.

**Decisiones que dejó el implementador:**
3. **Texto de cierre.** El mock-up dice "Encontré tres tribus para mostrarte…". No se copió porque sugerir tribus está fuera de alcance. El cierre dice solo gracias y "Ver las tribus". Acción: confirmar ese texto o pedir otro.
4. **Avance n/6.** Se cuenta sobre los datos confirmados, no sobre las preguntas respondidas. La pregunta actual se muestra aparte. Acción: confirmar que está bien así.
5. **Pregunta 1 sin el "Lucía"** del ejemplo del mock-up. Acción: confirmar.
6. **"Corregir" también sobre datos ya confirmados.** Es un agregado chico fuera de la spec. Acción: dejarlo o sacarlo.
7. **Sin advertencia de no escribir datos sensibles**, porque no hay un texto aprobado. Acción: si la querés, pedile el texto a Gabriel y se suma.

**Para publicar en el PR (el tester no pudo):** el comentario está en la sección "Tester".

## Revisor: veredicto y hallazgos
**Nota:** el veredicto de abajo es de una revisión anterior, sobre commits previos al b7275d9 (tareas 4.1 y 4.2 y correcciones). El cambio se revisa de nuevo; todavía no hay veredicto sobre el estado actual.

Primera vuelta: con observaciones (5 hallazgos: 0 altos, 2 medios, 3 bajos). Segunda vuelta: **listo para revisión humana**.
- Resueltos por el implementador (commit 197bf8f):
  - [media] Se perdía el foco del teclado al confirmar, confirmar una corrección o cancelar. Ahora vuelve al botón "Corregir" del ítem.
  - [media] Se perdía el foco al responder la sexta pregunta. Ahora va a "Ver las tribus". Se agregó un test.
  - [baja] El texto "Podés revisar tu perfil a la derecha." era incorrecto en el celular. Ahora dice "Podés revisar y confirmar los datos de tu perfil."
- Quedan para vos: los hallazgos 1 y 2 de la lista de decisiones (aviso de almacenamiento y retención de respuestas).
- Las reglas de la spec están cubiertas y nada choca con las reglas no negociables. Las preguntas coinciden con el mock-up v6.
- El revisor no corrió los tests localmente.
- Comentarios: https://github.com/netxgen-2050/lighthouse-platform/pull/6#issuecomment-6026513733 y https://github.com/netxgen-2050/lighthouse-platform/pull/6#issuecomment-6026542307

## Tester: resultado
- **Primera pasada** (preview lighthouse-platform-f1xvj0oob-net-xg-en.vercel.app): 21 pasaron, 1 falló. Falló `e2e/perfil.spec.ts:95` ("entrevista completa… sin pedidos al servidor") por un pedido `POST` a `vercel.live`. Es la barra de Vercel de los previews, no la app. No se pudo confirmar en local porque `pnpm build && pnpm start` estaba bloqueado en el entorno.
- **Corrección** (commit c8937ff): el test ahora separa dos controles. En el origen de la app falla cualquier pedido que no sea GET. En cualquier origen falla todo pedido que lleve las respuestas del test en la URL o el cuerpo. El implementador no lo corrió contra el preview.
- **Segunda pasada** (commit c8937ff, preview lighthouse-platform-bfklpsbiv-net-xg-en.vercel.app): **22 pasaron, 0 fallaron.** No hubo pasada manual aparte: los 10 pasos del guion los cubren los e2e, todos verdes contra el preview.

Texto del comentario que el tester quería publicar en el PR:

> ## Prueba (agente tester)
> Preview: https://lighthouse-platform-bfklpsbiv-net-xg-en.vercel.app (commit c8937ff, desactualizado: el código cambió desde entonces)
> Resultado: ✅ pasa
> Playwright: 22 pasaron, 0 fallaron; el test que fallaba por el POST a vercel.live ahora pasa
> Guion manual: no hubo pasada manual aparte; pasos 1-10 (pregunta 1 y panel 0/6; respuesta vacía con error; responder; confirmar → 1/6; corregir y confirmar; propuesta larga recortada con "…"; recarga conserva estado; borrar reinicia; completar las 6: agradecimiento, "Ver las tribus" a /tribus y sin pedidos de la app; teclado y foco) cubiertos por e2e, todos verdes.

## Para la próxima noche
- Dar permiso de escritura en `.noches/tmp/` para que el tester pueda publicar su comentario con `gh pr comment --body-file`.
- Cuando decidas lo de las respuestas guardadas y el aviso de almacenamiento, actualizar la spec y ajustar el código.
- Mergear primero congreso-registro y después este PR (cambiar la base a `main` si hace falta).
- Cuando exista el agente que propone datos de perfil, reemplazar solo `propuestaDePerfil`.
- Nadie mergeó ni tocó `main`.
