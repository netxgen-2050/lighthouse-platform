# Tasks

## 0. Prerrequisitos

- [ ] 0.1 Confirmar que `congreso-registro` (`app/congreso/registro-ticket.tsx`), `canales-acceso` (`lib/canales/puertas.ts`) y `panel-recorrido` (`lib/demo/resumen.ts`, `app/panel/resumen.tsx`) están en `main`. Si falta alguno, frenar y reportar. Verificar con `ls app/congreso lib/canales lib/demo app/panel`.

## 1. Datos y lógica

- [ ] 1.1 Agregar `presencia: "lh-congreso-presencia"` a `CLAVES` en `lib/demo/claves.ts` sin tocar las otras. Verificar con `pnpm test` (`lib/demo/claves.test.ts` y `lib/demo/borrar.test.ts`, actualizándolos si fijan la lista) que `borrarDemo` también la quita.
- [ ] 1.2 Agregar `genesis` a `lib/legal/terminos.ts` con el texto de design.md (decisión 7) y `borrador: true`. Verificar con `pnpm test` y un caso nuevo en `lib/legal/terminos.test.ts` que pida que sea borrador.
- [ ] 1.3 Crear `lib/congreso/presencia.ts` (`leerPresencia`, `hacerCheckin`, `tieneGenesis`, design.md decisión 2) con `lib/congreso/presencia.test.ts`: sin ticket → 0 aunque haya días guardados; JSON roto → 0; 7 → 5; check-in de 5 sigue en 5; Genesis desde 1. Verificar con `pnpm test`.

## 2. Página del Congreso

- [ ] 2.1 Crear `app/congreso/congreso-cliente.tsx` con el estado de ticket y presencia, que contenga `RegistroTicket` (controlado por props) y la agenda; dejar en `page.tsx` el título, la explicación, el aviso y la nota de presencia. Verificar en `pnpm dev` que registrar y quitar el ticket sigue funcionando igual que antes y que `e2e/congreso.spec.ts` sigue en verde.
- [ ] 2.2 Agregar el botón "Simular check-in del día N" con la aclaración del anfitrión, el sello Genesis con ⚖ `genesis`, "Presencia confirmada: N de 5 días", "Cinco días de presencia" y la marca "presente" en la agenda; el foco va al estado tras cada check-in (`role="status"`). "Quitar ticket" borra también la presencia (design.md decisión 4). Verificar en `pnpm dev` solo con teclado los 5 check-ins y la recarga.
- [ ] 2.3 Ampliar `e2e/congreso.spec.ts` con los escenarios de la spec: sin ticket no hay botón; día 1 → Genesis y "1 de 5"; agenda con "Día 1 · presente" y "Día 2 · presente"; cinco días sin botón; recarga con 3 días; quitar ticket reinicia. Sumar `/congreso` con ticket y un check-in a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e e2e/congreso.spec.ts e2e/accesibilidad.spec.ts`.

## 3. Canales y Mi recorrido

- [ ] 3.1 Agregar `personaReal` en `lib/canales/` (design.md decisión 5) y usarla en `app/canales/canales-cliente.tsx` leyendo `CLAVES.sumarte`, `CLAVES.congreso` y `CLAVES.presencia`. Verificar con un test en `lib/canales/puertas.test.ts` (ticket + 1 día → `presenciaGenesis: true`; ticket sin días → false) y con `e2e/canales.spec.ts` ampliado: Explorador con check-in ve "Foros de la red" abierta "por tu presencia"; ticket sin check-in no muestra "por tu presencia".
- [ ] 3.2 Sumar `presencia` a `ResumenDemo` en `lib/demo/resumen.ts` (con `leerPresencia`) y mostrar "Genesis · N de 5 días" en `app/panel/resumen.tsx`. Verificar con `lib/demo/resumen.test.ts` ampliado y con un caso en `e2e/panel.spec.ts` (ticket + 2 días → "Genesis · 2 de 5 días").

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/congreso-checkin-genesis` con guion de prueba (registrar ticket → check-in día 1 → ver Genesis → `/canales` con "por tu presencia" → `/panel`) y captura del sello. Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/congreso-checkin-genesis> pnpm test:e2e e2e/congreso.spec.ts e2e/canales.spec.ts`.
