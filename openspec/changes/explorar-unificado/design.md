# Design

## Contexto

- `/barrios/norte` (`app/barrios/norte/page.tsx`, `lib/barrios/norte.ts`) es la base visual: héroe con foto a sangre, sello, indicadores con chip, paneles de vidrio, panel de la obra solo con sesión.
- `/territorios/[id]` tiene el mapa (Leaflet, `mapa-cliente.tsx`, capas en `capas.ts`, vistas en `vistas/`), la ficha lateral y los avisos de loteo.
- `/lotes` tiene `lista-lotes.tsx` y su layout; `/lotes/[id]` y `/lotes/hibrido` son fichas.

## Decisiones

### 1. Una página, tres secciones
`app/explorar/page.tsx` arma las tres secciones **reusando** los componentes existentes: no se copia la lógica del mapa ni de la lista. Si un componente vive dentro de `app/territorios/[id]/` o `app/lotes/`, se mueve a `components/explorar/` (o se importa desde donde está) sin cambiar su comportamiento. El orden es Territorio → Barrio Norte → Lotes: primero el lugar, después el barrio, después los lotes.

### 2. Diseño
- Héroe igual al de Barrio Norte (foto `lighthouse-valle.webp` a sangre dentro del contenido, `alt=""`, leyenda "Imagen ilustrativa", título encima, degradado con tokens para el contraste). Un solo héroe para toda la página: las secciones de abajo no repiten la foto.
- Barra de secciones pegajosa debajo del héroe: tres enlaces de ancla con `aria-current="location"` en la sección visible (IntersectionObserver; sin JS, las anclas igual funcionan). Altura táctil de 44 px.
- Cada sección abre con su título (h2), una línea de explicación y su contenido en `PanelVidrio`; los indicadores usan `Indicador` y `ChipEstado`.
- El mapa se carga solo en el navegador (como hoy) y tiene un alto fijo para que la página no salte.

### 3. URL viejas
`/territorios/lighthouse`, `/barrios/norte` y `/lotes` hacen `redirect()` (307 en dev, permanente no hace falta) a `/explorar` con el ancla correspondiente, y pasan los parámetros `vista`, `fase` y `sel` al mapa de `/explorar`. Los enlaces internos de la app (portada, Comunidades, fichas, Mi tierra, Invertir) se actualizan para apuntar directo a `/explorar#…`.

### 4. Menú
- `DESTINOS`: `/` con clave `inicio` (sin `secciones`); `/explorar` con clave `explorar` y `secciones: ["/explorar", "/territorios", "/barrios", "/lotes"]`; `/participa` con clave `participa`, `existe: false`. El grupo `explorar` (subnavegación) desaparece.
- Íconos: Inicio `House`, Explorar `Telescope`, Participa `UsersRound` (lucide).
- Glosario es/en: Inicio / Home, Explorar / Explore, Participa / Take part.
