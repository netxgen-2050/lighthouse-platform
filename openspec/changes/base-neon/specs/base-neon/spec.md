## ADDED Requirements

### Requirement: Base con migraciones
The system SHALL use Postgres through Drizzle with versioned migrations in `drizzle/`; with `DATABASE_URL` it SHALL connect to Neon and run pending migrations at build time; without `DATABASE_URL` outside production it SHALL use an embedded PGlite database with the migrations applied; in production without `DATABASE_URL` it MUST fail explicitly.

#### Scenario: Local sin Neon
- **WHEN** la app corre en local sin `DATABASE_URL`
- **THEN** usa PGlite con las tablas creadas por las migraciones

#### Scenario: Producción sin base
- **WHEN** `VERCEL_ENV` es `production` y falta `DATABASE_URL`
- **THEN** la verificación de sesión responde un error de configuración y lo deja en el log

### Requirement: Personas en la base
`/api/sesion` SHALL authorize people from the `personas` table (by Privy id, or by email on first login, saving the Privy id); `LH_PERSONAS` SHALL only seed the table when it is empty.

#### Scenario: Carga inicial
- **WHEN** la tabla `personas` está vacía y `LH_PERSONAS` tiene 9 personas
- **THEN** al primer pedido quedan las 9 en la tabla y después la lista de la variable ya no se usa

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
The database SHALL have a `consentimientos` table (person, type, version, date) ready for `privacidad-consentimiento`.

#### Scenario: Tabla lista
- **WHEN** se aplican las migraciones
- **THEN** existe la tabla `consentimientos` con sus columnas
