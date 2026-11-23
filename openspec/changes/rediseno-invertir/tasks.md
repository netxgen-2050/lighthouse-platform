# Tasks

Quinto y último de los cinco cambios del rediseño. **Orden:** requiere en `dev` `rediseno-sistema-visual`, `rediseno-menu-cinco`, `bien-comun-propuesta`, `bien-comun-numeros-barrio` y `token-inversor-y-coherencia`.

## 1. Datos

- [ ] 1.1 `lib/invertir/barrios.ts` con test: meta, `juntado` nulo, mes de devolución (y nulo cuando no se devuelve en 6 años), parte para el común, curva mensual y libro por trimestre; si hace falta, sumar a `lib/bien-comun/barrio.ts` la serie mensual sin cambiar sus resultados. **Verifica:** `pnpm test lib/invertir lib/bien-comun` en verde; los tests de `barrio.ts` siguen iguales.

## 2. Página

- [ ] 2.1 `app/invertir/page.tsx` y `lib/idioma/textos/invertir.ts` (es/en): sellos, aviso sin sesión, indicadores con `Indicador` (mono), `ChipEstado` "En financiamiento", "Cómo funciona" con ⚖ `tokeninversor` y `fideicomisobarrio`, enlaces a `/bien-comun` y (con permiso) a `/netx/financiamiento`. **Verifica:** `pnpm build` y `pnpm test lib/idioma` en verde.
- [ ] 2.2 Curva en SVG con título, descripción, trazos distintos y tabla equivalente. **Verifica:** test de render (título, `desc`, filas de la tabla iguales a `curva` por trimestre).
- [ ] 2.3 Libro del barrio con `TablaLibro`. **Verifica:** test de render con las filas de `libro`.
- [ ] 2.4 `/invertir` pasa a `existe: true` en `lib/navegacion.ts`; sumar `app/invertir/` y `lib/invertir/` a `lib/lotes/sin-numeros-escritos.test.ts`. **Verifica:** `pnpm test lib/navegacion lib/lotes` en verde.

## 3. Sin rendimiento

- [ ] 3.1 `lib/invertir/sin-rendimiento.test.ts` según `design.md` §6. **Verifica:** `pnpm test lib/invertir` en verde; agregar a propósito "APY" en `lib/idioma/textos/invertir.ts` lo hace fallar (probar y revertir).

## 4. E2E

- [ ] 4.1 `e2e/invertir.spec.ts`: sin sesión (aviso; el HTML no contiene la meta); con sesión (sellos antes del primer indicador, meta y mes calculados con `lib/bien-comun/barrio.ts`, "sin dato" en lo juntado, curva con su tabla, libro con "mes 3"); inglés; 390 px sin scroll horizontal. **Verifica:** `pnpm test:e2e e2e/invertir.spec.ts` en verde.
- [ ] 4.2 Sumar `/invertir` (con sesión) a `e2e/accesibilidad.spec.ts` en los dos idiomas y los dos temas. **Verifica:** `pnpm test:e2e e2e/accesibilidad.spec.ts` en verde.

## 5. Cierre

- [ ] 5.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate rediseno-invertir --strict` pasa.
