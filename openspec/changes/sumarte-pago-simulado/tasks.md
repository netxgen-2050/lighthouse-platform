# Tasks

## 0. Prerrequisitos

- [ ] 0.1 Confirmar que `sumarte-planes` (`app/sumarte/`, `lib/sumarte/estado.ts`), `canales-acceso` (`lib/canales/`) y `CLAVES.sumarte` en `lib/demo/claves.ts` están en `main`. Si falta alguno, frenar y reportar. Verificar con `git log origin/main --oneline` y `ls lib/sumarte lib/canales`.

## 1. Textos legales

- [ ] 1.1 Agregar `pagodividido` y `arrepentimiento` a `lib/legal/terminos.ts` con el título y el texto de design.md (decisión 7), `borrador: true` y el comentario "Texto nuevo, no viene del mock-up". Verificar con `pnpm test` que `lib/legal/terminos.test.ts` sigue en verde y sumar un caso que pida que ambos sean borrador (`esBorrador`).

## 2. Lógica de pagos

- [ ] 2.1 Crear `lib/sumarte/pagos.ts` con el tipo `Pago`, `nuevoNumero()` (`SIM-` + 6 de `A-Z0-9`), `formatoFecha(fechaISO)` (dd/mm/aaaa), `repartoDe(pago)` (textos de quién cobra según el concepto; la tarifa de NetX como "sin dato") y `estadoPago(pago, estado, hoy)` (vigente, arrepentido, incluida-en-pase, dado-de-baja, vencido, con días restantes). Verificar con `lib/sumarte/pagos.test.ts`: formato del número, reparto del Pase Raíz sin "USD 0", membresía anual USD 100, plazo a 0, 3, 9, 10 y 11 días, membresía con Pase activo e "incluida", Pase dado de baja tras volver a Explorador.
- [ ] 2.2 Extender `lib/sumarte/estado.ts`: campo `pagos` en `EstadoSumarte` e `INICIAL`, acciones `pagar` y `arrepentirse` (design.md decisión 2), y `leer()` tolerante (sin `pagos` → `[]`; un pago mal formado se descarta). Verificar con tests de Vitest: pagar el Pase activa `pase` y `plan: "miembro"` y guarda `planPrevio`; arrepentirse vuelve al plan previo; arrepentirse fuera de plazo no cambia nada; un JSON viejo con Pase Raíz y sin `pagos` se lee igual.

## 3. Interfaz

- [ ] 3.1 Crear el componente de confirmación (`app/sumarte/confirmar-pago.tsx`): título "Confirmá tu pago simulado", concepto, monto, reparto con ⚖ (`guardian` y `pagodividido` para el Pase; `membresia` para la membresía), casilla obligatoria con el texto de la spec, error asociado con `aria-describedby`, "Confirmar pago simulado" y "Cancelar" con el foco devuelto al botón de origen. Solo tokens del tema. Verificar en `pnpm dev` recorriendo la confirmación solo con teclado.
- [ ] 3.2 En `app/sumarte/sumarte-cliente.tsx`, hacer que "Quiero el Pase {nivel}" y "Hacerme miembro" abran la confirmación y que confirmar despache `pagar` con número y fecha generados en el cliente; al confirmar, mostrar el comprobante y mover el foco al estado nuevo. Verificar en `pnpm dev` que el Pase no se activa hasta confirmar y que los medidores de cohorte suman solo después.
- [ ] 3.3 Agregar la sección "Tus pagos simulados" (debajo de los planes): un comprobante por pago con número, fecha, concepto, monto, reparto, "(simulado) · no se cobró nada", estado en texto, ⚖ `arrepentimiento`, días restantes y "Arrepentirme (simulado)" cuando corresponda; sin pagos, "Todavía no hiciste pagos simulados". Verificar en `pnpm dev`: confirmar Semilla, arrepentirse y ver "Arrepentido" y el plan anterior.

## 4. Tests de punta a punta

- [ ] 4.1 Crear un helper `e2e/ayudas/pagar.ts` (`confirmarPase(page, nivel)` y `confirmarMembresia(page)`) y actualizar todos los e2e que hacían clic directo en "Quiero el Pase …" o "Hacerme miembro" (buscar con `grep -rn "Quiero el Pase\|Hacerme miembro" e2e`). Verificar con `pnpm test:e2e` completo en verde.
- [ ] 4.2 Escribir `e2e/pago-simulado.spec.ts` con los escenarios de la spec que no dependen del reloj: abrir y cancelar (foco vuelve), reparto del Raíz sin "USD 0", membresía anual USD 100, confirmar sin casilla (error), confirmar Brote y recargar (comprobante persiste, "te quedan 10 días"), arrepentirse del Semilla (vuelve a Explorador, "Arrepentido"), membresía "Incluida en tu Pase Fundador", "Dado de baja" tras volver a Explorador, estado viejo sembrado en `localStorage` sin pagos. Verificar con `pnpm test:e2e e2e/pago-simulado.spec.ts`.
- [ ] 4.3 Sumar a `e2e/accesibilidad.spec.ts` la auditoría de `/sumarte` con la confirmación del Pase abierta y con un comprobante en la lista. Verificar sin violaciones `serious` ni `critical`.

## 5. Integración

- [ ] 5.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/sumarte-pago-simulado` con guion de prueba (elegir Brote → Quiero el Pase → confirmar → comprobante → arrepentirse) y capturas de la confirmación y del comprobante. Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/sumarte-pago-simulado> pnpm test:e2e e2e/pago-simulado.spec.ts`.
