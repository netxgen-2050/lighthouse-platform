# Design

Estilo según `ux-base`; hoja según `ux-celular`. Referencia: documentación de Stripe (índice fijo, secciones con aire, texto cómodo).

## 1. Disposición

- Compu (≥ 1024 px): grilla `14rem minmax(0, 1fr)`; a la izquierda `IndicePagina` con `position: sticky`; a la derecha el contenido con un ancho de lectura de 68 caracteres como máximo para el texto corrido (las tablas y el diagrama pueden ocupar todo el ancho de la columna).
- Celular: el contenido a ancho completo y, debajo del título, un `Boton` secundario "En esta página" que abre una `Hoja` con el índice.

## 2. Índice

`IndicePagina` recibe `{ id, titulo }[]`, renderiza un `nav` con `aria-label` "En esta página" y enlaces a los anclas. Marca la sección visible con `aria-current="location"`, negrita y una barra de 2 px (no solo color), usando `IntersectionObserver`. Con movimiento reducido el salto es instantáneo. Reutilizable por otras páginas largas (Visión 2050).

## 3. Secciones

- Abiertas: En una frase, Dos carriles y tres puentes, Los tres puentes, Las tres puertas para tener FARO, Qué da FARO / Qué no tiene FARO (lado a lado en compu).
- Plegadas (`details`/`summary`, con el `h2` dentro del `summary`): La política de FARO, Lo que hay que decidir, Qué cambió, Inspirado en Elinor Ostrom, Las parcelas comunes, NFT del lote, Preguntas para el abogado. El `summary` muestra el título y una línea que resume ("6 reglas propuestas, cada una con su origen"). Abrir desde el índice despliega la sección.
- Los números de la sección "Los números del barrio" (con sesión) no cambian.

## 4. Cajas

Una sola capa: las tarjetas de carriles, puentes, puertas y reglas usan fondo `surface`, radio `--radius-m`, sin borde o con borde `line` (no ambas cosas) y nunca contienen otra caja con borde. Las etiquetas "idea" / "abierta" de las tablas pasan a `ChipEstado`.

## 5. Tablas en el celular

Decisiones y Ostrom: debajo de 640 px, cada fila es un bloque de dos líneas (pregunta o principio en negrita arriba, recomendación o "cómo lo tomaríamos" abajo, estado como chip). En compu siguen siendo tablas.

## 6. Accesibilidad

Un solo `h1`; los `h2` siguen en orden aunque estén dentro de `summary`. axe sin violaciones con las secciones abiertas y cerradas, claro y oscuro, a 390 y 1440 px.
