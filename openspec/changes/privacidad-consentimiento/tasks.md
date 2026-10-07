## 0. Prerrequisitos

- [ ] 0.1 Confirmar que `perfil-entrevista`, `compromisos-registro`, `congreso-registro`, `sumarte-planes` y `panel-recorrido` están en `main` (`app/perfil`, `app/compromisos`, `app/congreso`, `app/sumarte`, `app/panel`, `lib/demo/`). Si falta alguno, frenar y reportar. Verificar con `git log origin/main --oneline` y `ls app lib/demo`.

## 1. Catálogo legal

- [ ] 1.1 Permitir `borrador: true` en `lib/legal/terminos.ts` (tipo `Termino` con `satisfies`) y agregar el término `datos` ("Tus datos personales") con el texto del design y `borrador: true`. Verificar con `pnpm test` (test del catálogo: `datos` es borrador; `ritual`, `personeria`, `ticket`, `presencia`, `obra` no).
- [ ] 1.2 En `components/termino-legal.tsx`, mostrar "Borrador: texto a revisar" en la explicación de un término borrador. Verificar en `pnpm dev` abriendo el ⚖ de `datos` (en `/privacidad`) y el de "Ritual de entrada" (en `/tribus/valle`).

## 2. Consentimiento

- [ ] 2.1 Crear `lib/demo/consentimiento.ts` (versión, lectura, `guardarSiHayOk`) y sumar a `lib/demo/claves.ts` `consentimiento: "lh-consentimiento"` y, si no está, `sumarte: "lh-sumarte"`. Verificar con tests de Vitest: sin OK no escribe; con OK escribe; OK con versión vieja o JSON inválido cuenta como sin OK; `borrarTodo()` borra el OK y Sumarte.
- [ ] 2.2 Crear el hook `useConsentimiento()` y el componente `AvisoConsentimiento` (región no modal, "Acepto", "Ahora no", "Borrar lo guardado" si hay datos viejos, ⚖ `datos`, enlace a `/privacidad`, solo tokens). Verificar en `pnpm dev` recorriéndolo solo con teclado.
- [ ] 2.3 En las cuatro pantallas (`app/perfil/entrevista.tsx`, `app/compromisos/formulario.tsx`, `app/congreso/registro-ticket.tsx`, `app/sumarte/sumarte-cliente.tsx`) reemplazar la escritura en `localStorage` por `guardarSiHayOk`, mostrar el aviso y, al aceptar, guardar el estado en memoria. Verificar en `pnpm dev`: sin OK, registrar un compromiso y recargar lo pierde; con OK, lo conserva.

## 3. Página y pie

- [ ] 3.1 Crear `app/privacidad/page.tsx` con "Borrador para revisión", una sección por pantalla (qué guarda), dónde y hasta cuándo, "no se piden datos sensibles", el estado del OK con fecha, y los botones "Dar mi OK" / "Retirar mi OK y borrar todo" (con confirmación). Sin `<main>` propio. Verificar en `pnpm dev`.
- [ ] 3.2 Agregar el enlace "Privacidad" en `components/pie.tsx`. Verificar que aparece en `/`, `/tribus` y `/privacidad`.

## 4. Tests

- [ ] 4.1 Agregar un helper `darOk(page)` en `e2e/` y usarlo en los e2e que guardan datos (perfil, compromisos, congreso, sumarte, panel). Verificar con `pnpm test:e2e` completo en verde.
- [ ] 4.2 Escribir `e2e/privacidad.spec.ts` con los escenarios de la spec: sin OK no persiste; Acepto persiste; Ahora no; un OK para todas; versión vieja vuelve a pedir; datos viejos + "Borrar lo guardado"; contenido de `/privacidad`; retirar el OK; "Borrar todo" del panel; ⚖ borrador sí y no; enlace del pie. Verificar con `pnpm test:e2e e2e/privacidad.spec.ts`.
- [ ] 4.3 Sumar `/privacidad` y `/perfil` con el aviso visible a `e2e/accesibilidad.spec.ts`. Verificar sin violaciones `serious` ni `critical`.

## 5. Integración

- [ ] 5.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/privacidad-consentimiento` con guion de prueba (perfil sin OK → recargar → Acepto → recargar → `/privacidad` → retirar) y captura del aviso. Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/privacidad-consentimiento> pnpm test:e2e e2e/privacidad.spec.ts`.
