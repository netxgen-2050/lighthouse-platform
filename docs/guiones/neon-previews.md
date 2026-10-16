# Neon y los previews: pasos para Gus

Spec: `openspec/changes/base-neon/` (design, "Pasos para Gus"). Decisiones: ADR-008 (los previews nunca tienen datos reales) y ADR-009 (la identidad es nuestra).

La base ya existe y está conectada a Vercel (`neon-cyan-diamond`, US East). Estos pasos configuran quién usa qué rama de Neon. Los agentes no los hacen: tocan Vercel y Neon.

## Cuándo

**Los pasos 1 a 5 van antes de llevar este cambio a `main`.** La primera entrega a producción carga `LH_PERSONAS` (emails reales del equipo) en la base; desde ese momento, una rama de preview copiada de producción traería esos emails. Mergearlo en `dev` antes es seguro: `dev` y las ramas `agente/*` son previews. Si al llegar la entrega los pasos no están hechos, la entrega espera.

## Pasos

1. **Vercel → Settings → Environment Variables.**
   - `DATABASE_URL` de **Production** tiene que apuntar a la rama principal de Neon y tener **solo** el alcance "Production".
   - Si las variables las administra la integración (no se editan una por una): en la configuración de la conexión de la base con el proyecto, dejar marcados solo los entornos que correspondan. **Si se desactiva la rama por preview, la conexión de la rama principal no puede quedar marcada para "Preview" ni "Development"**: los previews usarían producción.
   - **Development** no tiene que tener el `DATABASE_URL` de producción (si alguien hace `vercel env pull`, su `.env.local` apuntaría a la base real). Vacío: en local se usa PGlite.
   - Anotá qué otras variables creó la integración (`DATABASE_URL_UNPOOLED`, `PGHOST`, `POSTGRES_URL`, etc.) y con qué alcance. Los nombres dependen de la integración; hay que verlos en el panel.
2. **Neon → rama `previews`.**
   - Crearla desde la rama principal **antes** de que haya datos reales (hoy no los hay: este cambio trae la primera migración) o, si ya hubiera, como rama vacía.
   - Aplicarle las migraciones **con el migrador**, no pegando los `.sql` de `drizzle/` a mano (Drizzle no registraría que están aplicadas y el primer preview intentaría crearlas de nuevo y fallaría).
   - Con la rama por preview (paso 3), los builds migran la rama **hija**, no `previews`. La primera vez, corré en tu máquina `pnpm db:migrate` con la URL de conexión de la rama `previews` (del panel de Neon) puesta como `DATABASE_URL` solo en esa terminal. Nunca la guardes en el repo ni en `.env.local`. Con el plan B (paso 4), el primer preview la migra solo.
   - Después, pegar `scripts/datos-previews.sql` en el editor SQL de esa rama. Crea las seis personas de prueba (`@prueba.test`); se puede correr más de una vez y falla sin insertar nada si la base tiene alguna persona que no sea `.test`.
   - Sin personas de prueba en la rama, la guarda de entorno frena el build de los previews.
3. **Integración Neon ↔ Vercel → rama madre de los previews.** Si deja elegirla, poner `previews`. A verificar en el panel (no se pudo leer desde la nube el 15-oct-2026).
4. **Plan B (ADR-008), si no deja elegirla.** Desactivar en la integración la creación de una rama por preview y cargar a mano en Vercel un `DATABASE_URL` con alcance "Preview" que apunte a la rama `previews` (todos los previews comparten esa rama). Si tampoco se puede, avisar: la prueba contra Neon de los previews queda como guion manual y **Neon Auth no se activa en producción** (ADR-009, punto 4).
5. **`LH_PERSONAS` y `LH_AUTH_PRUEBA` con alcance "Preview".**
   - `LH_PERSONAS`: solo emails `.test`, o vacía. La rama `previews` ya tiene personas, así que la carga inicial no corre ahí; en el plan B o en una rama vacía sí.
   - `LH_AUTH_PRUEBA=1` en "Preview" solo si querés que los e2e de los agentes corran contra los previews. Nunca en "Production": el código igual lo ignora.
6. **Comprobar.** Abrir un preview de esta rama con la cabecera de prueba `super@prueba.test` (o con "Entrar como…" en Sumarte) y ver que es super admin y que `/netx` muestra "Personas y roles". Con `gus@gmail.com` en la cabecera, `/api/sesion` responde 403.
7. **Plan B y pruebas con email real.** Si todos los previews comparten la rama `previews` y alguien entra con su email real y acepta (cuando `consentimiento-en-la-base` esté), esa persona real queda en la rama compartida y la guarda frena los builds siguientes. Es lo esperado: se recrea `previews` (paso 2) después de cada prueba manual con un email real. Con una rama por preview no pasa: la rama hija se descarta con el preview.

## Qué hace el build

- Antes de `next build` corre `pnpm db:migrate` (`scripts/migrar.ts`). Sin `DATABASE_URL` no hace nada. Con `DATABASE_URL`, fuera de `VERCEL_ENV=production`, primero comprueba la base: virgen (sin tabla `personas`) o solo con personas `.test`; si no, el build falla con el mensaje "Esta base no parece la rama `previews`…" sin imprimir emails.
- Usa `DATABASE_URL_UNPOOLED` si existe y, si no, `DATABASE_URL`. Si una migración falla, el deploy falla.
- El build nunca siembra datos: los datos de ejemplo se pegan a mano (paso 2).
