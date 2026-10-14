# Design

## Contexto

Hoy `EstadoSumarte` tiene `tribu: boolean` y `tribuId: string | null` (null = tribu nueva por proponer). `calcularNivel` devuelve `tribuLider: string | null`, que leen `MarcaAdmin`, el menú del avatar y Sumarte.

## Decisiones

- **Forma del estado:** `tribus: string[]` (ids de tribus existentes) y `tribuNueva: boolean` (hay una tribu nueva por proponer). Se es líder si `tribus.length > 0 || tribuNueva`. Se elimina `tribu`/`tribuId` del estado nuevo, pero `leer()` acepta el formato anterior: `{ tribu: true, tribuId: "valle" }` → `{ tribus: ["valle"], tribuNueva: false }`; `{ tribu: true, tribuId: null }` → `{ tribus: [], tribuNueva: true }`. Ids que no son tribus activas o en formación se descartan al leer.
- **Acciones del reductor:** `{ tipo: "tribu", tribuId }` (primera tribu o sumar otra; si ya está, no cambia), `{ tipo: "dejarTribu", tribuId | "nueva" }`. Las acciones `plan` (Miembro/Explorador) vacían la lista, como hoy. `leerPendiente` sigue aceptando la acción `tribu` tal como está.
- **Sesión:** `NivelCalculado` pasa a `{ nivel, tribusLider: string[] }`. La tribu de `LH_PERSONAS` (`admin-tribu`) se agrega a la lista si no está y se marca como no removible (Sumarte la muestra sin "Dejar de liderar").
- **Diálogo:** `<dialog>` nativo con `showModal()`, como `KycDialogo`: foco al título al abrir, Escape cierra, el foco vuelve al botón "Sumar otra tribu". Texto con los nombres de las tribus ya lideradas unidas con "y".
- **Precio:** `PLAN_TRIBU_MENSUAL × cantidad de tribus existentes lideradas` (la tribu nueva pendiente no suma hasta existir), con `formatearMonto` para respetar la moneda elegida.

## Riesgos

- `base-neon` define `personas.tribu que administra` como un solo valor. No se toca en este cambio; cuando los datos de Sumarte pasen a la base (`datos-en-la-nube`), esa columna tiene que pasar a una tabla o lista. Anotarlo en el PR.
- Si `pase-fundador-gobernanza` ya está mergeado, revisar que el nivel Fundador no se rompa con el estado nuevo (sus tests cubren el Pase).
