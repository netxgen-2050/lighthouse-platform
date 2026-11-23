# Tasks

Requiere `bien-comun-propuesta` implementado (módulo y página nuevos).

## 1. Parámetros

- [x] 1.1 Sumar `VERSION_SIM_BARRIO` y `BARRIO` a `lib/bien-comun/modelo.ts` según la tabla de `design.md`, importando de `lib/lotes/modelo.ts` lo que ya vive ahí. **Verifica:** test nuevo en `lib/bien-comun/modelo.test.ts`: cada parámetro tiene `fuente`; `BARRIO.precioLote.valor` es 27.500 y sale de `MODELO_LOTES`.
- [x] 1.2 Comparar `lotesDelSector()` con 21 y, si difiere, sumar la línea de `design.md` ("Lotes del plano"). **Verifica:** anotarlo en el PR con el número real.

## 2. Cálculo

- [x] 2.1 Crear `lib/bien-comun/barrio.ts` con `montoALevantar`, `cobrosPorMes`, `cobrandoConLasCuotas`, `coberturaAFechaFija`, `alComunPorAnio` y `parteQueQuedaEnElFideicomiso`, traduciendo `NS_Tokenomics/sim/barrio_stack_sim.py` v0.1. Entradas inválidas → `{ ok: false }`; cuotas = 0 es contado y es válido (`design.md`). <!-- arquitecto: caso contado --> **Verifica:** un caso más con 2 por trimestre, contado, 27.500 → mes 27; además, `lib/bien-comun/barrio.test.ts` con los casos de `design.md` ("Tests contra RESULTS_barrio_stack.md") en verde.

## 3. Pantalla

- [ ] 3.1 Sumar la clave `barrio` (es/en) a `lib/idioma/textos/bien-comun.ts`: título, aviso, etiquetas, "de partida", resultados, "no en {años} años" (los años llegan por parámetro desde `BARRIO.horizonteMeses`; <!-- arquitecto --> sin escribir el 6), "sin dato", errores por campo, conclusiones del doc 34 §4. Sin números escritos. **Verifica:** `pnpm test lib/idioma` en verde.
- [ ] 3.2 Crear `components/bien-comun/calculadora-barrio.tsx` (cliente) según `design.md` ("Presentación"). **Verifica:** `grep -n "localStorage\|sessionStorage\|useSearchParams" components/bien-comun/calculadora-barrio.tsx` sin resultados.
- [ ] 3.3 Sumar la sección a `app/bien-comun/page.tsx`, después de la política de FARO. **Verifica:** `pnpm build` en verde.

## 4. Reglas vigiladas

- [ ] 4.1 En `lib/lotes/sin-numeros-escritos.test.ts`, sumar a `NUMEROS` los del barrio que no estén ("27.500", "317.200", "384.382", "40.000" ya está) y permitir "retorno" bajo la clave `barrio`. **Verifica:** `pnpm test lib/lotes/sin-numeros-escritos` en verde.

## 5. E2E

- [ ] 5.1 En `e2e/bien-comun.spec.ts`: valores de partida; caso base (317.200, mes 48, 21 %); precio 40000 → mes 29; 1 lote por trimestre → "no en 6 años"; campo vacío → "sin dato"; recargar vuelve a los de partida; tabla del común con 6 filas; en inglés con teclado; sin scroll a 390 px. Los valores esperados se calculan importando `lib/bien-comun/barrio.ts`, no se escriben. **Verifica:** `pnpm test:e2e e2e/bien-comun.spec.ts` y `e2e/accesibilidad.spec.ts` en verde.

## 5 bis. Solo con sesión (decisión de Gus, 23-nov)

- [ ] 5b.1 La sección "Los números del barrio" se muestra solo con sesión; sin sesión, aviso para entrar con el patrón de `components/sesion/entrar-para.tsx`, sin números. **Verifica:** e2e sin sesión no encuentra la calculadora ni el monto del Token Inversor; e2e con sesión de prueba la encuentra.

## 6. Cierre

- [ ] 6.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate bien-comun-numeros-barrio --strict` pasa.
