# Tasks

Rama `agente/vista-netx-modelo-financiamiento` desde `dev`. Textos en español con voseo. Sin dependencias nuevas, sin base de datos, sin pedidos de red. Todo lo que hace falta de NS_Tokenomics está copiado en `design.md`.

## 0. Antes de empezar

- [ ] 0.1 Confirmar que `vista-netx-financiamiento` está en `dev`: existen `lib/financiamiento/resumen.ts`, `lib/financiamiento/riesgo.ts`, `app/netx/pestanas.tsx` con `PESTANAS_NETX` y la entrada `ordenanza173` en `lib/legal/terminos.ts`. Si falta cualquiera, **frenar y reportar**. Verificar con `ls lib/financiamiento app/netx` y `grep -n "ordenanza173" lib/legal/terminos.ts`.

## 1. Números y relato

- [ ] 1.1 Crear `lib/financiamiento/recorridos.ts` (`valorFuturo`, `RETORNO_SERIE_MADRE`, `caminoDelVino`) según design §2, con tests: 10.000 → 13.439 · 17.908 · 23.674 y 30.000 → 40.317 · 53.725 · 71.021 (±1, copiados de `RESULTS_series_waterfall.md` con comentario de fuente y versión); `valorFuturo` con `null`, `NaN` o retorno −1 → `null`; camino del vino con la partida → 302 botellas y 850 (±1); precio 0 → `null`. Verificar con `pnpm test lib/financiamiento`.
- [ ] 1.2 Crear `lib/financiamiento/relato.ts` con los datos de design §3 y su test: cada ítem tiene `fuente`; `ETAPAS` son Semilla, Construir y Escalar en ese orden; `CASCADA` tiene siete pasos en el orden de design §3.3; `SERIES_POSIBLES` marca con modelo solo agrovoltaica y viñedo; `SUPUESTOS_A_CONFIRMAR` tiene `quien` y `fuente` en todos y la vivienda vale "sin dato"; ningún texto contiene "reservá" ni "reservar tu"; el test de fuente de `lib/financiamiento/` sigue en verde. Verificar con `pnpm test lib/financiamiento`.

## 2. Catálogo legal y gráfico

- [ ] 2.1 Sumar `seriemadre` y `fundaciontierra` a `lib/legal/terminos.ts` con los textos de design §6, `borrador: true` y el comentario de texto nuevo. Verificar con `pnpm test lib/legal`.
- [ ] 2.2 Crear `components/rangos.tsx` (design §4) y `components/rangos.test.tsx`: la escala incluye el 0 y el P10 negativo; una fila con `null` muestra "sin dato" y no dibuja; el SVG tiene `aria-hidden`; el texto de cada fila trae P10, P50 y P90. Verificar con `pnpm test components` y `pnpm test lib/sin-colores-sueltos`.

## 3. Pestaña

- [ ] 3.1 Sumar "Modelo de financiamiento" a `PESTANAS_NETX` en segundo lugar y el enlace "Ver el modelo completo" en el Resumen; actualizar en `e2e/vista-netx.spec.ts` el orden de las cuatro pestañas. Verificar con `pnpm test:e2e e2e/vista-netx.spec.ts`.
- [ ] 3.2 Escribir `app/netx/financiamiento/page.tsx` (design §5) y `e2e/netx-financiamiento.spec.ts` con: un solo h1 "Modelo de financiamiento" y un solo `main`; "Modelo de financiamiento" con `aria-current="page"`; aviso de valores de partida antes del primer "USD"; ocho h2 en el orden de design §5 y el índice lleva a cada uno; etapa Semilla con "USD 375.000 a 500.000" y "sin dato (a cotizar)"; fila Fundación con "nunca un porcentaje"; cascada con siete pasos y "80 % procomún · 20 % Unidades"; S1 "sin modelo todavía"; "USD 1.250 de Unidades de la Serie Madre"; recorrido A "USD 13.439", "USD 23.674" y "Entrada a la vivienda: sin dato"; recorrido B "USD 2.663", "9,2 %" y "302 botellas"; riesgo con "61 %" y el hallazgo de la primera pérdida; "Ver como tabla" de rangos con "14,0 %"; fila Comisión de la comparación con "matrícula de corredor"; grupo "A confirmar con Vagner" con "USD 31.000" y "3 · 6 · 9 %"; los ⚖ de Serie Madre y Fundación se abren con teclado; con rol "persona" ve "No tenés acceso a esta vista"; a 390 px `document.documentElement.scrollWidth <= 390`. Verificar con `pnpm test:e2e e2e/netx-financiamiento.spec.ts`.
- [ ] 3.3 Sumar `/netx/financiamiento` (con todos los `details` abiertos) a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e e2e/accesibilidad.spec.ts`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR contra `dev` con `scripts/pr.sh`, capturas de la pestaña (escritorio y 390 px) y un guion de la reunión en palabras simples (qué mostrar en cada sección y qué preguntas de Vagner responde). Verificar con los dos comandos y con el PR creado.
