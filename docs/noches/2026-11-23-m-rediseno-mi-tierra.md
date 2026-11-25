# Noche 2026-11-23-m — rediseno-mi-tierra
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/205 (base `agente/rediseno-explorar-valle`, no `dev`) · **Preview:** sin confirmar (ver abajo)

## En una línea
Quedó hecha la página pública `/mi-tierra` (el portafolio simulado de lotes) y una sola función para leer y guardar las reservas. Está lista para tu revisión, pero con dos cosas para mirar primero: una frase de la propuesta de voz que necesita tu decisión, y que nadie pudo probarla en el preview de Vercel.

## Qué quedó hecho (tareas 10/10)
- **Una sola puerta para las reservas:** `lib/lotes/reservas.ts`. El hook de compras y la ficha del lote leen y guardan por ahí. Un test falla si otro archivo toca la clave, y otro verifica que otra persona en el mismo navegador no ve reservas ajenas.
- **Cálculo del portafolio:** `lib/mi-tierra/portafolio.ts`, función pura. Plan, FARO y precio salen de lo que la persona vio al reservar. Lo que falta dice "sin dato".
- **Página `/mi-tierra`** en español e inglés, pública:
  - Sin sesión: solo un aviso para entrar, ningún dato.
  - Sin compras: "Todavía no reservaste un lote" y enlace a los lotes.
  - Con sesión y compras: indicadores, una tarjeta por lote, tu voz, libro de actividad y sello de venta simulada (aprobación municipal pendiente).
- Registrada en rutas públicas, traducidas y menú (el menú del celular ahora trae Mi tierra). Tests de navegación y `marco.spec.ts` ajustados. Snapshot de revisión nativa actualizado.
- Pruebas e2e nuevas (`e2e/mi-tierra.spec.ts`) y axe sobre 48 rutas.

## Qué decidir a la mañana
1. **Decisión tuya (hallazgo 2 del revisor, baja):** en `lib/idioma/textos/mi-tierra.ts` (líneas 73-74 y la versión en inglés) la propuesta de voz agrega "Para el tesoro y los recursos del común, FARO con tope por persona". Tu decisión del 23-nov y el design §5 no lo piden; solo piden "una persona, un voto en asuntos de residentes" (doc 34). Hoy figura marcada "en discusión". **Acción sugerida:** decidir si la frase se queda como propuesta en discusión o se saca. Si se saca, es borrar esa frase en español e inglés. Nadie la tocó a propósito.
2. **Preview de Vercel sin confirmar.** El tester esperó 15 minutos y `scripts/preview-url.sh agente/rediseno-mi-tierra` no encontró el preview del commit `7ad40d9` ("¿Está conectado el repo a Vercel?"). Por eso la prueba se hizo sobre un build local. Dato aparte: el comentario del bot de Vercel en el PR marca un despliegue "Ready" a las 00:21 UTC del 24-nov, con una dirección que arranca en `lighthouse-platform-git-agente-red-e6901c-...`. El nombre está cortado, así que no se pudo asegurar que sea de este commit. **Acción sugerida:** abrir el enlace del bot en el PR, confirmar que es el commit `7ad40d9` y recorrer el guion del PR a mano (sobre todo pasos 3, 4 y 7).
3. **Textos de Mi tierra (es/en) son borrador de agente**, pendientes de tu ajuste y de revisión nativa. Acción: leerlos al recorrer la página.
4. **Cosas a saber, sin urgencia:**
   - Solo se simula el primer pago, así que las cuotas siempre dicen "0 de N".
   - Un lote cuyo estado de ejemplo ya es reservado o vendido se muestra con ese estado, no con el de la persona.
   - Exportar, importar y borrar de `/mis-datos` siguen recorriendo todas las claves `lh-*` a propósito. Hay que migrarlas junto con el cambio `lotes-en-la-base`.
   - La prueba "a propósito" de la tarea 1.3 (agregar una lectura ajena y ver fallar el test) se hizo antes de migrar el hook y no se repitió después.

## Revisor: veredicto y hallazgos
Tres rondas. Veredicto final: **listo para revisión humana**, sin hallazgos nuevos ni regresiones. La spec (10 requirements) quedó cubierta. En seguridad (el cambio toca `rutas-publicas.ts`) no hubo hallazgos. El revisor no pudo publicar su primer comentario (el permiso rechazó `scripts/pr.sh comentar`); lo publicó después el implementador como resumen de correcciones.
- Ronda 1 (con observaciones):
  1. (media) Faltaban los ⚖ de Token Tierra, FARO, manifiesto VRN y adhesión. **Corregido.**
  2. (baja) La frase del tope por persona. **Abierto, es tu decisión.**
  3. (baja) Indicadores "sin dato" donde no corresponde. **Corregido.**
  4. (baja) `role=status` de más en la adhesión. **Corregido.**
  5. (baja) El test de teclado usaba `focus()` y no Tab. **Corregido.**
- Ronda 2 (con observaciones): correcciones verificadas. Un hallazgo nuevo (baja): en el caso mixto (un lote del plan reservado sin pagar y uno de los primeros 4 pagado), FARO decía "sin dato" en vez de "falta el primer pago". **Corregido.**
- Ronda 3: sin hallazgos nuevos.
- Una advertencia de lint en `app/territorios/[id]/vistas/paneles.tsx:83` ya existía antes; no es de este PR.

**Vueltas de corrección usadas: 2**
- Corrección 1 (`382278b`): hallazgos 1, 3, 4 y 5. Los ⚖ usan entradas que ya existían en el catálogo, sin textos nuevos. Los indicadores de plan y FARO se ocultan si ningún lote entra al plan. `pnpm verificar` (2729 tests), build y 12 e2e de Mi tierra en verde.
- Corrección 2 (`7ad40d9`): `hayPago` cuenta solo lotes que entran al plan, con test del caso mixto. `pnpm verificar` (2730 tests) y build en verde.

## Tester: resultado
**Pasó, pero sobre build local y no sobre el preview de Vercel** (ver punto 2 de arriba). Playwright: 1341 pasaron, 0 fallaron, 3 salteados. `e2e/mi-tierra.spec.ts`: 12 de 12, repetido aparte. El guion manual no se recorrió a mano; lo cubren los 12 tests (pasos 1 a 7: sin sesión, sin compras, reservar, primer pago en 24 cuotas, primeros 4 lotes, tu voz, inglés y 390 px con Tab). El build deja el mismo warning de lint de `paneles.tsx`, que no bloquea.

## Para la próxima noche
- Si decidís sacar la frase del tope por persona, es un cambio chico en `lib/idioma/textos/mi-tierra.ts` (es y en).
- Migrar las lecturas genéricas de `/mis-datos` (exportar, importar, borrar) junto con `lotes-en-la-base`.
- Revisar por qué `scripts/preview-url.sh` no encuentra el preview de esta rama: el nombre del despliegue de Vercel sale cortado (`agente-red-e6901c`) y puede no coincidir con lo que busca el script.
- Es el cuarto de los cinco cambios del rediseño, apilado sobre `agente/rediseno-explorar-valle`. Nada se mergea hasta que lo decidas.
- Proceso: los dos commits del implementador cayeron primero en la rama local de Explorar (la del worktree). Los pasó a `agente/rediseno-mi-tierra` y devolvió la de Explorar a `046332d`. No se subió nada y `origin` no cambió.
