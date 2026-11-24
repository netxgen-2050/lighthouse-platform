# Design

## 1. Dirección de arte

Ilustración de mapa **caricaturizada, cálida y artesanal**, en la línea de los mapas ilustrados de parques y festivales actuales: vista cenital levemente inclinada (2.5D, sin perspectiva fuerte), bordes redondeados, trazo orgánico de grosor variable, sombras suaves proyectadas hacia el sudeste, una textura de papel muy sutil (filtro `feTurbulence` con opacidad baja) y pocos colores bien elegidos. Nada de clip-art ni de íconos genéricos: cada forma se dibuja a mano en SVG.

- **Paleta de la ilustración:** tokens propios `--color-ilus-*` definidos en `app/globals.css` para los dos temas, derivados de la paleta de la app (la de antes del rediseño): agua (azules verdosos), monte nativo (verdes oliva y salvia), barda y meseta (ocres, arena, arcilla), acentos (dorado del fuego, amarillo del sol). Máximo ~12 tonos.
- **Tema claro = mediodía**, **tema oscuro = noche de luna**: mismo dibujo, otros valores de token; en oscuro el faro y el fogón emiten un halo de luz (gradiente radial), las ventanas se encienden y el agua refleja la luna.
- **Tipografía en el mapa:** las etiquetas de cada equipo en Fraunces (la de los títulos), sobre una "banderita" o cartel de madera dibujado, siempre legibles (contraste AA contra su fondo).

## 2. El territorio (fondo del mapa)

Dibujado de norte (arriba) a sur, fiel a `NS_permacultura` (memoria del 3-nov de Martín y perfil del sitio):
1. **Río Negro** arriba, ancho, con reflejos; en la orilla, **bosque ribereño** de sauce criollo y la **costanera pública**.
2. **Planicie aluvial (zona A)**: chacras en damero, **hileras de vid y olivo**, **cortinas rompevientos** de álamos en líneas NO–SE.
3. **Barda (zona B)**: escalón ocre con cárcavas, jarilla y alpataco agarrando el suelo.
4. **Mesetas (zonas C y D)** abajo: estepa arena con matas dispersas, alguna granja solar.
5. **El cañadón** cruzando de sur a norte como **corredor verde** (diques de piedra, medias lunas) que desemboca en el **humedal-plaza** junto al río.

Nada de esto lleva datos ni medidas: es una ilustración. Lleva la marca visible "Ilustración · no es un plano".

## 3. Los nueve equipos como formas de permacultura

Cada círculo del común (`lib/gobernanza/datos.ts`) es una forma ubicada donde tendría sentido en el territorio:

| Equipo (id) | Forma | Dónde | Detalle animado al hover |
|---|---|---|---|
| Permacultura y regeneración (`permacultura`) | **Bosque comestible en curvas de nivel**: anillos de copas de árboles frutales siguiendo la pendiente | Planicie, al pie de la barda | las copas se mecen |
| Agua (`agua`) | **Laguna de infiltración** con medias lunas y un dique de piedra | Desembocadura del cañadón | ondas concéntricas en el agua |
| Legal (`legal`) | **Cortina rompevientos** que abraza una chacra (protege) | Borde oeste de la planicie | las hojas tiemblan con el viento |
| Tokenomics y Semillas (`token`) | **Vivero y banco de semillas**: invernadero de arco con bancales | Planicie, junto a las chacras | brotan dos hojitas en los bancales |
| Marketing y comunicación (`marketing`) | **El faro** en el borde de la barda ("una luz en el borde del desierto") | Borde de la barda, mirando al río | el haz de luz gira |
| Cuidado y conflictos (`cuidado`) | **Plaza natural del humedal**: bancos en ronda bajo un sauce | Junto al humedal | el sauce se mece y aparecen dos personitas |
| Tecnología (`plataforma`) | **Granja solar** en una chacra, con paneles inclinados al norte | Meseta baja | destello que recorre los paneles |
| Gestión de contratistas (`contratistas`) | **Centro agroindustrial**: galpón con carretilla y pila de compost | Planicie, cerca del acceso | la carretilla avanza un poco |
| Gobernanza (`gobernanza`) | **El fogón**: ronda de piedras con fuego (el círculo original del Fogón) | Centro del mapa, en el corredor verde | el fuego titila |

(Si los ids reales difieren, se usan los de `CIRCULOS_DEL_COMUN`; si se suma o quita un círculo, el mapa muestra una forma genérica de "parcela nueva" y el test lo avisa.)

## 4. Interacción

- Cada forma es un `<a>` o `<button>` dentro del SVG (`role="button"`, `tabindex="0"`, `aria-label` con el nombre del equipo y la cantidad de posiciones abiertas), con su etiqueta de texto siempre visible.
- **Hover y foco (iguales):** la forma se eleva (translateY −4 px y sombra más larga), escala 1.04, aparece un contorno de luz con el color del acento, se activa su detalle animado (tabla §3) y el resto del mapa baja levemente su saturación. Un globo muestra "Nombre · N posiciones abiertas".
- **Clic, Enter o Espacio:** abre el detalle. La URL suma `?equipo=<id>` para poder compartirlo (y abrir directo).
- **Movimiento reducido:** con `prefers-reduced-motion` o "Reducir animaciones" en Configuración (`data-movimiento="reducido"`) no hay animaciones: solo contorno y etiqueta.
- **Celular:** el mapa entra entero a 390 px (se puede ampliar con dos dedos o con botones + / −); tocar una forma abre la hoja inferior. Debajo, la lista de equipos como botones grandes.
- Nada se comunica solo con color: cada forma tiene etiqueta y el número de posiciones va en texto.

## 5. Detalle del equipo

`<dialog>` nativo (foco atrapado, Escape cierra, el foco vuelve a la forma), panel lateral de 420 px en computadora y hoja inferior en celular. Contenido:
1. La forma del equipo en grande (la misma ilustración) y su nombre.
2. "Decide sobre" (de `circulo.decide`).
3. "Frentes de trabajo" de hoy (los de `listarEquipos`).
4. **"Posiciones abiertas"**: tarjetas con título, dedicación (por ejemplo "4–6 h por semana"), qué buscamos (2–3 puntos), modalidad ("a acordar en un pacto", "voluntariado", "a definir") y la marca "Ejemplo · a definir". Entre 2 y 4 por equipo.
5. "Quiero sumarme" (`SumarmeEquipo`, con sus estados de sesión, capacidad y adhesión).

**Copia:** sin "token", sin "inversión", sin prometer pago, sueldo ni prioridad. Las posiciones no son ofertas de empleo.

## 6. Datos de ejemplo

`lib/equipos/posiciones.ts`: `POSICIONES: Record<idCirculo, Posicion[]>` con textos `{ es, en }`. Ejemplos a modo de guía (el implementador completa todos, 2–4 por equipo): Agua → "Diseño de diques y medias lunas", "Monitoreo de napa y caudales"; Permacultura → "Vivero de nativas (jarilla, alpataco, chañar)", "Diseño de agroforestería en curvas de nivel"; Comunicación → "Relato y fotografía del territorio", "Bienvenida a quien llega"; Tecnología → "Desarrollo de la plataforma", "Privacidad y datos"; Gobernanza → "Facilitación de rondas", "Cuidado del manifiesto"; Legal → "Estatuto del común (con estudio externo)", "Contratos de pactos". Test: todo equipo tiene entre 2 y 4 posiciones con textos en los dos idiomas.
