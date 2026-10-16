# Proposal

## Why

US-02 de la nota 15 (It.1 "Explorar", prioridad M) pide un mapa con **capas activables**. Hoy el mapa del Macrolote 7 (`/territorios/lighthouse`) dibuja todo junto: los doce barrios con sus tribus y el terreno común, el contorno y las 57 fincas de Chacras de Soluna, y los lugares de interés. La leyenda explica los tres grupos pero no deja prender ni apagar ninguno.

Eso pesa en dos usos concretos:
- **Mostrar el Lighthouse solo** (las tribus y el terreno común) sin las fincas de Soluna al lado: es lo que conviene en una charla sobre comunidades y lo que pide la prudencia con la Ordenanza 173 (R23) mientras el loteo sigue en trámite.
- **Mirar las fincas** sin los sellos de los barrios encima, que en el zoom de Soluna tapan los polígonos.

Las capas que necesitan el GIS de Martín (ribera, zonas de protección y de producción, masterplan; backlog L4) quedan afuera: este cambio usa solo los tres grupos que ya existen, y deja el lugar listo para sumar las que vengan.

No repite propuestas abiertas ni cerradas (`territorio-avances` y `territorio-bienes-comunes` tocan la ficha, no el mapa).

## What Changes

- **Cada grupo de la leyenda lleva una casilla "Mostrar"** con el nombre del grupo: *Lighthouse · Macrolote 7* (contorno del macrolote, barrios, terreno común y sus sellos), *Chacras de Soluna* (contorno y fincas) y *Lugares de interés*. Todas marcadas al entrar.
- **Desmarcar un grupo lo saca del mapa**: sus polígonos y sus sellos desaparecen y los sellos dejan de recibir foco de teclado. Las zonas de contexto de BioPueblo y la imagen satelital quedan siempre.
- **La selección respeta las capas**: si lo elegido queda en un grupo oculto, se deselecciona y la ficha vuelve al resumen. Si se elige desde la lista "Elegir en el mapa" algo de un grupo oculto, el grupo se vuelve a mostrar y queda elegido (la lista sigue completa: es la alternativa de teclado).
- **Enlace compartible**: los grupos ocultos quedan en la URL (`?ocultar=soluna`), igual que la selección (`?sel=`). Así se puede pasar un enlace del Lighthouse sin las fincas de Soluna. Si el enlace pide elegir algo de un grupo oculto, gana la selección y ese grupo se muestra.
- **Con todo oculto**, un aviso: "No hay capas a la vista. Marcá alguna en la leyenda."
- **El aviso del estado administrativo del loteo (C1) y las notas del mapa siguen visibles** aunque se oculte Soluna.
- Textos en español y en inglés (catálogo del territorio).

### Fuera de alcance

- Capas nuevas que dependen del GIS de Martín (ribera, zonas, masterplan, 3D) y capas por estado (solo fincas disponibles, solo tribus activas).
- Guardar la elección de capas en la persona o en el navegador más allá de la URL.
- Cambiar los colores, los estilos o la leyenda de cada grupo.
- Otros mapas (el del Congreso).

## Capabilities

### New Capabilities
- `territorio-capas`: mostrar y ocultar los grupos del mapa del territorio, con la selección, el enlace y la accesibilidad coherentes con lo que se ve.

### Modified Capabilities

## Impact

- Archivos nuevos: `lib/territorios/capas.ts` (+ test).
- Archivos que cambian: `app/territorios/[id]/vitrina-territorio.tsx` (casillas, estado, URL), `app/territorios/[id]/mapa-leaflet.tsx` y `mapa-cliente.tsx` (grupos de capas que se agregan o se sacan), `lib/idioma/textos/territorio.ts`, `e2e/territorio-mapa.spec.ts`, `e2e/accesibilidad.spec.ts`.
- **Depende de `idioma-tribus-territorio`** (PR #92, de esta noche): ese cambio mueve los textos de la vitrina y de la leyenda al catálogo `lib/idioma/textos/territorio.ts`. Se implementa después de que esté en `dev`.
- No toca tablas, migraciones, integraciones externas, permisos, pagos ni datos personales: no necesita revisión del arquitecto.
