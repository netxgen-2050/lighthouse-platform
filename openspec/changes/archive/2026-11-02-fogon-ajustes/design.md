# Design

## Context

Estado de `dev` al 28-oct-2026:

- La entrada `consultivo` de `lib/legal/terminos.ts` tiene un solo texto (`texto`) y no tiene `en`. `Acta` (`app/fogon/consultas/[id]/resultado-grupo.tsx`) lo pinta con `terminoMostrado("consultivo", idioma).texto` (en inglés sale el español con `lang="es"`) y `TerminoLegal` muestra el mismo `texto` como explicación del ⚖. Por eso el ⚖ repite la frase. La intro de `/fogon/consultas` (`introAntes` en `lib/idioma/textos/fogon-consultas.ts`, "El resultado es consultivo" / "The result is advisory") lleva el mismo ⚖.
- En "Mi reparto", `repartoEnPlata(consulta, reparto)` (`lib/fogon/consultas/reparto.ts`) devuelve lo que da el motor: `null` en todas las opciones si no hay ningún peso positivo. `consulta-cliente.tsx` muestra `irianSinDato` para `null` y `irianConDato("USD 0")` para `0`; esos textos ya están en los dos idiomas.
- `components/donut.tsx` dibuja el número solo si `pct >= 5`, y `components/donut.test.tsx` ya lo prueba.
- La gobernanza (`app/fogon/gobernanza/**`) y `/fogon` no usan nada de esto.

## Decisions

### 1. Frase y explicación en la misma entrada del catálogo, con su inglés
- `consultivo` suma `frase` (la frase aprobada, sin cambios) y su `texto` pasa a ser la explicación. Suma `en: { titulo, texto, frase }`. Los textos siguen en un solo catálogo, como pide `CLAUDE.md`.
- `terminoEn` sigue devolviendo `{ titulo, texto }`; el campo `frase` de más no lo afecta.
- Función nueva en `lib/legal/mostrar-termino.ts`: `fraseConsultiva(idioma)` devuelve la frase en ese idioma (`TERMINOS.consultivo.frase` o `TERMINOS.consultivo.en.frase`). `Acta` la usa en lugar de `terminoMostrado(...).texto`; como la frase ya está en el idioma de la página, el `lang="es"` del `<span>` deja de hacer falta.
- `TerminoLegal` no cambia: sigue leyendo `texto` (o `en.texto`) por `terminoMostrado`, así que el ⚖ del acta y el de la intro de `/fogon/consultas` muestran la explicación. En inglés, `terminoMostrado` ya marca toda versión `en` como borrador ("Draft: text under review").
- La huella de la bitácora del ⚖ (`entradaBitacoraTermino`) cambia porque cambia el `texto`: es lo esperado (se mostró otro texto).
- **Alternativa descartada**: una clave aparte (`consultivofrase`). Una clave del catálogo es un término con ⚖, y la frase no lleva un ⚖ propio.
- **Alternativa descartada**: poner la frase en el diccionario del Fogón. Es un texto con peso legal: va en el catálogo.
- **Con `idioma-legal`** (pendiente, suma `en` a todas las claves): cuando se implemente, `consultivo` ya tiene `en` y se deja como está. Si `idioma-legal` llega primero, este cambio reemplaza su `en.texto` de `consultivo` por la explicación de abajo y le suma `frase`.
- Textos (borrador, voseo):
  - `texto`: "Consultivo quiere decir que el resultado orienta una decisión, pero no obliga a nadie a seguirlo. Muestra qué le importa más al grupo; la decisión la toma después quien tiene esa facultad según el contrato o el estatuto, y puede decidir otra cosa. Votar no te cuesta plata: los créditos no se compran ni se cobran, y la consulta no mueve fondos por sí sola."
  - `en.titulo`: "Advisory result"
  - `en.frase`: "The result is advisory: it does not replace the decisions reserved by the contract or the statute."
  - `en.texto`: "Advisory means the result guides a decision, but does not bind anyone to follow it. It shows what matters most to the group; the decision is then made by whoever holds that power under the contract or the statute, and they may decide something else. Voting costs you no money: credits are not bought or charged, and the consultation does not move funds by itself."

### 2. "sin dato" hasta que la persona empieza a repartir; "USD 0" después
- Regla de Gus (23-oct-2026): "un voto sin dato implica que la votación no ha empezado".
- En `repartoEnPlata` (no en el motor), después del corte que ya existe para consultas que no son de presupuesto, en este orden:
  1. si `montoCentavos` es `null`: todas las opciones `null` ("sin dato");
  2. si ninguna opción tiene un voto distinto de 0 (`{}` o todo en 0): todas `null` ("sin dato");
  3. si no: el resultado del motor con cada `null` reemplazado por `0`. Con votos a favor, las opciones sin votos ya dan `0` (como hoy); con **solo votos en contra** (el motor no tiene pesos positivos y devuelve `null` en todas) pasan a dar `0`, porque la persona ya empezó.
- "Empezó" se mira sobre el reparto actual: si la persona quita todos sus votos, `mover` borra los ceros y el reparto vuelve a `{}`, o sea "sin dato". No se guarda un estado aparte.
- El motor no cambia porque su `null` sin votos lo usa también el resultado del grupo, que sigue diciendo "sin dato".
- `consulta-cliente.tsx` y los textos (`irianConDato`, `irianSinDato`, en los dos idiomas) no cambian.
- Hoy ninguna consulta de ejemplo admite votos en contra, así que el caso de solo votos en contra se fija en el test unitario, no en el e2e.

### 3. Donut
- Sin cambio de código ni de tests: `components/donut.tsx` ya filtra `a.pct >= 5`, `donut.test.tsx` ya prueba que solo esas porciones llevan el número y que la leyenda muestra "3 · Retorno económico · 1 %". Solo se corrige la spec.

## Risks / Trade-offs

- [Con solo votos en contra, "USD 0" en cada opción podría leerse como "no se reparte nada"] → es lo que pasaría con ese reparto. Pasa solo en consultas que admiten votos en contra (hoy ninguna de ejemplo).
- [Quitar el último voto vuelve todo a "sin dato"] → coherente con la regla: un reparto vacío es una votación que no empezó.
- [El inglés legal lo redacta un agente] → borrador, como todo `en` del catálogo; lo revisa R14 / L10.
