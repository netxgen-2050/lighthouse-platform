# Tasks

Rama `agente/fogon-padron-sumar` desde `dev`, **después** de `fogon-consultas-panel` (serie: `base-neon` → `consentimiento-en-la-base` → `fogon-cuadratico-en-la-base` → `fogon-consultas-panel` → **`fogon-padron-sumar`**). Si alguno no está en `dev`, frenar y reportar. No arrancar sin el veredicto del agente arquitecto anotado en este cambio (toca tabla, permisos y datos personales).

## 1. Base

- [ ] 1.1 Migración nueva en `drizzle/` (generada con `pnpm db:generate` y revisada a mano): `consulta_padron.agregado_por uuid null references personas(id) on delete restrict`, y el campo en `lib/db/schema.ts`. Test con PGlite: las filas existentes quedan con `agregado_por` nulo; se puede insertar con `agregado_por` en una consulta abierta; el trigger de cierre sigue rechazando con la consulta cerrada a mano y por fecha. Verificar con `pnpm test lib/db lib/fogon`.

## 2. Servidor y ruta

- [ ] 2.1 `sumarAlPadron` en `lib/fogon/consultas/servidor.ts` (todo o nada, `on conflict do nothing`, máximo 50 emails, 422 con los desconocidos, 409 cerrada) y `padronCambio` en la vista (filas con `agregado_at > creada_at`). Tests con PGlite: suma dos; uno desconocido no suma a nadie; ya estaba no duplica; cerrada por fecha 409; las filas del alta no cuentan como cambio; la respuesta y la vista no traen emails ni `persona_id`. Verificar con `pnpm test lib/fogon`.
- [ ] 2.2 `app/api/fogon/consultas/[slug]/padron/route.ts` con el orden de chequeos del design (401, 403 consentimiento, 403 rol, 404, 409, 422), tipo de contenido JSON, origen propio y `no-store`. Tests de la ruta con cada código. Verificar con `pnpm test app/api/fogon`.

## 3. Pantallas

- [ ] 3.1 Botón y diálogo "Sumar al padrón" en la sección de `/netx` (solo en consultas abiertas; casillas de quienes no están; campo de email; ayuda "Sumalo primero en Personas y roles"; errores junto al campo con `aria-describedby` y resumen con `role="alert"`; foco que entra y vuelve). `lib/fogon/consultas/api.ts` con el método nuevo. Verificar con `pnpm verificar` y con el e2e de 4.1.
- [ ] 3.2 Aviso "El padrón cambió después de abrirse…" en el detalle de la consulta (singular y plural), arriba de "Mi reparto". Test de componente con 0, 1 y 3 sumadas. Verificar con `pnpm test app/fogon`.

## 4. Pruebas e integración

- [ ] 4.1 `e2e/fogon-panel.spec.ts` (PGlite + modo de prueba): el super admin crea una consulta con A y B, A reparte, el super admin suma a C; C la ve y puede repartir; el reparto de A sigue contando; A ve el aviso del cambio sin el nombre de C; una persona sin rol recibe 403 de la ruta; email desconocido muestra su error; una consulta cerrada no muestra el botón. Sumar el diálogo abierto y con error a `e2e/accesibilidad.spec.ts`. Todo con teclado y sin scroll horizontal a 390 px. Verificar con `pnpm test:e2e e2e/fogon-panel.spec.ts e2e/accesibilidad.spec.ts`.
- [ ] 4.2 `pnpm verificar` y `pnpm build` en verde; PR a `dev` con el veredicto del arquitecto y la línea para el inventario de datos (`NS_platform/Documentation/backend/01`): quién sumó a quién a un padrón, lo ve solo el dueño de la base. Verificar con los dos comandos y con `scripts/pr.sh`.
