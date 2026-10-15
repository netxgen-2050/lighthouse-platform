# Proposal

## Why

Para que el equipo vote de verdad en el Fogón (`fogon-cuadratico-en-la-base`), el servidor tiene que guardar votos **con la identidad de la persona**. ADR-005 dice que nada se escribe con esa identidad sin un consentimiento `acepta` vigente registrado en la base. `base-neon` crea la tabla `consentimientos`, pero la deja vacía: la iba a llenar `datos-en-la-nube`, que todavía no está escrito y es grande. Este cambio saca de ahí **solo la parte del consentimiento**, que ya está diseñada en `openspec/changes/consentimiento-alta/design.md` §7.1 a §7.5, para que el dogfooding de la gobernanza no espere la mudanza completa.

## What Changes

- **`POST /api/consentimientos`**: registra en el libro `consentimientos` el `acepta` o el `retira` de la política y los términos (dos filas, misma versión y hora del servidor) y el de novedades por email, con el canal y la hora informativa del navegador. Valida la versión vigente y la aceptación previa (no más de 5 minutos, no en el futuro). Es idempotente ante un doble envío.
- **La fila de `personas` de una persona nueva nace en la misma transacción que su primer `acepta`** (ADR-005, §7.3), **junto con su fila de `cuentas`** (proveedor e id externo de la sesión, ADR-009). Las personas cargadas por el equipo ya existen y solo se les vincula la cuenta si todavía no la tienen. Funciona igual con Privy y con Neon Auth: la persona en sesión se resuelve por `cuentas` (`base-neon`), nunca por un id de un proveedor en particular.
- **`GET /api/consentimientos`**: el estado vigente de la persona en sesión (política y términos, novedades) y su constancia (versión, fecha, camino).
- **`exigirConsentimiento(sesion)`**: una función única del servidor que toda ruta que escriba a nombre de una persona tiene que llamar; sin `acepta` vigente responde 403 con `{ consentimiento: false }`.
- **El navegador pasa a usar la API** con sesión: el registro (`registrar…`, `retirar…`, `leer…` y `useConsentimiento`) consulta y escribe en el servidor; el navegador deja de ser la fuente del consentimiento general y de novedades. Si la API falla, la persona sigue anónima y ve "No pudimos guardar tu aceptación. Probá de nuevo." (§7.4).
- **E2E**: la fixtura siembra el consentimiento por la API en el modo de prueba en lugar de `localStorage`.

**Fuera de alcance:** el consentimiento de datos sensibles (KYC), que sigue en el navegador hasta `datos-en-la-nube`; el resto de la mudanza (perfil, membresías, pactos, bitácora, origen); borrar en Privy al usuario que no acepta (R29); anonimizar una cuenta; el idioma del consentimiento (`idioma-legal`); cualquier cambio de textos o de la versión de la política.

## Capabilities

### New Capabilities
- `consentimiento-registro`: registro del consentimiento en el servidor como libro de solo agregar y la regla "sin consentimiento vigente, el servidor no escribe a nombre de la persona".

### Modified Capabilities

## Impact

Orden: `base-neon` → **`consentimiento-en-la-base`** → `fogon-cuadratico-en-la-base` → `fogon-consultas-panel`. No depende de `login-neon-auth` (anda con cualquiera de los dos proveedores). Depende de `base-neon` (tablas `consentimientos`, `personas` y `cuentas`, `personaDeLaSesion`, cliente de base) y de `consentimiento-alta` (paso antes del login, aceptación previa, canales, novedades en el navegador). Archivos: `app/api/consentimientos/route.ts`, `lib/privacidad/servidor.ts` (`exigirConsentimiento`, registrar en una transacción), `lib/privacidad/consentimiento.ts` y `usar-consentimiento.ts` (cliente que llama a la API), `lib/privacidad/novedades.ts`, `components/sesion/proveedor-sesion.tsx` (consumir la aceptación previa contra la API), `e2e/fixtura.ts` y los e2e de privacidad y consentimiento. Sin migraciones nuevas (la forma ya está en la primera de `base-neon`). Datos personales y consentimiento: pide revisión de arquitectura.
