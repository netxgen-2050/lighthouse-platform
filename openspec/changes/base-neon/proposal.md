# Proposal

## Why

Para que lo que hace una persona lo vea otra (aprobaciones de admins, roles, notificaciones) hace falta una base compartida. Decisión de Gus (14-oct-2026): **Neon Postgres**, creada desde Vercel (factura por Vercel, Gus como responsable de los datos bajo NetXGen), región Estados Unidos este. Es la primera de tres specs (`base-neon` → `aprobaciones-admin` → `datos-en-la-nube`); el diseño completo está en `NS_platform/Documentation/backend/`.

## What Changes

- **Conexión y migraciones**: Drizzle ORM (`drizzle-orm`, `drizzle-kit`) con el driver de Neon (`@neondatabase/serverless`), igual que netxgen-platform. Esquema en `lib/db/schema.ts`, migraciones versionadas en `drizzle/` generadas con `pnpm db:generate`. La base cambia **solo** por migraciones.
- **Sin `DATABASE_URL`** (local, tests, agentes en la nube): se usa **PGlite** (Postgres embebido, `@electric-sql/pglite` con el driver de Drizzle), con las migraciones aplicadas al arrancar. En `VERCEL_ENV=production` la falta de `DATABASE_URL` es un error explícito (la app no arranca en silencio sin base).
- **Migraciones en el deploy**: el build de Vercel corre las migraciones pendientes antes de `next build` cuando hay `DATABASE_URL` (cada preview tiene su rama de Neon; producción, la suya).
- **Primeras tablas**:
  - `personas`: id, `privy_id` (único, se completa al primer login), email (único, en minúsculas), nombre, rol (`superadmin`, `admin-tribu`, `persona`), perfil de prueba (`usuario`, `inversor`, `comunidad`), tribu que administra (nula o `valle`), si tiene acceso, fechas de alta y de cambio.
  - `cambios_de_rol`: quién cambió qué rol o acceso de quién y cuándo (auditoría).
  - `consentimientos`, **con su forma completa desde la primera migración** (decisión de Gus, 15-oct-2026; forma en `openspec/changes/consentimiento-alta/design.md` §7.1 y ADR-005): persona, tipo (`politica`, `terminos`, `sensibles`, `novedades`), evento (`acepta`, `retira`), versión, camino (`alta`, `al-entrar`, `nueva-version`, `mis-datos`; nulo), idioma (`es`, `en`; nulo = `es`), hora del servidor y hora informativa del navegador. Es un **libro de solo agregar**: la base rechaza `UPDATE` y `DELETE` sobre la tabla. Así `consentimiento-alta` e `idioma-legal` no necesitan una segunda migración.
- **La lista de acceso pasa a la base**: `/api/sesion` busca a la persona en `personas` (por `privy_id` o, la primera vez, por email). `LH_PERSONAS` queda solo como **carga inicial**: si la tabla está vacía, se cargan esas personas; después manda la base.
- **Panel "Personas y roles" editable** en `/netx` (solo super admin): cambiar rol, perfil de prueba, tribu que administra y acceso; sumar una persona por email; cada cambio queda en `cambios_de_rol`. API `GET/POST/PATCH /api/personas`, que verifica en el servidor que quien pide es super admin. Un super admin no puede quitarse su propio rol (siempre queda al menos uno).
- **Los datos que hoy viven en el navegador no cambian en esta spec** (perfil, membresías, pactos, etc.): se mudan en las dos specs siguientes.

**Fuera de alcance:** aprobaciones (siguiente spec), mudar los datos del navegador (incluido el consentimiento: la tabla queda creada y vacía; la llena `datos-en-la-nube` con `POST /api/consentimientos` y `exigirConsentimiento`), borrar en Privy al usuario que no acepta (pendiente, R29), backups automáticos más allá de lo que da Neon, datos de ejemplo (tribus, territorio, Sumarte), que siguen en el código.

## Capabilities

### New Capabilities
- `base-neon`: base de datos con migraciones, personas y roles en la base, panel de roles editable.

### Modified Capabilities

## Impact

Dependencias: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `@electric-sql/pglite`. Archivos: `lib/db/` (cliente, esquema, migrador), `drizzle/` (migraciones), `drizzle.config.ts`, `app/api/sesion/`, `app/api/personas/`, `lib/sesion/` (buscar en la base), panel de `/netx`, `package.json` (scripts `db:generate`, `db:migrate` y build), e2e y tests de Vitest con PGlite. Variables: `DATABASE_URL` (la crea la integración de Neon en Vercel).

> **Actualización 14-oct (Gus, spec `sumarte-acceso`):** el acceso es abierto y el nivel (Explorador, Miembro, Líder de tribu) lo elige la persona en Sumarte. Si `sumarte-acceso` ya está en la base: la tabla `personas` guarda también el **nivel** y la tribu que lidera; el nivel elegido en Sumarte se guarda en la base (en lugar del navegador); `LH_PERSONAS` queda solo para ajustes por email (super admin); y el panel de NetX permite cambiar el nivel además del rol.
