# Proposal

## Why

En la revisión del 24-nov-2026 (PR #207) Gus pidió:
- que el destino que hoy se llama "Explorar" (la portada, `/`) se llame **Inicio**;
- un destino nuevo **Explorar** en el menú izquierdo que **una en una sola sección** lo que hoy son tres subsecciones: Territorio (`/territorios/lighthouse`), Barrios (`/barrios/norte`) y Lotes (`/lotes`);
- que esa sección use como **base de diseño la vista Barrio Norte** (foto del valle a sangre, título encima, sello, números en paneles de vidrio, indicadores con chip);
- que Comunidades salga de Explorar y pase a un destino nuevo, **Participa** (lo construye el cambio 3).

Es el **segundo de cuatro cambios de corrección**. Depende de `rediseno-colores-de-antes`.

## What Changes

- **Menú (`lib/navegacion.ts`):** el destino `/` pasa a llamarse **Inicio** y solo se marca en `/`. Destinos principales, en este orden: Inicio, Explorar, Participa, Bien común, Invertir, Sumarte, Mi tierra. Participa se declara con `existe: false` (aparece sola cuando el cambio 3 cree su página).
- **Página nueva `/explorar`**, pública y bilingüe, con el diseño de Barrio Norte:
  - héroe con la foto del valle a sangre, título "Explorar Lighthouse" (o el que dé el glosario), sello "Prototipo interno · datos de ejemplo" y "venta simulada · aprobación municipal pendiente";
  - una barra de secciones pegajosa dentro de la página (Territorio, Barrio Norte, Lotes) con anclas `#territorio`, `#barrio`, `#lotes`, que marca la sección visible;
  - **Territorio:** el mapa del Macrolote 7 con sus capas y los avisos de loteo (lo que hoy muestra `/territorios/lighthouse`), en un panel de vidrio;
  - **Barrio Norte:** los lotes por estado, lo que va al bien común y el panel de la obra con sesión (lo que hoy muestra `/barrios/norte`);
  - **Lotes:** la lista de lotes con su filtro y el enlace a cada ficha (lo que hoy muestra `/lotes`).
- **Las URL viejas siguen andando:** `/territorios/lighthouse`, `/barrios/norte` y `/lotes` redirigen a `/explorar#territorio`, `/explorar#barrio` y `/explorar#lotes`, conservando los parámetros del mapa (`vista`, `fase`, `sel`). Las fichas `/lotes/[id]` y `/lotes/hibrido` quedan como están, y marcan Explorar en el menú.
- **Se va la subnavegación de Explorar** (`components/subnav-explorar.tsx`) de Territorio, Lotes y Comunidades.

## Fuera de alcance

- Participa y el mapa de equipos (cambio 3), el manifiesto 2050 (cambio 4).
- Cambiar los números, los textos legales o la lógica de reservas.
- Otros territorios distintos de Lighthouse (`/territorios/[id]` para otro id sigue igual).

## Capabilities

### New Capabilities
- `explorar-unificado`: una sola sección Explorar con Territorio, Barrio Norte y Lotes, y el destino Inicio.

## Impact

- **Cambia:** `lib/navegacion.ts` (+ test), `lib/idioma/textos/marco.ts` (Inicio, Explorar, Participa), `app/territorios/[id]/layout.tsx`, `app/lotes/layout.tsx`, `app/tribus/layout.tsx` (sin subnav), `next.config` o `middleware`/páginas con `redirect()` para las URL viejas, `lib/rutas-publicas` (o donde viva la lista de rutas públicas).
- **Nuevo:** `app/explorar/page.tsx` y sus componentes (reusan los de territorio, barrio y lotes; no se duplica lógica), `e2e/explorar.spec.ts`.
- **Tests:** `e2e/marco.spec.ts`, `e2e/accesibilidad.spec.ts`, `e2e/barrio-norte.spec.ts`, `e2e/lotes*.spec.ts`, `e2e/territorio*.spec.ts`, `e2e/descubrir-publico.spec.ts` y los que naveguen por la subnav.
- **Sin** tablas, migraciones, datos personales ni dependencias nuevas.
