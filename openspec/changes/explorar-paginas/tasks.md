# Tasks

Pedido de Gus del 25-nov-2026, después de mergear el PR #213. Una noche. Rama `agente/explorar-paginas` desde `dev`. Conviene correrlo **antes** de `lotes-en-la-base` (design §6).

## 1. Rutas y destinos

- [x] 1.1 `lib/explorar/destino.ts`: `RUTA_SECCION` y `urlExplorar` sin ancla (design §3). **Verifica:** `pnpm test lib/explorar` en verde con los casos nuevos.
- [x] 1.2 `lib/sesion/rutas-publicas.ts`: las tres rutas públicas (design §5). `lib/navegacion.test.ts`: `destinoActivo` da Explorar en las tres. **Verifica:** `pnpm test lib/sesion lib/navegacion` en verde.

## 2. Páginas

- [x] 2.1 `app/explorar/layout.tsx` con el héroe y `components/explorar/pestanas-explorar.tsx` (design §2), con su test de `aria-current="page"`. Borrar `components/explorar/barra-secciones.tsx`. **Verifica:** `pnpm test components/explorar` en verde.
- [x] 2.2 `app/explorar/territorio/page.tsx`, `app/explorar/barrio-norte/page.tsx` y `app/explorar/lotes/page.tsx`: mover cada sección de `app/explorar/page.tsx` tal cual, cada una con su `generateMetadata` y sus textos en es/en en `lib/idioma/textos/explorar.ts`. **Verifica:** `pnpm build` en verde; `lib/lotes/sin-numeros-escritos.test.ts` vigila los archivos nuevos.
- [x] 2.3 `app/explorar/page.tsx` con `RedirigirExplorar` (design §4). **Verifica:** e2e de `/explorar` y `/explorar#lotes` (tarea 4.1).

## 3. Inicio y enlaces

- [x] 3.1 `app/page.tsx` y `lib/idioma/textos/portada.ts`: el botón "Explorar el territorio" / "Explore the territory" a `/explorar/territorio`. `lib/portada.ts`: caminos a las rutas nuevas (design §5). **Verifica:** `pnpm test lib/portada` en verde.
- [x] 3.2 Cambiar todos los `/explorar#…` por la ruta nueva (`rg '/explorar#'` sin resultados en `app`, `components` ni `lib`) y el "Ver los lotes" de Barrio Norte por un `Link` a `/explorar/lotes`. **Verifica:** `pnpm verificar` en verde.

## 4. E2E

- [x] 4.1 Reescribir `e2e/explorar.spec.ts` según design §7. **Verifica:** en verde.
- [x] 4.2 Adaptar los e2e que usaban `/explorar#…` o la barra de anclas, sin cambiar lo que prueban. Sumar las tres rutas a `e2e/accesibilidad.spec.ts` en los dos temas. **Verifica:** `pnpm test:e2e` completo en verde.

## 5. Cierre

- [x] 5.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate explorar-paginas --strict` pasa.
