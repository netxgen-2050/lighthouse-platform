# Design

Estilo según `ux-base`; patrón de filas y actividad según `ux-mi-tierra`. Referencia: página de un pool en Uniswap (TVL grande, estadísticas secundarias, pestañas de gráfico y transacciones). Nunca se muestra un rendimiento anual (la visión del 23-nov lo prohíbe): solo plazo y forma de devolución.

## 1. Encabezado

- `h2` con el nombre del barrio y `ChipEstado` al lado.
- Número principal: la meta de la obra (`Indicador` grande, mono 40 px), etiqueta "Meta de la obra (infraestructura)".
- Fila de tres `Indicador` chicos (mono 20 px): lo juntado (o "sin dato" en `muted`, sin negrita), el mes en que se terminaría de devolver, la parte de cada pago que va al común.
- Debajo, el `Aviso` legal único: "Propuesta v0.1 en discusión · no es una oferta" con los ⚖ que hoy llevan esas etiquetas.

## 2. Pestañas

`Pestanas` de panel (`role="tablist"`). La elegida se refleja en la URL (`?ver=curva`) para poder compartirla; por defecto "Cómo funciona". En compu la curva ocupa el ancho de la columna principal (`max-w-5xl`); en el celular, el ancho de la pantalla menos el margen, con las etiquetas de los ejes legibles (13 px como mínimo).

## 3. Libro

`TablaLibro` con paginación simple: 8 filas, `details` "Ver todo el libro (N movimientos)", filtro por motivo con pastillas `aria-pressed`. En el celular cada fila en dos líneas, como en `ux-mi-tierra`. La nota al pie ("Movimientos por trimestre… no hay fechas de calendario") se queda.

## 4. Prima objetivo

Pasa a un punto de "Cómo funciona": "Prima objetivo del Token Inversor: 10 % (objetivo · ejemplo · en discusión, no es una promesa). Cálculo de ejemplo: sim/barrio_stack_sim.py v0.1." El número sale de donde sale hoy.

## 5. Sin sesión

`EstadoVacio` con un dibujo del barrio (calles y lotes en el estilo del mapa de Participa), el texto de hoy y la acción "Sumate para ver el barrio". Sin ningún monto en el HTML (lo verifica el e2e de hoy).

## 6. Accesibilidad

axe sin violaciones en cada pestaña, con y sin sesión, claro y oscuro, a 390 y 1440 px. Flechas izquierda y derecha mueven entre pestañas.
