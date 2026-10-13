# Design

## Context

Ver `NS_platform/Documentation/backend/` (modelo de datos y servicios). netxgen-platform ya usa Neon + Drizzle (`lib/db/schema.ts`, `drizzle/`, `lib/auth.ts`): seguir sus patrones.

## Decisions

- **Cliente de base** en `lib/db/cliente.ts`: si hay `DATABASE_URL`, `drizzle-orm/neon-http` (o `neon-serverless` si hacen falta transacciones); si no, y no es producción, `drizzle-orm/pglite` con una instancia por proceso y `migrate()` al crearla. Un solo punto de entrada `db()`.
- **Migraciones en el build**: script `db:migrate` (drizzle-kit migrate o el migrador de drizzle-orm) en un `vercel-build` o antes de `next build` cuando hay `DATABASE_URL`. Si falla, el deploy falla.
- **Garantías en la base, no en un `if`**: email único en minúsculas (índice único sobre `lower(email)`), `privy_id` único, roles como enum, y la regla del último super admin verificada dentro de una transacción.
- **Tests**: Vitest con PGlite en memoria (cada archivo, su base). Los e2e locales levantan la app sin `DATABASE_URL` (PGlite) y con `LH_PERSONAS` de prueba.
- **Modo de prueba** (`LH_AUTH_PRUEBA`): sigue igual, pero busca a la persona en la tabla.

## Risks / Trade-offs

- [PGlite en la nube de Vercel sin `DATABASE_URL` no comparte datos entre instancias] → solo se usa en local y tests; en Vercel siempre habrá `DATABASE_URL` una vez instalada la integración.
- [Límite de 10 ramas del plan gratis de Neon] → borrar ramas de previews cerrados (la integración lo hace al borrar el deploy) y vigilar.
