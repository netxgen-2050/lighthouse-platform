# Design

## Contexto

`lib/navegacion.ts` es la única lista de destinos (`DESTINOS`), con `grupo`, `existe` (vigilado por `lib/navegacion.test.ts` contra `app/`) y `oculto`. El rail (`components/rail.tsx`, `rail-enlaces.tsx`) dibuja `GRUPOS_RAIL` con títulos. `esActivo()` marca una sección por prefijo de ruta.

## Decisiones

### 1. Grupos nuevos en la lista única
`IdGrupo` pasa a `"principal" | "explorar" | "persona" | "interno" | "pausa"`:

| Destino | href | grupo | existe | oculto |
|---|---|---|---|---|
| Explorar | `/` | principal | sí | — |
| Bien común | `/bien-comun` | principal | sí | — |
| Invertir | `/invertir` | principal | **no** (lo pasa a sí el cambio 5) | — |
| Sumarte | `/sumarte` | principal | sí | — |
| Mi tierra | `/mi-tierra` | principal | **no** (cambio 4) | — |
| Territorio | `/territorios/lighthouse` | explorar | sí | — |
| Barrios | `/barrios/norte` | explorar | **no** (cambio 3) | — |
| Lotes | `/lotes` | explorar | sí | — |
| Comunidades | `/tribus` | explorar | sí | — |
| Pactos, Semillas, Fogón, Compromisos, Congreso | igual que hoy | pausa | sí | sí |
| Perfil, Pasaporte, Mi recorrido, Configuración, Mis datos | igual | persona | sí | — |
| NetX, Admin | igual | interno | sí | — |

Así el test de `existe` sigue mandando: cada cambio que crea una página pone `existe: true` y el destino aparece solo. La clave `inicio` del glosario se mantiene para el título de la portada; el destino del menú usa la clave nueva `explorar`.

### 2. Explorar activo por varias rutas
Un campo opcional `secciones?: readonly string[]` en `Destino` (para Explorar: `["/territorios", "/barrios", "/lotes", "/tribus"]`) y una función `destinoActivo(ruta)` que devuelve el destino principal marcado, o ninguno. `esActivo` no cambia para el resto.

### 3. Menú del celular
Corte en `md` (768 px) de Tailwind. Debajo: el rail se oculta (`hidden md:flex`) y `components/menu-celular.tsx` (cliente) pone un botón "Menú" en la barra superior, con `aria-expanded` y `aria-controls`, que abre un panel debajo de la barra con los destinos principales. Sin trampa de foco (no es un diálogo modal): Escape cierra y devuelve el foco; elegir un destino cierra. Respeta `data-movimiento="reducido"`. El contenido deja de tener el margen izquierdo del rail en celular.

### 4. Subnavegación de Explorar
`components/subnav-explorar.tsx`: `nav` con `aria-label` "Explorar", pestañas como enlaces (no `role="tablist"`: son páginas distintas). Se incluye en el layout de cada sección (`app/territorios/[id]/`, `app/lotes/`, `app/tribus/` y luego `app/barrios/`) con un `layout.tsx` por sección, o al tope de cada `page.tsx` si la sección no tiene layout. A 390 px se desplaza dentro de su propio contenedor si no entra.

### 5. Lo que se borra
Nada de páginas. Se borran solo `GRUPOS_RAIL`, `tituloDeGrupo` y los textos de grupos del rail si quedan sin uso; el estado "deshabilitado sin cuenta" de Participar se va con el grupo.

## Riesgos

- **E2E que navegan por el rail** a Pactos, Fogón o Semillas: se cambian a `page.goto()` directo.
- **Rail más angosto** con nombres más largos en inglés ("Commons", "My land"): se prueban los dos idiomas a 768 px.
