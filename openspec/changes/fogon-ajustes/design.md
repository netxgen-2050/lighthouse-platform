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

### 2. "sin dato" hasta que la persona empieza a repartir; "USD 0" después
- Regla de Gus (23-oct-2026): "un voto sin dato implica que la votación no ha empezado".
- En `repartoEnPlata` (no en el motor), en este orden:
  1. si `montoCentavos` es `null`: todas las opciones `null` ("sin dato");
  2. si la persona no empezó (ninguna opción con un voto distinto de 0; `{}` o todo en 0): todas `null` ("sin dato");
  3. si no: el resultado del motor con cada `null` reemplazado por `0`. Así, con votos a favor las opciones sin votos dan `0` (como hoy), y con **solo votos en contra** (el motor no tiene pesos positivos y devuelve `null` en todas) también dan `0`, porque la persona ya empezó.
- "Empezó" se mira sobre el reparto actual, no sobre el historial: si la persona quita todos sus votos, `mover` borra los ceros y el reparto vuelve a `{}`, o sea "sin dato". No se guarda un estado aparte.
- El motor no cambia porque su `null` sin votos lo usa también el resultado del grupo, que sigue diciendo "sin dato".
- La pantalla ya muestra "Con tu reparto irían USD 0" para un `0` y "Con tu reparto irían: sin dato" para un `null`; no cambia.
- Hoy ninguna consulta de ejemplo admite votos en contra, así que el caso 3 con solo votos en contra se fija en el test unitario, no en el e2e.

### 3. Donut
- Sin cambio de código: `components/donut.tsx` ya filtra `a.pct >= 5` para el número del arco. Se suma un test que fija el umbral.

## Risks / Trade-offs

- [Con solo votos en contra, "USD 0" en cada opción podría leerse como "no se reparte nada"] → es lo que pasaría con ese reparto: ninguna opción tiene votos a favor. Pasa solo en consultas que admiten votos en contra (hoy ninguna de ejemplo).
- [Quitar el último voto vuelve todo a "sin dato" y no a "USD 0"] → coherente con la regla: un reparto vacío es una votación que no empezó, y el medidor vuelve a "Te quedan 100 de 100 créditos".
