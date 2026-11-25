# ADR-021 · Las Semillas pendientes de un compromiso recurrente no son constancias: la constancia base mensual se emite recién cuando se reciben

- **Estado:** Propuesta
- **Fecha:** 2026-10-28
- **Cambio OpenSpec relacionado:** `pactos-horas-variables` (la emisión en sí queda para `evaluacion-pares`). Ajusta ADR-012 (constancia base por ronda) y se apoya en ADR-018 y ADR-020.

## Contexto
ADR-012 dice que la constancia base de Semillas se emite por persona y por mes, con las horas confirmadas del pacto. El 28-oct Gus decidió que en un pacto de horas variables las Semillas de cada mes confirmado son **pendientes** hasta cumplir el compromiso mínimo (1 a 3 meses confirmados con más de 0 h), y que quien se va sin avisar pierde las pendientes del mes en curso. Hay que decidir **en qué momento** nace la constancia base mensual, porque una constancia emitida nunca se edita: si nace antes y después se pierde, hay que revocarla.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No decidir todavía: que `evaluacion-pares` lo resuelva | Nada que escribir hoy | `pactos-horas-variables` ya calcula pendientes y recibidas; sin regla, cada cambio la inventa distinta |
| B · Emitir la constancia base al confirmarse cada mes, y revocarla si las pendientes se pierden | Cada mes queda congelado desde el primer día, con el valor de la hora de ese momento | Perder pendientes (irse sin avisar) pasa a ser **revocar** una constancia: más historia que explicar y algo que se lee como sanción |
| **C · Lo pendiente se calcula desde las confirmaciones (`pacto-confirma-horas`) y no es constancia; la constancia base mensual se emite al recibirse, con el valor de la hora de ese momento** | Lo que se pierde nunca llegó a ser constancia: no hay nada que revocar; la confirmación del mes ya queda como constancia de las dos partes (ADR-018) | Mientras no exista la emisión, las Semillas recibidas se calculan en pantalla con el valor de la hora de hoy (no están congeladas) |

## Decisión
**C.** Las confirmaciones mensuales son la prueba de lo trabajado; las Semillas pendientes se derivan de ellas. Cuando las pendientes se reciben (al cumplir el mínimo, o al irse avisando), se emite **una constancia base por mes recibido** (`semillas-base`, `datos.tipo = "mensual"`, `periodo` = ese mes en hora de Argentina, `datos.confirmacion` = el id de la confirmación del mes), con el valor de la hora del momento en que se reciben. En la base la emite solo el servidor, con único por `datos.confirmacion`.

Reglas:
- **Lo recibido no desaparece.** Un cambio de pacto (por ejemplo, de horas variables a fijas) no borra ni esconde Semillas recibidas.
- **Pendiente no es saldo.** Las pendientes se muestran aparte y no suman al total.
- **Antes de cualquier uso real de las Semillas** (votar con ellas, firmarlas, publicarlas), la emisión al recibirse tiene que existir; hasta entonces, la pantalla las calcula y eso es aceptable solo en el prototipo.

## Consecuencias
- Ganamos: irse sin avisar no obliga a revocar nada; la historia de constancias queda limpia y no se lee como multa.
- Ganamos: el mes de la constancia es el mes trabajado, no el mes en que se recibió.
- Aceptamos: en el prototipo, las Semillas recibidas de un pacto variable se recalculan si cambia el valor de la hora, hasta que `evaluacion-pares` emita la constancia.
- Aceptamos: una persona puede tener meses confirmados que todavía no son constancia; quien audite tiene que mirar las confirmaciones para ver lo pendiente.
- **Revisar:** cuando Gus decida qué pasa con los meses confirmados después del mínimo y con las pendientes de un pacto que pasa a fijo; al implementar `evaluacion-pares`; antes de la primera constancia firmada (ADR-012 etapa 2).

## En palabras simples
Lucía se comprometió 3 meses con Valle Solar y la tribu le confirmó noviembre y diciembre. Esas Semillas están "pendientes": se ven, pero todavía no son de ella. En enero la tribu confirma el tercer mes y las tres se reciben: recién ahí queda anotado, sin poder tocarse más, "Lucía recibió las Semillas de noviembre, diciembre y enero". Si se hubiera ido sin avisar en diciembre, no habría nada que tachar, porque esa anotación nunca se hizo.

## Fuentes
- ADR-012, ADR-018 y ADR-020 de este repo; `openspec/changes/pactos-horas-variables/design.md` §4 y §7.
- `NS_platform`: "Desarrollo/08 - Backlog de producto" D20 y D31; respuestas de Gus del 28-oct.
