## ADDED Requirements

### Requirement: Entrar y salir
The system SHALL let a person log in with Privy (email code, and Google if enabled) from an "Entrar" button in the top bar, and log out from "Salir" in the avatar menu.

#### Scenario: Salir
- **WHEN** una persona con sesión aprieta "Salir"
- **THEN** vuelve a la pantalla de entrada y la barra muestra "Entrar"

### Requirement: Lista de acceso
The server SHALL verify the Privy token and allow only emails listed in `LH_PERSONAS` (case-insensitive); other emails MUST see the no-access message and MUST NOT get data from internal routes.

#### Scenario: Email fuera de la lista
- **WHEN** entra alguien con un email que no está en `LH_PERSONAS`
- **THEN** ve "Tu email todavía no tiene acceso a este prototipo" y `/api/sesion` responde 403

#### Scenario: Sin sesión
- **WHEN** alguien sin sesión pide `/api/sesion`
- **THEN** recibe 401

### Requirement: Roles y perfiles
`/api/sesion` SHALL return the person's role (`superadmin`, `admin-tribu`, `persona`), test profile (`usuario`, `inversor`, `comunidad`) and, for tribe admins, the tribe (`valle`). The UI MUST show NetX only to `superadmin`, and the "Admin de Valle Solar" mark only to tribe admins.

#### Scenario: Persona no ve NetX
- **WHEN** una persona con rol `persona` entra
- **THEN** no ve NetX en la barra y `/netx` le dice que no tiene acceso

#### Scenario: Super admin
- **WHEN** entra el super admin
- **THEN** ve NetX y, en `/netx`, el panel "Personas y roles" con todas las personas de la lista

### Requirement: Datos por persona
Browser data SHALL be namespaced by the Privy user id, so that switching accounts in the same browser shows each person their own data; pre-login data SHALL be offered once for import.

#### Scenario: Cambiar de cuenta
- **WHEN** la persona A adhiere a Valle Solar, sale y entra la persona B en el mismo navegador
- **THEN** B no ve la adhesión de A, y al volver a entrar A la sigue viendo

### Requirement: Perfil y billetera
The profile SHALL start with the person's email (and name if available) and the avatar SHALL use their initials; if Privy created an embedded wallet, the Pasaporte SHALL show a "Billetera creada" stamp with the shortened address.

#### Scenario: Primera vez
- **WHEN** una persona entra por primera vez
- **THEN** su perfil ya tiene su email y el avatar muestra sus iniciales

### Requirement: Modo de prueba solo fuera de producción
With `LH_AUTH_PRUEBA=1` and `VERCEL_ENV` different from `production`, the entry screen SHALL also offer "Entrar como…" with the listed emails, without Privy; in production this option MUST never appear, even if the variable is set.

#### Scenario: Producción
- **WHEN** `VERCEL_ENV` es `production` y `LH_AUTH_PRUEBA=1`
- **THEN** la pantalla de entrada no muestra "Entrar como…"
