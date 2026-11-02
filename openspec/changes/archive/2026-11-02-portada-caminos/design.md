# Design

## Context

La portada actual (`app/page.tsx`) es un Server Component con titular y un botón a `/tribus`. El encabezado (`components/encabezado.tsx`) es un componente cliente con un arreglo `enlaces`. En la rama de integración del 7-oct el arreglo ya tiene Inicio, Territorio, Tribus y Compromisos. El mock-up v6 dibuja los caminos en `V.inicio` (sección `.paths`, tres `button.path` con `eyebrow`, `h3` y una línea `muted`).

## Goals / Non-Goals

**Goals:**
- Que la portada lleve a los tres módulos de la It.1 en un paso.
- Que perfil y Congreso sean alcanzables desde cualquier página.

**Non-Goals:**
- Cambiar el titular o el subtítulo actuales.
- Nodos del corredor, UTM, tarjeta de persona, textos legales nuevos.

## Decisions

- **Enlaces, no botones:** cada camino es un `<Link>` de Next que envuelve etiqueta, título (`<h3>` dentro de una sección con `<h2>` "Por dónde empezar") y descripción. Así el nombre accesible incluye el título y funciona sin JavaScript.
- **Datos de los caminos en un arreglo local** de `app/page.tsx` (`{ etiqueta, titulo, descripcion, href }`), para que el test los recorra en el mismo orden.
- **Descripciones** (adaptadas del mock-up, sin cifras escritas a mano):
  - Explorar el Lighthouse: "`<N>` barrios y las tribus que los están formando.", con `N` = `tribusDeTerritorio("lighthouse").length` (de `lib/territorios/`). Si la función no devuelve datos, la descripción es "Los barrios y las tribus que los están formando." (sin número, nunca 0).
  - Encontrar mi tribu: "Una conversación de 5 minutos para armar tu perfil." (el mock-up promete "tres tribus sugeridas, con el porqué", pero la sugerencia todavía no existe: no se promete).
  - Congreso · Feb 2027: "Visita al Lighthouse, encuentros de tribus y mingas."
- **Estilo:** grilla de 1 columna en móvil y 3 en `sm:`; tarjetas con `bg-surface`, `border-line`, `text-ink`, `text-muted`; foco con `focus-visible:outline-2 focus-visible:outline-deep`. Solo tokens del tema; prohibidos `stone-*`, `emerald-*`, `amber-*` y hex sueltos.
- **Encabezado:** se agregan `{ href: "/perfil", texto: "Perfil" }` y `{ href: "/congreso", texto: "Congreso" }` al final del arreglo `enlaces`. La función `activo` existente ya resuelve `aria-current`.

## Risks / Trade-offs

- [El encabezado queda con 6 enlaces y se apretuja en móvil] → el `ul` ya usa `flex-wrap` en el contenedor; si no alcanza, se agrega `flex-wrap` al `ul`. Un menú plegable queda fuera (ver preguntas abiertas).
- [Si alguna de las rutas no está en `main`, los caminos dan 404] → la tarea 0.1 frena el cambio si falta alguna.
- [El número de barrios depende de los datos de ejemplo] → la portada ya muestra datos de ejemplo en otras páginas; si se considera necesario, se agrega `AvisoEjemplo` (decisión de Gus).
