# Tasks

Segundo de los cuatro cambios de corrección (24-nov-2026). Requiere `rediseno-colores-de-antes`.

## 1. Menú

- [ ] 1.1 `lib/navegacion.ts` según `design.md` §4 (Inicio, Explorar, Participa con `existe: false`, sin grupo `explorar`) y glosario es/en en `lib/idioma/textos/marco.ts`. **Verifica:** `pnpm test lib/navegacion lib/idioma` en verde, con `destinoActivo("/")` Inicio, `destinoActivo("/lotes/x")` Explorar, `destinoActivo("/explorar")` Explorar.
- [ ] 1.2 Quitar `components/subnav-explorar.tsx` y su uso en los layouts de territorio, lotes y tribus. **Verifica:** `pnpm build` en verde.

## 2. Página Explorar

- [ ] 2.1 `app/explorar/page.tsx` con héroe de Barrio Norte, barra de secciones y las tres secciones reusando los componentes existentes (`design.md` §1–2); ruta pública y traducida. **Verifica:** `pnpm build` en verde; `lib/lotes/sin-numeros-escritos.test.ts` vigila los archivos nuevos.
- [ ] 2.2 Redirecciones de las URL viejas con los parámetros del mapa, y enlaces internos apuntando a `/explorar#…` (`design.md` §3). **Verifica:** test de unidad de la función que arma la URL de destino.

## 3. E2E

- [ ] 3.1 `e2e/explorar.spec.ts`: héroe y sello, tres secciones en orden, barra de secciones (salto y `aria-current`), panel de la obra solo con sesión, redirecciones (con `vista`/`sel`), `/lotes/hibrido` sin redirección, inglés, 390 px sin scroll horizontal. **Verifica:** en verde.
- [ ] 3.2 Adaptar los e2e que usaban `/territorios/lighthouse`, `/barrios/norte`, `/lotes` o la subnavegación, sin cambiar lo que prueban; axe en `/explorar` en los dos temas. **Verifica:** `pnpm test:e2e` completo en verde.

## 4. Cierre

- [ ] 4.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate explorar-unificado --strict` pasa.
