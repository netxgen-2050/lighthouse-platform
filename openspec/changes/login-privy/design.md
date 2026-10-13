# Design

## Context

Next.js 15 en Vercel, sin base de datos. netxgen-platform ya usa Privy (`@privy-io/react-auth` en el cliente y `@privy-io/server-auth` para verificar el token en el servidor, ver su `lib/auth.ts`): seguir ese patrón.

## Decisions

- **Formato de `LH_PERSONAS`:** `email=rol:perfil;email=rol:perfil` (por ejemplo `ana@x.com=admin-tribu:usuario`). `lib/sesion/personas.ts` lo parsea con tests (espacios, mayúsculas, entradas mal formadas se ignoran y se avisan en el log del servidor). La tribu de `admin-tribu` es siempre `valle` en el POC.
- **Verificación:** el cliente manda el access token de Privy en `Authorization: Bearer` a `/api/sesion`; el servidor lo verifica (`PrivyClient.verifyAuthToken`), obtiene el email del usuario y lo busca. La respuesta se cachea en memoria del cliente por sesión.
- **Puerta:** un componente cliente envuelve el contenido del layout. Como el POC no tiene datos sensibles en el HTML del servidor (todo lo personal vive en el navegador), alcanza con la puerta en el cliente más la verificación de las rutas `/api`. Anotarlo en el PR.
- **Prefijo por persona:** `lib/demo/claves.ts` pasa a exponer `clave(nombre)` que antepone `u:<privyId>:`. Todos los accesos a `localStorage` usan esa función. Migración: si hay claves sin prefijo y la persona no tiene datos, ofrecer importarlas una vez.
- **Modo de prueba:** `/api/sesion` acepta, solo si `LH_AUTH_PRUEBA=1` y `VERCEL_ENV !== "production"`, un header `x-lh-prueba: <email>`; el cliente lo usa cuando se eligió "Entrar como…". Los e2e lo usan siempre.
- **Privy en modo desarrollo:** los dominios permitidos los configura Gus en el panel de Privy (producción de Vercel y `localhost`). Si los previews no están permitidos, en los previews se usa el modo de prueba.

## Risks / Trade-offs

- [La puerta en el cliente no protege el HTML del servidor] → el HTML no tiene datos personales; con Neon, la protección pasa al servidor (middleware).
- [`LH_PERSONAS` editable solo en Vercel] → cambiar roles requiere editar la variable y redeploy, hasta que llegue Neon.
