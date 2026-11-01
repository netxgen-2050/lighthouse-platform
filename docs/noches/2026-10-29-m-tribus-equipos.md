# Noche 2026-10-29 — tribus-equipos
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/142 (base `dev`) · **Preview:** no disponible, el deploy de Vercel falla (ver abajo)

## Lo primero: qué tenés que decidir o hacer
1. **Bloqueo: el preview de Vercel falla.** El deploy del último commit (`0675c0e`, `dpl_4DkGj4DsJozB5MT5vq1W9VhFWmE8`) terminó en `failure`. También falla en los commits anteriores del PR y en el PR 143, mientras que `dev` sale bien. Nadie vio el log, así que la causa es desconocida. En local el build y los tests pasan. Acción: correr `npx vercel inspect dpl_4DkGj4DsJozB5MT5vq1W9VhFWmE8 --logs` y ver el motivo antes de mergear a `dev`. Como también falla el PR 143, puede ser algo ajeno a este cambio.
2. **Las pruebas sobre el preview NO se hicieron.** El tester no pudo probar el preview porque no se construyó. Lo que sí se probó fue contra un servidor local, y solo en 5 archivos de pruebas (no la suite completa). El guion manual de 8 pasos tampoco se recorrió a mano ni sobre el preview: quedó cubierto solo por los tests automáticos locales. Acción: cuando el preview funcione, recorrer el guion y correr `BASE_URL=<preview> pnpm test:e2e`.
3. **Decisión 6 — orden de `estadoSumarme`.** La spec se contradice: la lista dice sesión, capacidad, adhesión, pedido; el texto dice que un pedido ya hecho vale aunque la persona baje de plan. El implementador usó el orden sesión, pedido, capacidad, adhesión (el pedido hecho gana). Acción sugerida: aceptar ese orden y corregir `design.md` (línea 104) antes de archivar el cambio; si no lo aceptás, hay que cambiar el código.
4. **Decisión 7 — texto de la pestaña Equipos.** Lo redactó el agente sin acceso al boceto y nadie lo comparó. Es el único requisito de la spec sin cumplir. Acción: leer la pestaña Equipos de `/tribus` y compararla con tu boceto; si difiere, pedir el ajuste.
5. **Decisión 8 — uso de `sed -i`.** El implementador editó `tasks.md` y `tribus.spec.ts` con `sed -i`, contra lo que dice CLAUDE.md (hay que usar Edit). No rompió nada, pero es una desviación de las reglas. Acción: decidir si alcanza con avisar o hay que reforzar la regla en el agente.
6. **Preguntas del design que siguen abiertas** (no las resolvió nadie, quedan para vos): si la adhesión debe ser obligatoria para sumarse a un equipo; si el agrovoltaico va en Contratistas; y si hacen falta pactos puntuales para tomar tareas de un frente.

## En una línea
Se agregó a `/tribus` una pestaña Equipos (con 8 frentes de trabajo y pedido de sumarse) junto a la Visión de tribus; el código está terminado y aprobado por el revisor, pero el preview no se pudo construir y por eso falta la prueba sobre el preview.

## Qué quedó hecho (tareas 14/14)
Todas las tareas de `tasks.md` están marcadas como hechas. En concreto:
- Fases y geometría (con sus tests) y el círculo `comun-contratistas` en `lib/gobernanza/datos.ts`: se reutilizaron de un intento previo. El común pasa de 7 a 8 círculos.
- `lib/equipos/frentes.ts`: 8 frentes, 6 puntos ilustrativos en el Macrolote 7 y validación de frentes (ahora también mira el inglés).
- `lib/equipos/equipos.ts`: listar equipos, leer y hacer pedidos, estado de "sumarme", confirmar pedido. Se guarda en el navegador con la clave `lh-equipos`.
- `lib/gobernanza/participar.ts`: regla de quién puede participar en gobernanza.
- `components/sumarme-equipo.tsx`: el botón y el aviso de sumarse.
- `/tribus` con pestañas Equipos y Visión (`?ver=tribus`), marca "Ejemplo · a definir", textos en español e inglés, y actualización de la revisión nativa (`docs/idioma/revisar-nativo.md`).
- Pruebas e2e nuevas (`e2e/tribus-equipos.spec.ts`, 19 tests) y ajustadas (tribus, descubrir-público, idioma, accesibilidad ahora a 35 rutas).
- `pnpm verificar` (1948 tests) y `pnpm build` en verde en local.

## Revisor: veredicto y hallazgos
**Aprobado, listo para revisión humana** (tercera ronda, 0 hallazgos nuevos). CLAUDE.md y seguridad sin problemas.
- Ronda 1 (cambios requeridos, menores): foco perdido al confirmar (media), aviso que nacía con texto, datos de la persona anterior al cambiar de persona, validación solo en español, espacio faltante en un import. Todo corregido en `4990d0f`.
- Ronda 2 (aprobado con observaciones, 2 bajas): el aviso decía "abajo" cuando está arriba, y faltaba limpiar el fallo de almacenamiento al cambiar de persona. Corregido en `0675c0e`.
- Ronda 3: aprobado. Le quedan a Gus los puntos 6, 7, 8 y el preview de Vercel (arriba).
- Comentarios: #issuecomment-6506458884, #issuecomment-6506648074, #issuecomment-6506811030.

## Tester: resultado
**Pasó en local, pero con alcance parcial y sin preview.**
- Local: 173 de 173 tests de Playwright en verde, solo en los archivos tribus-equipos, tribus, accesibilidad, idioma-tribus-territorio y descubrir-publico. No se corrió la suite completa.
- Preview de Vercel: no se pudo probar (deploy en `failure`, causa desconocida).
- Guion manual de 8 pasos: no recorrido a mano; cubierto solo por los tests locales.
- Un dato a no perder de vista: al corregir `0675c0e`, la primera corrida del e2e falló un test (el de la pestaña por defecto) y al repetir pasaron los 19. El implementador lo atribuyó a lentitud y no lo investigó. Puede ser un test inestable.
- Reporte: #issuecomment-6506910939.

## Para la próxima noche
- Revisar el log de Vercel y arreglar el deploy (si la causa es de este PR, corregirla; si es de `dev`, que se arregle aparte).
- Con el preview andando, correr el e2e sobre el preview y recorrer el guion de 8 pasos.
- Investigar el test que falló una vez (pestaña por defecto) para saber si es inestable.
- Según tu decisión: corregir `design.md:104`, ajustar el texto de la pestaña Equipos con el boceto, y resolver las tres preguntas abiertas del design.
- Correr la suite e2e completa, no solo los 5 archivos.
