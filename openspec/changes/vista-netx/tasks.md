## 1. Datos y lógica

- [x] 1.1 Crear `lib/vista-netx/` con los datos de ejemplo copiados de `V.franz` del mock-up v6 y la lógica pura (cálculos y estado), con tests de Vitest. Copiar los ⚖ que use la pantalla al catálogo (los nuevos con `borrador: true`) y actualizar su test. Verificar con `pnpm test`.

## 2. Pantalla

- [x] 2.1 Crear `app/netx/page.tsx` según la spec, con estado simulado en `localStorage`, solo tokens del tema, sin `<main>` propio. Agregar "NetX" a `lib/navegacion.ts`. Verificar en `pnpm dev`.
- [x] 2.2 Escribir `e2e/vista-netx.spec.ts` con todos los escenarios de la spec y sumar `/netx` a la auditoría de `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e`.

## 3. Integración

- [x] 3.1 `pnpm verificar` y `pnpm build` en verde; PR con guion de prueba.
