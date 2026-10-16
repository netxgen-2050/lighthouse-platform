## ADDED Requirements

### Requirement: Entrar con Neon Auth desde el formulario propio
When the login selected for the environment is `neon-auth`, the platform SHALL offer its own login form with two ways in: a one-time code sent by email, and Google. The form SHALL be shown only from the consent step, after both required checkboxes are checked and accepted; no request with the person's email or an OAuth start MUST reach Neon Auth before that. The form MUST be usable with the keyboard, label every field, and announce errors with `role="alert"`.

#### Scenario: Código por email
- **WHEN** una persona marca las dos casillas en el paso "Entrar", acepta, escribe su email, recibe el código y lo escribe
- **THEN** queda con la sesión de Neon Auth y no ve la pantalla de consentimiento después

#### Scenario: Google
- **WHEN** una persona acepta en el paso y aprieta "Entrar con Google"
- **THEN** vuelve a la plataforma con la sesión de Neon Auth y su aceptación previa se registra como en el camino del código

#### Scenario: Nada antes de las casillas
- **WHEN** una persona abre el paso y lo cierra sin marcar las dos casillas
- **THEN** no salió ningún pedido a `/api/auth/` y no se vio el formulario de login

#### Scenario: Código equivocado
- **WHEN** la persona escribe un código que no es el que recibió
- **THEN** ve "El código no es correcto o venció. Pedí uno nuevo." con `role="alert"` y sigue sin sesión

### Requirement: Persona en sesión por cuentas
The server SHALL translate a Neon Auth session into the login identity of `base-neon` (provider `neon-auth`, the Neon Auth user id, the email and whether it is verified) and resolve the person through `cuentas`: by the account, or the first time by the verified email, linking the account to an existing person. A Neon Auth session with an unverified email MUST get 403. The server MUST NOT create rows in `personas` or `cuentas` for a person who has not accepted yet.

#### Scenario: Persona del equipo que venía de Privy
- **WHEN** una persona con su cuenta de Privy vinculada entra por primera vez con Neon Auth y el mismo email verificado
- **THEN** queda una fila nueva en `cuentas` con proveedor `neon-auth` para la misma persona, y la sesión trae su rol de siempre

#### Scenario: Email sin verificar
- **WHEN** llega una sesión de Neon Auth cuyo usuario no tiene el email verificado
- **THEN** `/api/sesion` responde 403 y no se vincula nada

#### Scenario: Persona nueva
- **WHEN** entra con Neon Auth un email que no está en `personas`
- **THEN** la sesión responde con rol `persona` y no queda ninguna fila nueva en `personas` ni en `cuentas` hasta que acepte

### Requirement: Convivencia con Privy
Until Privy is retired, the server SHALL accept both a Privy token and a Neon Auth session, and the public variable `NEXT_PUBLIC_LH_LOGIN` SHALL choose which login the consent step opens (`privy` when it is missing or invalid). A person with a Privy session SHALL keep working when the environment switches to `neon-auth`, until they log out. Logging out SHALL close the session of the provider in use.

#### Scenario: Entorno con Neon Auth
- **WHEN** `NEXT_PUBLIC_LH_LOGIN` es `neon-auth` y alguien acepta en el paso
- **THEN** ve el formulario propio y no la ventana de Privy

#### Scenario: Entorno sin la variable
- **WHEN** `NEXT_PUBLIC_LH_LOGIN` no está
- **THEN** el paso abre el login de Privy como hasta hoy

#### Scenario: Sesión de Privy abierta
- **WHEN** el entorno pasa a `neon-auth` y una persona tenía la sesión de Privy abierta
- **THEN** sigue entrando con esa sesión, y al salir y volver a entrar ve el formulario propio

#### Scenario: Neon Auth sin configurar
- **WHEN** `NEXT_PUBLIC_LH_LOGIN` es `neon-auth` pero el servidor no tiene `NEON_AUTH_BASE_URL` o `NEON_AUTH_COOKIE_SECRET`
- **THEN** el formulario muestra "El login no está disponible en este momento." con `role="alert"`, la persona sigue sin sesión y el log del servidor lo avisa

### Requirement: Clave estable de los datos del navegador
`/api/sesion` SHALL return as `idPersona` the person's `personas.id` when the person exists, and the browser SHALL copy once the data saved under the key of the person's previous login accounts to the new key, without overwriting data already saved under the new key.

#### Scenario: Cambio de proveedor
- **WHEN** una persona que tenía su perfil guardado en el navegador con la clave de su id de Privy entra con Neon Auth
- **THEN** ve el mismo perfil, y la copia no se repite en la próxima carga

### Requirement: Fallas de Neon Auth
If Neon Auth does not answer or answers with an unexpected shape, the person SHALL stay without a session and see "No pudimos iniciar sesión. Probá de nuevo." with `role="alert"`; the public pages MUST keep working.

#### Scenario: Neon Auth caído
- **WHEN** el pedido del código responde 500 o no responde
- **THEN** la persona ve el error, sigue sin sesión y puede seguir navegando las páginas públicas
