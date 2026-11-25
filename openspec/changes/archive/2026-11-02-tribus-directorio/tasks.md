## 1. Datos

- [x] 1.1 Crear `lib/tribus/tipos.ts` y `lib/tribus/datos.ts` con las 12 tribus copiadas de `TRIBES` en `docs/referencia/netx-tribus-mockup-v6.html`, solo con los campos de design.md, y las funciones `listarTribus()` (orden por barrio) y `buscarTribu(id)`. Verificar con `lib/tribus/datos.test.ts` (Vitest): son 12, ids únicos, barrios 1..12 sin repetir, ninguna vacante tiene `declaracion` ni `pozo`.

## 2. Término legal

- [x] 2.1 Crear `lib/legal/terminos.ts` con `ritual` y `personeria` copiados textualmente del objeto `LEGAL` del mock-up, y `components/termino-legal.tsx` según design.md. Verificar con `pnpm typecheck` y con un test de Vitest que compare los textos con los del mock-up.

## 3. Páginas

- [x] 3.1 Crear `app/tribus/page.tsx` (listado) según la spec `directorio-tribus`. Verificar en `pnpm dev`: 12 tarjetas en orden y el estado escrito.
- [x] 3.2 Crear `app/tribus/[id]/page.tsx` (tribu activa o en formación, y barrio vacante) con `generateStaticParams` y `dynamicParams = false`, más `app/tribus/[id]/not-found.tsx`. Verificar en `pnpm dev` con `valle`, `avelan`, `grano` y `no-existe`.
- [x] 3.3 Reemplazar la home de create-next-app por una portada mínima con un enlace "Ver las tribus" a `/tribus`. Verificar en `pnpm dev`.
- [x] 3.4 Escribir `e2e/tribus.spec.ts` (Playwright) con los escenarios de las dos specs (listado, valle, avelan, grano, 404, ⚖ con teclado, sin "USD" ni "avales"). Verificar con `pnpm test:e2e` contra `pnpm start` local.

## 4. Integración

- [x] 4.1 `pnpm verificar` y `pnpm build` en verde; abrir el PR con el guion de prueba manual en la descripción.
