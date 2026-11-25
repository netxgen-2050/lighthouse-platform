# Design

## Contexto

En `dev` (desde el PR #213), `app/explorar/page.tsx` arma las tres secciones en una sola página. Las secciones son Territorio (`#territorio`), Barrio Norte (`#barrio`) y Lotes (`#lotes`). Arriba de las secciones van el héroe (`HeroeValle`) y la barra de anclas (`components/explorar/barra-secciones.tsx`). `lib/explorar/destino.ts` arma las URL (`urlExplorar`) para las redirecciones de `/territorios/lighthouse`, `/barrios/norte` y `/lotes`.

## Decisiones

### 1. Rutas

| Página | URL | Contenido (se mueve tal cual desde `app/explorar/page.tsx`) |
|---|---|---|
| Territorio | `/explorar/territorio` | intro, ubicación, superficie, `AvisoEjemplo`, los tres `EstadoAdministrativo`, `VitrinaTerritorio` (mapa) y bienes comunes |
| Barrio Norte | `/explorar/barrio-norte` | lotes por estado (`ChipEstado` + `Indicador`), bien común con ⚖ expensas, `PanelObraBarrio` (solo con sesión) |
| Lotes | `/explorar/lotes` | `MarcaLoteo`, resúmenes del loteo, enlaces a híbrido y bien común, `ListaLotes`, y (agregado al implementar) los `EstadoAdministrativo` de `lighthouse-primeros` y `lighthouse-norte`, porque toda vista con lotes los lleva (`lib/legal/vistas-con-lotes.ts`) |

- `/explorar` lleva a `/explorar/territorio` con `RedirigirExplorar`, un componente cliente (ver §4), porque el servidor no ve el `#`. Territorio va primero por dos motivos: es el orden de lectura del diseño (primero el lugar) y es a donde manda el botón nuevo de Inicio.
- Cada página exporta su `generateMetadata`, con título propio ("Territorio · Explorar", "Barrio Norte · Explorar", "Lotes · Explorar", en los dos idiomas).
- Los slugs quedan en español, como el resto de la app (`/bien-comun`, `/mi-tierra`).

### 2. Layout común

`app/explorar/layout.tsx` (servidor):
- `HeroeValle` con el sello `venta`, el sobretítulo, el título "Explorar Lighthouse" y la bajada (los textos `explorar` de hoy).
  - El h1 es el del héroe.
  - Cada página abre con su h2 (el título de la sección), igual que hoy.
  - El héroe se queda al cambiar de pestaña, porque los layouts de Next no se vuelven a montar.
- Debajo, `PestanasExplorar` (`components/explorar/pestanas-explorar.tsx`, cliente porque usa `usePathname`):
  - un `<nav aria-label="Secciones de Explorar">` con tres `<Link>`, y `aria-current="page"` en la pestaña de la ruta actual;
  - es pegajosa (`sticky top-12`), mide 44 px o más de alto y se desliza en horizontal en celular, como la barra de hoy;
  - la pestaña actual se marca con borde inferior, negrita y color, nunca solo con color;
  - no usa IntersectionObserver ni anclas.
- `components/explorar/barra-secciones.tsx` se borra junto con su test, porque ya nadie la usa.
- El contenedor `max-w-5xl` con su padding va en el layout; cada página pone solo su `<section>`.

### 3. Destinos y URL (`lib/explorar/destino.ts`)

- `SECCIONES_EXPLORAR` sigue con los ids `territorio`, `barrio` y `lotes`. Se agrega `RUTA_SECCION: Record<SeccionExplorar, string>` con `/explorar/territorio`, `/explorar/barrio-norte` y `/explorar/lotes`.
- `urlExplorar(seccion, entrada)` devuelve la ruta de la sección y conserva `vista`, `fase` y `sel`, **sin ancla**. Los parámetros del mapa solo tienen sentido en territorio, pero se conservan siempre (no hacen daño y la función queda simple).
- Las redirecciones de `/territorios/lighthouse`, `/barrios/norte` y `/lotes` siguen usando `urlExplorar`, sin cambios en las páginas que redirigen.

### 4. Anclas de ayer (`/explorar#lotes`)

El servidor no ve el `#`. Por eso, si `/explorar` redirigiera directo a territorio, `/explorar#lotes` terminaría en `/explorar/territorio#lotes`. Cómo se resuelve:
- `app/explorar/page.tsx` deja de ser solo un `redirect` y pasa a renderizar `RedirigirExplorar`, un componente cliente mínimo:
  - lee `window.location.hash`;
  - si el hash es una sección conocida (`territorio`, `barrio` o `lotes`), hace `router.replace` a su ruta y conserva la query;
  - si no hay hash o no es conocido, hace `router.replace("/explorar/territorio")`, con la query.
- Mientras redirige muestra el héroe, porque el layout ya está, y un texto "Abriendo Explorar…" con un enlace a Territorio. Así, sin JavaScript igual se puede seguir.
- Esto es para enlaces guardados o compartidos de un día (los de `dev` desde el 24-nov). Green no los tiene. Si a Gus le parece innecesario, se reemplaza por un `redirect` de servidor sin cambiar nada más.

### 5. Inicio y enlaces internos

- `app/page.tsx`: el botón principal usa `t.explorarTerritorio` ("Explorar el territorio" / "Explore the territory") y `href="/explorar/territorio"`. `t.verLotes` se borra de `lib/idioma/textos/portada.ts` si queda sin uso.
- `lib/portada.ts`: los caminos apuntan a `/explorar/lotes` y `/explorar/territorio`. Sus títulos no cambian.
- Todo `href` que hoy diga `/explorar#territorio`, `/explorar#barrio` o `/explorar#lotes` pasa a la ruta nueva (buscarlos con `rg '/explorar#'`):
  - archivos de app: `app/sumarte/sumarte-cliente.tsx`, `app/lotes/[id]/*`, `app/lotes/hibrido/page.tsx`, `app/mi-tierra/mi-tierra-cliente.tsx`, `app/tribus/[id]/acciones.tsx`, `app/congreso/*`, `app/perfil/perfil-cliente.tsx`, `app/participa/page.tsx`;
  - `lib/pasaporte/sellos.ts`;
  - el enlace "Ver los lotes" de Barrio Norte (`<a href="#lotes">`), que pasa a `<Link href="/explorar/lotes">`.
- `lib/navegacion.ts`: el destino Explorar sigue con `secciones: ["/explorar", "/territorios", "/barrios", "/lotes"]`. `/explorar/*` ya entra por prefijo. Hay que confirmarlo con el test de `destinoActivo("/explorar/lotes")`.
- `lib/sesion/rutas-publicas.ts`: se cambia `/^\/explorar$/` por `/^\/explorar(\/(territorio|barrio-norte|lotes))?$/`. El panel de la obra sigue pidiendo sesión dentro de la página.

### 6. Convivencia con otros cambios

- **`lotes-en-la-base` (PR #214, spec sin implementar):** adapta `ListaLotes`, `useCompras` y las fichas, no `app/explorar/*`. Si las dos implementaciones corren a la vez, el único roce posible es un import en `app/explorar/lotes/page.tsx`, y se resuelve al integrar. **Conviene correr este cambio primero** porque es chico (≈1 noche), y que `lotes-en-la-base` salga de `dev` después.
- **`billeteras-candide-prueba` (PR #106):** no toca nada de esto.
- **`explorar-unificado`:** sigue en `openspec/changes/`, sin archivar. Este cambio reemplaza sus requisitos "Sección Explorar unificada", "Barra de secciones" y "URL viejas" (en el destino). Al archivar, se archiva primero `explorar-unificado` y después este. Sus requisitos de menú (Inicio, orden) siguen valiendo.

### 7. Pruebas

- Unidad:
  - `lib/explorar/destino.test.ts`: rutas sin ancla, parámetros conservados y repetidos;
  - `lib/navegacion.test.ts`: `destinoActivo` en las tres rutas;
  - `lib/sesion/rutas-publicas.test.ts`;
  - `lib/portada.test.ts`.
- `components/explorar/pestanas-explorar.test.tsx`: `aria-current="page"` según la ruta.
- e2e (`e2e/explorar.spec.ts` reescrito):
  - cada una de las tres URL muestra su h2 y no los de las otras dos;
  - las pestañas navegan y marcan;
  - `/explorar` lleva a territorio;
  - `/explorar#lotes` lleva a lotes;
  - redirecciones viejas con `vista` y `sel`;
  - panel de la obra solo con sesión en barrio-norte;
  - el botón de Inicio dice "Explorar el territorio" y lleva a territorio, en es y en;
  - a 390 px no hay scroll horizontal;
  - axe en las tres páginas, en los dos temas.
- Adaptar sin cambiar lo que prueban: `e2e/portada`, `lotes`, `barrio-norte`, `territorio`, `territorio-mapa`, `mi-tierra`, `sumarte`, `tribus`, `congreso`, `congreso-en` y `accesibilidad` (la lista de rutas).
