# ADR-014 · Los resultados de Monte Carlo de NS_Tokenomics se copian como tabla versionada; los modelos determinísticos se siguen traduciendo como funciones puras

- **Estado:** Propuesta
- **Fecha:** 2026-10-23
- **Cambio OpenSpec relacionado:** vista-netx-financiamiento (amplía ADR-010, del cambio fogon-simulador-parametros)

## Contexto
La Vista NetX tiene que mostrar rangos de riesgo (TIR de las Unidades P10/P50/P90, probabilidad de perder plata) que salen de `NS_Tokenomics/sim/series_montecarlo_sim.py`: 2.000 futuros por serie, sorteados con el generador de Python (`random.gauss`, semilla 7). ADR-010 dice que cada modelo se traduce a TypeScript y sus tests reproducen el RESULTS, y deja escrito "revisar cuando un modelo necesite algo que el navegador no pueda correr rápido (por ejemplo Monte Carlo)". Este es ese caso: sin copiar el generador de Python bit a bit, una traducción da otros números y el test no puede reproducir el RESULTS.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · Traducir el Monte Carlo y el generador de Python (Mersenne Twister + `gauss`) a TypeScript | Mismos números; se podrían mover los supuestos de riesgo | Mucho código delicado para un prototipo; cualquier diferencia de un dígito en el generador cambia todo; 4.000 corridas del modelo en el navegador |
| B · Traducir el Monte Carlo con el generador de JavaScript | Poco código | Da otros números que el RESULTS: la pantalla mostraría rangos que nadie del equipo publicó (dato inventado) |
| C · Copiar la tabla del RESULTS como constante con versión, probada con doble entrada (la constante y el test copian el RESULTS por separado) y con invariantes (P10 ≤ P50 ≤ P90, probabilidades entre 0 y 1) | Exacto, simple, sin cálculo en el navegador; la fuente y la versión quedan a la vista | No se pueden mover los supuestos de riesgo en la pantalla; si el `.py` se re-corre, hay que copiar la tabla nueva |
| D · No mostrar rangos todavía | Nada que mantener | Gus pidió rangos visibles; sin ellos el relato solo muestra el caso de partida |

## Decisión
**C.** Los modelos **determinísticos** (cascada de series, ingresos de la plataforma, cuentas del doc 30) se siguen traduciendo como funciones puras con tests que reproducen el RESULTS (ADR-010). Los modelos **aleatorios** se copian como tabla: una constante en `lib/<modelo>/` con `fuente`, `version`, `fecha`, `N` y `semilla`, que la pantalla muestra, y un test que la compara con su propia copia del RESULTS y vigila las invariantes. Un `.py` nuevo o re-corrido = un cambio OpenSpec que actualiza tabla, versión y test juntos (regla 4 de ADR-010).

## Consecuencias
- Ganamos: rangos exactos a los publicados por NS_Tokenomics, sin código frágil ni cálculo pesado en el navegador.
- Aceptamos: los supuestos de riesgo (helada, demoras, precios) no se mueven en la plataforma; para explorar otros, se re-corre el `.py` en NS_Tokenomics.
- Aceptamos: la doble entrada atrapa errores de copia, pero no que el `.py` haya cambiado; eso lo cubre la versión a la vista.
- Revisar cuando: el equipo pida mover los supuestos de riesgo en la pantalla, o cuando los modelos corran en un servicio propio (por ejemplo, si llega un backend Python).

## En palabras simples
El modelo de riesgo de NS_Tokenomics tira los dados 2.000 veces para ver qué pasa si hay heladas o demoras. Copiar esos dados exactos en la plataforma es difícil y fácil de romper. Entonces copiamos el resultado tal cual (por ejemplo "el viñedo: entre −2,6 % y 10,8 % en 8 de cada 10 futuros"), con la fecha y la versión del modelo a la vista. Si el equipo vuelve a correr el modelo, se copia el resultado nuevo con otro cambio.

## Fuentes
- `NS_Tokenomics/sim/series_montecarlo_sim.py` y `sim/RESULTS_series_montecarlo.md` (v0.1, 2026-10-17), leídos el 2026-10-23.
- `NS_Tokenomics/29 - Systems design pass for B` §5 (supuestos de incertidumbre), leído el 2026-10-23.
- ADR-010 (rama `agente/fogon-simulador-parametros`, en Propuesta), leído el 2026-10-23.
- `openspec/changes/vista-netx-financiamiento/design.md` §5.4.
