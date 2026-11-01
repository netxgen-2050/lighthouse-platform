# ADR-025 · Ser miembro de Lighthouse VRN es haber adherido a su manifiesto: en el prototipo se escribe "miembro" al adherir; en la base no se guarda una membresía del común aparte, se calcula desde la adhesión vigente

- **Estado:** Propuesta
- **Fecha:** 2026-10-30
- **Cambio OpenSpec relacionado:** `fogon-portada-holarquia` (design §7). Se apoya en ADR-023 (adhesión, llave de la gobernanza), ADR-022 (niveles de implicación), ADR-012 (constancias EAS) y ADR-001 (libros de solo agregar).

## Contexto
Gus decidió (30-oct-2026) que adherir al manifiesto de Lighthouse VRN deja a la persona como miembro al instante, sin aceptación de nadie. Las tribus siguen con pedido y aceptación. Hasta hoy "miembro de `lighthouse`" significaba "la comunidad me aceptó" (simulado), y varias partes lo leen así: Pactos (`relacionConHolon`: miembro o aspirante en las necesidades del común), Semillas (`comunidadesDondeEsMiembro`), los sellos del pasaporte y el perfil. A partir de ahora la misma palabra pasa a querer decir "adherí yo". Más adelante (backlog D37) un aval de otras personas con constancias EAS podría volver a condicionarla. Si en la base la membresía del común y la adhesión se guardan por separado, se pueden contradecir: alguien con adhesión vieja seguiría como miembro, o alguien miembro sin haber adherido nunca.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No hacer nada todavía: escribir "miembro" al adherir y nada más | Cero diseño; es lo que pide la spec para el prototipo | Al pasar a la base nadie se acuerda de que ser miembro del común y adherir son lo mismo; aparecen dos tablas que se contradicen |
| **B · Prototipo como A; en la base, la membresía del común no es un dato propio: una función pura `membresiaDelComun(adhesion, avales)` la calcula desde la adhesión vigente (persona, versión del manifiesto, fecha) y, cuando exista D37, desde los avales** | Una sola fuente: la adhesión que ADR-023 ya pide guardar; el aval D37 entra cambiando una función, sin migrar datos | Pactos, Semillas y los sellos van a tener que llamar a la función en lugar de leer una columna |
| C · Guardar ya una tabla de membresías del común con su propio estado | Lo que se ve es lo que se guarda | No hay base para esto todavía; duplica la adhesión y obliga a sincronizar dos registros |

## Decisión
**B.** Es lo mismo que pide hoy la spec, más una regla para el día de la base: la membresía del común sale de la adhesión y nunca se guarda aparte ni se acepta desde el pedido.

Reglas:
- **Prototipo:** `reducir` escribe `"miembro"` al adherir a `lighthouse` y `leer` normaliza un `"pedido"` viejo de `lighthouse` a `"miembro"`. La costura D37 es un comentario en ese punto, sin tipos nuevos.
- **En la base:** no existe una fila de membresía para `lighthouse`. Ser miembro del común = tener una adhesión al manifiesto de Lighthouse VRN en el libro de adhesiones (ADR-023), con la versión vigente si la regla lo pide, y lo calcula el servidor.
- **Las tribus no cambian:** su membresía sigue siendo pedido + aceptación, con su propio registro.
- **Ningún rol se deriva de esto solo:** ser miembro del común no da el nivel "del ámbito" en una propuesta (ADR-022); en el común, toda persona con sesión arranca como "del común", sea miembro o no.

## Consecuencias
- Ganamos: una sola verdad sobre quién es del común; el aval D37 se suma cambiando una función.
- Aceptamos: en el prototipo, cualquiera que adhiera (o que escriba a mano en su navegador) aparece como miembro del Lighthouse en Pactos, Semillas y el pasaporte. Sin efecto real: todo vive en su navegador.
- Aceptamos (pregunta abierta para Gus): en el prototipo, con una adhesión a una versión vieja la persona sigue siendo "miembro" en Pactos y Semillas, aunque para votar tenga que volver a adherir. En la base, con la opción B, la decisión de Gus se resuelve dentro de la función.
- Revisar cuando: se diseñe D37 (aval con constancias), se guarde la adhesión en la base (primer voto en la base, ADR-023) o Pactos o Semillas pasen a la base.

## En palabras simples
Desde ahora, para ser parte de Lighthouse VRN alcanza con leer el manifiesto y adherir: nadie tiene que aceptarte. En las tribus sigue habiendo alguien que acepta. Para no tener dos listas que digan cosas distintas, el día que esto esté en la base "ser parte del común" no va a ser una lista aparte, sino una consecuencia de haber adherido. Si más adelante hace falta que otras personas te avalen, se cambia esa regla en un solo lugar.

## Fuentes
- `openspec/changes/fogon-portada-holarquia/` (proposal, design §7, spec `gobernanza-adhesion`).
- `openspec/changes/manifiesto-lighthouse-vrn/design.md` §7; `openspec/changes/fogon-propuestas/design.md` (`nivelInicial`).
- `lib/membresia/estado.ts`, `lib/pactos/postulacion.ts` (`relacionConHolon`), `app/semillas/semillas-cliente.tsx`, `lib/pasaporte/sellos.ts`, `app/perfil/perfil-cliente.tsx` (leídos el 2026-10-30).
- ADR-001, ADR-012, ADR-022, ADR-023.
