# Design

Estilo según `ux-base`. Referencias: portada de Airbnb (una imagen fuerte y una sola acción), franjas de cifras de Stripe.

## 1. Orden de la página

1. Héroe a sangre (foto del valle, título, bajada, "Explorar el territorio" principal y "Elegí cómo sumarte" secundario).
2. Franja Agua · Trabajo · Comunidad.
3. Tres caminos por público.
4. Cifras del sitio (franja de borde a borde).
5. Los cinco capitales.
6. Aviso "Argentina, un lugar seguro y abierto".
7. Leyenda de la imagen ("Imagen ilustrativa de la Zona A… no es una fotografía ni un plano").

Los caminos suben antes de las cifras porque responden "qué hago acá".

## 2. Héroe

- Ocupa el ancho completo de la columna principal (sin `max-w`), alto mínimo 520 px en compu y 440 px en el celular, nunca `100vh`.
- Degradado de `bg` al 0 % (arriba) a `bg` al 92 % (abajo); el texto va abajo a la izquierda, `max-w` de 40rem. Contraste AA del texto sobre el punto más claro del degradado (se mide en un test con el color resultante).
- Volanta "Lighthouse VRN · Río Negro, Argentina" en Inter Tight (no mono), título Fraunces 56/64 px en compu y 36/40 px en el celular.
- "Imagen ilustrativa" como chip arriba a la derecha.

## 3. Franjas

- Pilares: tres columnas en compu, una debajo de otra en el celular; ícono SVG de línea de 40 px (agua: gota con curvas de nivel; trabajo: brote con herramienta; comunidad: fogón), título en Fraunces 20 px y el texto actual.
- Cifras: fondo `surface-2` de borde a borde, tres números en mono 40 px con su unidad, la frase en Inter Tight y la fuente en 13 px `muted`. Los números salen de donde salen hoy (no se escriben en el componente).
- Capitales: ícono + nombre + línea; en el celular fila con scroll horizontal y `scroll-snap`, con indicación visual de que hay más (la última tarjeta asoma).

## 4. Caminos

Tres tarjetas iguales en estructura pero distintas en contenido (esto sí es una lista de opciones): pregunta en Fraunces ("¿Dónde viviría y cuánto cuesta?", "¿Qué financio y cómo me devuelven?", "¿Qué es de todos y quién decide?"), una línea, un dibujo chico arriba y la acción. Toda la tarjeta es un enlace. Textos nuevos en es y en en `lib/idioma/textos/portada.ts`, con el inglés marcado para revisión nativa como el resto.

## 5. Accesibilidad

Un solo `h1` (el del héroe). Los dibujos son `aria-hidden`. axe sin violaciones en claro y oscuro a 390 y 1440 px.
