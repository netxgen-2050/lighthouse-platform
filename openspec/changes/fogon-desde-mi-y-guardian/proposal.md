# Proposal

## Why

En la revisión del 1-nov de `fogon-portada-holarquia`, Gus pidió tres cosas que no son de la portada y que prefirió en un cambio aparte para que los PRs sean más chicos: ver "Tus propuestas" ordenadas por lo que necesita tu acción en la lente Desde mí; que el Pase Fundador deje de prometer un "voto en el Fideicomiso" que ya no existe (diseño legal B) y pase a dar influencia en el Fondo Común; y que el Guardián **defienda la Voz de la Tierra y "dé batalla"** sin pausar ni decidir nada. Para eso último eligió la variante (b): su desafío aparece destacado y alguien del ámbito tiene que responderlo por escrito antes del llamado al consenso.

## What Changes

- **Dependencia:** se apila sobre `fogon-portada-holarquia` (ranura `adyacente` de la holarquía, `tarjeta-decision.tsx`, `useFogon()`, sin ámbito fideicomiso). La implementación parte de `dev` **con `fogon-portada-holarquia` integrado**; si no está, frenar y reportar.
- **El Guardián defiende la Voz de la Tierra** (Gus, 1-nov): su etiqueta y su ⚖ `guardianIA` (borrador) lo presentan como el agente (IA, simulado) que habla por el agua, el suelo y la vida nativa, que desafía lo que pueda dañarlos y que **nunca pausa ni decide**. Ningún texto de Hifa ni del Guardián dice que un agente pausa, frena, bloquea o decide.
- **Desafío del Guardián, variante (b)** (Gus, 1-nov):
  - Cada sugerencia del Guardián que ya apareció es un **desafío** que se ve **destacado arriba de la propuesta** ("El Guardián desafía esta propuesta"), con el principio o la decisión que cita, sus respaldos y sus respuestas.
  - **Cualquier persona del ámbito** (no solo quien presenta; también quien facilita) puede **responderlo por escrito**. La respuesta es un registro de solo agregar en el navegador, con nombre, como los demás.
  - Antes de pasar al **llamado al consenso** (recorrido importante) o al **período de objeción** (recorrido simple), cada desafío que ya apareció tiene que tener al menos una respuesta. Sin respuesta, "Pasar de fase" no está disponible y dice en texto "Falta responder el desafío del Guardián".
  - El grupo ve el desafío y las respuestas juntos; cualquiera que pueda levantar concerns lo puede **respaldar como concern propio** (como hoy).
  - **No pausa nada**: los plazos siguen corriendo, todas las demás acciones siguen abiertas y la responsabilidad de avanzar es de las personas.
- **"Tus propuestas" en la lente Desde mí** (Gus, 1-nov): con esa lente, la sección adyacente de `/fogon` pasa a ser "Tus propuestas": las decisiones donde la persona participa (sus círculos y tribus, el común si adhirió y donde se declaró afectada), en cualquier holón, ordenadas por lo que necesita su acción: firmar el acuse, responder (un concern suyo con resolución en juego o un desafío del Guardián sin respuesta que puede responder), sugerir o votar, y al final las que solo sigue.
- **Pase Fundador: influencia en el Fondo Común** (Gus, 1-nov): la puerta `voto-fideicomiso` pasa a `influencia-fondo-comun` con la etiqueta "Influencia en el Fondo Común (próximamente: conviction voting)" en Pasaporte, Sumarte y la tabla de puertas, y su ⚖ se reescribe (borrador). El conviction voting **no** se construye.
- Textos por los diccionarios es/en (ADR-004). Accesible con teclado y con la auditoría de axe en verde.
- **Dos noches**, con un corte (ver tasks): 1) Guardián: textos, desafío, respuesta y paso de fase; 2) "Tus propuestas" y Pase Fundador.

**Fuera de alcance:**
- El conviction voting del Fondo Común y cualquier cámara o voto del Pase Fundador: solo cambian la etiqueta, el id de la puerta y el ⚖.
- Un veto suspensivo de la Voz de la Tierra: el diseño legal B lo tiene (asiento humano del órgano legal) y la plataforma no lo da a ningún agente (diferencia anotada para revisar con NS_Tokenomics).
- Datos de monitoreo reales (agua, suelo) que sostengan el desafío: el Guardián sigue guionado y simulado.
- Que el Guardián genere desafíos nuevos con IA real, o que cambie su guion según la discusión.
- Que el desafío pida respuesta antes del cierre cuando aparece dentro del período de objeción (recorrido simple): se ve destacado y se puede responder, pero no traba nada.
- Editar o borrar una respuesta (los registros son de solo agregar) o responder sin nombre.
- Cambiar el registro de lentes, el panel Desde mí o la lista adyacente "Propuestas en {holón}" de las otras lentes.
- Base de datos, pedidos de red o firmas reales: todo sigue en el navegador.
- Actualizar la spec de `pase-fundador-gobernanza` (queda desactualizada; ver design §4).

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `fogon`: con la lente Desde mí, la sección adyacente muestra "Tus propuestas" ordenadas por lo que necesita la acción de la persona.
- `fogon-propuestas`: el Guardián se presenta como defensor de la Voz de la Tierra; sus sugerencias son desafíos destacados que alguien del ámbito responde por escrito antes del llamado al consenso o del período de objeción, sin que ningún agente pause ni decida.

## Impact

- Se toca: `lib/fogon/propuestas/tipos.ts` (registro `respuesta-desafio`, acción `responder-desafio`), `permisos.ts` (celdas), `fases.ts` (acción ofrecida y paso de fase), `estado.ts` (respuestas en la vista del desafío), `ejemplos.ts` (una respuesta de ejemplo y textos del Guardián), `app/fogon/propuestas/[id]/propuesta-cliente.tsx` y sus componentes (desafíos destacados, formulario de respuesta, motivo en "Pasar de fase"), `lib/fogon/propuestas/mias.ts` (nuevo, puro), la sección adyacente de `/fogon`, `lib/permisos/tipos.ts`, `tabla.ts`, `niveles.ts`, `lib/canales/puertas.ts`, `app/sumarte/sumarte-cliente.tsx`, `lib/legal/terminos.ts` (`guardianIA`, `influenciafondocomun`), diccionarios `fogon`, `fogon-propuestas`, `pasaporte` y `sumarte`, e2e `fogon.spec.ts`, `fogon-propuestas.spec.ts`, `accesibilidad.spec.ts` y los de Pase y Sumarte que nombren el voto en el Fideicomiso.
- Sin dependencias nuevas, sin tablas, sin pedidos de red, sin integraciones externas.
- Toca **permisos** (quién responde el desafío, quién puede pasar de fase, la puerta del Pase) y datos guardados en el navegador (un tipo de registro nuevo): pide revisión del agente `arquitecto`.
