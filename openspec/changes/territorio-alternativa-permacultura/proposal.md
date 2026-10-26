# Proposal

## Why

El mapa del Macrolote 7 muestra hoy doce barrios repartidos **al azar**, "hasta el masterplan". El masterplan que se está dibujando (loteo del cono, 2026-10-23) responde a la urgencia de presentar la subdivisión, y todavía no tiene programa ni lectura del agua ([NS_permacultura, doc 20](../../../../NS_permacultura/20%20-%20Llamada%202026-10-23%20con%20Mart%C3%ADn%20y%20Maur%C3%ADcio.md)). Gus quiere mostrarle al equipo, **de forma gráfica**, que existe otra manera de empezar: un **masterplan de permacultura** que se lee desde el agua y el relieve, con zonas 0–5, sectores, una primera hectárea y crecimiento por etapas.

El Agente de Regeneración (vault `NS_permacultura`) armó un **borrador v0.1** a partir del modelo de elevación Copernicus GLO-30 (30 m), la acumulación de flujo, las pendientes y el polígono real del Macrolote 7. Es una propuesta **preliminar e ilustrativa**: no reemplaza el relevamiento, la observación del sitio ni el diseño humano, y la plataforma lo tiene que decir con claridad.

## What Changes

- En `/territorios/lighthouse`, arriba del mapa, un **selector de vista** con dos opciones:
  - **"Distribución ilustrativa"** (la de hoy, sin cambios), que sigue siendo la vista por defecto.
  - **"Alternativa: masterplan de permacultura (borrador)"**.
- La vista elegida queda en la URL (`?vista=permacultura`), para poder compartir el enlace.
- En la vista de permacultura el mapa:
  - oculta los barrios, el terreno común y sus sellos, y deja el contorno del Macrolote 7, Soluna y las fincas;
  - dibuja los ~19 elementos del borrador: franja ribereña, planicie, columna verde del cañadón, desembocadura, primera hectárea y crecimiento a los años 4 y 7, núcleo común, 4 clusters, zonas 2 a 5, el acceso por la divisoria, la bajada, las cortinas rompevientos, los esparcidores de crecidas y el tanque alto;
  - suma sellos enfocables con teclado para la primera hectárea, el núcleo y los clusters.
- **Leyenda propia** en texto, agrupada en Agua y bienes comunes, Producción, Asentamiento, Implementación, Monte silvestre y Caminos, sectores y obras. Cada grupo lleva una forma o un trazo distinto, para que nada dependa solo del color.
- **Lista "Elegir en el mapa"** con los elementos del borrador, agrupados igual que la leyenda.
- **Ficha lateral**:
  - con un elemento elegido, muestra nombre, zona, superficie, descripción y la marca de confianza;
  - sin selección, muestra un resumen: proporción ecológica (~52%), cuenca del cañadón (~2.000 ha, el doble del lote), método, avisos y el enlace al vault.
- **Avisos visibles** en esta vista:
  - "Borrador del Agente de Regeneración · preliminar e ilustrativo";
  - "Hace falta relevamiento, observación del sitio y diseño humano";
  - la fuente de los datos: Copernicus GLO-30.
- **Bilingüe** (es/en), como el resto del territorio.
- Los datos viven en `lib/territorios/alternativa-permacultura.json` (GeoJSON con textos es/en), separados de la pantalla. Se regeneran con el script del vault (`NS_permacultura/sources/masterplan-permacultura/`).

**Fuera de alcance:**
- Editar la propuesta desde la plataforma o comentarla (eso puede ir al Fogón más adelante).
- Capas de relieve o de acumulación de flujo como ráster.
- Asignar tribus a los clusters o vender o consultar por ellos: los clusters **no** son lotes.
- Cambiar la vista por defecto.

## Capabilities

### New Capabilities
- `territorio-alternativa-permacultura`: la vista alternativa del Macrolote 7 con el borrador de masterplan de permacultura.

### Modified Capabilities

## Impact

- `lib/territorios/` (datos y su módulo con tests), `lib/idioma/textos/territorio.ts` (textos es/en).
- `app/territorios/[id]/` (selector de vista, capas del mapa, leyenda, lista y ficha), `app/globals.css` (muestras de la leyenda con tokens).
- `e2e/territorio-alternativa-permacultura.spec.ts`.
- Sin dependencias nuevas.
- **Depende de** `territorio-mapa`, `territorio-ficha`, `territorio-macrolote` e `idioma-tribus-territorio` en `dev`.
