# ADR-020 · Un pacto puntual emite su propia constancia base de Semillas, una por persona y por tarea, cuando el holón verifica las horas, fuera de la ronda mensual

- **Estado:** Propuesta
- **Fecha:** 2026-10-28
- **Cambio OpenSpec relacionado:** `pacto-puntual-verificacion` (antes, `pacto-puntual`; se partió el 28-oct). Amplía ADR-012 (Semillas como constancias) y se apoya en ADR-018 (pactos acordados con constancias). Usa el número 020 porque el 018 y el 019 ya están en `dev`.

## Contexto
ADR-012 dice que las Semillas base se emiten **por ronda**: una constancia por persona y período (un mes), con las horas confirmadas del pacto. El pacto puntual (D20) es una sola tarea con fecha: alguien arregla la tranquera y se va. No tiene período ni ronda. Además, una misma tarea la pueden tomar **varias personas** (decisión de Gus, 28-oct). Hay que decidir cómo se convierten sus horas en Semillas sin inventar un segundo sistema y sin que después haya que migrar lo emitido.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No hacer nada todavía: el puntual no da Semillas hasta que exista la base | Cero riesgo de emitir algo mal | Pierde el sentido de D20: quien colabora una vez no ve su reconocimiento |
| B · Sumar las horas del puntual a la constancia base del mes de la persona | Una sola constancia por mes, como dice ADR-012 | La constancia del mes cambia cada vez que se confirma una tarea (o espera al cierre del mes): editar algo congelado, o demorar; quien no tiene pacto fijo no tiene ronda |
| **C · Una constancia base por persona y por tarea (`semillas-base`, `datos.tipo = "puntual"`), al verificarse sus horas** | Misma forma que la base mensual; nace congelada y nunca se edita; funciona sin pacto fijo; cada persona tiene la suya aunque compartan tarea; el saldo es la suma de todas las bases, sin importar el tipo | Más constancias por persona; la evaluación de pares mensual no las alcanza (ver consecuencias) |

## Decisión
**C.** Las horas **verificadas por el holón** de cada persona en un pacto puntual emiten **una** constancia `semillas-base` para esa persona y esa tarea, con `periodo` = mes de la verificación en hora de Argentina y las Semillas calculadas una sola vez. Las reglas de ADR-012 siguen igual: nunca se edita, una corrección revoca y emite otra, `afirma` es NetX y nunca hay datos personales en `datos` ni en el uid.

Reglas:
- **Quién verifica** (decisión de Gus, 28-oct). La gobernanza del holón de la necesidad (el círculo o la tribu) pre-admite la postulación y, al final, verifica que la tarea se completó; recién con esa verificación hay Semillas. En el prototipo responde quien administra el holón: quien lidera la tribu (por la tribu o sus círculos) o el super admin (por el común o un círculo transversal).
- **Por persona** (decisión de Gus, 28-oct). Si varias personas toman la tarea, cada una marca sus horas, el holón verifica las de cada una y cada una recibe su constancia por sus propias horas. El uid sale de la postulación pre-admitida de esa persona, no de su identificador.
- **Máximo por persona** (decisión de Gus, 28-oct). Quien administra el holón puede poner un máximo de horas o de Semillas por tarea y por persona. La constancia guarda las horas verificadas, las horas con Semillas, las horas sin Semillas y el máximo aplicado; las Semillas salen solo de las horas con Semillas (y nunca superan un máximo en Semillas). Vale el máximo que vio el holón al pre-admitir.
- **Se reciben al verificarse.** Las Semillas de un puntual son Semillas recibidas desde la verificación. No pasan por "Semillas pendientes", que son de los meses de un compromiso recurrente hasta cumplir su mínimo (`pactos-horas-variables`).
- **Quién la emite.** En el prototipo la arma el navegador de la persona al conciliar la verificación (`pacto-confirma-horas`, que suma `pacto-puntual-verificacion` sobre ADR-018), con uid `ejemplo-…`; no hay botón simulado. En la base la emite **solo el servidor**, cuando se registra la verificación, y comprueba que quien verifica administra **ese** holón y no es la persona del pacto (J11: nadie se valida a sí mismo).
- **Una por persona y tarea.** Confirmar dos veces no emite dos.
- **El período es local.** El mes se calcula en hora de Argentina, no en UTC, porque un período mal puesto ya no se corrige sin revocar.

## Consecuencias
- Ganamos: quien colabora una sola vez tiene su reconocimiento con la misma forma de dato que el resto; el saldo no distingue tipos; varias personas pueden compartir una tarea sin pisarse.
- Aceptamos (decisión de Gus, 28-oct): un pacto puntual **no** habilita la ronda de reconocimiento ni la evaluación de pares, y el ajuste `f_eval` **no** se aplica a las bases puntuales. Su validación es la verificación del holón. Una persona podría sumar Semillas solo con tareas sueltas; lo acotan la pre-admisión, la verificación, el máximo por persona y las defensas de D13.
- Aceptamos: más constancias por persona (una por tarea), algo que importa recién si se publican en la cadena (etapa 3 de ADR-012). Las horas sin Semillas quedan registradas: dicen cuánto se trabajó de más, aunque no se reconozca.
- **Revisar:** al pasar los pactos a la base (P9) y antes de la primera constancia firmada.

## En palabras simples
Ana y Beto montan los paneles solares de Valle Solar. El círculo que se ocupa puso un máximo de 10 horas por persona. Ana hizo 12 y Beto 6. Cuando el círculo verifica, quedan dos anotaciones: "NetX registra 12 h de Ana en los paneles, noviembre de 2026: 10 h con Semillas, 2 h de más sin Semillas, 50 Semillas" y "6 h de Beto: 30 Semillas". Cada una es de esa persona y esa tarea, y no se toca más. Si mañana cambia el valor de la hora, las 50 de Ana siguen siendo 50. No pasa por la ronda de pares: la verificación del círculo es lo que vale.

## Fuentes
- ADR-012 (sección "Semillas") y ADR-018 de este repo.
- `NS_platform`: "Desarrollo/08 - Backlog de producto" D15, D20 y D13; reunión 2026-10-23 Don Powa · Quinta Esencia (#5); "2026-10-27 - Lo que aprendimos de Collabberry".
- `NS_Tokenomics` 29 (J11).
