# Proposal

## Why

Hoy el único pacto es de horas fijas por mes (`pactos-v2`). Gus mismo lo marcó en la llamada con Don Powa: alguien puede venir, arreglar la tranquera, dar un taller y irse, y eso no es un compromiso mensual (`NS_platform` Backlog **D20**; reunión 2026-10-23, #5). Además, con `tribu-necesidades` cada cosa que busca una tribu ya tiene su ficha de tarea, pero todavía no se puede **ofrecer tomarla** (D18, #2).

Este cambio une las dos cosas: tomar una necesidad abre un **pacto puntual**, de una sola tarea con fecha, y cuando la tribu confirma las horas hechas queda la **constancia base** de Semillas (decisión de Gus del 23-oct, D15; `NS_platform` nota 16 y "Lo que aprendimos de Collabberry").

Es el segundo de tres cambios: depende de `tribu-necesidades` y lo sigue `pactos-horas-variables`.

## What Changes

- **Formatos por comunidad.** Cada comunidad dice qué formatos de pacto acepta (`lib/pactos/formatos.ts`, datos de ejemplo): todas aceptan el **fijo** de hoy; las tribus activas y en formación aceptan además el **puntual**, salvo Barda Productiva (para mostrar el caso); el Lighthouse, por ahora, solo el fijo.
- **Ofrecer tomarla.** En la ficha de la tribu, cada necesidad **abierta** de una tribu que acepta pactos puntuales muestra **"Ofrecer tomarla"**, que lleva a `/pactos?comunidad=<tribu>&necesidad=<id>`. Si la tribu no acepta puntuales, se lee "<Tribu> por ahora no toma pactos puntuales".
- **Pacto puntual en `/pactos`.** Nace como borrador a partir de la necesidad: la tarea, la habilidad como rol, las horas aproximadas y la fecha vienen de la ficha (lo que falta queda vacío, no en 0). La persona cuenta cómo la va a hacer y puede ajustar horas y fecha. Una persona tiene como mucho un pacto puntual por necesidad, y puede tener varios en una misma tribu, además de su pacto fijo.
- **Pasos:** Borrador → Enviado a la tribu → **Aceptado** (la necesidad pasa a "Tomada por vos") → la persona **marca la tarea como hecha con las horas reales** → la tribu **confirma las horas** (la necesidad pasa a "Hecha por vos") y nace la constancia base. Retirar antes de la respuesta y descartar el borrador, como en el pacto fijo.
- **La respuesta de la tribu sigue simulada**, como hoy en `pactos-v2` ("Simular: <tribu> acepta", "Simular: <tribu> confirma tus horas", "Simular: <tribu> pide revisar las horas"). Las respuestas viven en dos acciones del reductor para que `pactos-dos-partes` las pase a quien lidera sin tocar la pantalla de la persona.
- **Constancia base de Semillas.** Al confirmarse las horas queda guardada, congelada, una constancia con la forma de ADR-012: tarea, horas confirmadas, valor de la hora de referencia, período, versión del pacto y Semillas (`round(horas × valor hora)`, una sola vez, no por mes). Nunca se recalcula ni se edita.
- **Semillas.** La tarjeta de cada comunidad suma una parte "Pactos puntuales" con el total de sus constancias (o "sin dato" si no hay) y lista cada constancia. El total la incluye.
- **Mi recorrido:** "Ofreciste tomar <tarea> en <tribu>", "<tribu> aceptó tu pacto puntual", "<tribu> confirmó tus horas de <tarea>".
- **⚖ "Pacto puntual"** (borrador): es un acuerdo de colaboración para una tarea, no un contrato de trabajo ni un pago.
- Textos es/en, con voseo.

**Fuera de alcance:**
- **Aceptación y confirmación reales por quien lidera la tribu**: van en `pactos-dos-partes` (spec propuesta, sin implementar). Este cambio lo deja preparado (ver design §6).
- **Pacto puntual libre**, sin partir de una necesidad publicada. La oferta libre sigue siendo el pacto fijo de hoy.
- **Tomar una necesidad sin ser miembro** de la tribu: `/pactos` sigue pidiendo membresía ("Solo miembros"). Tribus abiertas o cerradas y aval para tareas de diseño son **D19**.
- Que lo que una persona tomó se vea tomado para las demás: en el navegador, cada persona ve solo sus propios pactos.
- **Ronda de reconocimiento y ajuste por evaluación** (`f_eval`) sobre las horas del puntual: van con `evaluacion-pares`. La ronda sigue habilitándose solo con el pacto fijo aceptado.
- Cancelar un pacto puntual aceptado, revocar o corregir una constancia, horas que varían por mes (`pactos-horas-variables`), convocatorias de proveedores (D26), registro de cumplimiento (D31), reparto de caja (D23).

## Capabilities

### New Capabilities
- `pacto-puntual`: formatos por comunidad, ofrecer tomar una necesidad, pacto de una sola tarea con fecha, confirmación de horas y constancia base de Semillas.

### Modified Capabilities

## Impact

`lib/pactos/formatos.ts` (nuevo), `lib/pactos/estado.ts` (lista de puntuales por comunidad, acciones nuevas, lectura de lo guardado sin puntuales), `lib/pactos/constancia-base.ts` (nuevo, puro), `lib/semillas/estado.ts` (parte "puntual"), `app/pactos/pactos-cliente.tsx`, `app/semillas/semillas-cliente.tsx`, `app/tribus/[id]/` (componente cliente "Ofrecer tomarla" y estado propio de la necesidad), `lib/actividad/eventos.ts` (tres eventos), `lib/legal/terminos.ts` (`pactopuntual`, borrador), `lib/idioma/textos/` (pactos, semillas, tribus), tests de Vitest y e2e. Todo en `localStorage`, en la misma clave de pactos de la persona (sale en "Mis datos" y se borra con "Borrar datos de la demo"). Sin base, sin integraciones, sin pagos.
