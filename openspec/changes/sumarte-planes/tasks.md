## 1. Datos y catálogo

- [ ] 1.1 Crear `lib/sumarte/datos.ts` con `PASSES`, `COHORT`, `EMISION` y las filas de la tabla, copiados del mock-up v6, y `lib/sumarte/estado.ts` (reducer puro: plan, facturación, nivel del pase, pase activo, invitación). Copiar al catálogo `lib/legal/terminos.ts` las claves ⚖ que use la página, textuales del objeto `LEGAL` del mock-up, y actualizar su test. Verificar con tests de Vitest.

## 2. Página

- [ ] 2.1 Crear `app/sumarte/page.tsx` según la spec, con estado en `localStorage`, solo tokens del tema y sin `<main>` propio. Agregar el enlace a `/sumarte` en la navegación. Verificar en `pnpm dev`.
- [ ] 2.2 Escribir `e2e/sumarte.spec.ts` con todos los escenarios, incluido "sin pedidos de red" al activar el pase. Correr también la auditoría de accesibilidad. Verificar con `pnpm test:e2e`.

## 3. Integración

- [ ] 3.1 `pnpm verificar` y `pnpm build` en verde; PR con guion de prueba.
