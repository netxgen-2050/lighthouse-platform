## 1. Catálogo legal

- [x] 1.1 Agregar `ticket`, `presencia` y `obra` a `lib/legal/terminos.ts`, copiados textualmente de `LEGAL` en `docs/referencia/netx-tribus-mockup-v6.html`, y actualizar `lib/legal/terminos.test.ts` para las cinco claves. Verificar con `pnpm test`.

## 2. Lógica del ticket

- [x] 2.1 Crear `lib/congreso/ticket.ts` con `normalizarCodigo` y `esCodigoValido` (formato `LH27-XXXX-XX`) y `lib/congreso/ticket.test.ts` con casos válidos, inválidos y en minúsculas. Verificar con `pnpm test`.

## 3. Página

- [x] 3.1 Crear `app/congreso/page.tsx` (agenda, explicaciones, ⚖) y un componente cliente para el registro del ticket con `localStorage`, el aviso de modo demostración y el error accesible. Verificar en `pnpm dev`.
- [x] 3.2 Escribir `e2e/congreso.spec.ts` con todos los escenarios de la spec (agenda, sin USD, código válido + recarga, inválido, quitar). Verificar con `pnpm test:e2e`.

## 4. Integración

- [x] 4.1 `pnpm verificar` y `pnpm build` en verde; PR con guion de prueba manual. No tocar `app/layout.tsx` ni la portada.

## 5. Correcciones (7-oct, encontradas en la integración del 6-oct)

- [ ] 5.1 Traer `main` a la rama: `git fetch origin` y `git merge --no-edit origin/main`. En los conflictos, conservar lo de `main` (marco visual de navegacion-base, permisos) y adaptar lo de esta rama. Verificar con `pnpm verificar`.
- [ ] 5.2 Reemplazar todos los colores sueltos de `app/congreso/**` y `components/` de esta rama por los tokens del tema (lo exige el test "sin colores sueltos" que llegó con `main`) y quitar el `<main>` propio de `/congreso`: el layout ya trae `<main id="contenido">`. Verificar con `pnpm verificar` y `pnpm test:e2e` (incluidos `e2e/marco.spec.ts` y `e2e/congreso.spec.ts`).
