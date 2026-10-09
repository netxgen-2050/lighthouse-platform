## 0. Prerrequisitos

- [ ] 0.1 Confirmar que `sumarte-planes` y `contactos-bandeja` están en `main` (`app/sumarte/sumarte-cliente.tsx`, `lib/sumarte/estado.ts`, `components/pedido-contacto.tsx`) y revisar si `pasaporte-sellos` ya entró (también toca `sumarte-cliente.tsx`). Si falta alguno de los dos primeros, frenar y reportar. Verificar con `git log origin/main --oneline` y `ls components lib/sumarte`.

## 1. Modelo y catálogo

- [ ] 1.1 En `lib/sumarte/estado.ts`, sumar `fechaPase` y `planPrevio`, la acción `pase` con fecha, la acción `arrepentirse` y la limpieza al volver a Explorador, y adaptar `leer` a lo guardado antes. Verificar con Vitest: confirmar el pase desde Explorador y desde Miembro y arrepentirse devuelve el plan previo; estado viejo sin fecha se lee con el pase activo y `fechaPase: null`; fecha inválida → `null`. Correr `pnpm test`.
- [ ] 1.2 Crear `plazoArrepentimiento` en `lib/sumarte/` según el design. Verificar con Vitest: hoy → vigente; día 10 exacto → vigente; día 11 → vencido; `null` y fecha inválida → sin dato. Correr `pnpm test`.
- [ ] 1.3 Agregar `cobro` y `arrepentimiento` a `lib/legal/terminos.ts` con los textos del design y `borrador: true`. Verificar con `pnpm test` (test del catálogo: las dos claves son borrador).

## 2. Pantalla

- [ ] 2.1 Crear `components/resumen-pago.tsx` (en línea, título enfocable, filas de "Quién recibe la plata", ⚖ `cobro`, "Confirmar pago (simulado)", "Cancelar", vuelta del foco; solo tokens). Verificar en `pnpm dev` solo con teclado.
- [ ] 2.2 En `app/sumarte/sumarte-cliente.tsx`, hacer que "Hacerme miembro" y "Quiero el Pase <nivel>" abran el resumen y despachen solo al confirmar, con los anuncios del design. Verificar en `pnpm dev`: abrir y cancelar no cambia el plan ni los medidores; confirmar el Brote suma uno a "Pases de la cohorte".
- [ ] 2.3 Con el pase activo, mostrar el plazo (vigente, vencido o "Fecha del pago: sin dato") con ⚖ `arrepentimiento` y el botón "Arrepentirme (simulado)". Verificar en `pnpm dev` y, para el vencido, editando `lh-sumarte` en las herramientas del navegador con una fecha de hace 11 días.

## 3. Tests

- [ ] 3.1 Escribir o ampliar `e2e/sumarte.spec.ts` con los escenarios de la spec (resumen del Brote, membresía anual, confirmar, cancelar con foco, dentro del plazo, plazo vencido y sin fecha cargando `localStorage` antes de abrir, arrepentirse desde Explorador y desde Miembro, ⚖ `cobro` borrador, solo teclado) y adaptar los e2e que activan el pase con un clic (`grep -rln "Quiero el Pase" e2e`). Verificar con `pnpm test:e2e`.
- [ ] 3.2 Sumar a `e2e/accesibilidad.spec.ts` `/sumarte` con el resumen del Pase abierto. Verificar sin violaciones `serious` ni `critical` con `pnpm test:e2e e2e/accesibilidad.spec.ts`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/sumarte-pago-simulado` con guion de prueba (Sumarte → "Quiero el Pase Brote" → leer "Quién recibe la plata" → confirmar → "Arrepentirme (simulado)" → "Hacerme miembro" con facturación anual). Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/sumarte-pago-simulado> pnpm test:e2e e2e/sumarte.spec.ts`.
