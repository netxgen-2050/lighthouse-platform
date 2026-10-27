# ADR-018 · Un pacto queda acordado cuando las dos partes lo afirman con constancias de la forma de EAS; en el prototipo viven en un registro compartido del navegador

- **Estado:** Propuesta
- **Fecha:** 2026-10-27
- **Cambio OpenSpec relacionado:** `pactos-dos-partes` (y después `pactos-pedir-cambios`). Amplía ADR-012, que dejó "la aceptación de los pactos por las dos partes" fuera.

## Contexto
Hoy la misma persona que propone un pacto aprieta "Simular: la comunidad acepta". La consultoría web3 del 23-oct (punto 3), la nota 16 §2.2 de `NS_platform` y la regla J11 de `NS_Tokenomics` 29 ("nadie se valida a sí mismo") piden que lo acepte la otra parte y que quede constancia. Además, las constancias base de Semillas de ADR-012 llevan "la versión del pacto": esa versión tiene que salir de un acuerdo verificable. Hay que decidir qué forma tiene el acuerdo y dónde vive mientras no hay base para pactos.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No hacer nada todavía: esperar la base (P9 `aprobaciones-pactos`) | Cero trabajo ahora; la verificación será del servidor desde el día 1 | No se puede mostrar el flujo al equipo; el botón simulado sigue enseñando algo que no es |
| B · Estado "aceptado" dentro del pacto de la persona, escrito por quien lidera en la clave de esa persona | Muy poco código | Una persona escribe en los datos de otra; no queda quién aceptó ni cuándo; pasar a EAS obliga a rehacerlo |
| **C · Constancias de solo agregar con forma de EAS (propone, acepta, no acepta, revoca) en un registro compartido del navegador; cada persona concilia su pacto al leer** | Misma forma que tendrá en la base (ADR-012 etapa 1) y que la gobernanza ya usa; queda quién afirmó, por quién, sobre qué versión y cuándo; retirar es revocar | Lo de una persona lo puede leer otra en ese navegador; la verificación de quién responde es del navegador; solo funciona en un mismo navegador |

## Decisión
**C.** Un pacto (o un cambio) está **acordado** cuando existe una propuesta de una parte y una aceptación no revocada de la otra: la persona propone con `afirma = persona:<id>`; la tribu acepta con `afirma = tribu:<id>` y `por = <id de quien lidera>`. Para el Lighthouse responde el super admin (`afirma = comunidad:lighthouse`). Nadie acepta un pacto propio. Cada constancia lleva la versión del pacto, a qué propuesta apunta, cuándo y si es revocable; nada se edita.

Reglas:
- **La aceptación la afirma la tribu, no la persona que lidera.** `por` dice quién apretó el botón, para auditoría, pero la parte es la tribu (coherente con ADR-012: nunca la billetera personal de un admin como firmante de algo de la comunidad).
- **Solo se comparte lo enviado.** El borrador nunca sale de los datos de la persona.
- **Sin datos personales hacia afuera.** Antes de firmar o publicar (etapas 2 y 3 de ADR-012), `datos` se reemplaza por un hash del contenido.
- **Vale lo que la otra parte vio.** El pacto acordado toma su contenido de la constancia aceptada, no de lo que la persona tenga guardado.
- **Borrar es anonimizar.** Si una persona borra sus datos, se quitan las constancias sobre su pacto y, en las que respondió por su tribu, su id se reemplaza por "persona borrada" (ADR-001, ADR-005).
- **En la base** (P9) el registro compartido pasa a ser una tabla de solo agregar y el servidor verifica quién responde y sobre qué tribu. Las pantallas no cambian: solo cambia `lib/pactos/registro-compartido.ts`.

## Consecuencias
- Ganamos: el flujo de dos partes se puede mostrar ya, con la misma forma de datos que tendrá en la base y en EAS. La constancia base de Semillas podrá apuntar a la aceptación de la versión del pacto.
- Ganamos: la regla J11 queda escrita en código desde el primer día (nadie se acepta a sí mismo).
- Aceptamos: en el prototipo, cualquiera con las herramientas del navegador puede escribir una aceptación, y lo enviado por una persona lo ve otra que use el mismo navegador. Es un prototipo interno con personas de prueba.
- Aceptamos: no hay forma, en la pantalla, de revocar una aceptación ya hecha (dar de baja un pacto) hasta decidir qué pasa con las Semillas ya calculadas.
- **Revisar:** al pasar los pactos a la base (P9), al definir si un círculo puede responder por la tribu, y antes de la primera constancia firmada (ADR-011 / ADR-012 etapa 2).

## En palabras simples
Cuando Ana ofrece 10 horas por mes de jardinería a Valle Solar, queda anotado "Ana propone esto, versión 1". Cuando quien lidera Valle Solar lo acepta, queda otra anotación: "Valle Solar acepta la versión 1 de Ana; lo hizo Martín, tal día". El pacto vale cuando están las dos. Si Ana lo retira antes, se anota que lo retiró, pero no se borra lo anterior. Hoy esas anotaciones viven en el navegador; mañana en nuestra base y, si conviene, en un estándar público (EAS) sin rehacer nada.

## Fuentes
- `NS_platform`: "2026-10-23 - Consultoría web3 (filtrado plataforma)" punto 3; "16 - Personas, Acuerdos y Puntos" §2.2; "2026-10-27 - Lo que aprendimos de Collabberry"; "Desarrollo/08 - Backlog de producto" P8, P9 y P10.
- `NS_Tokenomics` 07 (A4, J-2) y 29 (J11, K11).
- ADR-005, ADR-011 y ADR-012 de este repo; `lib/gobernanza/registros.ts` (misma forma de registro).
