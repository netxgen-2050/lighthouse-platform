## ADDED Requirements

### Requirement: Base con migraciones
The system SHALL use Postgres through Drizzle with versioned migrations in `drizzle/`; with `DATABASE_URL` it SHALL connect to Neon and run pending migrations at build time; without `DATABASE_URL` outside production it SHALL use an embedded PGlite database with the migrations applied; in production without `DATABASE_URL` it MUST fail explicitly.

#### Scenario: Local sin Neon
- **WHEN** la app corre en local sin `DATABASE_URL`
- **THEN** usa PGlite con las tablas creadas por las migraciones

#### Scenario: Producción sin base
- **WHEN** `VERCEL_ENV` es `production` y falta `DATABASE_URL`
- **THEN** la verificación de sesión responde un error de configuración y lo deja en el log

### Requirement: Identidad propia y cuentas de login
Each person SHALL be identified by their own NetX id in `personas`, with no login-provider id column. Login accounts SHALL live in a `cuentas` table with the person, the provider (`privy` or `neon-auth`), the provider's external id, the email the provider verified when linking and the linking time. The database MUST reject two accounts with the same provider and external id, and two accounts of the same provider for the same person.

#### Scenario: Cuenta repetida
- **WHEN** alguien inserta una segunda fila de `cuentas` con el mismo proveedor y el mismo id externo
- **THEN** la base la rechaza

#### Scenario: Dos cuentas del mismo proveedor
- **WHEN** alguien inserta para una persona que ya tiene una cuenta `privy` otra cuenta `privy` con otro id externo
- **THEN** la base la rechaza

#### Scenario: Dos proveedores
- **WHEN** una persona con una cuenta `privy` recibe una cuenta `neon-auth`
- **THEN** la base la acepta y la persona tiene las dos

#### Scenario: Proveedor desconocido
- **WHEN** alguien inserta una cuenta con proveedor `github`
- **THEN** la base la rechaza

### Requirement: Personas en la base
`/api/sesion` SHALL authorize people from the `personas` table: first by (provider, external id) in `cuentas`; if there is no account, by the provider's verified email in `personas`, linking a new account row for that person. It MUST NOT link a second account of the same provider to a person, MUST NOT link by an unverified email, and MUST NOT create rows in `personas` or `cuentas` for a person who is not in `personas` yet. `LH_PERSONAS` SHALL only seed the table when it is empty.

#### Scenario: Carga inicial
- **WHEN** la tabla `personas` está vacía y `LH_PERSONAS` tiene 9 personas
- **THEN** al primer pedido quedan las 9 en la tabla y después la lista de la variable ya no se usa

#### Scenario: Primer login de una persona del equipo
- **WHEN** una persona cargada por el equipo entra por primera vez con Privy y su email verificado
- **THEN** queda una fila en `cuentas` con proveedor `privy` y su id de Privy, y la sesión trae su rol

#### Scenario: Segundo login
- **WHEN** esa persona vuelve a entrar con la misma cuenta de Privy
- **THEN** se la encuentra por la cuenta y no se agrega ninguna fila

#### Scenario: Otra cuenta del mismo proveedor con el mismo email
- **WHEN** alguien entra con otra cuenta de Privy que trae el email de una persona que ya tiene su cuenta de Privy vinculada
- **THEN** `/api/sesion` responde 403, no se vincula nada y el log no muestra el email

#### Scenario: Persona nueva
- **WHEN** entra con Privy un email que no está en `personas`
- **THEN** la sesión responde con rol `persona` y no queda ninguna fila nueva en `personas` ni en `cuentas`

#### Scenario: Persona sin acceso
- **WHEN** el super admin le quita el acceso a una persona
- **THEN** esa persona recibe 403 en `/api/sesion` en su próximo pedido

### Requirement: Panel de roles editable
`/netx` SHALL let the super admin change role, test profile, administered tribe and access of each person, and add a person by email; the API MUST verify on the server that the caller is a super admin, record every change in `cambios_de_rol`, and never leave the platform without a super admin.

#### Scenario: Cambiar un rol
- **WHEN** el super admin cambia a una persona de `persona` a `admin-tribu` de Valle Solar
- **THEN** la próxima sesión de esa persona tiene el rol nuevo y queda registrado quién lo cambió y cuándo

#### Scenario: No es super admin
- **WHEN** alguien con rol `persona` llama a `PATCH /api/personas`
- **THEN** recibe 403 y no cambia nada

#### Scenario: Último super admin
- **WHEN** el único super admin intenta quitarse el rol
- **THEN** la API lo rechaza con un mensaje claro

### Requirement: Consentimientos
The first migration SHALL create the complete `consentimientos` table: person, type (policy, terms, sensitive data, email updates), event (accept, withdraw), version, path (nullable), language (nullable, null meaning Spanish), server time and informative browser time, with an index by person, type and time. The table MUST be append-only: the database SHALL reject any update or delete on it, and a person row referenced by a consent MUST NOT be deletable.

#### Scenario: Tabla lista
- **WHEN** se aplican las migraciones
- **THEN** existe la tabla `consentimientos` con todas esas columnas y los valores permitidos de tipo, evento, camino e idioma

#### Scenario: Solo agregar
- **WHEN** alguien intenta modificar o borrar una fila de `consentimientos`
- **THEN** la base lo rechaza con un error y la fila queda igual

#### Scenario: Valor fuera de lista
- **WHEN** alguien inserta una fila con tipo `marketing` o idioma `fr`
- **THEN** la base la rechaza

### Requirement: Modo de prueba solo con emails de prueba
The test mode SHALL only accept emails whose domain ends in `.test`; with the test header and any other email, `/api/sesion` MUST respond 403, in every environment where the test mode is active.

#### Scenario: Email de prueba
- **WHEN** con `LH_AUTH_PRUEBA=1` fuera de producción llega la cabecera de prueba con `super@prueba.test`
- **THEN** la sesión es la de esa persona de prueba

#### Scenario: Email real
- **WHEN** con `LH_AUTH_PRUEBA=1` fuera de producción llega la cabecera de prueba con `gus@gmail.com`
- **THEN** `/api/sesion` responde 403 y no hay sesión

### Requirement: Datos de ejemplo para la rama de previews
The repository SHALL include an idempotent SQL script with the test people (all with `.test` emails) for the `previews` parent branch. It MUST NOT update, delete or truncate any row, MUST NOT write consents, and MUST fail without inserting anything if the database already has a person whose email does not end in `.test`.

#### Scenario: Dos veces
- **WHEN** el script se corre dos veces sobre una base recién migrada
- **THEN** quedan las seis personas de prueba, una vez cada una

#### Scenario: Base con personas reales
- **WHEN** el script se corre sobre una base que tiene a `gus@ejemplo.com`
- **THEN** falla con un error y no inserta ninguna persona
