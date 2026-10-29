# ADR-022 · Lo que cada persona puede hacer dentro de una propuesta sale de una matriz de datos por nivel de implicación, separada de las puertas de la plataforma; en el prototipo el nivel se simula y en la base lo calcula el servidor

- **Estado:** Propuesta
- **Fecha:** 2026-10-28
- **Cambio OpenSpec relacionado:** `fogon-propuestas` (reemplaza a `fogon-consenso-formal`). Se apoya en ADR-001 (libros de solo agregar), ADR-012 (forma de EAS), ADR-015 (datos protegidos en el servidor) y ADR-018 (constancias en el navegador).

## Contexto
El boceto de gobernanza fractal aprobado el 27-oct-2026 dice que lo que una persona puede hacer en una propuesta (preguntar, levantar un concern, bloquear, decidir si un bloqueo es legítimo…) depende de **cuánto la implica esa decisión** (visita, red, del común, del ámbito, afectada, rol de proceso, quien presenta), no de un cargo fijo en la plataforma. La plataforma ya tiene `lib/permisos/` para otra cosa: qué páginas abre cada persona según su plan o rol. Hay que decidir dónde viven estas reglas nuevas y quién define el nivel, porque cuando haya votos y bloqueos reales cambiar el modelo obliga a reinterpretar registros que no se editan.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No hacer nada todavía: reglas `if` en cada componente | Cero diseño | No se pueden cambiar sin tocar pantallas ni testear celda por celda; los valores A–F de Gus quedan desparramados |
| B · Sumar las acciones de la propuesta a `lib/permisos/` (las puertas de la plataforma) | Un solo lugar para "permisos" | Mezcla dos preguntas distintas (¿entrás a la página? / ¿podés bloquear esta decisión?); un rol de plataforma como "admin" empezaría a pesar en una deliberación |
| **C · Matriz propia (`lib/fogon/propuestas/permisos.ts`): 15 acciones × 7 niveles como datos tipados, más acciones por fase y las restricciones de quien presenta; el nivel se calcula por propuesta** | Cambiar una regla es cambiar un dato con su test; la pantalla solo pregunta `accionesDisponibles`; ningún cargo de la plataforma da poder en una decisión | Dos sistemas de "permisos" que hay que no confundir (se aclara en los dos archivos y con un test de que no se importan entre sí) |

## Decisión
**C.** Son dos preguntas distintas y la segunda (quién puede qué en una decisión) es justamente lo que Gus quiere poder ajustar sin reescribir pantallas.

Reglas:
- **El nivel es por persona y por propuesta**, y una persona puede tener varios (unión de permisos), salvo las restricciones de quien presenta, que siempre ganan (nadie decide sobre la legitimidad de los concerns de su propio pedido).
- **Prototipo:** el nivel inicial sale de lo que sabe el navegador (membresía de la tribu del holón que decide) y el resto se **simula** con un selector rotulado como simulación. Cada registro guarda el nivel simulado con que se hizo.
- **En la base:** el nivel lo **calcula el servidor** a partir de la membresía, el rol de proceso asignado en ese holón y la declaración de afectada vigente. Nunca se acepta del pedido, y el selector desaparece. Ser de la tribu que pide **no** da el nivel "del ámbito" en el consejo: ahí deciden los representantes.
- **Ningún rol de la plataforma** (super admin, líder de tribu) da por sí solo un nivel dentro de una propuesta. Única excepción, transitoria: definir quién es del ámbito en las propuestas del consejo mientras no haya representantes elegidos (ADR-023).
- **Concern sin nombre:** cuando haya base, la autoría va en un registro aparte que solo ve la facilitación; el registro público no la lleva.

## Consecuencias
- Ganamos: los valores A–F se cambian en un archivo, con un test por celda; la misma matriz alimenta la tabla "Quién puede hacer qué" que ve la gente, así lo que dice la pantalla y lo que hace el código no pueden separarse.
- Aceptamos: en el prototipo cualquiera puede elegir "rol de proceso" y cerrar una propuesta de ejemplo. Es una simulación en su propio navegador, sin efecto sobre nadie.
- Aceptamos: los registros del prototipo guardan un nivel elegido por la persona; no sirven como antecedente real y no se migran a la base.
- Riesgo: que alguien lea `lib/permisos/` y `lib/fogon/propuestas/permisos.ts` como lo mismo. Mitigación: comentario en los dos y test de que no se importan.
- **Revisar:** al pasar las propuestas a la base, al elegir representantes reales del consejo, o si Gus cambia la lista de niveles (A3).

## En palabras simples
En una propuesta del Fogón no manda el cargo: manda cuánto te toca la decisión. Si alguien de la red vive al lado de donde va la cisterna, puede declararse afectada y levantar un concern aunque no sea de la tribu; si Lautaro es quien pide la plata, puede editar su propuesta pero no decidir si el bloqueo de otra persona vale. Esas reglas están escritas en una sola tabla, la misma que la gente ve en la página. Hoy cada quien puede "mirar como" cualquier nivel para probar; cuando sea real, el nivel lo va a decidir el servidor y no la persona.

## Fuentes
- `NS_platform/Documentation/mockup/gobernanza-fractal-boceto.html` (copia en `docs/referencia/gobernanza-fractal-boceto.html`): `NIVELES`, `ACCIONES`, `FASES`.
- `openspec/changes/fogon-propuestas/` (design §1 a §4).
- ADR-001, ADR-012, ADR-015, ADR-018; `lib/permisos/README.md`.
