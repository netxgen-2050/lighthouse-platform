# ADR-026 · El Fogón recomienda a los órganos legales y ningún agente pausa ni decide: lo que decide un órgano del diseño legal lleva su destino en el dato, la plataforma no registra votos de esos órganos, y la Voz de la Tierra con veto suspensivo queda fuera de la plataforma

- **Estado:** Propuesta. ADR-027 (también Propuesta) revisa dos reglas: que lo elegido se guarde como recomendación y que, en la base, las recomendaciones sean votos del Fogón.
- **Fecha:** 2026-11-01
- **Cambio OpenSpec relacionado:** `fogon-portada-holarquia` (design §1b y §8; decisiones de Gus del 1-nov) y `fogon-desde-mi-y-guardian` (design §1, §2, §4 y §5: el desafío del Guardián, variante b, y el Pase con influencia en el Fondo Común). Se apoya en ADR-023 (la adhesión es la llave de la gobernanza) y ADR-022 (permisos por nivel de implicación). Deja desactualizada la spec del cambio `pase-fundador-gobernanza` (a corregir antes de archivar).

## Contexto
El Fogón tenía un ámbito "fideicomiso" con una "Asamblea de beneficiarios" donde votaba quien tenía el Pase Fundador. En el diseño legal B (NS_Tokenomics, doc 25 §6) no existe ese órgano: el presupuesto del Fondo Común lo decide el directorio de la Fundación, cada serie tiene su asamblea de tenedores que vota por capital, y la Voz de la Tierra es un asiento con veto suspensivo que pausa lo que dañe agua, suelo o vida nativa ("it pauses, people decide"). La plataforma tiene que mostrar esas decisiones sin hacerse pasar por esos órganos, y el Guardián (IA) tiene que defender la Voz de la Tierra sin decidir.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · Mantener un ámbito por órgano legal (fideicomiso, series, Fundación) y votar en la plataforma | Se ve todo en un lugar | La plataforma simula votos que legalmente se dan en otro lado y con otro peso (por capital); confunde a quien vota |
| **B · El Fogón es consultivo: las decisiones de un órgano legal llevan `destino` y la plataforma registra recomendaciones, no votos de ese órgano; lo de las series no aparece** | Coincide con el diseño B; una sola marca en el dato; la tarjeta dice a quién va la recomendación | La recomendación no obliga a nadie; hay que explicarlo bien (⚖ borrador) |
| C · Sacar del Fogón todo lo que decide un órgano legal | Cero ambigüedad | El común pierde la forma de opinar sobre el presupuesto del Fondo Común |

Para el Guardián: (1) solo textos y ninguna capacidad de pausa; (2) darle una pausa automática como la Voz de la Tierra; (3) una obligación de respuesta humana ("dar batalla", a definir por Gus).

## Decisión
**B**, y para el Guardián **(3), variante (b)**, que Gus eligió el 1-nov (antes este ADR proponía (1) y dejaba (3) abierta): cada sugerencia del Guardián que ya apareció es un desafío que una persona del ámbito (o quien facilita, o quien presenta) tiene que responder por escrito antes de pasar al llamado al consenso o al período de objeción.

Reglas:
- `destino` es un dato de la decisión (hoy solo `"consejo-fundacion"`, unión abierta). Si está, lo que la persona elige se presenta y se guarda como **recomendación**, nunca como voto del órgano.
- La plataforma **no** registra votos de asambleas de series ni del directorio. Si algún día se muestra un resultado de esos órganos, se copia con su fuente y fecha (el dueño del dato es el órgano), nunca se calcula acá.
- **Ningún agente** (Hifa, el Guardián u otro) pausa, frena, bloquea ni decide. Toda pausa o freno es una acción de una persona con su nivel (ADR-022). El veto suspensivo de la Voz de la Tierra es de un asiento humano del órgano legal y vive fuera de la plataforma; si algún día se refleja, es como dato copiado del órgano, no como permiso de un agente.
- **Dónde termina "pedir respuesta" y empieza "pausar":** lo único que un agente puede provocar en el proceso es que se **pida una respuesta escrita de una persona** antes de un paso dado por una persona (hoy: pasar al llamado o a objetar). Un agente nunca cambia plazos, fases, resultados ni permisos, nunca suma un estado "pausada" y nunca impide otra acción. La regla la aplica el reductor (y mañana el servidor) sobre registros de personas: un paso de fase sin la respuesta se ignora, igual que un cierre fuera de fase. Si nadie responde y el plazo vence, rige el vencimiento de siempre: es la falta de una acción humana, no un veto del agente. Una regla nueva de un agente que no se pueda escribir así (pedir algo a una persona y nada más) necesita revisar este ADR.
- El Pase Fundador abre `influencia-fondo-comun` (conviction voting, no construido). En la base, ese peso lo calculará el servidor y quedará en un libro de solo agregar (ADR-001), igual que los votos (ADR-007).
- **En la base:** las recomendaciones se guardan como votos del Fogón con su `destino`, verificados en el servidor con la adhesión vigente (ADR-023). Cambiar una decisión de pregunta implica id nuevo: un voto nunca se reasigna a otra pregunta.

## Consecuencias
- Ganamos: lo que muestra la plataforma coincide con quién decide de verdad, y el Guardián no puede quedar como autoridad.
- Aceptamos: el Fogón no obliga al Consejo de la Fundación; la influencia del Pase es "próximamente" y por ahora no hace nada visible fuera de Pasaporte y Sumarte.
- Aceptamos una diferencia con el diseño B: en la plataforma nadie que no sea persona tiene veto; la Voz de la Tierra con veto existe solo en el órgano legal.
- **Revisar:** cuando el estatuto de la Fundación defina cómo recibe recomendaciones, cuando se diseñe el conviction voting, o si se quiere que un agente haga algo más que pedir una respuesta escrita (por ejemplo, que el desafío también trabe el cierre en el período de objeción).

## En palabras simples
En el Fogón el común opina y recomienda; las decisiones que la ley pone en manos de la Fundación o de los inversores de cada serie se toman en esos lugares. Por ejemplo, el presupuesto 2027 del Fondo Común aparece con la leyenda "Lo decide el Consejo de la Fundación; el Fogón le lleva la recomendación", y lo que elegís se guarda como tu recomendación. El Guardián, que habla por el agua y el suelo, puede desafiar una propuesta, pero nunca la pausa ni la decide: eso lo hacen siempre personas. Lo único que exige su desafío es que alguien del grupo le conteste por escrito antes de llamar al consenso.

## Fuentes
- `openspec/changes/fogon-portada-holarquia/design.md` §1b, §8.
- `openspec/changes/fogon-desde-mi-y-guardian/design.md` §1, §2, §4, §5.
- NS_Tokenomics, "25 - Legal design v0.1 (Land Foundation + Regeneration Trust Program)", §6 Governance.
- ADR-001, ADR-007, ADR-022, ADR-023; `openspec/changes/pase-fundador-gobernanza/`.
