# Proposal

## Why

Hoy "lo que busca" una tribu es una etiqueta suelta ("Riego", "Bioconstrucción") sin detalle: quien quiere ayudar no sabe qué hay que hacer, cuánto lleva, para cuándo ni si es trabajo de diseño o con las manos. Don Powa lo pidió el 23-oct ("el voluntario viene y hace A, B y C") y Gus contestó que "lo que busca" tiene que abrir el detalle de cada necesidad (`NS_platform` Backlog **D18**; reunión 2026-10-23 Don Powa · Quinta Esencia, #2 y #3).

Es el primero de tres cambios chicos que bajan D18 y D20:

1. **`tribu-necesidades`** (este): cada necesidad de la tribu tiene su ficha de tarea, visible en la ficha de la tribu.
2. `pacto-puntual`: ofrecer tomar una necesidad abre un pacto de una sola tarea con fecha, y sus horas confirmadas dan la constancia base de Semillas.
3. `pactos-horas-variables`: el pacto recurrente puede tener horas que cambian de un mes a otro, y cada tribu dice qué formatos acepta.

## What Changes

- **Necesidad con ficha de tarea.** Datos de ejemplo (`lib/tribus/necesidades.ts`, es/en) con 12 necesidades de las 8 tribus activas o en formación. Cada una dice: qué es, horas aproximadas (o "sin dato"), si es **de diseño** o **de campo**, para cuándo (o "sin dato"), qué habilidad pide (de la lista de roles de `/pactos`), su estado (**abierta**, **tomada**, **hecha**) y, si tiene, el **círculo** de la holarquía al que pertenece.
- **Una necesidad por etiqueta.** Cada etiqueta de `busca` de una tribu activa o en formación tiene exactamente una necesidad con ese mismo título. `busca` no cambia: el listado `/tribus` y el mapa siguen mostrando las etiquetas como hoy.
- **Ficha de la tribu.** La tarjeta "Lo que busca" de `/tribus/<id>` muestra cada necesidad como un elemento plegable (título, tipo y estado a la vista; el resto al abrirlo), con un ancla `#necesidad-<id>` para poder enlazarla.
- **Holarquía.** Una necesidad puede pertenecer a un círculo de su tribu o a un círculo transversal en el que su tribu participa (`lib/gobernanza/datos.ts`). Se muestra el nombre del círculo en el idioma de la página.
- **Textos** en español (voseo) y en inglés.

**Fuera de alcance:**
- **Ofrecer tomar una necesidad** y el pacto puntual: van en `pacto-puntual`. En este cambio el estado de cada necesidad es el de ejemplo y no cambia.
- **Que la tribu cargue, edite o cierre sus necesidades.** Son datos de ejemplo en el código; la carga por quien lidera queda para cuando haya base.
- **D19**: tribus abiertas, por invitación o cerradas, y el aval de la red para postularse a tareas de diseño. Acá "de diseño" es solo una etiqueta; no pide nada distinto.
- Los barrios vacantes: su "Qué necesita" sigue siendo la lista de etiquetas (lo que buscan es una tribu, no una tarea).
- Convocatorias de proveedores (D26), buscador o filtro de necesidades entre tribus, mapa de necesidades.
- `/compromisos` (ofrezco/necesito): queda como está; `rail-sin-compromisos` lo saca de la navegación y este cambio no lo toca.

## Capabilities

### New Capabilities
- `tribu-necesidades`: necesidades de una tribu como tareas con ficha (qué, horas, diseño o campo, fecha, habilidad, estado, círculo), visibles en la ficha de la tribu.

### Modified Capabilities

## Impact

`lib/tribus/necesidades.ts` (nuevo, con sus tipos y tests), `app/tribus/[id]/page.tsx` (tarjeta "Lo que busca" de tribus activas y en formación), `lib/idioma/textos/tribus.ts` (textos es/en), `lib/idioma/revision-nativa.ts` (el inglés de ejemplo queda para revisión nativa), `e2e/tribus.spec.ts` (o el e2e de la ficha que exista). No toca la base, ni `localStorage`, ni permisos, ni datos personales.
