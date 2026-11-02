# Design

## Context

`/territorios/lighthouse` dibuja vistas desde un registro puro (`lib/territorios/vistas.ts`), y lo que se puede elegir sale de `elegibles(fase)`. Las capas viven en `app/territorios/[id]/capas.ts` y usan tokens del tema. `lib/territorios/geometria.ts` ya tiene `puntoEnAnillo` y `distanciaM`.

El GeoJSON del boceto trae rasgos `tipo`: `sector` (1), `produccion` (1), `uso-comun` (1), `calle` (1) y `lote` (25: 22 de `clase: "barrio"` de 1.344 m² y 3 de `clase: "amplio"` de 2.200 m²). Cada lote tiene `id` (`lote-1`…), `numero`, `nombre`, `superficie_m2` e `ilustrativo: true`. **No trae estado**, y su metadata aclara que es un boceto que reemplaza el KMZ de Martín.

## Goals / Non-Goals

**Goals:**
- Ver los lotes en el mapa y en una lista equivalente, con estados que no dependan del color.
- Que cambiar el boceto por el KMZ sea cambiar un solo archivo de datos.

**Non-Goals:**
- Precio y acciones (`lote-ficha-y-compra`).
- Conocer de antemano la forma exacta del KMZ de Martín: el importador informa lo que no entiende, no lo adivina.

## Decisions

### 1. Un solo archivo de datos y un solo módulo que lo lee
- `lib/territorios/loteo-norte.json`: copia exacta de `openspec/changes/loteo-norte-7a/datos/loteo-norte-boceto.geojson`.
- `lib/territorios/loteo.ts`: lo único que lee ese archivo.
  ```ts
  export type Lote = { id: string; numero: number; nombre: string; clase?: string; superficieM2?: number; anillo: Anillo };
  export function listarLotes(): Lote[];     // por número
  export function sectorNorte(): ZonaLoteo;  // con areaHa
  export function zonasDelLoteo(): ZonaLoteo[]; // uso común, producción, camino
  export function fuenteDelLoteo(): FuentePlanId; // metadata.fuenteId; si falta, "ilustrativa"
  ```
Las pantallas nunca escriben "25" ni "1.344": cantidad y rango salen de `listarLotes()`.

### 2. La fuente reutiliza `FuentePlanId`, y `FUENTES_PLAN` no cambia
`FUENTES_PLAN` ya prevé `martin`. El archivo de datos dice su fuente en `metadata.fuenteId`, con el mismo tipo. Con `ilustrativa`, la vista Lotes dice "Boceto propio sobre el polígono del 7A: lo reemplaza el plano de Martín"; con `martin`, dice "Plano de Martín (KMZ, `<fecha>`)". En los dos casos sigue diciendo "Loteo provisorio, ilustrativo".

La fila "Masterplan de Martín" de la vista Plan queda como está: un KMZ de lotes no es el masterplan (L4). *Alternativa descartada:* pasar `martin` a `disponible`, porque `leerFuentePlan` abriría un Plan sin datos que dibujar.

### 3. Estados de ejemplo aparte de la geometría
`lib/territorios/loteo-estados.ts`:
```ts
export type EstadoLote = "disponible" | "reservado" | "vendido";
export const ESTADOS_EJEMPLO: Readonly<Record<string, Exclude<EstadoLote, "disponible">>> = {
  "lote-5": "reservado",
  "lote-13": "vendido",
  "lote-24": "reservado",
};
export function estadoDeLote(id: string): EstadoLote;
```
Así el KMZ no pisa los estados. La leyenda los presenta como "de ejemplo". Un lote sin entrada figura disponible: en un boceto, "disponible" es el estado de partida de la simulación, no una medición. Cuando `lote-ficha-y-compra` sume las reservas del navegador, esta función sigue siendo la base.

*Por qué estos tres:* uno de cada fila y uno amplio, para que la demo muestre los estados sin dejar de ofrecer casi todos los lotes.

### 4. Forma y texto de cada estado
| Estado | Mapa (`estiloLote` con tokens) | Lista y ficha |
|---|---|---|
| Disponible | Línea continua, relleno | `●` Disponible |
| Reservado | Línea de trazos, relleno claro | `◐` Reservado |
| Vendido | Línea de puntos, relleno gris | `✕` Vendido |

El carácter es decorativo (`aria-hidden`): la palabra es lo que cuenta. Texto en `lib/idioma/textos/territorio.ts` (`Available`, `Reserved`, `Sold`).

### 5. La vista
```ts
{
  id: "lotes",
  capas: ["contexto", "soluna", "macrolote", "comun", "loteo-norte"],
  elegibles: () => [...listarLotes().map((l) => l.id), terrenoComun().id, ...idsFincas(), ...idsLugares()],
}
```
- Va primera en `VISTAS`, y `VISTA_POR_DEFECTO = "lotes"`. El `useState` inicial de `vitrina-territorio.tsx` usa esa constante en vez de `"ahora"`.
- `Grupo` y `ORDEN_GRUPOS` suman `loteo-norte`, encima de `comun`.
- **Encuadre:** al entrar a la vista, el mapa hace `fitBounds` sobre los lotes. A escala de las 993 ha un lote de 32 × 42 m ocupa menos de un píxel; la lista es el camino principal en el celular.
- Los enlaces viejos siguen funcionando: `leerEntrada` busca la primera vista donde `sel` sea elegible. Por eso `?sel=agua-cuenca` sigue abriendo Ahora y `?sel=barrio-6` sigue abriendo Visión.
- **Etapa:** en Lotes dice "Este loteo todavía no dice qué se vende en cada fase (sin dato)", como hace Plan.

### 6. Textos
| Clave | es | en |
|---|---|---|
| `vistas.lotes.nombre` | Lotes · sector norte | Lots · north sector |
| `vistas.lotes.corto` | Lotes | Lots |
| `loteo.marca` | Loteo provisorio, ilustrativo | Provisional, illustrative subdivision |
| `loteo.limites` | Este boceto no considera la línea de inundación, la costa ni el relieve. | This sketch does not consider the flood line, the shoreline or the terrain. |
| `loteo.fuenteBoceto` | Boceto propio sobre el polígono del 7A: lo reemplaza el plano de Martín. | Our own sketch on the 7A polygon: Martín's plan will replace it. |
| `loteo.fuenteMartin(fecha)` | Plano de Martín (KMZ, {fecha}). | Martín's plan (KMZ, {fecha}). |
| `loteo.estadosEjemplo` | Estados de ejemplo. | Sample statuses. |
| `loteo.listaTitulo` | Lotes del sector norte | North sector lots |
| `loteo.resumen(n, min, max, ha)` | {n} lotes de {min} a {max} m² en un sector de {ha} ha | {n} lots of {min} to {max} m² in a {ha} ha sector |

La marca aparece en la leyenda, arriba de la lista y en el panel de cada lote.

### 7. Panel del lote
Nombre, superficie (`textoSuperficieM2`, "sin dato" si falta), estado en texto y forma, marca provisoria y `EstadoAdministrativo` compacto de `lighthouse-norte`. En este cambio no llama a `accionesDeLote` ni muestra botones: los suma `lote-ficha-y-compra`. Espacio común, producción y camino se dibujan con su nombre en la leyenda, sin selección.

### 8. El importador
`scripts/importar-loteo.ts` (con `tsx`), más la lógica pura en `lib/territorios/importar-loteo.ts`, que es lo que se testea.

```
pnpm exec tsx scripts/importar-loteo.ts <entrada.kmz|.kml> [--salida lib/territorios/loteo-norte.json] [--comprobar]
```

**Lectura.** Abre el KMZ con `unzip -p` (sin dependencias nuevas) y toma el primer `.kml`. Lee cada `Placemark` con su nombre y su polígono exterior. Clasifica por nombre, sin distinguir mayúsculas ni acentos:

| Nombre | `tipo` | `id` |
|---|---|---|
| `Lote 12`, `L-12`, `L12` | `lote` | `lote-12` |
| contiene `comun` | `uso-comun` | `sector-norte-comun` |
| contiene `produccion` | `produccion` | `sector-norte-produccion` |
| contiene `camino` o `calle` | `calle` | `sector-norte-calle` |
| contiene `sector` | `sector` | `sector-norte` |

Un `Placemark` que no entra en la tabla **se informa y hace fallar la importación**: no se descarta en silencio. Como todavía no sabemos cómo nombra Martín sus polígonos, ajustar esta tabla al recibir el KMZ es parte de ese otro PR.

**Validación** (`validarLoteo(rasgos, anillo7A, previo)`), que devuelve errores y avisos:

| Regla | Si falla |
|---|---|
| Anillo cerrado, con 3 vértices distintos o más | Error |
| Cada lote dentro del polígono del 7A (todos los vértices dentro y ningún lado cruza el borde) | Error, con el id |
| Sin superposiciones entre lotes | Error, con los dos ids |
| Ids únicos y con formato `lote-<número>` | Error |
| Al menos un lote | Error |
| Ids del archivo anterior que ya no están | Aviso (afectan a `ESTADOS_EJEMPLO` y a las reservas guardadas) |
| Lote en `ESTADOS_EJEMPLO` que ya no existe | Aviso |
| Franja del río | Aviso fijo: "Franja del río: sin verificar (sin dato)" |

**Superposición con tolerancia.** Los lotes vecinos comparten lados, y redondear a 6 decimales mueve un vértice unos 10 cm. Dos lotes se superponen si un vértice de uno queda dentro del otro a más de 0,5 m de su borde, o si dos lados se cruzan propiamente lejos de sus extremos. `geometria.ts` suma una función pura y testeada para esto. El boceto completo tiene que pasar como test.

**Salida.** El mismo formato del boceto: `metadata.fuenteId: "martin"`, `metadata.archivo`, `metadata.importado`, y `superficie_m2` calculada con la misma proyección de `boceto_loteo_norte.py` (`MX = 111320 × 0,7759`, `MY = 110540`), para que un lote de 32 × 42 m dé 1.344 m². `ilustrativo: true` se mantiene: lo saca una decisión, no una importación. Con errores, **no escribe nada** y sale con código 1. `--comprobar` valida sin escribir.

*Alternativa descartada:* un script Python como `kmz_to_geojson.py`. Validaría con otra geometría que la que usan los tests, y la noche no tiene `shapely`.

## Risks / Trade-offs

- [El KMZ de Martín llega con otro formato] → El importador falla listando lo que no entendió, y ajustar la tabla de nombres es un cambio chico.
- [Los ids cambian y se pierden reservas de ejemplo] → Son datos simulados del navegador. El importador lo avisa, y la ficha de un lote inexistente da 404.
- [Cambiar la vista por defecto rompe e2e viejos] → Se pasan a `?vista=ahora` explícito. **Se cambia el test, no la conducta** de Ahora, Plan ni Visión.
- [Un lote no se puede tocar con el dedo en el mapa] → La lista es equivalente y es el camino en el celular.
- [El boceto puede caer en zona inundable o sobre la franja del río] → No tenemos ese dato: el texto lo dice y el importador avisa. Ver pregunta abierta.
- [Se ve "Reservado" o "Vendido" sin que nadie haya hecho nada] → La leyenda dice "Estados de ejemplo".

## Migration Plan

Sin datos guardados que migrar. Para pasar al KMZ: `pnpm exec tsx scripts/importar-loteo.ts <kmz> --comprobar`, después sin `--comprobar`, y un PR con el JSON (`docs/notas/importar-loteo.md`). Volver atrás es revertir ese PR.
