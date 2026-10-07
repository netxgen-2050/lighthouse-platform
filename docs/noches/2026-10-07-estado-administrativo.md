# Noche 2026-10-07 — estado-administrativo
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/32 (base: `agente/territorio-macrolote`, no `main`) · **Preview:** https://lighthouse-platform-d2eblhxm5-net-xg-en.vercel.app (commit 469c196)

## En una línea
Nada falló: el aviso "Estado del loteo" (Soluna en trámite, aprobación municipal pendiente) ya se ve en el territorio y en la ficha de cada finca, y no hay ningún camino para comprar, reservar ni señar. Quedan tres cosas para que decidas vos.

## Qué quedó hecho (tareas 7/8)
- Hecho: el dato del estado administrativo de Soluna y la regla que, por ahora, solo permite "consultar" un lote (con o sin aprobación).
- Hecho: la lista de vistas que muestran lotes, con un test que avisa si alguna no lleva el aviso.
- Hecho: el término legal "loteo" con el ⚖, marcado como borrador (se lee "Borrador: texto a revisar").
- Hecho: el aviso completo arriba del mapa y el compacto en la ficha de cada finca. El expediente aparece como "sin dato".
- Hecho: pruebas e2e nuevas (fincas 502 y 501, sin botones de comprar/reservar/señar, 390 px sin scroll horizontal) y accesibilidad (axe) sin problemas.
- **Pendiente: tarea 4.1.** Falta la captura del aviso a 390 px. Está sin marcar.
- Atención: la tarea 0.1 está marcada como cumplida, pero `territorio-macrolote` todavía no está en `main` (ver abajo).

## Qué decidir a la mañana
1. **Orden de merge (hallazgo bajo).** Este PR apunta a `agente/territorio-macrolote`. Acción sugerida: mergear primero ese PR y después rebasar este contra `main`; o, si preferís no esperar, desmarcar la tarea 0.1.
2. **Botón "Consultar por este lote" (hallazgo bajo, pregunta abierta del design).** Sigue apareciendo en fincas de un loteo no aprobado, y la Ord. 173 prohíbe ofrecer y publicitar lotes no aprobados. Acción sugerida: preguntarle a Gabriel si "consultar" es aceptable; si no, sacar el botón antes de mostrar el mapa fuera del equipo. Está en `app/territorios/[id]/ficha-lateral.tsx:104`.
3. **Captura a 390 px (tarea 4.1).** Acción sugerida: sacarla desde el preview y adjuntarla al PR, o pedírsela al implementador la próxima noche.

## Revisor: veredicto y hallazgos
Veredicto final (2ª vuelta): con observaciones; nada corregible por agente, solo decisiones tuyas.
- Media, ya corregida (commit 469c196): había una frase legal escrita a mano en el componente, fuera del catálogo, que se mostraba siempre y podía contradecir "aprobada". Se sacó; el único texto sobre el tema vive en el catálogo, como borrador.
- Baja, abierta: tarea 0.1 marcada sin que `territorio-macrolote` esté en `main`.
- Baja, abierta: botón "Consultar" frente a la Ord. 173.
- El check de Vercel del último commit estaba en pendiente cuando el revisor miró; después quedó listo (Ready).

## Tester: resultado
Pasa. Playwright: 223 pasaron, 0 fallaron (incluye los 4 tests nuevos y axe en `/territorios/lighthouse`). Sin bloqueos de Vercel.
- Paso 1 (aviso en el HTML del territorio) verificado directo.
- Pasos 2 a 5 solo por Playwright, no recorridos a mano en un navegador. El texto "Borrador: texto a revisar" no se pudo ver por curl (está en un tooltip), lo cubre el e2e.
- Sugerencia: darle una mirada manual al preview, sobre todo en el celular.

## Para la próxima noche
- Resolver el orden de merge y rebasar este PR contra `main`.
- Según lo que diga Gabriel, quitar o cambiar el botón "Consultar por este lote".
- Sacar la captura a 390 px y cerrar la tarea 4.1.
- Cuando haya número de expediente real, reemplazar el "sin dato".
- Revisar el texto del término "loteo" (sigue en borrador) antes de cualquier uso fuera del equipo (pendiente R14).
