# ADR-009 · El login pasa a Neon Auth ahora, con el login propio, la identidad nuestra y una billetera sin dueño fijo; el proveedor de billeteras se elige en noviembre con una prueba

- **Estado:** Aceptada (Gus eligió la opción C el 2026-10-15: Neon Auth ahora para el login; billeteras en noviembre con una prueba de una noche)
- **Fecha:** 2026-10-15
- **Cambio OpenSpec relacionado:** ninguno todavía (lo abre la recomendación: `identidad-neon-auth`). Toca las specs aprobadas sin implementar `base-neon`, `consentimiento-alta`, `idioma-hifa-avisos` y, en el PR #76, `consentimiento-en-la-base` y `fogon-cuadratico-en-la-base`. Se apoya en ADR-001, ADR-005, ADR-006 y ADR-008 (PR #76).

## Contexto
Hoy el login es Privy en modo desarrollo: su ventana (email con código y Google) crea además una billetera embebida para todos (`createOnLogin`). Tres cosas obligan a decidir ahora:
1. **Las Semillas van a ser tokens soulbound** (intransferibles, viven en una dirección de blockchain para siempre), con lanzamiento entre diciembre de 2026 y febrero de 2027. Cada persona necesita una dirección: la mayoría, una billetera que crea la plataforma (embebida); algunas, la suya propia.
2. **La ventana de Privy no deja poner nuestras casillas** de consentimiento (ADR-005). Ya está pendiente el seguimiento "login-propio": un formulario nuestro con el login headless de Privy (headless: sin su ventana, llamando a su SDK desde nuestro formulario).
3. **`base-neon` todavía no se implementó** y el Fogón con el equipo real (PR #76) va a guardar los primeros votos y consentimientos con identidad. Hoy las specs atan esas filas a `privy_id`. Cambiar de proveedor antes de que haya datos reales es una noche de código; después, es además una migración de datos reales.

Neon ya está creado y conectado a Vercel (base `neon-cyan-diamond`, US East, una rama por preview). Neon Auth no está activado.

## Lo que se verificó (consulta del 15-oct-2026)
Documentación de Neon, leída el 15-oct-2026: `neon.com/docs/auth/about`, `/auth/roadmap`, `/auth/branching-authentication`, `/auth/production-checklist`, `/auth/guides/plugins/email-otp`, `/auth/guides/customize-emails`, `/auth/guides/configure-domains`, `/guides/vercel-overview` y `/guides/vercel-managed-integration`. SDK de Privy instalado (`@privy-io/react-auth` 3.48.1, `@privy-io/server-auth` 1.32.5) y página `privy.io/pricing`.

| Tema | Lo que dice la fuente | Para nosotros |
|---|---|---|
| Qué es | "Managed Better Auth": Better Auth 1.7.6 administrado por Neon, **disponible para todos** (GA). Usuarios, sesiones y configuración en el esquema `neon_auth` de nuestra base | La identidad queda en nuestro Postgres (ADR-001), consultable con SQL |
| Métodos | Email y contraseña, Google/GitHub/Vercel, **Email OTP** (código por email), Magic Link, Phone, JWT, Admin, Organization (parcial), OpenAPI | Alcanza para lo de hoy: código por email + Google |
| SIWE (entrar firmando con la billetera propia) | **No está entre los plugins soportados**: "Other plugins: based on demand". Better Auth sí tiene plugin SIWE, pero solo si lo alojamos nosotros | Quien trae su billetera la **vincula** con una firma que verificamos nosotros (no entra con ella) |
| MFA (segundo factor) | "Coming soon" | No lo necesitamos en el prototipo |
| Ramas | Cada rama de la base tiene su propio Auth, con su URL; **copia los usuarios y sesiones de la rama madre** al crearse. La integración de Vercel lo activa sola en cada preview si está activo en la rama de producción, e inyecta `NEON_AUTH_BASE_URL` | Bueno para probar; **choca con ADR-008** si la rama madre de los previews es producción (copiaría emails reales) |
| Dominios | Lista de dominios permitidos, acepta comodín (`https://*.vercel.app` del equipo) | Un comodín para todos los previews |
| Emails | Por defecto, SMTP compartido (`auth@mail.myneon.app`), **con marca de Neon y límite de envíos**. SMTP propio cambia el remitente pero no el texto. Para textos propios (y **en español**): webhook `send.otp` y lo mandamos nosotros (Resend, Postmark, …). Plantillas en el panel: "planeadas" | Para que el código llegue en español con nuestra marca hace falta un proveedor de email nuestro: un encargado de datos más |
| Google | Trae credenciales de Google compartidas para probar; producción necesita las nuestras | Gus crea la app de OAuth en Google Cloud |
| Precio | Incluido en todos los planes de Neon: **hasta 60.000 usuarios activos por mes en el plan Free** | Sin costo por usuario en el horizonte del Congreso |
| Privy | El SDK instalado trae `useLoginWithEmail`, `useLoginWithOAuth`, `useLoginWithSiwe`, `useLinkWithSiwe`, `useCreateWallet`. Precio: plan gratis con tope de **500 usuarios activos por mes** (al llegar, "new users will no longer be able" a entrar), planes pagos de US$ 299 y US$ 499 por mes y US$ 0,05 por usuario arriba de 10.000 (texto de la página, sin poder leer la tabla completa) | El login propio con Privy es posible hoy. **A verificar** en la página: qué plan corresponde y desde cuántos usuarios se paga |

**Sin verificar (hay que mirarlo antes de aceptar):** si la integración de Vercel deja elegir la **rama madre** de los previews (lo mismo que pide ADR-008); si Privy, Dynamic o thirdweb aceptan **el JWT de Neon Auth** como login externo para crear billeteras embebidas ("custom auth", y si es de un plan pago); los precios de esos tres y de Resend; el plan de Neon en el que está la cuenta.

## Opciones

### A · Seguir con Privy, con login propio headless
Formulario nuestro (dentro del paso de consentimiento) que llama a `useLoginWithEmail` y `useLoginWithOAuth`. La billetera embebida sigue como hoy; en diciembre se suma `useLinkWithSiwe` para quien trae la suya.
- **Noches:** 1 para el login propio (`components/sesion/privy-puente.tsx`, `proveedor-sesion.tsx`, un `formulario-login.tsx` nuevo, `consentimiento-alta` tareas 3.3, 3.5 y 4.2, `idioma-hifa-avisos` 3.1 pasa a ser texto nuestro) + 1 en diciembre para vincular la billetera propia y la tabla de billeteras. **Total ≈ 2.** Más la segunda app de Privy para previews (ADR-008 D, configuración de Gus).
- **Costo mensual:** 0 mientras haya menos de 500 personas activas por mes; arriba, plan pago (del orden de US$ 299 por mes, **a verificar**). El Congreso de febrero puede pasar ese tope.
- **Soulbound:** lo más simple. Una sola empresa da login, billetera embebida y vinculación de la propia, ya integrada.
- **Ramas de preview:** Privy no se ramifica: todos los previews comparten la app de Privy de previews (ADR-008 D).
- **Emails del código:** los manda Privy, con su remitente; el idioma depende de lo que deje configurar su panel (a verificar).
- **Modo de prueba:** sin cambios.
- **Consentimiento antes del alta:** se cumple con el formulario propio. Pero el usuario y su email viven en Privy: **borrar a quien no acepta sigue pendiente** (R29) y es una llamada a su API.
- **Riesgos:** la lista de personas (emails) es de Privy, no nuestra; dependemos de un proveedor para entrar, para la billetera y para el precio; las llaves de las billeteras embebidas son de Privy y salir de Privy con Semillas ya emitidas es difícil.

### B · Neon Auth para el login + proveedor de billeteras embebidas solo para billeteras + firma propia para quien trae la suya
Login con Neon Auth (código por email y Google) en nuestro formulario. La billetera embebida la crea otro proveedor (Privy wallets, Dynamic, thirdweb u otro) **usando el login de Neon** (JWT). Quien trae su billetera firma un mensaje y el servidor lo verifica (lo que hace SIWE, sin el plugin).
- **Noches:** 3 para el login (detalle abajo) + 1 o 2 para la billetera embebida con login externo + 1 para vincular la propia. **Total ≈ 5 a 6**, todas antes de diciembre.
- **Costo mensual:** Neon Auth 0 (dentro del plan). Billeteras: según proveedor, **a verificar**; si es Privy, se sigue pagando a Privy por usuario activo (no se ahorra). Email propio (Resend u otro): plan gratis o pocos dólares, **a verificar**.
- **Soulbound:** la persona tiene un id nuestro y una o más direcciones en una tabla nuestra; el proveedor de billeteras se puede cambiar para las personas nuevas sin tocar el login.
- **Ramas de preview:** cada preview tiene su Auth, con usuarios copiados de la rama madre. Si la madre es una rama sin datos reales (ADR-008 B), los previews traen **personas de prueba con contraseña conocida** y los e2e pueden entrar "de verdad" sin la segunda app de Privy.
- **Emails:** los manda Neon (en inglés, con su marca) hasta que hagamos el webhook `send.otp` con nuestro proveedor y textos en español e inglés.
- **Modo de prueba:** sin cambios (el atajo `x-lh-prueba` no depende del proveedor).
- **Consentimiento antes del alta:** el formulario es nuestro y el usuario vive en nuestra base: borrar a quien no acepta es una consulta SQL (o el plugin Admin). Resuelve el pendiente de ADR-005.
- **Riesgos:** dos sistemas de identidad (Neon y el de billeteras) que **no se pueden mezclar**: la única persona es nuestro `personas.id`; si el proveedor de billeteras no acepta el JWT de Neon, hay que cambiar de proveedor o de plan; más noches antes de diciembre.

### C · Neon Auth ahora y billeteras recién en diciembre
Lo mismo que B, partido: las 3 noches del login ahora; billeteras y vinculación en diciembre.
- **Noches:** 3 ahora + 2 a 3 en diciembre.
- **Riesgo propio:** se elige el proveedor de billeteras con el lanzamiento encima. Si en diciembre ninguno acepta el JWT de Neon como queremos, el plan se aprieta justo antes de emitir Semillas.
- El resto, igual que B.

### D · No decidir hasta diciembre
- **Noches:** 0 ahora. Pero el login propio con Privy (1 noche) se haría igual y se tiraría si después se migra; y `base-neon`, el consentimiento y el Fogón guardarían filas con `privy_id`. Migrar en diciembre: 3 noches + 1 de migración de datos reales (votos y consentimientos), con el lanzamiento encima.
- **Riesgo:** es la opción más cara si al final se migra, y la decisión de billeteras llega igual de apurada que en C.

### Cuánto cuesta la migración del login (B y C), archivo por archivo
La sesión ya está bien encerrada: el SDK de Privy se importa solo en `components/sesion/privy-puente.tsx` (cliente) y `lib/sesion/servidor.ts` (servidor), y el resto de la app usa `useSesion()` y `cabeceras()`. Por eso son ~3 noches y no más.
- **Noche 1 · servidor y sesión.** `lib/sesion/verificar.ts` (el tipo `ClientePrivy` pasa a `ClienteIdentidad`), `lib/sesion/servidor.ts` (lee la sesión de Neon Auth por cookie), `verificar.test.ts`, nuevo `app/api/auth/[...path]/route.ts`, `.env.example`, `package.json` (sale `@privy-io/*`, entra `@neondatabase/auth`), `app/api/sesion/route.ts` (comentarios). `cabeceras()` deja de mandar `Authorization` y la sesión viaja en una cookie `HttpOnly` (con `SameSite`; revisar las rutas que escriben de ADR-006).
- **Noche 2 · formulario propio.** `components/sesion/privy-puente.tsx` se reemplaza por el cliente de Neon, `proveedor-sesion.tsx` y `contexto.ts` (`PrivyMinimo` → `IdentidadMinima`, `privyDisponible` → `loginDisponible`), nuevo `formulario-login.tsx` dentro del paso de consentimiento (email → código; Google), `entrar-como.tsx`, `app/perfil/perfil-cliente.tsx` y `lib/perfil/modelo.ts` (el nombre viene de la sesión), `app/pasaporte/sello-billetera.tsx` (sin billetera hasta diciembre: el sello no aparece; no es "cero"), `playwright.config.ts` y `e2e/ayudas.ts` (dominios a bloquear), los `test.skip` "con Privy" de `e2e/privacidad.spec.ts` y `e2e/pasaporte.spec.ts`.
- **Noche 3 · emails y textos.** Webhook `send.otp` firmado (`app/api/auth/correo/route.ts`, verificación de firma como en la documentación) con textos es/en y el proveedor de email; `lib/privacidad/politica.ts` y `lib/legal/terminos.ts` (encargados: sale Privy, entran Neon Auth y el de email, como borrador).
- **Specs que cambian** (las enmienda el especificador, no este ADR): `base-neon` (`privy_id` → id de la cuenta de login genérico, ver Decisión), `consentimiento-alta` (§1, §8 y tareas 3.3, 3.5, 4.2: el "pedido a Privy" pasa a ser "pedido a Neon Auth"), `consentimiento-en-la-base` (búsqueda y lock por la cuenta de login, no por `privy_id`), `fogon-cuadratico-en-la-base` §6 (prueba real con una persona de prueba de la rama de previews en lugar de la cuenta de prueba de Privy), `idioma-hifa-avisos` 3.1 (se va: la ventana es nuestra), ADR-008 opción D (deja de hacer falta) y `login-privy` (queda como historia).

### Tabla corta
| | A · Privy | B · Neon + billeteras ya | C · Neon ya, billeteras dic | D · Esperar |
|---|---|---|---|---|
| Noches antes de dic. | 1 | 5–6 | 3 | 1 (que se tira si se migra) |
| Noches en dic. | 1 | 0 | 2–3 | 4–5 |
| Dueño de la lista de personas | Privy | NetX | NetX | Privy |
| Costo por usuario | gratis < 500/mes, después pago (verificar) | 0 login + billeteras (verificar) | igual que B | igual que A |
| Emails en español | según Privy (verificar) | webhook nuestro | webhook nuestro | según Privy |
| Previews | app aparte de Privy | ramas con personas de prueba | igual que B | app aparte de Privy |
| Borrar a quien no acepta | API de Privy (pendiente R29) | SQL nuestro | SQL nuestro | API de Privy |
| Riesgo mayor | encierro con un proveedor | más trabajo antes de dic. | billeteras apuradas | migrar con datos reales |

## Decisión
**C, con dos condiciones que la acercan a B: activar Neon Auth ahora para el login, y elegir el proveedor de billeteras en noviembre con una prueba de una noche, no en diciembre.**

La razón principal: **el momento barato para cambiar el login es antes de los primeros datos reales**, y el login no es lo difícil de revertir; lo difícil de revertir es **a qué dirección se emite cada Semilla** (un soulbound no se mueve). Por eso conviene que la identidad sea nuestra desde el primer voto, y que la billetera se elija con calma, por separado y probándola.

Concretamente:
1. **La identidad es nuestra.** `personas.id` es un id propio de NetX. El proveedor de login entra en una tabla de cuentas vinculadas (`cuentas`: persona, proveedor, id externo, email verificado, fecha), no en una columna `privy_id`. Así cambiar de proveedor otra vez es agregar filas, no migrar todas las tablas. Esto vale **aunque Gus elija A**.
2. **Las billeteras también son filas nuestras.** Tabla `billeteras`: persona, dirección, red, origen (`embebida` | `propia`), proveedor, verificada en (hora del servidor), y es un libro de solo agregar (una dirección no se edita: se agrega otra y se marca la vieja; ADR-001). Las Semillas se emiten a una dirección de esta tabla, nunca a un id de proveedor.
3. **Quien trae su billetera la vincula, no entra con ella.** Firma un mensaje con un número de un solo uso que verifica el servidor (lo mismo que hace SIWE). El login sigue siendo email o Google: hay una sola forma de saber quién es quién, y no se mezclan identidades.
4. **Previews sin datos reales:** antes de activar Neon Auth, verificar que la rama madre de los previews puede ser una rama `previews` con personas de prueba (ADR-008 B). Si no se puede, **no activar Neon Auth en producción** hasta resolverlo: cada preview copiaría los emails y sesiones reales.
5. **Emails:** en el prototipo interno se acepta el email de Neon (en inglés, con su marca); el webhook con textos propios es la noche 3 y va antes de mostrar la plataforma fuera del equipo.
6. **Privy se queda hasta que el login nuevo esté mergeado** (sin "apagar y prender" el mismo día) y se borra después.

## Consecuencias
- Ganamos: la lista de personas, las sesiones y el consentimiento viven en la misma base (ADR-001, ADR-005). La persona nueva nace en la misma transacción que su primer `acepta`, y borrar a quien no acepta deja de depender de la API de un tercero (cierra el pendiente de R29 sobre Privy).
- Ganamos: el formulario de login es nuestro, en nuestro idioma, con las casillas antes (resuelve "login-propio" sin pasar por el headless de Privy).
- Ganamos: sin costo por usuario de login hasta 60.000 activos por mes (Neon Free, verificado el 15-oct-2026).
- Ganamos: los previews pueden probar el login real con personas de prueba de su rama, sin una segunda app de Privy.
- Aceptamos: 3 noches ahora que no agregan pantallas nuevas, y que `base-neon`, `consentimiento-alta`, `consentimiento-en-la-base` y `fogon-cuadratico-en-la-base` se enmiendan antes de implementarse (conviene que el especificador lo haga **antes** de la noche de `base-neon`).
- Aceptamos: un segundo proveedor para billeteras desde diciembre (y quizás seguir pagándole a Privy por usuario, si es el elegido). La regla de "una sola persona = `personas.id`" tiene que revisarse en cada cambio que toque billeteras.
- Aceptamos: Neon Auth no tiene SIWE ni segundo factor todavía; la firma de la billetera propia la mantenemos nosotros.
- Aceptamos: las billeteras de Privy que existen hoy (modo desarrollo, sin nada emitido) se pierden; el sello "Billetera creada" desaparece hasta diciembre.
- Riesgo: si la prueba de noviembre muestra que ningún proveedor de billeteras acepta el JWT de Neon a un precio razonable, la salida es usar Privy completo para el login también (volver a A), con la tabla `cuentas` haciendo barato el regreso.
- **Revisar:** el 15-nov-2026 con el resultado de la prueba de billeteras; si la rama madre de los previews no se puede elegir; si Neon cambia el precio o los plugins de Auth; y antes de emitir la primera Semilla (ahí la elección de billetera pasa a ser casi irreversible).

## En palabras simples
Hoy la puerta de entrada (el login) la tiene Privy, y con ella la lista de todas las personas. La propuesta es mudar esa lista a nuestra propia base ahora, cuando todavía no hay votos ni Semillas reales: cuesta unas 3 noches y nos deja poner las casillas de consentimiento en nuestro propio formulario, en español. La billetera es otra cosa: es la "cuenta" donde van a quedar las Semillas para siempre, porque no se pueden pasar a otro. Por eso la elegimos aparte, en noviembre, después de probar con calma qué empresa nos crea billeteras para quien no sabe de cripto. Por ejemplo: Martín entra con su email, acepta, vota en el Fogón; en diciembre la plataforma le crea una billetera, y si Ana ya tiene la suya, la conecta firmando un mensaje.

## Fuentes
- Neon, documentación de Managed Better Auth (páginas listadas en "Lo que se verificó"), consultada el 15-oct-2026.
- Better Auth, plugin SIWE (`better-auth.com/docs/plugins/siwe`, existe para Better Auth alojado por uno), consultado el 15-oct-2026.
- Privy: `privy.io/pricing` (consultada el 15-oct-2026, lectura parcial) y tipos de `@privy-io/react-auth` 3.48.1 instalado.
- Código leído el 15-oct-2026: `lib/sesion/` (`verificar.ts`, `servidor.ts`, `personas.ts`, `entorno.ts`), `app/api/sesion/`, `components/sesion/` (`privy-puente.tsx`, `proveedor-sesion.tsx`, `contexto.ts`), `playwright.config.ts`, `e2e/`.
- Specs: `base-neon`, `consentimiento-alta`, `idioma-hifa-avisos`; en el PR #76 (`spec/fogon-cuadratico`): `consentimiento-en-la-base`, `fogon-cuadratico-en-la-base`, ADR-007 y ADR-008.
- `NS_platform/Documentation/Desarrollo/01 - Arquitectura.md` (Auth: "Privy — revisar", costo arriba de 500 usuarios, alternativa Better Auth), `backend/04 - Lo que todavía no estamos viendo.md` (jurisdicción y encargados en EE.UU., punto 5 "una sola identidad por persona" y punto 12 "costos que crecen con el uso") y `Segunda revisión/00 - Pendientes de segunda revisión.md` (R29).
