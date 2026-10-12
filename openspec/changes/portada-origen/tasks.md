## 0. Prerrequisitos

- [x] 0.1 Confirmar que `portada-caminos` y `contactos-bandeja` están en `main` (`lib/portada.ts`, `components/pedido-contacto.tsx`, `app/netx/bandeja-pedidos.tsx`, `lib/demo/claves.ts` con `contactos`). Si falta alguno, frenar y reportar. Verificar con `git log origin/main --oneline` y `ls lib/contactos app/netx`.

## 1. Lógica

- [x] 1.1 Crear `lib/origen/origen.ts` con `limpiar`, `leerParametros`, `leerOrigen`, `formatoOrigen` y el guardado "solo si no hay uno", y sumar `origen: "lh-origen"` a `lib/demo/claves.ts`. Verificar con Vitest: valor con mayúsculas y símbolos queda limpio; más de 60 caracteres se corta; `email=` se descarta; `camino=lotes` se ignora; sin `utm_*` no se guarda; un segundo origen no pisa al primero; JSON inválido → `null`; `formatoOrigen` con partes faltantes da "sin dato"; `borrarDemo` quita `lh-origen`. Correr `pnpm test`.
- [x] 1.2 Sumar `origen` opcional a `Pedido` y `Borrador` en `lib/contactos/tipos.ts`, copiarlo en `crearPedido` y aceptarlo en `esPedido` (pedidos viejos sin origen siguen valiendo). Verificar con Vitest: pedido con origen lo conserva; pedido viejo sin origen se lee; `origen` mal formado no descarta el pedido. Correr `pnpm test`.

## 2. Pantallas

- [ ] 2.1 En `lib/portada.ts` sumar `id` a cada camino; en `app/page.tsx` leer `searchParams`, marcar la tarjeta recomendada con "Recomendado para vos" dentro del enlace y pintar `GuardarOrigen` cuando haya `utm_*`. Verificar en `pnpm dev` con `/?camino=congreso&utm_source=newsletter` (marca visible y `lh-origen` guardado en las herramientas del navegador) y con `/?camino=lotes` (sin marca).
- [ ] 2.2 En `components/pedido-contacto.tsx`, pasar el origen guardado al crear el pedido; en `app/netx/bandeja-pedidos.tsx`, sumar la columna "Origen". Verificar en `pnpm dev`: llegar con campaña, pedir una charla en `/sumarte` y ver el origen en `/netx`.

## 3. Tests

- [ ] 3.1 Ampliar `e2e/portada.spec.ts` (link al Congreso, valor desconocido, primera visita guarda, segunda no pisa, sin `utm_*` no guarda, parámetro no permitido, nombre accesible con "Recomendado para vos") y `e2e/contactos.spec.ts` (pedido después de una campaña, columna Origen con "sin dato", pedido sin origen, borrar todo quita `lh-origen`). Verificar con `pnpm test:e2e e2e/portada.spec.ts e2e/contactos.spec.ts`.
- [ ] 3.2 Sumar a `e2e/accesibilidad.spec.ts` `/?camino=congreso` y `/netx` con un pedido con origen. Verificar sin violaciones `serious` ni `critical` con `pnpm test:e2e e2e/accesibilidad.spec.ts`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde (el build tiene que mostrar `/` como dinámica sin errores); PR desde `agente/portada-origen` con guion de prueba (abrir `/?camino=congreso&utm_source=newsletter&utm_medium=email&utm_campaign=congreso-2027` → ver la tarjeta recomendada → `/sumarte` → "Pedir una charla" → `/netx` con el origen → "Borrar todo"). Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/portada-origen> pnpm test:e2e e2e/portada.spec.ts e2e/contactos.spec.ts`.
