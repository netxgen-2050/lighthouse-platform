# Design

Estilo según `ux-base`; hoja según `ux-celular`. Referencia: búsqueda de Airbnb (lista + mapa).

## 0. Base

La rama arranca de `agente/ux-celular` y **antes de empezar** incorpora `origin/agente/explorar-paginas` (PR #218) con `git merge`. Si #218 ya está en `dev`, no hace falta. Las rutas son las de #218.

## 1. `/explorar/lotes` en compu (≥ 1024 px)

- Grilla `minmax(0, 5fr) minmax(0, 7fr)`. Izquierda: encabezado de la página, bloque legal agrupado, filtros y tarjetas en una columna (dos columnas de tarjetas desde 1280 px). Derecha: `MapaLotes` con `position: sticky; top: alto de la barra superior + cinta; height: calc(100dvh - eso)`, radio `--radius-l`.
- Entre 768 y 1023 px: el mapa arriba (60 dvh) y la lista debajo.

## 2. `/explorar/lotes` en el celular (< 768 px)

- `MapaLotes` ocupa el alto disponible entre la barra superior y la barra inferior.
- `Hoja` variante `persistente`: en reposo muestra el asa, "25 lotes · 22 disponibles" (los números salen del loteo, no se escriben) y el filtro; arrastrada muestra las tarjetas con scroll. Un botón "Ver lista" / "Ver mapa" hace lo mismo sin arrastrar (accesible por teclado y lector).
- El bloque legal va arriba de la lista dentro de la hoja, antes de las tarjetas, y también es lo primero que anuncia el lector al abrir la página (región antes del mapa en el orden del DOM).

## 3. Tarjeta de lote

- `article` con `aria-labelledby` al número. Contenido: `PlanoLote` (SVG 64×64 con el polígono del lote normalizado desde el loteo, trazo `deep`, relleno `green-soft`; `aria-hidden`), "Lote 535" en Fraunces 18 px, "1.867 m²" en mono, `ChipEstado` con el estado en texto, y "desde USD … · ejemplo" solo si el modelo tiene precio para ese lote. Toda la tarjeta es el enlace a la ficha (un solo `Link` que la envuelve, sin enlaces anidados).
- Hover y foco: `--sombra-2` y el lote resaltado en el mapa. Seleccionada (por el mapa): borde 2 px `deep` y `aria-current="true"`.
- Fondo `surface`, radio `--radius-m`, `--sombra-1`. Es el único objeto con caja de la lista.

## 4. Mapa de lotes

- `MapaLotes` reutiliza el mapa Leaflet y la capa "Lotes · sector norte" que hoy usa `VitrinaTerritorio`; no duplica lógica de capas ni de datos.
- Colores por estado como hoy, más un patrón o borde distinto por estado (rayado para reservado, cruz para vendido) para no depender del color, y la leyenda compacta debajo.
- Al elegir un lote: se resalta, se centra si quedó afuera y aparece una tarjeta flotante chica sobre el mapa con número, m², estado y "Ver el lote". La lista hace scroll hasta su tarjeta.
- Con teclado: los polígonos no son tabulables uno por uno (25 paradas es demasiado); la selección se hace desde la lista y el mapa refleja. El mapa tiene `aria-label` y un texto alternativo que dice cuántos lotes hay por estado.

## 5. Filtro y orden

Pastillas `Disponible`, `Reservado`, `Vendido` (selección múltiple, `aria-pressed`) y un `select` de orden (número, superficie de menor a mayor y de mayor a menor). Se reflejan en la URL (`?estado=disponible&orden=superficie`) para poder compartir; los parámetros del mapa (`vista`, `fase`, `sel`) se conservan como en #218.

## 6. Territorio

- `VitrinaTerritorio` ocupa todo el ancho de la columna (sin el panel lateral angosto que comprimía el mapa en compu: la ficha lateral pasa abajo del mapa en `< 1280 px` y queda al costado solo desde 1280).
- La lista de pastillas de lotes ("Elegir en el mapa · Lotes del sector norte") se reemplaza por un `Boton` secundario "Ver los N lotes" a `/explorar/lotes` (N sale del loteo).
- La leyenda pasa a una fila de chips con ícono debajo del mapa; "Ver la leyenda completa" la despliega.

## 7. Ficha del lote

- Arriba: `PlanoLote` grande (o la imagen del lote si existe) y el título.
- Fila de `Indicador`: superficie, estado, precio de ejemplo, "en cuotas" (o "sin dato").
- El aviso compacto de estado administrativo del proyecto del lote, con el estilo de `ux-base`, sobre la acción principal.
- Acción principal de la ficha (la que ya existe en `compra-cliente.tsx`) fija abajo en el celular, encima de la barra inferior, con `Boton` principal.
- "Qué es tuyo y qué es de todos" y la tabla de rubros: `Seccion` desplegable (`details`) abierta en compu y cerrada en el celular.

## 8. Héroe

`HeroeValle`: el contenido va directo sobre la foto con un degradado del `bg` al 0 % arriba al 90 % abajo; se saca la caja translúcida. El alto se ajusta al contenido (sin `100vh`). La leyenda "Imagen ilustrativa" se queda.

## 9. Accesibilidad

axe sin violaciones en las tres páginas y en la ficha, en claro y oscuro, a 390 y 1440 px, con la hoja en reposo y abierta. Ningún estado del lote se comunica solo con color (chip con texto y patrón en el mapa).
