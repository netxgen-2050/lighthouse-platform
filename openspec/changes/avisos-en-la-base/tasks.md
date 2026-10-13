## 1. Base

- [ ] 1.1 Tabla `notificaciones` en `lib/db/schema.ts` (único `(destinatario, clave)`), migración con `pnpm db:generate` y función `crearAviso(tx, …)` que ignora una clave repetida. Verificar con un test sobre PGlite.

## 2. Servidor

- [ ] 2.1 Avisos dentro de las transacciones de `POST /api/membresias`, `PATCH /api/membresias/<id>`, `POST /api/pactos` y `PATCH /api/pactos/<id>` (persona y quienes pueden resolver, según `puedeResolver`). Verificar con tests de rutas: cada caso crea el aviso correcto y, si la transacción falla, no queda nada.
- [ ] 2.2 `GET /api/notificaciones` (últimas 100) y `POST /api/notificaciones/leidas`, solo de quien pide. Verificar con tests: 401 sin sesión y que una persona no toca los avisos de otra.

## 3. Pantallas

- [ ] 3.1 Función pura en `lib/actividad/` que une los avisos del servidor y los locales (orden, tipos ocultos y conteo de no leídas), con tests. Verificar con `pnpm test`.
- [ ] 3.2 Campanita y `/bandeja` con las dos fuentes, actualización al cargar, al volver a la pestaña y cada 60 s si está visible, "Marcar todas" en las dos fuentes y el mensaje si el servidor falla. Verificar en `pnpm dev` con dos navegadores (persona y admin).

## 4. Tests

- [ ] 4.1 e2e `e2e/avisos.spec.ts`: el admin acepta y la persona ve el aviso; pedido nuevo avisa al admin; marcar todas; API caída simulada con `page.route`. `/bandeja` con avisos del servidor en la auditoría de axe. Verificar con `pnpm test:e2e`.

## 5. Integración

- [ ] 5.1 `pnpm verificar` y `pnpm build` en verde; PR con el guion en dos navegadores.
