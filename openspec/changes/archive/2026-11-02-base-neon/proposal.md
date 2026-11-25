# Proposal

## Why

Para que lo que hace una persona lo vea otra (aprobaciones de admins, roles, notificaciones) hace falta una base compartida. Decisión de Gus (14-oct-2026): **Neon Postgres**, creada desde Vercel (factura por Vercel, Gus como responsable de los datos bajo NetXGen), región Estados Unidos este. **La base ya existe y está conectada a Vercel** (Gus, 15-oct-2026: "the neon database exists already in vercel"; ADR-009: base `neon-cyan-diamond`, una rama por preview). Es la primera de tres specs (`base-neon` → `aprobaciones-admin` → `datos-en-la-nube`); el diseño completo está en `NS_platform/Documentation/backend/`.

Dos decisiones del 15-oct-2026 cambian esta spec antes de implementarla:
- **ADR-009 (Aceptada): la identidad es nuestra.** `personas.id` es el id de NetX; el proveedor de login (hoy Privy, después Neon Auth) entra en una tabla `cuentas`, no en una columna `privy_id`. Así cambiar de proveedor es agregar filas, no migrar todas las tablas.
- **ADR-008 (Aceptada, B + C): los previews nunca tienen datos reales.** Su rama de Neon sale de una rama madre `previews` con personas de prueba, y el modo de prueba solo acepta emails `.test`.

## What Changes

- **Conexión y migraciones**: Drizzle ORM (`drizzle-orm`, `drizzle-kit`) con el driver de Neon (`@neondatabase/serverless`), igual que netxgen-platform. Esquema en `lib/db/schema.ts`, migraciones versionadas en `drizzle/` generadas con `pnpm db:generate`. La base cambia **solo** por migraciones.
- **Sin `DATABASE_URL`** (local, tests, agentes en la nube): se usa **PGlite** (Postgres embebido, `@electric-sql/pglite` con el driver de Drizzle), con las migraciones aplicadas al arrancar. En `VERCEL_ENV=production` la falta de `DATABASE_URL` es un error explícito (la app no arranca en silencio sin base).
- **Migraciones en el deploy**: el build de Vercel corre las migraciones pendientes antes de `next build` cuando hay `DATABASE_URL` (cada preview tiene su rama de Neon; producción, la suya).
- **Primeras tablas**:
  - `personas`: **id propio de NetX** (`uuid`), email (único, en minúsculas), nombre, rol (`superadmin`, `admin-tribu`, `persona`), perfil de prueba (`usuario`, `inversor`, `comunidad`), tribu que administra (nula o `valle`), si tiene acceso, fechas de alta y de cambio. **Sin `privy_id`** (ADR-009).
  - `cuentas` (nueva, ADR-009): las cuentas de login vinculadas a cada persona. Persona, proveedor (`privy` | `neon-auth`), id externo (único por proveedor), email verificado por el proveedor al vincular y fecha de vínculo. Una persona tiene como máximo una cuenta por proveedor. Hoy el único proveedor en uso es **Privy**; `neon-auth` queda en la lista para `login-neon-auth`.
  - `cambios_de_rol`: quién cambió qué rol o acceso de quién y cuándo (auditoría).
  - `consentimientos`, **con su forma completa desde la primera migración** (decisión de Gus, 15-oct-2026; forma en `openspec/changes/consentimiento-alta/design.md` §7.1 y ADR-005): persona, tipo (`politica`, `terminos`, `sensibles`, `novedades`), evento (`acepta`, `retira`), versión, camino (`alta`, `al-entrar`, `nueva-version`, `mis-datos`; nulo), idioma (`es`, `en`; nulo = `es`), hora del servidor y hora informativa del navegador. Es un **libro de solo agregar**: la base rechaza `UPDATE` y `DELETE` sobre la tabla. Así `consentimiento-alta` e `idioma-legal` no necesitan una segunda migración.
- **La lista de acceso pasa a la base**: `/api/sesion` resuelve a la persona por **(proveedor, id externo)** en `cuentas`; si no hay cuenta, la primera vez la busca por su **email verificado** en `personas` y, si existe, vincula la cuenta. Una persona que no está en `personas` no se guarda (nace con su primer consentimiento, ADR-005). `LH_PERSONAS` queda solo como **carga inicial**: si la tabla está vacía, se cargan esas personas; después manda la base.
- **Panel "Personas y roles" editable** en `/netx` (solo super admin): cambiar rol, perfil de prueba, tribu que administra y acceso; sumar una persona por email; cada cambio queda en `cambios_de_rol`. API `GET/POST/PATCH /api/personas`, que verifica en el servidor que quien pide es super admin. Un super admin no puede quitarse su propio rol (siempre queda al menos uno).
- **Previews sin datos reales (ADR-008)**:
  - **Datos de ejemplo** en `scripts/datos-previews.sql`: las personas de prueba (todas `@prueba.test`), idempotente, sin borrar nada. Gus lo corre una vez en la rama madre `previews`.
  - **El modo de prueba solo acepta emails `.test`**: con la cabecera de prueba y un email que no termina en `.test`, `/api/sesion` responde 403, también en local.
  - **Pasos para Gus en Vercel y Neon** (en el PR y en `docs/guiones/neon-previews.md`): verificar el alcance de `DATABASE_URL`, crear la rama `previews`, elegir la rama madre de los previews en la integración o, si no se puede, el plan B de ADR-008.
- **Los datos que hoy viven en el navegador no cambian en esta spec** (perfil, membresías, pactos, etc.): se mudan en las specs siguientes.

**Fuera de alcance:**
- **Tabla `billeteras`** (ADR-009, punto 2): el proveedor de billeteras se elige en noviembre con una prueba de una noche y nada de lo que viene hasta entonces escribe una dirección. La tabla entra con ese cambio (anotado en el design, Open Questions).
- El login con Neon Auth y el formulario propio (`login-neon-auth`); acá `neon-auth` solo existe como valor del enum.
- Desvincular una cuenta, unir dos personas o cambiar el email de una persona.
- Aprobaciones (siguiente spec), mudar los datos del navegador (incluido el consentimiento: la tabla queda creada y vacía; la llena `consentimiento-en-la-base`), borrar en Privy al usuario que no acepta (pendiente, R29), backups automáticos más allá de lo que da Neon, datos de ejemplo de tribus, territorio y Sumarte (siguen en el código).
- Configurar Vercel o Neon: lo hace Gus con los pasos del PR (los agentes no tocan producción ni sus credenciales).

## Capabilities

### New Capabilities
- `base-neon`: base de datos con migraciones, personas con identidad propia y cuentas de login vinculadas, panel de roles editable, previews sin datos reales.

### Modified Capabilities

## Impact

Dependencias: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `@electric-sql/pglite`. Archivos: `lib/db/` (cliente, esquema, migrador), `drizzle/` (migraciones), `drizzle.config.ts`, `app/api/sesion/`, `app/api/personas/`, `lib/sesion/` (identidad del proveedor, buscar en la base, regla `.test`), panel de `/netx`, `scripts/datos-previews.sql`, `docs/guiones/neon-previews.md`, `.env.example`, `package.json` (scripts `db:generate`, `db:migrate` y build), e2e y tests de Vitest con PGlite. Variables: `DATABASE_URL` (la crea la integración de Neon en Vercel). Tablas, migraciones, identidad y datos personales: revisión de arquitectura.

Orden de implementación: **`base-neon`** → `consentimiento-en-la-base` → `fogon-cuadratico-en-la-base` → `fogon-consultas-panel`; `login-neon-auth` va después de `base-neon` (y de `consentimiento-alta`).

> **Actualización 14-oct (Gus, spec `sumarte-acceso`):** el acceso es abierto y el nivel (Explorador, Miembro, Líder de tribu) lo elige la persona en Sumarte. Si `sumarte-acceso` ya está en la base: la tabla `personas` guarda también el **nivel** y la tribu que lidera; el nivel elegido en Sumarte se guarda en la base (en lugar del navegador); `LH_PERSONAS` queda solo para ajustes por email (super admin); y el panel de NetX permite cambiar el nivel además del rol.
