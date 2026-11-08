# Tasks

> **8-nov-2026:** mandan la actualización de `proposal.md` y design §4, §9, §10 y §11. Las tareas 1.1 y 2.1 se leen con esos cambios: sin `leccionFaltante` y con escenarios.

**Corte por noche: noche 4.** La noche 3 es `sumarte-diseno-b` (revisado). Rama `agente/modelo-hibrido-procomun` desde `dev`. Textos en `design.md`.

**Antes de empezar:** comprobar que existen `lib/lotes/modelo.ts` y `/lotes`, y que `TICKETS_SAFE` y la puerta "Comprar un lote" de `sumarte-diseno-b` ya entraron. Si `sumarte-diseno-b` no entró, frenar y reportar: `fundaciontierra` lo reescribe ese cambio.

## 1. Datos

- [ ] 1.1 Crear (sin `faltanteAnual` ni `leccionFaltante`: ver design §4) `lib/lotes/hibrido.ts` con la tabla bilingüe (design §2) y los resguardos (design §5). Verificar con `lib/lotes/hibrido.test.ts`: con 25 lotes faltan USD 42.000 por año; hay 7 rubros comunes, entre ellos aguas grises y negras, y 2 privados; todo rubro sin valor da "sin dato"; los cuatro resguardos dicen que no están hechos, y el del río dice "sin dato". `pnpm test lib/lotes`.
- [ ] 1.2 Reescribir `ordenanza173` y sumar `resguardoshibrido`, con `borrador: true` y `en` (design §5 y §8). Actualizar `lib/legal/terminos.test.ts` (la línea que espera "en el Juego B" en `ordenanza173`). `pnpm test lib/legal`.

## 1b. Bien común y escenarios (8-nov)

- [ ] 1.3 Cambiar "procomún" por "bien común" en los textos visibles (design §9) y actualizar los tests que lo esperan. Verificar con `grep -rIn "procomún\|Procomún" app lib components` (solo comentarios) y `pnpm verificar`.
- [ ] 1.4 Crear `lib/lotes/escenarios.ts` con los tres escenarios, sus fuentes y el cálculo de cobertura, y su test (design §4). Ningún escenario dice "falta".
- [ ] 1.5 Sumar la columna de quién cuida cada rubro y el ⚖ `consorciofundacion` (design §10).

## 2. Página

- [ ] 2.1 Crear `app/lotes/hibrido/page.tsx` con todas las secciones, y enlazarla desde `/lotes` y desde cada ficha. Ampliar el test de números de `lote-ficha-y-compra` a esta ruta. Verificar con `e2e/hibrido.spec.ts`, nuevo: sin sesión se lee el título "Qué es tuyo y qué es de todos"; cada rubro dice "Común" o "Privado" en texto; <!-- arquitecto: con otra cantidad de lotes, un número escrito en el test rompería el PR del KMZ --> se leen las tres lecciones, comparando contra `leccionAporte`, `leccionExpensas` y `leccionFaltante` con `listarLotes().length` (y, solo con 25 lotes, "USD 190.125", "USD 63.375", "USD 2.880" y "USD 42.000"); un resguardo dice "Todavía no está hecho"; `/lotes/lote-7` enlaza a la página. `pnpm test:e2e e2e/hibrido.spec.ts`.
- [ ] 2.2 Sumar inglés, axe y 390 px. Verificar en `e2e/hibrido.spec.ts` que `?lang=en` no deja español suelto y no hay scroll horizontal, y sumar la ruta a `e2e/accesibilidad.spec.ts`. `pnpm test:e2e e2e/hibrido.spec.ts e2e/accesibilidad.spec.ts`.

- [ ] 2.3 Calculadora accesible y la lista de preguntas para Vagner (design §4, puntos 5 y 6). Verificar en `e2e/hibrido.spec.ts` con el teclado.
- [ ] 2.4 Resumen en la ficha, casilla y versión aceptada en la reserva y en el boleto (design §11). Actualizar `e2e/lotes.spec.ts`: el flujo de reserva marca la casilla.

## 3. Vista NetX

- [ ] 3.1 En `/netx/financiamiento`: índice, bajada y `SeccionHibrido` en lugar de `SeccionJuegos`, conservando `BloqueManifiesto` (design §6). Limpiar `relato.ts`, sumar los supuestos y usar `TICKETS_SAFE` en `ETAPAS`. Actualizar `lib/financiamiento/relato.test.ts`: sale el test de las seis filas; la fila de la Fundación dice "en el modelo híbrido"; ningún texto dice "Juego A" ni "Juego B". `pnpm test lib/financiamiento`.
- [ ] 3.2 En `/netx`: título, respuesta corta y bloque híbrido, sin "¿Y vender lotes?" (design §7). Renombrar `juegos.ts` a `hibrido.ts` con `git mv` y actualizar quien lo importa. Cambiar la línea de `/netx/simulador`. <!-- arquitecto: el patrón "vender lotes" a secas fallaba siempre, porque design §6 y la spec piden "Comisión por vender lotes" --> Verificar con `git grep -n "JUEGO_\|Juego A\|Y vender lotes\|sin vender lotes\|vender lotes no es\|atajo" -- app lib/financiamiento` sin resultados.
- [ ] 3.3 Actualizar `e2e/vista-netx.spec.ts`, `e2e/netx-financiamiento.spec.ts`, `e2e/login.spec.ts`, `e2e/netx-simulador.spec.ts` y `e2e/manifiesto-lighthouse-vrn.spec.ts` (el bloque ahora está en "El modelo híbrido"). Verificar con `pnpm test:e2e e2e/vista-netx.spec.ts e2e/netx-financiamiento.spec.ts e2e/login.spec.ts e2e/netx-simulador.spec.ts e2e/manifiesto-lighthouse-vrn.spec.ts`.

## 4. Integración

- [ ] 4.1 `git grep -n "Juego B" -- app lib` solo puede dar `lib/gobernanza/datos.ts`: se reporta y no se toca. `git diff --name-only origin/dev` no incluye `lib/permisos/` ni `package.json`. `pnpm verificar` y `pnpm build` en verde.
- [ ] 4.2 Abrir el PR con `scripts/pr.sh` hacia `dev`, aclarando: toca `/netx` además de lo que nombró el pedido, y por qué; el Fogón sigue diciendo "Parámetros del Juego B"; los resguardos no están hechos. Verificar con `scripts/preview-url.sh agente/modelo-hibrido-procomun` y `BASE_URL=<url> pnpm test:e2e e2e/hibrido.spec.ts e2e/netx-financiamiento.spec.ts`.
