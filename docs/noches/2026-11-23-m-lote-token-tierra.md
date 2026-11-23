# Noche 2026-11-23 — lote-token-tierra
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/196 (base `agente/bien-comun-numeros-barrio`, no `dev`) · **Preview:** no hay (ver bloqueo 1)

## En una línea
La ficha de los lotes de `lighthouse-norte` ahora muestra el plan en cuotas como Token Tierra simulado (contado, 12, 24 o 36 cuotas, con FARO por cuota). El código quedó completo y probado en local, pero no se pudo probar contra un preview de Vercel, y hay 17 pruebas de Fogón que fallan por un dato vencido que no es de este PR.

## Primero: bloqueos
1. **No hay preview de Vercel.** `scripts/preview-url.sh agente/lote-token-tierra` esperó 15 minutos y no encontró el preview del último commit (c5e898d). El tester probó en local (`pnpm build` y `PORT=3012 pnpm test:e2e`). El guion manual de 9 pasos no se recorrió a mano: se dio por cubierto por `e2e/lotes.spec.ts`. **Acción sugerida:** revisá en Vercel por qué la rama no desplegó (puede ser porque el PR apunta a otra rama de agente y no a `dev`) y recorré vos el guion del PR en el preview cuando exista.
2. **Hay un servidor colgado en tu máquina o carril.** El tester dejó un `next start` corriendo en segundo plano (puerto 3011) y no pudo bajarlo porque los agentes no tienen permiso de `kill`. **Acción sugerida:** bajalo vos a mano.
3. **17 pruebas e2e fallan, ninguna por este PR.** Todas son de Consultas del Fogón sobre `/fogon/consultas/u1`. La causa, según el revisor: en `lib/fogon/consultas/ejemplo.ts:29` la consulta u1 tiene `cierre: "2026-11-15T23:59:00-03:00"`. Desde el 16-nov la página la muestra cerrada y las pruebas no encuentran el botón "Sumar un voto…". El tester la marcó como preexistente por esa suposición, pero no abrió el detalle de cada falla ni la comprobó en la base. Archivos afectados: `e2e/accesibilidad.spec.ts:442`, `e2e/fogon-consultas.spec.ts` (9 casos), `e2e/idioma-pendientes.spec.ts` (4) y `e2e/manifiesto-lighthouse-vrn.spec.ts` (3). **Acción sugerida:** decidí quién y en qué cambio corrige el dato (por ejemplo, mover el cierre de u1 a una fecha futura o calcularlo respecto de hoy). Mientras no se arregle, cualquier PR va a mostrar estas fallas.

## Qué decidir a la mañana
- **Grafía en inglés: "instalment" o "installment" (hallazgo bajo, abierto).** El inglés nuevo usa la grafía británica "instalment(s)", y el resto de la plataforma y los ⚖ usan "installment(s)". El rótulo "In instalments (simulated)" viene literal de tu decisión en la spec. **Acción sugerida:** decir sí o no a unificar en "installment"; si es sí, es un cambio chico de textos y de la spec.
- **Aceptar el PR con la base actual.** Este PR depende de `bien-comun-numeros-barrio` (PR anterior). Hay que entregar primero ese o decidir el orden. **Acción sugerida:** revisar y mergear a `dev` en ese orden, o rebasear este PR cuando el anterior entre.
- **Nota provisoria de costos con FARO (decisión abierta del implementador).** Los primeros 4 lotes siguen mostrando la nota de retribución en tokens con FARO y su ⚖; solo se alineó el texto, como pedía la spec. Sacarla sería otro cambio. **Acción sugerida:** decidir si querés un cambio aparte para sacarla de esos 4 lotes.
- **Campos extra en el plan guardado.** El implementador agregó `ultimaCuota` y `faroUltimaCuota` (opcionales) para que la suma cierre exacta con la regla de redondeo del diseño. **Acción sugerida:** confirmar que está bien o pedir que se resuelva de otra forma.
- **Inglés sin revisión de nativo.** Los textos nuevos (instalments, Land Token) están anotados en `docs/idioma/revisar-nativo.md`. **Acción sugerida:** que alguien lo revise antes de mostrarlo fuera del equipo.
- **Los textos legales nuevos son borrador.** `nftlote` y `retribucionraiz` están marcados `borrador: true`. Siguen siendo "a verificar con abogado".

## Qué quedó hecho (tareas 11/11)
Todas las tareas de `tasks.md` están marcadas hechas (1.1, 2.1, 3.1 a 3.4, 4.1, 4.2, 5.1, 5b.1 y 6.1).
- **Modelo:** `lib/bien-comun/modelo.ts` suma `PLAN_CUOTAS`, `planDeLote`, `faroAcreditado` y `faroDelPlan`. La última cuota absorbe el redondeo.
- **Compra simulada:** `lib/lotes/compra.ts` suma `plan` opcional. Una compra vieja o con plan mal formado se muestra "sin dato", nunca como contado.
- **Ficha de `lighthouse-norte`:** tarjeta nueva `components/lotes/plan-token-tierra.tsx` con contado o 12, 24 (de partida) o 36 cuotas. Muestra anticipo, cuota y FARO. Avisos: es una simulación, no es una oferta, la Ordenanza 173/2026 no está otorgada, lo legal se verifica con abogado. Interés y actualización: "sin dato" (solo se muestra con cuotas).
- **NFT:** pasa a "Ficha del lote (NFT, simulado)", sin fila FARO y con "no es un instrumento de inversión".
- **Pago y boleto:** el pago simulado es el primer pago (el anticipo si es en cuotas). El boleto muestra plan, anticipo, cuota y FARO. Si hay casa y es en cuotas, dice que la casa se paga aparte.
- **Estado nuevo "En cuotas (simulado)"** en la ficha, la lista y el mapa. El contado y las compras viejas siguen como "Vendido (simulado, a vos)".
- **Mapa:** el panel dice que los FARO se acreditan a medida que se paga.
- **Primeros 4 lotes:** dicen "Plan en cuotas: sin dato para estos lotes". Soluna no cambió.
- **Vuelta de corrección 1** (commit c5e898d): la tarjeta sin plan guardado ahora tiene los avisos, el ⚖ y el enlace a /bien-comun; el interés solo aparece con cuotas; la casa aparte figura en pago y boleto.

## Revisor: veredicto y hallazgos
Veredicto final: **con observaciones** (1 hallazgo bajo abierto, vuelta 2).
- Vuelta 1: 4 hallazgos bajos. (1) Tarjeta sin plan guardado sin los avisos de la spec. (2) "Interés y actualización: sin dato" aparecía también en contado. (3) Con casa y en cuotas no decía que la casa se paga aparte, ni en el pago ni en el boleto. (4) Grafía británica "instalment" frente a "installment" en el resto. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/196#issuecomment-7104882836
- Vuelta 2: los hallazgos 1 a 3 quedaron resueltos, sin regresiones ni hallazgos nuevos. `pnpm verificar` (2463 tests unitarios) y los 36 e2e de lotes pasan. Queda solo el 4 (grafía), para tu decisión. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/196#issuecomment-7105038186
- Aparte, el revisor encontró la causa probable de los e2e de Fogón (ver bloqueo 3).

## Tester: resultado
**Pasa para este PR, con un bloqueo de entorno.** Sin preview (ver bloqueo 1), probó en local: 1201 pruebas pasaron, 17 fallaron y 1 se omitió. `e2e/lotes.spec.ts` completo (36) pasa. Las 17 fallas son todas de Consultas del Fogón (ver bloqueo 3). El guion manual de 9 pasos no se recorrió a mano. La vuelta de corrección del implementador no corrió `accesibilidad.spec.ts`; la corrida completa del tester sí la incluye. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/196#issuecomment-7106585354

## Para la próxima noche
- Corregir el dato vencido de la consulta u1 en Fogón (`lib/fogon/consultas/ejemplo.ts:29`) en un cambio propio, para dejar la suite e2e en verde.
- Si decidís unificar la grafía, cambiar "instalment" por "installment" en los textos nuevos y en la spec.
- Cuando haya preview, recorrer el guion manual del PR (9 pasos) y probar `?lang=en` y 390 px.
- Decidir si se saca la nota provisoria de costos con FARO de los primeros 4 lotes.
- Pedir revisión de nativo del inglés nuevo.
