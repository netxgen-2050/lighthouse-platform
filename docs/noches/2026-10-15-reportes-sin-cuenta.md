# Noche 2026-10-15 — reportes-sin-cuenta
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/73 · **Preview:** https://lighthouse-platform-g0jsnerl7-net-xg-en.vercel.app

## En una línea
Ahora cualquier persona, tenga cuenta o no, puede reportar un error o una idea desde cualquier página. Está todo hecho y probado, pero hay una decisión tuya pendiente (el 401) y dos cosas que no se pudieron probar contra GitHub de verdad. Nadie mergeó nada.

## Qué quedó hecho (tareas 13/13)
Según `tasks.md` hay 13 casillas marcadas y ninguna pendiente (el implementador habló de 14; la diferencia es de conteo, no falta nada).

- El botón Reportar aparece en todas las páginas para cualquiera.
- El diálogo sin cuenta avisa que el reporte se publica en GitHub, pide un email opcional y adjunta el contexto de la página sin datos sensibles (sin parámetros de la dirección).
- La ruta `POST /api/reportes` acepta pedidos sin sesión. Rechaza otro tipo de contenido (415), un origen ajeno (403) y pedidos de más de 64 KB (413). Un campo trampa responde 200 sin crear nada.
- Límite por IP sin cuenta: 5 cada 10 minutos y 30 por hora, por instancia. La IP se guarda hasheada y solo en memoria.
- El issue sale con la etiqueta `sin-cuenta`.
- Si la sesión venció, el diálogo pasa solo al modo sin cuenta, conserva lo escrito y lleva el foco al email.
- Docs y texto de política actualizados; tests unitarios y e2e agregados.
- `pnpm verificar` (893 tests) en verde, build en verde.

## Qué decidir a la mañana
Primero lo que necesita tu decisión, de más a menos importante.

1. **El 401 con sesión vencida (media).** Para arreglar el problema de la sesión vencida, el servidor ahora responde 401 cuando llegan credenciales que no valen. Eso es justo la alternativa que la decisión 2 del diseño había descartado, y se aparta del requirement "Servidor acepta pedidos sin sesión". Desde nuestro diálogo funciona bien. Acción sugerida: aceptarlo y actualizar la decisión 2 y el requirement; o pedir que se vuelva a la opción del cliente (mostrar los errores del 400 y avisar del cambio de modo). Es el único requirement de 12 que el revisor no da por cubierto, y depende de esto.
2. **Aviso de publicación fuera del catálogo legal (media).** El texto que avisa que el reporte se publica en GitHub, y qué datos se tratan, vive dentro del componente y no en `lib/legal/terminos.ts` ni marcado como borrador. Acción sugerida: moverlo al catálogo con `borrador: true`, o aceptarlo así como el aviso con cuenta que ya existía.
3. **Canal para borrar el email (media).** Quien reporta sin cuenta deja su email en el issue sin haber aceptado la política, y no hay un canal para pedir que lo borren (el procedimiento, borrar el issue entero, solo está documentado para el equipo). Acción sugerida: definir ese canal y decidir si alcanza con el aviso del diálogo hasta R14.
4. **Interruptor solo para el modo sin cuenta (baja).** Hoy el único corte de emergencia es quitar `REPORTES_GITHUB_TOKEN`, que corta también los reportes con cuenta. Acción sugerida: decidir si vale agregar una variable de entorno para apagar solo el modo sin cuenta (suma alcance).
5. **Inventario de datos en NS_platform (baja, pendiente mío no resuelto).** En `NS_platform/Documentation/backend/01 - Inventario de datos del POC.md`, línea 68, la fila "Reportes de bugs e ideas" no menciona la IP con hash en memoria ni el email que queda en el issue. Es otro repo y las reglas de este carril dicen trabajar solo dentro del repo, así que no lo edité. Acción: agregarlo vos o pedir una noche para eso.

Para tener en cuenta también, según el implementador:
- Si el repo pasa a público, hay que mover los reportes a un repo privado.
- El texto de política nuevo está en borrador, pendiente de R14.
- El límite por IP es de mejor esfuerzo (por instancia); sería real con Neon (L9).

## Qué no se pudo verificar
- **Envío real a GitHub (paso 6 del guion).** No se creó ningún issue de verdad; el envío correcto se probó con la ruta simulada. Tampoco se probó contra GitHub real en la implementación (sin credencial).
- **Límite con 6 reportes reales (paso 7).** El 429 solo se probó con la ruta simulada.
- Para cerrar ambos hace falta un preview con `REPORTES_GITHUB_TOKEN` y aceptar que se creen issues de prueba.
- 12 tests e2e se saltaron contra el preview remoto (descubrir-publico, perfil, pasaporte, privacidad, sumarte-acceso). El motivo no está confirmado; ninguno es de reportes.

## Revisor: veredicto y hallazgos
Veredicto final (tercera vuelta, commit f817efa): con observaciones, sin regresiones. Se usaron las dos vueltas de corrección permitidas.

- Primera vuelta, 7 hallazgos (0 altos, 3 medios, 4 bajos). Se corrigieron: sesión vencida sin explicación, test de teclado con `focus()` en vez de Tab, falta de test de cabeceras con política pendiente, e inventario a medias (solo en el código de este repo).
- Segunda vuelta: apareció el hallazgo del 401 y la falta de test del 400 con errores. Este último se corrigió con un e2e.
- Tercera vuelta: sin hallazgos nuevos. Quedan abiertos los puntos 1 a 5 de la sección anterior.
- Cobertura de la spec: 11 de 12 requirements. Falta "Servidor acepta pedidos sin sesión", según lo que decidas en el punto 1.
- Reglas de CLAUDE.md: sin cobros, solo tokens del tema, ningún `<main>` nuevo, errores en texto y no solo color, sin secretos.
- Una rama de una línea sigue sin test: el 400 sin errores, que cae en el error genérico. El revisor no la cuenta como hallazgo.

## Tester: resultado
Pasa, con los pasos 6 y 7 verificados solo con simulación.

- Playwright contra el preview: 527 pasaron, 0 fallaron, 12 saltados. Los 35 de reportes pasaron.
- Guion manual: pasos 1 a 5, 8 y 9 bien (botón en cinco páginas sin sesión, teclado, aviso, contexto sin query, email mal escrito, modo con sesión intacto, política pendiente).
- Ruta real en el preview: `text/plain` da 415 y un Origin ajeno da 403.
- Comentario completo en el PR: 6187555627.

## Para la próxima noche
- Resolver los puntos 1 a 4 y, según lo que decidas, abrir un cambio chico: actualizar la decisión 2 y el requirement, mover el aviso al catálogo legal, o agregar el interruptor.
- Definir el canal para pedir el borrado del email.
- Hacer una prueba con un preview que tenga `REPORTES_GITHUB_TOKEN` para cerrar los pasos 6 y 7.
- Actualizar el inventario de datos en NS_platform (punto 5).
- Revisar por qué se saltan 12 e2e contra el preview remoto.
- Antes de mostrar la plataforma fuera del equipo: revisar el texto de política en borrador (R14).
