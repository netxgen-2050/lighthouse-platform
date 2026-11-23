# Design

## Modelo

En `lib/bien-comun/modelo.ts` (módulo del cambio 1):

- `PLAN_CUOTAS = { opciones: [0, 12, 24, 36], dePartida: BARRIO.cuotas.valor, anticipo: BARRIO.anticipo.valor }` (0 = contado). Fuente: `barrio_stack_sim.py` v0.1 (`PLANS`, `DOWN_PAYMENT`). Si el cambio 2 todavía no está, `anticipo` y `cuotas` se agregan acá con la misma fuente y el cambio 2 los reutiliza (un solo lugar).
- `planDeLote(precio, cuotas)` → `{ anticipo, cuota, cuotas } | null`. Contado: `{ anticipo: precio, cuota: null, cuotas: 0 }`. Precio nulo → `null`.
- `faroAcreditado(m2, fraccionPagada)` → `Math.round(faroDeLote(m2) × fraccionPagada)` o `null` si no hay superficie. Con el anticipo, la fracción es `anticipo`; cada cuota suma `(1 − anticipo) / cuotas`. La suma de anticipo + todas las cuotas es `faroDeLote(m2)` (el test lo vigila, tolerando el redondeo en la última cuota).
- <!-- arquitecto: regla de redondeo explícita --> **Redondeo:** `faroAnticipo = round(total × anticipo)`; `faroPorCuota = round((total − faroAnticipo) / cuotas)`; la **última** cuota acredita `total − faroAnticipo − (cuotas − 1) × faroPorCuota`. Si la última difiere de `faroPorCuota`, la tarjeta y el boleto lo dicen en una línea ("la última cuota: N"). Así la suma da exacta y no se muestra un número que no cierra. Lo mismo para el monto de la cuota en dólares.

## Ficha

- Componente `components/lotes/plan-token-tierra.tsx`, con datos y textos por props: radio "Contado / 12 / 24 / 36 cuotas" (fieldset con legend), y un `<dl>` con anticipo, cuota, FARO con el anticipo, FARO por cuota, FARO en total. Se deshabilita cuando ya hay una compra simulada, igual que la elección de casa.
- El plan solo se aplica al **precio del lote**. Si se elige casa, una línea dice que la casa se paga aparte (doc 34 / `barrio_stack_sim.py`: "each family pays for its own").
- Aviso en la tarjeta (texto, no color): "Simulación · no es una oferta · Token Tierra no arranca antes de la aprobación municipal (Ordenanza 173/2026), que hoy no está otorgada · lo legal, a verificar con abogado", con los ⚖ `tokentierra` (del cambio 1) y `ordenanza173` (ya existe en el catálogo).
- Interés y actualización de las cuotas: "sin dato".
- Enlace "Ver la propuesta del bien común" a `/bien-comun`.

## NFT como ficha del lote

La tarjeta existente cambia el título a "Ficha del lote (NFT, simulado)", saca la fila FARO y suma "No es un instrumento de inversión: describe el lote y sus deberes". `nftlote` se reescribe en ese sentido (borrador). El panel del mapa (`app/territorios/[id]/vistas/lotes.tsx`) puede seguir mostrando los FARO del lote con `tokenbiencomun`, pero con el texto "se acreditan a medida que se paga" (una línea del diccionario).

## Boleto

`LoVisto` en `lib/lotes/compra.ts` suma `plan?: { cuotas: number; anticipo: number; cuota: number | null; faroAnticipo: number | null; faroPorCuota: number | null }`. Opcional: las compras guardadas antes siguen leyéndose (el normalizador lo ignora si falta). El boleto, si hay `plan`, muestra el plan y los FARO acreditados con el primer pago; si no hay (compra vieja), muestra lo que muestra hoy. El "pago simulado" se rotula "Simular el primer pago (anticipo)" cuando hay cuotas.

<!-- arquitecto: lo guardado en el navegador y los rótulos después del primer pago -->
- **Un `plan` mal formado no borra la compra.** Hoy `esCompra` descarta la compra entera si un campo no valida. Para `plan`: si falta, o si no valida (`cuotas` fuera de `PLAN_CUOTAS.opciones`, números no finitos), `leerCompras` conserva la compra **sin** `plan` y la pantalla muestra el plan como "sin dato". Nunca se presume "contado" para una compra sin plan.
- **Compra vieja con `faro`:** se muestra el número guardado, con el texto nuevo ("se acreditan a medida que se paga"); no se reescribe lo guardado.
- **Después del primer pago con cuotas** no se dice que el lote está pagado: el anuncio (`anuncioPagado`) y la línea del boleto (`pagado`) dicen "primer pago simulado (anticipo)". El estado del lote sigue siendo `vendido-a-vos` (el plan en cuotas es una compra en cuotas), con el plan entre paréntesis si lo hay; si Gus prefiere otro estado, es una decisión de producto aparte.
- La tarjeta del plan se muestra según `ventaSimulada`; nunca lee `aprobacionMunicipal` (ADR-030, ADR-031 regla 5).

## Primeros 4 y Soluna

`loteTraeFaro("primeros")` sigue `false`. Se agrega la misma regla para Token Tierra: no se muestra en los primeros 4 (la ficha dice "Plan en cuotas: sin dato para estos lotes"). Soluna no tiene ficha de compra (`consultar`): no cambia.
