# ADR-020 · Un pacto puntual emite su propia constancia base de Semillas, una por tarea, cuando la tribu confirma las horas, fuera de la ronda mensual

- **Estado:** Propuesta
- **Fecha:** 2026-10-28
- **Cambio OpenSpec relacionado:** `pacto-puntual`. Amplía ADR-012 (Semillas como constancias) y se apoya en ADR-018 (pactos acordados con constancias, rama `spec/pactos-dos-partes`).
- **Número:** se saltea el 019 porque hoy hay dos ADR-018 en ramas distintas (`spec/pactos-dos-partes` y `spec/evaluacion-pares`); uno de ellos va a pasar a ser el 019 cuando se integren.

## Contexto
ADR-012 dice que las Semillas base se emiten **por ronda**: una constancia por persona y período (un mes), con las horas confirmadas del pacto. El pacto puntual (D20) es una sola tarea con fecha: alguien arregla la tranquera y se va. No tiene período ni ronda. Hay que decidir cómo se convierten sus horas en Semillas sin inventar un segundo sistema y sin que después haya que migrar lo emitido.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No hacer nada todavía: el puntual no da Semillas hasta que exista la base | Cero riesgo de emitir algo mal | Pierde el sentido de D20: quien colabora una vez no ve su reconocimiento |
| B · Sumar las horas del puntual a la constancia base del mes de la persona | Una sola constancia por mes, como dice ADR-012 | La constancia del mes cambia cada vez que se confirma una tarea (o espera al cierre del mes): editar algo congelado, o demorar; quien no tiene pacto fijo no tiene ronda |
| **C · Una constancia base por tarea (`semillas-base`, `datos.tipo = "puntual"`), al confirmarse las horas** | Misma forma que la base mensual; nace congelada y nunca se edita; funciona sin pacto fijo; el saldo es la suma de todas las bases, sin importar el tipo | Más constancias por persona; la evaluación de pares mensual no las alcanza (ver consecuencias) |

## Decisión
**C.** Las horas confirmadas de un pacto puntual emiten **una** constancia `semillas-base` por tarea, con `periodo` = mes de la confirmación en hora de Argentina y `semillas = round(horas × HOUR_REF_USD)`, una sola vez. Las reglas de ADR-012 siguen igual: nunca se edita, una corrección revoca y emite otra, `afirma` es NetX y nunca hay datos personales en `datos`.

Reglas:
- **Quién la emite.** En el prototipo la arma el navegador, con uid `ejemplo-…` y detrás de un botón rotulado como simulación. En la base la emite **solo el servidor**, cuando se registra la confirmación de horas de la tribu (`pacto-confirma-horas`, a sumar en ADR-018), y verifica que quien confirma lidera **esa** tribu y no es la persona del pacto (J11: nadie se valida a sí mismo).
- **Una por tarea.** El uid sale de la comunidad y la necesidad; confirmar dos veces no emite dos.
- **El período es local.** El mes se calcula en hora de Argentina, no en UTC, porque un período mal puesto ya no se corrige sin revocar.

## Consecuencias
- Ganamos: quien colabora una sola vez tiene su reconocimiento con la misma forma de dato que el resto; el saldo no distingue tipos.
- Aceptamos: hasta que se decida otra cosa, el ajuste por evaluación de pares (`f_eval`, `evaluacion-pares`) **no** se aplica a las bases puntuales. Una persona podría sumar Semillas solo con tareas sueltas, sin pasar por la ronda. Las defensas de D13 y la confirmación de la tribu lo acotan.
- Aceptamos: más constancias por persona (una por tarea), algo que importa recién si se publican en la cadena (etapa 3 de ADR-012).
- **Revisar:** al implementar `evaluacion-pares` (¿el ajuste del mes alcanza también a las bases puntuales de ese período?), al pasar los pactos a la base (P9) y antes de la primera constancia firmada.

## En palabras simples
Ana arregla la tranquera de Valle Solar en 10 horas. Cuando Valle Solar confirma esas horas, queda anotado: "NetX registra 10 h de Ana en la tranquera de Valle Solar, noviembre de 2026: 50 Semillas". Esa anotación es solo de esa tarea y no se toca más. Si mañana cambia el valor de la hora, las 50 de Ana siguen siendo 50. Hoy, en el prototipo, la confirmación la simula la misma persona; con la base la va a dar quien lidera la tribu.

## Fuentes
- ADR-012 (sección "Semillas") y ADR-018 (rama `spec/pactos-dos-partes`) de este repo.
- `NS_platform`: "Desarrollo/08 - Backlog de producto" D15, D20 y D13; reunión 2026-10-23 Don Powa · Quinta Esencia (#5); "2026-10-27 - Lo que aprendimos de Collabberry".
- `NS_Tokenomics` 29 (J11).
