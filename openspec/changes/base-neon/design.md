# Design

## Context

Ver `NS_platform/Documentation/backend/` (modelo de datos y servicios). netxgen-platform ya usa Neon + Drizzle (`lib/db/schema.ts`, `drizzle/`, `lib/auth.ts`): seguir sus patrones.

## Decisions

- **Cliente de base** en `lib/db/cliente.ts`: si hay `DATABASE_URL`, `drizzle-orm/neon-http` (o `neon-serverless` si hacen falta transacciones); si no, y no es producción, `drizzle-orm/pglite` con una instancia por proceso y `migrate()` al crearla. Un solo punto de entrada `db()`.
- **Migraciones en el build**: script `db:migrate` (drizzle-kit migrate o el migrador de drizzle-orm) en un `vercel-build` o antes de `next build` cuando hay `DATABASE_URL`. Si falla, el deploy falla.
- **Garantías en la base, no en un `if`**: email único en minúsculas (índice único sobre `lower(email)`), `privy_id` único, roles como enum, y la regla del último super admin verificada dentro de una transacción.
- **Tabla `consentimientos` completa en la primera migración** (decisión de Gus, 15-oct-2026). Columnas, tipos y notas: `consentimiento-alta` design §7.1 (fuente única; si difieren, manda esa). Resumen: `id uuid`, `persona_id uuid not null → personas.id`, `tipo` enum (`politica`, `terminos`, `sensibles`, `novedades`), `evento` enum (`acepta`, `retira`), `version text not null`, `canal` enum nulo (`alta`, `al-entrar`, `nueva-version`, `mis-datos`), `idioma` enum nulo (`es`, `en`; nulo = `es`), `registrado_at timestamptz not null default now()`, `aceptado_en_cliente timestamptz` nulo; índice `(persona_id, tipo, registrado_at desc)`.
- **Libro de solo agregar garantizado en la base:** trigger `consentimientos_solo_agregar` (`BEFORE UPDATE OR DELETE`) que lanza un error. La clave foránea a `personas` es `ON DELETE RESTRICT`: borrar una cuenta es anonimizar `personas` (ADR-001), nunca borrar la fila, así la constancia sobrevive. Ninguna ruta de esta spec escribe en la tabla (lo hace `datos-en-la-nube`).
<!-- arquitecto: un trigger por fila no se dispara con TRUNCATE (ni con el TRUNCATE ... CASCADE que llega desde `personas`). -->
  - **También `TRUNCATE`:** un segundo trigger `consentimientos_sin_truncate` (`BEFORE TRUNCATE ... FOR EACH STATEMENT`) que lanza el mismo error. Sin él, un `TRUNCATE consentimientos` o un `TRUNCATE personas CASCADE` (típico de un script de datos de ejemplo) vaciaría el libro sin pasar por el trigger de filas.
  - **SQL propio, en la primera migración:** `drizzle-kit generate` no genera triggers. La función (`plpgsql`) y los dos triggers van en un archivo de migración escrito a mano (`drizzle-kit generate --custom`) dentro del mismo cambio, y se prueban con PGlite (que trae `plpgsql`). Una migración posterior que recree la tabla tiene que volver a crearlos (anotarlo en un comentario del SQL).
  - **Alcance de la garantía:** protege contra errores del código y de los scripts, no contra el dueño de la base (que puede desactivar un trigger). Es lo que pide la spec; separar un rol de la app sin permiso de `UPDATE`/`DELETE`/`TRUNCATE` queda para cuando haya datos reales.
  - **Datos de ejemplo y previews:** ningún script de `scripts/` borra ni vacía `consentimientos`; para empezar de cero se usa una rama nueva de Neon (o una PGlite nueva en tests), no un `DELETE`.
<!-- arquitecto: alinea `/api/sesion` con ADR-005 y `consentimiento-alta` design §7.3 (la fila de una persona nueva nace con su primer consentimiento). -->
- **Personas nuevas y consentimiento:** mientras el consentimiento viva en el navegador (hasta `datos-en-la-nube`), el servidor no puede saber si una persona nueva aceptó. Por eso `/api/sesion` **no inserta** filas de personas que no estén ya en `personas` (cargadas por el equipo o desde `LH_PERSONAS`): a una persona nueva le responde con el id y el email del token de Privy, sin guardarlos, como hasta hoy. La fila nace en la misma transacción que su primer `acepta` (`datos-en-la-nube`). Si `sumarte-acceso` necesita guardar el nivel en la base antes de eso, es una pregunta para Gus (ver Riesgos).
- **Tests**: Vitest con PGlite en memoria (cada archivo, su base). Los e2e locales levantan la app sin `DATABASE_URL` (PGlite) y con `LH_PERSONAS` de prueba.
- **Modo de prueba** (`LH_AUTH_PRUEBA`): sigue igual, pero busca a la persona en la tabla.

## Risks / Trade-offs

- [PGlite en la nube de Vercel sin `DATABASE_URL` no comparte datos entre instancias] → solo se usa en local y tests; en Vercel siempre habrá `DATABASE_URL` una vez instalada la integración.
- [Las personas nuevas no tienen fila hasta `datos-en-la-nube`, así que su nivel elegido en Sumarte sigue en el navegador] → coherente con "nada con su identidad antes de aceptar" (ADR-005). Crear la fila antes, en el primer login, guardaría email e id de Privy de quien todavía no aceptó. <!-- arquitecto -->
- [Límite de 10 ramas del plan gratis de Neon] → borrar ramas de previews cerrados (la integración lo hace al borrar el deploy) y vigilar.
