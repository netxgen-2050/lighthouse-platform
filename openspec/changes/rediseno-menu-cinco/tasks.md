# Tasks

Segundo de los cinco cambios del rediseño. Requiere `rediseno-sistema-visual` en `dev`. No depende de los cambios del bien común ni de `portada-vrn`.

## 1. Lista única

- [ ] 1.1 Reescribir `DESTINOS` en `lib/navegacion.ts` según `design.md` §1 (grupos, `existe` en falso para `/invertir`, `/mi-tierra` y `/barrios/norte`, ocultos los cinco en pausa), sumar `secciones` y `destinoActivo()`, y los nombres Explorar, Invertir, Mi tierra, Barrios y Comunidades al glosario (es/en). **Verifica:** `pnpm test lib/navegacion lib/idioma` en verde, con casos nuevos: `destinoActivo("/lotes/x")` es Explorar, `destinoActivo("/fogon")` es ninguno, `destinosDeGrupo("principal")` devuelve Explorar, Bien común y Sumarte mientras las otras dos páginas no existan.

## 2. Rail y celular

- [ ] 2.1 Rail sin títulos de grupo, angosto (88 px o menos), visible desde 768 px, marcando con `destinoActivo()`. **Verifica:** `pnpm build` en verde; e2e de la tarea 4.1.
- [ ] 2.2 `components/menu-celular.tsx` y el botón "Menú" en `components/barra-superior.tsx` (44 px, `aria-expanded`, Escape, foco de vuelta). **Verifica:** test de unidad con Testing Library (abrir, Escape, foco); e2e de la tarea 4.1.

## 3. Subnavegación

- [ ] 3.1 `components/subnav-explorar.tsx` incluida en Territorio, Lotes y Comunidades (no en `/`). **Verifica:** e2e de la tarea 4.1.

## 4. E2E

- [ ] 4.1 Actualizar `e2e/marco.spec.ts`: cinco destinos (los que existen) en orden; Explorar marcado en `/lotes/hibrido`; ningún destino marcado en `/fogon`; Tab en 1280 px y en 390 px; menú del celular (abrir, elegir, Escape); subnavegación en `/lotes` y en inglés en `/tribus`; ningún enlace a los cinco en pausa en rail, menú del celular ni avatar. **Verifica:** `pnpm test:e2e e2e/marco.spec.ts` en verde.
- [ ] 4.2 Cambiar a `page.goto()` los e2e que llegan a Pactos, Semillas, Fogón, Compromisos o Congreso por el rail, sin cambiar lo que prueban. **Verifica:** `pnpm test:e2e` completo en verde.
- [ ] 4.3 Axe con el menú del celular abierto y cerrado, en los dos idiomas y los dos temas. **Verifica:** `pnpm test:e2e e2e/accesibilidad.spec.ts` en verde.

## 5. Cierre

- [ ] 5.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate rediseno-menu-cinco --strict` pasa.
