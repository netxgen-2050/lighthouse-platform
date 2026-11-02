# Design

## Context

Ya existen `/territorios/[id]` (territorio-ficha) con un mapa Leaflet (territorio-mapa) y geometría ilustrativa en `lib/territorios/`. La geometría real llega en `docs/referencia/biopueblo-territorios.geojson` (propiedades `tipo`: macrolote, comun, barrio con `barrio` y `tribuId`, soluna, finca con `numero`, `superficie_m2` y `estado`, lugar, contexto).

## Decisions

- **Datos:** copiar el GeoJSON a `lib/territorios/biopueblo-territorios.json` e importarlo (estático, sin fetch). Tipos y funciones puras en `lib/territorios/` para filtrar por tipo, buscar por id y contar tribus por estado (con tests). La geometría ilustrativa anterior se borra.
- **Mapa:** Leaflet (ya instalado), componente cliente cargado sin SSR. Fondo `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}` con atribución "Esri, Maxar, Earthstar Geographics". `fitBounds` al Macrolote 7. Capas en este orden: contexto, Soluna y fincas, macrolote, común, barrios, lugares.
- **Selección:** un único estado `seleccion: { tipo, id } | null` compartido por el mapa, la lista y la ficha. La URL no cambia (opcional: `?sel=barrio-6` para compartir, sin recargar).
- **Diseño:** grilla de dos columnas (mapa ~2/3, ficha ~1/3) desde 768 px; una columna debajo de eso.
- **Textos de ejemplo** del común y de los lugares en `lib/territorios/textos.ts`.

## Risks / Trade-offs

- [Teselas satelitales externas] → si no cargan, el mapa sigue mostrando los polígonos sobre fondo liso; el e2e no depende de las teselas (bloquearlas con `page.route` en los tests).
- [175 fincas en el mapa] → polígonos simples con Canvas renderer de Leaflet.
