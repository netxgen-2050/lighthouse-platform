# Proposal

## Why

Gus aprobó el 15-oct-2026 (issue #67, ADR-005, ADR-009 opción C) un flujo de entrada que reemplaza "casillas antes de cualquier login, cada vez que entrás": **a Gus no le gusta que quien ya tiene cuenta marque las casillas en cada login**. `consentimiento-alta` pide las casillas en todo login porque, con el consentimiento en el navegador y la ventana de Privy, la plataforma no sabe antes del login quién es la persona. Con `consentimiento-en-la-base`, el servidor ya sabe quién aceptó; falta preguntarle **por el email**, antes del login, para mostrar las casillas solo a quien todavía no tiene cuenta.

## What Changes

- **Un solo formulario de email** (dentro del mismo diálogo del paso de `consentimiento-alta`), desde "Entrar" y desde "Crear tu cuenta" en Sumarte: la persona escribe su email y aprieta "Seguir".
- **El servidor averigua si ese email ya tiene cuenta** (`POST /api/entrar`): hay una persona con ese email y al menos una aceptación de la política registrada en `consentimientos` (de cualquier versión, aunque después la haya retirado). Responde solo qué paso sigue: `entrar` o `consentimiento`. No consulta a Neon Auth ni a Privy: la cuenta es nuestra (ADR-009).
- **Email nuevo**: ve el bloque de consentimiento (resumen en capas, dos casillas obligatorias sin marcar, el opcional de novedades) y no puede seguir sin marcar las obligatorias. Recién entonces se abre el login (y, con Neon Auth, se pide el código; lo suma `login-neon-auth`). La aceptación queda atada a ese email: si el login termina con otro email, no vale y aparece la pantalla de consentimiento.
- **Email con cuenta**: sigue directo al login, **sin casillas**.
- **Cuenta con una versión vieja de la política o con el consentimiento retirado**: entra y, antes de cualquier otra cosa, ve la pantalla de consentimiento con "Qué cambió" (la red de seguridad de `consentimiento-alta`, sin cambios).
- **Mitigación de la enumeración de emails** (ver design §2): con este flujo, la diferencia "casillas sí / casillas no" ya dice si un email tiene cuenta, así que no se puede esconder del todo sin romper el punto 3 del flujo. Se elige **hacer caro y poco útil averiguarlo**: límite de pedidos por IP (y uno total por instancia), la respuesta dice un solo dato (nada de nombre, rol, versión ni fecha), sin caché, sin el email en los logs, molde de ADR-006 (JSON y origen propio).
- **Si la consulta falla** (la base no responde, error de red): se muestran las casillas (nunca se deja pasar sin consentimiento por un error). Si es por el límite de pedidos, un aviso con el tiempo de espera.
- **Modo de prueba** (`LH_AUTH_PRUEBA`, emails `.test`): el mismo flujo. "Entrar como…" elige el email (en el diálogo y en el panel de Sumarte) y pasa por la misma consulta. En modo de prueba el límite de pedidos no corre (los previews no tienen datos reales, ADR-008; los e2e entran muchas veces desde la misma IP).
- **Privy, mientras conviva** (`NEXT_PUBLIC_LH_LOGIN` en `privy` o sin cargar): el email se escribe en nuestro formulario y la ventana de Privy se abre con ese email ya puesto (`prefill`); para un email con cuenta, además, con **altas bloqueadas** (`disableSignup`), así un email nuevo escrito en la ventana de Privy no crea un usuario sin haber marcado las casillas. Si en el preview se ve que `disableSignup` no bloquea, Privy vuelve a pedir las casillas a todos (como `consentimiento-alta`), queda anotado en el PR y la salida es pasar Production a `neon-auth` (ADR-009, con la regla de ADR-008).
- **ADR-005 actualizado** (sigue Propuesta): se quita el "aceptamos que quien ya tiene cuenta marque las casillas en cada login" y se anota esta decisión con sus opciones contra la enumeración.

### Fuera de alcance

- **El paso del código y Google con Neon Auth**, y la **puerta del servidor** que impide pedir el código para un email nuevo sin aceptación: los suma `login-neon-auth` sobre este formulario.
- **Esconder del todo si un email tiene cuenta** (mandar un email en los dos casos, o verificar el email antes de las casillas): ver design §2, opciones B y C. Se revisa antes de mostrar la plataforma fuera del equipo (R14).
- **CAPTCHA o detección de bots** (Cloudflare Turnstile u otro): integración externa nueva; queda como opción si el límite por IP no alcanza.
- **Un límite de pedidos compartido entre instancias** (en la base o en un servicio aparte): el de este cambio es por instancia, como el de los reportes sin cuenta (ADR-006).
- Cambiar textos de la política o subir su versión: la fila "el email que escribís para entrar" ya la informa `consentimiento-alta` (§5), sin subida aparte.
- Borrar usuarios del proveedor de login que quedaron sin aceptación (R29).
- Recordar el email en el navegador para no escribirlo cada vez.

## Capabilities

### New Capabilities
- `entrar-por-email`: entrada por un único formulario de email en el que el servidor decide, por el email, si la persona tiene que aceptar la política antes del login (email nuevo) o entra directo (email con cuenta), con mitigaciones contra la enumeración de emails.

### Modified Capabilities
- (ninguna en `openspec/specs/`: `consentimiento-alta` todavía no está archivada. Su spec ya dice que el paso puede no mostrarse cuando el servidor sabe que el email tiene cuenta.)

## Impact

- **Orden:** `consentimiento-alta` → `consentimiento-en-la-base` → **`entrar-por-email`** → `login-neon-auth`. Si `consentimiento-en-la-base` no está en `dev`, frenar y reportar (sin el libro en la base no hay a quién preguntarle).
- Código: `app/api/entrar/route.ts` (nuevo), `lib/sesion/entrar.ts` (nuevo: decisión pura y consulta), `lib/reportes/limite.ts` (se reutiliza `crearLimite` con sal propia), `components/sesion/paso-alta.tsx` (paso del email delante del bloque), `components/sesion/proveedor-sesion.tsx` (`entrar({ email })`, `abrirLogin(email, paso)`, Privy con `prefill` y `disableSignup`), `components/sesion/privy-puente.tsx` (exponer `login` con opciones, solo al proveedor), `components/sesion/entrar-como.tsx`, `lib/privacidad/consentimiento.ts` (email en la aceptación previa), `e2e/` (ayuda `aceptarPaso`, `e2e/entrar-por-email.spec.ts`).
- **Toca datos personales (el email antes del login), permisos y una integración externa (opciones de login de Privy): pide revisión del agente arquitecto.** Sin tablas nuevas ni migraciones.
- Afecta textos de `idioma-legal` e `idioma-portada-sumarte` (el paso del email también se traduce o se envuelve en `lang="es"`); ya están anotados en esos cambios.
