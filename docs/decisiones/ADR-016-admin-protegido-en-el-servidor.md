# ADR-016 · `/admin` se protege en el servidor: la sesión del super admin viaja en una cookie limitada a `/admin` y el servidor responde 403 a cualquier otra persona

- **Estado:** Propuesta
- **Fecha:** 2026-10-26
- **Cambio OpenSpec relacionado:** vista-netx-financiamiento (capacidad `admin-operaciones`)

## Contexto
Gus (26-oct) eligió sacar las operaciones del super admin (pendientes, personas y roles, comunidades) a una página propia, `/admin`, con la ruta entera protegida en el servidor (403 para el resto) además de en la pantalla. Hoy, por ADR-015, las páginas solo se ocultan en el navegador: la sesión viaja en una cabecera que el navegador manda a `/api/*` (token de Privy o el email de prueba), y cuando se pide una página esa cabecera no va, así que el servidor no sabe quién pide. Para dar un 403 de verdad, el servidor de la página tiene que poder leer la sesión.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No proteger la página: `/admin` oculta en el navegador y solo las APIs verifican (como ADR-015) | Cero trabajo nuevo | No es lo que pidió Gus: quien tenga la dirección recibe 200 y el armado de la página; el día que una pestaña lea algo del servidor queda expuesto |
| B · Cookie limitada a `/admin` con el token que el navegador ya tiene, más `forbidden()` de Next en el layout y en cada página | Un 403 real para `/admin` sin cambiar cómo funciona la sesión en el resto de la plataforma; reusa la misma verificación que `/api/sesion` (`resolverSesion` + `personaDeLaSesion`); cuando llegue Neon Auth cambia una sola función | Una cookie más que cuidar; `forbidden()` es experimental en Next 15.5 (`authInterrupts`); si el token venció, el super admin ve un 403 hasta recargar |
| C · Pasar toda la sesión de la plataforma a cookies del servidor ya (cookies HttpOnly de Privy, que piden un dominio propio, o adelantar Neon Auth, ADR-009) | La solución de fondo: todas las páginas podrían protegerse igual | Toca el login de toda la plataforma; es más de una noche y depende de configuración (dominio, Privy) que no está |
| D · Middleware que verifica la sesión en cada pedido a `/admin` | Corta antes de llegar a la página | Necesita la misma cookie que B; además el middleware de hoy es solo de idioma y corre en el borde (sin base de datos); moverlo a Node para esto suma otra pieza |

## Decisión
**B.** Es el paso más chico que da exactamente lo que pidió Gus (403 en el servidor para `/admin`) sin tocar el login del resto. La cookie `lh-sesion-admin` lleva el mismo token que el JavaScript de la página ya tiene, solo para el super admin, solo hacia `/admin` (`path=/admin`), con `SameSite=Strict`, `Secure` y 55 minutos de vida. En modo de prueba (previews y local) se usa la cookie `lh-auth-prueba` que ya existe, con las mismas reglas de ADR-008. El servidor falla cerrado: cualquier cosa que no sea "super admin verificado" es 403.

## Consecuencias
- Ganamos: `/admin` no entrega nada a quien no es super admin, ni siquiera el armado de la página; queda probado con un e2e que pide la dirección sin pasar por la pantalla.
- Ganamos: la verificación es la misma que ya usan `/api/sesion` y `/api/personas` (una sola regla de "es super admin").
- Aceptamos: una cookie nueva con un token. No suma exposición frente a un script malicioso (ese token ya está en el navegador), y como `/admin` solo lee y las escrituras siguen yendo por cabecera a `/api/personas`, no habilita pedidos cruzados que cambien algo.
- Aceptamos: `forbidden()` depende de una opción experimental de Next. Si una actualización la rompe, el e2e del 403 falla.
- Aceptamos: el resto de la plataforma (incluida la Vista NetX) sigue con ADR-015: se oculta en el navegador.
- Revisar cuando: llegue Neon Auth (ADR-009) — entonces se lee su cookie y `lh-sesion-admin` se borra —; cuando otra página necesite protección en el servidor (se reusa `exigirSuperAdmin` o se pasa a C); o cuando la bandeja o las postulaciones pasen a la base (sus APIs tienen que verificar por su cuenta, el 403 de la página no alcanza).

## En palabras simples
Hasta hoy la plataforma "tapaba" las páginas en la pantalla. Para la nueva página de administración ponemos una llave de verdad: cuando el super admin entra, su navegador guarda un pase que solo sirve para la puerta de `/admin`. Si alguien sin ese pase pide la página, el servidor contesta "no tenés acceso" y no manda nada de adentro. Por ejemplo, una persona que copia la dirección `/admin` y la abre ve solo el aviso, aunque sepa mirar el código. El resto de la plataforma sigue como antes hasta que cambiemos el login.

## Fuentes
- `lib/sesion/servidor.ts`, `lib/sesion/verificar.ts`, `components/sesion/proveedor-sesion.tsx` (`COOKIE_PRUEBA`), `app/api/personas/route.ts`, `middleware.ts`, `next.config.ts` (leídos el 2026-10-26).
- Documentación de Next.js 15: `forbidden()` y la opción `experimental.authInterrupts` (consultada el 2026-10-26; el implementador confirma el comportamiento con `pnpm build && pnpm start`).
- ADR-008 (previews sin datos reales), ADR-009 (identidad), ADR-015 (acceso en el navegador, datos en el servidor).
- `openspec/changes/vista-netx-financiamiento/design.md` §3.
