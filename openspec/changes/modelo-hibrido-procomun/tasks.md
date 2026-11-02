# Tasks

**Corte por noche: noche 4.** La noche 3 es `sumarte-diseno-b` (revisado). Rama `agente/modelo-hibrido-procomun` desde `dev`. Textos en `design.md`.

**Antes de empezar:** comprobar que existen `lib/lotes/modelo.ts` y `/lotes`, y que `TICKETS_SAFE` y la puerta "Comprar un lote" de `sumarte-diseno-b` ya entraron. Si `sumarte-diseno-b` no entró, frenar y reportar: `fundaciontierra` lo reescribe ese cambio.

## 1. Datos

- [ ] 1.1 Sumar `faltanteAnual` y `leccionFaltante` a `lib/lotes/modelo.ts`, y crear `lib/lotes/hibrido.ts` con la tabla bilingüe (design §2) y los resguardos (design §5). Verificar con `lib/lotes/hibrido.test.ts`: con 25 lotes faltan USD 165.000 por año; hay 7 rubros comunes, entre ellos aguas grises y negras, y 2 privados; todo rubro sin valor da "sin dato"; los cuatro resguardos dicen que no están hechos, y el del río dice "sin dato". `pnpm test lib/lotes`.
- [ ] 1.2 Reescribir `ordenanza173` y sumar `resguardoshibrido`, con `borrador: true` y `en` (design §5 y §8). Actualizar `lib/legal/terminos.test.ts` (la línea que espera "en el Juego B" en `ordenanza173`). `pnpm test lib/legal`.

## 2. Página

- [ ] 2.1 Crear `app/lotes/hibrido/page.tsx` con todas las secciones, y enlazarla desde `/lotes` y desde cada ficha. Ampliar el test de números de `lote-ficha-y-compra` a esta ruta. Verificar con `e2e/hibrido.spec.ts`, nuevo: sin sesión se lee el título "Qué es tuyo y qué es de todos"; cada rubro dice "Común" o "Privado" en texto; se lee "USD 625.000", "2,6 años", "USD 9.600" y "USD 165.000"; un resguardo dice "Todavía no está hecho"; `/lotes/lote-7` enlaza a la página. `pnpm test:e2e e2e/hibrido.spec.ts`.
- [ ] 2.2 Sumar inglés, axe y 390 px. Verificar en `e2e/hibrido.spec.ts` que `?lang=en` no deja español suelto y no hay scroll horizontal, y sumar la ruta a `e2e/accesibilidad.spec.ts`. `pnpm test:e2e e2e/hibrido.spec.ts e2e/accesibilidad.spec.ts`.

## 3. Vista NetX

- [ ] 3.1 En `/netx/financiamiento`: índice, bajada y `SeccionHibrido` en lugar de `SeccionJuegos`, conservando `BloqueManifiesto` (design §6). Limpiar `relato.ts`, sumar los supuestos y usar `TICKETS_SAFE` en `ETAPAS`. Actualizar `lib/financiamiento/relato.test.ts`: sale el test de las seis filas; la fila de la Fundación dice "en el modelo híbrido"; ningún texto dice "Juego A" ni "Juego B". `pnpm test lib/financiamiento`.
- [ ] 3.2 En `/netx`: título, respuesta corta y bloque híbrido, sin "¿Y vender lotes?" (design §7). Renombrar `juegos.ts` a `hibrido.ts` con `git mv` y actualizar quien lo importa. Cambiar la línea de `/netx/simulador`. Verificar con `git grep -n "JUEGO_\|Juego A\|vender lotes\|atajo" -- app lib/financiamiento` sin resultados.
- [ ] 3.3 Actualizar `e2e/vista-netx.spec.ts`, `e2e/netx-financiamiento.spec.ts`, `e2e/login.spec.ts`, `e2e/netx-simulador.spec.ts` y `e2e/manifiesto-lighthouse-vrn.spec.ts` (el bloque ahora está en "El modelo híbrido"). Verificar con `pnpm test:e2e e2e/vista-netx.spec.ts e2e/netx-financiamiento.spec.ts e2e/login.spec.ts e2e/netx-simulador.spec.ts e2e/manifiesto-lighthouse-vrn.spec.ts`.

## 4. Integración

- [ ] 4.1 `git grep -n "Juego B" -- app lib` solo puede dar `lib/gobernanza/datos.ts`: se reporta y no se toca. `git diff --name-only origin/dev` no incluye `lib/permisos/` ni `package.json`. `pnpm verificar` y `pnpm build` en verde.
- [ ] 4.2 Abrir el PR con `scripts/pr.sh` hacia `dev`, aclarando: toca `/netx` además de lo que nombró el pedido, y por qué; el Fogón sigue diciendo "Parámetros del Juego B"; los resguardos no están hechos; el texto de la lección del aporte (pregunta para Gus). Verificar con `scripts/preview-url.sh agente/modelo-hibrido-procomun` y `BASE_URL=<url> pnpm test:e2e e2e/hibrido.spec.ts e2e/netx-financiamiento.spec.ts`.
