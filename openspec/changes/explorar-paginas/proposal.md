# Proposal

## Why

Gus revisó el rediseño ya mergeado en `dev` (PR #213) el 25-nov-2026 y pidió dos ajustes:
- En Inicio (`/`), el botón principal **"Ver los lotes"** pasa a decir **"Explorar el territorio"** y lleva al territorio.
- En Explorar, las tres subsecciones (Territorio, Barrio Norte y Lotes) **están bien**, pero **cada una tiene que tener su propia página**. Hoy están las tres apiladas en `/explorar`, con una barra de anclas.

El contenido, el diseño (base Barrio Norte, de `explorar-unificado`) y los números no cambian. Cambia cómo se reparten en páginas.

## What Changes

- **Inicio:** el botón principal del héroe dice "Explorar el territorio" ("Explore the territory") y apunta a `/explorar/territorio`. El botón "Elegí cómo sumarte" y las tarjetas de "Por dónde empezar" quedan como están, salvo sus enlaces, que pasan a las URL nuevas.
- **Tres páginas en lugar de una:**
  - `/explorar/territorio`: el mapa del Macrolote 7, sus capas, el estado administrativo y los bienes comunes (hoy, sección `#territorio`).
  - `/explorar/barrio-norte`: los lotes por estado, lo que va al bien común y el panel de la obra con sesión (hoy, sección `#barrio`).
  - `/explorar/lotes`: el resumen del loteo y la lista de lotes con enlace a cada ficha (hoy, sección `#lotes`).
- **Layout común de Explorar** (`app/explorar/layout.tsx`): el héroe de Barrio Norte y, debajo, **pestañas** (Territorio · Barrio Norte · Lotes) que son enlaces entre páginas, con `aria-current="page"`. Reemplaza la barra de anclas con IntersectionObserver.
- **`/explorar`** redirige a `/explorar/territorio`: tocar Explorar en el menú abre la primera pestaña.
- **URL viejas:**
  - `/territorios/lighthouse`, `/barrios/norte` y `/lotes` redirigen a su página nueva. Conservan `vista`, `fase` y `sel`.
  - Los enlaces con ancla de ayer (`/explorar#lotes`, etc.) llevan a la pestaña correcta.
  - `/lotes/[id]` y `/lotes/hibrido` siguen en su URL.
- **Enlaces internos** (portada, Sumarte, fichas de lotes, Mi tierra, Comunidades, Congreso, perfil, pasaporte) apuntan directo a la página nueva, sin ancla.

## Fuera de alcance

- Cambiar los textos, los números, el diseño de cada sección o la lógica de reservas.
- Las decisiones abiertas de #209 a #212: paleta, ⚖ en "A acordar en un pacto", carteles del mapa, cabecera de Visión.
- `lotes-en-la-base` (PR #214): toca `ListaLotes` y los hooks de reservas, no las páginas. Ver `design.md` §6.

## Reglas de producto

- Sigue la excepción del prototipo interno (R14) y la fase 1 (nota 22): lotes y precios de ejemplo para `lighthouse-norte`, con el sello "Prototipo interno · datos de ejemplo".
- La aprobación municipal nunca se muestra como otorgada.
- El dato que falta se muestra como "sin dato".
- Nada se comunica solo con color: la pestaña actual también va subrayada y en negrita.
