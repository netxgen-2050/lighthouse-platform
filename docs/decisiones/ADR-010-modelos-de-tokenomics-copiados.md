# ADR-010 · Los modelos de tokenomics los manda NS_Tokenomics: la plataforma los copia como funciones puras con versión y números de referencia

- **Estado:** Propuesta
- **Fecha:** 2026-10-17
- **Cambio OpenSpec relacionado:** fogon-simulador-parametros (primer paso de D8, issue #94)

## Contexto
`fogon-simulador-parametros` trae a la plataforma el modelo de cascada de las series del diseño legal B (`NS_Tokenomics/sim/series_waterfall_sim.py`, v0.1, 17-oct-2026). Es el primer modelo de tokenomics que la plataforma corre, y no va a ser el último: después vienen Monte Carlo, la Serie Madre, el SAFU y, con el resto de D8, consultas y decisiones del Fogón sobre esos mismos parámetros. El modelo vive en Python en otro repo, lo ajustan Gus y Vagner, y cambia seguido. La plataforma es Next.js en TypeScript, en Vercel y sin backend Python. Hace falta decidir quién manda sobre el modelo y cómo se evita que la versión de la pantalla y la del `.py` digan cosas distintas sin que nadie se entere.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · Copiar el modelo a TypeScript como función pura, con versión anotada y la tabla de resultados del `.py` como test | Corre en el navegador, sin red ni servidor; se prueba con Vitest; la pantalla responde al instante | Hay dos copias del modelo; si el `.py` cambia y nadie abre un cambio, la pantalla queda vieja (con la versión a la vista) |
| B · Correr el `.py` en un servicio (función Python en Vercel u otro lado) | Una sola copia del modelo | Un servicio externo más, con falla, latencia y despliegue; cada movimiento de un control es un pedido de red; desproporcionado para un prototipo |
| C · Escribir el modelo una sola vez en TypeScript y que NS_Tokenomics lo use desde ahí | Una sola copia | Cambia la forma de trabajar de NS_Tokenomics (Python, stdlib) y de quienes ajustan el modelo; no es una decisión de este repo |
| D · Generar los números en el `.py` y que la plataforma solo muestre tablas fijas | Cero riesgo de desfase | No se puede mover ningún valor: no sirve para lo que pide el issue #94 |

## Decisión
**A**, propuesta por el arquitecto. NS_Tokenomics es el **dueño** del modelo; la plataforma tiene una **copia traducida**, fiel al `.py` (mismas fórmulas, mismo orden, mismos supuestos; lo que no se puede calcular → `null` → "sin dato"). Reglas:
1. Cada modelo copiado vive en `lib/<modelo>/` como función pura, sin React, Next ni red (test de fuente).
2. Exporta una constante `VERSION_MODELO` con el archivo de origen, su versión y su fecha, que se ve en la pantalla.
3. Sus tests reproducen la tabla de resultados del `.py` de esa versión, con tolerancias escritas.
4. Si el `.py` cambia, se abre **otro cambio OpenSpec** que actualiza a la vez la constante, la traducción y los números de referencia. Si el implementador ve una diferencia entre el diseño y el `.py`, manda el `.py` y lo reporta.
5. Un supuesto o cálculo que la plataforma agrega y el `.py` no tiene se escribe como "agregado de la plataforma, no del modelo", vive en su propia función o rama del código y tiene su test. En el primer cambio son tres, pedidos por Gus el 21-oct-2026: la curva escalada del viñedo, la conversión del SAFU con su descuento y la TIR por encima de 100 % anual (el `.py` la deja en `NaN`). Un agregado nunca cambia los números de referencia con los valores de partida.
6. Los supuestos del modelo que todavía no confirmó su dueño (en el primer cambio: múltiplo de salida, estructura de capital, reserva y curva del viñedo, a confirmar con Vagner) se muestran movibles y rotulados "a confirmar con …"; si cambian en el `.py`, aplica la regla 4.

> Numeración: si otro cambio en preparación (`fogon-propuestas-github`) también toma el número 010, el que entre segundo a `dev` renumera su ADR.

## Consecuencias
- Ganamos: simulador instantáneo y sin servicios que fallen; tests que atrapan cualquier diferencia con los números publicados del modelo.
- Ganamos: queda claro quién decide el modelo (NS_Tokenomics, Gus y Vagner) y que la plataforma solo lo muestra.
- Aceptamos: dos copias del modelo y el trabajo de traducir cada versión nueva; no hay chequeo automático entre los dos repos.
- Aceptamos: entre que cambia el `.py` y que entra el cambio OpenSpec, la pantalla muestra la versión anterior (con su número de versión a la vista).
- Revisar cuando: un modelo necesite algo que el navegador no pueda correr rápido (por ejemplo Monte Carlo con muchas corridas), cuando los parámetros pasen a decidirse de verdad en el Fogón (resto de D8: ahí el valor vigente tiene que salir de la base, con su acta, y no de una constante), o antes de mostrar la plataforma fuera del equipo (R14).

## En palabras simples
El modelo de la tokenomics lo escriben Gus y Vagner en NS_Tokenomics, en Python. La plataforma no lo inventa ni lo cambia: hace una copia en su propio idioma para que la pantalla responda al instante cuando alguien mueve un valor. Para que la copia no se quede vieja sin avisar, lleva escrito de qué versión salió y unos tests que comparan sus números con los del modelo original. Si el modelo cambia, se pide un cambio nuevo en la plataforma; mientras tanto, la pantalla dice de qué versión son sus números.

## Fuentes
- `openspec/changes/fogon-simulador-parametros/` (proposal, design §3–§4 y §7, tasks), leído el 2026-10-17.
- `NS_Tokenomics/sim/series_waterfall_sim.py` (v0.1, 2026-10-17) y `sim/RESULTS_series_waterfall.md`, leídos el 2026-10-17.
- Issue #94 e ítem D8 del backlog, citados en el proposal (no leídos directamente).
- `CLAUDE.md` (fase de prototipo interno; el dato que falta no es cero).
