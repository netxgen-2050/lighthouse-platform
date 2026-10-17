# Tasks

Rama `agente/fogon-simulador-parametros` desde `dev`. Textos en español con voseo. Sin dependencias nuevas, sin base de datos, sin pedidos de red. Todo lo que hace falta del modelo está en `design.md` §3 y §4.

## 1. Modelo

- [ ] 1.1 Crear `lib/series/tipos.ts` y `lib/series/escenarios.ts` con los dos escenarios, sus valores de partida, metadatos (etiqueta, unidad, rango, paso, quién decide o fuente) y supuestos fijos (design §2–§4). Test: cada valor que se decide tiene `quienDecide` y ningún dato medido lo tiene; cada dato medido tiene `fuente`; cada partida está dentro de su rango; el descuento del SAFU vale 0,20; `VERSION_MODELO` vale `v0.1` del `2026-10-17` (design §4) <!-- arquitecto: versión del modelo copiado, ADR-010 -->. Verificar con `pnpm test lib/series`.
- [ ] 1.2 Crear `lib/series/modelo.ts` (`anualidad`, `tir`, `correrSerie`, `porMil`) con el comentario de supuestos (design §3), y `modelo.test.ts` con las tolerancias de design §7: totales y cada fila del Viñedo y de la Agrovoltaica contra `RESULTS_series_waterfall.md` (las filas esperadas copiadas como tabla en el test, con un comentario que cite la fuente y la versión v0.1 del 17-oct-2026); USD 1.000 en Unidades (2.663 · 9,2 % y 2.835 · 10,3 %). Verificar con `pnpm test lib/series`.
- [ ] 1.3 Sumar a `modelo.test.ts` los escenarios de `specs/modelo-series`: cambiar el SAFU no cambia ningún flujo; regalía 0 → la Fundación recibe 1.000 por año en el Viñedo; comisión 0 → NetX 0; reparto del excedente 0 → TIR de las Unidades ≤ 9 %; rendimiento 0 → TIR de las Unidades `null`; rendimiento 3,5 → curva 0, 0, 1, 2, 3 y 3,5; Viñedo sin Notas → `notas` es `null`; dos corridas iguales dan resultados idénticos; ningún pago anual negativo con los valores de partida; `tir([-100, 0, 0])` y `tir([-100, 1000])` dan `null` (no cobra / rinde más de 100 %, design §3 punto 4) <!-- arquitecto -->. Y un test de fuente: `lib/series/` no importa `react`, `next` ni `@/lib/fogon`. Verificar con `pnpm test lib/series`.
- [ ] 1.4 Crear `lib/series/formato.ts` (`usd`, `pct`, `multiplo`) con tests: "USD 1.290.250", "9,2 %", "2,66x" y "sin dato" con `null`, `NaN` e `Infinity` <!-- arquitecto: design §3 punto 5 -->. Verificar con `pnpm test lib/series`.

## 2. Catálogo legal y donut

- [ ] 2.1 Sumar a `lib/legal/terminos.ts` las seis entradas de design §6 con `borrador: true` y el comentario de texto nuevo. Verificar con `pnpm test lib/legal` (los tests del catálogo siguen en verde y `esBorrador` da `true` para las seis).
- [ ] 2.2 Sumar a `components/donut.tsx` la prop opcional `columnaEtiqueta` (por defecto "Opción") y un caso en `components/donut.test.tsx` que la use. Verificar con `pnpm test components` (los tests existentes del donut no cambian).

## 3. Pantalla

- [ ] 3.1 Crear `app/fogon/simulador/page.tsx` y `simulador-cliente.tsx` (design §5): avisos, escenario, "Valores que se deciden" con quién decide, SAFU sin control, "Datos que se miden (no se votan)" con fuente, supuestos, vivienda "sin dato", "Volver a los valores de partida" con anuncio, resultado por clase, donut con tabla, USD 1.000 y "Ver año por año". Sumar el bloque con el enlace "Simular los parámetros de la tokenomics" en `app/fogon/page.tsx`. Verificar con `pnpm verificar` y con el e2e de 4.1.

## 4. Pruebas de punta a punta

- [ ] 4.1 `e2e/fogon-simulador.spec.ts`: (a) `/fogon` enlaza al simulador y el rail marca "Fogón"; (b) se ven los dos avisos; (c) con los valores de partida, la tabla muestra procomún "USD 306.970", Unidades "USD 1.290.250", "2,66x" y "9,2 %", NetX "USD 128.250", y "USD 1.000 en Unidades del viñedo devuelven USD 2.663"; (d) Tab hasta la regalía, flecha arriba → "5,5 %" y cambia el monto a la Fundación del año 7 en "Ver año por año"; (e) el reparto del excedente a 30 % muestra "70 % procomún · 30 % Unidades"; (f) "Volver a los valores de partida" restablece 5 % y los números de (c); (g) Agrovoltaica muestra la fila de Notas Verdes con "USD 3.688.622" y tope 10 %; (h) rendimiento del viñedo en 0 → TIR de las Unidades "sin dato" y se ve la nota de qué significa "sin dato" en la TIR (design §3 punto 4) <!-- arquitecto -->; (i) SAFU "20 %" sin control y vivienda "sin dato"; (j) a 390 px, `document.documentElement.scrollWidth <= 390`; (k) ningún pedido de red a `/api/` al mover controles; (l) recargar vuelve a los valores de partida. Verificar con `pnpm test:e2e e2e/fogon-simulador.spec.ts`.
- [ ] 4.2 Sumar `/fogon/simulador` (con "Ver año por año" y "Ver como tabla" abiertos) a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e e2e/accesibilidad.spec.ts`.

## 5. Integración

- [ ] 5.1 `pnpm verificar` y `pnpm build` en verde; PR contra `dev` con `scripts/pr.sh`, captura de la pantalla en los dos escenarios y un guion de prueba en palabras para Gus. Verificar con los dos comandos y con el PR creado.
