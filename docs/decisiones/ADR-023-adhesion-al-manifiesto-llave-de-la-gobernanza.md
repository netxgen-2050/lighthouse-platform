# ADR-023 · La adhesión al manifiesto de Lighthouse VRN es la llave de toda la gobernanza: una sola regla pura; en el prototipo la lee el navegador y, cuando un voto se guarde en la base, la verifica el servidor con la adhesión guardada allá

- **Estado:** Propuesta
- **Fecha:** 2026-10-29
- **Cambio OpenSpec relacionado:** `manifiesto-lighthouse-vrn`. Se apoya en ADR-007 (padrón por consulta), ADR-015 (lo que se oculta en el navegador no está protegido) y ADR-022 (en la base el nivel lo calcula el servidor, rama `spec/fogon-propuestas`).

## Contexto
Gus decidió (29-oct-2026) que nadie participa en la gobernanza sin adherir al manifiesto de Lighthouse VRN. Hoy la adhesión vive solo en el navegador (`lib/membresia/estado.ts`) y los votos también, así que una regla de pantalla alcanza. Pero `fogon-cuadratico-en-la-base` ya diseñó guardar los repartos de las consultas en un libro de solo agregar, con chequeos en el servidor (sesión → consentimiento → padrón) que no saben nada de la adhesión. Si la regla queda solo en la pantalla, el día que el voto pase a la base el requisito se vuelve un adorno, y un voto guardado no se borra.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No hacer nada todavía: cada pantalla oculta los botones a su manera | Cero diseño | La regla queda desparramada; al pasar a la base nadie se acuerda de exigirla en el servidor |
| **B · Una regla pura (`puedeParticiparEnGobernanza(membresias)`) que no lee el navegador; la pantalla le pasa lo que leyó. Ningún cambio que guarde una acción de gobernanza en la base se aprueba sin guardar antes la adhesión en la base y verificarla en el servidor** | Una noche; la misma función sirve hoy en la pantalla y mañana en el servidor; deja escrito el requisito para `fogon-cuadratico-en-la-base` y `fogon-propuestas` | El requisito agrega trabajo a esos cambios (una tabla de adhesiones con versión) |
| C · Guardar la adhesión en la base ya | Lo que se exige es lo que se protege | No hay votos en la base todavía; es más de una noche y el texto del manifiesto es un borrador que va a cambiar |

## Decisión
**B.** Es la versión más chica que no cierra la puerta: hoy alcanza con la pantalla porque el voto también vive en el navegador, y la regla queda lista para usarse en el servidor.

Reglas:
- `lib/gobernanza/participar.ts` no importa nada del navegador (`window`, `localStorage`, `leerMembresiaDelNavegador`): recibe las membresías como dato.
- Toda acción de gobernanza se frena también en la función que la ejecuta (votar, llevar al consejo, guardar un reparto), no solo ocultando el botón.
- **Cuando una acción de gobernanza se guarde en la base** (la primera es `POST /api/fogon/consultas/[slug]/reparto` de `fogon-cuadratico-en-la-base`), ese cambio tiene que: guardar la adhesión en la base como libro de solo agregar (persona, manifiesto, **versión del manifiesto**, fecha), sumar el chequeo "adhirió" al orden de chequeos del servidor (sesión → consentimiento → **adhesión** → padrón) con su código de error, y no aceptar nunca la adhesión desde el pedido. La adhesión del navegador no se migra: cada persona vuelve a adherir.

## Consecuencias
- Ganamos: una sola regla con tests; el requisito de Gus no se pierde cuando el Fogón pase a la base.
- Aceptamos: en el prototipo la adhesión es una casilla del navegador; cualquiera puede escribirla a mano y "pedido" ya cuenta (la aprobación del común sigue simulada, B6). Sin efecto sobre nadie, porque los votos tampoco salen del navegador.
- Decidido por Gus al implementar (29-oct-2026): **la adhesión guarda la versión del manifiesto** (`lh-adhesion-version`, junto a la membresía) y, si el manifiesto cambia de versión, hay que volver a adherir para seguir participando. La regla recibe esa versión como dato (`puedeParticiparEnGobernanza(membresias, versiones)`). Quien adhirió antes de que se guardara la versión (por ejemplo al "Pacto de convivencia") también vuelve a adherir. La adhesión vale desde que la persona adhiere: "pedido" cuenta, sin esperar la aceptación simulada del común. Esto reemplaza el "Aceptamos" anterior sobre quien quedaba adherida sin haber leído el manifiesto nuevo.
- Revisar cuando: se apruebe `fogon-cuadratico-en-la-base` o `fogon-propuestas` pase a la base; o el manifiesto tenga su primera versión ratificada (ahí hace falta saber a qué versión adhirió cada quien).

## En palabras simples
Para votar en el Fogón o repartir créditos en una consulta, primero hay que adherir al manifiesto. Hoy eso se controla en la pantalla, y está bien porque los votos son de juguete y viven en tu navegador. El día que los votos de verdad se guarden en la base, el servidor también va a tener que preguntar "¿esta persona adhirió, y a qué versión?", con la adhesión guardada allá. Si no, alguien podría saltear la pantalla y votar igual, y ese voto ya no se borra.

## Fuentes
- `openspec/changes/manifiesto-lighthouse-vrn/` (proposal, design §7, spec `gobernanza-adhesion`).
- `openspec/changes/fogon-cuadratico-en-la-base/design.md` (rutas y orden de chequeos).
- `lib/membresia/estado.ts`, `lib/fogon/estado.ts` (`motivoSinVoto`), `lib/fogon/consultas/repositorio.ts` (leídos el 2026-10-29).
- ADR-007, ADR-015; ADR-022 en la rama `spec/fogon-propuestas`.
