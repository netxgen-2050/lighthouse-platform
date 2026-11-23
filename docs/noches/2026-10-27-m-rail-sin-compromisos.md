# Noche 2026-10-27-m — rail-sin-compromisos
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/124 · **Preview:** no disponible (el deploy de Vercel de la rama falló)

## En una línea
El código del cambio está hecho y pasa lint, tipos, unitarios y build en local, pero la noche quedó **sin visto bueno**: el tester dio falla (un e2e que no tiene que ver con el cambio), el preview de Vercel está en error y queda una decisión tuya sobre la política de privacidad.

## Qué quedó hecho (tareas 21/21)
Todas las tareas de `openspec/changes/rail-sin-compromisos/tasks.md` están marcadas.
- **Navegación:** Compromisos sale del rail. Participar queda con Pactos, Semillas, Fogón y Congreso.
- **Avisos:** los avisos del Mercado se siguen guardando, pero no se listan ni se cuentan (bandeja, campanita, Mi recorrido). "Marcar todas" no los toca.
- **Configuración:** la casilla de avisos del Mercado se oculta; el valor guardado se conserva.
- **Política de privacidad:** `lib/privacidad/politica.ts` ya no nombra compromisos. La versión de la política no cambia; el rastro queda en la cabecera.
- **Reversión:** nota en `docs/notas/compromisos-en-pausa.md` (PR #124 y los commits b8a9119, a4f78af, b77403f).
- **Tests:** unitarios y e2e ajustados y nuevos. Tras la corrección, `pnpm verificar` (1554 tests) y `pnpm build` verdes en local.

## Qué decidir a la mañana
Primero lo que bloquea:

1. **Vercel en error, sin log (bloqueante para ver el preview).** El deploy de la rama (5913db9, y también b77403f) falla; `dev` está en verde. También falla `agente/fogon-gobernanza-holarquia`. El diff no cambia dependencias, migraciones ni configuración de build. Nadie pudo ver el log (solo dice "Deployment has failed"). Sospecha sin confirmar: `pnpm build` corre `tsx scripts/migrar.ts` y en el preview depende de la base de datos. **Acción sugerida:** correr `npx vercel inspect dpl_7YTcV7b6WNzLi7qXNy4JqQD7215v --logs` y ver la causa. Si es la base o algo común a otras ramas, no es de este cambio.
2. **Política de privacidad vs. lo que el prototipo sigue guardando (hallazgo media, abierto).** La política ya no nombra compromisos, pero `/compromisos` sigue guardando datos en el navegador (`lighthouse.compromisos.v1`) y eventos del Mercado (`mercado`, `interes-oferta`), y `/mis-datos` los exporta. **Opciones:** (a) aceptarlo por ser prototipo interno; (b) que `/compromisos` deje de guardar datos nuevos; (c) volver a nombrar compromisos en la política. La política además sigue como borrador pendiente de Gabriel (R14). **Acción sugerida:** (a) si sigue siendo solo uso interno, y anotarlo para R14.
3. **Falla de e2e `e2e/idioma.spec.ts:86` (no es de este cambio).** Esperaba `/tribus?sel=valle&lang=en` y recibió `/tribus?lang=en`; reproducida 3 veces. El implementador la analizó: es una carrera de hidratación que ya existía en el test (`components/selector-idioma.tsx:62` usa `onPointerEnter`, que solo existe después de hidratar, y el test hace `goto` + `hover` enseguida). El diff no toca `components/`, ese spec ni `/tribus`; con una espera de 3 s temporal pasa. **Acción sugerida:** un cambio aparte que espere la hidratación, como en el commit 72b0b91. No bloquear este PR por esto si estás de acuerdo con el análisis.
4. **Dos tests viejos de `actividad.test.ts`** usaban `interes-oferta` y ahora usan otro tipo de aviso (porque ese tipo quedó en pausa). **Acción sugerida:** mirarlo de pasada en el diff; es esperable.

## Revisor: veredicto y hallazgos
Veredicto en las dos vueltas: con observaciones. 0 altas, 1 media, 0 bajas al final.
- **Primera vuelta:** 1 media, 3 bajas. No pudo publicar el comentario en el PR (permiso rechazado en `scripts/pr.sh comentar` y `diff`); entregó el texto al orquestador.
- **Hallazgo 1 (media):** el desfase política/almacenamiento, descrito arriba en el punto 2. Sigue abierto.
- **Bajas, corregidas en el commit 5913db9:** (2) un e2e de `bandeja.spec.ts` pasaba sin filtro: ahora usa un evento de control; (3) la nota de reversión era imprecisa: ahora cita el PR y los tres commits; (4) huecos de tests: se agregaron e2e de interés único, de publicar por URL tras demora (`page.clock` +30 s) y un test unitario de que `mercado:false` se conserva al guardar.
- **Segunda vuelta:** correcciones OK, sin regresiones. `verificar` y `build` locales ok; e2e de bandeja, configuración, marco y compromisos 102/102. Comentario publicado: https://github.com/netxgen-2050/lighthouse-platform/pull/124#issuecomment-6454938780. Fue quien avisó del deploy de Vercel en error.

## Tester: resultado
**Falla.** El preview no se pudo usar (`scripts/preview-url.sh`: "El deploy de Vercel falló para 5913db93…"), así que probó con Playwright contra un servidor local: 843 ok, 1 falla (`e2e/idioma.spec.ts:86`, descrita arriba, ajena al cambio).
- **El guion manual no se ejecutó.** Los pasos 1, 2, 3, 4 y 6 solo tienen cobertura de e2e locales en verde.
- **Sin verificación propia:** el paso 5 (`/privacidad` y el consentimiento sin nombrar compromisos, fila "Votos") y el texto "Sumate para participar" sin sesión.
- Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/124#issuecomment-6455046915.
- Tras la falla, el implementador no cambió código ni pusheó, por eso **no se repitió el tester** (comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/124#issuecomment-6455168874).

## Para la próxima noche
- Resolver el log de Vercel; cuando el preview esté en verde, repetir el tester con el guion manual completo, en especial el paso 5 y el texto sin sesión.
- Cambio chico y aparte para arreglar la carrera de hidratación de `e2e/idioma.spec.ts:86`.
- Según lo que decidas del punto 2: si es (b) o (c), abrir un cambio de spec.
- Permisos: el revisor tuvo rechazado `scripts/pr.sh comentar` y `diff` en la primera vuelta. Conviene revisar `.claude/settings.json` para que no se repita.
- Antes de mostrar la plataforma fuera del equipo, revisar la política con Gabriel (R14).
