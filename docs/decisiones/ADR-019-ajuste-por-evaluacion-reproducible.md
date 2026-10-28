# ADR-019 · El ajuste por evaluación entre pares se calcula en el servidor con una función pura con versión, y la constancia de ajuste guarda los parámetros que usó

- **Estado:** Propuesta
- **Fecha:** 2026-10-27
- **Cambio OpenSpec relacionado:** `evaluacion-pares`. Se apoya en ADR-012 (Semillas como constancias base + ajuste), ADR-010 (modelos como funciones puras con versión) y ADR-015 (datos de personas protegidos en el servidor).

## Contexto
`evaluacion-pares` lleva a código el `f_eval` (0,8–1,2) con las ocho defensas contra la colusión. Hoy todo corre en el navegador con datos de ejemplo. Los parámetros (umbral de reciprocidad, tope, mínimo, peso, fuerza) se van a recalibrar con simulación (NS_Tokenomics 29 K11) y cada comunidad elige su fuerza. Una constancia de ajuste que no dice con qué reglas se calculó no se puede auditar ni reproducir, y la recalibración la volvería ambigua. Además, para calcular hacen falta las notas individuales con quién las dio: eso no puede viajar al navegador de nadie.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No decidir todavía: el ajuste guarda solo `f_eval` y las Semillas | Más simple hoy | Al recalibrar no se sabe con qué reglas salió cada ajuste; una corrección no se puede justificar |
| **B · Función pura con versión + parámetros congelados en el ajuste; en la versión real corre solo en el servidor** | Reproducible y auditable; recalibrar = nueva versión, sin tocar lo emitido; el navegador recibe solo el resultado agregado | Un campo más en cada ajuste y disciplina para subir la versión |
| C · Guardar también cada nota individual dentro de la constancia | Auditoría total | Datos sensibles (quién evaluó a quién y por qué) dentro de algo pensado para ir a EAS; choca con "solo agregado" y con ADR-012 |

## Decisión
**B.** `calcularFactorEvaluacion` es una función pura con una constante `VERSION_EVALUACION`. La constancia de ajuste guarda en `datos` el `f_eval`, la `version_evaluacion`, los parámetros usados (incluida la fuerza) y los conteos agregados; nunca ids de evaluadores ni motivos. Cambiar la fuerza o los parámetros después de cerrar una ronda **no edita** el ajuste: se revoca y se emite otro que apunta a la misma base (ADR-012, punto 3). Cuando haya base de datos, el cálculo corre solo en el servidor, las evaluaciones viven en su tabla aparte (skill `base-de-datos`) y el equipo de la ronda sale de la membresía del pacto o círculo en el servidor, nunca de lo que mande el navegador.

## Consecuencias
- Ganamos: cualquier ajuste se puede recalcular y explicar ("salió con la versión 1, fuerza 0,2, mínimo 3").
- Ganamos: recalibrar con K11 es subir la versión, sin migrar lo ya emitido.
- Aceptamos: la constancia de ajuste es un poco más grande, y cada cambio en el algoritmo tiene que subir `VERSION_EVALUACION`.
- Riesgo: si la fuerza se puede cambiar con la ronda cerrada, cada cambio genera revocaciones; conviene que la fuerza quede fija al abrir la ronda (pregunta abierta para Gus).
- Revisar: al pasar las rondas a la base (`datos-en-la-nube`) y al cerrar la calibración K11.

## En palabras simples
Cuando el grupo evalúa a Lucía y su ajuste da 1,05, la constancia dice no solo "1,05", sino "1,05 calculado con las reglas de la versión 1 y la fuerza que eligió la comunidad". Si el mes que viene cambiamos las reglas, lo de Lucía no se toca: queda claro con qué reglas se hizo. Y las notas de cada persona nunca salen del servidor: Lucía ve su resultado, no quién la evaluó.
