## 1. Base

- [ ] 1.1 Tabla `pactos` y enum `estado_pacto` en `lib/db/schema.ts`, migración con `pnpm db:generate`. Verificar con un test de Vitest sobre PGlite que un segundo pacto de la misma persona y comunidad da error de único.

## 2. API

- [ ] 2.1 `GET` y `POST /api/pactos`, `GET /api/pactos/pedidos` y `PATCH /api/pactos/<id>`, con sesión en el servidor, validación con las funciones puras de `lib/pactos/estado.ts`, chequeo de membresía `miembro`, la regla `puedeResolver` y transacción al resolver (409 si ya estaba resuelto). Verificar con tests de rutas: 401, 403 de no miembro, 400 incompleto, aceptar, rechazar y reenviar.

## 3. Pantallas

- [ ] 3.1 `lib/pactos/cliente.ts`; Pactos envía a la API, muestra los estados de la base y saca el botón simulado; rechazado con motivo, edición y reenvío; Semillas, Perfil y `proximo-paso` leen los aceptados de la API. Verificar en `pnpm dev` con persona y admin de prueba.
- [ ] 3.2 Sección "Pactos" en `/pedidos` y contador del avatar que suma membresías y pactos. Verificar en `pnpm dev`.
- [ ] 3.3 Mudanza única de los pactos enviados o aceptados del navegador, dejando los borradores y los aportes. Verificar con un test unitario con almacén simulado.

## 4. Tests

- [ ] 4.1 e2e `e2e/aprobaciones-pactos.spec.ts` con los escenarios de la spec (enviar, no miembro, aceptar y ver Semillas, rechazar y reenviar, contador) y `/pedidos` con pactos en la auditoría de axe. Se adaptan los e2e de Pactos y Semillas que usaban el botón simulado. Verificar con `pnpm test:e2e`.

## 5. Integración

- [ ] 5.1 `pnpm verificar` y `pnpm build` en verde; PR con el guion en dos navegadores (persona y admin).
