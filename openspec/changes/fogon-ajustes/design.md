# Design

## Context

Hoy la entrada `consultivo` del catálogo tiene un solo texto (`texto`), y se usa dos veces: `Acta` (`resultado-grupo.tsx`) lo pinta como frase visible y `TerminoLegal` lo muestra como explicación del ⚖. Por eso el tooltip repite la frase. En "Mi reparto", `repartoEnPlata` llama al motor, que devuelve `null` en todas las opciones cuando no hay ningún voto positivo, y la pantalla lo muestra como "sin dato".

## Decisions

### 1. La frase y la explicación, en la misma entrada del catálogo
- `consultivo` suma el campo `frase` (la frase aprobada, sin cambios) y su `texto` pasa a ser la explicación nueva. Los textos siguen en un solo catálogo (`lib/legal/terminos.ts`), como pide `CLAUDE.md`.
- `Acta` lee `TERMINOS.consultivo.frase`; `TerminoLegal` sigue leyendo `texto` sin cambios. La intro de `/fogon/consultas` ("El resultado es consultivo ⚖") no cambia: ahora su ⚖ también muestra la explicación nueva.
- **Alternativa descartada**: una clave aparte (`consultivofrase`). La descartamos porque una clave del catálogo es un término con ⚖, y la frase no lleva un ⚖ propio.
- Explicación (borrador, voseo):
  > "Consultivo quiere decir que el resultado orienta una decisión, pero no obliga a nadie a seguirlo. Muestra qué le importa más al grupo; la decisión la toma después quien tiene esa facultad según el contrato o el estatuto, y puede decidir otra cosa. Votar no te cuesta plata: los créditos no se compran ni se cobran, y la consulta no mueve fondos por sí sola."

### 2. "USD 0" con monto conocido
- En `repartoEnPlata` (no en el motor): si `montoCentavos` es `null`, todas las opciones son `null` ("sin dato"); si no, el resultado del motor con cada `null` reemplazado por `0`. El motor no cambia porque su `null` sin votos lo usa también el resultado del grupo, que sigue diciendo "sin dato".
- La pantalla ya muestra "Con tu reparto irían USD 0" para un `0` y "Con tu reparto irían: sin dato" para un `null`; no cambia.

### 3. Donut
- Sin cambio de código: `components/donut.tsx` ya filtra `a.pct >= 5` para el número del arco. Se suma un test que fija el umbral.

## Risks / Trade-offs

- [Con todo en 0, "USD 0" en cada opción podría leerse como "no se reparte nada"] → es lo que pasaría con ese reparto; Gus lo pidió así. El medidor ya dice "Te quedan 100 de 100 créditos".
