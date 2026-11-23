# Tasks

Requiere `bien-comun-propuesta` implementado (módulo nuevo y ⚖ `tokentierra`).

## 1. Modelo

- [ ] 1.1 Sumar `PLAN_CUOTAS`, `planDeLote` y `faroAcreditado` a `lib/bien-comun/modelo.ts` según `design.md` (reutilizando `BARRIO.anticipo` y `BARRIO.cuotas` si ya existen). **Verifica:** tests en `lib/bien-comun/modelo.test.ts`: contado = un pago igual al precio; 24 cuotas con anticipo 20 %; anticipo + cuotas = precio; FARO del anticipo + todas las cuotas = `faroDeLote(m2)`; sin superficie o sin precio → `null`.

## 2. Compra simulada

- [ ] 2.1 Sumar `plan?` a `LoVisto` en `lib/lotes/compra.ts` y al normalizador, opcional. **Verifica:** `lib/lotes/compra.test.ts` con un caso de compra vieja sin `plan` que se lee igual y uno nuevo con `plan` que conserva sus valores.

## 3. Pantallas

- [ ] 3.1 Crear `components/lotes/plan-token-tierra.tsx` y usarlo en `app/lotes/[id]/ficha-cliente.tsx` para `lighthouse-norte` (no en los primeros 4, que muestran "sin dato"). **Verifica:** `pnpm build` en verde.
- [ ] 3.2 Cambiar la tarjeta del NFT a "Ficha del lote (NFT, simulado)", sin la fila FARO, con "no es un instrumento de inversión". **Verifica:** e2e de la tarea 5.1.
- [ ] 3.3 En `app/lotes/[id]/compra-cliente.tsx`: rótulo del pago simulado según el plan y líneas del boleto con el plan y los FARO del primer pago. **Verifica:** e2e de la tarea 5.1.
- [ ] 3.4 En el panel del mapa (`app/territorios/[id]/vistas/lotes.tsx`), la línea de FARO dice que se acreditan a medida que se paga. **Verifica:** `e2e/lotes.spec.ts` (caso del mapa) en verde.

## 4. Textos y ⚖

- [ ] 4.1 Textos es/en en `lib/idioma/textos/lotes.ts` (tarjeta del plan, avisos, "sin dato", boleto, NFT como ficha). Sin números escritos. **Verifica:** `pnpm test lib/idioma lib/lotes/sin-numeros-escritos` en verde.
- [ ] 4.2 Reescribir `nftlote` y `retribucionraiz` en `lib/legal/terminos.ts` (borrador, es/en): NFT como ficha, no instrumento de inversión; FARO acreditado con cada cuota. **Verifica:** `pnpm test lib/legal` en verde.

## 5. E2E

- [ ] 5.1 En `e2e/lotes.spec.ts`: plan de partida en `/lotes/lote-1`; cambiar a 12 cuotas con teclado; contado; FARO por cuota y total (esperados calculados con el módulo); "Ordenanza 173" y "no está otorgada"; ficha del NFT sin FARO; boleto con 24 cuotas y FARO del anticipo; compra vieja sin plan (sembrada en el almacenamiento del navegador) sin error; `/lotes/lote-535` sin Token Tierra ni FARO; inglés; 390 px. **Verifica:** `pnpm test:e2e e2e/lotes.spec.ts` y `e2e/accesibilidad.spec.ts` en verde.

## 6. Cierre

- [ ] 6.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate lote-token-tierra --strict` pasa.
