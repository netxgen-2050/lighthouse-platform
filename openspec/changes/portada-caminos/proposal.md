# Proposal

## Why

La demo de la It.1 "Explorar" (roadmap técnico, nota Desarrollo/06) es el recorrido de Lucía y Lucas **desde la portada hasta el perfil** sobre un preview real. Con los cambios de esta noche ya existen las piezas (`/territorios/lighthouse`, `/tribus`, `/perfil`, `/congreso`, `/compromisos`), pero la portada todavía tiene un solo botón a `/tribus` y el encabezado no lleva ni al perfil ni al Congreso. La historia US-01 (nota 15) pide que quien llega desde un link entienda en 10 segundos qué hay y elija entre **tres caminos**: explorar el territorio, encontrar su tribu o ir al Congreso. El mock-up v6 (`V.inicio`) ya los dibuja.

## What Changes

- En la portada (`/`), debajo del titular y del botón "Ver las tribus" (que se mantienen como están), una sección "Por dónde empezar" con **tres caminos** del mock-up v6, cada uno un enlace con etiqueta, título y una línea de descripción:
  - "Descubrir" · **Explorar el Lighthouse** → `/territorios/lighthouse`.
  - "Encontrarse" · **Encontrar mi tribu** → `/perfil`.
  - "Encontrarse en persona" · **Congreso · Feb 2027** → `/congreso`.
- Las descripciones salen del mock-up **sin cifras sueltas**: la cantidad de barrios se calcula de los datos de `lib/territorios/` en vez de escribirse a mano, y no se muestra la superficie ("~1.000 ha").
- Dos enlaces nuevos en el encabezado global: "Perfil" → `/perfil` y "Congreso" → `/congreso`, con `aria-current="page"` en su ruta.
- Un test e2e de la portada que recorre los tres caminos con teclado.

**Fuera de alcance:**
- **Plata e inversión:** el texto del héroe del mock-up ("…con quienes vale la pena invertir…", "antes de comprometer capital") **no** se copia; el subtítulo actual se mantiene. Ver preguntas abiertas.
- **Textos legales:** el ⚖ `salida` del mock-up ("podés salir cuando quieras") no está en `lib/legal/terminos.ts` y **no** se agrega.
- **Lotes:** ni "Lote 7" ni "Lote 7A" ni Chacras de Soluna aparecen en la portada. Por eso no lleva el banner de la Ordenanza 173.
- **Nodos del corredor** (Valle del Río Negro, San Martín de los Andes, Atlántico Sur): `territorios-modelo` decidió no cargar territorios sin datos; mostrarlos depende de una decisión (ver preguntas abiertas).
- Preselección del camino por UTM de HubSpot (US-01, segundo criterio): va con la integración de HubSpot.
- La tarjeta de persona de ejemplo ("Estás viendo la plataforma como…"): es el cambio `personas-ejemplo`.

## Capabilities

### New Capabilities
- `portada-caminos`: los tres caminos de entrada de la portada y los enlaces del encabezado a perfil y Congreso.

### Modified Capabilities

## Impact

`app/page.tsx`, `components/encabezado.tsx`, `e2e/portada.spec.ts`. **Depende de** que estén en `main`: `navegacion-base`, `territorios-modelo`, `territorio-ficha`, `perfil-entrevista` y `congreso-registro` (hoy en la rama de integración del 7-oct). Sin dependencias npm nuevas, sin variables de entorno.
