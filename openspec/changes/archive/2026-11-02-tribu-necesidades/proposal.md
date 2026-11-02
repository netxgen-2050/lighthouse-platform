# Proposal

## Why

Hoy "lo que busca" una tribu es una etiqueta suelta ("Riego", "Bioconstrucción") sin detalle: quien quiere ayudar no sabe qué hay que hacer, cuánto lleva, para cuándo ni si es trabajo de diseño o con las manos. Don Powa lo pidió el 23-oct ("el voluntario viene y hace A, B y C") y Gus contestó que "lo que busca" tiene que abrir el detalle de cada necesidad (`NS_platform` Backlog **D18**; reunión 2026-10-23 Don Powa · Quinta Esencia, #2 y #3).

Además, Gus resolvió la parte de **D19** que toca a las tareas (28-oct): **toda tarea de diseño tiene que estar avalada por quien administra el holón donde está** (la tribu, el común Lighthouse o un círculo interno), siguiendo los patrones de gobernanza de la holarquía (`fogon-gobernanza-holarquia`), y **el aval es una constancia con forma EAS**.

Es el primero de cuatro cambios chicos que bajan D18, D19 (tareas de diseño) y D20. Van **después de `pactos-dos-partes`** (decisión de Gus, 28-oct), que tiene que estar en `dev` antes del segundo:

1. **`tribu-necesidades`** (este): cada necesidad de la tribu tiene su ficha de tarea y su holón, y las de diseño llevan el aval del holón.
2. `pacto-puntual`: miembros y aspirantes se **postulan** para tomar una necesidad; el holón la **pre-admite** (o no, con motivo).
3. `pacto-puntual-verificacion`: la persona marca la tarea hecha con sus horas, el holón **verifica** y recién ahí nace la constancia base de Semillas.
4. `pactos-horas-variables`: el pacto recurrente puede tener horas que cambian de un mes a otro, con un compromiso mínimo, y el holón confirma las horas de cada mes.

## What Changes

- **Necesidad con ficha de tarea.** Datos de ejemplo (`lib/tribus/necesidades.ts`, es/en) con 12 necesidades de las 8 tribus activas o en formación. Cada una dice: qué es, horas aproximadas (o "sin dato"), si es **de diseño** o **de campo**, para cuándo (o "sin dato"), qué habilidad pide (de la lista de roles de `/pactos`), su estado (**abierta**, **tomada**, **hecha**) y, si tiene, el **círculo** de la holarquía al que pertenece.
- **Una necesidad por etiqueta.** Cada etiqueta de `busca` de una tribu activa o en formación tiene exactamente una necesidad con ese mismo título. `busca` no cambia: el listado `/tribus` y el mapa siguen mostrando las etiquetas como hoy.
- **Ficha de la tribu.** La tarjeta "Lo que busca" de `/tribus/<id>` muestra cada necesidad como un elemento plegable (título, tipo y estado a la vista; el resto al abrirlo), con un ancla `#necesidad-<id>` para poder enlazarla.
- **Holarquía.** Una necesidad puede pertenecer a un círculo de su tribu o a un círculo transversal en el que su tribu participa (`lib/gobernanza/datos.ts`). Se muestra el nombre del círculo en el idioma de la página. El **holón** de una necesidad es su círculo, si tiene, y si no, su tribu: es el que la avala, pre-admite y verifica (subsidiariedad: decide el holón más chico que la contiene).
- **Aval de las tareas de diseño (D19).** Cada necesidad de diseño puede tener un **aval**: una constancia con la forma de los registros de gobernanza (`lib/gobernanza/tipos.ts`, forma EAS de ADR-012) que afirma el holón de la necesidad. Una tarea de diseño **sin aval** se muestra "Esperando el aval de <holón>" y no se puede tomar (lo usa `pacto-puntual`). Las de campo no necesitan aval. Los avales son **de ejemplo**, en el código: tres de las cuatro tareas de diseño lo tienen y una no, para mostrar el caso.
- **Varias personas por tarea y máximo por persona** (decisión de Gus, 28-oct). Una necesidad puede tomarla más de una persona: los estados quieren decir **abierta** (suma personas), **tomada** (ya no suma más: la tomaron las que hacían falta) y **hecha**. Quien administra el holón puede poner un **máximo por persona**, en horas o en Semillas (`tope`, o "sin máximo"). Las horas por encima del máximo no generan Semillas: la ficha lo dice ("Máximo por persona: 10 h · las horas de más no generan Semillas"). Los máximos son de ejemplo, en el código: uno en horas (`valle-solar`, 10 h) y uno en Semillas (`agua-plomeria`, 60 Semillas).
- **Máximo total de la tarea** (decisión de Gus, 28-oct): además del máximo por persona, una necesidad puede tener un máximo total, en horas o en Semillas, sumando a todas las personas, que fija quien administra el holón. Ejemplos: `valle-solar` 20 h, `agua-plomeria` 150 Semillas, `monte-bioconstruccion` 40 h.
- **Círculos transversales administrados por Hifa** (decisión de Gus, 28-oct): los administra y facilita Hifa (la IA); en el prototipo, simulado y marcado como experimental, con el super admin como respaldo si Hifa no está disponible. La decisión definitiva depende de probar que sea estable y fiable.
- **Nombres**: "Semillas pendientes" y "Semillas"; nunca "brotes" ni "germinar".
- **Textos** en español (voseo) y en inglés.

**Fuera de alcance:**
- **Poner o cambiar el máximo desde la pantalla**: es un dato de ejemplo, como los avales.
- **Un cupo de personas por tarea** (cuántas pueden tomarla a la vez): no lo pidió Gus; queda como pregunta.
- **Postularse para tomar una necesidad** y el pacto puntual: van en `pacto-puntual`. En este cambio el estado de cada necesidad es el de ejemplo y no cambia.
- **Dar o retirar un aval desde la pantalla.** Quien administra el holón todavía no tiene un botón "Avalar": los avales son de ejemplo. Avalar de verdad va junto con la carga de necesidades por la tribu.
- **Que la tribu cargue, edite o cierre sus necesidades.** Son datos de ejemplo en el código; la carga por quien lidera queda para cuando haya base.
- **Necesidades del común Lighthouse.** El modelo del holón admite el común, pero este cambio solo muestra necesidades de tribus (y de sus círculos).
- **El resto de D19**: tribus abiertas, por invitación o cerradas; el aval de la red (trust graph) para postularse; banderas rojas (pasan a D24).
- Los barrios vacantes: su "Qué necesita" sigue siendo la lista de etiquetas (lo que buscan es una tribu, no una tarea).
- Convocatorias de proveedores (D26), buscador o filtro de necesidades entre tribus, mapa de necesidades.
- `/compromisos` (ofrezco/necesito): queda como está; `rail-sin-compromisos` lo saca de la navegación y este cambio no lo toca.

## Capabilities

### New Capabilities
- `tribu-necesidades`: necesidades de una tribu como tareas con ficha (qué, horas, diseño o campo, fecha, habilidad, estado, círculo, holón y máximo por persona), con el aval del holón para las de diseño, visibles en la ficha de la tribu.

### Modified Capabilities

## Impact

`lib/tribus/necesidades.ts` (nuevo, con sus tipos, el holón, los avales de ejemplo y tests), `app/tribus/[id]/page.tsx` (tarjeta "Lo que busca" de tribus activas y en formación), `lib/idioma/textos/tribus.ts` (textos es/en), `lib/idioma/revision-nativa.ts` (el inglés de ejemplo queda para revisión nativa), `e2e/tribus.spec.ts` (o el e2e de la ficha que exista). No toca la base, ni `localStorage`, ni permisos, ni datos personales.
