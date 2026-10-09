# Noche 2026-10-09 — asistente-hifa
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/46 · **Preview:** https://lighthouse-platform-hq73apjqt-net-xg-en.vercel.app

## En una línea
Salió Hifa, el asistente simulado (chat guionado, sin IA) en todas las páginas, y el botón Reportar pasó a una pestaña vertical a media altura. Nada falló de forma grave: el revisor lo dejó listo y el tester pasó la suite, con una falla intermitente en perfil que no se comprobó contra main.

## Qué quedó hecho (tareas 3/3)
- 1.1 Guion, estado y armado del reporte de Hifa (`lib/hifa/`), con tests.
- 1.2 Avatar, botón y ventana de chat en el layout; Reportar movido al borde derecho a media altura; e2e a 1280 y 390 px.
- F.1 Verificación, build, accesibilidad y PR con guion de prueba.

Cómo funciona, en simple: botón abajo a la derecha con nombre accesible "Hablar con Hifa". El chat tiene saludo, 4 atajos (Tengo una idea, Necesito algo, Tengo una pregunta, ¿Qué sos?) y texto libre. Hifa avisa que todavía no entiende. Ofrece pasar lo escrito al equipo por `/api/reportes` y confirma "Se lo pasé al equipo (#N)"; si falla, ofrece Reintentar, Copiar el texto o Dejarlo. La conversación se guarda en el navegador (clave `lh-hifa`).

## Qué decidir a la mañana
1. **Hallazgo 6 (baja): qué ofrece pasar Hifa al equipo.** Hifa ofrece pasar al equipo después de cualquier texto, no solo ideas o necesidades. Además, como el endpoint solo admite bug, idea y pregunta, las necesidades se envían como idea con el prefijo "Necesito:". Acción sugerida: decidir si te sirve así o si hay que ampliar el endpoint con un tipo "necesidad" y limitar cuándo ofrece enviar.
2. **Hallazgo 7 (baja): la pestaña Reportar puede tapar contenido en celular.** Ningún test lo verifica. Acción sugerida: mirar el preview a 390 px, mejor en un celular real, y avisar si tapa algo.
3. **Falla intermitente en perfil, sin comprobar contra main.** En una repetición, `e2e/perfil.spec.ts:97` ("entrevista completa: cierre con enlace a tribus y sin pedidos al servidor") esperaba cero pedidos y recibió `OPTIONS <preview>/` y `HEAD <preview>/perfil`. El PR no toca perfil y parece ruido del preview de Vercel, pero nadie lo corrió contra main. Acción sugerida: repetir ese test contra main; si también falla ahí, es un problema aparte y no frena este PR.
4. **Nota sobre la spec: foco al cerrar con Escape.** La spec dice que Escape devuelve el foco al botón. Ahora lo hace solo si el foco estaba dentro del chat (para no robarlo a Reportar ni a los tooltips). Acción sugerida: aprobar el comportamiento actual y ajustar la spec, o pedir el original.
5. **Avatar placeholder.** El avatar es un SVG provisorio (sol dorado con filamentos verdes, solo tokens del tema). Acción sugerida: decidir si queda o si hay que encargar el definitivo.

Para tener en cuenta: el paso 5 del guion de prueba, con `REPORTES_GITHUB_TOKEN` configurado, crea un issue real en GitHub. Sin token, falla a propósito y muestra Reintentar y Copiar.

## Revisor: veredicto y hallazgos
Veredicto final: listo para revisión humana. Hubo tres pasadas.
- 1ª pasada (0 altas, 2 medias, 5 bajas). Corregidos: el foco se perdía tras decidir el envío; la ventana tapaba unos 20 px de Reportar; Escape solo andaba con el foco dentro; el scroll y las claves de la lista fallaban al llegar a 200 mensajes; las etiquetas Reintentar y Dejarlo aparecían como "Sí, pasalo" y "No, gracias". Quedaron para Gus el 6 y el 7.
- 2ª pasada. Confirmó que 1 a 5 estaban resueltos y encontró una regresión media: Escape cerraba Hifa también con Reportar o un tooltip abierto, y robaba el foco.
- 3ª pasada. Regresión corregida (Escape no actúa con `dialog[open]` ni con `[role='tooltip']` visible). Sin hallazgos corregibles pendientes; quedan 2 de severidad baja (6 y 7) y la nota de la spec. Cumple las reglas de CLAUDE.md.

Comentarios: pull/46#issuecomment-6078529801, 6078584315 y 6078642352.

## Tester: resultado
Pasa. Contra el preview, la suite completa dio 337 pasadas, 0 fallas y 1 flaky que pasó al reintentar. En la repetición de hifa, reportes y perfil con `--repeat-each=2`: 87 pasaron y 1 falló (el de perfil descripto arriba). Se verificó el botón y el chat, `/api/reportes` con respuesta simulada, Escape en 3 casos, que no se superpongan los botones a 1280 y 390 px, y axe. Limitaciones: no se hizo revisión visual en un celular real (solo Playwright a 390 px) y no se creó ningún issue real. Reporte: pull/46#issuecomment-6078712312.

## Para la próxima noche
- Según lo que decidas sobre 6: sumar un tipo "necesidad" al endpoint y acotar cuándo Hifa ofrece enviar.
- Según 7: reubicar o achicar la pestaña Reportar en celular y sumar un test que lo verifique.
- Comprobar el test intermitente de perfil contra main.
- Ajustar la spec del foco con Escape, si aprobás el comportamiento actual.
- Reemplazar el avatar placeholder cuando haya diseño.
