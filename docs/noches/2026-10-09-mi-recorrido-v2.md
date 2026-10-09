# Noche 2026-10-09 — mi-recorrido-v2
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/48 (apunta a `agente/bandeja-notificaciones`, no a `main`) · **Preview:** https://lighthouse-platform-93qo2cdnw-net-xg-en.vercel.app

## En una línea
Mi recorrido (/panel) ahora te dice cuál es tu próximo paso y qué te pasó (línea de tiempo por día), con pestaña Bitácora. Todo quedó hecho y en verde, pero hay dos decisiones tuyas pendientes y una cosa que quedó apagada a propósito.

## Qué quedó hecho (tareas 3/3)
- 1.1 Cálculo del próximo paso (`lib/panel/proximo-paso.ts`) con tests. Orden: perfil, comunidad, pacto, identidad, ticket.
- 1.2 /panel rehecho: Tu próximo paso, Tu camino (línea de tiempo por día, cada evento con enlace) y pestaña Bitácora. /panel/bitacora abre esa pestaña. "Borrar todo" ahora también borra actividad y notificaciones. Se eliminaron `app/panel/resumen.tsx` y `lib/demo/resumen.ts`. Tests e2e reescritos.
- F.1 `pnpm verificar` y `pnpm build` en verde; /panel/bitacora sumada a la auditoría de accesibilidad (27 rutas).
- Criterios que eligió el agente (no estaban en la spec): perfil completo = los 6 datos confirmados; adherir cuenta desde que se hace el pedido; un pacto cuenta desde que se envía (el borrador no). Los compromisos ya no aparecen en Mi recorrido, porque la spec los quita.

## Qué decidir a la mañana
1. **El paso de identidad nunca aparece (media).** En `lib/panel/proximo-paso.ts:85`, `quiereInvertir` está fijo en `false`. Está así porque todavía no existe el cambio `pasaporte-sellos` (que da el sello de identidad y el dato de si la persona quiere invertir). Si no, quien quisiera invertir quedaría trabado sin salida. Acción sugerida: dejarlo apagado y cablearlo cuando se haga `pasaporte-sellos`; anotarlo en esa spec.
2. **Un aporte en plata cuenta como "pacto propuesto" (media).** En `lib/panel/proximo-paso.ts:84`, quien hizo un aporte pasa el paso "Proponé un pacto", y en Tu camino no aparece "Propusiste un pacto". Acción sugerida: decidir si un aporte debe contar como pacto; si no, separar las dos cosas y mostrar el evento "Propusiste un pacto" en la línea de tiempo.
3. **Mergear en orden.** Este PR depende de `agente/bandeja-notificaciones` (lee `lib/actividad`). Mergear primero ese.

## Revisor: veredicto y hallazgos
Veredicto final (vuelta 3): con observaciones. Quedan solo los dos hallazgos de arriba (ambos medios, decisión tuya). Ya corregidos:
- `aria-controls` apuntaba a un id inexistente y el panel no tenía `tabIndex`: ahora los dos paneles están siempre presentes (con `hidden`) y con `tabIndex=0`.
- El test e2e de red era más débil: se restauró la cobertura.
- El e2e no verificaba que el dato se guardó antes de abrir /panel: se agregó la aserción de `lh-perfil-entrevista`.

Notas: en la 1ª revisión el permiso rechazó `scripts/pr.sh comentar` y `scripts/pr.sh diff`, así que ese comentario no se publicó y el revisor trabajó con `git diff`. Las vueltas 2 y 3 sí publicaron comentario (issuecomment-6078799324 y issuecomment-6078823101). El revisor no corrió Playwright.

## Tester: resultado
Pasa, sin bloqueos. Playwright contra el preview: 336 pasaron, 0 fallaron, 1 inestable. El inestable es `e2e/perfil.spec.ts:97` ("entrevista completa: cierre con enlace a tribus y sin pedidos al servidor"): en la primera corrida registró pedidos OPTIONS / y HEAD /perfil contra el dominio del preview y pasó al reintentar. Parece ruido del preview; vigilar si se repite. Guion manual 6 de 6 bien, pero sin recorrido aparte en navegador: se dio por cubierto con `panel.spec.ts` y `bitacora.spec.ts`, y /panel/bitacora responde 200. El paso de identidad está apagado. Reporte en el PR: issuecomment-6078881137.

## Para la próxima noche
- Cablear el paso de identidad cuando exista `pasaporte-sellos`.
- Resolver el criterio de aporte versus pacto (decisión 2) y, si corresponde, agregar "Propusiste un pacto" a Tu camino.
- Vigilar el test inestable de `perfil.spec.ts:97`.
- Si querés una prueba manual real de /panel en el navegador, seguir el guion del PR (6 pasos).
- Revisar que el permiso de `scripts/pr.sh comentar` y `diff` funcione para el revisor en la primera pasada.
