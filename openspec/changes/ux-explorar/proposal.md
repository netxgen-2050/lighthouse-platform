# Proposal

## Why

La auditoría UX del 25-nov-2026 (hallazgo H4) midió Explorar en 8.150 px de alto en el celular: la lista de los 25 lotes aparece dos veces (como pastillas bajo el mapa y otra vez en "Todos los lotes"), el mapa ocupa unos 480 px de 1440 y la leyenda es casi tan larga como el mapa. Quien quiere vivir viene a mirar lotes en el mapa y hoy tiene que bajar mucho y comparar en una lista de texto.

Gus eligió la dirección **B · Territorio vivo** (25-nov-2026), que toma el patrón de Airbnb: lista y mapa juntos, el mapa fijo en compu y una hoja deslizable sobre el mapa en el celular. Tercer cambio de la serie `ux-*`. Va apilado sobre `ux-celular` y **sobre `explorar-paginas` (PR #218)**, que ya separa Explorar en tres páginas: `/explorar/territorio`, `/explorar/barrio-norte` y `/explorar/lotes`.

## What Changes

- **`/explorar/lotes` pasa a ser lista + mapa:**
  - en compu, dos columnas: a la izquierda tarjetas de lote con scroll; a la derecha el mapa de los lotes, fijo (`sticky`) a toda la altura;
  - en el celular, el mapa ocupa la pantalla y la lista va en una hoja `persistente` (de `ux-celular`) que muestra "25 lotes · 22 disponibles" y sube al arrastrar;
  - tocar una tarjeta resalta el lote en el mapa y tocar un lote del mapa resalta y lleva a su tarjeta; ambas cosas también con el teclado.
- **Tarjeta de lote** (`components/explorar/tarjeta-lote.tsx`): plano chico del lote (su polígono dibujado en SVG desde el loteo), número, m², estado con `ChipEstado` (texto, no solo color) y el precio de ejemplo cuando existe; enlace a la ficha.
- **Filtro** por estado (Disponible, Reservado, Vendido) y orden por superficie, como pastillas arriba de la lista.
- **`/explorar/territorio`**: el mapa gana ancho (ocupa todo el ancho de la columna); la pared de pastillas de lotes de "Elegir en el mapa" se reemplaza por un enlace "Ver los 25 lotes" a `/explorar/lotes`; la leyenda pasa a una fila compacta debajo del mapa que se despliega.
- **`/explorar/barrio-norte`**: las cifras por estado y "Lo que va al bien común" según `ux-base` (secciones con aire, `Indicador` en un solo panel, sin cajas dentro de cajas).
- **Ficha del lote (`/lotes/[id]`)**: arriba el plano grande del lote y la foto/dibujo; abajo los datos clave en una fila de `Indicador`; la acción principal ("Reservar en la simulación" o la que ya exista) queda fija abajo en el celular; las tablas largas en secciones que se despliegan.
- **Héroe de Explorar**: el título va directo sobre la foto con un degradado para que se lea (sin la caja translúcida).
- Los avisos de estado administrativo usan el bloque agrupado de `ux-base`, antes del mapa y de la lista, con su texto completo.

## Fuera de alcance

- Cambiar números, textos legales, el loteo o la lógica de reservas (`app/lotes/[id]/compra-cliente.tsx` y los hooks de compras no cambian su comportamiento).
- Las capas del mapa del territorio y sus datos.
- Otros territorios distintos de Lighthouse.

## Capabilities

### New Capabilities
- `ux-explorar`: Explorar con lista y mapa, tarjetas de lote, filtro, territorio con mapa ancho y ficha del lote rehecha.

## Impact

- **Cambia:** `app/explorar/layout.tsx`, `app/explorar/{territorio,barrio-norte,lotes}/page.tsx`, `app/lotes/lista-lotes.tsx`, `app/lotes/[id]/page.tsx` y `ficha-cliente.tsx` (solo presentación), `app/territorios/[id]/vistas/lotes.tsx` (pastillas), `components/explorar/heroe-valle.tsx`.
- **Nuevo:** `components/explorar/tarjeta-lote.tsx`, `components/explorar/mapa-lotes.tsx` (envuelve el mapa Leaflet existente con la capa de lotes), `components/explorar/plano-lote.tsx`, tests.
- **Tests:** `e2e/explorar.spec.ts`, `e2e/lotes*.spec.ts`, `e2e/barrio-norte.spec.ts`, `e2e/estado-administrativo.spec.ts`, `e2e/accesibilidad.spec.ts`, `e2e/territorio*.spec.ts`.
- **Sin** tablas, migraciones, datos personales ni dependencias nuevas (Leaflet ya está).
