# ADR-027 · Las decisiones del Fogón no se votan: no hay modelo de voto por decisión, ni en el navegador ni en la base; su estado se deriva del proceso de consenso, y votar queda solo para las consultas, que no deciden

- **Estado:** Propuesta
- **Fecha:** 2026-11-02
- **Cambio OpenSpec relacionado:** `fogon-consenso-en-tarjetas` (decisión de Gus del 2-nov). Revisa dos reglas de ADR-026 y se apoya en ADR-007 (votos de las consultas), ADR-015 (ocultar no es proteger), ADR-022 (nivel por propuesta) y ADR-023 (adhesión).

## Contexto
El Fogón tiene dos formas de decidir que se contradicen: cada tarjeta ofrece "Votar" con un conteo, y su propuesta sigue un proceso de consenso donde no se vota. ADR-026, escrito un día antes, va más lejos: dice que lo que la persona elige en una decisión de un órgano legal se guarda como recomendación y que, en la base, esas recomendaciones se guardan "como votos del Fogón con su `destino`". Si eso llega a la base, sacarlo después implica interpretar registros que no se editan. Hoy todo vive en el navegador y es simulado, así que cambiarlo es barato.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No hacer nada todavía: la tarjeta sigue con votos | Cero trabajo | La tarjeta y la propuesta siguen diciendo cosas distintas; el equipo aprende un Fogón que no es |
| B · Sacar el voto solo de la pantalla y dejar el modelo (`votos`, opciones, `votar`) para las recomendaciones | Cambio más chico; la recomendación queda lista | Queda código sin uso que invita a volver a mostrarlo; la spec de la base seguiría pensando en votos por decisión |
| **C · Sacar el voto del modelo: la decisión muestra el estado del consenso, que se deriva de sus registros; votar existe solo en las consultas** | Una sola forma de decidir, en la pantalla y en el dato; la base nace sin tabla de votos por decisión | El presupuesto del Fondo Común dice que "el Fogón le lleva la recomendación" y hoy no hay cómo armarla, hasta que tenga propuesta |

## Decisión
**C.** Es lo que pidió Gus y es la versión más chica que no deja una segunda forma de decidir escondida en el modelo.

Reglas:
- **Ninguna decisión del Fogón tiene votos**, ni en sus datos, ni en lo guardado en el navegador, ni en una tabla futura. Un mecanismo de votación solo aparece si una persona o Hifa lo sugiere en una propuesta, con la nota de que no reemplaza al consenso.
- **Votar queda en las consultas para priorizar o repartir** (ADR-007), que orientan y no deciden. Las reglas de ADR-007 y ADR-023 sobre esos votos no cambian. Donde ADR-023 nombra "votar" en una decisión del Fogón, ya no aplica; sigue valiendo para repartir créditos y llevar al consejo.
- **Reemplaza dos reglas de ADR-026:** "lo que la persona elige se guarda como recomendación" y "las recomendaciones se guardan como votos del Fogón con su `destino`". La recomendación a un órgano legal saldrá del resultado de una propuesta; cómo se arma se decide cuando el presupuesto tenga propuesta. Del resto de ADR-026 sigue todo: `destino` en el dato, ningún voto de órganos legales en la plataforma y ningún agente decide.
- **El estado del consenso no se guarda: se deriva**, con la misma función que usa la página de la propuesta. Una tarjeta nunca tiene su propio conteo.
- **En la base:** el servidor arma el resumen con el nivel que calcula él (ADR-022) y al navegador llegan solo las cantidades que ese nivel puede ver, porque lo que se oculta en el navegador no está protegido (ADR-015).
- **Conviction voting (backlog D38) no está decidido por este ADR.** Antes de construirlo necesita su propio ADR, que responda dónde vive (no en una decisión del Fogón), quién pesa cuánto y si el Pase Fundador da peso.

## Consecuencias
- Ganamos: una sola forma de decidir, y una tarjeta que dice lo mismo que su propuesta.
- Aceptamos: se pierden los votos simulados guardados en el navegador, sin aviso. Eran de ejemplo.
- Aceptamos: hasta que el presupuesto del Fondo Común tenga propuesta, el Fogón no tiene cómo armarle una recomendación al Consejo de la Fundación.
- Aceptamos: una decisión sin propuesta de ejemplo dice "sin dato", y hoy son varias.
- Volver atrás hoy es revertir un PR. Deja de ser barato cuando las propuestas o los votos pasen a la base.
- **Revisar:** al pasar las propuestas a la base, al diseñar conviction voting, cuando el estatuto de la Fundación defina cómo recibe recomendaciones, o si en las pruebas el equipo pide de nuevo una forma rápida de opinar sobre una decisión.

## En palabras simples
En el Fogón, una decisión ya no se gana por cantidad de votos: se acuerda conversando, levantando objeciones y firmando. Por eso la tarjeta de la bomba solar ya no tiene el botón "Votar", sino cómo va el acuerdo: en qué etapa está, cuántas objeciones siguen abiertas, cuántas personas firmaron y cuántas faltan. Votar sigue existiendo para otra cosa: las consultas, donde el grupo reparte créditos para mostrar qué le importa más, y quien decide lo tiene en cuenta. Y lo que el Fogón le lleve a la Fundación va a salir de una propuesta conversada, no de un conteo.

## Fuentes
- `openspec/changes/fogon-consenso-en-tarjetas/` (proposal, design §2, §4 y §5; pedido de Gus del 2-nov).
- ADR-007, ADR-015, ADR-022, ADR-023, ADR-026; `lib/fogon/estado.ts`, `lib/fogon/propuestas/estado.ts` (leídos el 2026-11-02).
- `NS_platform/Documentation/Desarrollo/08 - Backlog de producto.md`, D38.
