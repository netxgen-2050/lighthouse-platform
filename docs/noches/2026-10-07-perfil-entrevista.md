# Noche 2026-10-07 — perfil-entrevista
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/6 · **Preview:** https://lighthouse-platform-cpw1ouhr5-net-xg-en.vercel.app (commit 2455b9e)

## Lo que falló o quedó trabado (primero)
- **El revisor y el tester no pudieron escribir ni comentar en el PR.** El revisor no tiene permiso de escritura ni de comentar. El tester no pudo escribir su archivo de reporte, y además se le negó el permiso para correr un test temporal contra el preview. En los dos casos el orquestador publicó los comentarios en el PR. No se esquivó nada. Falta darles esos permisos (ver "Para la próxima noche").
- **Este PR depende de otro.** Su base es `agente/congreso-registro`. Hay que mergear primero ese y después este.
- **Un aviso en los logs del e2e.** Durante el e2e local apareció un `NoFallbackError` de Next en el servidor, pero sin ningún test fallido. Conviene mirarlo, aunque no bloquea.
- Se usaron las dos vueltas de corrección que se permiten. Quedan solo asuntos de decisión tuya.

## En una línea
La página `/perfil` (entrevista de seis preguntas, con propuesta de dato y confirmación, todo solo en el navegador) quedó terminada, con el código en verde y el revisor conforme. Falta que decidas cuatro detalles y que mergees en orden.

## Qué quedó hecho (tareas 6/6)
- [x] 1.1 a 3.1: lógica, página `/perfil`, pruebas e2e y PR (hechos antes, ver `docs/noches/2026-10-06-perfil-entrevista.md`).
- [x] 4.1 Traer la base corregida: merge de `origin/agente/congreso-registro` sin conflictos.
- [x] 4.2 Colores sueltos de `app/perfil/**` reemplazados por tokens del tema y sin `<main>` propio (commit b7275d9).
- Correcciones de la revisión de hoy:
  - Foco al campo cuando se responde vacío, para que el lector de pantalla anuncie el error en cada intento (e4ca28c).
  - Lo mismo en "Confirmar corrección" con el campo vacío, con un test e2e nuevo (2455b9e).
  - Se actualizó el reporte del 6-oct, que había quedado viejo.

Estado actual (commit 2455b9e): `pnpm verificar` con 155 tests en verde, build en verde, e2e de perfil 10 de 10 en local.

## Qué decidir a la mañana
Ninguno es un error; son decisiones. Ninguno es alto ni medio.
1. **Respuestas guardadas sin vencimiento.** Quedan en el navegador hasta que alguien las borre. En una compu compartida (por ejemplo en el Congreso) la persona siguiente ve la entrevista de la anterior. Cumple la spec (hay aviso y botón de borrar). Acción sugerida: decidir si alcanza o si se pasa a `sessionStorage` o a un vencimiento. Recomiendo resolverlo antes del Congreso.
2. **Aviso de "tu navegador no permite guardar datos…".** No está en la spec y no tiene test. Acción sugerida: dejarlo y sumarlo a la spec (con test), o sacarlo. Es un texto nuevo de cara a la persona, conviene que lo mires.
3. **"Corregir" sobre datos ya confirmados.** En el mock-up v6 las acciones desaparecen al confirmar. Acá siguen. Acción sugerida: dejarlo o sacarlo.
4. **Diferencias con el mock-up en el cierre y el avance.** El cierre no dice "Encontré tres tribus…" (sugerir tribus está fuera de alcance; dice gracias y "Ver las tribus"). El avance cuenta datos confirmados, no preguntas respondidas. Acción sugerida: confirmar el texto de cierre y el modo de contar, o pedir cambios.
5. **Advertencia de no escribir datos sensibles.** No se agregó porque no hay texto aprobado. Acción sugerida: si la querés, pedile el texto a Gabriel y se suma.
6. **Permisos de los agentes.** Ver "Para la próxima noche". Es una decisión tuya sobre la configuración.

## Revisor: veredicto y hallazgos
Tres rondas. Veredicto final (commit 2455b9e): **listo para revisión humana**, 0 altos, 0 medios.
- Ronda 1 (b7275d9): con observaciones, 6 hallazgos bajos. Dos corregibles (foco con respuesta vacía; reporte del 6-oct desactualizado) y cuatro para vos (los puntos 1 a 4 de arriba).
- Ronda 2 (e4ca28c): las correcciones estaban bien; apareció un hallazgo bajo nuevo (foco en "Confirmar corrección" vacío).
- Ronda 3 (2455b9e): corregido, sin regresiones. Quedó un bajo en el reporte del 6-oct (decía 9 de 9 e2e y ahora son 10), que se arregló en esta misma rama.
- Reglas no negociables y seguridad: sin hallazgos. Cobertura de la spec: los 4 requisitos con test.
- El revisor corrió `pnpm verificar` (155 tests en verde), pero no corrió e2e ni build.

## Tester: resultado
Preview de commit 2455b9e: Playwright **36 pasaron, 0 fallaron** (incluye los 10 de `e2e/perfil.spec.ts`).
- Guion manual cubierto en parte: los pasos 1 a 10 se dieron por buenos según lo que cubre `e2e/perfil.spec.ts` contra el preview.
- **Sin verificar:** que haya un solo `<main>`, los colores del tema a ojo, el clic final a `/tribus` y la entrevista completa solo con teclado. Vale una mirada tuya en el preview.
- El tester dejó escritos `.noches/tmp/guion.spec.ts` y `guion.config.ts` sin correr. No se versionan.

## Para la próxima noche
- Dar al revisor permiso de escritura y de comentar en el PR, y al tester permiso de escribir en `.noches/tmp/` y de correr un test temporal, para que no dependan del orquestador.
- Cuando decidas los puntos 1 a 5, actualizar la spec y ajustar el código.
- Mergear primero `agente/congreso-registro` y después este PR (cambiar la base a `main` si hace falta). Nadie mergeó ni tocó `main`.
- Mirar el `NoFallbackError` de Next que salió en el servidor durante el e2e.
- Cuando exista el agente que propone datos de perfil, reemplazar solo `propuestaDePerfil`.
