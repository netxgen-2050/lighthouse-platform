# Proposal

## Why

El módulo `descubrir/` de la It.1 "Explorar" (roadmap técnico, nota Desarrollo/06) pide un **mapa Leaflet** del territorio, y la US-02 de la nota 15 quiere que la persona entienda **dónde** está el proyecto antes de buscar tribu. Esta noche entró la ficha del territorio (`territorio-ficha`) **sin mapa**, a la espera del GIS de Martín/ARQVA. El GIS todavía no llegó, pero el mock-up v6 ya dibuja el Lighthouse con una geometría **ilustrativa** (polígono del Lote 7 y doce barrios alrededor de un núcleo común). Con eso alcanza para estrenar el mapa en el preview, dejar armada la pieza técnica (Leaflet en Next 15, accesible con teclado) y, cuando llegue el GIS, cambiar solo los datos.

## What Changes

- Un mapa en la ficha `/territorios/lighthouse`, arriba de la grilla de barrios, con:
  - El contorno ilustrativo del Lighthouse, el rectángulo del núcleo común y los **12 barrios**, copiados de `LH_POLY`, `barrioRect()` y `COMMONS_RECT` del mock-up v6.
  - En cada barrio, un **sello** con las iniciales de la tribu (o "+" si está vacante) que es un control enfocable con teclado. Su nombre accesible dice barrio, tribu y estado en texto. Enter (o un clic) lleva a `/tribus/[id]`.
  - Una **leyenda** en texto: tribu activa, en formación, barrio que busca tribu, núcleo común. Nada se distingue solo por color.
  - Mapa base de OpenStreetMap con su atribución y la nota "Ubicación, forma y barrios ilustrativos, a la espera del GIS de ARQVA" (texto del mock-up).
- La geometría vive como **datos** en `lib/territorios/`, marcada como ilustrativa, separada de la página, para reemplazarla por el GeoJSON real sin tocar la pantalla.
- La grilla de barrios que ya existe en la ficha sigue igual: es la alternativa en texto del mapa.

**Fuera de alcance:**
- **Chacras de Soluna y los lotes de BioPueblo** (la capa `GEO` del KMZ, el selector Lighthouse/Soluna y el panel de cada finca): otro cambio, junto con la decisión sobre el banner de la Ordenanza 173 (C1).
- El **panel lateral** del mock-up al tocar un barrio (plata comprometida, roles cubiertos, "Proponer mi pacto"): en esta versión el sello lleva directo a la tribu.
- Niveles de zoom corredor → BioPueblo → sector (US-02) y otros nodos del corredor (decisión C5: fuera).
- Capas activables (ribera, protección, producción): dependen del GIS.
- Bienes comunes con plata y horas: siguen como en `territorio-ficha`.
- Términos ⚖ nuevos: no se agregan.

## Capabilities

### New Capabilities
- `territorio-mapa`: el mapa ilustrativo del territorio con sus barrios y tribus, navegable con teclado.

### Modified Capabilities

## Impact

`app/territorios/[id]/` (un componente cliente del mapa), `lib/territorios/` (geometría ilustrativa y su test), `app/globals.css` (estilos del mapa con tokens), `e2e/territorio-mapa.spec.ts`. **Dependencias nuevas:** `leaflet` y `@types/leaflet` (desarrollo). **Depende de** `territorio-ficha`, `territorios-modelo` y `navegacion-rail` en `main`. Pide tiles a `tile.openstreetmap.org` desde el navegador (sin claves).
