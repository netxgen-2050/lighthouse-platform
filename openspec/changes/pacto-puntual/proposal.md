# Proposal

## Why

Hoy el único pacto es de horas fijas por mes (`pactos-v2`). Gus mismo lo marcó en la llamada con Don Powa: alguien puede venir, arreglar la tranquera, dar un taller y irse, y eso no es un compromiso mensual (`NS_platform` Backlog **D20**; reunión 2026-10-23, #5). Además, con `tribu-necesidades` cada cosa que busca una tribu ya tiene su ficha de tarea y su holón, pero todavía no se puede **postularse para tomarla** (D18, #2).

El 28-oct Gus definió **quién toma tareas**: solo **miembros o aspirantes** del holón (la tribu o el círculo) pueden postularse. **La gobernanza del holón pre-admite la postulación** y, cuando la tarea está hecha, **verifica** que se completó; recién con esa verificación se otorgan las Semillas. Quien no es miembro **primero se postula como aspirante**. Y fijó el orden: **`pactos-dos-partes` va antes** y estos cambios se apilan encima.

Es el segundo de cuatro cambios (`tribu-necesidades` → **`pacto-puntual`** → `pacto-puntual-verificacion` → `pactos-horas-variables`). Este cubre de la postulación a la pre-admisión; la tarea hecha, la verificación y las Semillas van en `pacto-puntual-verificacion`, para que cada uno entre en una noche (lo había pedido la revisión de arquitectura).

## What Changes

- **Formatos por comunidad.** Cada comunidad dice qué formatos de pacto acepta (`lib/pactos/formatos.ts`, datos de ejemplo que Gus aprobó): todas aceptan el **fijo** de hoy; las tribus activas y en formación aceptan además el **puntual**, salvo Barda Productiva (para mostrar el caso); el Lighthouse, por ahora, solo el fijo.
- **Quién puede postularse.** Solo quien es **miembro** o **aspirante** del holón de la necesidad. En el prototipo los círculos no tienen integrantes propios, así que se toma la membresía de la tribu: **miembro** = membresía aceptada; **aspirante** = pidió sumarse adhiriendo al manifiesto y todavía no lo aceptaron (el estado "pedido" de hoy). Para un círculo transversal vale la membresía en cualquiera de las tribus que participan.
- **Postularme.** En la ficha de la tribu, cada necesidad **tomable** (abierta y, si es de diseño, con aval) de una tribu que acepta puntuales muestra **"Postularme para tomarla"**, que lleva a `/pactos?comunidad=<tribu>&necesidad=<id>`. Quien no es miembro ni aspirante ve **"Para postularte, primero sumate como aspirante a <tribu>"** con enlace al manifiesto. Si la tribu no acepta puntuales, se lee "<Tribu> por ahora no toma pactos puntuales".
- **Postulación en `/pactos`.** Nace como borrador a partir de la necesidad: la tarea, la habilidad como rol, las horas aproximadas y la fecha vienen de la ficha (lo que falta queda vacío, no en 0). La persona cuenta cómo la va a hacer y puede ajustar horas y fecha. Una persona tiene como mucho una postulación por necesidad. Las personas aspirantes ven en `/pactos` sus postulaciones aunque todavía no puedan armar un pacto de tiempo.
- **Pre-admisión por el holón, con las constancias de `pactos-dos-partes`.** Enviar la postulación es una constancia `pacto-propone` de tipo "puntual"; la responde, en `/pactos/responder`, **quien administra el holón**: quien lidera la tribu (por la tribu o por un círculo de esa tribu) o el super admin (por el común o por un círculo transversal). **Pre-admitir** es un `pacto-acepta` que afirma el holón; **no pre-admitir** pide motivo (`pacto-no-acepta`) y la postulación vuelve a borrador. Nadie responde su propia postulación. **Una tarea la pueden tomar varias personas** (decisión de Gus, 28-oct): el holón puede pre-admitir más de una postulación por necesidad; cada persona tiene la suya.
- **Sin simulación del lado de la persona.** Como en `pactos-dos-partes`, la persona ve "Esperando que <holón> responda" y puede retirarla; no hay botones "Simular…".
- **Quiénes la tomaron.** Con postulaciones pre-admitidas, la necesidad dice "La tomaron <N> personas" (o "1 persona") para todas las personas de ese navegador (el registro es compartido) y sigue ofreciendo postularse mientras esté abierta; para quien se postuló dice "Pre-admitida: la tomaste". El **máximo por persona** de la necesidad (`tribu-necesidades`) se muestra en la postulación y viaja en la propuesta, para que valga el que vio el holón.
- **Mi recorrido:** "Te postulaste para <tarea> en <tribu>", "<holón> pre-admitió tu postulación a <tarea>" y "<holón> no pre-admitió tu postulación a <tarea>".
- **⚖ "Pacto puntual"** (borrador, con criterio de la legislación argentina; ver design §9): es un acuerdo voluntario de colaboración para una sola tarea, sin horario impuesto, sin subordinación y sin pago en dinero; no es un contrato de trabajo.
- Textos es/en, con voseo.

**Fuera de alcance:**
- **Marcar la tarea hecha, la verificación del holón, la constancia base y las Semillas**: van en `pacto-puntual-verificacion`.
- **Ronda de reconocimiento y evaluación de pares**: un pacto puntual **no** las habilita, ni en este cambio ni después (decisión de Gus, 28-oct). Su validación es la verificación del holón.
- **Integrantes propios de cada círculo** y que responda quien facilita el círculo: en el prototipo los círculos no tienen personas reales; responde quien administra la tribu o el común (ver preguntas).
- **Que el holón acepte o rechace a un aspirante.** Ser aspirante es el pedido de adhesión que ya existe; aceptarlo sigue como hoy.
- **Pacto puntual libre**, sin partir de una necesidad publicada. La oferta libre sigue siendo el pacto fijo de hoy.
- Un cupo de personas por tarea (pregunta abierta); que el holón cierre la necesidad cuando ya no suma personas (el estado "tomada" sigue siendo de ejemplo); cancelar una postulación ya pre-admitida; horas que varían por mes (`pactos-horas-variables`), convocatorias de proveedores (D26), registro de cumplimiento (D31), reparto de caja (D23).
- Tribus abiertas, por invitación o cerradas, y el aval de la red (resto de D19).

## Capabilities

### New Capabilities
- `pacto-puntual`: formatos por comunidad, quién puede postularse (miembros y aspirantes del holón), postulación a una necesidad y pre-admisión por el holón con constancias de las dos partes.

### Modified Capabilities

(`pactos-acuerdo`, de `pactos-dos-partes`, todavía sin archivar: este cambio le suma la contraparte "holón" para los pactos puntuales; ver design §3.)

## Impact

`lib/pactos/formatos.ts` (nuevo), `lib/pactos/postulacion.ts` (nuevo, puro: quién puede postularse y quién responde), `lib/pactos/estado.ts` (lista de puntuales por comunidad, acciones, conciliación de puntuales, lectura), `lib/pactos/constancias.ts` (de `pactos-dos-partes`: `sobre` de puntual, contraparte holón, pre-admitidas por necesidad), `lib/pactos/registro-compartido.ts` (descarga y borrado también de `puntual:`), `app/pactos/pactos-cliente.tsx`, `app/pactos/responder/` (sección "Postulaciones a tareas"), `app/tribus/[id]/` (componente cliente "Postularme para tomarla" y estado de la necesidad), `lib/actividad/eventos.ts` (tres eventos), `lib/legal/terminos.ts` (`pactopuntual`, borrador), `lib/idioma/textos/` (pactos, tribus), tests de Vitest y e2e. Todo en el navegador: la postulación en la clave de pactos de la persona y las constancias en el registro compartido de `pactos-dos-partes`. Sin base, sin integraciones, sin pagos.
