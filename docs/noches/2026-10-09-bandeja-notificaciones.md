# Noche 2026-10-09 — bandeja-notificaciones
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/45 · **Preview:** https://lighthouse-platform-9mvdzgnzk-net-xg-en.vercel.app

## En una línea
La bandeja de notificaciones con su campanita quedó hecha, revisada tres veces y probada en el preview: todo pasa. Hubo un problema de permisos con dos comentarios del revisor (ver abajo) y algunas cosas que no se repitieron a mano.

## Qué quedó hecho (tareas 4/4)
- 1.1 Registro de actividad en el navegador (`lib/actividad/`, clave `lh-actividad`), con tests.
- 1.2 Los eventos se registran en manifiesto, pactos, compromisos, postulación, congreso y semillas.
- 2.1 Campanita en el rail (con nombre accesible) y página `/bandeja`: orden de más nueva a más vieja, botón "Marcar todas como leídas" y sección "Mensajes". Test e2e nuevo (`e2e/bandeja.spec.ts`).
- F.1 `pnpm verificar` y `pnpm build` en verde. `/bandeja` sumada a la auditoría de accesibilidad (26 rutas).

## Qué falló o quedó sin verificar (leer primero)
- **Comentarios del revisor sin publicar:** en las vueltas 1 y 2 el revisor no pudo publicar su comentario en el PR (`scripts/pr.sh comentar` y `diff` pidieron una aprobación que no tenía). Sus hallazgos de esas vueltas solo están en el resumen del agente, no en el PR. Solo la vuelta 3 quedó publicada. Conviene revisar los permisos de `scripts/pr.sh` para el revisor.
- **Verificación incompleta en la última corrección (commit 1434f56):** el implementador corrió `pnpm verificar` completo (430 tests, verde), pero después quitó un `eslint-disable` sobrante y solo repitió `pnpm build`, sin volver a correr `verificar`. El revisor de la vuelta 3 tampoco corrió `verificar` completo ni el build: solo los tests de `lib/actividad` (12/12), eslint y tipos. La suite completa de e2e del tester (333 pasaron) sí corrió sobre el preview con esa corrección.
- **E2e parciales del implementador:** corrió solo bandeja, accesibilidad, marco, membresía, pactos, compromisos, postulación, congreso y semillas, no la suite completa. En la corrección 1 corrió solo `bandeja.spec.ts` (11 tests). La suite completa quedó cubierta por el tester.
- **Guion manual del tester:** los pasos 4 y 5 (pacto aceptado, ronda abierta, semillas, ticket de congreso, postulación) no se repitieron a mano; se dan por cubiertos con los e2e, que pasan en el preview.

## Qué decidir a la mañana
- **Orden de Tab (nota del revisor, sin urgencia):** la campanita quedó antes de "Inicio" (orden: Saltar al contenido, campanita, Inicio). Se actualizó `e2e/marco.spec.ts` para eso. Acción sugerida: aceptarlo, o pedir otro orden.
- **Texto "(simulado)":** se agregó a "Alguien se interesó en tu oferta (simulado)". Acción sugerida: dejarlo (es coherente con que todo es de ejemplo) o pedir que se saque.
- **Ubicación de la campanita:** como `rail-v2` no está en la base, quedó arriba del rail, debajo del logo. Acción sugerida: reubicarla cuando entre `rail-v2`.
- Ningún hallazgo de alta o media prioridad quedó abierto.

## Revisor: veredicto y hallazgos
Veredicto final (vuelta 3): listo para revisión humana, 0 hallazgos. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/45#issuecomment-6078571657

Recorrido:
- Vuelta 1 (con observaciones): media, faltaban tests e2e de pactos, compromisos, postulación, congreso y semillas; baja, el aviso decía "quedaron como leídas" aunque fallara el guardado; baja, `dateTime` usaba una fecha distinta de la mostrada; baja, el enlace de la actividad no se validaba (podía ser una URL externa vía localStorage).
- Corrección 1 (4b60322): los cuatro quedaron resueltos (tests por pantalla, aviso coherente, fecha visible, enlaces solo internos).
- Vuelta 2 (listo): hallazgo nuevo, baja: `"/\t/ejemplo.com"` pasaba la validación y el navegador lo convertía en `//ejemplo.com`.
- Corrección 2 (1434f56): `esRutaInterna` rechaza espacios y caracteres de control; 3 tests nuevos.
- Vuelta 3 (listo): sin hallazgos.

## Tester: resultado
Pasa. Playwright contra el preview: 333 pasaron, 0 fallaron. Guion manual OK en los pasos 1, 2, 3, 6, 7 y 8 (campanita sin número al inicio; 1 notificación tras adherir al manifiesto; 2 tras publicar una oferta, a los ~20 s; `/bandeja` desde la campanita con Enter; "Marcar todas como leídas" deja la campanita sin número; todo alcanzable con teclado). Pasos 4 y 5 cubiertos por e2e, no repetidos a mano. Sin bloqueos. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/45#issuecomment-6078623122

## Para la próxima noche
- La actividad se registra pero todavía no se muestra en ningún lado; la usará "Mi recorrido v2".
- Reubicar la campanita cuando entre `rail-v2`.
- Resolver el permiso de `scripts/pr.sh` (`comentar` y `diff`) para el revisor.
- Correr `pnpm verificar` completo sobre la rama final antes de mergear, ya que la última vuelta no lo repitió.
