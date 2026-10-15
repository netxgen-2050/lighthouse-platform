## 1. Base

- [ ] 1.1 Dependencias, `lib/db/` (cliente Neon o PGlite, esquema con `personas`, `cambios_de_rol` y `consentimientos`), `drizzle.config.ts`, primera migración en `drizzle/`, scripts `db:generate` y `db:migrate`, migración en el build. Tests con PGlite. Verificar con `pnpm test` y `pnpm build`.
- [ ] 1.2 `consentimientos` con la forma completa (design; fuente: `consentimiento-alta` design §7.1), sus enums, el índice y el trigger de solo agregar (va en la misma primera migración, como SQL propio si Drizzle no lo genera). Tests con PGlite: insertar una fila `acepta` de `politica` con canal `alta` e idioma `en`; una fila de `novedades` con canal `mis-datos`; `UPDATE` y `DELETE` fallan; <!-- arquitecto --> `TRUNCATE consentimientos` y `TRUNCATE personas CASCADE` fallan y las filas siguen (design: trigger por sentencia, SQL propio con `drizzle-kit generate --custom`); tipo `marketing` e idioma `fr` fallan; borrar una persona con consentimientos falla. Verificar con `pnpm test`.

## 2. Sesión y roles

- [ ] 2.1 `/api/sesion` busca en `personas` (carga inicial desde `LH_PERSONAS` si está vacía, guarda el `privy_id` al primer login). Tests. Verificar con `pnpm test`.
- [ ] 2.2 `/api/personas` (GET, POST, PATCH; solo super admin; auditoría; regla del último super admin) y panel editable en `/netx`. Tests y e2e. Verificar con `pnpm test` y `pnpm test:e2e`.

## 3. Integración

- [ ] 3.1 `pnpm verificar` y `pnpm build` en verde; e2e locales con PGlite; PR con guion de prueba y con los pasos para Gus (crear la base Neon desde Vercel si todavía no existe, revisar que el preview tenga su rama).
