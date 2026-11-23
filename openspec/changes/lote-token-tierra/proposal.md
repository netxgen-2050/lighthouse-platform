# Proposal

## Why

En la propuesta v0.1 (`NS_Tokenomics` doc 34 §3) el lote se compra en cuotas con **Token Tierra** (el plan de cuotas de Juanpi: el derecho contractual sobre un lote determinado; la escritura sigue su vía legal), y **FARO se acredita con cada cuota pagada** ("quien paga la mitad tiene la mitad"; si abandona el plan, el FARO de las cuotas no pagadas nunca se emite). El **NFT del lote** deja de ser algo que "trae FARO" y queda como la ficha del lote: superficie, estado, deberes. Hoy la ficha muestra "NFT del lote (simulado)" con los FARO que "traería" y el boleto dice que se asignarían de una vez. Gus pidió (23-nov, puntos 3 y 4) que la ficha muestre la propuesta.

Es el tercero de los cuatro cambios del pedido; depende de `bien-comun-propuesta`.

## What Changes

- **Ficha de cada lote de `lighthouse-norte`: tarjeta "Plan en cuotas · Token Tierra (simulado)"**: la persona elige contado o un plan de 12, 24 o 36 cuotas (de partida, 24); la tarjeta muestra el anticipo y el valor de cada cuota del lote (sin casa: la casa va aparte), y cuántos FARO se acreditarían con el anticipo, con cada cuota y en total. Dice que si se deja de pagar, el FARO de las cuotas no pagadas no se emite; que Token Tierra no arranca antes de la aprobación municipal (Ordenanza 173/2026), que hoy no está otorgada; que no es una oferta y que lo legal está a verificar con abogado. Sin interés ni actualización: "sin dato".
- **La tarjeta del NFT pasa a "Ficha del lote (NFT, simulado)"**: superficie, contorno, estado administrativo, deberes y red; sin la fila de FARO; dice que no es un instrumento de inversión y que no reemplaza la escritura. El ⚖ `nftlote` se reescribe.
- **Boleto de ejemplo:** el pago simulado es el primer pago (todo, si es contado; el anticipo, si es en cuotas). El boleto dice el plan elegido, el anticipo, la cuota, los FARO acreditados con ese primer pago y los que se acreditarían con cada cuota. Todo simulado.
- **Nota provisoria de costos** y ⚖ `retribucionraiz`: se alinean con "FARO se acredita con cada cuota" (deja de decir que se asignan de una vez).
- **Los primeros 4 lotes** siguen sin FARO y **tampoco** muestran Token Tierra (no están en el barrio de 21 lotes del doc 34; si entran, "sin dato"). Soluna sigue solo con `consultar`.

## Fuera de alcance

- Cobros reales, contratos, emisión de tokens, billeteras, firma o KYC.
- Interés, actualización por inflación o mora de las cuotas (no están en el doc 34: "sin dato").
- Plan de cuotas para la casa.
- Cambiar el precio del lote o el flujo de reserva fuera de lo dicho.
- La calculadora del barrio (cambio 2) y el Token Inversor (cambio 4).

## Capabilities

### New Capabilities
- `lote-token-tierra`: el plan en cuotas como Token Tierra simulado, el FARO por cuota y el NFT como ficha del lote.

### Modified Capabilities
- Reemplaza, en `bien-comun-tokens` (sin archivar), el requisito "NFT en la ficha y en el boleto" (la parte de los FARO que "traería" el NFT y que el boleto asignaría de una vez). Las reglas de los primeros 4 lotes se mantienen.

## Impact

- **Cambia:** `lib/bien-comun/modelo.ts` (función de FARO acreditado por fracción pagada, opciones de plan), `lib/lotes/compra.ts` (campo opcional `plan` en lo visto), `app/lotes/[id]/ficha-cliente.tsx`, `app/lotes/[id]/compra-cliente.tsx`, `lib/idioma/textos/lotes.ts`, `lib/legal/terminos.ts` (`nftlote`, `retribucionraiz`), tests y `e2e/lotes.spec.ts`.
- **Nuevo:** `components/lotes/plan-token-tierra.tsx`.
- **Sin** tablas, migraciones, permisos ni integraciones. La compra simulada sigue guardándose solo en el navegador, como hoy.
