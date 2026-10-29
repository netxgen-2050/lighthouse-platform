# Proposal

## Why

Con `pacto-puntual`, un miembro o aspirante se postula a una necesidad y el holón (la tribu o el círculo) la pre-admite. Falta el final: que la persona diga "listo, la hice en tantas horas", que **la gobernanza del holón verifique que la tarea se completó** y que **recién con esa verificación se otorguen las Semillas** (decisión de Gus del 28-oct; D15, D20 y D31 de `NS_platform`; "nunca Semillas por un clic propio"). Gus también decidió que el pacto puntual **no** pasa por la ronda de reconocimiento ni por la evaluación de pares: **su validación es la verificación del holón**.

Y como `pactos-dos-partes` va antes (decisión de Gus, 28-oct), este cambio le **suma los dos esquemas de horas** que había dejado anotados: `pacto-propone-horas` (la persona propone las horas hechas) y `pacto-confirma-horas` (el holón las confirma). `pactos-horas-variables` los reusa para las horas de cada mes.

Es el tercero de cuatro cambios (`tribu-necesidades` → `pacto-puntual` → **`pacto-puntual-verificacion`** → `pactos-horas-variables`).

## What Changes

- **Esquemas de horas en las constancias de pactos.** `lib/pactos/constancias.ts` suma `pacto-propone-horas` (afirma la persona; apunta a su propuesta pre-admitida o aceptada; `datos.horas` y, para un mes, `datos.mes`) y `pacto-confirma-horas` (afirma el holón o la tribu, con quien actuó; apunta a la propuesta de horas). Pedir revisar las horas es un `pacto-no-acepta` con motivo que apunta a la propuesta de horas.
- **Marcar la tarea hecha.** Con la postulación pre-admitida, la persona marca la tarea como hecha con las **horas reales** (enteras, de 1 a 200; pueden ser distintas de las pactadas). Queda "Hecha · esperando que <holón> verifique". Puede retirarla mientras no hubo respuesta.
- **Verificación por el holón** en `/pactos/responder`, sección "Tareas para verificar": quien administra el holón (el mismo de la pre-admisión) **verifica** las horas o **pide revisarlas** con motivo (la tarea vuelve a "Pre-admitida" con el aviso). Nadie verifica su propia tarea.
- **Constancia base de Semillas solo con la verificación, una por persona.** Una tarea la pueden tomar varias personas (decisión de Gus, 28-oct): cada una marca hecha **sus propias horas**, el holón verifica las de cada una por separado y cada una recibe Semillas **por sus horas verificadas**. Al conciliar una verificación, queda guardada, congelada, una constancia base con la forma de ADR-012 (uid `ejemplo-…`, una por persona y tarea): tarea, horas verificadas, horas con Semillas y sin Semillas, el máximo por persona que se aplicó, valor de la hora de referencia, período (mes de la verificación en hora de Argentina), versión 1, el uid de la verificación y Semillas, una sola vez. Nunca se recalcula ni se edita. Detalle en ADR-020.
- **Máximo por persona.** Si la necesidad tiene un máximo (en horas o en Semillas, el que vio el holón al pre-admitir), las horas por encima no generan Semillas y se muestran como tales: "12 h verificadas · 10 h con Semillas · 2 h sin Semillas (máximo por persona: 10 h)".
- **Se reciben directo.** Las Semillas de un pacto puntual verificado son **Semillas** (recibidas) desde la verificación: no pasan por "Semillas pendientes", que son solo de los compromisos recurrentes (`pactos-horas-variables`).
- **Semillas.** La tarjeta de cada comunidad suma "Pactos puntuales: horas verificadas" con el total de sus constancias (o "sin dato") y lista cada una. El total la incluye. **Sin ronda ni evaluación de pares** por un puntual.
- **Tu parte, hecha.** "Hecha por vos" para la persona y "La hicieron <N> personas" para las demás personas del navegador, que pueden seguir sumándose mientras la necesidad esté abierta.
- **Mi recorrido:** "Marcaste hecha <tarea> en <tribu>", "<holón> verificó tus horas de <tarea>" y "<holón> pidió revisar tus horas de <tarea>".
- Textos es/en, con voseo.

**Fuera de alcance:**
- **Ronda de reconocimiento y ajuste por evaluación de pares (`f_eval`) sobre un puntual**: no se aplican (decisión de Gus, 28-oct), ni ahora ni con `evaluacion-pares`.
- ~~Un máximo total de horas o Semillas por tarea~~ **Actualizado el 28-oct (decisión de Gus):** el máximo total de la tarea (sumando a todas las personas, que fija quien administra el holón) **sí entra**. Ya existe en `tribu-necesidades` (`topeTotal`, `repartirConTopeTotal`) y `pacto-puntual` lo lleva en la postulación; esta verificación tiene que aplicarlo al repartir las Semillas, por orden de verificación. **Pendiente:** ajustar el diseño, la spec y las tareas de este cambio (`pacto-puntual` no lo hace).
- Revocar o corregir una constancia base ya emitida; cancelar una tarea pre-admitida que no se hizo; registro de cumplimiento con "se fue avisando / sin avisar" para tareas puntuales (D31).
- Firmar o publicar las constancias (etapas 2 y 3 de ADR-012); emitir la constancia en el servidor (llega con la base, P9).
- Separar en la tarjeta la proyección del pacto fijo de lo verificado de los puntuales (pregunta abierta de la revisión anterior).

## Capabilities

### New Capabilities
- `pacto-puntual-verificacion`: tarea hecha con horas reales, verificación por el holón, esquemas de horas en las constancias de pactos, constancia base de Semillas por persona y por tarea con el máximo por persona, y su parte en Semillas.

### Modified Capabilities

(`pactos-acuerdo`, de `pactos-dos-partes`, y `pacto-puntual` siguen sin archivar: este cambio suma los esquemas `pacto-propone-horas` y `pacto-confirma-horas` y los pasos "hecha" y "verificado".)

## Impact

`lib/pactos/constancias.ts` (dos esquemas, `horasPendientes`, validación al leer), `lib/pactos/mes.ts` (nuevo: `mesDe` en hora de Argentina), `lib/pactos/constancia-base.ts` (nuevo, puro), `lib/pactos/estado.ts` (pasos `hecha` y `verificado`, conciliación de horas), `lib/semillas/estado.ts` (parte "puntual"), `app/pactos/pactos-cliente.tsx`, `app/pactos/responder/` (sección "Tareas para verificar"), `app/semillas/semillas-cliente.tsx`, `app/tribus/[id]/` (estado "Hecha"), `lib/actividad/eventos.ts`, `lib/idioma/textos/`, `docs/decisiones/ADR-020-…` (ya escrito, Propuesta), tests de Vitest y e2e. Todo en el navegador. Sin base, sin integraciones, sin pagos.
