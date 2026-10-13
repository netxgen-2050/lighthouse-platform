# Noche 2026-10-12 — portada-origen
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/56 · **Preview:** https://lighthouse-platform-2vvf1owqy-net-xg-en.vercel.app (commit 1a699e5)

## En una línea
Nada falló: el cambio quedó hecho, revisado y probado. Queda una sola decisión tuya (si filtrar emails o números largos dentro de los parámetros `utm_*`) y mergear si te cierra.

## Qué quedó hecho (tareas 8/8)
Aprobaste solo `portada-origen` de las propuestas del 9-oct (PR #52); el PR trae únicamente esa spec.
- **Camino recomendado por link:** `/?camino=tribus|perfil|congreso` marca esa tarjeta con "Recomendado para vos" (texto dentro del enlace, más un borde; no cambia el orden). Un valor desconocido se ignora.
- **Origen de la visita:** `utm_source`, `utm_medium` y `utm_campaign` se limpian y se guarda el primer origen en `lh-origen`. Cualquier otro parámetro se descarta. Una segunda visita con otra campaña no pisa la primera.
- **Pedidos de contacto:** cada pedido nuevo copia el origen. Los pedidos viejos y los de origen mal formado se siguen leyendo.
- **Vista NetX:** columna "Origen" (fuente · medio · campaña), con "sin dato" donde falta algo.
- **Borrar todo** también quita `lh-origen`.
- La portada pasó a ser dinámica (el build la muestra como `ƒ /`).
- Verificación: `pnpm verificar` (523 tests) y `pnpm build` en verde; e2e de portada y contactos sobre el preview 34/34 (2 con reintento automático por latencia).

## Qué decidir a la mañana
1. **Filtrar o aceptar emails y números largos dentro de un `utm_*` permitido.** Hoy `/?utm_source=ana@ejemplo.com` guarda `anaejemplo.com` en `lh-origen` y en cada pedido. Cumple la spec al pie de la letra, pero choca con el punto 7 de design.md (el origen describe el link, no a la persona). Acción sugerida (recomendación del orquestador): **filtrar**, o sea descartar el valor que antes de limpiar contenga `@` o sea un número largo. Alcanza con cambiar `limpiar()` en `lib/origen/origen.ts`; se puede hacer en un cambio chico aparte o en este mismo PR antes de mergear. Si preferís aceptarlo para el prototipo, se mergea tal cual.
2. **Merge del PR #56.** Solo vos mergeás a `main`.
3. **Dudas de la spec, resueltas como dice la spec** (avisame si querés otra cosa): se guarda el primer origen, no el último; no existe tarjeta de camino inversor hacia `/sumarte`.

## Revisor: veredicto y hallazgos
Veredicto final (2ª vuelta, commit 1a699e5): listo para revisión humana, 0 corregibles pendientes.
- Hallazgo 1 (baja, decisión tuya): el de email/número largo de arriba. Sigue abierto.
- Hallazgo 2 (corregido): la tarea 4.1 estaba marcada sin haber corrido los e2e en el preview. Ya se corrieron (34/34) y queda marcada de verdad.
- Hallazgo 3 (corregido): el e2e de "segunda visita no pisa" podía dar verde sin querer. Ahora espera a que se haya leído `lh-origen` y se comprobó que falla si se pisa.
- Hallazgo 4 (corregido): el origen leído de `lh-contactos` no se volvía a limpiar. Ahora sí, con test nuevo.
- Reglas de CLAUDE.md: aviso de prototipo presente, sin cobros ni textos legales nuevos, "sin dato" en vez de 0, la marca entra en el nombre accesible, solo tokens del tema, ningún `<main>` extra.

## Tester: resultado
Pasa, sobre el preview del commit 1a699e5.
- Guion manual completo en verde: la tarjeta del Congreso con "Recomendado para vos" y sin cambiar el orden; `lh-origen` guardado limpio; la segunda visita no pisa; `/?camino=lotes` da 200 sin marca; sin `utm` no se guarda nada; `email=` y otros parámetros se descartan y el html queda limpio; "Pedir una charla" muestra en `/netx` el origen "newsletter · email · congreso-2027"; pedido sin origen muestra "sin dato"; un `lh-origen` roto no impide guardar el pedido; Borrar todo lo quita; 390 px sin scroll horizontal en `/` y `/netx`; axe sin violaciones serias o críticas.
- Suite completa (sin los tests nuevos del PR, que se corrieron como specs temporales equivalentes, todas verdes): 400 ok, 0 fallas, 5 flaky ajenos al cambio que pasaron al reintentar: bitacora.spec.ts:91, pactos.spec.ts:144, pasaporte.spec.ts:164, reportes.spec.ts:27, tribus.spec.ts:243 (timeouts, probablemente latencia del preview).
- En la corrida del implementador falló una vez sumarte.spec.ts:113 (foco en el aviso) y pasó al repetirlo; también ajeno.

## Para la próxima noche
- Cuando se implemente `privacidad-consentimiento`, sumar `lh-origen` a su lista de claves.
- En los e2e de accesibilidad sale en el log un `NoFallbackError` al abrir `/territorios/no-existe`; la prueba pasa y no es de este cambio, pero conviene mirarlo.
- Otros pendientes del día (fuera de este PR):
  - PR #55: archiva `reportar-circulo` y `barra-superior-configuracion` (Moneda acotada a Sumarte y Pactos, decisión tuya) e ignora `.claude/worktrees/` en lint, tipos, tests y git.
  - `territorio-mapa`: la tarea A.1 (geometría real) ya está hecha en `main`; falta marcarla y archivar.
  - `territorio-bienes-comunes`: el mockup está enviado a vos para tu OK.
- Después de mergear #56: archivar `portada-origen` con `/opsx:archive`.
