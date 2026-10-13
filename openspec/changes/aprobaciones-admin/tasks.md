## 1. Base y reglas

- [ ] 1.1 Tabla `membresias` y enum `estado_membresia` en `lib/db/schema.ts`, migración generada con `pnpm db:generate`. Verificar que la migración se aplica en PGlite con un test de Vitest que inserta dos veces la misma persona y comunidad y espera el error de único.
- [ ] 1.2 `lib/membresia/permisos.ts` con `puedeResolver` (Valle Solar: su admin o un super admin; Lighthouse y tribus sin admin: super admin; el propio pedido solo lo resuelve un super admin), con tests de cada caso. Verificar con `pnpm test`.

## 2. API

- [ ] 2.1 `GET` y `POST /api/membresias`, `GET /api/membresias/pedidos` y `PATCH /api/membresias/<id>`, con sesión verificada en el servidor, validación de la comunidad, transacción al resolver (409 si ya estaba resuelto) y motivo de hasta 300 caracteres. Verificar con tests de rutas sobre PGlite: 401 sin sesión, 403 de `persona` y de admin de tribu sobre el Lighthouse, aceptar, rechazar y readherir.

## 3. Pantallas

- [ ] 3.1 `lib/membresia/cliente.ts` (`useMembresias`) y migración de Pactos, Semillas, Pasaporte, Perfil y `lib/panel/proximo-paso.ts` al cliente nuevo; fuera el botón "Simular: la comunidad me acepta" de la ficha y del manifiesto; estado "No te aceptaron por ahora" con motivo y "Adherir de nuevo". Verificar en `pnpm dev` con dos sesiones del modo de prueba.
- [ ] 3.2 Página `/pedidos` (lista, Aceptar, Rechazar con motivo, vacío, sin acceso) y entrada "Pedidos (N)" en el menú del avatar solo para `admin-tribu` y `superadmin`. Verificar en `pnpm dev` con las tres personas de prueba.
- [ ] 3.3 Mudanza única de `lh-membresia` del navegador a pedidos en la base, con reintento si falla. Verificar con un test unitario del módulo de mudanza (almacén simulado) y a mano en `pnpm dev`.

## 4. Tests

- [ ] 4.1 e2e `e2e/aprobaciones.spec.ts` con todos los escenarios de la spec (persona adhiere, admin de Valle Solar acepta y rechaza, admin de tribu sin acceso al Lighthouse, `persona` sin acceso a `/pedidos`) y `/pedidos` en la auditoría de axe. Los e2e existentes que usaban el botón simulado se adaptan. Verificar con `pnpm test:e2e`.

## 5. Integración

- [ ] 5.1 `pnpm verificar` y `pnpm build` en verde; PR con un guion de prueba en dos navegadores (persona y admin) y la aclaración de que, en un preview sin Neon, la base vive en memoria.
