# Proposal

## Why

Gus (8-nov-2026) quiere mostrarle mañana al equipo cómo se podría financiar y gobernar el bien común de Lighthouse VRN con tokens: un NFT por cada lote privado, con deberes hacia el bien común, y un token del bien común que da voz, se reparte con los lotes, se vende temprano por tramos y también representa las parcelas comunes. Es una **exploración para conversar**, inspirada en Elinor Ostrom. Nada se emite, nada se cobra y nada está decidido.

## What Changes

- **Página `/bien-comun`, "El bien común de Lighthouse VRN"**, pública y bilingüe, con un aviso fijo de simulación: los principios de Ostrom y cómo los tomaría el diseño; los dos tipos de token (NFT del lote y token del bien común, nombre provisorio **FARO**); las parcelas comunes como NFT del tesoro; cómo se reparte FARO; la venta temprana por tramos con una calculadora; staking en dos opciones; CAPEX y OPEX con referentes reales; riesgos y decisiones pendientes.
- **Un solo módulo con versión, `lib/bien-comun/modelo.ts`**, con todos los valores de ejemplo. Ninguna pantalla escribe números.
- **Ficha del lote:** tarjeta "NFT del lote (simulado)" con su metadata y los FARO que traería. **Boleto:** dice que se acuñaría el NFT y se asignarían esos FARO, todo simulado.
- **La nota provisoria de la ficha** deja de decir "RAIZ": pasa a "tokens del bien común (nombre provisorio: FARO)", y el ⚖ `retribucionraiz` se reescribe.
- **Enlaces:** desde el rail (destino "Bien común", en Descubrir), `/lotes`, `/lotes/hibrido`, la ficha y la sección Invertir de Sumarte.
- **⚖ nuevos en borrador, es/en:** `nftlote`, `tokenbiencomun`, `ventatramos`, `stakingbiencomun`, `partenetxgen`.

## Rompe una regla, a pedido de Gus

La regla 5 de producto no permite decir "token" ni hablar de inversión. Gus lo pidió para el prototipo interno el 8-nov ("tokens y NFTs en la plataforma"). Cada pantalla dice que es una simulación, que no es una oferta y que lo legal está a verificar con abogado. Se registra en `NS_platform` como R42. No sale del equipo sin revisión legal.

## Fuera de alcance

- Contratos, billeteras, red, emisión, compra o cobro reales. Nada se guarda: las calculadoras no tienen estado.
- Gobernanza real con FARO, staking real y reparto real.
- Decidir el nombre, el reparto, los tramos o la red: son valores de ejemplo para conversar.
- Editar `NS_Tokenomics`.

## Capabilities

### New Capabilities
- `bien-comun-tokens`: la simulación del NFT del lote, el token del bien común, las parcelas comunes, la venta por tramos y el staking.

### Modified Capabilities
- `lotes-ficha` y `lotes-compra-simulada`: tarjeta del NFT, FARO en el boleto y nota provisoria sin "RAIZ".
- `navegacion-rail`: destino "Bien común".

## Impact

- **Código nuevo:** `lib/bien-comun/modelo.ts` y su test, `app/bien-comun/page.tsx` y sus componentes, `lib/idioma/textos/bien-comun.ts`, `e2e/bien-comun.spec.ts`.
- **Cambia:** `app/lotes/[id]/ficha-cliente.tsx`, `app/lotes/[id]/compra-cliente.tsx`, `lib/lotes/compra.ts` (campo opcional en `vio`), `lib/legal/terminos.ts`, `lib/navegacion.ts`, `app/sumarte/sumarte-cliente.tsx`, `lib/sesion/rutas-publicas.ts`, `lib/idioma/rutas.ts`.
- **Sin** tablas, migraciones ni dependencias nuevas.
- **Depende de** `modelo-hibrido-procomun` (apilado sobre ese cambio: usa "bien común" y `/lotes/hibrido`).
