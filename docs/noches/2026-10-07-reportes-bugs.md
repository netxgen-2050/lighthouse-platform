# Noche 2026-10-07 — reportes-bugs
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/27 · **Preview:** https://lighthouse-platform-git-agente-reportes-bugs-net-xg-en.vercel.app

## En una línea
El botón "Reportar" y todo su código están hechos y probados, pero el envío real a GitHub **todavía no funciona**: el token cargado en Vercel existe y GitHub rechaza crear el issue (error 502). Mientras tanto, la persona ve el aviso y puede copiar el reporte, así que nada se pierde.

## Qué necesita Gus (en este orden)
1. **Arreglar el token `REPORTES_GITHUB_TOKEN` en Vercel (Production y Preview).**
   - Qué pasa: un reporte válido a `/api/reportes` responde 502 `{ok:false, configurado:true}`. Es decir, el token está, pero GitHub no deja crear el issue.
   - Cómo ver el motivo: Vercel → Deployments → el deploy del preview → Logs, y buscar `[reportes] GitHub rechazó la creación del issue`. El log trae el estado y el mensaje de GitHub (nunca el token ni el contenido del reporte).
   - Cómo leerlo: **401** = token inválido o vencido. **403 o 404** = el token no tiene permiso de Issues (lectura y escritura) o no incluye el repo `netxgen-2050/lighthouse-platform`.
2. **Decidir la privacidad del contacto y la URL (hallazgo medio del revisor, abierto en las tres rondas).** El issue publica el contacto (nombre o email) y la URL completa con su query string, y el formulario no avisa que eso queda en GitHub. Opciones:
   - confirmar que el repo es y seguirá siendo privado (no hay que tocar código);
   - agregar un aviso junto al campo de contacto ("esto queda escrito en GitHub");
   - no publicar el contacto en el issue.
3. **Probar el envío real una vez arreglado el token:** abrir el preview, reportar algo y ver que aparezca el issue con las etiquetas `reporte` y el tipo. Esto nadie lo pudo verificar.
4. **El PR #27 está sin mergear.** Solo Gus mergea.

## Qué quedó hecho (tareas 5/5)
- 1.1 Lógica en `lib/reportes/reporte.ts`: validación, campo trampa, contexto, título, cuerpo y etiquetas.
- 2.1 Ruta `app/api/reportes/route.ts`: 503 `{configurado:false}` sin token, 502 si GitHub falla, etiquetas `reporte` + tipo. Campo trampa lleno: responde ok con número 0 y no crea nada.
- 3.1 `components/boton-reportar.tsx` montado en `app/layout.tsx`: botón fijo, diálogo modal, "Copiar el reporte" si no se registra.
- 3.2 `e2e/reportes.spec.ts` con los escenarios.
- 4.1 `pnpm verificar` (318 tests), `pnpm build` y e2e (198) en verde.
- Lo que no se hizo: el implementador no lo probó a mano en `pnpm dev`.

## Revisor: veredicto y hallazgos
Veredicto final: con observaciones (3 rondas). **El revisor NO revisó el último commit (5599352).** Se alcanzó el máximo de dos vueltas, así que ese arreglo se hizo dentro de la vuelta del tester, sin una cuarta revisión.
- Ronda 1: 1 media (contacto/URL públicos, queda para Gus) y 5 bajas (menciones @/# sin neutralizar, envío duplicado al cerrar y reabrir, sin aviso si falla copiar, URL no visible en el diálogo, faltaban tests de foco y de token). Corregido en 88d0e3f.
- Ronda 2: lo anterior bien. Nuevas bajas: URL y Ruta neutralizadas rompían el enlace; test del token con condición de carrera. Corregido en ed4dd85 (comillas invertidas, `Promise.all`). Queda anotada una limitación: corrido en local sin token, el test no detecta una fuga real; hay que correrlo con `BASE_URL` a un preview que tenga el token.
- Ronda 3: correcciones OK. Siguen: la media de Gus y una baja nueva (la función de comillas invertidas no quitaba saltos de línea, y un pedido armado a mano podía dejar pasar una mención). Corregida en 5599352 con `replace(/\s+/g," ")` y un test, **sin revisión posterior**.

## Tester: resultado
- Ronda 1: **falló** en el paso 6. 197 e2e pasan, 0 fallan, 1 inestable (`e2e/fogon.spec.ts:33`, por el toolbar de Vercel que hace un POST a vercel.live; ruido del preview, no del cambio). Se vio el 502 y no había log del motivo.
- Corrección 3 (5599352): se agregó el log con estado y mensaje de GitHub (con test), y el arreglo de saltos de línea. 318 tests, build y e2e 198 en verde.
- Ronda 2 (final): **pasa con una salvedad.** 198 e2e en verde.
  - Pasos 1 a 4 (botón, 390 px, teclado y foco, contexto): solo por e2e, no a mano.
  - Paso 5 (enviar vacío): 400 "Contanos qué pasó."
  - Paso 6: sigue el 502 (probado con curl, no con la interfaz).
  - Paso 7 (issue en GitHub): no verificable; no se creó ningún issue.
  - El motivo del 502 no se pudo ver porque el log queda en Vercel.

## Para la próxima noche
- Cuando Gus resuelva el token y la privacidad, aplicar la opción elegida (aviso en el formulario o sacar el contacto del issue) y pedir una revisión del commit 5599352 junto con ese cambio.
- Correr el test del token en e2e con `BASE_URL` apuntando a un preview que tenga el token cargado, para confirmar que no se filtra al navegador.
- Probar el flujo a mano en `pnpm dev` y en el preview, ya con el envío funcionando.
- Opcional: `e2e/fogon.spec.ts:33` es inestable en el preview por el toolbar de Vercel; conviene ignorar los pedidos a vercel.live en ese test.

Comentarios del PR: revisor #6045005512, #6045102807, #6045155944; tester #6045195132, #6045263733.
