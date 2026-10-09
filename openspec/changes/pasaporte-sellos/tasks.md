## 1. Sellos y KYC

- [ ] 1.1 `lib/pasaporte/` con los sellos (estado a partir de membresía, Sumarte, Congreso y KYC) y las puertas de `lib/permisos/`, y el estado del KYC, con tests. Verificar con `pnpm test`.
- [ ] 1.2 Rehacer `/pasaporte` con los sellos y el diálogo de KYC; puntos de entrada en Sumarte y Pactos; redirección de `/canales`; quitar la escalera de Semillas. e2e. Verificar con `pnpm test:e2e`.

## Integración

- [ ] F.1 `pnpm verificar` y `pnpm build` en verde, auditoría de accesibilidad sin violaciones serias (sumar las rutas nuevas a `e2e/accesibilidad.spec.ts`), solo tokens del tema y un único `<main>`; PR con guion de prueba.
