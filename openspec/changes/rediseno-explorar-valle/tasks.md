# Tasks

Tercero de los cinco cambios del rediseño. **Orden:** requiere en `dev` `rediseno-sistema-visual`, `rediseno-menu-cinco` y `portada-vrn` (grupo 1). El grupo 2 (Barrio Norte) requiere además `bien-comun-propuesta`, `bien-comun-numeros-barrio` y `lote-token-tierra`; si todavía no están, se construye solo el grupo 1 y el PR lo dice.

## 0. Antes de empezar

- [x] 0.1 Imagen decidida por Gus (23-nov-2026): `public/imagenes/lighthouse-valle.webp` con la leyenda "Imagen ilustrativa". No hay que pedir otro archivo.

## 1. Inicio

- [x] 1.1 Repintar `app/page.tsx`: foto a sangre dentro del contenido con leyenda, título y "Ver los lotes" encima, cifras de `lib/portada-vrn.ts` en `PanelVidrio`, sello general. Leyenda en `lib/idioma/textos/portada.ts` (es/en). **Verifica:** `pnpm build` en verde; `e2e/portada.spec.ts` sigue en verde sin cambiar sus textos esperados.
- [x] 1.2 E2E en `e2e/portada.spec.ts`: leyenda "Imagen ilustrativa", cifras con fuente dentro de los paneles, botón de 44 px a 390 px, sin scroll horizontal. **Verifica:** `pnpm test:e2e e2e/portada.spec.ts` en verde.

## 2. Barrio Norte

- [x] 2.1 `lib/barrios/norte.ts` con test: totales por estado del loteo base, "sin dato" para "en cuotas" (el loteo base no lo tiene; no se agrega), parte para el común y expensa de `lib/lotes/modelo.ts`, obra desde `resumenObraBarrio()` de `lib/bien-comun/barrio.ts` (crearla si todavía no existe, sin cambiar los resultados ni los tests de `barrio.ts`), diferencia entre lotes del modelo y del plano. **Verifica:** `pnpm test lib/barrios lib/bien-comun` en verde; los esperados salen de los módulos, no escritos en el test; `grep -n "21" lib/barrios/norte.ts` no encuentra el número de lotes escrito. <!-- arquitecto: un solo resumen de la obra -->
- [x] 2.1b Test con una compra simulada en el navegador sembrada en el almacenamiento: los totales por estado de `/barrios/norte` no cambian. **Verifica:** caso en `e2e/barrio-norte.spec.ts`. <!-- arquitecto: la spec lo pide y ninguna tarea lo probaba -->
- [x] 2.2 `app/barrios/norte/page.tsx` (pública) y `lib/idioma/textos/barrios.ts` (es/en): héroe con foto y sello de venta, lotes por estado con indicadores y chips, bien común en vidrio, enlaces a `/lotes` y `/bien-comun`. Sumar la ruta a `lib/sesion/rutas-publicas.ts`. **Verifica:** `pnpm test lib/sesion lib/idioma` en verde.
- [x] 2.3 Panel de la obra (cliente): con sesión, indicadores, `BarraAvance` de lo juntado ("sin dato"), mes de devolución y tabla de lo que llega al común; sin sesión, `EntrarPara`. **Verifica:** e2e de la tarea 2.5; el HTML de `/barrios/norte` sin sesión no contiene el monto de la infraestructura (`curl` al servidor local y `grep`).
- [x] 2.4 `/barrios/norte` pasa a `existe: true` en `lib/navegacion.ts`; la subnavegación de Explorar muestra "Barrios". Sumar `app/barrios/` a `lib/lotes/sin-numeros-escritos.test.ts`. **Verifica:** `pnpm test lib/navegacion lib/lotes` en verde.
- [x] 2.5 `e2e/barrio-norte.spec.ts`: sin sesión (título, sello de venta, totales por estado con texto, aviso para entrar, sin monto de la obra); con sesión (monto, "sin dato" en lo juntado, mes calculado con `lib/bien-comun/barrio.ts`, sin "rendimiento" ni "APY"); en inglés; 390 px. **Verifica:** `pnpm test:e2e e2e/barrio-norte.spec.ts` en verde.

## 3. Calidad

- [x] 3.1 Sumar `/barrios/norte` a `e2e/accesibilidad.spec.ts` y a `e2e/descubrir-publico.spec.ts`, en los dos idiomas y los dos temas. **Verifica:** `pnpm test:e2e e2e/accesibilidad.spec.ts e2e/descubrir-publico.spec.ts` en verde.

## 4. Cierre

- [x] 4.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate rediseno-explorar-valle --strict` pasa.
