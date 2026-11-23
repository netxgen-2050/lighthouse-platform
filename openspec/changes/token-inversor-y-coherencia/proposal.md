# Proposal

## Why

En la propuesta v0.1 (`NS_Tokenomics` doc 34 §3 y §4) el **Token Inversor** financia la infraestructura de un barrio dentro de su fideicomiso y **cobra a medida que entran las cuotas**, con una prima objetivo y un plazo máximo, en vez de una recompra a fecha fija: con lotes en cuotas, a los 12 meses el fideicomiso tendría solo una parte de lo que debe. Hoy `/netx/financiamiento` habla de series, SAFU y dinero temprano (diseño B) y no nombra al Token Inversor. Además, `/lotes/hibrido` dice que lo que falta del costo del común "saldría del token del bien común", lo que contradice la propuesta (FARO no levanta capital). Gus pidió (23-nov, puntos 3 y 5) mostrar el Token Inversor donde se habla de inversores y que el híbrido y la Vista NetX no contradigan la propuesta, enlazándolos a `/bien-comun`.

Es el cuarto de los cuatro cambios del pedido; depende de `bien-comun-propuesta` y de `bien-comun-numeros-barrio` (reutiliza su cálculo).

## What Changes

- **`/netx/financiamiento`: sección nueva "Token Inversor (propuesta v0.1, en discusión)"**, con entrada en el índice: qué financia (la infraestructura de un barrio: el monto sale de `lib/bien-comun/barrio.ts`), cómo cobra (a medida que entran las cuotas, con prima objetivo; plazo máximo "sin dato"), por qué no hay fecha fija (la parte de lo que debe que tendría el fideicomiso a los 12 y a los 24 meses, calculada), primero entre pocos inversores conocidos y que un ticket chico al público necesita una vía de oferta pública a verificar con abogado. Que el Token Equity queda fuera de este acuerdo. Sello de propuesta, ⚖ `tokeninversor` y `fideicomisobarrio`, enlace a `/bien-comun`.
- **Una línea de contexto** en las secciones de series y dinero temprano de `/netx/financiamiento`: "La propuesta v0.1 (doc 34) ubica el fideicomiso de cada barrio como una serie y suma el Token Inversor: en discusión". No se borra el diseño B.
- **`/lotes/hibrido`:** el texto "el resto saldría de: token del bien común…" pasa a decir que FARO no levanta capital y que el resto saldría de lo que el común produce (estadías, cocina, talleres), del prepago de servicios y de los barrios que sigan, "sin dato". Enlace "Ver la propuesta en discusión" a `/bien-comun`. Es y en.
- **Vista NetX (`/netx`):** en la tarjeta "Bien común", un enlace a `/bien-comun` con "Propuesta v0.1 del bien común: en discusión". Revisar que ningún texto de `/netx` hable de vender FARO, tramos o staking.
- **Sumarte, sección Invertir:** una línea que nombra al Token Inversor como propuesta en discusión, con enlace a `/bien-comun`; el texto del enlace del bien común deja de decir "ver la simulación del token" y pasa a "ver la propuesta en discusión".
- **Barrido:** ningún texto de la plataforma habla de precio, venta o rendimiento de FARO.

## Fuera de alcance

- Reemplazar el diseño B (series, SAFU, Pase Fundador) por la propuesta: eso depende de que Juanpi y Franz la acuerden.
- Cambiar qué dice el Pase Fundador o adónde va su plata.
- Traducir `/netx/financiamiento` (hoy solo en español, detrás de la sesión).
- Cobros, ofertas u oferta pública reales.
- La calculadora del barrio (cambio 2) y la ficha del lote (cambio 3).

## Capabilities

### New Capabilities
- `token-inversor-y-coherencia`: el Token Inversor en la Vista NetX y la coherencia de híbrido, Vista NetX y Sumarte con la propuesta v0.1.

### Modified Capabilities
- Ninguna spec vigente cambia de requisito; se suman textos y enlaces a `vista-netx-financiamiento` y al híbrido (`modelo-hibrido-procomun`, sin archivar) sin contradecirlos.

## Impact

- **Cambia:** `app/netx/financiamiento/page.tsx` (índice), una sección nueva en `app/netx/financiamiento/` (componente propio), `app/netx/page.tsx`, `lib/idioma/textos/hibrido.ts`, `app/lotes/hibrido/page.tsx`, `lib/idioma/textos/sumarte.ts`, `lib/idioma/textos/bien-comun.ts` (texto del enlace), tests y e2e.
- **Sin** tablas, migraciones, permisos ni integraciones. `/netx/financiamiento` mantiene su permiso actual (`vista-netx`).
