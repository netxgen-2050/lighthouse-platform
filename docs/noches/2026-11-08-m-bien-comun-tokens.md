# Noche 2026-11-08-m — bien-comun-tokens
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/179 (base `agente/modelo-hibrido-procomun`) · **Preview:** no hay (el secreto de Vercel está vencido; todo se probó en local)

## En una línea
Quedó hecha la página pública `/bien-comun`, que muestra con tokens, como simulación, cómo se financiaría lo común, más la tarjeta "NFT del lote (simulado)" en cada ficha y en el boleto. Las 8 tareas están hechas y los chequeos del cambio pasan. Hay 2 fallas de tests que no son del PR y 2 decisiones tuyas.

## Qué quedó hecho (tareas 8/8)
- Los números salen de un solo módulo, `lib/bien-comun/modelo.ts`. Las pantallas no escriben cifras.
- La página `/bien-comun` es pública y bilingüe, con las 9 secciones del diseño. El aviso de simulación va antes de cualquier número.
- La calculadora por tramos se usa con teclado y anuncia el resultado. No guarda nada y no tiene botón de compra. No aparecen las cifras de lo que falta (42.000 y 46.800).
- Hay 5 términos con ⚖ nuevos, en borrador (es y en): NFT del lote, token del bien común, venta por tramos, staking del bien común y parte de NetXGen. Reescribí `retribucionraiz`, que ya no dice RAIZ.
- La ficha del lote (`/lotes/[id]`) tiene la tarjeta "NFT del lote (simulado)". Lo único nuevo que se guarda es el campo opcional `faro` en las reservas simuladas, y los registros viejos se leen igual. El boleto dice que se acuñaría el NFT y se asignarían FARO.
- Enlaces nuevos: destino "Bien común" en el rail, y desde `/lotes`, `/lotes/hibrido`, la ficha y Sumarte (sección Invertir).
- El test de números escritos ahora también vigila `/bien-comun` y falla si aparece "ganancia", "retorno" o "valorización".
- Después de la revisión se arregló el plural de la espera de NetXGen: antes decía "2 año", ahora usa `esperaAnios(n)` con plural en es y en (commit 4150be1).

## Qué decidir a la mañana
1. **Tramos y staking: ¿se suaviza el texto? (hallazgo bajo del revisor)**
   El texto "el precio sube de tramo en tramo, así quien llega antes paga menos", junto con la opción B del staking ("5 % anual en tokens nuevos"), no usa las palabras prohibidas. Pero sugiere que el token se valoriza, y ese es el mismo riesgo ante la CNV que la página lista. El diseño pide ambos textos.
   Acción sugerida: antes de mostrarlo fuera del equipo, decidí si se suaviza (por ejemplo, quitar la frase de "quien llega antes paga menos" o aclarar que es solo un mecanismo de ejemplo). Para la reunión interna alcanza con dejarlo.
2. **Tarjeta NFT/FARO en los lotes de `lighthouse-primeros` (hallazgo bajo del revisor)**
   La tarjeta aparece en todas las fichas, incluidas las de `lighthouse-primeros`, que no están en la venta de fase 1 (ADR-030 habla de `lighthouse-norte`). La spec dice "cada ficha", así que cumple.
   Acción sugerida: decidí si en ese grupo se oculta. Si sí, es un cambio chico en `app/lotes/[id]/ficha-cliente.tsx` (línea 145).
3. **Registrar R42 en `NS_platform`.** Este cambio rompe la regla 5 a pedido tuyo, y el implementador no editó ese repo. Acción: anotarlo vos o pedirlo en otra noche.
4. **Revisión legal antes de salir del equipo.** Todo es simulación: FARO, reparto, tramos, staking y red son de ejemplo. Los ⚖ nuevos están en borrador. Hace falta revisión legal y, para el inglés, un hablante nativo (anotado en `lib/idioma/revision-nativa.ts`).
5. **Falla de test que no es de este PR (`e2e/fogon-propuestas.spec.ts:154`).** Depende del reloj: la propuesta `cisterna-compartida` tiene inicio 2026-10-28, y hoy ya pasó la fase de preguntas, por eso falta el botón "Hacer preguntas para aclarar". A ese test le falta fijar la fecha con `page.clock.setFixedTime`, como ya se hizo en otros tests de fogón (commits 1e2329b y 05df4aa). No se arregló porque está fuera de alcance y fogón está congelado.
   Acción sugerida: pedir una línea aparte para arreglarlo. Ojo: esto se diagnosticó mirando el diff, sin correr la base. Es probable, pero no está comprobado.

## Revisor: veredicto y hallazgos
- **1ª revisión:** con observaciones. Fueron 3 hallazgos, todos bajos, y ninguno bloquea. Los 8 requisitos están cubiertos y las notas del 8-nov se cumplen. En seguridad, solo se agrega `/bien-comun` como ruta pública (página estática sin datos de personas). Evaluó como correctas las 4 decisiones propias del implementador.
  - Hallazgo 1, la espera sin plural: **corregido**.
  - Hallazgo 2, tramos y staking: **abierto, decide Gus** (punto 1).
  - Hallazgo 3, tarjeta en `lighthouse-primeros`: **abierto, decide Gus** (punto 2).
- **2ª revisión:** lista para revisión humana, 0 hallazgos nuevos y sin regresiones (161 archivos, 2405 tests, 3 omitidos; e2e de bien-comun 13/13). Detalle que no es hallazgo: `esperaAnios` no pasa el número por `enteroEn`. Además, el texto "se liberaría en N años" sigue sin plural.
- Comentarios: https://github.com/netxgen-2050/lighthouse-platform/pull/179#issuecomment-6726001208 y https://github.com/netxgen-2050/lighthouse-platform/pull/179#issuecomment-6726089350

## Tester: resultado
Pasa para lo que cambia el PR, con una falla ajena. Se probó en local, no en preview. Reporte: https://github.com/netxgen-2050/lighthouse-platform/pull/179#issuecomment-6726163870
- Playwright: 1190 pasaron, 2 fallaron y 1 se omitió.
  - Falla persistente: `e2e/fogon-propuestas.spec.ts:154` (punto 5, depende del reloj, no es del PR).
  - Falla intermitente: `e2e/pacto-puntual.spec.ts:385` (axe `document-title` en `/pactos`). Pasó al repetir. El diff no toca `/pactos`, el layout ni los metadatos, así que parece una carrera de navegación o hidratación del test.
- El primer build falló al bajar las fuentes de Google. Al repetirlo pasó.
- Lo verificado de `/bien-comun`, en es y en: un solo h1 y un solo main, aviso antes de cualquier número, tabla de Ostrom de 8 filas, reparto en 4 grupos, ⚖ presentes, sin español suelto en inglés y sin scroll horizontal a 390 px.
- Calculadora: anda con teclado y anuncia el resultado. Un monto menor al mínimo dice "Monto mínimo" y no hay botón de compra.
- Ficha con tarjeta NFT, reserva y boleto: bien. Los enlaces desde rail, `/lotes`, `/lotes/hibrido` y Sumarte: bien. axe pasa.
- Textos prohibidos: un e2e no halla ganancia, retorno ni valorización. 42.000, 46.800 y "procomún" no aparecen en el código de `app/`, `lib/bien-comun`, `lib/idioma` y `lib/legal`. No se buscó en el DOM renderizado de cada página.
- Límites: no hubo recorrido extra en el navegador. El campo `faro` solo tiene tests unitarios (`lib/lotes/compra.test.ts`), sin e2e propio.

## Para la próxima noche
- Preview de Vercel: renovar el secreto vencido y probar `/bien-comun` en el preview.
- Arreglar `e2e/fogon-propuestas.spec.ts:154` fijando la fecha (línea aparte, si la aprobás).
- Vigilar `e2e/pacto-puntual.spec.ts:385`: si vuelve a fallar, mirarlo por separado.
- Según lo que decidas: suavizar los textos de tramos y staking, ocultar la tarjeta NFT en `lighthouse-primeros`, y pasar `esperaAnios` por `enteroEn` y poner plural a "se liberaría en N años".
- Un e2e propio para el campo `faro` de la reserva.
- Registrar R42 en `NS_platform`, y revisión legal y de inglés nativo antes de mostrar esto fuera del equipo.
