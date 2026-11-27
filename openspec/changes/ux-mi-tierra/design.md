# Design

Estilo según `ux-base`. Referencias: pantalla principal de Rainbow (saldo grande, acciones, lista de activos) y lista de posiciones de Uniswap. **Nunca** se muestra un rendimiento, un APY ni una ganancia: la visión del 23-nov dice "Rendimiento anual (APY) → Nunca".

## 1. Encabezado

- Etiqueta "Pagado de tu lote" (o "de tus lotes" si hay más de uno) en 13 px `muted`.
- Número en JetBrains Mono 40 px (32 px en el celular), `tabular-nums`, con la moneda de la app. Sale de los totales que ya calcula `mi-tierra-cliente.tsx`; no se escribe a mano.
- `BarraAvance` con el porcentaje pagado y el texto "30 % de USD 15.000 · cuota 6 de 24" (valores reales de la simulación de la persona). Nunca solo la barra: siempre el número al lado.
- Un `ChipEstado` con el estado del lote (reservado, en cuotas, escriturado si existiera).

## 2. Acciones

Fila de hasta tres `Boton` (`principal` el primero, `secundario` el resto), solo con destinos que ya existen: la ficha del lote, la acción de pago simulado de la ficha si está disponible para esa compra, y el ancla a Actividad. Si una acción no aplica (no hay cuota pendiente), no se muestra.

## 3. Posiciones

- `ul` de filas, separadas por una línea `line`, sin caja por fila. Cada fila: ícono en un cuadrado `surface-2` de 32 px con radio `--radius-s`, nombre (Inter Tight 16 px), detalle (13 px `muted`), valor a la derecha en mono.
- Lote: "Lote 535 · 1.867 m² · reservado" → "6/24 cuotas".
- FARO: "FARO · del bien común" → número acreditado, o "sin dato" con la explicación actual si falta el primer pago. Una mini curva SVG de acreditación acumulada solo si hay 2 o más acreditaciones; si no, nada.
- Tu voz: estado de adhesión al manifiesto y de la decisión 5 (texto que ya existe), con el enlace a leer y adherir.
- Cada fila con destino es un enlace de toda la fila.

## 4. Actividad

`TablaLibro` con 8 filas visibles y un `details` "Ver toda la actividad (N movimientos)". Filtro por tipo (pago, reserva, FARO) con pastillas `aria-pressed`. Fechas en mono chico. En el celular, cada fila en dos líneas (motivo arriba, fecha y monto abajo) para que no haga scroll horizontal.

## 5. Estado vacío

`EstadoVacio` con dibujo SVG (un lote con su cerco y un brote, colores `ilus-*` de Participa, cambia con el tema), título "Todavía no reservaste un lote", texto "Cuando reserves uno en la simulación, acá vas a ver lo pagado, tus cuotas, tus FARO y tu actividad.", acción "Explorar los lotes" (→ `/explorar/lotes`) y vista previa: el encabezado y dos filas de posiciones con datos de ejemplo marcados "ejemplo", atenuados y con `aria-hidden` salvo la etiqueta "Así se va a ver". La sección Tu voz se queda debajo como hoy.

## 6. Tema oscuro

En oscuro: número en `ink`, barra con la escala `regen-*` del tema oscuro, filas sobre `bg` con líneas `line`. Nada de verde menta en bloques: el verde de acento solo en la acción principal.

## 7. Accesibilidad

El número principal tiene una etiqueta asociada (no solo visual). axe sin violaciones con y sin lote, en claro y oscuro, a 390 y 1440 px.
