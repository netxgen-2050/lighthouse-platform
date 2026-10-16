## 1. Tarjeta

- [x] 1.1 Tarjeta "Verificá tu identidad (KYC)" en `/pasaporte` (componente propio), con indicador de tres pasos, textos de para qué sirve y qué no requiere, los cinco pasos de `PASOS_KYC`, botón que abre `KycDialogo` y devuelve el foco, estado en trámite con "Simular: verificación aprobada", estado verificado compacto (inversor habilitado o no, con `inversorexterior`) y `id="identidad"` con foco al encabezado cuando la URL trae `#identidad`. Solo tokens del tema. Verificar con `pnpm test` y mirando `/pasaporte` en `pnpm dev`.
- [x] 1.2 `lib/pasaporte/sellos.ts`: la acción del sello de identidad pasa a ser un enlace "Ver la verificación" a `/pasaporte#identidad` (el sello de inversor también, si hoy abre el KYC), y el botón "Simular: verificación aprobada" sale del sello en `pasaporte-cliente.tsx` (queda solo en la tarjeta). Ajustar `sellos.test.ts`. Verificar con `pnpm test lib/pasaporte`.

## 2. Pruebas de punta a punta

- [x] 2.1 `e2e/pasaporte.spec.ts`: la tarjeta va antes de "Tus sellos"; sin trámite muestra los cinco pasos y el botón; abrir y cerrar con Escape devuelve el foco; enviar y simular la aprobación deja "Verificada" y el sello obtenido; residencia del exterior muestra el aviso; `/pasaporte#identidad` enfoca el encabezado. Ajustar los e2e que hoy aprietan "Verificar mi identidad" en el sello. Verificar con `pnpm test:e2e e2e/pasaporte.spec.ts`.

## Integración

- [ ] F.1 `pnpm verificar` y `pnpm build` en verde; la auditoría de axe pasa en `/pasaporte`. PR desde `agente/pasaporte-identidad-destacada` que mencione "Closes #59", con guion de prueba (Pasaporte sin trámite → completar → simular aprobación → residencia del exterior) y capturas de los tres estados a 1440 y 390 px.
