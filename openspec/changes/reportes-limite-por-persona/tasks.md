# Tasks

Rama `agente/reportes-limite-por-persona` desde `dev`, **después** de `base-neon` y `consentimiento-en-la-base`. Si alguno no está en `dev`, frenar y reportar. No arrancar sin el veredicto del agente arquitecto anotado en este cambio (tabla nueva y dato personal).

## 1. Base

- [ ] 1.1 Migración nueva en `drizzle/` (con `pnpm db:generate`, revisada a mano): tabla `reportes_envios` (`id`, `persona_id` con foránea `on delete restrict`, `enviado_at` con `default now()`) e índice `(persona_id, enviado_at desc)`; el esquema en `lib/db/schema.ts`. Verificar con `pnpm test lib/db`.

## 2. Límite

- [ ] 2.1 `lib/reportes/limite-persona.ts` con `intentarConPersona` y `descontarEnvio` (transacción, `for update`, borrado de más de 24 h, conteo en 60 min) y constantes `MAX_POR_PERSONA` y `VENTANA_PERSONA_MS`. Tests con PGlite: diez pasan y el undécimo no, con la espera correcta; pasada la hora vuelve a pasar; descontar devuelve el cupo; la fila de hace 30 h se borra al registrar otra; la fila no tiene más columnas que las tres. Verificar con `pnpm test lib/reportes`.
- [ ] 2.2 `lib/reportes/limite.ts`: instancia `limiteConCuenta` (10 por 60 min, sin tope total, clave = hash con sal de `proveedor:idExterno`). Tests con reloj falso. Verificar con `pnpm test lib/reportes`.

## 3. Ruta y diálogo

- [ ] 3.1 `app/api/reportes/route.ts`: con sesión, elegir contador en la base (persona con consentimiento vigente) o en memoria (sin fila o sin consentimiento); 429 con `Retry-After`; descontar si GitHub falla o no hay token; 503 si la base falla al contar. Tests de la ruta (GitHub simulado): undécimo con cuenta 429; falla de GitHub no consume; sin fila en `personas` no escribe en la base; base que falla da 503 sin llamar a GitHub; sin sesión sigue igual que hoy (los tests de `reportes-sin-cuenta` siguen verdes, salvo el escenario "Con sesión no cuenta", que pasa a 6 creados porque 6 < 10). Verificar con `pnpm test app/api/reportes`.
- [ ] 3.2 `components/boton-reportar.tsx`: el mensaje de 429 y "Copiar el reporte" también en el modo con cuenta. Verificar con `pnpm test components` y con el e2e de 4.1.

## 4. Pruebas e integración

- [ ] 4.1 `e2e/reportes.spec.ts` (modo de prueba, GitHub interceptado): una persona de prueba con sesión manda reportes hasta recibir 429 y ve el mensaje con los minutos y su texto intacto; axe sin violaciones serias ni críticas con el mensaje a la vista. Verificar con `pnpm test:e2e e2e/reportes.spec.ts e2e/accesibilidad.spec.ts`.
- [ ] 4.2 `pnpm verificar` y `pnpm build` en verde; PR a `dev` con el veredicto del arquitecto, la línea nueva para el inventario de datos (`NS_platform/Documentation/backend/01`: hora de cada reporte por persona, 24 h, solo el dueño de la base) y la nota para marcar L9 como "→ spec `reportes-limite-por-persona`" en el backlog. Verificar con los dos comandos y con `scripts/pr.sh`.
