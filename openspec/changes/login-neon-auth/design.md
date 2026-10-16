# Design

## Context

- **ADR-009 (Aceptada, opción C):** Neon Auth para el login ahora; identidad propia (`personas.id`) con `cuentas`; billeteras en noviembre; Privy se queda hasta que este cambio esté mergeado y se borra después; no activar Neon Auth en Production mientras los previews puedan copiar datos reales (ADR-008 B).
- **ADR-008 (Aceptada, B + C):** previews desde la rama `previews` sin datos reales; modo de prueba solo `.test`. D (app de Privy aparte) descartada: su equivalente con Neon Auth es que **los usuarios de prueba de Neon Auth existen solo en la rama `previews`** (§6).
- **`base-neon`** deja: `cuentas` (proveedor `privy` | `neon-auth`, `id_externo`, `email_verificado`), `IdentidadExterna` en `lib/sesion/identidad.ts`, `personaDeLaSesion(db, identidad)` (por cuenta; si no, por email verificado, vinculando), `personaId` en `/api/sesion`.
- **`consentimiento-alta`** deja: el paso con las casillas, `abrirLogin()` privada del proveedor que solo llama el paso, `puedeAbrirLogin` y la aceptación previa en `sessionStorage` (5 minutos).
- **`entrar-por-email`** deja (flujo de Gus del 15-oct-2026): el diálogo empieza por el email; `POST /api/entrar` responde `{ paso: "entrar" | "consentimiento" }` con límite por IP; el bloque de casillas solo para emails nuevos; `abrirLogin(email, paso)`; la aceptación previa atada al email.
- Hoy el SDK de Privy se importa solo en `components/sesion/privy-puente.tsx` (cliente) y `lib/sesion/servidor.ts` (servidor); el resto usa `useSesion()` y `cabeceras()`.

## Goals / Non-Goals

**Goals:** entrar con Neon Auth (código por email y Google) desde un formulario propio detrás del paso de consentimiento; la misma persona venga de Privy o de Neon Auth; convivir con Privy sin cortar a nadie; probar el login real en previews sin datos reales.

**Non-Goals:** retirar Privy, emails propios en español, billeteras, otros métodos de login, Next.js 16 (ver Proposal, fuera de alcance).

## Ficha del proveedor (skill `integracion-externa` §1)

Fuentes: ADR-009 "Lo que se verificó" (documentación de Neon leída el 15-oct-2026) y el paquete `@neondatabase/auth@0.6.0-beta` bajado de npm el 15-oct-2026 (README, `llms.txt`, tipos). La documentación web de Neon **no se pudo leer desde la nube** en esta corrida; lo que no está en esas dos fuentes dice **a verificar**.

| Tema | Lo que hay | Fuente |
|---|---|---|
| Qué es | Better Auth 1.7.6 administrado por Neon; usuarios y sesiones en el esquema `neon_auth` de nuestra base; un Auth por rama | ADR-009; `package.json` del SDK (`better-auth` 1.7.6) |
| SDK | `@neondatabase/auth` **0.6.0-beta** (beta, "minor versions may include breaking changes"). Entradas: `/next/server` (`createNeonAuth({ baseUrl, cookies: { secret } })` con `handler()`, `getSession()`, `signIn…`), `/next` (`createAuthClient()` del navegador), `/server` (kit sin framework, `Request`/`Response`) | paquete npm |
| **Next.js** | El SDK declara `peerDependencies: next >= 16.0.0`; este repo usa **15.5.27**. Su `llms.txt` dice "Next.js 15+". **A verificar** al instalar (§1) | paquete npm |
| Métodos que usamos | Email OTP (`/email-otp/send-verification-otp`, `/sign-in/email-otp` en los tipos) y Google (`signIn.social({ provider: "google" })`) | tipos del SDK; ADR-009 |
| Qué no ofrece | SIWE, segundo factor (ADR-009). Textos del email del código: en inglés y con marca de Neon salvo webhook propio | ADR-009 |
| Autenticación | Variables `NEON_AUTH_BASE_URL` (URL del Auth de la rama; la integración de Vercel la inyecta en cada preview, ADR-009) y `NEON_AUTH_COOKIE_SECRET` (nuestra, mínimo 32 caracteres, firma las cookies; el SDK tira error si es más corta) | `llms.txt`; tipos de `/next/server` |
| Sesión | Cookie en nuestro dominio, a través del manejador `app/api/auth/[...path]`, con caché de datos de sesión de 300 s por defecto (`sessionDataTtl`). Atributos exactos (`HttpOnly`, `SameSite`) **a verificar** en el navegador | tipos de `/next/server` |
| Usuario | `id`, `email`, `emailVerified`, `name` (Better Auth) | tipos del SDK |
| Límites y costo | Hasta 60.000 usuarios activos por mes en el plan Free; el SMTP compartido de Neon tiene límite de envíos (cuánto: **a verificar**) | ADR-009 |
| Google | Neon trae credenciales compartidas para probar; Production necesita las nuestras (app de OAuth de Google Cloud, de Gus) | ADR-009 |
| Dominios | Lista de dominios permitidos con comodín | ADR-009 |
| **Dueño de cada dato** | Usuarios y sesiones: NetX (están en nuestra base, esquema `neon_auth`, administrado por Neon). No copiamos nada del usuario de Neon Auth salvo `id` (en `cuentas.id_externo`) y el email verificado al vincular (`cuentas.email_verificado`). El email vigente y el nombre de la plataforma viven en `personas` | ADR-009; `base-neon` |
| Si no está | Mientras siga Privy: Gus vuelve `NEXT_PUBLIC_LH_LOGIN` a `privy` en Vercel. Después del retiro: la persona sigue anónima con el error de la spec; las páginas públicas siguen | este design |

## Decisions

### 1. Servidor: un puerto, dos adaptadores
- **Puerto** `ClienteIdentidad` en `lib/sesion/proveedores/puerto.ts`: `identidad(req: Request): Promise<IdentidadExterna | null | "invalida">` (`null` = no hay sesión de este proveedor en el pedido; `"invalida"` = hay algo pero no se pudo verificar). Es el `ClientePrivy` → `ClienteIdentidad` de ADR-009.
- **Adaptadores:** `privy.ts` (lo de hoy: token `Bearer`, `verifyAuthToken` + `getUser`) y `neon-auth.ts` (lee la sesión de Neon Auth del pedido y devuelve `{ proveedor: "neon-auth", idExterno: user.id, email, emailVerificado: user.emailVerified, nombre: user.name }`). `index.ts` arma la lista según las variables: un adaptador sin sus variables no se crea y se avisa una vez en el log. **Ninguna pantalla ni ruta importa un adaptador directo**: todo pasa por `sesionDelPedido`.
- **SDK y Next 15:** primero `@neondatabase/auth/next/server` (`createNeonAuth`) con la versión **fija** `0.6.0-beta` (sin `^`). Si `pnpm install` falla por la dependencia par de Next 16, o `pnpm verificar`/`pnpm build` fallan por eso, usar `@neondatabase/auth/server` (`createAuthServer` y `handleAuthProxyRequest`, que trabajan con `Request`/`Response` estándar) en el manejador y en el adaptador, y anotarlo en el PR. Si ninguna de las dos anda en Next 15.5, **frenar y reportar** (pasar a Next 16 es otra decisión, de Gus). No usar `--force` ni `--legacy-peer-deps` sin anotarlo.
- **Manejador** `app/api/auth/[...path]/route.ts` (`GET`, `POST`): el proxy del SDK al Auth de la rama. Sin `NEON_AUTH_BASE_URL` o `NEON_AUTH_COOKIE_SECRET` responde 503 con `{ ok: false }` y lo avisa en el log (sin valores).
- **`sesionDelPedido(req)`**, en este orden: (1) cabecera de prueba si `modoPruebaActivo` (regla `.test` de `base-neon`); (2) `Authorization: Bearer` → Privy; (3) sesión de Neon Auth en la cookie; (4) nada → 401. Con un `"invalida"`, 401. Con la identidad, `personaDeLaSesion` de `base-neon`. Si ningún proveedor está configurado y no hay modo de prueba, 503 (como hoy).
- **Email sin verificar con Neon Auth → 403** (spec). Con código por email y con Google el email siempre llega verificado; la regla cierra la puerta si algún día se habilita otro método (por ejemplo email y contraseña en la rama `previews`, §6).
- **`drizzle.config.ts` con `schemaFilter: ["public"]`**: nuestras migraciones nunca tocan el esquema `neon_auth` (lo administra Neon). Nada de este cambio crea tablas.

### 2. Cookies y rutas que escriben
- Con Neon Auth la sesión viaja en una **cookie** de nuestro dominio, no en una cabecera. `cabeceras()` (`components/sesion/contexto.ts`) deja de mandar `Authorization` cuando el login es Neon Auth; los `fetch` a `/api` son del mismo origen y llevan la cookie solos.
- Una cookie se manda sola también desde otro sitio: **toda ruta que escribe** a nombre de la persona tiene que mantener el molde de ADR-006 (tipo de contenido JSON y `Origin` propio), que ya piden `consentimiento-en-la-base` y `fogon-cuadratico-en-la-base`. Este cambio suma un test de las rutas que hoy escriben con sesión (las que existan en `main` al implementarlo): con la cookie de Neon Auth simulada y `Origin` ajeno, 403.
- Atributos de la cookie (`HttpOnly`, `Secure`, `SameSite`): **a verificar** en el preview y anotar en el PR. Si no fuera `HttpOnly`, frenar y reportar.

### 3. Cliente: después del email, el código
- **La puerta es la de `entrar-por-email`** (ya no "casillas para todos"): el diálogo pide el email, consulta `POST /api/entrar` y, solo para un email nuevo, muestra el bloque. `abrirLogin(email, paso)` (privada del proveedor) mira `NEXT_PUBLIC_LH_LOGIN`: con `neon-auth` muestra `formulario-login.tsx` **dentro del mismo diálogo**, con el email ya elegido; con `privy` o sin la variable, la ventana de Privy con `prefill` y `disableSignup` (`entrar-por-email` §7); en el modo de prueba, "Entrar como…". La aceptación previa (5 minutos, atada al email) no cambia. Lo de `consentimiento-alta` §8 (enlaces `legal` en la ventana de Privy) no aplica al formulario propio: el diálogo ya muestra los enlaces a quien acepta.
- **Con cuenta, sin casillas:** para `paso = "entrar"`, el diálogo pasa del email al código sin bloque. Para `paso = "consentimiento"`, antes de pedir el código el cliente llama `POST /api/entrar/aceptar` (§3.1) al aceptar en el bloque.
- **`formulario-login.tsx`** (nuevo): al abrirse pide el código solo (`emailOtp.sendVerificationOtp({ email, type: "sign-in" })`) y muestra "Te mandamos un código a <email>" + campo del código (foco ahí) + "Entrar" + "Mandar otro código" + "Usar otro email" (vuelve al paso del email de `entrar-por-email`) y, separado, "Entrar con Google". Usa el cliente del SDK (`createAuthClient()` de `@neondatabase/auth/next`, o el equivalente si §1 cae al kit sin framework) **solo dentro de este archivo y del proveedor**. Textos en el diccionario de idioma si `idioma-base` ya está en `main`; si no, en español. Etiquetas visibles, errores con `role="alert"` y `aria-describedby`, foco al error, todo con teclado, sin colores sueltos (tokens del tema).
- **Google**: `signIn.social({ provider: "google", callbackURL: <la página donde estaba> })`, con el email como sugerencia de cuenta si el SDK lo permite (`loginHint`, **a verificar** en los tipos). La aceptación previa vive en `sessionStorage` de la pestaña y sobrevive a la ida y vuelta a Google; al volver, el proveedor la consume como en el camino del código, **solo si el email de Google es el que escribió** (`entrar-por-email` §5). Si volvió después de los 5 minutos o con otra cuenta de Google, aparece la pantalla de consentimiento (red de seguridad de `consentimiento-alta` §3).

### 3.1 Puerta del servidor: sin cookie `lh-entrar`, Neon Auth no recibe el email
<!-- Flujo de Gus del 15-oct-2026: un email nuevo no puede pedir el código sin aceptar. El cliente lo cumple, pero la API de Neon Auth pasa por nuestro manejador y se puede llamar a mano. -->
- **Cookie `lh-entrar`** (`lib/sesion/permiso-entrar.ts`, funciones puras con test): valor `base64url(email normalizado) . estado . vence . firma`, con `estado` de un carácter (`e` = tiene cuenta, `c` = nuevo sin aceptar, `a` = nuevo que aceptó), `vence` a 10 minutos y `firma` = HMAC-SHA256 con una clave derivada de `NEON_AUTH_COOKIE_SECRET` (HMAC del secreto con la etiqueta `lh-entrar`; sin variable nueva). Atributos: `HttpOnly`, `Secure` (salvo `http://localhost`), `SameSite=Strict`, `Path=/api`, `Max-Age=600`.
- **`POST /api/entrar`** (de `entrar-por-email`), con Neon Auth configurado, pone la cookie **en los dos casos** (`e` o `c`, mismo largo: el estado es un solo carácter), así las cabeceras no dicen más que el cuerpo. Sin Neon Auth configurado, no la pone (como hoy).
- **`POST /api/entrar/aceptar`** (nuevo) `{ version }`: exige `lh-entrar` válida con estado `c` y `version = VERSION_POLITICA`; responde 200 y reemplaza la cookie por una con estado `a` (vence de nuevo a 10 minutos). Molde ADR-006 (JSON y origen propio). No escribe nada en la base: la constancia se registra después del login (`consentimiento-en-la-base`). 403 sin cookie válida o con estado `e`; 422 con otra versión.
- **El manejador `app/api/auth/[...path]`** (de §1) pasa al SDK **solo** estas rutas: `get-session`, `sign-out`, `email-otp/send-verification-otp`, `sign-in/email-otp`, `sign-in/social`, `callback/google` y, solo si `VERCEL_ENV` no es `production`, `sign-in/email` (la prueba de §6; la contraseña solo existe en la rama `previews`, regla dura de §6). Cualquier otra ruta, 404 (así `sign-up/email`, magic link y lo demás no se pueden usar aunque estén prendidos en el panel).
  - `email-otp/send-verification-otp` y `sign-in/email-otp` (y `sign-in/email` de prueba): el `email` del cuerpo tiene que ser igual al de la cookie y su estado `e` o `a`; si no, 403 `{ ok: false }` **sin llamar a Neon Auth**.
  - `sign-in/social`: cookie válida con estado `e` o `a` (el email de Google no se conoce antes); si no, 403.
  - **Límite:** `send-verification-otp` usa el mismo límite por IP que `POST /api/entrar` (`crearLimite({ sal: "entrar" })`, con la misma regla del modo de prueba): frena tanto probar emails por esta ruta como mandar muchos códigos al email de otra persona.
- **Lo que esta puerta no cubre:** quien empieza Google con la cookie de su email y elige en Google **otra** cuenta sin aceptación: Better Auth crea ese usuario en `neon_auth` al volver. La plataforma igual lo trata como anónimo (la aceptación previa no coincide) y le muestra la pantalla; si no acepta, el usuario queda en `neon_auth` sin nada nuestro. Borrarlo (una consulta nuestra o el plugin Admin) queda para R29 (fuera de alcance). Si en el panel de Neon se puede desactivar el alta automática con Google, **a verificar**, se anota en el guion.
- Con Privy o en modo de prueba nada de esto corre: con Privy la protección es `disableSignup` (`entrar-por-email` §7); el modo de prueba no tiene proveedor.
- **Errores**: código equivocado o vencido → "El código no es correcto o venció. Pedí uno nuevo."; Neon Auth no responde, 5xx o respuesta con otra forma → "No pudimos iniciar sesión. Probá de nuevo."; 503 del manejador → "El login no está disponible en este momento.". Todos con `role="alert"`; la persona sigue sin sesión.
- **Contexto** (`contexto.ts`): `privyDisponible` → `loginDisponible`, `PrivyMinimo` → `IdentidadMinima` con `proveedor`. El nombre que muestra el perfil sale de la sesión sea cual sea el proveedor. Con Neon Auth no hay billetera: el sello "Billetera creada" **no aparece** (no es "cero"); lo resuelven las billeteras de noviembre.
- **Salir**: cierra la sesión del proveedor en uso (`signOut` de Neon Auth o `logout` de Privy) y limpia lo mismo que hoy.
- **Test de fuente** (como el de `consentimiento-alta` 3.3): falla si `signIn`, `emailOtp` o `createAuthClient` de `@neondatabase/auth` aparecen fuera de `formulario-login.tsx`, el proveedor y `lib/sesion/proveedores/`, o si `formulario-login` se monta fuera del paso.

### 4. Clave estable del navegador
- `/api/sesion` devuelve `idPersona = personas.id` cuando la persona existe (en el modo de prueba sigue `prueba:<email>`; una persona nueva todavía sin fila, `<proveedor>:<idExterno>`), y `clavesAnteriores`: los `id_externo` de las otras cuentas de esa persona (por ejemplo su id de Privy).
<!-- arquitecto: "los id_externo de las otras cuentas" no cubre dos casos: la clave que la misma persona usó entre el login y su primer `acepta` (su cuenta actual, no "otra"), y el prefijo `neon-auth:` de la persona nueva. Sin esto, lo guardado en ese rato queda huérfano. -->
- **`clavesAnteriores` = los valores exactos que `idPersona` tuvo para esa persona**, de **todas** sus cuentas (también la de la sesión actual): para `privy`, el `id_externo` tal cual (`did:privy:…`, como hoy); para `neon-auth`, `neon-auth:<id_externo>`. Una función pura `claveAnterior(proveedor, idExterno)` arma las dos formas y la usan tanto `/api/sesion` (para la persona nueva) como `clavesAnteriores`; test que compara las dos salidas.
- Al recibir la sesión, el cliente copia **una vez** las claves `u:<anterior>:*` a `u:<idPersona>:*` que todavía no existan en la nueva (no pisa nada) y anota que ya copió (`u:<idPersona>:lh-claves-copiadas`). No borra las viejas. Va junto a la importación de `lib/demo/importar.ts` (mismo patrón, función pura con su test).
- Por qué acá y no en `base-neon`: es este cambio el que cambia el id que el proveedor da a la persona; con `personas.id` como clave, el próximo cambio de proveedor ya no mueve nada.

### 5. Textos de privacidad
- `lib/privacidad/politica.ts`: en `ENCARGADOS`, Neon pasa a "Base de datos y login (Neon Auth)" y "En uso"; Privy queda "Login y billetera, hasta que se retire". En la fila del login de `DATOS_POR_PANTALLA`: "Privy o Neon (Neon Auth), según cómo entraste". La cláusula de transferencia de `lib/legal/terminos.ts` ya nombra a Neon: solo se revisa. Todo texto nuevo, `borrador: true`.
- **Versión nueva de la política** (`VERSIONES_POLITICA`) con un cambio listado: "El login pasa a hacerse con Neon (Neon Auth); Privy se va a retirar". Consecuencia: el equipo vuelve a aceptar una vez. Si Gus prefiere no cambiar la versión, se quita esta línea y se anota en el PR (pregunta abierta).

### 6. Previews y la persona de prueba de Neon Auth (equivalente de ADR-008 D)
- Los previews toman el Auth de su rama, copiado de la rama madre `previews` (ADR-008 B, `base-neon`): solo usuarios de prueba, nunca los reales.
- **Persona de prueba de Neon Auth**: `login@prueba.test`, creada **solo en la rama `previews`** (por Gus). Con código por email no se puede (el código va a un buzón que no existe), así que la prueba automática necesita **email y contraseña habilitado solo en la rama `previews`**. Si la configuración de métodos es por rama, se puede; si es una sola para todo el proyecto, habilitar contraseña también en Production no lo queremos (el formulario no lo ofrece, pero la API lo aceptaría) y la prueba automática del login real queda como guion manual. **A verificar** en el panel de Neon.
<!-- arquitecto: con contraseña habilitada donde hay personas reales se abre el "secuestro previo de cuenta": alguien se registra con contraseña usando el email de otra persona (queda sin verificar), y cuando la dueña real entra con Google, Better Auth puede unir Google a ese usuario y marcar el email como verificado; quien puso la contraseña entra como ella y nuestro servidor la vincula a su persona por email verificado. -->
- **Regla dura: email y contraseña nunca habilitado en una rama con personas reales** (la principal, ni ninguna copiada de ella). No alcanza con que el formulario no lo ofrezca: la API de Neon Auth lo aceptaría desde afuera, y con la unión automática de cuentas de Better Auth (Google + usuario creado con contraseña y el mismo email) alguien podría preparar una cuenta con el email de otra persona y quedarse con ella cuando la dueña entre con Google. Si los métodos son por proyecto y no por rama, **no se habilita contraseña en ningún lado** y 5.2 queda como guion manual. El guion (6.1, paso 3) lo dice así, y el PR anota qué se verificó en el panel.
- `e2e/login-neon-auth-preview.spec.ts`: se salta sin `BASE_URL`, `NEON_AUTH_PRUEBA_EMAIL` o `NEON_AUTH_PRUEBA_CLAVE` (solo en el `.env.local` de quien corre); pasa por la puerta como el formulario (`POST /api/entrar` con su email y, si responde `consentimiento`, `POST /api/entrar/aceptar`), entra por `POST /api/auth/sign-in/email` con esa persona, abre una página con sesión y verifica que `/api/sesion` responde con su rol y `personaId`. El consentimiento lo siembra por la API si `consentimiento-en-la-base` ya está; si no, por el paso.
- `login@prueba.test` también va a `scripts/datos-previews.sql` como persona (rol `persona`), para que exista en `personas` de la rama `previews`.

### 7. Pruebas sin red
- Vitest: adaptador de Neon Auth con un cliente simulado (sesión válida, sin sesión, email sin verificar, respuesta con otra forma → `"invalida"`); `sesionDelPedido` con los cuatro casos de orden (prueba, Privy, Neon Auth, nada) y con los dos proveedores para la misma persona (PGlite: la persona de Privy entra con Neon Auth y queda vinculada); copia de claves (copia, no pisa, no repite); textos de la política (versión nueva con su cambio); **puerta de §3.1**: la cookie `lh-entrar` (firma buena, firma mala, vencida, otro email, mismo largo con `e` y `c`); `/api/entrar/aceptar` (`c` → `a`, `e` → 403, sin cookie → 403, otra versión → 422); el manejador con un SDK simulado: sin cookie o con estado `c`, `send-verification-otp`, `sign-in/email-otp` y `sign-in/social` dan 403 y el SDK no se llama; con `e` o `a` y el mismo email, se llama; con otro email en el cuerpo, 403; `sign-up/email` y una ruta cualquiera, 404; `sign-in/email` con `VERCEL_ENV=production`, 404; el 11.º `send-verification-otp` de la misma IP, 429.
- E2E local (sin Neon Auth configurado, `NEXT_PUBLIC_LH_LOGIN=neon-auth` en el `webServer` de Playwright solo para este archivo o con un proyecto aparte): email nuevo → el bloque; mientras no se acepta, **ningún pedido a `/api/auth/`** (se escuchan los pedidos de la página); al aceptar aparece el paso del código con el foco en el campo; email con cuenta (consentimiento sembrado) → el paso del código **sin** bloque; con `/api/auth/**` interceptado: código pedido → paso 2; código equivocado (401 simulado) → su error; 500 → "No pudimos iniciar sesión…"; 503 → "El login no está disponible…"; todo con teclado; auditoría de axe del paso con el formulario abierto. Con la variable en `privy` (o sin ella), los e2e de hoy siguen igual.

## Risks / Trade-offs

- [SDK beta y dependencia par de Next 16] → versión fija, el camino del kit sin framework (§1) y frenar si ninguno anda; pasar a Next 16 sería un cambio aparte, decisión de Gus.
- [Email del código en inglés y con marca de Neon] → aceptado en el prototipo interno (ADR-009, punto 5); el webhook propio va antes de mostrar la plataforma fuera del equipo.
- [Límite de envíos del SMTP compartido de Neon] → con el equipo alcanza; si se cae el envío, el formulario muestra el error y Gus puede volver a `privy` mientras exista.
- [Comodín de dominios demasiado amplio (`https://*.vercel.app` deja a cualquier proyecto de Vercel como origen permitido)] → usar el patrón más angosto que acepte Neon para los previews del proyecto (por ejemplo `https://lighthouse-platform-*.vercel.app`; **a verificar** qué formas acepta) y el dominio de Production.
- [Cookie de sesión y rutas que escriben] → molde de ADR-006 en cada ruta y el test de §2.
- [Vincular por email verificado] → mismo riesgo y misma regla que en `base-neon`; con Neon Auth, además, 403 si el email no está verificado.
- [Dos sesiones a la vez (Privy y Neon Auth) en el mismo navegador] → el servidor toma la primera que encuentra en el orden de §1 (Privy antes que Neon Auth); "Salir" cierra la del proveedor en uso, y si queda la otra, la persona sigue con esa. Raro y solo durante la convivencia.
- [Tamaño] → son dos noches de ADR-009 (servidor y formulario), y la puerta de §3.1 suma un poco a la primera. Si la noche no alcanza, cortar después de la sección 2 de tareas (servidor, manejador **con su puerta**, sin cambio visible porque la variable sigue en `privy`) con su PR, y seguir en otra noche. La puerta no se puede dejar para después: sin ella, prender `neon-auth` deja crear usuarios sin aceptar.
- [Alguien prueba emails por la ruta del código en lugar de la consulta] → la ruta exige la cookie de la consulta y comparte su límite (§3.1).
- [Mandar muchos códigos al email de otra persona] → límite por IP en `send-verification-otp` más el límite propio del SMTP de Neon.
- [Google con otra cuenta crea un usuario en `neon_auth` sin aceptación] → la persona queda anónima y ve la pantalla; el usuario huérfano queda hasta R29 (§3.1).
- [La clave de la cookie se deriva del secreto de las cookies de Neon Auth] → una sola variable que rotar; si Gus prefiere una variable aparte (`LH_ENTRAR_SECRETO`), es un cambio de una línea (pregunta abierta).

## Migration Plan

1. Merge con `NEXT_PUBLIC_LH_LOGIN` sin cargar: nada cambia para nadie (Privy).
2. Gus hace los pasos de Neon y Vercel (tasks 6.1) y pone `NEXT_PUBLIC_LH_LOGIN=neon-auth` en **Preview**; prueba con el guion.
3. Con ADR-008 B verificado (los previews salen de `previews`), Gus pone `neon-auth` en **Production**. Las personas del equipo entran con su email; su cuenta de Neon Auth se vincula sola a su persona.
4. Volver atrás: `NEXT_PUBLIC_LH_LOGIN=privy` (o borrarla) y un nuevo deploy. Las filas de `cuentas` de `neon-auth` quedan (no molestan).
5. Después, `retiro-privy` (otro cambio).

## Open Questions

- ¿La integración de Vercel inyecta `NEON_AUTH_BASE_URL` también en Production y Development, o hay que cargarla a mano? **A verificar** por Gus.
- ¿La configuración de métodos de Neon Auth (para habilitar contraseña solo en `previews`) y la de dominios permitidos son por rama o por proyecto? **A verificar** por Gus (§6).
- ¿Activar Neon Auth en la rama principal de Neon lo activa en ramas ya creadas, como `previews`? **A verificar**; si no, activarlo también en `previews`.
- Versión nueva de la política (§5): ¿Gus prefiere que el equipo vuelva a aceptar ahora, o esperar a `retiro-privy`?
- Google en Production: ¿se usan las credenciales compartidas de Neon mientras sea prototipo interno, o Gus crea ya la app de OAuth en Google Cloud?
- Revisión del arquitecto pendiente para lo sumado el 16-oct-2026 (§3 y §3.1: puerta del servidor, cookie `lh-entrar`, clave derivada, lista de rutas permitidas).
- ¿El panel de Neon Auth deja desactivar el alta automática con Google (para que una cuenta de Google nueva no cree usuario sin pasar por nuestra puerta)? **A verificar** por Gus.
