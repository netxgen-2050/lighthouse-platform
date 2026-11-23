# ADR-031 · Una propuesta en discusión se muestra desde un módulo con versión y estado por decisión, y no tiene efectos: FARO no da membresía, voto ni rol en la plataforma mientras sus decisiones estén abiertas

- **Estado:** Aceptada (Gus, 23-nov-2026)
- **Fecha:** 2026-11-23
- **Cambio OpenSpec relacionado:** `bien-comun-propuesta` (y sus hermanos `bien-comun-numeros-barrio`, `lote-token-tierra`, `token-inversor-y-coherencia`). Se apoya en ADR-010, ADR-023, ADR-025 y ADR-030.

## Contexto
La propuesta v0.1 del bien común (`NS_Tokenomics`, doc 34, 19-nov) reemplaza en pantalla al modelo del 8-nov, pero **no está acordada**: tiene 8 decisiones abiertas (§7). El doc 34 llama a FARO "membresía que crece" (§3, puente 2) y le da voz sobre el tesoro (§3, "Voz"). En la plataforma, la membresía del común sale de adherir al manifiesto (ADR-025) y la adhesión es la llave de la gobernanza (ADR-023). Si una pantalla o un helper empieza a leer FARO como membresía o como peso de voto, quedan dos verdades que se contradicen, y una propuesta sin acordar termina decidiendo cosas del prototipo. Además, cuando Juanpi y Franz decidan, hace falta saber en qué lugar se registra.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No hacer nada: cada cambio escribe la propuesta como le parezca | Cero trabajo extra | Textos que dicen "decidido" sin estarlo; FARO puede terminar usado como membresía en algún helper; nadie sabe dónde cambiar una decisión |
| **B · Un solo módulo con versión (`lib/bien-comun/modelo.ts`) con un dato de estado por decisión; la propuesta es solo vitrina: ningún código deriva membresía, voto, rol ni prioridad de FARO, Token Tierra o Token Inversor** | Una sola fuente; cambiar una decisión es cambiar un objeto; ADR-023/025 siguen mandando sin ambigüedad | La página puede decir "FARO da voz" como propuesta mientras la plataforma no lo aplica: hay que decirlo en el texto para no confundir |
| C · Llevar ya FARO a la gobernanza simulada (voto ponderado por FARO en el Fogón) | Se ve la propuesta funcionando | Decide por el equipo la decisión 5 ("¿voz por FARO o por persona?"); contradice ADR-023/025; trabajo que se tira si cambia |

## Decisión
**B.** La plataforma muestra la propuesta, no la ejecuta. Reglas:
1. Todos los valores y el estado de cada decisión viven en `lib/bien-comun/modelo.ts`, con `VERSION_PROPUESTA` y fuente por valor (como ADR-010). Los valores que ya viven en `lib/lotes/modelo.ts` se importan, no se copian.
2. Una decisión pasa de `"abierta"` a `"decidida"` solo con fecha y quién decidió, y lo cambia un cambio OpenSpec aprobado por Gus. Ningún agente la marca decidida por su cuenta.
3. Ningún código (membresía, Fogón, Pactos, Semillas, permisos, lotes) lee FARO, Token Tierra ni Token Inversor para dar membresía, voto, nivel, rol o prioridad sobre un lote. La membresía del común sigue saliendo de la adhesión (ADR-025).
4. Los textos que dicen que FARO es "membresía" o da "voz" lo dicen como **propuesta**, y aclaran que hoy, en la plataforma, ser miembro del común sale de adherir al manifiesto.
5. Simulación y aprobación siguen separadas (ADR-030): el plan en cuotas usa `ventaSimulada`, nunca `aprobacionMunicipal`.

## Consecuencias
- Ganamos: una propuesta en borrador no rompe reglas ya escritas; cuando el equipo decida, se cambia un objeto y la página lo refleja sin tocar componentes.
- Aceptamos: la página describe cosas (voz por FARO, membresía que crece) que la plataforma no hace, y lo tiene que decir.
- Aceptamos: el estado de las decisiones es una constante en el código, no un registro con acta. Sirve para el prototipo; no para la gobernanza real.
- Revisar cuando: se decida la decisión 5 (voz) o la 6 (nombre del token); cuando FARO tenga que tener efectos reales (ahí reemplaza a este ADR y toca ADR-023/025); cuando las decisiones se tomen en el Fogón (el estado tiene que salir de la base, con su acta, como dice ADR-010); y antes de mostrar la plataforma afuera (R14).

## En palabras simples
La página del bien común va a mostrar la idea nueva de Gus, pero como lo que es: una propuesta que todavía hay que charlar. Es como una maqueta en la vidriera: se puede mirar y mover algunos números, pero no se vive adentro. Por eso tener FARO, en la plataforma, no te hace miembro ni te da más voto: para ser parte del común se sigue adhiriendo al manifiesto. Cuando Juanpi y Franz decidan algo, se cambia en un solo lugar y la página lo muestra con fecha y quién decidió.

## Fuentes
- `openspec/changes/bien-comun-propuesta/` (proposal, design §1 y §5, spec), leídos el 2026-11-23.
- `NS_Tokenomics`, "34 - Propuesta para Juanpi y Franz (FARO, Token Tierra y Token Inversor).md", §3 (carril B, política, puentes) y §7, leído el 2026-11-23.
- ADR-010, ADR-023, ADR-025, ADR-030.
