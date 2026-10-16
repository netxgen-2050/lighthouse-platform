# Design

## Context

- `app/territorios/[id]/mapa-leaflet.tsx` arma el mapa una sola vez: contexto, contorno de Soluna, fincas, contorno del macrolote, terreno común, barrios y, como marcadores con foco (`role="button"`), los sellos de barrios, del común y de los lugares. Guarda las capas elegibles en `capas` (por id) para resaltar sin rehacer el mapa. Los polígonos van en un renderer de canvas (no son elementos del DOM).
- `app/territorios/[id]/vitrina-territorio.tsx` tiene la leyenda (tres grupos), la lista "Elegir en el mapa", la ficha lateral y la selección en la URL (`?sel=`, con `replaceState`).
- `lib/territorios/biopueblo.ts` da a cada elemento su `tipo` (`macrolote`, `comun`, `barrio`, `soluna`, `finca`, `lugar`, `contexto`) y `buscarElemento(id)`.
- `idioma-tribus-territorio` (PR #92) mueve los textos de la vitrina a `lib/idioma/textos/territorio.ts` (`leyenda.*`).
- El aviso del estado administrativo lo pone `app/territorios/[id]/page.tsx` (`<EstadoAdministrativo proyecto="soluna" />`), fuera de la vitrina: no lo toca este cambio.

## Goals / Non-Goals

**Goals**
- Prender y apagar los tres grupos que ya existen, con teclado y en los dos idiomas.
- Que la selección, la ficha y el enlace no queden en un estado imposible.

**Non-Goals**
- Capas nuevas (GIS) o filtros por estado.
- Rehacer el mapa o cambiar estilos.

## Decisions

### 1. Grupos como `L.layerGroup`
`mapa-leaflet.tsx` arma tres `L.layerGroup` (`lighthouse`, `soluna`, `lugares`) y pone en cada uno sus polígonos **y** sus marcadores. Mostrar u ocultar es `mapa.addLayer(grupo)` / `mapa.removeLayer(grupo)`. Al sacar un grupo, Leaflet saca los marcadores del DOM: dejan de recibir foco sin tocar `tabindex`. Las zonas de contexto y la imagen satelital quedan fuera de los grupos.
- Alternativa descartada: `L.control.layers` de Leaflet. Su control no sigue el tema, sus textos están en inglés y no comparte el estado con la URL ni con la lista.
- Al volver a agregar un grupo, el orden de pintado se rehace con `bringToFront` en el orden original (Soluna, Lighthouse, lugares) para que los barrios queden arriba del contorno del macrolote, como hoy.

### 2. Lógica pura en `lib/territorios/capas.ts`
- `GRUPOS = ["lighthouse", "soluna", "lugares"] as const`.
- `grupoDe(id)`: por el `tipo` de `buscarElemento(id)` (`macrolote`, `comun`, `barrio` → `lighthouse`; `soluna`, `finca` → `soluna`; `lugar` → `lugares`; otro → `null`).
- `leerOcultos(valor)`: separa por coma, ignora claves desconocidas y repetidas.
- `escribirOcultos(conjunto)`: claves en el orden de `GRUPOS`, o `null` si no hay ninguna.
- `resolverInicio({ ocultar, sel })`: si `sel` está en un grupo oculto, lo quita de los ocultos (gana la selección).

### 3. Estado en la vitrina
`vitrina-territorio.tsx` tiene `ocultos: Set<Grupo>` junto a `seleccion`. Lo lee de la URL al entrar (como `sel`, con `resolverInicio`) y lo escribe con el mismo `replaceState` que ya usa para `sel`, en un solo efecto que arma la URL con los dos parámetros. Reglas:
- Ocultar el grupo de la selección → `setSeleccion(null)`.
- Elegir desde la lista algo de un grupo oculto → quitar el grupo de `ocultos` y elegir.
- `MapaCliente` recibe `visibles` y el mapa aplica la diferencia en un `useEffect`.

### 4. Casillas en la leyenda
Cada grupo pasa de `<p id>` + `<ul>` a un `<fieldset>` con `<legend>` (el nombre del grupo) y, adentro, la casilla nativa `<input type="checkbox">` con `<label>` "Mostrar" + nombre (por ejemplo "Mostrar Chacras de Soluna"), seguida de la lista de símbolos de siempre. Con el grupo oculto, la lista de símbolos se ve atenuada **y** la casilla desmarcada dice el estado: nada solo por color. El contenedor del mapa expone `data-capas="lighthouse soluna lugares"` (los visibles) para que el e2e compruebe los polígonos de canvas.

### 5. Aviso con todo oculto
Un `<p role="status">` que siempre existe (vacío si hay alguna capa), para que el lector de pantalla anuncie el cambio.

### 6. Textos
En `lib/idioma/textos/territorio.ts`, dentro de `leyenda`: `mostrar` ("Mostrar" / "Show"), `sinCapas` ("No hay capas a la vista. Marcá alguna en la leyenda." / "No layers on view. Tick one in the legend."). Los nombres de grupo ya están en el catálogo o son nombres propios (`translate="no"`).

## Risks / Trade-offs

- **Conflicto con `idioma-tribus-territorio`**: los dos cambian `vitrina-territorio.tsx`. Por eso este va después.
- **Un enlace con `?ocultar=soluna` no esconde la existencia de Soluna**: la lista "Fincas disponibles de Soluna" sigue en la página (es la alternativa de teclado y la spec la quiere completa). Ocultar es una vista, no una restricción. Si se quiere un Lighthouse sin ninguna mención a Soluna para mostrar afuera, es otra decisión (pregunta abierta).
- **Rehacer el orden de pintado** al volver a mostrar un grupo puede dejar un polígono por encima de otro distinto a hoy; el e2e no lo puede ver en el canvas. Se revisa a mano en `pnpm dev`.

## Migration Plan

Sin datos. Los enlaces viejos con solo `?sel=` siguen andando igual (sin `ocultar`, todo visible).

## Open Questions

- **Gus:** ¿al ocultar Soluna también tendría que desaparecer la lista "Fincas disponibles de Soluna" de "Elegir en el mapa"? La spec la deja (la lista es la alternativa de teclado y sirve para volver a mostrar el grupo), pero si el uso es mostrar el Lighthouse sin las fincas, quizás convenga esconderla también.
- **Gus:** ¿el mapa tendría que abrir con Soluna oculta por defecto mientras el loteo sigue en trámite (R23)? Hoy la spec abre con todo visible, como ahora.
