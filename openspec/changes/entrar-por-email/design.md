# Design

## Context

- **`consentimiento-alta`** (sin implementar, va antes): el paso con las casillas es la única puerta al login (`entrar()` abre el paso; solo el paso llama `abrirLogin()`), la aceptación previa vive en `sessionStorage` 5 minutos, la pantalla de consentimiento es la red de seguridad cuando hay sesión sin aceptación vigente, y la persona sigue anónima hasta aceptar. Deja `entrar({ email? })` y `abrirLogin(email?)` listos para este cambio (su design §1). Mientras tanto, el paso aparece en todo login: **es lo que este cambio saca**.
- **`consentimiento-en-la-base`** (va antes): el libro `consentimientos` en la base y `estadoConsentimiento(db, personaId)`. Las personas nuevas nacen en `personas` con su primer `acepta` (ADR-005 §7.3); las del equipo (`LH_PERSONAS`) existen sin aceptaciones.
- **`base-neon`** (en `dev`): `personas` con email único en minúsculas, `cuentas`, `db()` con PGlite en local, `modoPruebaActivo`, modo de prueba solo `.test` (ADR-008).
- **Límite de pedidos que ya existe:** `lib/reportes/limite.ts` (`crearLimite({ sal })`, `claveDeIp`, `origenPermitido`), en memoria por instancia (ADR-006).
- **Privy 3.48.1** (instalado): `login(opciones)` acepta `prefill: { type: "email", value }` y `disableSignup: boolean` ("only allow existing users to log in"), verificado en los tipos de `@privy-io/react-auth` el 16-oct-2026. El comportamiento real de `disableSignup` **a verificar** en el preview.
- Pedido de Gus (15-oct-2026): quien ya tiene cuenta no marca casillas en cada login; un email nuevo no puede pedir el código sin aceptar.

## Goals / Non-Goals

**Goals:** casillas solo para emails nuevos; ningún login de un email nuevo sin aceptación; que averiguar si un email tiene cuenta cueste y diga lo mínimo; el mismo flujo en modo de prueba y con Privy mientras conviva.

**Non-Goals:** el código y Google de Neon Auth (y la puerta del servidor en su manejador), CAPTCHA, límite compartido entre instancias, esconder del todo la existencia de la cuenta.

## Decisions

### 1. Qué es "tener cuenta"
- `tieneCuenta(db, email)` en `lib/sesion/entrar.ts`: `true` si hay una fila en `personas` con `lower(email)` igual al email normalizado (recortado y en minúsculas) **y** al menos una fila de `consentimientos` de esa persona con `tipo = 'politica'` y `evento = 'acepta'` (de cualquier versión). Una sola consulta (`exists` con `join`), la misma para los dos casos.
- **Por qué con el libro y no solo con `personas`:** las personas cargadas por el equipo existen sin haber aceptado nunca; si contaran como "con cuenta", entrarían sin ver las casillas y la primera aceptación llegaría recién en la pantalla de la red de seguridad, después de que el proveedor de login ya recibió el email. Con el libro, "tener cuenta" = "ya aceptó alguna vez".
- **Por qué no se pregunta a Neon Auth ni a Privy:** la cuenta es nuestra (ADR-009: `personas.id`). Un usuario del proveedor puede existir sin aceptación (alguien que abandonó, la red de seguridad) y eso no tiene que saltear las casillas. Además, no sumamos un pedido a un tercero con el email de alguien que todavía no aceptó.
- Retiró el consentimiento o aceptó una versión vieja → `true`: entra y ve la pantalla (`consentimiento-alta` §3 y §5), como pide el punto 5 del flujo.
- Función pura aparte para la decisión: `pasoSiguiente({ tieneCuenta } | "error")` → `"entrar" | "consentimiento"`; el error da `"consentimiento"` (§4).

### 2. Enumeración de emails: qué se puede y qué se elige
"Enumerar" es probar emails para saber cuáles tienen cuenta. Con el flujo aprobado, la pantalla que sigue al email **ya lo dice** (casillas o login directo), así que igualar la respuesta y el tiempo de la consulta, como se pensó al principio, no esconde nada: quien prueba ve el campo `paso`. Las opciones reales:

| Opción | A favor | En contra |
|---|---|---|
| A · Mitigar: límite por IP y total, un solo dato en la respuesta, sin caché, sin email en logs, molde ADR-006 | Cumple el flujo de Gus tal cual; una noche; sin servicios nuevos | Alguien con muchas IP puede averiguar, de a poco, si un email tiene cuenta |
| B · Verificar el email primero: mandar el código a todos y mostrar las casillas después del código a los nuevos | La respuesta es igual para todos ("te mandamos un código") | Rompe el punto 3 del flujo: el email nuevo llega al proveedor y el código se pide antes de aceptar; con Neon Auth, verificar el código crea el usuario |
| C · Mandar un email en los dos casos: con cuenta, el código; nuevo, un enlace para seguir con las casillas | Esconde del todo la existencia | Mandar un email a alguien que no aceptó nada; necesita emails propios (webhook `send.otp`, fuera de alcance por ADR-009 punto 5); un paso más para el que se suma |
| D · No hacer nada | Cero trabajo | Cualquiera prueba miles de emails por minuto |

**Se elige A.** Es lo que hacen los formularios de "primero el email" de los servicios grandes, que se apoyan en limitar y detectar abusos (guía de autenticación de OWASP, citada de memoria: esta corrida no tiene internet). Lo que se revela es un dato de bajo peso hoy ("tiene cuenta en un prototipo interno"); antes de mostrar la plataforma fuera del equipo se revisa con Gabriel (R14) si pasar a C, que depende de los emails propios. Queda en ADR-005.

Detalle de A:
<!-- arquitecto: hoy `crearLimite` tiene los máximos fijos (5 por IP, 30 en total, los de reportes) y `sal` es la sal del hash de la IP, no un nombre de instancia: dos `crearLimite` con la misma sal cuentan por separado, y una sal fija hace que el hash de una IPv4 se pueda revertir probando las 4 mil millones. -->
- **Límite:** una instancia propia, separada de la de reportes, **exportada una sola vez** desde `lib/sesion/entrar.ts` (`limiteEntrar = crearLimite({ maxPorClave: 10, ventanaClaveMs: 10 min, maxTotal: 200, ventanaTotalMs: 1 h })`), con la sal aleatoria por defecto (sin `sal` fija). Para eso `crearLimite` suma esos cuatro parámetros opcionales, con los valores de hoy por defecto (la ruta de reportes no cambia). `login-neon-auth` importa **esta misma** instancia para la ruta que manda el código (compartir el límite = compartir el objeto, no la sal). Arriba, 429 con `Retry-After` y `{ ok: false, reintentarEnSegundos }`. Solo se descuenta la consulta que llegó a la base (las rechazadas por formato no cuentan, para no castigar un error de tipeo).
- **Sin límite en modo de prueba** (`modoPruebaActivo`): los previews no tienen datos reales (ADR-008) y los e2e entran muchas veces desde la misma IP.
- **Respuesta:** siempre 200 con `{ paso: "entrar" | "consentimiento" }`, `Cache-Control: no-store`, sin `Set-Cookie` en este cambio (si `login-neon-auth` suma una cookie, la pone en los dos casos y del mismo largo).
- **Tiempo:** no se rellena el tiempo (la respuesta ya dice el paso); sí se usa la misma consulta en los dos casos para que el tiempo no agregue información de más (por ejemplo, "tiene persona pero nunca aceptó").
- **Logs:** nunca el email. Solo "consulta de entrada: límite" o "consulta de entrada: la base no respondió".
- **Molde ADR-006:** `Content-Type: application/json` (si no, 415) y `origenPermitido` (si no, 403), antes de tocar la base. <!-- arquitecto --> Ojo: `origenPermitido` deja pasar los pedidos **sin** `Origin` (un script, curl); el origen frena que otra página use el navegador de la persona, no a quien enumera con un script. Contra eso, lo único que protege es el límite: por eso tiene que contar también esos pedidos. Cuerpo hasta 1 KB; email hasta 254 caracteres con una validación simple (`algo@algo.algo`); si no, 422 (sin consultar).

### 3. Cliente: el email delante del paso
- `components/sesion/paso-alta.tsx` (el `<dialog>` de `consentimiento-alta`) pasa a tener tres estados: **email** → **consentimiento** (solo si `paso` es `consentimiento`) → **login**. El bloque (`bloque-consentimiento.tsx`) no cambia.
- **Estado email:** título "Entrar" o "Crear tu cuenta" (según `modo`), campo con etiqueta visible "Tu email" (`type="email"`, `autocomplete="email"`), botón "Seguir", y una línea fija: "Si ya tenés cuenta, entrás con tu email de siempre. Si es la primera vez, te vamos a pedir que aceptes la política y los términos." (no depende del email: no revela nada). Error de formato con `role="alert"` y `aria-describedby`. Mientras consulta, el botón dice "Buscando…" y queda deshabilitado.
- **Estado consentimiento:** el bloque, con "Aceptar y seguir" ("Aceptar y crear mi cuenta" desde Sumarte), "Usar otro email" (vuelve al estado email con el campo lleno) y "Cancelar". Para un email nuevo no muestra "Qué cambió" (lo ve, en la pantalla, quien tiene cuenta con una versión vieja; excepción de la falla cerrada más abajo); el resto, como `consentimiento-alta` §1.
- **429:** "Probaste muchas veces. Esperá N minutos y volvé a intentar." con `role="alert"`; ni bloque ni login.
- **Login:** `abrirLogin(email, paso)` (privada del proveedor, `consentimiento-alta` §1). Con `paso = "consentimiento"` solo se llama después de `guardarAceptacionPrevia`.
- `entrar({ modo, alAceptar, email })`: con `email` (lo usa "Entrar como…"), el diálogo arranca consultando ese email. `alAceptar` (Sumarte guarda el plan) corre al aceptar en el bloque **o**, con `paso = "entrar"`, justo antes de `abrirLogin`.
<!-- arquitecto: con la falla cerrada (§4) el bloque también lo ve quien ya tiene cuenta; "siempre `alta`" anotaría mal el camino de quien tenía una versión vieja y contradice `consentimiento-alta` (design §2 y su requisito "Re-consentimiento con lo que cambió"). -->
- **Camino de la constancia:** se sigue calculando **después del login**, cuando se conoce el registro (como en `consentimiento-alta` §2): sin registro anterior → `alta` (el caso normal, porque el bloque solo aparece para emails sin cuenta); con un registro de otra versión (solo pasa si el bloque apareció por la falla cerrada de §4) → `nueva-version`; con uno vigente, no se registra otra fila. `al-entrar` queda para la pantalla de la red de seguridad.
- **"Qué cambió" en el diálogo:** no se muestra cuando el servidor respondió `consentimiento` (email nuevo: no hay nada que comparar). Cuando el bloque aparece por la falla cerrada de §4 (no se sabe quién es), muestra la versión vigente y su "Qué cambió" en un `<details>`, como el paso "Entrar" de `consentimiento-alta`.

### 4. Si la consulta falla
- Error de red, 5xx o respuesta con otra forma → estado consentimiento (fail closed: pedir la aceptación a quien ya la tenía no hace daño; la regla de `consentimiento-alta` §2 y §9 evita duplicar la constancia y pisar las novedades). 403 o 415 (no debería pasar desde la propia app) → igual. 429 → el aviso de §3.

### 5. La aceptación vale para ese email
- `guardarAceptacionPrevia` suma `email` (normalizado) al valor de `lh-consentimiento-previo`. `tomarAceptacionPrevia(almacen, ahora, emailDeLaSesion)` la devuelve solo si el email coincide; si no, la borra igual y no devuelve nada → la persona ve la pantalla de consentimiento (red de seguridad). Cubre: cambiar el email en la ventana de Privy, entrar con Google con otra cuenta (`login-neon-auth`), y una aceptación que queda en la pestaña para otra persona.
- El email de la sesión sale de `/api/sesion` (`sesion.email`). Sin email en la sesión (raro), no se toma la aceptación.

### 6. Modo de prueba
- En el diálogo, en modo de prueba (`/api/sesion/prueba` activo), debajo del campo se listan los emails de "Entrar como…" como botones; elegir uno llena el campo y consulta. El panel de Sumarte (`entrar-como.tsx`) llama `entrar({ email })`.
- `abrirLogin(email)` en modo de prueba = `entrarComo(email)` (la cookie de prueba). Ya no hay que ir a `/sumarte#entrar-como` para entrar: el diálogo alcanza; el panel de Sumarte se queda como atajo.
- La consulta en modo de prueba usa la misma base (PGlite en local, la rama `previews` en los previews): la fixtura de `consentimiento-en-la-base` siembra el consentimiento por la API, así que una persona sembrada "tiene cuenta" y una con `consentimiento: "ninguno"` no.

### 7. Privy mientras conviva
- `privy-puente.tsx` pasa al proveedor una función `login(opciones)` (sigue sin estar en el contexto, `consentimiento-alta` §1). `abrirLogin` con Privy llama `login({ prefill: { type: "email", value: email }, disableSignup: paso === "entrar" })`.
- Con `paso = "entrar"`, si la persona cambia el email en la ventana por uno sin usuario de Privy, Privy no lo da de alta (y no crea billetera). Si lo cambia por otro email **con** usuario, entra como esa persona, que ya había aceptado (es su cuenta, y la verifica con el código).
- **A verificar en el preview (tarea 3.3):** que `disableSignup` bloquea de verdad un email sin usuario, con email y con Google, y qué mensaje muestra Privy. **Si no bloquea:** `abrirLogin` con Privy vuelve a pedir el bloque a todos (como `consentimiento-alta`, constante `PRIVY_PIDE_CASILLAS_A_TODOS = true` con su comentario), se anota en el PR y en ADR-005, y la salida es que Production pase a `neon-auth` (Gus, con la regla de ADR-008 y ADR-009 punto 4).
- Caso raro de la convivencia: una persona con cuenta que solo tiene usuario de Neon Auth y entra en un entorno con Privy queda bloqueada por `disableSignup`. Se acepta (el entorno se elige con `NEXT_PUBLIC_LH_LOGIN` y no se vuelve atrás seguido); el mensaje de Privy lo dice.

## Risks / Trade-offs

- [Se puede averiguar si un email tiene cuenta] → inherente al flujo aprobado (§2); límite por IP y total, un solo dato; revisión con Gabriel antes de abrir la plataforma (R14), con la opción C lista.
- [El límite es por instancia: con varias instancias de Vercel, el total real es mayor] → igual que los reportes sin cuenta (ADR-006); un límite compartido en la base queda para cuando haga falta.
- [Varias personas detrás de la misma IP (una oficina, un evento) chocan con el límite] → 10 cada 10 minutos alcanza para un equipo; en el Congreso habría que subirlo o pasar a un límite por IP + email (anotado para revisar antes de febrero).
- [Fail closed: si la base no anda, todos ven las casillas] → molesta un rato pero nunca deja pasar sin consentimiento; la constancia no se duplica.
- [`disableSignup` de Privy no hace lo que dicen los tipos] → verificación en el preview y salida documentada (§7).
- [Escribir el email cada vez] → el navegador lo autocompleta (`autocomplete="email"`); recordarlo queda fuera de alcance.

## Migration Plan

- Rama `agente/entrar-por-email` desde `dev`, con `consentimiento-alta` y `consentimiento-en-la-base` ya en `dev` (si no, frenar y reportar). Sin migraciones.
- Al mergear, quien ya aceptó en la base deja de ver las casillas; las personas del equipo que todavía no aceptaron en la base las ven una vez (camino `alta`).
- Volver atrás: revertir el PR; vuelve el paso en todo login de `consentimiento-alta`.

## Open Questions

- ~~Revisión del agente arquitecto pendiente~~ Hecha el 16-oct-2026: límite configurable y compartido por objeto (§2), camino y "Qué cambió" en la falla cerrada (§3).
<!-- arquitecto: `consentimiento-alta` va antes y se archiva antes; su requisito "Re-consentimiento con lo que cambió" dice que el paso "Entrar", cada vez que se muestra, lleva "Qué cambió". Para un email nuevo este cambio no lo muestra: hace falta un MODIFIED de ese requisito en la spec de este cambio (lo escribe el especificador, no el arquitecto). -->
- **Para el especificador:** si `consentimiento-alta` ya está archivada cuando se aplique este cambio, la spec necesita un `MODIFIED` de su requisito "Re-consentimiento con lo que cambió" ("Qué cambió" solo cuando el diálogo no sabe si el email tiene cuenta) y de "Aceptar antes de cualquier login" (título y alcance).
- ¿Gabriel considera que saber "este email tiene cuenta en NetX" es un dato sensible (por ejemplo, cuando la plataforma sea pública y la membresía a una tribu diga algo de la persona)? Si sí, pasar a la opción C antes de abrir la plataforma (R14).
- ¿El límite de 10 consultas por IP cada 10 minutos le parece bien a Gus para el equipo? Para el Congreso hay que revisarlo.
