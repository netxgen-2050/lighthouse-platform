# Design

## Context

La ficha `/territorios/[id]` es un Server Component estático (`generateStaticParams`). Leaflet toca `window` al importarse, así que no puede renderizarse en el servidor. El mock-up v6 usa Leaflet 1.9.4 con tiles de OpenStreetMap embebidos en base64 y dibuja el Lighthouse con coordenadas inventadas (`LH_POLY`, `barrioRect(i)`, `COMMONS_RECT`, en `[lng, lat]`).

## Goals / Non-Goals

**Goals:** mapa ilustrativo del Lighthouse con los 12 barrios enlazados a su tribu; accesible con teclado; datos separados de la pantalla para cambiarlos por el GIS real.

**Non-Goals:** capa de Soluna, zoom multinivel, capas temáticas, panel lateral.

## Decisions

1. **Leaflet "a mano", sin `react-leaflet`.** Un componente cliente (`"use client"`) crea el mapa en un `useEffect` con `import("leaflet")` dinámico y lo destruye al desmontar (`map.remove()`). La ficha lo carga con `next/dynamic` y `ssr: false`. Motivo: una sola dependencia, control total de los atributos de accesibilidad y sin depender del ciclo de versiones de `react-leaflet` con React 19. Alternativa descartada: un SVG propio sin Leaflet (más simple, pero el roadmap pide Leaflet y el GIS va a llegar como GeoJSON con mapa base).
2. **Geometría como datos** en `lib/territorios/geometria.ts`: `GEOMETRIAS: Record<territorioId, { ilustrativa: true; contorno; nucleo; barrios: Record<1..12, Poligono> }>`, con las coordenadas copiadas del mock-up (incluido el cálculo de `barrioRect`, resuelto a números). Una función `geometriaDe(id)` devuelve `undefined` si no hay datos, y la ficha muestra "Mapa: sin dato".
3. **Sellos como marcadores `L.divIcon` con `keyboard: true`.** Leaflet los hace enfocables y dispara `click` con Enter. Se le agrega `role="link"` y `aria-label` al elemento del marcador después de crearlo (`marker.getElement()`), y el `click` hace `router.push('/tribus/<id>')`. Los polígonos son `interactive: false` (no reciben foco: la única forma de interactuar es el sello). El sello de un barrio vacante muestra "+" y tiene borde punteado (forma, no solo color).
4. **Colores con tokens.** Los polígonos se crean con `className` (`mapa-contorno`, `mapa-nucleo`, `mapa-barrio`) y en `app/globals.css` se les asigna `stroke`/`fill` con `var(--deep)`, `var(--green-soft)`, etc. Nada de hex en los componentes (lo vigila `lib/sin-colores-sueltos.test.ts`). El CSS de Leaflet se importa en el componente cliente (`leaflet/dist/leaflet.css`).
5. **Mapa base de OpenStreetMap en vivo** (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`) con atribución, como el mock-up. Para un prototipo interno con poco tráfico respeta la política de uso de OSM. Los tests no dependen de que las imágenes carguen.
6. **Vista fija:** `fitBounds` al contorno del Lighthouse, zoom con botones y rueda permitido, sin arrastrar fuera de un margen (`maxBounds`).

## Risks / Trade-offs

- [axe sobre controles de Leaflet] → los botones de zoom ya traen `aria-label`; si axe marca algo de Leaflet, se corrige con atributos, no ocultando el mapa.
- [Tiles de OSM no disponibles o bloqueados] → el mapa sigue usable (escenario de la spec); se prueba en e2e bloqueando `tile.openstreetmap.org` con `page.route`.
- [Coordenadas inventadas] → la nota de datos ilustrativos es obligatoria y la geometría lleva `ilustrativa: true`.
