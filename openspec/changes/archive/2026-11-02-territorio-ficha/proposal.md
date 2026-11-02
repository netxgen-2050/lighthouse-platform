# Proposal

## Why

El primer paso del recorrido de Lucía y Lucas (It.1 "Explorar", US-04 de la nota 15) es entender **dónde** está el proyecto y **qué** hay ahí antes de buscar tribu. Hoy la plataforma salta de la portada directo al directorio de tribus. El mapa Leaflet depende del GIS de Martín/ARQVA, que todavía no llegó; mientras tanto, una **ficha del territorio sin mapa** ya permite recorrer "territorio → barrios → tribu" en el preview real.

## What Changes

- Página `/territorios/[id]` (en la práctica, `/territorios/lighthouse`) con: título, ubicación y descripción del territorio; superficie (o "sin dato"); resumen de tribus activas, en formación y vacantes; la grilla de los **12 barrios** con su tribu, foco y estado (en texto, no solo color), cada uno con enlace a `/tribus/[id]`; y la lista de **bienes comunes por nombre**.
- Aviso de datos de ejemplo (`AvisoEjemplo`).
- Enlace "Territorio" en la navegación global, apuntando a `/territorios/lighthouse`.
- La página usa **solo los tokens de color del tema** y **no** agrega un `<main>` propio (el layout ya aporta `<main id="contenido">`).

**Fuera de alcance:**
- **Mapa** (Leaflet, GeoJSON, KMZ): va en un cambio aparte cuando llegue el GIS.
- **Lotes**: ni Chacras de Soluna, ni fincas, ni el selector Lighthouse/Soluna del mock-up, ni referencias a lotes o al Lote 7. Por eso esta página no lleva el banner de la Ordenanza 173 (ver preguntas abiertas).
- **Plata y horas**: los bienes comunes se muestran **sin** las barras de "Plata" y "Horas de trabajo" del mock-up y sin el enlace al espejo.
- **Textos legales nuevos**: no se agregan términos ⚖ al catálogo. Las frases del mock-up que dependen de ⚖ que aún no están en `lib/legal/terminos.ts` ("licencias de uso", "Guardianes de la tierra", "Pacto de convivencia", "La tierra no se vende") **no** se muestran en esta versión.
- Índice `/territorios` con varios territorios (hoy hay uno solo).

## Capabilities

### New Capabilities
- `territorio-ficha`: la ficha pública de un territorio con sus barrios, tribus y bienes comunes.

### Modified Capabilities

## Impact

`app/territorios/[id]/` (página y `not-found`), una línea en el encabezado global (`components/encabezado.tsx`), `e2e/territorio.spec.ts`. **Depende de** `territorios-modelo` (funciones de `lib/territorios/`) y de `navegacion-base` (tokens del tema y encabezado). Sin dependencias npm nuevas.
