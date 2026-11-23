# Proposal

## Why

Para que el equipo pruebe el POC con sus propias cuentas, sin cuenta de Vercel y con distintos roles, hace falta un login. Decisiones de Gus del 13-oct-2026: **Privy** (app "LightHouse NetXGen", **modo desarrollo**, sin costo), **sin base de datos todavía** (Neon llega después), **una sola tribu de prueba: Valle Solar**, Gus como super admin. Producción de **Vercel** se abre (sin el login de Vercel) y solo entra quien esté en la lista de emails.

## What Changes

- **Login con Privy** (`@privy-io/react-auth`): email con código y, si está habilitado en Privy, Google. Botón **"Entrar"** en la barra superior cuando no hay sesión; **"Salir"** habilitado en el menú del avatar. El `NEXT_PUBLIC_PRIVY_APP_ID` ya está en Vercel.
- **Lista de acceso y roles** en la variable de entorno **`LH_PERSONAS`** (solo en el servidor, nunca en el repo), con una persona por entrada: `email=rol:perfil`, separadas por `;`.
  - Roles: `superadmin`, `admin-tribu` (admin de Valle Solar) y `persona`.
  - Perfil de prueba (no da permisos; queda para futuras specs y el funnel): `usuario`, `inversor`, `comunidad`.
  - Los emails se comparan en minúsculas.
- **Verificación en el servidor**: una ruta `GET /api/sesion` verifica el token de Privy con `@privy-io/server-auth` y `PRIVY_APP_SECRET`, busca el email en `LH_PERSONAS` y devuelve `{ email, rol, perfil, tribuAdmin }` o 403 si no está en la lista.
- **Puerta de entrada**: sin sesión, la app muestra una pantalla de bienvenida con "Entrar" (la portada y una explicación corta pueden verse). Con sesión de un email que no está en la lista: "Tu email todavía no tiene acceso a este prototipo. Pedíselo a Gus." Con sesión válida: la app normal. Ninguna ruta interna (`/api/...`) devuelve datos sin una sesión válida.
- **Datos separados por persona**: todas las claves del navegador (`lib/demo/claves.ts`) se guardan con un prefijo del id de Privy de la persona, para que se pueda cambiar de usuario en el mismo navegador y cada uno vea lo suyo. Los datos que había antes del login (sin prefijo) se ofrecen una vez para importarlos a la cuenta que entra primero.
- **Perfil** precargado con el email (y el nombre si Privy lo trae); el avatar usa sus iniciales.
- **Roles en la interfaz**:
  - **NetX** (barra superior y `/netx`) solo para `superadmin`; para el resto, `/netx` responde "no tenés acceso".
  - Los `admin-tribu` ven la marca "Admin de Valle Solar" en `/tribus/valle` y en su menú.
  - En `/netx`, un **panel "Personas y roles"** de solo lectura con email, rol y perfil de cada persona de la lista, y la nota "Editar roles llega con la base de datos (Neon)".
- **Billetera**: si la persona tiene una billetera embebida de Privy, el Pasaporte muestra el sello **"Billetera creada"** con la dirección abreviada (nada se escribe en la blockchain).
- **Modo de prueba para tests y previews**: con `LH_AUTH_PRUEBA=1` (solo en Preview y Development, **nunca** en Production; el código lo ignora si `VERCEL_ENV` es `production`), la pantalla de entrada ofrece además "Entrar como…" con los emails de la lista, sin Privy. Es lo que usan los e2e y el tester sobre los previews.

**Fuera de alcance:** base de datos, aprobaciones reales entre personas, edición de roles, Privy en modo producción, escribir en la blockchain.

## Capabilities

### New Capabilities
- `login-privy`: entrar con Privy, lista de acceso, roles y perfiles de prueba, datos por persona.

### Modified Capabilities

## Impact

Dependencias nuevas: `@privy-io/react-auth`, `@privy-io/server-auth`. Archivos: `app/providers.tsx` (o similar), `components/barra-superior.tsx`, `app/api/sesion/route.ts`, `lib/sesion/` (lectura de `LH_PERSONAS`, verificación, hook de sesión), `lib/demo/claves.ts` y todos los lectores y escritores del navegador (prefijo por persona), `app/netx/`, `app/tribus/[id]/`, `app/pasaporte/`, `app/perfil/`, e2e (login de prueba). Variables de entorno: `NEXT_PUBLIC_PRIVY_APP_ID` y `PRIVY_APP_SECRET` (ya cargadas), `LH_PERSONAS` y `LH_AUTH_PRUEBA` (las carga Gus).
