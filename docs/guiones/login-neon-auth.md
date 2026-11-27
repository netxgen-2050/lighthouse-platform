# Login con Neon Auth: pasos para Gus

Spec: `openspec/changes/login-neon-auth/` (design §1, §3, §6 y Migration Plan). Decisiones: ADR-009 (Neon Auth para el login; Privy se queda hasta `retiro-privy`) y ADR-008 (los previews nunca tienen datos reales).

El código ya está: mientras `NEXT_PUBLIC_LH_LOGIN` no exista o valga `privy`, nada cambia para nadie. Estos pasos configuran Neon y Vercel; los agentes no los hacen.

## Pasos

1. **Que ADR-008 B ya esté hecho.** Los previews tienen que salir de la rama `previews` de Neon, sin datos reales: seguí antes `docs/guiones/neon-previews.md`. Sin eso, **no** actives `neon-auth` en Production (ADR-009, punto 4); si no se puede, Production sigue con Privy.
2. **Activar Neon Auth en el proyecto de Neon** (panel de Neon, Auth). Si ya existe la rama `previews`, mirá si Auth quedó activo también ahí; si no se activa sola, activalo en esa rama. Anotá qué viste (se sabe poco: la documentación web de Neon no se pudo leer desde la nube).
3. **Métodos de acceso.**
   - Activá **código por email** (Email OTP) y **Google**. Nada más: sin teléfono, sin magic link, sin organizaciones.
   - **Email y contraseña: solo en la rama `previews`, y solo si Neon deja configurarlo por rama.** Si la configuración es una sola para todo el proyecto, **no lo actives en ningún lado**; la prueba automática del login real (paso 6) queda como prueba manual.
   - Por qué, en palabras simples: aunque nuestro formulario no ofrezca contraseña, la puerta de Neon la aceptaría si está activa. Alguien podría registrarse con la contraseña usando el email de otra persona (queda sin verificar) y, cuando esa persona entre con Google, las dos cuentas se pueden unir y quedarse con su cuenta. En `previews` no hay personas reales, así que ahí no hay a quién robarle la cuenta.
4. **Dominios permitidos** (la lista de Neon acepta comodines):
   - el dominio de Production,
   - el patrón **más angosto** que acepte Neon para los previews de este proyecto (por ejemplo `https://lighthouse-platform-*.vercel.app`; anotá qué formas aceptó). No uses `https://*.vercel.app`: deja a cualquier proyecto de Vercel como origen permitido,
   - `http://localhost:3000`.
5. **Variables en Vercel.**
   - `NEON_AUTH_BASE_URL`: la URL del Auth de la rama. Mirá si la integración de Neon la inyecta sola y en qué entornos (Production, Preview, Development); si no, cargala a mano en cada uno con la URL de su rama.
   - `NEON_AUTH_COOKIE_SECRET`: un secreto tuyo de **32 caracteres o más** (por ejemplo `openssl rand -base64 32`), **distinto** para Production y para Preview. Firma las cookies de sesión: no lo guardes en el repo.
   - `NEXT_PUBLIC_LH_LOGIN=neon-auth`, **primero solo con alcance "Preview"**. Hace falta un deploy nuevo para que se note (es una variable pública: se fija al compilar).
6. **Crear `login@prueba.test` en la rama `previews`** (panel de Neon → Auth de esa rama → usuarios), con una contraseña tuya. También corré de nuevo `scripts/datos-previews.sql` en esa rama para que exista en `personas` (rol `persona`). Para la prueba automática, en tu `.env.local` (nunca en el repo): `NEON_AUTH_PRUEBA_EMAIL=login@prueba.test` y `NEON_AUTH_PRUEBA_CLAVE=<la contraseña>`; después `BASE_URL=<preview> pnpm test:e2e e2e/login-neon-auth-preview.spec.ts` (la URL sale de `scripts/preview-url.sh agente/login-neon-auth`).
7. **Probar en un preview con tu email real.**
   1. Abrí el preview y apretá "Entrar" arriba: aparece el paso con las dos casillas. Cerralo sin marcar: no tiene que aparecer ningún formulario.
   2. Volvé a apretar "Entrar", marcá las dos casillas y "Aceptar y entrar": aparece el formulario con el cursor en tu email.
   3. Escribí tu email y "Mandame el código". El email llega en inglés y con la marca de Neon (se acepta en el prototipo; los emails propios van antes de mostrar la plataforma fuera del equipo).
   4. Escribí el código y "Entrar": tenés que ver tu rol de siempre y **no** la pantalla de consentimiento. Si ya eras del equipo con Privy, tiene que ser la misma persona (mismo rol, mismos datos del navegador).
   5. Probá un código equivocado: "El código no es correcto o venció. Pedí uno nuevo."
   6. "Salir" y volver a entrar: el paso vuelve a pedir las casillas.
   7. Repetí con «Continuar con Google» (es el primer botón del formulario, arriba del campo de email). Anotá si volvés a la misma página con la sesión abierta.
   8. En las herramientas del navegador (Aplicación → Cookies) mirá la cookie de sesión `neon-auth` y anotá sus atributos (`HttpOnly`, `Secure`, `SameSite`). **Si no es `HttpOnly`, frená y avisá.**
8. **Recién con todo eso**, `NEXT_PUBLIC_LH_LOGIN=neon-auth` también en **Production** (y un deploy nuevo). Las personas del equipo entran con su email; su cuenta de Neon Auth se vincula sola a su persona. Quien tenía la sesión de Privy abierta sigue con ella hasta que sale.
9. **Volver atrás.** Poné `NEXT_PUBLIC_LH_LOGIN=privy` (o borrala) y un deploy nuevo. Las cuentas de Neon Auth ya creadas quedan guardadas y no molestan.

## Qué queda para después

- `retiro-privy` (otro cambio): sacar Privy, su puente, sus variables, el sello "Billetera creada". Solo cuando confirmes que Production entra con Neon Auth.
- Emails del código en español y con nuestra marca (webhook de Neon): antes de mostrar la plataforma fuera del equipo.
- Billeteras: se eligen en noviembre (ADR-009, punto 2).
- Google en Production: decidí si alcanzan las credenciales compartidas de Neon mientras sea prototipo interno o si creás ya la app de OAuth en Google Cloud.
