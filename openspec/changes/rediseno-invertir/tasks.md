# Tasks

Quinto y último de los cinco cambios del rediseño. **Orden:** requiere en `dev` `rediseno-sistema-visual`, `rediseno-menu-cinco`, `bien-comun-propuesta`, `bien-comun-numeros-barrio` y `token-inversor-y-coherencia`.

## 1. Datos

- [ ] 1.1 `lib/invertir/barrios.ts` con test: meta, `juntado` nulo, mes de devolución (y nulo cuando no se devuelve en 6 años) y parte para el común tomados de `resumenObraBarrio()` (crearla en `lib/bien-comun/barrio.ts` si `rediseno-explorar-valle` todavía no lo hizo); curva mensual y libro por trimestre; si hace falta, sumar a `lib/bien-comun/barrio.ts` la serie mensual sin cambiar sus resultados. **Verifica:** `pnpm test lib/invertir lib/bien-comun` en verde; los tests de `barrio.ts` siguen iguales; un caso comprueba que la meta es igual a la infraestructura de `lib/barrios/norte.ts` si existe. <!-- arquitecto: un solo resumen de la obra -->

## 2. Página

- [ ] 2.1 `app/invertir/page.tsx` y `lib/idioma/textos/invertir.ts` (es/en): sellos, aviso sin sesión, indicadores con `Indicador` (mono), `ChipEstado` "En financiamiento", "Cómo funciona" con ⚖ `tokeninversor` y `fideicomisobarrio`, sello "No es una oferta" con ⚖ `nooferta` (sumarlo a `lib/legal/terminos.ts`, es/en, con el comentario de borrador), prima objetivo leída del módulo con la etiqueta "objetivo · ejemplo · en discusión, no es una promesa" (solo con sesión), enlaces a `/bien-comun` y (con permiso) a `/netx/financiamiento`. Sumar `/invertir` a `lib/sesion/rutas-publicas.ts` (`design.md` §2). **Verifica:** `pnpm build` y `pnpm test lib/idioma lib/sesion lib/permisos` en verde, con un caso nuevo `esPublica("/invertir") === true`. <!-- arquitecto: si no es pública, la puerta redirige a Sumarte y el aviso nunca se ve -->
- [ ] 2.2 Curva en SVG **completa** (las dos series hasta el final del horizonte; decisión de Gus, 23-nov), con título "caso de ejemplo", descripción, trazos distintos y tabla equivalente. **Verifica:** test de render (título, `desc`, filas de la tabla iguales a `curva` por trimestre).
- [ ] 2.3 Libro del barrio con `TablaLibro`. **Verifica:** test de render con las filas de `libro`.
- [ ] 2.4 `/invertir` pasa a `existe: true` en `lib/navegacion.ts`; sumar `app/invertir/` y `lib/invertir/` a `lib/lotes/sin-numeros-escritos.test.ts`. **Verifica:** `pnpm test lib/navegacion lib/lotes` en verde.

## 3. Sin rendimiento

- [ ] 3.1 `lib/invertir/sin-rendimiento.test.ts` según `design.md` §6. **Verifica:** `pnpm test lib/invertir` en verde; agregar a propósito "APY" en `lib/idioma/textos/invertir.ts` lo hace fallar (probar y revertir).

## 4. E2E

- [ ] 4.1 `e2e/invertir.spec.ts`: sin sesión (aviso; el HTML no contiene la meta); con sesión (sellos antes del primer indicador, meta y mes calculados con `lib/bien-comun/barrio.ts`, "sin dato" en lo juntado, curva con su tabla, libro con "mes 3", prima objetivo con su etiqueta, ⚖ de "No es una oferta"); sin sesión el HTML tampoco contiene la prima; inglés; 390 px sin scroll horizontal. **Verifica:** `pnpm test:e2e e2e/invertir.spec.ts` en verde.
- [ ] 4.2 Sumar `/invertir` (con sesión) a `e2e/accesibilidad.spec.ts` en los dos idiomas y los dos temas. **Verifica:** `pnpm test:e2e e2e/accesibilidad.spec.ts` en verde.

## 5. Cierre

- [ ] 5.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate rediseno-invertir --strict` pasa.
