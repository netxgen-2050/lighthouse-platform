# Noche 2026-10-07 — ajustes-semillas-canales-reportes
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/30 · **Preview:** https://lighthouse-platform-git-agente-ajustes-semilla-0c7dac-net-xg-en.vercel.app

## En una línea
Salió todo lo que pedía la spec y las pruebas pasan (218 de 218), pero quedan tres cosas para que decidas vos antes de mergear; la más importante es un error real en cómo /semillas reconoce el pacto de tiempo aceptado. Nadie mergeó.

## Qué quedó hecho (tareas 4/4)
- **Semillas (1.1):** el factor de evaluación quedó fijo en 1,0, sin fórmula. Enviar la ronda es simulado y no cambia las semillas. Solo un pacto de tiempo aceptado suma Semillas de tiempo. La frase "un servicio que no suma semillas" lleva el ⚖ del Pase Fundador. Un texto de la tarjeta de Tiempo se corrigió para decir "Todavía no tenés un pacto de tiempo aceptado".
- **Canales (2.1):** por debajo de 640 px las puertas son tarjetas apiladas (nombre, estado en texto y motivo); desde 640 px vuelve la tabla.
- **Reportes (3.1):** el diálogo de Reportar muestra el aviso de privacidad junto al campo de contacto.
- **Integración (4.1):** `pnpm verificar` y `pnpm build` en verde. Se actualizaron tests viejos (factor 1,67 y 252 semillas ya no valen) y se agregaron escenarios nuevos.
- Además se estabilizaron tres tests e2e (fogon, sumarte y semillas) que fallaban por la barra de Vercel (`vercel.live`), no por la app.

## Qué decidir a la mañana
1. **[media] El tipo de pacto aceptado se deduce de la pestaña que se mira en /pactos.** Si alguien acepta un pacto de tiempo y después toca la pestaña Convivencia o Plata solo para mirar, en /semillas el Tiempo pasa a "sin dato". Al revés, si acepta estando en Plata y luego toca Tiempo, aparecen Semillas calculadas con horas que nunca aceptó. Arreglarlo exige que `lib/pactos` guarde qué tipo se aceptó, y eso no figuraba en las partes afectadas de la propuesta. **Acción sugerida:** autorizar ese cambio chico en una spec corta nueva (guardar el tipo aceptado en el estado de pactos y leerlo desde semillas). Mientras no se arregle, el error se puede ver en el prototipo.
2. **[baja] El aviso de privacidad de Reportar está escrito dentro del componente** (`components/boton-reportar.tsx:256`), no en `lib/legal/terminos.ts` ni marcado como borrador. La spec dictaba el texto literal, así que no incumple la spec; pero CLAUDE.md pide que los textos legales vivan en el catálogo. **Acción sugerida:** decidir si un aviso sobre datos personales cuenta como texto legal; si sí, moverlo al catálogo con `borrador: true`.
3. **[baja] En /canales los ⚖ quedan duplicados en el DOM**, porque tarjetas y tabla conviven y una se oculta con CSS. Se ve bien, pero un lector de pantalla o un test podrían encontrar dos veces el mismo término. **Acción sugerida:** aceptarlo por ahora o pedir que se renderice solo una de las dos vistas.

También anotado en el PR: el tipo de pacto se deduce de la pestaña guardada (es el mismo tema del punto 1).

## Revisor: veredicto y hallazgos
Veredicto final (2ª vuelta): **con observaciones**.
- Primera vuelta: 3 hallazgos. El de severidad baja sobre el texto de la tarjeta Tiempo se corrigió (commit 3200ab0) y el revisor lo verificó leyendo el diff (no volvió a correr tests).
- Quedan los dos que necesitan tu decisión (puntos 1 y 2 de arriba). Sin hallazgos nuevos.
- Cumple las reglas de CLAUDE.md revisadas: solo tokens del tema, un único `<main>`, el estado de las puertas se dice en texto y no solo con color, el ⚖ se alcanza con teclado, no hay cobros ni secretos. Las cinco exigencias de la spec quedan cubiertas, con la salvedad del punto 1.
- Comentarios: [1ª vuelta](https://github.com/netxgen-2050/lighthouse-platform/pull/30#issuecomment-6047235992) · [2ª vuelta](https://github.com/netxgen-2050/lighthouse-platform/pull/30#issuecomment-6047262159)

## Tester: resultado
- **Primera pasada** (commit 3200ab0): 214 pasaron, 1 falló, 2 inestables. Las tres causas eran ajenas al cambio: la barra de Vercel hace un pedido a `vercel.live` y los tests de "sin red" lo contaban. Además el paso del ⚖ en la tarjeta Plata no tenía test propio.
- **Segunda pasada** (commit 28f2f9f, tras las correcciones): **218 pasaron, 0 fallaron, 0 inestables.** Sin bloqueos.
- **Guion de prueba, pasos 1 a 5 cubiertos, pero con los e2e, no navegando a mano:** pacto de 20 h/mes da 150 y ronda 5/5 con factor 1,0; pacto de convivencia no suma; ⚖ del Pase en la tarjeta Plata (test nuevo); tarjetas a 320 px y tabla desde 640 px; aviso de privacidad en Reportar.
- Una cosa a tener en cuenta: el test de semillas "no manda datos a un servidor" fallaba de forma intermitente por dos GET al propio origen, y el implementador no pudo reproducirlo contra el código anterior. Se ajustó para ignorar `vercel.live` y contar solo pedidos que no son GET o van a otro origen; conviene vigilar si vuelve a aparecer.
- Comentarios: [1ª](https://github.com/netxgen-2050/lighthouse-platform/pull/30#issuecomment-6047305427) · [2ª](https://github.com/netxgen-2050/lighthouse-platform/pull/30#issuecomment-6047358951)

## Para la próxima noche
- Spec corta para que `lib/pactos` guarde el tipo de pacto aceptado y `/semillas` lo use (decisión 1). Con eso se pueden sumar tests del caso de cambiar de pestaña, que hoy no están.
- Según lo que decidas en el punto 2, mover el aviso de privacidad al catálogo legal como borrador.
- Revisar una vez a mano en el preview los cinco pasos del guion, ya que esta noche se verificaron solo con e2e.
