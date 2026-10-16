# Proposal

## Why

ADR-009 (Aceptada el 15-oct-2026, opción C): el login pasa de Privy a **Neon Auth** ahora, antes de los primeros votos y consentimientos reales, para que la lista de personas viva en nuestra base y el formulario de login sea nuestro (con las casillas de consentimiento antes, en nuestro idioma). La identidad ya es `personas.id` con la tabla `cuentas` (`base-neon`); este cambio suma el segundo proveedor y el formulario propio, sin apagar Privy el mismo día.

## What Changes

- **Login con Neon Auth** (Managed Better Auth de Neon, en el esquema `neon_auth` de nuestra base): **código por email** (Email OTP) y **Google**, desde un formulario nuestro (`components/sesion/formulario-login.tsx`). Nada de la ventana ni de los componentes visuales de Neon.
- **El formulario de email de `entrar-por-email` es la única puerta** (flujo que Gus aprobó el 15-oct-2026, issue #67): la persona escribe su email, el servidor averigua si ya tiene cuenta y, **solo si es nuevo**, pide las casillas. Recién después el diálogo pide el código a Neon Auth (y ofrece "Entrar con Google"). **Quien ya tiene cuenta pide el código y entra directo, sin casillas.** Lo que en `consentimiento-alta` era "abrir la ventana de Privy" pasa a ser "mostrar el paso del código" dentro del mismo diálogo.
- **Puerta del servidor**: el manejador de Neon Auth (`app/api/auth/[...path]`) no deja pedir ni verificar un código, ni empezar Google, sin una cookie firmada por nuestro servidor que diga que **ese** email tiene cuenta o que la persona aceptó en el bloque. Así nadie crea su usuario en Neon Auth llamando la API a mano sin aceptar (ADR-005: nada a nombre de nadie sin consentimiento). Solo pasan las rutas de Neon Auth que usamos; con el mismo límite de pedidos por IP que la consulta de `entrar-por-email`, también contra el envío masivo de códigos al email de otra persona.
- **Vinculado a `personas` por `cuentas`**: la sesión de Neon Auth se traduce a la identidad de `base-neon` (proveedor `neon-auth`, id del usuario de Neon Auth, email y si está verificado). Una persona del equipo que ya tiene su cuenta de Privy y entra con Neon Auth con el mismo email verificado queda vinculada a la misma persona: mismo rol, mismo consentimiento, mismos votos. Un email sin verificar no entra.
- **Convivencia con Privy**: el servidor acepta las dos sesiones (token de Privy o cookie de Neon Auth). Una variable pública (`NEXT_PUBLIC_LH_LOGIN`: `privy` | `neon-auth`, por defecto `privy`) decide qué login abre el paso en cada entorno. Gus la cambia primero en Preview y, después, en Production.
- **Regla de ADR-008 y ADR-009 (punto 4)**: Production no pasa a `neon-auth` hasta que los previews salgan de la rama `previews` sin datos reales (pasos de `base-neon`). Si no se puede, Production sigue con Privy (con el email antes y `disableSignup`, `entrar-por-email` §7). **Si en el preview se vio que Privy no bloquea las altas** (`entrar-por-email` 3.3), Privy pide las casillas a todos, y pasar Production a `neon-auth` es la manera de sacarlas: el guion (6.1) lo dice.
- **Clave estable de los datos del navegador**: `idPersona` pasa a ser `personas.id` cuando la persona existe, para que cambiar de proveedor no esconda lo que la persona tiene guardado en el navegador; los datos guardados con la clave del id de Privy se copian una vez a la clave nueva.
- **Textos de privacidad**: Neon pasa a figurar también como encargado del login (borrador), con una versión nueva de la política.
- **Pruebas sin red** (formulario, paso antes del login, adaptador con un cliente simulado) y una prueba contra el preview con una persona de prueba de Neon Auth de la rama `previews`, que se salta si no está.

**Fuera de alcance:**
- **Retirar Privy** (sacar `@privy-io/*`, `privy-puente.tsx`, las variables de Privy, el sello "Billetera creada" y `idioma-hifa-avisos` 3.1): cambio aparte (`retiro-privy`), después de que este esté mergeado y Gus confirme que Production entra con Neon Auth (ADR-009, punto 6).
- **Emails del código en español y con nuestra marca** (webhook `send.otp` y proveedor de email): cambio aparte, antes de mostrar la plataforma fuera del equipo (ADR-009, punto 5). En el prototipo se acepta el email de Neon, en inglés.
- **Billeteras** (tabla `billeteras`, billetera embebida, vincular la billetera propia): se eligen en noviembre (ADR-009, punto 2).
- Email y contraseña, magic link, teléfono, SIWE, segundo factor, organizaciones; las pantallas de cuenta de Neon (`AccountView`, `UserButton`).
- Pasar a Next.js 16 (ver design: el SDK lo pide como dependencia par).
- Configurar Neon, Vercel o Google Cloud: lo hace Gus con los pasos del PR.
- Borrar de `neon_auth` el usuario que se creó sin aceptación (solo pasa si alguien entra con Google con otra cuenta que la del email que escribió, design §3.1): ahora es una consulta nuestra, pero queda para R29.
- La consulta de cuenta, sus límites y el paso del email: son de `entrar-por-email`.

## Capabilities

### New Capabilities
- `login-neon-auth`: entrar con Neon Auth (código por email y Google) desde el formulario propio, siempre después del paso de consentimiento; resolver la persona en sesión por `cuentas`; convivir con Privy hasta su retiro.

### Modified Capabilities

## Impact

Orden: después de `base-neon` (tabla `cuentas`, `IdentidadExterna`, `personaDeLaSesion`), `consentimiento-alta` (paso con las casillas, `abrirLogin()`, aceptación previa), `consentimiento-en-la-base` (el libro que dice quién tiene cuenta) y `entrar-por-email` (formulario de email, `POST /api/entrar`). No depende del Fogón, y el Fogón tampoco de este cambio. Archivos sumados por la puerta del servidor: `app/api/entrar/route.ts` (pone la cookie `lh-entrar`), `app/api/entrar/aceptar/route.ts` (nuevo), `lib/sesion/permiso-entrar.ts` (nuevo). Dependencia nueva: `@neondatabase/auth` (beta, versión fija). Archivos: `lib/sesion/proveedores/` (puerto `ClienteIdentidad`, adaptadores de Privy y Neon Auth), `lib/sesion/servidor.ts`, `app/api/auth/[...path]/route.ts`, `app/api/sesion/route.ts`, `components/sesion/formulario-login.tsx` (nuevo), `proveedor-sesion.tsx`, `contexto.ts`, `entrar-como.tsx`, `lib/demo/importar.ts` o similar (copia de la clave), `lib/privacidad/politica.ts`, `lib/legal/terminos.ts`, `drizzle.config.ts` (`schemaFilter`), `.env.example`, `playwright.config.ts`, e2e y tests. Variables nuevas: `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `NEXT_PUBLIC_LH_LOGIN`. Identidad, integración externa, cookies de sesión y datos personales: revisión de arquitectura.
