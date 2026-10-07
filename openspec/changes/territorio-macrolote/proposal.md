# Proposal

## Why

Gus aclaró el territorio (7-oct-2026): el protagonista de la sección es el **Macrolote 7 del Lighthouse** (~993 ha), donde viven las 12 comunidades; **Chacras de Soluna** es el loteo vecino, donde algunos lotes se venden a privados y NetX actúa como **agencia** (la plataforma es una vitrina; gran parte del funnel de venta pasará fuera de ella). Hoy la ficha del territorio muestra barrios con geometría inventada y un listado completo de tribus que no hace falta ahí.

La geometría nueva ya existe: `docs/referencia/biopueblo-territorios.geojson`, generada por `NS_platform/Documentation/datos/generar_territorios.py` desde el KMZ de BioPueblo.

## What Changes

- **Mapa protagonista** en `/territorios/lighthouse`, con imagen satelital de fondo, centrado en el Macrolote 7, con estas capas de `biopueblo-territorios.geojson`:
  - **Macrolote 7** (contorno destacado).
  - **12 barrios** (uno por tribu), coloreados por estado de la tribu (activa, en formación, vacante) con el estado también en texto. Distribución **aleatoria e ilustrativa**, avisada en pantalla, hasta el masterplan de Martín.
  - **Terreno común** del Lighthouse.
  - **Chacras de Soluna**: contorno, las 175 fincas con su estado (disponible, reservada, cantera) y los 5 lugares de interés.
  - Los demás macrolotes de BioPueblo, apagados, como contexto.
- **Ficha a la derecha del mapa** (debajo en el celular), que cambia según lo que se elija:
  - **Sin selección:** resumen del Lighthouse y el **panel de tribus** con tres números: Activas, En formación, Vacantes. Se **quita** el listado completo de tribus de esta página.
  - **Un barrio:** la tribu de ese barrio (sello, nombre, foco, estado, hogares, lo que busca) y el botón **"Conocer la tribu"** → `/tribus/<id>`. Un barrio vacante muestra "Barrio N busca tribu".
  - **El terreno común:** qué es, superficie, para qué se usa (ejemplo) y quién lo cuida.
  - **Una finca de Soluna:** número, superficie, estado y, si está disponible, **"Consultar por este lote"** (simulado), con la aclaración de que NetX actúa como agencia y la compra es privada entre las partes (⚖ borrador `agencia`).
  - **Un lugar de interés:** su nombre y una línea de descripción.
- **Elegir sin mouse:** una lista "Elegir en el mapa" (barrios, común, fincas disponibles) sincronizada con el mapa, para teclado y lector de pantalla.
- Leyenda de colores con texto.

**Fuera de alcance:** el modelo 3D y las capas GIS del masterplan (cuando Martín lo exporte), distribución optimizada de barrios, el funnel real de venta de lotes, otros territorios.

## Capabilities

### New Capabilities
- `territorio-macrolote`: el mapa del Macrolote 7 con barrios, común y Soluna, y la ficha lateral de cada elemento.

### Modified Capabilities

## Impact

`app/territorios/[id]/` (página y componentes del mapa y la ficha), `lib/territorios/` (lectura y tipos del GeoJSON, conteos por estado; la geometría ilustrativa anterior se reemplaza), `lib/legal/terminos.ts` (clave `agencia`, borrador), `e2e/territorio*.spec.ts`. Fondo satelital con teselas públicas (Esri World Imagery) y su atribución visible.
