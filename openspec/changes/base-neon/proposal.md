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
  - `consentimientos`: persona, tipo (política, términos, datos sensibles), versión y fecha (para `privacidad-consentimiento`).
- **La lista de acceso pasa a la base**: `/api/sesion` busca a la persona en `personas` (por `privy_id` o, la primera vez, por email). `LH_PERSONAS` queda solo como **carga inicial**: si la tabla está vacía, se cargan esas personas; después manda la base.
- **Panel "Personas y roles" editable** en `/netx` (solo super admin): cambiar rol, perfil de prueba, tribu que administra y acceso; sumar una persona por email; cada cambio queda en `cambios_de_rol`. API `GET/POST/PATCH /api/personas`, que verifica en el servidor que quien pide es super admin. Un super admin no puede quitarse su propio rol (siempre queda al menos uno).
- **Los datos que hoy viven en el navegador no cambian en esta spec** (perfil, membresías, pactos, etc.): se mudan en las dos specs siguientes.

**Fuera de alcance:** aprobaciones (siguiente spec), mudar los datos del navegador, backups automáticos más allá de lo que da Neon, datos de ejemplo (tribus, territorio, Sumarte), que siguen en el código.

## Capabilities

### New Capabilities
- `base-neon`: base de datos con migraciones, personas y roles en la base, panel de roles editable.

### Modified Capabilities

## Impact

Dependencias: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `@electric-sql/pglite`. Archivos: `lib/db/` (cliente, esquema, migrador), `drizzle/` (migraciones), `drizzle.config.ts`, `app/api/sesion/`, `app/api/personas/`, `lib/sesion/` (buscar en la base), panel de `/netx`, `package.json` (scripts `db:generate`, `db:migrate` y build), e2e y tests de Vitest con PGlite. Variables: `DATABASE_URL` (la crea la integración de Neon en Vercel).
