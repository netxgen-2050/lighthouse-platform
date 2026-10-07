## 0. Prerrequisitos

- [ ] 0.1 Confirmar que `estado-administrativo` está en `main` (`components/estado-administrativo.tsx` y `borrador` en `lib/legal/terminos.ts`) y que `/panel` tiene "Borrar todo lo de este navegador". Si falta algo, frenar y reportar. Verificar con `git log origin/main --oneline` y `ls components app/panel`.

## 1. Registro

- [ ] 1.1 Crear `lib/demo/bitacora.ts` (`huella`, `leer`, `anotar`, tipos) y sumar `bitacora: "lh-bitacora"` a `lib/demo/claves.ts`. Verificar con tests de Vitest: huella estable y distinta al cambiar el texto; JSON inválido → vacía; misma cosa dentro de 30 minutos no se repite y a los 31 sí; tope de 300 descarta la más vieja; `borrarDemo` quita `lh-bitacora`. Correr `pnpm test`.
- [ ] 1.2 Agregar el término `bitacora` a `lib/legal/terminos.ts` con el texto del design y `borrador: true`. Verificar con `pnpm test` (test del catálogo).

## 2. Anotar

- [ ] 2.1 Agregar el helper cliente `anotarEnBitacora` y anotar al abrir un ⚖ en `components/termino-legal.tsx`. Verificar en `pnpm dev`: abrir un ⚖ con mouse, teclado y toque (modo dispositivo) y mirar `lh-bitacora` en las herramientas del navegador.
- [ ] 2.2 Agregar `AnotarExposicion` dentro de `components/estado-administrativo.tsx`. Verificar en `pnpm dev` abriendo `/territorios/lighthouse` y eligiendo una finca.

## 3. Página

- [ ] 3.1 Crear `app/panel/bitacora/` (tabla, vacío, "Descargar (JSON)", párrafo con ⚖ `bitacora`, sin `<main>` propio, tabla con scroll propio en celular) y el enlace "Ver lo que te mostramos" en `/panel`. Verificar en `pnpm dev` a 1280 px y 390 px.

## 4. Tests

- [ ] 4.1 Escribir `e2e/bitacora.spec.ts` con los escenarios de la spec (estado del loteo, ⚖ con teclado, sin repetidos, página con fila, vacía, descarga con `page.waitForEvent("download")`, borrar todo desde `/panel`, ⚖ borrador). Bloquear las teselas del mapa con `page.route`. Verificar con `pnpm test:e2e e2e/bitacora.spec.ts`.
- [ ] 4.2 Sumar `/panel/bitacora` (con entradas) a `e2e/accesibilidad.spec.ts`. Verificar sin violaciones `serious` ni `critical`.

## 5. Integración

- [ ] 5.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/bitacora-exposicion` con guion de prueba (abrir el territorio → abrir dos ⚖ en `/sumarte` → `/panel/bitacora` → descargar → borrar todo) y captura de la tabla.
