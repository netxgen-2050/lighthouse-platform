# Tasks

Rama `agente/consentimiento-en-la-base` desde `main`, **después** de que `base-neon` y `consentimiento-alta` estén en `main`. Si alguno falta, frenar y reportar. Orden de la serie: `base-neon` → **`consentimiento-en-la-base`** → `fogon-cuadratico-en-la-base` → `fogon-consultas-panel` (`login-neon-auth` no hace falta: este cambio anda con Privy y con Neon Auth).

## 1. Servidor

- [ ] 1.1 `lib/privacidad/servidor.ts`: `estadoConsentimiento`, `registrar` (transacción, persona nueva, idempotencia, novedades que no pisan, retiro en orden) y la validación pura del pedido (design §1 y §2). Tests con PGlite: alta, aceptación vencida (6 min) y en el futuro, versión vieja, persona nueva en la misma transacción con su fila de `cuentas` (con un error forzado no queda ninguna fila en `personas`, `cuentas` ni `consentimientos`), persona del equipo sin cuenta solo recibe su fila de `cuentas`, persona nueva en modo de prueba no escribe `cuentas`, la misma lógica con una identidad simulada de proveedor `neon-auth` (la persona que aceptó con `privy` y entra con `neon-auth` y el mismo email verificado sigue vigente), retiro agrega filas y no toca las anteriores, novedades no pisa, doble envío en 1 s deja dos filas. <!-- arquitecto: design §1 y §2 --> Más: con `enviadoEnCliente − aceptadoEnCliente` de 6 min se rechaza y de 1 min se acepta **aunque las dos horas estén 10 min atrasadas respecto del servidor**; diferencia negativa se rechaza. Confirmar el driver de escritura (`neon-serverless` para la transacción con lock, design §1) y anotarlo en el PR. Verificar con `pnpm test lib/privacidad`.
- [ ] 1.2 `exigirConsentimiento(sesion)` con tests: sin fila en `personas` → 403 `{ consentimiento: false }`; con versión vieja → 403; vigente → `personaId`; <!-- arquitecto --> nunca escribe (una persona del equipo sin cuenta vinculada sigue sin fila en `cuentas` después de llamarla); encontrada por email con otra cuenta del mismo proveedor ya vinculada → 403. Verificar con `pnpm test lib/privacidad`.
- [ ] 1.3 `app/api/consentimientos/route.ts` (`GET` y `POST`, design §2) con tests de la ruta: 401 sin sesión, 422 inválido, 200 con el estado; tipo de contenido y origen propio. Verificar con `pnpm test`.

## 2. Cliente

- [ ] 2.1 `lib/privacidad/consentimiento.ts`, `usar-consentimiento.ts`, `novedades.ts`, `proveedor-sesion.tsx` y Mis datos usan la API con sesión (design §3); error "No pudimos guardar tu aceptación. Probá de nuevo." con `role="alert"` y la persona sigue anónima. Verificar con `pnpm verificar` y con el e2e de 3.1.

## 3. Pruebas

- [ ] 3.1 `e2e/fixtura.ts` siembra por la API (design §4); sumar a `e2e/consentimiento-alta.spec.ts`: (a) aceptar en un contexto de navegador y entrar desde otro contexto sin ver la pantalla; (b) con la API respondiendo 500 (ruta interceptada), la persona sigue anónima y ve el error; (c) retirar en Mis datos y ver la pantalla al recargar. Verificar con `pnpm test:e2e`.

## 4. Integración

- [ ] 4.1 `pnpm verificar`, `pnpm build` y todos los e2e locales en verde; PR que avise que el equipo vuelve a aceptar una vez. Verificar con los tres comandos y con `scripts/pr.sh`.
